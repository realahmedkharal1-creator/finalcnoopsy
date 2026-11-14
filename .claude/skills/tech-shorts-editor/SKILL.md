---
name: tech-shorts-editor
description: Edit a raw talking-head tech video into a finished short (9:16) or long (16:9) video in the Gyan Therapy style (default) or DasIstJay style - dead-air removal, word-level transcription, zooms, B-roll, and animated motion-graphic cards (glass spec pills, spec cards, spec sheets with price, price text, hook word pills, numbered badges, big titles, subscribe card), SFX and ducked music. Use when the user asks to edit, cut, caption, add cards/graphics to, or "make a short/reel" from a video file.
---

# Tech Shorts Editor

`scripts/edit.py` does the mechanical work (Python + ffmpeg + Pillow). **You** make the editorial
decisions by rewriting `work/<video name>/plan.json` between the `plan` and `render` stages.
The numbers below were measured from 11 reference shorts (7 Gyan Therapy, 4 DasIstJay); raw
measurements are in `reference/forensics.md`.

## 0. Workflow

The user is a beginner on Windows. Run Python as `py` (macOS/Linux: `python3`). Always quote paths.

```bash
py -m pip install faster-whisper numpy pillow      # once; ffmpeg must be installed too
py .claude/skills/tech-shorts-editor/scripts/edit.py cut        "C:\path\video.mp4" --preset gyan
py .claude/skills/tech-shorts-editor/scripts/edit.py transcribe "C:\path\video.mp4" --lang ur
py .claude/skills/tech-shorts-editor/scripts/edit.py plan       "C:\path\video.mp4" --preset gyan
#  -> read work/<name>/words.json, rewrite work/<name>/plan.json using sections 1-6
py .claude/skills/tech-shorts-editor/scripts/edit.py render     "C:\path\video.mp4"
py .claude/skills/tech-shorts-editor/scripts/edit.py demo       # preview of every card type
```

1. Preset: `gyan` unless the user asks for `jay`. Orientation follows the input
   (`--format vertical|horizontal` to force). Long horizontal videos use the same rules.
2. Run `cut`, `transcribe`, `plan`. The auto plan is a rough baseline, not the edit.
3. Read `words.json`, then rewrite `plan.json`: cards, zooms, B-roll, SFX (sections 2-6).
   All on-screen text must be in **Latin letters** (Roman Urdu/Hindi or English). Whisper often
   returns Urdu or Devanagari script; transliterate it yourself. The auto plan drops such cards.
4. `render`, then extract 6-8 frames with ffmpeg and look at them. Fix and render again.
5. Report: output path, seconds of dead air removed (in `work/<name>/meta.json`), cards added,
   and anything you could not do. If a command fails, fix the cause and continue.

Files the user can put next to the video: `broll/` (clips, screenshots, product PNGs with
transparent background), `bgm.mp3`, `avatar.png` (channel picture for the subscribe card).
Set the channel name once in `presets/gyan.json` under `channel`. Custom sounds: `whoosh.wav`,
`pop.wav`, `click.wav`, `ding.wav`, `riser.wav` in the skill's `sfx/` folder replace the
synthesised placeholders.

If the user only asks for one thing ("add a spec card at 12 s", "put a price here"), edit
`plan.json` for that and re-run `render`; do not redo the whole edit.

## 1. Pacing and cuts

| Rule | Gyan | Jay |
|---|---|---|
| Final length (short) | 55-91 s | 73-84 s |
| Average shot length | 1.9-2.9 s | 1.6-1.9 s |
| Longest shot | 10 s (one continuous screen demo) | 6 s |
| Flash-cut bursts (3-4 cuts in 0.1 s) | 0-1 per video | 2-4, on topic changes |
| Speech rate | 2.3-3.6 words/s | 2.6-3.0 words/s |
| Pauses over 0.12 s left in | 0-3 | 1-2 |

- Remove every pause of 250 ms or more below -35 dB, keep 60 ms padding each side (preset `cut`).
  Delete false starts and repeated takes by hand: keep the last take.
- Speech starts within 0.2 s of the first frame. Tail after the last word: 0.4-0.7 s.
- Something must change on screen (cut, zoom, card in or out) at least every 3 s (gyan) / 2 s (jay).
- Talking head is on screen about 30% of the time: it returns every 8-12 s for 1-4 s.

## 2. The first 3 seconds

