---
name: tech-shorts-editor
description: Edit a raw talking-head video into a 9:16 tech short in the style of DasIstJay or Gyan Therapy - dead-air removal, word-level transcription, punch-in/creep zooms, B-roll and spec-label overlays, animated captions, SFX and ducked music. Use when the user asks to edit, cut, caption or "make a short/reel" from a raw video file.
---

# Tech Shorts Editor

Turns `raw_video.mp4` into `raw_video_edited.mp4` (1080x1920, 30 fps) using `scripts/edit.py`
(Python + ffmpeg). The script does the mechanical work; **you** (the model) make the editorial
decisions by rewriting `work/<name>/plan.json` between the `plan` and `render` stages.

Every number below was measured from 11 reference shorts (4 DasIstJay, 7 Gyan Therapy); the
raw measurements are in `reference/forensics.md`. Items marked **(default)** were not measurable
and are sensible defaults - say so if the user asks where a number came from.

## 0. Workflow

```bash
pip install faster-whisper numpy          # once; ffmpeg must be on PATH
python .claude/skills/tech-shorts-editor/scripts/edit.py cut        raw_video.mp4 --preset jay
python .claude/skills/tech-shorts-editor/scripts/edit.py transcribe raw_video.mp4 --lang en
python .claude/skills/tech-shorts-editor/scripts/edit.py plan       raw_video.mp4 --preset jay
#  -> read work/raw_video/words.json, rewrite work/raw_video/plan.json using sections 1-6
python .claude/skills/tech-shorts-editor/scripts/edit.py render     raw_video.mp4
```

1. Ask which preset if the user did not say: `jay` (loud, one-word captions) or `gyan`
   (clean, spec labels, no subtitles). Presets live in `presets/*.json`; all style numbers are there.
2. Run `cut`, `transcribe`, `plan`. `plan` writes a rough baseline only.
3. Read `words.json` and rewrite `plan.json`: fix caption wording, choose emphasis words, place
   zooms, labels, B-roll and SFX by the rules below. Caption text must be Latin script
   (Roman Urdu/Hindi, English, German). Whisper may output Urdu/Devanagari script: transliterate
   it yourself, the bundled fonts have no Arabic or Devanagari glyphs.
4. Run `render`, extract 6-8 frames with ffmpeg, look at them, fix the plan, render again.
5. Report what was cut (seconds removed) and anything you could not do (e.g. no B-roll supplied).

Folder convention next to the raw file: `broll/` (clips, screenshots, product PNGs), optional
`bgm.mp3`. Custom sound effects: drop `whoosh.wav`, `pop.wav`, `click.wav`, `ding.wav`,
`riser.wav` into the skill's `sfx/` folder; otherwise the script synthesises placeholders.

## 1. Style DNA - pacing and cuts

| Rule | Jay | Gyan |
|---|---|---|
| Final length | 73-84 s | 55-91 s |
| Average shot length | 1.6-1.9 s (3.2 s in a sponsored explainer) | 1.9-2.9 s |
| Longest shot allowed | 6 s | 10 s (one continuous screen demo) |
| Flash-cut bursts (3-4 cuts inside 0.1 s) | 2-4 per video, on topic changes | 0-1 per video |
| Speech rate | 2.6-3.0 words/s | 2.3-3.6 words/s |
| Pauses longer than 0.12 s in the final audio | 0-1 plus the tail | 0-2 plus the tail |

Cut settings (in the preset, `cut` block):
- Remove any pause of **250 ms or longer** below **-35 dB**; keep **60 ms** of padding each side,
  which leaves gaps of about 120 ms. Never leave a gap over 150 ms inside a sentence.
- Drop fragments shorter than 150 ms. Delete false starts and repeated takes by hand: keep the last take.
- No breath of silence before the first word: speech starts within 0.2 s of frame 0.
- The last word is followed by at most 0.4-0.7 s of tail, covered by the CTA.
- A visual change (cut, zoom change, overlay in/out) must happen at least every 2 s (jay) or 3 s (gyan).
- Talking head is on screen about 30% of the time. It returns every 8-12 s for 1-4 s, then B-roll resumes.

## 2. The 3-second hook

