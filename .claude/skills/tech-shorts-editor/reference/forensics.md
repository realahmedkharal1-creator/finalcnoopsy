# Forensic log - 11 reference shorts

Method: ffmpeg scene detection (threshold 0.25) for cuts, `silencedetect` (-38 dB, 0.12 s) for
pauses, EBU R128 for loudness, spectral-flux peaks above 3 kHz for transients, ORB feature
matching for in-shot zoom, faster-whisper for word counts, and visual review of contact sheets
(2 fps for the first 24 s, 1 fps after) plus frame-by-frame strips of caption animations.

Limits: the audio was measured, not listened to, so SFX types and music genre are unknown.
Scene detection misses whip-blur and dissolve transitions, so shot lengths are upper bounds.
Fonts were identified by eye; hex colours are approximate. All files were 1080x1080 with 9:16
pixel aspect (displayed as 9:16), about 30 fps.

## Batch 1

| # | Clip | Creator | Length | Cuts | Avg shot | Cuts < 0.6 s apart | Pauses > 0.12 s | LUFS | LRA | Words |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Pixel 11 vs 11 Pro | Jay | 84.3 s | 52 | 1.59 s | 11 | 2 | -13.4 | 2.2 | 242 (de) |
| 2 | ColorOS 17 | Gyan | 91.5 s | 34 | 2.61 s | 0 | 3 | -14.4 | 3.9 | 208 (hi) |
| 3 | Subscription trend (sponsored) | Jay | 72.9 s | 22 | 3.17 s | 1 | 1 | -12.9 | 2.6 | 221 (de) |
| 4 | Galaxy Z Fold 8 | Jay | 77.1 s | 39 | 1.93 s | 11 | 2 | -12.5 | 2.5 | 231 (de) |
| 5 | Oppo Find X10 Pro Max | Jay | 80.8 s | 44 | 1.80 s | 12 | 2 | -13.3 | 2.5 | 207 (de) |

- Pacing: Jay's sub-0.6 s cuts come in bursts of 3-4 cuts within 0.1 s (clip 1 at 12.6 s, 31.0 s,
  57.3 s; clip 4 at 5.9 s, 21.4 s, 37.8 s, 56.7 s; clip 5 at 17.1 s, 65.3 s) - flash transitions.
  Hook: first cut at 3.94 s / 3.50 s / 2.03 s / 2.67 s. Meme inserts at 11.4 s (clip 1), 5.0 s
  (clip 4), 16.0 s (clip 5), each about 1 s.
- Zoom: clip 1 opens with a zoom-blur settle over the first 12 frames. Jay's talking-head shots
  drift 1-8% (handheld plus slow push); product shots show push-ins of 1.2-1.5x (clip 1,
  47-49 s). Gyan's hook (clip 2, 0.9-5.8 s): four shots with 1.22x-1.45x push-ins each.
- Captions, Jay: white uppercase display font, no stroke, soft shadow, centre at about 48% height.
  One word per screen on the talking head only (`EXAKT` / `0 MAL` / `BENUTZT`; `KEIN` / `FAN` /
  `SOFTWARE`). Hook title two lines (`LUXUS` / `LOHNT SICH NICHT`, `HANDY` / `KOSTEN` + emoji).
  Pop-in with white glow over about 4 frames. Spec titles on B-roll at the top (8-18% height):
  `HAUPT KAMERA` / `200 MEGAPIXEL` / `f/1.5 | 1/1.3 ZOLL`, `7.150 mAH AKKU`, `TENSOR G6`.
  Clip 4 uses a heavier geometric face (`TAKE`, `MONEY`, `GEIL`, `MAN` - the last two oversized,
  behind and around the product).
- Captions, Gyan: none for speech. Top-centre labels on B-roll (`Living Flow Design` /
  `Six Years Fluidity`, `Luminous Effect`, `AI Mind Pilot`) in rounded tinted pills at about
  12% height, held 5-10 s.
- B-roll: Jay about 70% B-roll - top-down handheld product on a textured backdrop, vertical
  50/50 splits with name labels (`PIXEL 11` | `PIXEL 11 PRO`, `+200 EUR AUFPREIS`), top/bottom
  stacks, stacked bank-statement cards animating in one by one (clip 3), donut chart graphic,
  store-page screenshots, sample-photo run (6 photos, 1 s each). Gyan: article screenshot with
  animated highlight (6-8 s), roadmap graphic, long UI demos.
- CTA: Jay - icon circle pops at 77% height, expands to a pale-yellow pill `MERKEN?`, then mint
  `UND TEILEN` (clips 1, 3); lavender `MEINUNG?` then mint `KOMMENTARE` (clips 4, 5). Last 3 s.
  Gyan - subscribe card with avatar, last 3 s.
- Sound: transients 1.4-1.7 per second; a transient within 0.12 s of 16/52, 12/22, 19/39,
  23/44 cuts (Jay) and 7/34 (Gyan). Continuous low-frequency energy in Jay's clips (music bed
  never drops out); quieter bed in Gyan's.

