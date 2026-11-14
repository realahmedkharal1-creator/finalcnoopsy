#!/usr/bin/env python3
"""tech-shorts-editor: raw talking-head video -> edited short (vertical) or long (horizontal) video.

Stages (each can be run alone, or `all` runs them in order):
  cut         remove dead air                      -> work/<name>/cut.mp4
  transcribe  word-level timestamps (whisper)      -> work/<name>/words.json
  plan        write a baseline edit plan           -> work/<name>/plan.json   (meant to be rewritten)
  render      apply plan: zooms, b-roll, motion-graphic cards, SFX, music -> <name>_edited.mp4
  demo        render every card type on a plain background -> cards_demo.mp4 (no video needed)

Usage (Windows: use `py`, macOS/Linux: `python3`):
  py edit.py all "C:\\path\\to\\video.mp4" --preset gyan
  py edit.py render "C:\\path\\to\\video.mp4"        # after editing work/<name>/plan.json
  py edit.py demo

Needs: ffmpeg on PATH, Python 3.9+, `pip install faster-whisper numpy pillow`.
Style numbers live in ../presets/<name>.json; card drawing lives in cards.py.
"""
import argparse, json, re, subprocess, sys, wave
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
SKILL = Path(__file__).resolve().parent.parent
FPS = 30
for stream in (sys.stdout, sys.stderr):            # Windows consoles choke on non-ASCII otherwise
    try:
        stream.reconfigure(errors="replace")
    except Exception:
        pass


def run(cmd, capture=False):
    cmd = [str(c) for c in cmd]
    try:
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, encoding="utf-8", errors="replace")
    except FileNotFoundError:
        sys.exit(f"'{cmd[0]}' was not found. Install ffmpeg (Windows: winget install Gyan.FFmpeg), "
                 "then close and reopen the terminal.")
    if r.returncode != 0:
        sys.exit("ffmpeg failed:\n" + " ".join(cmd)[:1500] + "\n...\n" + r.stderr[-3000:])
    return r.stderr if capture else r.stdout


def ffmpeg_graph(graph, work):
    """Pass the filter graph through a file: avoids command-length limits and shell quoting on Windows."""
    path = work / "filter.txt"
    path.write_text(graph, encoding="utf-8")
    m = re.search(r"ffmpeg version n?(\d+)", run(["ffmpeg", "-version"]))
    return ["-/filter_complex", path] if m and int(m.group(1)) >= 7 else ["-filter_complex_script", path]


def probe(path):
    out = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
               "stream=width,height:stream_side_data=rotation:format=duration", "-of", "json", path])
    j = json.loads(out)
    s = j["streams"][0]
    w, h = s["width"], s["height"]
    rot = next((abs(int(d.get("rotation", 0))) for d in s.get("side_data_list", []) if "rotation" in d), 0)
    if rot in (90, 270):
        w, h = h, w
    return w, h, float(j["format"]["duration"])


def duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())