**Jay**
- 0.00-0.40 s: talking head arrives with a zoom-blur settle (1.25x to 1.0x, ease-out) plus a whoosh.
- 0.15-3.5 s: two-line title at screen centre: one BIG keyword (1.25x caption size) and a
  smaller sub-line of at most 20 characters, optional emoji at the top-right corner of the keyword.
  Example: `LUXUS` / `LOHNT SICH NICHT`. Alternative seen twice: no title, two single-word
  captions at 1.0 s and 1.5 s (`TAKE` then `MONEY`).
- First B-roll cut lands between 2.0 s and 3.9 s. Never stay on the opening shot past 4 s.
- 5-6 s: optional 1 s meme or reaction clip, then a second title naming the product on the talking head.
- Spoken line: a contrarian claim or money statement, finished inside 3.5 s.

**Gyan**
- 0.0-1.0 s: creator already holding the product(s) near the lens, mid-gesture. Brand logo or
  price text animates in (top of frame for a logo, lower third for prices).
- 1-5 s: three or four shots of 0.8-1.8 s, each a fast push-in on the creator or product
  (measured 1.22x to 1.45x within the shot).
- Optional word pills: the spoken hook shown two words at a time in glass pills at 60% height,
  for the first 3 s only.
- 5-6 s: a whip-blur transition into the first B-roll or a full-screen source screenshot.

## 3. Zoom and framing matrix

Framing of the talking head: chest-up, top of head at 8-12% of frame height, eyes at 25-30%,
hands visible. Zoom anchor is 30% from the top so the face stays put.

| Trigger in the script | Action | plan.json `zooms` entry |
|---|---|---|
| First frame | settle 1.25 -> 1.0 in 0.4 s | `{"start":0,"end":0.4,"from":1.25,"to":1.0,"ease":"out"}` |
| Emphasis word, number, price, product name | hard punch to **1.12x** 50 ms before the word, hold to sentence end | `{"from":1.12,"to":1.12}` |
| Neutral sentence longer than 2 s | slow creep **1.0 -> 1.08x** across the sentence | `{"from":1.0,"to":1.08,"ease":"linear"}` |
| New sentence or return from B-roll | reset to 1.0x (just leave a gap between entries) | none |
| Question to the viewer, punchline | punch to 1.20x for 1 s at most | `{"from":1.2,"to":1.2}` |
| Any B-roll clip | slow push 1.0 -> 1.06x (jay) / 1.04x (gyan), automatic | `zoom_to` on the b-roll entry |

Rules: zoom entries must not overlap. Never put two punches back to back: alternate punch,
static, creep. Do not zoom while a pill label is wiping in. The 1.12x / 1.08x values are the
working defaults; the references range from 1.06-1.10x creeps to 1.2-1.5x push-ins on product shots.

## 4. Caption spec

Neither creator uses colour-highlighted karaoke subtitles. Captions are **white only**.
Do not add yellow or green keyword highlights unless the user asks.

**Jay - emphasis words (`captions`)**
- Shown only while the talking head is on screen, never over B-roll.
- One word per screen (two if both are 4 letters or fewer), UPPERCASE, 3 words in a row at most
  per talking-head visit, each on screen 0.4-1.1 s, starting on the word's first frame.
- Font: Lilita One (bundled; closest free match to the reference face). Alternative for a
  geometric look: Montserrat Black. Size 150 px on a 1920 px frame, auto-shrunk to fit 86% width.
- Fill `#FFFFFF`, no stroke, soft shadow `#000000` at 57% opacity, 14 px blur, 6 px spread.
- Position: centre, Y = 48% of frame height (on the chest, below the chin).
- Animation: scale 72% -> 100% in 130 ms with a white glow flash that fades in the same 130 ms.
  Hard cut out.
- Max 12 characters per caption. Longer words: use a shorter synonym or split.

**Both - top labels on B-roll (`labels`)**
- Product names and specs, never sentences. Y = 13% (jay) or 16% (gyan). Hold 3-3.5 s or the whole shot.
- Jay: two stacked lines in the caption font, 120 px, plus a sub-line at 50% size
  (`HAUPT KAMERA` / `200 MEGAPIXEL | f/1.5`).
- Gyan: glass pill, Poppins SemiBold, fill `#DCE9F7` at 72% opacity, 22 px radius, white text,
  left-to-right wipe in 450 ms. Line 1 is the bold value, `sub` is the lighter descriptor
  (`6500 mAh` / `Battery`). Up to 3 lines, 26 characters per line.
