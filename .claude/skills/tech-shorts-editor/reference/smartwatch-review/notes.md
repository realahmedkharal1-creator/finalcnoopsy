# Smartwatch review editing reference

Source: Gyan Therapy, Samsung Galaxy Watch Ultra 2 "5 changes" short (27.1 s cut; the full
68 s version was analysed earlier as clip 11 in `../forensics.md`). 4 screenshots in `frames/`.

Measured: 7 cuts, average shot 3.3 s (longest 6.2 s), no pauses over 0.12 s, loudness
-13.4 LUFS (range 1.9 LU). No talking head in this cut.

## Timeline

| Time | On screen | Text style |
|---|---|---|
| 0.0-0.8 s | Wrist close-up. `5 Changes` handwritten, writes on | neon script, pink-to-blue gradient with glow |
| 0.8-2.8 s | Two watches held side by side. `Galaxy Watch Ultra2 / 10.7mm - Thickness` top, `Galaxy Watch Ultra / 12.1mm - Thickness` bottom, curved hand-drawn arrows from each crown to its label | condensed heavy italic, royal blue `#1F4FA3` |
| 2.8-5.8 s | Watch on wrist outdoors. `5000Nits / Peak Brightness` | white with a mint-to-white shimmer sweep |
| 5.8-8.2 s | Full-screen manufacturer web page; the headline gets a yellow highlighter sweep, page scrolls slowly | screenshot + animated highlight |
| 8.2-10.6 s | Watch on charger, top-down. `800mAh / Battery` | condensed heavy italic blue, letters type on |
| 10.6-16.8 s | Watch in hand, UI demo. `Snapdragon / wear Elite / 2GB RAM / 64GB Storage` | white rounded, two bold lines + two light lines |
| 16.8-20.6 s | Side macro. Lower third: `Professional Diving Certification (EN13319)` / big `IP69K` / `10 ATM Water resistance` | thin dark lines around a huge sand-coloured `IP69K` |
| 20.6-27.1 s | Top-down on fabric. White card builds in three steps: `Price - ₹64,999` (21 s), `₹3,500 Card Discount` (23.5 s), `Offer Price - ₹61,499` (24.5 s) | white frosted card, 26 px radius, black text, bold prices |

## Design details

- Shots are longer than in phone videos (3.3 s average) because the product is small and each
  shot shows a UI interaction.
- Text placement changes per shot instead of staying at the top: top for wrist shots, lower
  third when the watch is in the upper half, top and bottom for the comparison.
- Text colour is sampled from the product or scene: blue on grey fabric, sand on a warm table.
- The price card stays 6.5 s and grows line by line in sync with the voice.
- Numbered blue badges (1-5) on the talking head separate the points in the full version.

## Card mapping in this skill

`display` (with `color`) for big spec text, `text` for the multi-line chip block, `spec` with
`style: white` for the price card, `badge` for the numbers. Not available: handwriting write-on,
shimmer sweep, highlighter sweep on screenshots, curved arrows, condensed italic font.
