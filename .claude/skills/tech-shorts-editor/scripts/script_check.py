#!/usr/bin/env python3
"""Check a voice-over script before it is pasted into ElevenLabs.

  py script_check.py script.txt            (macOS/Linux: python3)
  py script_check.py script.txt --rate 3.8 --max 58

It counts the spoken words, estimates the voice length, and flags things the voice reads badly:
digits and decimals, symbols, unit abbreviations, capital-letter acronyms, Hindi words, non-Latin script,
square-bracket tags and sentences that are too long for one breath.

Rate: 4.0 spoken words per second, measured on the user's own ElevenLabs voice (Ahmed Hassan clone,
324 spoken words in 81.0 s). Re-measure with a new take: words spoken / seconds of audio.
Exit code 1 if there is an error or the script is longer than --max seconds.
"""
import argparse, re, sys

HINDI = {"dashmlav", "dashamlav", "dashmlaw", "dashmlaw", "dashamlaw"}
UNITS = {"mah", "gb", "tb", "mb", "hz", "khz", "ghz", "mm", "cm", "kg", "mp", "fps", "w", "ms", "nm", "inch"}
UNITS.discard("inch")                                    # "inch" is a normal spoken word
ACRONYM_OK = {"RAM", "AMOLED", "PUBG", "HDR", "OLED", "LTPO", "PTA"}   # words the voice reads fine as words


def spoken_tokens(text):
    clean = re.sub(r"\[[^\]]*\]", " ", text)             # square-bracket tags are not spoken
    return [w for w in re.split(r"[\s\-]+", clean) if re.search(r"\w", w)]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--rate", type=float, default=4.0, help="spoken words per second (default 4.0)")
    ap.add_argument("--target", type=float, default=50.0, help="seconds the voice should stay under (default 50)")
    ap.add_argument("--max", type=float, default=58.0, help="hard limit in seconds (default 58)")
    a = ap.parse_args()
    text = open(a.file, encoding="utf-8").read()
    errors, warns = [], []
    lines = [l for l in text.split("\n") if l.strip()]
    for n, line in enumerate(lines, 1):
        for m in re.finditer(r"\d[\d.,]*\w*", line):
            errors.append(f"line {n}: digits '{m.group(0)}': write the number as words (e.g. 3.5 -> three point five)")
        for m in re.finditer(r"[%₹$&+/=@#*<>]", line):
            errors.append(f"line {n}: symbol '{m.group(0)}': write it as a word")
        if re.search(r"[ऀ-ॿ؀-ۿ]", line):
            errors.append(f"line {n}: non-Latin script: the script must be Roman Urdu")
        for t in re.findall(r"[A-Za-z]+", re.sub(r"\[[^\]]*\]", " ", line)):
            low = t.lower()
            if low in HINDI:
                errors.append(f"line {n}: Hindi word '{t}': use 'point' for decimals")
            if low in UNITS and (t.isupper() or t[0].islower() or t in ("mAh", "Hz", "GB", "MB", "TB", "MP", "FPS")):
                errors.append(f"line {n}: unit '{t}': spell it out (gigabyte, hertz, watt, millimeter, milliamp hour ...)")
            elif t.isupper() and len(t) >= 2 and t not in ACRONYM_OK:
                warns.append(f"line {n}: acronym '{t}': write spaced letters (N F C) or the full word")
        for m in re.finditer(r"\[([^\]]*)\]", line):
            tag = m.group(1)
            if re.search(r"verify|pending|todo", tag, re.I):
                errors.append(f"line {n}: [{tag}] would be read aloud: move it out of the voice script")
            else:
                warns.append(f"line {n}: tag [{tag}] is not spoken but works only on Eleven v3/v4 audio tags")
        for sent in re.split(r"(?<=[.!?:])\s+", line):
            k = len(spoken_tokens(sent))
            if k > 46:
                warns.append(f"line {n}: a sentence of {k} words is longer than about 45 words: split it with a full stop")
    words = len(spoken_tokens(text))
    secs = words / a.rate
    lo, hi = words / (a.rate * 1.1), words / (a.rate * 0.9)
    print(f"spoken words: {words}   estimated voice: {secs:.1f} s (range {lo:.0f}-{hi:.0f} s at rate {a.rate} words/s)")
    print(f"target under {a.target:.0f} s, hard limit {a.max:.0f} s")
    if hi > a.max:
        errors.append(f"too long: the slow end of the range is {hi:.0f} s, limit {a.max:.0f} s: cut about "
                      f"{int((hi - a.max) * a.rate)} words")
    elif secs > a.target:
        warns.append(f"over the {a.target:.0f} s target by about {secs - a.target:.0f} s")
    for e in errors:
        print("ERROR  ", e)
    for w in warns:
        print("warning", w)
    if not errors and not warns:
        print("OK: no problems found")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