**Gyan (default)**
- 0.0-1.0 s: creator already holding the product near the lens, mid-gesture.
- A `price` card in the lower third when the hook is about money (`₹15K` then `₹60K`), or a brand
  or product name as a `display` card at the top.
- Optional `words` cards: the spoken hook, two words per screen, at 60% height, first 3 s only.
- 1-5 s: three or four shots of 0.8-1.8 s, each with a fast push-in (1.22-1.45x within the shot).
- 5-6 s: `whoosh` and cut into the first B-roll or a full-screen source screenshot.

**Jay**
- 0.0-0.4 s: zoom-blur settle 1.25x -> 1.0x plus a whoosh.
- 0.15-3.5 s: `display` card at centre: one big keyword (size 190) and a `sub` line of at most 20 characters.
- First B-roll cut between 2.0 and 3.9 s; optional 1 s meme clip at 5-6 s.

## 3. Zoom matrix

Talking head framing: chest-up, top of head at 8-12% of frame height, eyes at 25-30%.

| Trigger | Action | `zooms` entry |
|---|---|---|
| Emphasis word, number, price, product name | punch to 1.12x from 50 ms before the word to sentence end | `{"start":s,"end":e,"from":1.12,"to":1.12}` |
| Neutral sentence over 2 s | creep 1.0 -> 1.08x | `{"from":1.0,"to":1.08,"ease":"linear"}` |
| New sentence, return from B-roll | back to 1.0x: leave a gap between entries | none |
| Question to viewer, punchline | 1.20x for at most 1 s | `{"from":1.2,"to":1.2}` |
| Gyan hook shots | 1.0 -> 1.3x across a 0.8-1.8 s shot | `{"from":1.0,"to":1.3,"ease":"out"}` |
| B-roll clip | slow push 1.04x (gyan) / 1.06x (jay), automatic | `zoom_to` on the b-roll entry |

Entries must not overlap. Alternate punch, static, creep; never two punches in a row.

## 4. Card catalogue

Every card: `{"type": ..., "start": seconds, "end": seconds}` plus the fields below. Optional on
any card: `"x"` and `"y"` (centre, 0-1 fraction of the frame), `"scale"` (1.0 = default size).
In text, `*asterisks*` mark the bold part: `"*6500 mAh* Battery"`. Use `₹`, `Rs` or `$` freely.

| Type | Looks like | Fields | Default y | Use for |
|---|---|---|---|---|
| `pill` | blue glass pill, bold value + light descriptor, wipes in | `text` (string, or list for stacked pills that appear one by one); optional `top`, `bottom` colours | 0.16 | one spec per B-roll shot: `"*45W* Charging"` |
| `pill` + `fill` | solid colour pill, dark text, pops in | `text`, `fill` (hex) | set `y` | calls to action: `SAVE THIS?` `#FFF3A6`, `& SHARE` `#C9F2D4` |
| `spec` | mint glass card, 2-4 centred lines | `lines` (list, with `*bold*` parts) | 0.20 | chipset + RAM + storage together |
| `sheet` | full-screen spec sheet: product image, name chip, bullet rows, price pill | `title`, `rows` (up to 8), `price` (`"Offer Price - ₹36,999"`), optional `image` (PNG path), `tint` (pale hex) | full screen | product summary, 2-3 s each; one per product in a deal list |
| `price` | huge italic gradient numbers with white outline | `lines` (1-2 strings, or `{"text","color"}` with color green, cyan, yellow, red, white, purple) | 0.68 | price ranges in the hook, discounts |
| `words` | one glass pill per word, each pops on its own time | `words`: `[{"text":"KYA","t":0.0},{"text":"AAPNE","t":0.35}]` (`t` = seconds after card start) | 0.60 | hook only, max 2-3 words per card |
| `display` | big display lettering with soft shadow, pops in | `text` (string or list of lines), optional `sub`, `color` (hex or gradient name), `size` (150 default) | 0.48 | product/chip names at top (`y` 0.13), Jay one-word captions, hook titles |
| `text` | plain line of text, wipes in | `text`, optional `sub`, `color`, `size`, `align` | 0.14 | quiet captions over clean B-roll (dark colour on light backgrounds) |
| `badge` | numbered blue circle | `text` (`"1"`) | 0.07 | "first... second..." lists, on the talking head |
| `subscribe` | glass card: avatar, channel name, tagline, button that turns to "Subscribed" | optional `name`, `tagline`, `avatar`, `button`; defaults from the preset | 0.72 | last 3-4 s |

