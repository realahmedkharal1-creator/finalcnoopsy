# A-roll batch edit: handoff notes

Goal: edit the 17 A-roll videos one at a time, user approves each, then the next.
Done: Honor Magic 9 Pro Max (approved), Moto G77 (approved), Moto G 5G 2025 (approved).
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

Delivery note: 720p copies were sent in chat; the user could not download large files. Use 1080p crf 23 with faststart (about 12-15 MB) via SendUserFile; Gmail connector calls are capped at about 3 MB of files, so email is not an option.
Honor, G77, G5G are approved. New split-screen card rules are in SKILL.md (apply from the next video).

## Status (latest)
- Approved and downloaded by the user: Honor Magic 9 Pro Max, Moto G77, Moto G 5G 2025 (full quality copies are in deliverables/ on this branch; ask the user before deleting them from the repo).
- Next video: Infinix Note 60 Pro (A-roll: Infinix_Note_60_Pro_7.mp4 in the user's Drive folder; B-roll library: reference/broll-library/04.json; script: reference/script-examples/bulk-17/04-infinix-note-60-pro.txt). Ask for a clean phone photo (back+front, white background) for the end sheet; start without it using a placeholder if the user says so.
- Delivering files: the chat preview/download of big files fails for this user. What works: push the full-quality file to deliverables/ on claude/busy-gates-9cw2ne (only when the user asks) and give github.com .../raw/<branch>/deliverables/<file> links. SendUserFile of ~16-19 MB files and the artifact page did not solve downloads.
- Open questions: user's real brand colour (mint was my choice from the reference style, not their branding); old voices say "lagbhag" (regenerate with "almost"?).
- Do not re-edit approved videos for later rules.
