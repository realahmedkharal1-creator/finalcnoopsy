# Writing the voice-over script (Roman Urdu, for ElevenLabs)

Use this when the user wants a script for a review short. The user generates the voice in ElevenLabs from
your text, so the text must be written for **that voice to read correctly**, not for the eye.

## Input and output

- **Input:** a blog or review link (fetch it with `curl`, or the `web-fetch` agent), or a pasted video
  transcript, plus the user's spec sheet and price. Take facts and ideas from them; write fresh sentences,
  never copy the source's wording.
- **Output**, in this order:
  1. the **voice script**: plain text, one sentence or two per line, nothing else on those lines, ready to paste;
  2. the spoken-word count and the estimated voice length (run `scripts/script_check.py`);
  3. a **short list of facts I could not confirm** (kept out of the voice text, because ElevenLabs would read a
     `[VERIFY]` tag aloud);
  4. what was cut compared with the source, in one line.
- The user's separate `tech-script-writer` skill (account skill) also writes Ahmed's scripts. If it is available,
  follow its workflow and its tone question; this file's length and voice rules still apply on top.
  The default tone is **to-the-point**: facts, one honest verdict, no jokes.

## Length (the video stays under 60 s)

- **Voice target: about 50 s or less. Hard limit: 58 s.**
- Speaking rate of the user's ElevenLabs voice: **4.0 spoken words per second** (measured: 324 words in 81 s).
  So 50 s is about **200 spoken words**; stay at 190 to be safe. The estimate is good to about plus or minus 10%.
- Count words **after** numbers are spelled out ("6.67" is four spoken words, not one). Digits make a script
  look shorter than it sounds: the first take had 220 tokens but about 325 spoken words.
- Fits too long: first cut details nobody decides on (box contents, extra ports, secondary specs), never the
  price, display, chip, camera, battery, verdict. Last resort: speed 1.1 in ElevenLabs.
- Check every draft: `py .claude/skills/tech-shorts-editor/scripts/script_check.py script.txt`.

## Structure of a 45-50 s phone review (to-the-point)

1. Greeting and product name in the first 5 s (search picks up the spoken name).
2. Price in Rs, in words, and any sale or discount.
3. Box (one line, optional) and design.
4. Display, then chip / RAM / storage, then camera, then battery and charging.
5. One honest verdict line that comes from the facts, including the weak point (for example a 720p display at this price).
6. CTA: comments, like, subscribe, Allah Hafiz. Soften imperatives ("batana", "karlena").

## Language

- Roman Urdu only. **Never Hindi vocabulary**, never Devanagari or Urdu script.
- Spelling: hai, hain, kya, nahi, aap, mein, kyunke, bohat, ye, wo, iss, uss, thay, zyada, acha, lekin, phir, zaroor.
- Gender: phone, camera, chipset, design, software are masculine; display, battery, price, charging, storage,
  RAM are feminine. Mixed lists: split them ("design acha hai, battery achi hai").
- Short sentences, each closed with a verb ("hai", "hain", "hota hai"); each must fit in one breath (under about 25 words).
- Tech words stay in English.

## Writing for the voice (ElevenLabs rules)

Source: the ElevenLabs text-to-speech best-practices page (elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

**Spell everything out.** The docs say to expand numbers, symbols, units and abbreviations before sending text
to the voice, and the user's first take proves it. No digits, no `.`, `,` or `-` inside numbers, no `%`, `$`, `/`.

| Written | Say it like this in the script |
|---|---|
| 3.5 mm | three point five millimeter |
| 6.67 inch | six point six seven inch |
| 120Hz | one twenty hertz |
| 720p / 1080p | seven twenty p / ten eighty p |
| 1050 nits | ten fifty nits |
| 8GB, 128GB | eight gigabyte, one twenty-eight gigabyte |
| 5200mAh | five thousand two hundred milliamp hour |
| 20W | twenty watt |
| 108MP | one hundred eight megapixel |
| Gorilla Glass 7i | Gorilla Glass seven I |
| IP64 | I P six four |
| NFC, UI | N F C, U I (spaced letters) |
| Moto G47 | Moto G forty-seven |
| Dimensity 6300 | Dimensity six three zero zero |
| Android 16 | Android sixteen |
| 11.11 sale | eleven eleven sale |
| Rs 76,499 | chhiyattar hazaar chaar sau ninyanve rupay |

- Decimals are always **"point"**. Never let the voice choose: it said the Hindi word "dashmlav" (3.5, 6.67, 2.2).
- Model names with a letter after a number ("7i") are spelled with the English letter name ("seven I").
- Prices and money in Roman Urdu words; spec numbers in English words (that is how Pakistani reviewers say them).
- On-screen text and cards keep digits and "Rs": only the voice text is spelled out.

**Pauses and emphasis (depends on the model).** The file name of the user's take (`..._ivc_s50_sim75_v4.mp3`)
suggests Eleven v4; confirm with the user.
- v4 / v3: no SSML `<break>` tags. Pauses come from punctuation: commas, full stops, an ellipsis for a longer
  pause. Capital letters add emphasis, so do not capitalise normal words. Audio tags like `[excited]` go in square brackets.
- Multilingual v2 / Flash: `<break time="0.5s" />` works up to 3 s; many break tags in one take make it unstable.
- Keep the script free of any other brackets or notes.

**If a word is still wrong:** try a phonetic respelling (extra capital letters, a dash, an apostrophe); on v4 an IPA
transcription in forward slashes inside double quotes, used only for that word and tested (results vary by voice);
on Multilingual v2 a pronunciation dictionary alias (case sensitive, first match wins). Regenerate and pick the best take.
ElevenLabs also has a speed setting, 0.7 to 1.2, to trim length.

## What went wrong in the first take (the user's ElevenLabs voice, 81 s)

Found by transcribing the mp3 (speech to text, not by listening, so smaller slips may exist).

| Problem | Seen in the take | Fix now written into the rules |
|---|---|---|
| Hindi word in the middle (confirmed by the user) | "dashmlav" for every decimal point (3.5, 6.67, 2.2) | always write "point" |
| Gorilla Glass 7i (confirmed by the user) | read as "saat aaee" (Urdu number plus letter) | "seven I" |
| Too long | 81 s, about 325 spoken words | 190 words, about 47 s |
| Units read oddly | mAh as the letters "M A H", "watt" as "wart", GB as letters | "milliamp hour", "watt", "gigabyte" |
| Mixed number language | Urdu numerals for specs ("saat sau bees") next to English tech words | spec numbers in English words |

Number reading that was fine: the price in Roman Urdu words, "11.11 sale", "Type-A to Type-C", the greeting and sign-off.

## Verify loop

When the user sends the new mp3: transcribe it (Urdu, Hindi and English modes), compare with the script line by line,
measure the real words-per-second, update the table above and the rate in `scripts/script_check.py`.
