#!/usr/bin/env python3
"""Turn the shots you labelled as product B-roll into a checked clip list.

  python3 broll_catalogue.py scan_dir "1 2 5 7" [--text "5 7"] [--margin 0.15] [--out clips.json]

scan_dir is the output of broll_scan.py (shots.json, proxy.npy). Each listed shot becomes one clip, trimmed by --margin at
both ends (a cut is only detected to about 0.1 s). The script then re-checks every clip against the proxy frames:
  host    some frame inside looks like the host picture (score above 0.75)         -> look at it
  cut     a hidden cut inside (frame difference above 12, below the 22 that splits shots) -> look at it
  short   shorter than 0.8 s after trimming: dropped
and writes clips.json: [{shot, start, end, len, text, check}] and strip_NN.jpg (first, middle, last frame) for every
clip that has a check, so the doubtful ones are looked at before they are used."""
import argparse, json, subprocess, sys, io
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from broll_scan import feat, frame_at


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("scan"); ap.add_argument("product"); ap.add_argument("--video", required=True)
    ap.add_argument("--text", default=""); ap.add_argument("--margin", type=float, default=0.15)
    ap.add_argument("--fps", type=float, default=8); ap.add_argument("--out", default=None)
    a = ap.parse_args()
    d = Path(a.scan)
    shots = {s["n"]: s for s in json.loads((d / "shots.json").read_text())}
    fr = np.load(d / "proxy.npy"); F = feat(fr)
    mid = np.array([F[int((s["start"] + s["end"]) / 2 * a.fps)] for s in shots.values()])
    dur = np.array([s["len"] for s in shots.values()])
    score = (((mid @ mid.T) > 0.85) * dur[None, :]).sum(1)
    best = int(score.argmax())
    HF = mid[best:best + 1] if score[best] >= 0.12 * len(fr) / a.fps else None
    prod = [int(x) for x in a.product.split()]; txt = {int(x) for x in a.text.split()}
    out, k = [], 0
    for n in prod:
        s = shots[n]
        t0, t1 = round(s["start"] + a.margin, 2), round(s["end"] - a.margin, 2)
        if t1 - t0 < 0.8:
            print(f"#{n}: dropped (only {t1 - t0:.2f} s after trimming)"); continue
        i0, i1 = int(t0 * a.fps) + 1, int(t1 * a.fps)
        check = []
        if HF is not None and i1 > i0 and (F[i0:i1] @ HF.T).max() > 0.75:
            check.append("host")
        if i1 - i0 > 1 and np.abs(fr[i0 + 1:i1] - fr[i0:i1 - 1]).mean((1, 2, 3)).max() > 12:
            check.append("cut")
        out.append({"shot": n, "start": t0, "end": t1, "len": round(t1 - t0, 2), "text": n in txt, "check": check})
    p = Path(a.out) if a.out else d / "clips.json"
    p.write_text(json.dumps(out))
    bad = [c for c in out if c["check"]]
    print(f"{len(out)} clips, {sum(c['len'] for c in out):.0f} s, {len(bad)} to look at:", [(c['shot'], c['check']) for c in bad])
    if bad:
        W = 260
        img = Image.new("RGB", (W * 3, (W * 9 // 16 + 2) * len(bad)))
        dr = ImageDraw.Draw(img)
        for r, c in enumerate(bad):
            for j, t in enumerate((c["start"] + 0.05, (c["start"] + c["end"]) / 2, c["end"] - 0.05)):
                img.paste(frame_at(a.video, t, W).resize((W, W * 9 // 16)), (j * W, r * (W * 9 // 16 + 2)))
            dr.text((4, r * (W * 9 // 16 + 2) + 3), f"#{c['shot']} {c['start']}-{c['end']} {c['check']}", fill=(255, 255, 0))
        img.save(d / "check_strips.jpg", quality=75)


if __name__ == "__main__":
    main()
