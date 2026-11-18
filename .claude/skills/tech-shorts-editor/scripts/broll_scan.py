#!/usr/bin/env python3
"""Find the shots of a long review video and make numbered contact sheets, so product-only B-roll can be picked
without mistakes (no host, no other people, no intro/outro graphics).

  python3 broll_scan.py video.mp4 out_dir [--host 12.5,40.2] [--fps 8]

Writes out_dir/shots.json (start, end, similarity to the host frames) and out_dir/sheet_NN.jpg: one row per shot with
three frames (0.15 s after the start, middle, 0.15 s before the end) and the shot number, times and host score.
`--host` gives times where the host is on screen (look at a first pass of sheets, then pass two or three times).
Shots with a high host score are marked H. The labelling itself (P product / H host / O other) is done by LOOKING at
the sheets: see SKILL.md section 11. Needs ffmpeg, numpy, pillow."""
import argparse, json, subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

TW, TH = 64, 36


def frames(video, fps, t0=0.0, dur=None):
    cmd = ["ffmpeg", "-v", "error", "-ss", str(t0)] + (["-t", str(dur)] if dur else []) + ["-i", str(video),
           "-vf", f"fps={fps},scale={TW}:{TH}:flags=area", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, stdout=subprocess.PIPE, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, TH, TW, 3).astype(np.float32)


def frame_at(video, t, w=480):
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{max(t, 0):.3f}", "-i", str(video), "-frames:v", "1", "-vf", f"scale={w}:-2",
           "-f", "image2pipe", "-vcodec", "png", "-"]
    import io
    out = subprocess.run(cmd, stdout=subprocess.PIPE).stdout
    return Image.open(io.BytesIO(out)).convert("RGB") if out else Image.new("RGB", (w, w * 9 // 16))


def feat(a):                                           # 16x9 colour layout, zero-mean, unit length
    f = a.reshape(a.shape[0], 9, 4, 16, 4, 3).mean((2, 4)).reshape(a.shape[0], -1)
    f = f - f.mean(1, keepdims=True)
    return f / (np.linalg.norm(f, axis=1, keepdims=True) + 1e-6)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video"); ap.add_argument("out")
    ap.add_argument("--fps", type=float, default=8)
    ap.add_argument("--host", default="", help="comma separated times (s) where the host is on screen")
    ap.add_argument("--cut", type=float, default=22.0, help="mean pixel difference that counts as a cut (default 22)")
    ap.add_argument("--min", type=float, default=0.5, help="shortest shot kept (s)")
    ap.add_argument("--hide-host", type=float, default=0.8, help="leave shots with a host score above this out of the sheets (default 0.8; real host shots score 0.9-1.0)")
    ap.add_argument("--only-host", action="store_true", help="make the sheets from the shots that --hide-host would leave out (to check them)")
    ap.add_argument("--width", type=int, default=300)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    cache = out / "proxy.npy"
    if cache.exists():
        fr = np.load(cache)
    else:
        fr = frames(a.video, a.fps); np.save(cache, fr)
    n = len(fr)
    d = np.abs(fr[1:] - fr[:-1]).mean((1, 2, 3))
    cuts = [0] + [i + 1 for i in range(len(d)) if d[i] > a.cut] + [n]
    shots = []
    for s, e in zip(cuts[:-1], cuts[1:]):
        if (e - s) / a.fps >= a.min:
            shots.append([s / a.fps, e / a.fps, s, e])
    F = feat(fr)
    host_t = [float(x) for x in a.host.split(",") if x.strip()]
    if not host_t:                                      # no times given: the host is the picture that fills most of the video
        mid = np.array([F[(sh[2] + sh[3]) // 2] for sh in shots])
        sim = mid @ mid.T
        dur = np.array([sh[1] - sh[0] for sh in shots])
        score = ((sim > 0.85) * dur[None, :]).sum(1)
        best = int(score.argmax())
        print(f"host guess: shot at {shots[best][0]:.1f}s, similar shots add up to {score[best]:.0f} s of {n / a.fps:.0f} s")
        if score[best] < 0.12 * n / a.fps:
            print("no recurring host picture found (voice-over only video?): nothing is hidden")
        else:
            host_t = [(shots[best][0] + shots[best][1]) / 2]
    HF = F[[min(int(t * a.fps), n - 1) for t in host_t]] if host_t else None
    res = []
    for k, (t0, t1, s, e) in enumerate(shots, 1):
        sim = float((F[s:e] @ HF.T).max(1).mean()) if HF is not None else 0.0
        res.append({"n": k, "start": round(t0, 2), "end": round(t1, 2), "len": round(t1 - t0, 2), "host_sim": round(sim, 2)})
    (out / "shots.json").write_text(json.dumps(res, indent=0))
    print(f"{len(res)} shots in {n / a.fps:.0f} s")
    W = a.width
    H = W * 9 // 16
    show = [r for r in res if (r["host_sim"] > a.hide_host) == a.only_host]
    print(f"{sum(r['host_sim'] > a.hide_host for r in res)} host shots (score above {a.hide_host}) are not in the normal sheets")
    cols, rows = 4, 6                                   # one tile (middle frame) per shot, label on the tile
    per = cols * rows
    for sh in range(0, len(show), per):
        chunk = show[sh:sh + per]
        img = Image.new("RGB", (W * cols, (H + 2) * ((len(chunk) + cols - 1) // cols)), (20, 20, 20))
        dr = ImageDraw.Draw(img)
        for k, s in enumerate(chunk):
            x, y = (k % cols) * W, (k // cols) * (H + 2)
            im = frame_at(a.video, s["start"] + s["len"] / 2, W).resize((W, H))
            img.paste(im, (x, y))
            dr.rectangle((x, y, x + 148, y + 14), fill=(0, 0, 0))
            dr.text((x + 3, y + 1), f"#{s['n']} {s['start']:.1f}-{s['end']:.1f} h{s['host_sim']:.1f}", fill=(255, 255, 0))
        img.save(out / f"{'hostsheet' if a.only_host else 'sheet'}_{sh // per + 1:02d}.jpg", quality=72)
    print("sheets:", (len(show) + per - 1) // per)


if __name__ == "__main__":
    main()
