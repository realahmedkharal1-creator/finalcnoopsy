#!/usr/bin/env python3
"""tech-shorts-editor: raw talking-head video -> edited 9:16 short.

Stages (each can be run alone, or `all` runs them in order):
  cut         remove dead air                      -> work/cut.mp4
  transcribe  word-level timestamps (whisper)      -> work/words.json
  plan        write a baseline edit plan           -> work/plan.json   (edit this!)
  render      apply plan: zooms, b-roll, captions, labels, SFX, BGM -> final.mp4

Usage:
  python edit.py all raw_video.mp4 --preset jay
  python edit.py render raw_video.mp4            # after hand/AI-editing work/plan.json

Needs: ffmpeg (with libass) on PATH, Python 3.9+, `pip install faster-whisper numpy`.
All style numbers live in ../presets/<name>.json, not in this file.
"""
import argparse, json, math, re, subprocess, sys, wave
from pathlib import Path

SKILL = Path(__file__).resolve().parent.parent
W, H, FPS = 1080, 1920, 30


def run(cmd, capture=False):
    cmd = [str(c) for c in cmd]
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if r.returncode != 0:
        sys.exit("ffmpeg failed:\n" + " ".join(cmd)[:2000] + "\n" + r.stderr[-3000:])
    return r.stderr if capture else None


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(path)], capture_output=True, text=True).stdout
    return float(out.strip())