Rules for cards:
- One idea per shot. A card stays 3-3.5 s or for the whole shot (specs up to 6 s, sheets 2-3 s).
- Top cards sit at y 0.12-0.20 so they never cover the product. On the talking head keep
  cards below the chin (y 0.48 or lower) or above the head (y 0.07).
- Text is values and names, never sentences: 26 characters per line at most.
- Gyan style has no running subtitles. Jay style: single `display` words, UPPERCASE, only on
  the talking head, 0.4-1.1 s each, at most three in a row, never over B-roll.
- Captions are white. Do not add yellow/green karaoke highlighting unless the user asks.
- Horizontal (16:9) video: keep top cards at y 0.12-0.18 and use `x` 0.25 or 0.75 to place a
  card beside the speaker instead of over them.

## 5. What to add where

Scan the transcript and add cards and B-roll (files from the user's `broll/` folder).

| Transcript contains | Add |
|---|---|
| Product name, first mention | full-screen product shot 2-4 s + `display` card at y 0.13 |
| Spec with a unit (mAh, MP, Hz, W, GB, nits, nm, inch) | `pill`: `"*VALUE UNIT* Descriptor"`, plus `click` |
| Three related specs in one breath | `spec` card with three lines |
| Price, offer, discount | `price` card (hook) or `pill` (`"*Price* - ₹64,999"`), plus `ding` |
| Full product recap or a list of deals | `sheet` per product, 2-3 s each |
| "vs", "compared to" | two B-roll clips, `left_half` + `right_half`, name `pill` on each side (`x` 0.25 / 0.75) |
| App, website, article, setting | screenshot or screen recording, full screen, 2-5 s |
| Camera quality | 4-6 sample photos, 1 s each |
| "first", "second", "number three" | `badge` on the talking head |
| Joke or exaggeration | 1-1.5 s meme clip, full screen |
| End of video | `subscribe` card for the last 3.5 s (jay: two colour pills) |

B-roll entry: `{"start": 12.4, "end": 15.0, "file": "broll/camera.mp4", "layout": "full"}`;
layouts: `full`, `top_half`, `bottom_half`, `left_half`, `right_half`. If there is no B-roll,
say so and rely on zooms and cards. Never invent footage, specs or prices: every value on a
card must come from the transcript or from the user.

## 6. Audio and SFX

Reference loudness: -12.5 to -14.7 LUFS, loudness range 1.4-3.9 LU. A sharp sound lands on
20-30% of Gyan's cuts and 40-50% of Jay's. The audio was measured, not listened to, so the
sound *types* below are the conventional choice for each event.

| Element | Level | When |
|---|---|---|
| Voice | -14 LUFS, true peak -1.0 dB, high-pass 80 Hz, 3:1 compression | automatic |
| Music | -22 dB (gyan) / -20 dB (jay) under the voice, ducked 6:1, 1 s fade-out | `bgm.mp3`, whole video |
| `whoosh` | -14 dB | frame 0; cuts into B-roll during the hook; sheet appearing |
| `pop` | -16 dB | `words`, `badge`, `price`, colour pills |
| `click` | -16 dB | `pill`, `spec`, `text` wiping in |
| `ding` | -12 dB | prices, subscribe card |
| `riser` | -14 dB, 1 s | before the verdict, ending on the cut |

SFX entry: `{"t": 4.06, "name": "pop"}` (optional `"db"`). The script already plays each sound
30 ms early. One sound per 3-4 s (gyan) or 1.5-2.5 s (jay); never two inside 0.25 s.

## 7. Checks before handing over

- `ffprobe`: duration, size (1080x1920 or 1920x1080), 30 fps, audio present.
- Loudness within 1 LU of -14: `ffmpeg -i out.mp4 -af ebur128 -f null -`.
- Frames at 0.3 s, 2 s, each card type used, one B-roll, the last 2 s: text inside the frame,
  nothing over the face, no two cards overlapping, no empty boxes (missing glyphs).

## Limits

- Cards are drawn flat: no background blur behind the glass, no 3D text orbiting a product,
  no hand-drawn callout lines to camera lenses, no handwriting-style write-on.
- Fonts are Poppins and Lilita One (Latin only). Reference fonts and colours were matched by eye.