## Batch 2 (all Gyan Therapy)

| # | Clip | Length | Cuts | Avg shot | Cuts < 0.6 s apart | Pauses > 0.12 s | LUFS | LRA |
|---|---|---|---|---|---|---|---|---|
| 6 | Motorola offer deal | 80.5 s | 42 | 1.87 s | 1 | 2 | -14.7 | 3.7 |
| 7 | Moto G Max | 66.2 s | 22 | 2.88 s | 0 | 0 | -13.2 | 3.4 |
| 8 | Galaxy Book 6 Pro | 65.3 s | 28 | 2.25 s | 0 | 6 (5 in the first 3.2 s) | -13.8 | 2.2 |
| 9 | Samsung Snapdragon comeback | 59.8 s | 31 | 1.87 s | 3 | 1 | -10.3 | 1.7 |
| 10 | "This phone in 2026" | 55.2 s | 25 | 2.12 s | 4 | 0 | -10.6 | 1.4 |

- Pacing: steady 1.9-2.9 s shots; a run of six 0.6-0.8 s shots at 34.6-39.3 s (clip 7) and
  36.1-38.7 s (clip 10) for camera samples. Clip 8 opens with a beat-synced stutter.
- Hook: creator holding products at the lens from frame 0; price text `Rs 15K` -> `Rs 60K`
  (green and cyan italic, lower third), brand logo at top, `SAMSUNG` wordmark. Clip 10 shows
  the spoken hook as glass word pills, two per screen, at about 60% height for 3 s.
- Labels: glass pills at 12-20% height with a bold value and light descriptor
  (`6500 mAh Battery`, `45W Charging`, `UFS 2.2 Storage`, `120Hz Refresh rate`), wipe-in about
  0.5 s. Three-line spec cards (`Snapdragon 6s Gen 4` / `LPDDR5X RAM` / `UFS 3.1 Storage`) held
  up to 6 s. Callout lines to camera lenses (`50MP Main`, `8MP Ultrawide`). Text orbiting the
  product (`Connectivity`: Wi-Fi 6, BT 5.4, NFC...).
- Overlays: full-screen spec-sheet card per product with a typed-on `Offer Price - Rs 36,999`
  (clip 6: five products, each about 2 s), small product tag top-left with a yellow progress
  line along the top edge (clip 6), sale poster 4-5 s before the CTA, selfie/sample grids.
- Sound: transients 1.3-1.7 per second; within 0.12 s of 10/42, 7/22, 8/28, 8/31, 6/25 cuts.

## Batch 3 (Gyan Therapy)

| # | Clip | Length | Cuts | Avg shot | Cuts < 0.6 s apart | Pauses > 0.12 s | LUFS | LRA |
|---|---|---|---|---|---|---|---|---|
| 11 | Galaxy Watch Ultra 2 | 68.4 s | 27 | 2.44 s | 6 | 3 | -13.6 | 2.5 |

- Hook: three macro product shots in 2 s (cuts at 1.07, 1.47, 1.90 s), handwritten neon script
  title writing on (`Samsung Galaxy ... 5 Changes`) over the talking head.
- Structure: numbered list - blue circular badge `1`-`5` at the top (7% height) on the talking
  head as he counts on his fingers, each followed by 4-8 s of B-roll with one label.
- Labels: `5000Nits` / `Peak Brightness`, `800mAh` / `Battery` (condensed italic, typed on),
  `Snapdragon wear Elite` / `2GB RAM` / `64GB Storage`, `IP69K`, price card typed on line by
  line (`Price - Rs 64,999` / `Rs 3,500 Card Discount` / `Offer Price - Rs 61,499`).
- Overlays: article screenshot with yellow highlighter sweep, older-video thumbnail card
  sliding up in the lower third, product poster before the CTA, subscribe card for the last 4 s.

## Cross-batch summary

| Metric | Jay (clips 1, 3, 4, 5) | Gyan (clips 2, 6-11) |
|---|---|---|
| Length | 73-84 s | 55-91 s |
| Average shot | 1.6-1.9 s (3.2 s sponsored) | 1.9-2.9 s |
| Flash-cut bursts | 2-4 per clip | 0-1 per clip |
| Speech rate | 2.6-3.0 words/s | 2.3-3.6 words/s (clips 2, 7, 8) |
| Pauses > 0.12 s | 1-2 including the tail | 0-3, tail included |
| Loudness | -12.5 to -13.4 LUFS | -13.2 to -14.7 LUFS (two at -10.5) |
| Cuts with a transient | 31-52% | 21-33% |
| Speech captions | single white words on talking head | none (hook pills once) |
| Labels | display font, top, stacked | glass pills, top, value + descriptor |
| CTA | two colour pills, last 3 s | subscribe card, last 3-4 s |
