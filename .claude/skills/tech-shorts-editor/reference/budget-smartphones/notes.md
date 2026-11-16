# Budget smartphones editing references

Category for multi-phone "deals / best phones under a price" videos. Source: Gyan Therapy's
Motorola offer short (the 21 s cut in this folder, plus frames from the full 80 s version).

## Files

- `budget_smartphones_editing_references.mp4` - 21 s reference clip (1080x1920, 30 fps).
- `frames/*.webp` - the four screenshots supplied as files (g37 Power sheet, three subscribe states).
- `frames/*.jpg` - the other supplied screenshots, re-cut from the videos at the same moments
  (the originals arrived inline and were not stored as files). Names say what each shows.

## Structure of the reference (per-product loop)

| Time | What is on screen | Card to use |
|---|---|---|
| 0.0-3.3 s | Creator fans out the phones. `₹15K` pops in (green), then `₹60K` (cyan) with a curved arrow between them. Brand logo, then sale logo, pops in above his head. | `price` (y 0.72); logos = PNGs from `broll/` |
| 3.3-4.2 s | Close talking-head line, slow push-in | zoom 1.0 -> 1.12 |
| 4.2-5.6 s | Full-screen sale poster (1.4 s) | b-roll image, `full` |
| 5.6-7.9 s | Product hero shot. Top-left name tag + yellow progress bar start. Title: thin brand line, then the model in italic serif over a colour bar that wipes in first | `tag` with `progress`, `product` |
| 7.9-15.7 s | Four B-roll shots of about 2 s (gaming, scrolling). White spec card types on line by line at 8.8 s and stays about 3.5 s | `spec` with `style: white` |
| 15.7-17.8 s | Full-screen spec sheet, 2.1 s. Rows are already there; the price types on over about 0.6 s | `sheet` |
| repeat | Title -> B-roll + spec card -> sheet, for each phone (5 phones in 80 s: about 13 s each) | |
| last 3 s | Talking head with subscribe card: white "Subscribe" -> pink "Subscribing" as a cursor clicks -> white "Subscribed" with sparkles | `subscribe` |

Cuts in the 21 s clip: 3.33, 4.17, 5.60, 7.93, 10.20, 12.13, 13.60, 15.70, 17.80 s (average shot
1.8 s). Loudness -14.4 LUFS, range 2.5 LU.

## Design details

- **Tag**: white rounded rectangle, bold italic black text, top-left (x 5%, y 6.6%), on screen
  for the whole product segment. The yellow bar along the top edge grows left to right over the
  segment and resets for the next product.
- **Product title**: brand in thin white sans, about 100 px; model in italic serif, slightly
  larger, overlapping the top half of a colour bar. Bar colour follows the phone colour
  (dark green, blue, sage, lilac, light blue); text is white, or dark on a pale bar.
- **White spec card**: white, 34 px corner radius, left-aligned, 3 lines, bold italic value +
  regular italic descriptor (`Dimensity 8500 (4nm)` / `LPDDR5X RAM` / `UFS 4.1 Storage`). y about 22%.
- **Spec sheet**: background tint = pale version of the phone colour; bottom band and name chip
  = dark version of it; price value in the same dark colour. Seven rows, each with a small
  round icon. Torn-paper edges on the white list panel, and two store tags hanging on strings
  that swing in. Tints seen: sage `#DDE5C9`, mint `#D5EDE6`, pink `#E3CCD3`, sand `#E6DDC4`,
  lilac `#D9D0E6`.
- **Price text**: heavy italic, white-to-colour vertical gradient, outline in the strong
  version of the same colour (green outline on green, blue on cyan).

## What the skill reproduces and what it does not

Reproduced: tag + progress bar, product title, white spec card, spec sheet with tinted bands
and typed-on price, price text, three-state subscribe button.

Not reproduced: row icons (dots instead), torn-paper edges, hanging store tags, the curved
arrow, sparkles and the cursor on the subscribe card. Logos and posters must be supplied as
image files.

## Second reference: `smartphone_review_editing_reference.mp4` (Samsung Galaxy S24, 19.2 s)

Measured: 9 cuts, average shot 1.6 s, no pauses over 0.12 s, loudness -10.3 LUFS (range 1.1 LU),
1080x1920. No talking head after the first second; no subscribe card in this cut.

| Time | On screen | Text style |
|---|---|---|
| 0.0-1.2 s | Creator pushes the phone to the lens. `This / SAMSUNG / Phone` top-right, hand-drawn curved arrow pointing at the phone | small thin + heavy black + small thin, dark text |
| 1.2-3.0 s | Hands-on scrolling. `SNAPDRAGON / 8 GEN3` top centre | heavy rounded caps, lavender `#8E86C9`, letters fly in scrambled then settle |
| 3.0-5.0 s | Camera close-up. Three callouts `12MP Ultrawide`, `50MP Main OIS`, `10MP 3x Telephoto OIS`, right-aligned on the left, thin white lines to each lens | bold white value, lighter descriptor below |
| 5.0-5.9 s | `7 GEN / OS Updates` over the phone | heavy black + regular black |
| 5.9-8.7 s | `4000mAh / Battery` with white glow; a cyan "liquid" fills the back of the phone | glowing white, types on |
| 8.7-10.3 s | `6.2" FHD+ 120Hz` / `LTPO Dynamic AMOLED 2x` / `2600Nits Peak Brightness` / `Gorilla Glass Victus 2` | white, one highlighted value in mint |
| 10.3-11.6 s | `Samsung Galaxy / S24` | white rounded, handwriting-style write-on |
| 11.6-14.3 s | Full-screen offer card: red `Offer Price` box, `8/128GB`, big grey `₹39,999`, product render, sale badge top-right, footnote `* Price incl. Card Discount` | price digits roll in |
| 14.3-19.2 s | Camera demo. `128GB - UFS3.1` / `256GB - UFS4.0` top | heavy black, 2 lines |

Pattern: one spec per shot, text sits in the top 30% above the product, each text style is
chosen to contrast with the backdrop (dark text on light, white on dark or colourful).
Colour of text is often picked from the scene (lavender on grey blinds, mint on teal).
