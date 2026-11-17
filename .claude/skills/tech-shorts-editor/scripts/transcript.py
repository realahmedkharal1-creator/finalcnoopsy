#!/usr/bin/env python3
"""Write the transcript of a video or audio file (Whisper, runs on the CPU).

  py transcript.py video.mp4 --lang ur --model small
  -> video.txt (plain text) and video.srt-like timestamps printed to the screen

--lang: ur (Urdu/Roman Urdu speech), hi, en; leave empty to detect. --model: tiny, base, small (default), medium, large-v3
(bigger = slower and more exact; a 10-minute video takes roughly 3-6 minutes with small, longer with large-v3).
Needs: pip install faster-whisper; ffmpeg on PATH.
"""
import argparse, subprocess, sys, wave
from pathlib import Path


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--lang", default=None)
    ap.add_argument("--model", default="small")
    a = ap.parse_args()
    src = Path(a.file)
    wav = src.with_suffix(".16k.wav")
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-ac", "1", "-ar", "16000", str(wav)])
    if r.returncode:
        sys.exit("ffmpeg could not read the file (is ffmpeg installed?)")
    try:
        import numpy as np
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("Missing package. Run:  py -m pip install faster-whisper numpy")
    w = wave.open(str(wav))
    audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    w.close()
    segs, info = WhisperModel(a.model, device="cpu", compute_type="int8").transcribe(audio, language=a.lang, beam_size=5)
    lines = []
    for s in segs:
        m, sec = divmod(int(s.start), 60)
        lines.append(f"[{m}:{sec:02d}] {s.text.strip()}")
    wav.unlink(missing_ok=True)
    out = src.with_suffix(".txt")
    out.write_text("\n".join(lines), encoding="utf-8")
    print("\n".join(lines))
    print(f"\nlanguage: {info.language}   saved: {out}")


if __name__ == "__main__":
    main()
