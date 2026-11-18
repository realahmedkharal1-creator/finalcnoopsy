#!/usr/bin/env python3
"""Check a voice-over script before it is pasted into ElevenLabs.

  py script_check.py script.txt            (macOS/Linux: python3)
  py script_check.py script.txt --rate 3.8 --max 58

It counts the spoken words, estimates the voice length, and flags things the voice reads badly:
digits and decimals, symbols, unit abbreviations, capital-letter acronyms, Hindi words, non-Latin script,
square-bracket tags and sentences that are too long for one breath.

Calibration (the user's ElevenLabs voice, Eleven v4, stability Creative, similarity Low): a 1,122-character,
197-word script gave 59.4 s of speech, so 18.9 characters per second and 3.3 spoken words per second.
The user's rule: keep scripts near 1,100 characters (spaces included) so the voice stays under one minute.
Re-measure with a new take: characters / seconds of speech.
Exit code 1 if there is an error or the script is longer than --max seconds.
"""
import argparse, re, sys

HINDI = {"dashmlav", "dashamlav", "dashmlaw", "dashmlaw", "dashamlaw"}
UNITS = {"mah", "gb", "tb", "mb", "hz", "khz", "ghz", "mm", "cm", "kg", "mp", "fps", "w", "ms", "nm", "inch"}
UNITS.discard("inch")                                    # "inch" is a normal spoken word
ACRONYM_OK = {"RAM", "AMOLED", "PUBG", "HDR", "OLED", "LTPO", "PTA", "IP"}   # words the voice reads fine as words


def spoken_tokens(text):
    clean = re.sub(r"\[[^\]]*\]", " ", text)             # square-bracket tags are not spoken
    return [w for w in re.split(r"[\s\-]+", clean) if re.search(r"\w", w)]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--rate", type=float, default=3.3, help="spoken words per second (default 3.3)")
    ap.add_argument("--cps", type=float, default=18.9, help="characters per second (default 18.9)")
    ap.add_argument("--chars", type=int, default=1100, help="character limit (default 1100)")
    ap.add_argument("--target", type=float, default=58.0, help="seconds the voice should stay under (default 58)")
    ap.add_argument("--max", type=float, default=59.5, help="hard limit in seconds (default 59.5)")
    a = ap.parse_args()
    text = open(a.file, encoding="utf-8").read()
    errors, warns = [], []
    lines = [l for l in text.split("\n") if l.strip()]
    for n, line in enumerate(lines, 1):
        orig = line
        line = re.sub(r"\b11[ .]11\b", "eleven eleven", line)      # approved by the user: "11 11 sale" is read correctly
        line = re.sub(r"\b\d{1,3}(?:,\d{3})+(?= rupay)", "price", line)   # old comma style (now an error below)
        line = re.sub(r"\b\d+(?: (?:hazaar|lakh|crore))*(?: \d+)?(?= (?:hazaar|lakh|crore|rupay)\b)", "price", line)   # new style: 99 hazaar 999 rupay
        if "," in orig:
            errors.append(f"line {n}: comma: ElevenLabs adds a pause for it: no commas at all, use a full stop or a joining word")
        for bad in re.findall(r"\b(?:bara|bare|bade)\b", orig, re.I):
            errors.append(f"line {n}: write 'bada' or 'baday' instead of '{bad}' (the voice read 'bade' as twelve)")
        if "lagbhag" in orig.lower():
            errors.append(f"line {n}: write 'almost' instead of 'lagbhag'")
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
    chars = len(" ".join(lines))
    secs = chars / a.cps
    lo, hi = secs * 0.96, secs * 1.04
    print(f"characters: {chars} (limit about {a.chars})   spoken words: {words}")
    print(f"estimated voice: {secs:.1f} s (range {lo:.0f}-{hi:.0f} s at {a.cps} characters/s; words say {words / a.rate:.0f} s)")
    if chars > a.chars + 40:
        errors.append(f"over the character limit: {chars} > {a.chars}: cut about {chars - a.chars} characters")
    elif chars > a.chars:
        warns.append(f"{chars - a.chars} characters over {a.chars}")
    print(f"target under {a.target:.0f} s, hard limit {a.max:.1f} s")
    if secs > a.max:
        errors.append(f"too long: about {secs:.0f} s, limit {a.max:.1f} s: cut about {int((secs - a.max) * a.cps)} characters")
    elif hi > a.max:
        warns.append(f"the slow end of the range ({hi:.0f} s) is over the {a.max:.1f} s limit")
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
