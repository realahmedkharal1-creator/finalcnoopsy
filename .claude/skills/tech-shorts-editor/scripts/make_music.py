#!/usr/bin/env python3
"""Make a soft, royalty-free ambient bed (slow chord pad, no drums) so a video has music without a copyright track.

  python3 make_music.py out.wav [seconds]      # default 64 s, 48 kHz stereo

Slow chord changes (Am - F - C - G, 8 s each), detuned sine layers, a light echo and a low-pass. Meant to sit at
about -30 dB under the voice (preset bgm_db); drop your own bgm.mp3 into the plan to replace it."""
import sys, wave
import numpy as np

SR = 48000


def main():
    out = sys.argv[1]
    dur = float(sys.argv[2]) if len(sys.argv) > 2 else 64.0
    n = int(SR * dur)
    t = np.arange(n) / SR
    chords = [(57, 60, 64), (53, 57, 60), (48, 52, 55), (55, 59, 62)]          # Am F C G
    sig = np.zeros(n)
    seg = 8.0
    for i in range(int(dur / seg) + 2):
        a, b = i * seg, i * seg + seg + 2.0                                       # 2 s overlap between chords
        m = (t >= a) & (t < b)
        if not m.any():
            continue
        tt = t[m]
        env = np.clip((tt - a) / 2.0, 0, 1) * np.clip((b - tt) / 2.0, 0, 1)
        for note in chords[i % 4]:
            f = 440 * 2 ** ((note - 69) / 12)
            for det, amp in ((0.997, 0.5), (1.0, 0.7), (1.003, 0.5)):
                sig[m] += amp * env * np.sin(2 * np.pi * f * det * tt) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.12 * tt))
        sig[m] += 0.4 * env * np.sin(2 * np.pi * 440 * 2 ** ((chords[i % 4][0] - 12 - 69) / 12) * tt)   # bass note
    spec = np.fft.rfft(sig)                                                       # gentle low-pass at 1.8 kHz
    fr = np.fft.rfftfreq(n, 1 / SR)
    spec *= 1 / (1 + (fr / 1800) ** 4)
    sig = np.fft.irfft(spec, n)
    for d, g in ((0.37, 0.35), (0.71, 0.2)):                                      # soft echo
        k = int(d * SR)
        sig[k:] += g * sig[:-k]
    sig /= np.abs(sig).max()
    sig *= 0.8 * np.clip(t / 2.0, 0, 1) * np.clip((dur - t) / 2.0, 0, 1)
    pcm = (np.stack([sig, np.roll(sig, 120)], 1) * 32767).astype("<i2")          # tiny stereo offset
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    print("wrote", out)


if __name__ == "__main__":
    main()
