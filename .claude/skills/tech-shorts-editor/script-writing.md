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

## How the user delivers the material (bulk scripts)

For each video the user sends, together: the **transcript** (text), the **YouTube title** (it identifies the source video 01-18 in the Drive folder,
which is already downloaded) and, separately, a **price and spec screenshot**, badge/logo images and any icons or emoji.
- Price and specs come from the screenshot and the user's words, never from speech-to-text (my Whisper transcripts garbled prices, watt and
  RAM figures). Mention in `.verify.txt` only what the screenshot does not settle.
- Opening line is short (see "Opening line must be short" below). Everything else in the writing style stays as approved.
- Output per video: `reference/script-examples/<name>.txt` (voice text) + `.verify.txt`; run `scripts/script_check.py` on each.
- The 17 first-draft scripts in `reference/script-examples/bulk-17/` came from my own noisy transcripts: use them only as a length and structure
  model, and rewrite from the user's transcripts when they arrive.

## Length (the voice stays under one minute)

- **Keep the script near 1,100 characters, spaces included** (the user's rule; ElevenLabs shows the same count).
  Measured on the user's take: **1,122 characters = 59.4 s of speech** (Eleven v4, stability Creative, similarity Low),
  about **18.9 characters or 3.3 spoken words per second**, so about 195 spoken words.
  The talking-head file runs a second longer than the speech (silence before and after).
- Count after numbers are spelled out ("6.67" is four spoken words). The first take estimate of 4.0 words per second was
  wrong for the later settings: the script I called "47 s" really ran 59 s. Use the numbers above.
- If it runs long, cut details nobody decides on (box contents, extra ports, secondary specs), never the price, display,
  chip, camera, battery or verdict. Last resort: speed 1.1 in ElevenLabs.
- Check every draft: `py .claude/skills/tech-shorts-editor/scripts/script_check.py script.txt`.

## Structure of a 55-59 s phone review (to-the-point)

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
- **Complete, flowing sentences, never fragments** (see "Sentence style" below). Each sentence has its own
  subject and closes with a verb ("hai", "hain", "hota hai"); up to about 45 words, joined with "jo", "jabke",
  "halaanke", "lekin".
- Tech words stay in English.

## Sentence style (rule from the user, after my first script was rejected)

The user's own script (written in Gemini, saved in `reference/script-examples/moto-g47-gemini-user-script.txt`)
is the model: natural spoken sentences that start properly and finish properly. My first rewrite squeezed the
facts into broken fragments to save time, and the user called it bad. **To save time, cut facts, never grammar.**

| Rejected (fragments) | Right (complete sentence) |
|---|---|
| "main Ahmed Hassan" | "main hoon Ahmed Hassan" |
| "aaj baat Moto G47 ki" | "aaj hum baat karne wale hain Pakistan mein launch hone wale Motorola Moto G forty-seven ki" |
| "Display six point six seven inch ki hai, seven twenty p aur one twenty hertz." (list) | "Front par six point six seven inch ki seven twenty p, one twenty hertz display hai, jo Gorilla Glass seven I ke saath aati hai, halaanke iss price mein ten eighty p panel hota to behtar tha." |
| "Dimensity six three zero zero, eight gigabyte RAM ... hai." (bare list) | "Andar Dimensity six three zero zero chipset, eight gigabyte RAM aur one twenty-eight gigabyte storage hai, aur ... Hello U I smooth gaming aur daily performance deta hai." |

- **Prices: "almost", spoken-style digits, name every device (rules from the user, replace the older "lagbhag" rule):**
  - Every price carries **"almost"** (prices change). Never "lagbhag": in Pakistan "lagbhag" sounds like a different, formal word and the user dislikes it.
  - Write the price the way it is spoken, digits and words mixed, **no commas inside numbers**: "almost 99 hazaar 999 rupay", "almost 1 lakh 30 hazaar rupay",
    "almost 1 lakh 90 hazaar rupay", "almost 40 hazaar rupay". Not "99,999" and not "1,30,000".
  - For "under X" write "almost 90 hazaar rupay se kam". Ranges: "almost 1 lakh 50 hazaar rupay se 1 lakh 60 hazaar rupay".
  - **When a script covers several phones, do not read the prices as one list** ("jin ki prices 99, 1 lakh 30 aur 1 lakh 90 hain" is confusing).
    Name each phone with its own price: "M8 ki price almost 99 hazaar 999 rupay hai. M8 Pro ki price almost 1 lakh 30 hazaar rupay hai." Same for every comparison.
  - The price comes from the user's list (current market price), not from the source video.
- **No commas anywhere in the voice text (rule from the user):** ElevenLabs turns a comma into extra space and the voice stops for a moment.
  Use no commas at all: not in sentences, not in numbers, not in lists. Where a comma would have been, either join with a word ("aur", "jabke", "lekin", "jo") or
  end the sentence with a full stop and start a new short one. Check with `scripts/script_check.py`, which flags every comma.
- **Spelling of "bada" and "bade" (rule from the user):** ElevenLabs read "bade" as "twelve" once (the Pixel 9a bezels sentence). Always write
  **"bada"** for bada (big, masculine singular) and **"baday"** for bade (big, plural or oblique: "baday bezels", "baday size ka"). Never "bara", "bare" or "bade".
  (Feminine "badi" stays as it is.) Same idea for any word the voice misreads: the user sends the spelling that worked.
- **Launch status (rule from the user):** if the source video says the phone is not yet launched or not yet on sale in Pakistan, the script says so in the
  opening, with the date the host gave (for example "abhi Pakistan mein launch nahi hua, December ke end ya January mein aayega"), and the price is
  written as the expected one ("price lagbhag X rupay hogi"). Read the video for the launch date and status every time; the user's price list does not say it.
- **Opening line must be short (rule from the user):** the viewer decides in the first seconds. Do NOT say "main hoon Ahmed Hassan" and do not
  start with a long introduction. Use: "Assalam-o-Alaikum dosto, aaj hum baat karne wale hain <product> ki, jis ki price <price> rupay hai, lekin <sale/hook>."
  or a one-line hook before the greeting. The name is not needed in the voice. The moto-g47-approved-v1.txt example keeps the old long opening on purpose
  (it was approved before this rule); every new script uses the short one.
- Connect facts with "jo ... ke saath aati hai", "jabke", "halaanke", "lekin"; start sections with "Design ki baat
  karein to", "Front par", "Andar", "Camera mein".
- When asked for variations, give three that differ in structure but all follow this style: (1) the user's own order
  trimmed to length, (2) a question hook plus an early verdict, (3) a comparison angle using the user's own words about
  competitors. Show spoken-word count and estimated seconds for each.

## Writing for the voice (ElevenLabs rules)

Source: the ElevenLabs text-to-speech best-practices page (elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

**Spell everything out** (exceptions: "11 11 sale", "IP sixty four" and prices in digits). The docs say to expand numbers, symbols, units and abbreviations before sending text
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
| IP64 | IP sixty four (the user's choice; the voice reads "IP" as letters) |
| NFC, UI | N F C, U I (spaced letters) |
| Moto G47 | Moto G forty-seven |
| Dimensity 6300 | Dimensity six three zero zero |
| Android 16 | Android sixteen |
| 11.11 sale | 11 11 sale (the user's choice: digits are fine here, the voice reads it correctly) |
| Rs 76,499 | almost 76 hazaar 499 rupay (digits and the words hazaar / lakh, no comma; spelled out as "chhiyattar hazaar ..." the voice said 66,499) |

- Decimals are always **"point"** by default. Never let the voice choose: it said the Hindi word "dashmlav" (3.5, 6.67, 2.2).
  If the user prefers the Urdu word "ashariya", write that instead.
- Model names with a letter after a number ("7i") are spelled with the English letter name ("seven I").
- Spec numbers in English words (that is how Pakistani reviewers say them).
  **Write prices in digits** ("76,499 rupay"): the voice read digits correctly twice, but read "chhiyattar" (76) as 66, so the video said the wrong price.
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

## The approved script

`reference/script-examples/moto-g47-approved-v1.txt` is the version the user picked (variation 1) and approved
with two wording changes (11 11, IP sixty four). Use it as the model for length, order and sentence style.
From a video: get the transcript first with `scripts/transcript.py video.mp4 --lang ur`, take the facts
and the angle from it, then write the script fresh.

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