- One label per shot. Prices get their own shot (`Offer Price - Rs 36,999`).

**Call to action (`cta`)** - last 3 s (jay) or 3.5 s (gyan), on the talking head:
- Jay: pill at Y = 77%, first `#FFF3A6` with the save prompt, then `#C9F2D4` with the share
  prompt, 1.5 s each, dark text `#111111`, Poppins Bold. Original wording: "MERKEN?" / "UND TEILEN",
  or "MEINUNG?" / "KOMMENTARE" (lavender `#C9C2F5` then mint).
- Gyan: subscribe card at Y = 72% (channel avatar, name, red subscribe button).

In ffmpeg/libass terms the caption is `\an5\pos(540,922)\fnLilita One\fs150\bord0` over a blurred
black copy (`\blur14\bord6`, alpha `&H6E&`) with `\fscx72\fscy72\t(0,130,\fscx100\fscy100)`.
`edit.py` generates this; edit the preset rather than the script.

## 5. B-roll and overlay triggers

Scan the transcript and add entries to `broll` (files from the user's `broll/` folder) or `labels`.

| Transcript contains | Add |
|---|---|
| Product name, first mention | full-screen product shot 2-4 s + label with the name |
| Spec with a unit (mAh, MP, Hz, W, GB, nits, nm, inch) | product close-up + label `VALUE` / descriptor |
| Price or discount | price label on its own shot, `ding` SFX |
| "compared to", "vs", two product names | split screen: `left_half` + `right_half`, name labels at top; or `top_half` + `bottom_half` |
| App, website, article, setting | screen recording or screenshot, full screen, 2-5 s |
| Camera, photo quality | 4-6 sample photos, 1 s each |
| Joke, sarcasm, exaggeration | 1-1.5 s meme/reaction clip, full screen, original audio muted |
| "first", "second", "number three" | numbered badge label (`1`, `2`, ...) on the talking head |
| Opinion, verdict, question to viewer | return to talking head + emphasis captions (jay) |
| Sponsor or offer | full-screen poster 4-5 s near the end, before the CTA |

Layouts accepted by the script: `full`, `top_half`, `bottom_half`, `left_half`, `right_half`.
Entry format: `{"start": 12.4, "end": 15.0, "file": "broll/camera.mp4", "layout": "full"}`.
If the user supplied no B-roll, say so, keep the talking head, and lean on zooms and labels
instead - do not invent footage.

## 6. Audio and SFX cue sheet

Measured from the references: integrated loudness -12.5 to -14.7 LUFS (two Gyan clips at -10.5),
loudness range 1.4-3.9 LU, so the voice is heavily compressed and music never rises above it.
A sharp transient coincides with 40-50% of cuts in Jay's videos and 20-30% in Gyan's.
The analysis could not listen to the audio, so the *type* of each sound below is the standard
choice for that visual event, not a transcription.

| Element | Level | When |
|---|---|---|
| Voice | normalised to **-14 LUFS**, true peak **-1.0 dB**, high-pass 80 Hz, 3:1 compression | always |
| Music bed | **-20 dB** (jay) / **-22 dB** (gyan) under the voice, sidechain-ducked 6:1, 1 s fade-out | start to end, no gaps |
| Whoosh | -12 dB | frame 0; every cut from talking head to B-roll in the hook; flash-cut bursts |
| Pop | -14 dB | first caption of each caption burst; CTA pill appearing |
| Click / tick | -16 dB | each label or pill wipe-in; each line of a spec list |
| Ding | -12 dB | prices, the CTA |
| Riser | -14 dB, 1 s | leading into the verdict or the biggest reveal, ending on the cut |

Place every SFX 30 ms **before** its visual. Aim for one SFX per 1.5-2.5 s (jay) or 3-4 s (gyan);
never two inside 0.25 s. Entry format: `{"t": 4.06, "name": "pop"}`, optional `"db": -10`.

## 7. Checks before you hand over

- Duration, 1080x1920, 30 fps, audio present (`ffprobe`).
- Loudness within 1 LU of -14 (`ffmpeg -i out.mp4 -af ebur128 -f null -`).
- Look at frames from 0.3 s, 2 s, one caption, one label, one B-roll, and the CTA: text inside
  the frame, not covering the face, no overlapping captions and labels.
- No visual gap longer than the limit in section 1.