# ---------------------------------------------------------------- 1. cut
def cut(raw, work, P, fmt):
    c = P["cut"]
    sw, sh, total = probe(raw)
    vertical = fmt == "vertical" or (fmt == "auto" and sh >= sw)
    W, H = (1080, 1920) if vertical else (1920, 1080)
    log = run(["ffmpeg", "-hide_banner", "-nostats", "-i", raw, "-vn", "-af",
               f"silencedetect=noise={c['silence_db']}dB:d={c['min_silence_s']}", "-f", "null", "-"], True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
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
    graph = (f"[0:v]select='{sel}',setpts=N/{FPS}/TB,scale={W}:{H}:force_original_aspect_ratio=increase,"
             f"crop={W}:{H},setsar=1[v];[0:a]aselect='{sel}',asetpts=N/SR/TB[a]")
    run(["ffmpeg", "-y", "-hide_banner", "-i", raw, "-r", FPS] + ffmpeg_graph(graph, work) +
        ["-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-crf", "16", "-preset", "veryfast",
         "-c:a", "aac", "-b:a", "192k", work / "cut.mp4"])
    kept = sum(b - a for a, b in merged)
    (work / "meta.json").write_text(json.dumps({"W": W, "H": H, "segments": merged, "removed_s": round(total - kept, 2)}))
    print(f"[cut] {total:.1f}s -> {kept:.1f}s ({len(merged)} segments, {total - kept:.1f}s dead air removed), "
          f"{W}x{H}")


# ---------------------------------------------------------------- 2. transcribe
def transcribe(work, model, lang):
    try:
        import numpy as np
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("Missing packages. Run:  py -m pip install faster-whisper numpy pillow")
    wav = work / "voice16k.wav"
    run(["ffmpeg", "-y", "-hide_banner", "-i", work / "cut.mp4", "-ac", "1", "-ar", "16000", wav])
    w = wave.open(str(wav))
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    w.close()
    print("[transcribe] loading the speech model (first run downloads it, this can take a few minutes)...")
    segs, info = WhisperModel(model, device="cpu", compute_type="int8").transcribe(
        audio, word_timestamps=True, language=lang)
    words = [{"w": x.word.strip(), "s": round(x.start, 2), "e": round(x.end, 2)}
             for s in segs for x in s.words if x.word.strip()]
    (work / "words.json").write_text(json.dumps({"lang": info.language, "words": words}, ensure_ascii=False,
                                                indent=0), encoding="utf-8")
    print(f"[transcribe] {len(words)} words, language={info.language}")


# ---------------------------------------------------------------- 3. plan (baseline; meant to be refined)
STOP = set("""a an the and or but if so of in on at to for with from by is are was were be been it its this that
these those i you he she we they my your his her our their me him them not no yes as than then there here what which
who how why when also just very really can will would could should do does did have has had der die das und oder aber
ist sind war ein eine einen dem den des zu im in auf mit von für nicht auch nur noch schon ich du er sie wir ihr es
ki ka ke hai hain tha thi the aur ya par se ko me mein main bhi to toh hi yeh ye woh wo kya nahi ek is us jo""".split())
SPEC = re.compile(r"^\d[\d.,]*\s?(mah|mp|hz|w|gb|tb|nits?|nm|k|x|%|inch|zoll|mm|g|fps|€|\$|₹)?$", re.I)
UNIT_NAME = {"MAH": ("mAh", "Battery"), "MP": ("MP", "Camera"), "HZ": ("Hz", "Refresh rate"), "W": ("W", "Charging"),
             "GB": ("GB", "Storage"), "TB": ("TB", "Storage"), "NITS": ("nits", "Brightness"),
             "NIT": ("nits", "Brightness"), "NM": ("nm", "Chip"), "INCH": ('"', "Display"), "FPS": ("fps", "")}


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
    data = json.loads((work / "words.json").read_text(encoding="utf-8"))
    words, total = data["words"], duration(work / "cut.mp4")
    sents = sentences(words)
    pl = {"preset": P["name"], "duration": round(total, 2), "cards": [], "zooms": [], "broll": [], "sfx": [],
          "bgm": None}
    hook_end, cap, lab, z = P["hook"]["end_s"], P["captions"], P["labels"], P["zoom"]
    cards, sfx = pl["cards"], pl["sfx"]
    pl["zooms"].append({"start": 0.0, "end": P["hook"]["zoom_in_s"], "from": P["hook"]["zoom_from"], "to": 1.0,
                        "ease": "out"})
    sfx.append({"t": 0.0, "name": "whoosh"})

    if sents and P["hook"]["style"] == "title":           # big keyword + sub-line
        idx = sents[0]
        best = max(idx, key=lambda i: score(words[i]["w"]))
        rest = " ".join(clean(words[i]["w"]) for i in idx if i != best)[:P["hook"]["sub_max_chars"]]
        cards.append({"type": "display", "start": 0.15, "end": hook_end, "text": clean(words[best]["w"]),
                      "sub": rest, "size": 190, "y": 0.5})
    elif P["hook"]["style"] == "words":                   # every hook word in a pill, two per screen
        hw = [w for w in words if w["s"] < hook_end]
        for k in range(0, len(hw), 2):
            pair = hw[k:k + 2]
            st = pair[0]["s"]
            en = hw[k + 2]["s"] if k + 2 < len(hw) else hook_end
            cards.append({"type": "words", "start": st, "end": round(max(en, st + 0.3), 2),
                          "words": [{"text": clean(w["w"]), "t": round(w["s"] - st, 2)} for w in pair]})

    zi, last_label_end = 0, 0.0
    for idx in sents:
        s0, s1 = words[idx[0]]["s"], words[idx[-1]]["e"]
        if s1 <= hook_end:
            continue
        ranked = []
        if cap["mode"] == "emphasis":                      # single-word captions, a short burst per sentence
            ranked = sorted((i for i in idx if score(words[i]["w"]) >= cap["min_score"] and words[i]["s"] >= hook_end),
                            key=lambda i: -score(words[i]["w"]))[:cap["max_per_sentence"]]
            ranked.sort()
            for n, i in enumerate(ranked):
                st = words[i]["s"]
                en = words[ranked[n + 1]]["s"] if n + 1 < len(ranked) else st + cap["hold_s"]
                en = min(max(en, st + cap["min_show_s"]), st + cap["max_show_s"], total)
                cards.append({"type": "display", "start": st, "end": round(en, 2), "text": clean(words[i]["w"]),
                              "y": cap["y"]})
            if ranked:
                sfx.append({"t": words[ranked[0]]["s"], "name": "pop"})
        for i in idx:                                      # spec numbers -> top label
            tok = clean(words[i]["w"])
            nxt = clean(words[i + 1]["w"]) if i + 1 < len(words) else ""
            m = re.match(r"^(\d[\d.,]*)([A-Z%]+)?$", tok)
            unit = (m.group(2) if m and m.group(2) else nxt) if m else None
            st = words[i]["s"]
            if m and unit in UNIT_NAME and st >= max(hook_end, last_label_end):
                u, name = UNIT_NAME[unit]
                value = f"{m.group(1)}{'' if u == chr(34) else ' '}{u}"
                last_label_end = round(min(st + lab["hold_s"], total), 2)
                if lab["style"] == "pill":
                    cards.append({"type": "pill", "start": st, "end": last_label_end,
                                  "text": f"*{value}* {name}".strip(), "y": lab["y"]})
                else:
                    cards.append({"type": "display", "start": st, "end": last_label_end, "text": value.upper(),
                                  "sub": name.upper(), "size": 120, "y": lab["y"]})
                sfx.append({"t": st, "name": "click"})
        if s0 < P["hook"]["zoom_in_s"] or s1 - s0 < 0.6:   # zoom matrix
            continue
        if ranked:
            pl["zooms"].append({"start": round(max(s0, words[ranked[0]]["s"] - 0.05), 2), "end": round(s1, 2),
                                "from": z["punch"], "to": z["punch"], "ease": "linear"})
        elif zi % 2 == 0:
            pl["zooms"].append({"start": round(s0, 2), "end": round(s1, 2), "from": 1.0, "to": z["creep"],
                                "ease": "linear"})
        zi += 1

    c = P["cta"]
    t0 = round(max(0.0, total - c["lead_s"]), 2)
    if c["style"] == "subscribe":
        cards.append({"type": "subscribe", "start": t0, "end": round(total, 2), **P.get("channel", {})})
    else:
        step = c["lead_s"] / len(c["pills"])
        for n, p in enumerate(c["pills"]):
            cards.append({"type": "pill", "start": round(t0 + n * step, 2), "end": round(t0 + (n + 1) * step, 2),
                          "y": c["y"], **p})
    sfx.append({"t": t0, "name": "ding"})
    def latin(c):                                         # bundled fonts only cover Latin script
        txt = json.dumps([c.get(k) for k in ("text", "sub", "words", "lines")], ensure_ascii=False)
        return not re.search(r"[֐-ࣿऀ-෿぀-鿿]", txt)
    dropped = [c for c in cards if not latin(c)]
    cards[:] = sorted((c for c in cards if latin(c)), key=lambda k: k["start"])
    if dropped:
        print(f"[plan] {len(dropped)} cards left out: the transcript is in a non-Latin script. "
              "Write those captions in Roman letters in plan.json.")
    (work / "plan.json").write_text(json.dumps(pl, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"[plan] baseline: {len(cards)} cards, {len(pl['zooms'])} zooms, {len(sfx)} sfx -> {work / 'plan.json'}")


# ---------------------------------------------------------------- 4. render
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


def resolve(path, base):
    p = Path(path)
    return p if p.is_absolute() else base / p


def render(src, work, out, P, base):
    try:
        import cards as card_lib
    except ImportError:
        sys.exit("Missing package. Run:  py -m pip install pillow")
    pl = json.loads((work / "plan.json").read_text(encoding="utf-8"))
    meta = json.loads((work / "meta.json").read_text())
    W, H = meta["W"], meta["H"]
    total = duration(src)
    sfx_dir = SKILL / "sfx"
    make_sfx(sfx_dir)
    A = P["audio"]
    inputs, fc = ["-i", src], []
    z = zoom_expr(pl.get("zooms", []))
    fc.append(f"[0:v]scale=w='2*trunc({W // 2}*({z}))':h='2*trunc({H // 2}*({z}))':eval=frame,"
              f"crop={W}:{H}:(iw-{W})/2:(ih-{H})*{P['zoom']['anchor_y']},setsar=1[v0]")
    last, n = "v0", 1
    boxes = {"full": (W, H, 0, 0), "top_half": (W, H // 2, 0, 0), "bottom_half": (W, H // 2, 0, H // 2),
             "left_half": (W // 2, H, 0, 0), "right_half": (W // 2, H, W // 2, 0)}
    for b in pl.get("broll", []):
        f = resolve(b["file"], base)
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
    card_list = sorted(pl.get("cards", []), key=lambda c: (c["type"] != "sheet", c["start"]))
    for k, c in enumerate(card_list):                     # sheets first so other cards can sit on top
        for key in ("image", "avatar"):
            if c.get(key):
                c[key] = str(resolve(c[key], base))
        c["end"] = min(c["end"], total)
        if c["end"] - c["start"] < 0.1:
            continue
        try:
            pattern, x, y = card_lib.render_card(c, W, H, FPS, work / "cards" / f"{k:03d}_{c['type']}")
        except Exception as e:
            print(f"[render] skipping card {k} ({c.get('type')}): {e}")
            continue
        inputs += ["-framerate", FPS, "-i", pattern]
        fc.append(f"[{n}:v]format=rgba,setpts=PTS-STARTPTS+{c['start']}/TB[c{n}]")
        fc.append(f"[{last}][c{n}]overlay={x}:{y}:enable='between(t,{c['start']},{c['end']})':eof_action=pass[v{n}]")
        last = f"v{n}"
        n += 1
    fc.append(f"[{last}]format=yuv420p[vout]")

    fc.append("[0:a]highpass=f=80,acompressor=threshold=-18dB:ratio=3:attack=5:release=80:makeup=2,"
              "asplit=2[voice][key]")
    mix = ["[voice]"]
    for s in pl.get("sfx", []):
        f = sfx_dir / f"{s['name']}.wav"
        if not f.exists():
            continue
        inputs += ["-i", f]
        ms = int(max(0, s["t"] + A["sfx_offset_s"]) * 1000)
        fc.append(f"[{n}:a]volume={s.get('db', A['sfx_db'].get(s['name'], -14))}dB,adelay={ms}:all=1[s{n}]")
        mix.append(f"[s{n}]")
        n += 1
    bgm = pl.get("bgm") or A.get("bgm")
    if bgm and resolve(bgm, base).exists():
        inputs += ["-stream_loop", "-1", "-i", resolve(bgm, base)]
        fc.append(f"[{n}:a]atrim=0:{total:.2f},volume={A['bgm_db']}dB,afade=t=out:st={max(0, total - 1):.2f}:d=1[bg]")
        fc.append(f"[bg][key]sidechaincompress=threshold=0.03:ratio={A['duck_ratio']}:attack=15:release=250[duck]")
        mix.append("[duck]")
    else:
        fc.append("[key]anullsink")
    fc.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0:duration=first,"
              f"loudnorm=I={A['lufs']}:TP={A['true_peak']}:LRA=7[aout]")
    run(["ffmpeg", "-y", "-hide_banner"] + inputs + ffmpeg_graph(";\n".join(fc), work) +
        ["-map", "[vout]", "-map", "[aout]", "-r", FPS, "-c:v", "libx264", "-crf", "18", "-preset", "medium",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart",
         "-t", f"{total:.2f}", out])
    print(f"[render] wrote {out}")


DEMO_CARDS = [
    {"type": "words", "start": 0.3, "end": 2.4, "words": [{"text": "KYA", "t": 0.0}, {"text": "AAPNE", "t": 0.35}]},
    {"type": "price", "start": 0.6, "end": 2.6, "lines": ["₹15K", "₹60K"], "y": 0.80},
    {"type": "pill", "start": 2.8, "end": 5.6, "text": ["*6500 mAh* Battery", "*45W* Charging"]},
    {"type": "badge", "start": 2.8, "end": 5.6, "text": "1", "y": 0.045},
    {"type": "display", "start": 3.2, "end": 5.6, "text": ["SNAPDRAGON", "8 GEN3"], "color": "#8E86C9", "size": 120,
     "y": 0.42},
    {"type": "spec", "start": 5.8, "end": 8.6, "lines": ["*Snapdragon 6s Gen 4*", "*LPDDR5X* RAM", "*UFS 3.1* Storage"]},
    {"type": "text", "start": 6.0, "end": 8.6, "text": "*Intel Core Ultra X7 358H*", "sub": "( 16 cores aur 16 threads )",
     "color": "#7A1022", "y": 0.42},
    {"type": "display", "start": 6.4, "end": 8.6, "text": "LUXUS", "sub": "LOHNT SICH NICHT", "size": 190, "y": 0.62},
    {"type": "sheet", "start": 8.8, "end": 12.4, "title": "motorola edge 70 Pro", "tint": "#DDE5C9",
     "rows": ['6.8" 1.5K 144Hz Quad Curved AMOLED', "Dimensity 8500 (4nm)", "LPDDR5X RAM  |  UFS 4.1 Storage",
              "6500mAh Battery  |  90W Charger", "50MP Main + 50MP UW  |  50MP Front", "IP68 & IP69",
              "Hello UI  |  Android 16  |  3 + 5 Years"], "price": "Offer Price - ₹36,999"},
    {"type": "subscribe", "start": 12.6, "end": 16.0, "name": "Your Channel", "tagline": "Tech & Reviews  •  Made Simple"},
    {"type": "pill", "start": 12.9, "end": 14.4, "text": "SAVE THIS?", "fill": "#FFF3A6", "y": 0.30},
    {"type": "pill", "start": 14.4, "end": 16.0, "text": "& SHARE", "fill": "#C9F2D4", "y": 0.30},
]


def demo(P, fmt):
    work = Path.cwd() / "work" / "cards_demo"
    work.mkdir(parents=True, exist_ok=True)
    W, H = (1920, 1080) if fmt == "horizontal" else (1080, 1920)
    run(["ffmpeg", "-y", "-hide_banner", "-f", "lavfi", "-i",
         f"gradients=s={W}x{H}:c0=0x3E4A5C:c1=0x8A6F5A:x0=0:y0=0:x1={W}:y1={H}:d=16:speed=0.008:r={FPS}",
         "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", "16", "-c:v", "libx264", "-crf", "20",
         "-pix_fmt", "yuv420p", "-c:a", "aac", work / "cut.mp4"])
    (work / "meta.json").write_text(json.dumps({"W": W, "H": H}))
    (work / "plan.json").write_text(json.dumps({"cards": DEMO_CARDS, "zooms": [], "broll": [], "sfx": []},
                                               ensure_ascii=False), encoding="utf-8")
    render(work / "cut.mp4", work, Path.cwd() / "cards_demo.mp4", P, Path.cwd())


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stage", choices=["all", "cut", "transcribe", "plan", "render", "demo"])
    ap.add_argument("raw", nargs="?")
    ap.add_argument("--preset", default=None, help="gyan (default) or jay; file name in presets/")
    ap.add_argument("--format", default="auto", choices=["auto", "vertical", "horizontal"],
                    help="auto = keep the orientation of the input")
    ap.add_argument("--model", default="small", help="whisper model: tiny/base/small/medium/large-v3")
    ap.add_argument("--lang", default=None, help="force language code, e.g. en, hi, ur, de")
    a = ap.parse_args()
    if a.stage == "demo":
        P = json.loads((SKILL / "presets" / f"{a.preset or 'gyan'}.json").read_text(encoding="utf-8"))
        return demo(P, a.format)
    if not a.raw:
        ap.error("give the path to your video")
    raw = Path(a.raw.strip('"')).expanduser().resolve()
    if not raw.exists():
        near = [p.name for p in raw.parent.glob("*") if p.suffix.lower() in (".mp4", ".mov", ".mkv", ".m4v")] \
            if raw.parent.exists() else []
        sys.exit(f"Video not found: {raw}\n" + (f"Videos in that folder: {', '.join(near[:10])}" if near else
                 "Tip: Shift + right-click the file in Explorer -> 'Copy as path', and paste that (with quotes)."))
    work = raw.parent / "work" / raw.stem
    work.mkdir(parents=True, exist_ok=True)
    preset = a.preset
    if not preset and a.stage == "render" and (work / "plan.json").exists():
        preset = json.loads((work / "plan.json").read_text(encoding="utf-8")).get("preset")
    P = json.loads((SKILL / "presets" / f"{preset or 'gyan'}.json").read_text(encoding="utf-8"))
    out = raw.parent / f"{raw.stem}_edited.mp4"
    if a.stage in ("all", "cut"):
        cut(raw, work, P, a.format)
    if a.stage in ("all", "transcribe"):
        transcribe(work, a.model, a.lang)
    if a.stage in ("all", "plan"):
        plan(work, P)
    if a.stage in ("all", "render"):
        render(work / "cut.mp4", work, out, P, raw.parent)


if __name__ == "__main__":
    main()