# ---------------------------------------------------------------- 1. cut
def cut(raw, work, P):
    c = P["cut"]
    log = run(["ffmpeg", "-hide_banner", "-nostats", "-i", raw, "-vn", "-af",
               f"silencedetect=noise={c['silence_db']}dB:d={c['min_silence_s']}", "-f", "null", "-"], True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    total = duration(raw)
    if len(ends) < len(starts):
        ends.append(total)
    keep, t = [], 0.0
    for s, e in zip(starts, ends):          # keep what lies between silences, plus padding
        a, b = max(0.0, t - c["pad_s"]), min(total, s + c["pad_s"])
        if b - a >= c["min_keep_s"]:
            keep.append((a, b))
        t = e
    if total - t >= c["min_keep_s"]:
        keep.append((max(0.0, t - c["pad_s"]), total))
    if not keep:
        keep = [(0.0, total)]
    merged = [list(keep[0])]
    for a, b in keep[1:]:                   # padding can make neighbours touch
        if a <= merged[-1][1]:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    sel = "+".join(f"between(t,{a:.3f},{b:.3f})" for a, b in merged)
    vf = (f"select='{sel}',setpts=N/{FPS}/TB,scale={W}:{H}:force_original_aspect_ratio=increase,"
          f"crop={W}:{H},setsar=1")
    af = f"aselect='{sel}',asetpts=N/SR/TB"
    run(["ffmpeg", "-y", "-hide_banner", "-i", raw, "-r", FPS, "-vf", vf, "-af", af,
         "-c:v", "libx264", "-crf", "16", "-preset", "veryfast", "-c:a", "aac", "-b:a", "192k",
         work / "cut.mp4"])
    kept = sum(b - a for a, b in merged)
    (work / "cuts.json").write_text(json.dumps(merged))
    print(f"[cut] {total:.1f}s -> {kept:.1f}s ({len(merged)} segments, {total - kept:.1f}s dead air removed)")


# ---------------------------------------------------------------- 2. transcribe
def transcribe(work, model, lang):
    import numpy as np
    from faster_whisper import WhisperModel
    wav = work / "voice16k.wav"
    run(["ffmpeg", "-y", "-hide_banner", "-i", work / "cut.mp4", "-ac", "1", "-ar", "16000", wav])
    w = wave.open(str(wav))
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    segs, info = WhisperModel(model, device="cpu", compute_type="int8").transcribe(
        audio, word_timestamps=True, language=lang)
    words = [{"w": x.word.strip(), "s": round(x.start, 2), "e": round(x.end, 2)}
             for s in segs for x in s.words if x.word.strip()]
    (work / "words.json").write_text(json.dumps({"lang": info.language, "words": words},
                                                ensure_ascii=False, indent=0))
    print(f"[transcribe] {len(words)} words, language={info.language}")


# ---------------------------------------------------------------- 3. plan (baseline; meant to be refined)
STOP = set("""a an the and or but if so of in on at to for with from by is are was were be been it its this that
these those i you he she we they my your his her our their me him them not no yes as than then there here what which
who how why when also just very really can will would could should do does did have has had der die das und oder aber
ist sind war ein eine einen dem den des zu im in auf mit von für nicht auch nur noch schon ich du er sie wir ihr es
ki ka ke hai hain tha thi the aur ya par se ko me mein main bhi to toh hi yeh ye woh wo kya nahi ek is us jo""".split())
SPEC = re.compile(r"^\d[\d.,]*\s?(mah|mp|hz|w|gb|tb|nits?|nm|k|x|%|inch|zoll|mm|g|fps|€|\$|₹)?$", re.I)


def sentences(words, gap=0.45, max_s=3.5):
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(i)
        nxt = words[i + 1]["s"] if i + 1 < len(words) else None
        too_long = w["e"] - words[cur[0]]["s"] > max_s      # whisper often omits punctuation
        if w["w"][-1:] in ".!?।" or nxt is None or nxt - w["e"] > gap or too_long:
            out.append(cur)
            cur = []
    return out


def score(tok):
    t = re.sub(r"[^\w€$₹%.,]", "", tok)
    if not t or t.lower() in STOP:
        return 0
    return (3 if SPEC.match(t) else 0) + min(len(t), 10) / 3 + (1 if t[:1].isupper() else 0)


def clean(tok):
    return re.sub(r"^[^\w€$₹]+|[^\w€$₹%?!]+$", "", tok).upper()


def plan(work, P):
    data = json.loads((work / "words.json").read_text())
    words, total = data["words"], duration(work / "cut.mp4")
    sents = sentences(words)
    pl = {"preset": P["name"], "duration": round(total, 2), "title": None, "captions": [], "labels": [],
          "zooms": [], "broll": [], "sfx": [], "cta": [], "bgm": None}
    hook_end = P["hook"]["title_end_s"]

    # hook title: biggest word of the first sentence + the rest as a subline
    if sents and P["hook"]["title"]:
        idx = sents[0]
        best = max(idx, key=lambda i: score(words[i]["w"]))
        rest = " ".join(clean(words[i]["w"]) for i in idx if i != best)[:P["hook"]["sub_max_chars"]]
        pl["title"] = {"start": 0.15, "end": hook_end, "big": clean(words[best]["w"]), "small": rest}
    pl["zooms"].append({"start": 0.0, "end": P["hook"]["zoom_in_s"], "from": P["hook"]["zoom_from"],
                        "to": 1.0, "ease": "out"})
    pl["sfx"].append({"t": 0.0, "name": "whoosh"})

    cap, zi = P["captions"], 0
    for idx in sents:
        s0, s1 = words[idx[0]]["s"], words[idx[-1]]["e"]
        if s1 <= hook_end:
            continue
        # emphasis words -> single-word captions (burst of <= max_per_sentence)
        ranked = sorted((i for i in idx if score(words[i]["w"]) >= cap["min_score"] and words[i]["s"] >= hook_end),
                        key=lambda i: -score(words[i]["w"]))[:cap["max_per_sentence"]]
        ranked.sort()
        if cap["mode"] == "hook_only":
            ranked = []
        for n, i in enumerate(ranked):
            st = words[i]["s"]
            en = words[ranked[n + 1]]["s"] if n + 1 < len(ranked) else st + cap["hold_s"]
            en = min(max(en, st + cap["min_show_s"]), st + cap["max_show_s"], total)
            if pl["captions"] and st < pl["captions"][-1]["end"]:
                pl["captions"][-1]["end"] = st
            pl["captions"].append({"start": st, "end": round(en, 2), "text": clean(words[i]["w"])})
        if ranked:
            pl["sfx"].append({"t": words[ranked[0]]["s"], "name": "pop"})
        # spec keywords -> top labels (number followed by / glued to a unit)
        for i in idx:
            tok = clean(words[i]["w"])
            nxt = clean(words[i + 1]["w"]) if i + 1 < len(words) else ""
            if SPEC.match(tok) and re.search(r"\d", tok) and (re.search(r"[A-Z€$₹%]", tok) or SPEC.match("1" + nxt)):
                text = tok if re.search(r"[A-Z€$₹%]", tok) else f"{tok} {nxt}"
                st = words[i]["s"]
                if not pl["labels"] or st >= pl["labels"][-1]["end"]:
                    pl["labels"].append({"start": st, "end": round(min(st + P["labels"]["hold_s"], total), 2),
                                         "text": text, "sub": ""})
                    pl["sfx"].append({"t": st, "name": "click"})
        # zoom matrix: emphasis -> punch, otherwise alternate creep / static
        if s0 < P["hook"]["zoom_in_s"] or s1 - s0 < 0.6:
            continue
        z = P["zoom"]
        if ranked:
            p0 = max(s0, words[ranked[0]]["s"] - 0.05)
            pl["zooms"].append({"start": round(p0, 2), "end": round(s1, 2), "from": z["punch"], "to": z["punch"],
                                "ease": "linear"})
        elif zi % 2 == 0:
            pl["zooms"].append({"start": round(s0, 2), "end": round(s1, 2), "from": 1.0, "to": z["creep"],
                                "ease": "linear"})
        zi += 1

    if P["hook"].get("word_pills"):       # Gyan-style: every hook word as a pill, two per screen
        hw = [w for w in words if w["s"] < hook_end]
        for k in range(0, len(hw), 2):
            pair = hw[k:k + 2]
            en = hw[k + 2]["s"] if k + 2 < len(hw) else hook_end
            pl["captions"].append({"start": pair[0]["s"], "end": en, "text": "  ".join(clean(w["w"]) for w in pair),
                                   "pill": True})
        pl["captions"].sort(key=lambda c: c["start"])

    c = P["cta"]
    t0 = max(0.0, total - c["lead_s"])
    step = c["lead_s"] / max(1, len(c["pills"]))
    for n, p in enumerate(c["pills"]):
        pl["cta"].append({"start": round(t0 + n * step, 2), "end": round(t0 + (n + 1) * step, 2), **p})
    pl["sfx"].append({"t": round(t0, 2), "name": "ding"})
    (work / "plan.json").write_text(json.dumps(pl, ensure_ascii=False, indent=1))
    print(f"[plan] {len(pl['captions'])} captions, {len(pl['labels'])} labels, {len(pl['zooms'])} zooms, "
          f"{len(pl['sfx'])} sfx -> {work / 'plan.json'}  (add b-roll / fix wording there, then run render)")


# ---------------------------------------------------------------- 4. render
def ts(t):
    t = max(0.0, t)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def bgr(hexcol, alpha=0):
    h = hexcol.lstrip("#")
    return f"&H{alpha:02X}{h[4:6]}{h[2:4]}{h[0:2]}&"


def col(hexcol):
    h = hexcol.lstrip("#")
    return f"&H{h[4:6]}{h[2:4]}{h[0:2]}&"


def rrect(w, h, r):
    r = min(r, h / 2, w / 2)
    k = r * 0.45
    return (f"m {r:.0f} 0 l {w - r:.0f} 0 b {w - k:.0f} 0 {w:.0f} {k:.0f} {w:.0f} {r:.0f} l {w:.0f} {h - r:.0f} "
            f"b {w:.0f} {h - k:.0f} {w - k:.0f} {h:.0f} {w - r:.0f} {h:.0f} l {r:.0f} {h:.0f} "
            f"b {k:.0f} {h:.0f} 0 {h - k:.0f} 0 {h - r:.0f} l 0 {r:.0f} b 0 {k:.0f} {k:.0f} 0 {r:.0f} 0")


def text_w(text, size, factor):
    return len(text) * size * factor


def fit(text, size, factor, max_w):
    return int(min(size, max_w / max(1.0, len(text) * factor)))


def pill(ev, start, end, text, st, y, sub=""):
    """Rounded pill with text; wipes in left->right (typewriter feel) and fades out."""
    size = fit(text, st["size"], st["char_w"], W * 0.86 - 2 * st["pad_x"])
    lines = [(text, size, st["text"])] + ([(sub, int(size * 0.72), st.get("sub_text", st["text"]))] if sub else [])
    bw = max(text_w(t, s, st["char_w"]) for t, s, _ in lines) + 2 * st["pad_x"]
    bh = sum(s * 1.0 for _, s, _ in lines) + 2 * st["pad_y"]
    x0, y0 = (W - bw) / 2, y - bh / 2
    wipe = (f"\\clip({x0:.0f},{y0 - 20:.0f},{x0:.0f},{y0 + bh + 20:.0f})"
            f"\\t(0,{st['wipe_ms']},\\clip({x0:.0f},{y0 - 20:.0f},{x0 + bw:.0f},{y0 + bh + 20:.0f}))\\fad(0,120)")
    ev.append(f"Dialogue: 2,{ts(start)},{ts(end)},Base,,0,0,0,,{{\\an7\\pos({x0:.0f},{y0:.0f})\\bord0\\shad0"
              f"\\1c{col(st['fill'])}\\1a&H{st['fill_alpha']:02X}&{wipe}\\p1}}{rrect(bw, bh, st['radius'])}{{\\p0}}")
    cy = y0 + st["pad_y"]
    for t, s, c in lines:
        ev.append(f"Dialogue: 3,{ts(start)},{ts(end)},Base,,0,0,0,,{{\\an8\\pos({W / 2:.0f},{cy:.0f})\\fn{st['font']}"
                  f"\\fs{s}\\bord0\\shad0\\1c{col(c)}{wipe}}}{t}")
        cy += s * 1.0


def big_word(ev, start, end, text, st, y, size=None):
    """White display word: soft dark shadow layer + glow flash + scale pop."""
    size = fit(text, size or st["size"], st["char_w"], W * st["max_width"])
    pop = f"\\fscx{st['pop_from']}\\fscy{st['pop_from']}\\t(0,{st['pop_ms']},\\fscx100\\fscy100)"
    base = f"\\an5\\pos({W / 2:.0f},{y:.0f})\\fn{st['font']}\\fs{size}\\fsp{st['spacing']}{pop}"
    ev.append(f"Dialogue: 4,{ts(start)},{ts(end)},Base,,0,0,0,,{{{base}\\bord{st['shadow_spread']}\\blur{st['shadow_blur']}"
              f"\\3c{col(st['shadow'])}\\1c{col(st['shadow'])}\\1a&H{st['shadow_alpha']:02X}&\\3a&H{st['shadow_alpha']:02X}&\\shad0}}{text}")
    ev.append(f"Dialogue: 5,{ts(start)},{ts(start + st['glow_ms'] / 1000)},Base,,0,0,0,,{{{base}\\bord10\\blur18"
              f"\\3c{col(st['fill'])}\\1c{col(st['fill'])}\\shad0\\fad(0,{st['glow_ms']})}}{text}")
    ev.append(f"Dialogue: 6,{ts(start)},{ts(end)},Base,,0,0,0,,{{{base}\\bord{st['stroke']}\\3c{col(st['stroke_color'])}"
              f"\\1c{col(st['fill'])}\\shad0}}{text}")


def build_ass(pl, P, path):
    ev, cap, lab = [], P["captions"], P["labels"]
    if pl.get("title"):
        t = pl["title"]
        y = H * P["hook"]["title_y"]
        big_word(ev, t["start"], t["end"], t["big"], cap, y, int(cap["size"] * P["hook"]["title_scale"]))
        if t.get("small"):
            big_word(ev, t["start"] + 0.15, t["end"], t["small"], cap, y + cap["size"] * 0.85, int(cap["size"] * 0.5))
    for c in pl["captions"]:
        if c.get("pill"):
            pill(ev, c["start"], c["end"], c["text"], P["hook_pill"], H * P["hook_pill"]["y"])
        else:
            big_word(ev, c["start"], c["end"], c["text"], cap, H * cap["y"])
    for l in pl["labels"]:
        if lab["style"] == "pill":
            pill(ev, l["start"], l["end"], l["text"], lab, H * lab["y"], l.get("sub", ""))
        else:
            big_word(ev, l["start"], l["end"], l["text"], cap, H * lab["y"], lab["size"])
            if l.get("sub"):
                big_word(ev, l["start"] + 0.1, l["end"], l["sub"], cap, H * lab["y"] + lab["size"] * 0.9,
                         int(lab["size"] * 0.5))
    for c in pl["cta"]:
        st = dict(P["cta"]["style"], fill=c["fill"], text=c["text_color"])
        pill(ev, c["start"], c["end"], c["text"], st, H * P["cta"]["y"])
    head = (f"[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H}\nWrapStyle: 2\n"
            "ScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, "
            "SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, "
            "Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
            f"Style: Base,{cap['font']},80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,"
            "0,0,0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
    Path(path).write_text(head + "\n".join(ev) + "\n", encoding="utf-8")


def zoom_expr(zooms):
    terms = []
    for z in zooms:
        a, b = z["start"], max(z["end"], z["start"] + 0.04)
        p = f"(t-{a})/{b - a:.3f}"
        if z.get("ease") == "out":
            p = f"(1-pow(1-{p},3))"
        terms.append(f"between(t,{a},{b})*({z['from'] - 1:.4f}+({z['to'] - z['from']:.4f})*{p})")
    return "1+" + "+".join(terms) if terms else "1"


def make_sfx(d):
    d.mkdir(exist_ok=True)
    recipes = {
        "whoosh": "anoisesrc=d=0.38:c=pink:a=0.9,highpass=f=400,lowpass=f=5000,afade=t=in:d=0.22:curve=qsin,afade=t=out:st=0.24:d=0.14",
        "pop": "sine=f=520:d=0.09,asetrate=44100*1.5,aresample=44100,afade=t=out:st=0.01:d=0.08",
        "click": "anoisesrc=d=0.03:c=white:a=0.8,highpass=f=2500,afade=t=out:d=0.03",
        "ding": "sine=f=1568:d=0.7,afade=t=out:st=0.02:d=0.68:curve=exp",
        "riser": "anoisesrc=d=1.0:c=pink:a=0.8,highpass=f=800,afade=t=in:d=0.95:curve=exp,afade=t=out:st=0.96:d=0.04",
    }
    for name, graph in recipes.items():
        if not (d / f"{name}.wav").exists():      # drop your own .wav here to override
            run(["ffmpeg", "-y", "-hide_banner", "-f", "lavfi", "-i", graph, "-ar", "48000", "-ac", "2", d / f"{name}.wav"])


def render(work, out, P):
    pl = json.loads((work / "plan.json").read_text())
    total = duration(work / "cut.mp4")
    ass = work / "overlay.ass"
    build_ass(pl, P, ass)
    sfx_dir = SKILL / "sfx"
    make_sfx(sfx_dir)
    A = P["audio"]
    inputs, fc = ["-i", work / "cut.mp4"], []
    z = zoom_expr(pl["zooms"])
    fc.append(f"[0:v]scale=w='2*trunc({W // 2}*({z}))':h='2*trunc({H // 2}*({z}))':eval=frame,"
              f"crop={W}:{H}:(iw-{W})/2:(ih-{H})*{P['zoom']['anchor_y']},setsar=1[v0]")
    last, n = "v0", 1
    boxes = {"full": (W, H, 0, 0), "top_half": (W, H // 2, 0, 0), "bottom_half": (W, H // 2, 0, H // 2),
             "left_half": (W // 2, H, 0, 0), "right_half": (W // 2, H, W // 2, 0)}
    for b in pl["broll"]:
        f = Path(b["file"])
        f = f if f.is_absolute() else work.parent / f
        if not f.exists():
            print(f"[render] skipping missing b-roll {f}")
            continue
        d = b["end"] - b["start"]
        still = f.suffix.lower() in (".png", ".jpg", ".jpeg", ".webp")
        inputs += (["-loop", "1", "-t", f"{d:.2f}"] if still else ["-t", f"{d:.2f}"]) + ["-i", f]
        bw, bh, bx, by = boxes[b.get("layout", "full")]
        kb = b.get("zoom_to", P["broll"]["push_to"])      # slow push on every b-roll shot
        fc.append(f"[{n}:v]fps={FPS},scale={bw}:{bh}:force_original_aspect_ratio=increase,crop={bw}:{bh},"
                  f"scale=w='2*trunc({bw // 2}*(1+{kb - 1:.3f}*t/{d:.2f}))':h='2*trunc({bh // 2}*(1+{kb - 1:.3f}*t/{d:.2f}))':eval=frame,"
                  f"crop={bw}:{bh},setsar=1,setpts=PTS-STARTPTS+{b['start']}/TB[b{n}]")
        fc.append(f"[{last}][b{n}]overlay={bx}:{by}:enable='between(t,{b['start']},{b['end']})':eof_action=pass[v{n}]")
        last = f"v{n}"
        n += 1
    fonts = str(SKILL / "fonts").replace("\\", "/").replace(":", "\\:")
    assp = str(ass).replace("\\", "/").replace(":", "\\:")
    fc.append(f"[{last}]ass='{assp}':fontsdir='{fonts}',format=yuv420p[vout]")

    fc.append(f"[0:a]highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80:makeup=2,"
              f"asplit=2[voice][key]")
    mix = ["[voice]"]
    for s in pl["sfx"]:
        f = sfx_dir / f"{s['name']}.wav"
        if not f.exists():
            continue
        inputs += ["-i", f]
        ms = int(max(0, s["t"] + A["sfx_offset_s"]) * 1000)
        fc.append(f"[{n}:a]volume={s.get('db', A['sfx_db'][s['name']])}dB,adelay={ms}:all=1[s{n}]")
        mix.append(f"[s{n}]")
        n += 1
    bgm = pl.get("bgm") or A.get("bgm")
    if bgm and (work.parent / bgm).exists():
        inputs += ["-stream_loop", "-1", "-i", work.parent / bgm]
        fc.append(f"[{n}:a]atrim=0:{total:.2f},volume={A['bgm_db']}dB,afade=t=out:st={total - 1:.2f}:d=1[bg]")
        fc.append(f"[bg][key]sidechaincompress=threshold=0.03:ratio={A['duck_ratio']}:attack=15:release=250[duck]")
        mix.append("[duck]")
    else:
        fc.append("[key]anullsink")
    fc.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,"
              f"loudnorm=I={A['lufs']}:TP={A['true_peak']}:LRA=7[aout]")
    run(["ffmpeg", "-y", "-hide_banner"] + inputs + ["-filter_complex", ";".join(fc), "-map", "[vout]", "-map",
        "[aout]", "-r", FPS, "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a",
        "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", "-t", f"{total:.2f}", out])
    print(f"[render] wrote {out}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stage", choices=["all", "cut", "transcribe", "plan", "render"])
    ap.add_argument("raw")
    ap.add_argument("--preset", default="jay", help="file name in presets/ (jay | gyan)")
    ap.add_argument("--model", default="small", help="whisper model: tiny/base/small/medium/large-v3")
    ap.add_argument("--lang", default=None, help="force language code, e.g. en, hi, de, ur")
    a = ap.parse_args()
    raw = Path(a.raw).resolve()
    work = raw.parent / "work" / raw.stem
    work.mkdir(parents=True, exist_ok=True)
    if a.stage == "render" and (work / "plan.json").exists() and a.preset == "jay":
        a.preset = json.loads((work / "plan.json").read_text()).get("preset", a.preset)
    P = json.loads((SKILL / "presets" / f"{a.preset}.json").read_text())
    out = raw.parent / f"{raw.stem}_edited.mp4"
    if a.stage in ("all", "cut"):
        cut(raw, work, P)
    if a.stage in ("all", "transcribe"):
        transcribe(work, a.model, a.lang)
    if a.stage in ("all", "plan"):
        plan(work, P)
    if a.stage in ("all", "render"):
        render(work, out, P)


if __name__ == "__main__":
    main()
