# Laptop review editing reference

Source: Gyan Therapy, Samsung Galaxy Book 6 Pro short (32.6 s cut). 8 screenshots in `frames/`.

Measured: 11 cuts, average shot 2.7 s (longest 5.6 s), 1 pause over 0.12 s, loudness -14.2 LUFS
(range 3.0 LU). The talking head appears only in the last 2.7 s.

## Timeline

| Time | On screen | Text style |
|---|---|---|
| 0.0-3.0 s | Laptop on a white table. Five-line display block: `14" WQXGA+ 120Hz` / `Dynamic AMOLED 2X Touchscreen Display` / `2800 x 1800 Pixel Resolution` / `Brightness 500 Nits` / `HDR Brightness 1000 Nits` / `Adobe RGB, DCI-P3 and sRGB profiles support`, curved arrow from the screen to the text | dark grey text, bold values, lines fade in top to bottom |
| 3.0-6.5 s | Hand pointing at the screen. Pill `120Hz Refresh rate` | grey glass pill, bold value + light descriptor |
| 6.5-9.1 s | Lid shot, slow orbit. Pill `Samsung Galaxy Book 6 Pro` | grey glass pill |
| 9.1-14.7 s | Over-the-shoulder typing. Plain text builds line by line: `Intel Core Ultra X7 358H` / `( 16 cores aur 16 threads )` / `32GB LPDDR5X RAM` / `( 9600 MT/s speed )` | dark red `#7A1022`, bold lines + thin bracketed lines, typewriter |
| 14.7-16.5 s | Sticker close-up. Pill `Intel Arc integrated GPU` | grey glass pill |
| 16.5-19.2 s | Task Manager. Pill `50 TOPS NPU` | grey glass pill |
| 19.2-21.3 s | Lid shot. Pill `67Wh Battery` | grey glass pill |
| 21.3-23.3 s | Charger cable. Pill `65W Charging` | grey glass pill |
| 23.3-25.4 s | Quick settings. Two pills side by side: `Wi-Fi 7`, `Bluetooth 5.4` | grey glass pills |
| 25.4-27.5 s | Top/bottom split of the two sides. Port callouts with thin white vertical lines: `HDMI 2.1 (Supports 8K@60Hz, 5K@120Hz)`, `Thunderbolt 4` (bracket over two ports), `USB-A 3.2`, `3.5mm` + headphone/mic icons | bold white, small sub-line |
| 27.5-29.9 s | Hand pointing at prices. Pill `Price - ₹ 2,14,990` | grey glass pill |
| 29.9-32.6 s | Talking head. Subscribe bar at 65% height: YouTube icon circle, white bar with avatar, channel name + verified tick, handle, red `SUBSCRIBE` button; a hand cursor clicks and it turns grey `SUBSCRIBED` | flat white with hard black offset shadow |

## Design details

- **Grey glass pill** is the workhorse: one per shot, always at the same place (y about 20%,
  centred), left-to-right gradient from light grey `#C9CCD6` to slate `#5B6377`, about 85%
  opaque, 10 px radius, white text. Text types on left to right in about 0.5 s and the pill
  width is fixed from the start. Holds for the whole shot (2-3.5 s).
- Spec language mixes Roman Hindi into the card (`16 cores aur 16 threads`).
- Every B-roll shot has slow camera movement (push, orbit or slide); none is static.
- The pill never overlaps the laptop: shots are framed with the product in the lower 60%.
- Subscribe bar here is a different design from the glass card in the phone videos.

## Card mapping in this skill

`pill` with `top`/`bottom` set to greys covers the main label (the skill's gradient runs top to
bottom, the reference runs left to right). `text` covers the processor block and the display
block. Not available: port callout lines, split-screen callouts, the subscribe bar design,
the curved arrow.
