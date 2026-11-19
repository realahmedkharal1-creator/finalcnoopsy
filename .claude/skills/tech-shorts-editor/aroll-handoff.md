# A-roll batch edit: handoff notes

Goal: edit the 17 A-roll videos one at a time, user approves each, then the next.
Done: Honor Magic 9 Pro Max (approved), Moto G77 (approved), Moto G 5G 2025 (v4 sent, awaiting approval).
Next: Infinix Note 60 Pro, then Vivo V80, Pova vs POCO M8, Honor Play 20C, Nubia Neo 5, Find X10 Pro Max, gaming phones, iPhone 15, POCO trio, Pixel 9a (splice voice patch), S26 FE, S26 FE vs S25 FE, Origin OS 7. Reno 16F A-roll is missing.

Per-video recipe (scratchpad job folder per phone, copy build.py from an approved one):
1. words.json via faster-whisper (numpy array input); silencedetect for tiny cuts.
2. B-roll from reference/broll-library/NN.json; contact strips; grid overlay to set `center` per shot.
3. Landscape device clips -> split_top. Product centred. No creator text/people/other brands.
4. Cards: one mint spec style, y .07 on B-roll frames; on full-face frames below the chin (.75-.79).
5. Circle crop: measure face per video (circle.cx_px/cy_px); full-face crop `full_x` also per video
   (G5G: 0.50 centred the face; slope about 3 face-fractions per unit; always verify with a centre line).
6. End sheet: PriceOye badge (+ Motorola badge for Motorola), user-supplied white-background phone photo, "Almost Rs" price. tail_pad 1.4 s.
7. cut + render with edit.py --format vertical, check loudness -14 LUFS, send a 720p copy (~7 MB).
Open questions: voices say "lagbhag" (old script) - ask whether to regenerate with "almost".
