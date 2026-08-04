# Episode rules — the standing brief

What every Abacus episode must be, written after Episode 1. Read this before scripting or
building anything. It is short on purpose.

Companions: `../../VIDEO_SERIES_PLAN.md` (the 47-episode map) · `DESIGN_SYSTEM.md` (how it
looks, plus §8a/§8b for the bugs and process lessons E01 paid for).

---

## 1. The three things the audience needs

**A child aged 4–8 and their parent, watching together, on a phone, probably muted at first.**

1. **Kid-friendly.** Short sentences. Words a six-year-old already owns. One idea on screen at
   a time. Never a sentence a child has to hold in their head to the end.
2. **Playful.** It should feel like a game someone is showing you, not a lesson being
   delivered. Every episode needs one moment a child would repeat out loud.
3. **Easy.** If a line needs a second line to explain it, the first line was wrong.

If a script reads like a manual, it fails all three at once. E01's script works because almost
every sentence is under twelve words and names one thing.

---

## 2. Every episode gets a NEW theme

Not a new brand — a new *world*. Same badge, same font, same abacus, same caption style; a
different place, a different palette, a different gag.

| Locked forever | Changes every episode |
|---|---|
| Fredoka type scale (`TYPE`) | The worlds and their palette |
| The soroban: wood frame, hexagonal beads, 1 heaven + 4 earth | The metaphor and the signature gag |
| Corner badge (real app icon) + "powered by VEDAAVI" | The headline pill wording |
| Karaoke caption band, like/subscribe card | The closing CTA line — never reuse wording |
| Teaching cards: solid colour, white text, inset pills | Which worlds appear, and in what order |
| Store outro structure (no module tours — §3.10) | The `NextUpCard` teaser |

**A viewer bingeing three episodes should feel three episodes, not one reskinned three times.**
E01 used twelve worlds; a shorter episode can use four or five, but they must be *different
ones*, not E01's in a new order.

---

## 3. Script rules

1. **Script first, approved, then build.** A script change after the build is a rebuild.
2. **Read the real app screen before writing.** The episode is a trailer for a feature that
   exists. Open the actual lesson and copy its real flow and real examples.
3. **One human take, one file.** No TTS, no stitching.
4. **Every spoken LINE gets its own visual change.** Not every section — every line. A changing
   caption does **not** count as a changing screen.
5. **The visual shows what the words say.** If the line is about fingers, show fingers. Do not
   leave the abacus parked on stage during a line that is not about the abacus. E01's reveal
   only works because the abacus is absent until "This is an abacus."
6. **Say numbers as words** in the script ("seven plus eight"), so alignment can match them.
7. **Vocabulary must match the app.** The app says *rods*, *upper/lower beads*,
   *Unit's Place*. Use the app's words, in the app's colours (`src/data/tour.ts`).
8. **Never teach a partial rule as a rule.** Qualify anything that is only true of the abacus
   on screen — see the far-right/centre-rod trap in the plan's §6b.
9. **Close on four beats:** a practice prompt → **like & subscribe** → the download CTA naming
   both stores → the `NextUpCard` teaser. The like ask goes straight after the praise beat, while
   the viewer is feeling good, and **must not promise a cadence** ("every week", "tomorrow") —
   a promise the upload calendar cannot keep costs trust.
10. **Teach the abacus, not the app's modules.** These episodes explain the *instrument*. Do not
    walk the viewer through Free Mode, Practice, Exam or CCM — those get their own module videos
    later. The download CTA stays, because it is the conversion moment rather than a module tour,
    and the practice prompt points at the child's own abacus.

---

## 4. Non-negotiables in the build

- **Bead moves must be physically legal.** Only beads whose state changes may move. A rod never
  re-seats itself to show the next number. Arrows never cross the beam.
- **Frame 0 is the thumbnail.** A finished image, nothing mid-spring.
- **Bands:** headline 0–200 · stage 220–840 · caption 860–1010. Nothing crosses.
- **One abacus instance, one world instance**, driven by the absolute frame. Never remount —
  it restarts idle motion.
- **Derive, never hand-number.** `tools/gen_line_map.py` then `tools/check_line_sync.py`.
- **Measure positions from a render.** Do not calculate a tap target or an arrow origin from
  the CSS; render a frame and measure it.
- **SFX on every real event** — bead clicks where beads actually move, the app's chime on a
  reveal, an original sting for a reveal moment. Keep the mix peak under −1 dB.

---

## 5. The checklist before showing anyone

```bash
python3 tools/gen_line_map.py && python3 tools/check_line_sync.py
npx tsc --noEmit
npx remotion render <id> out/<id>.mp4
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 out/<id>.mp4   # audio present?
ffmpeg -i out/<id>.mp4 -af volumedetect -f null -                          # peak under 0 dB?
ffmpeg -i out/<id>.mp4 -vf "fps=1,scale=300:-1,tile=13x7" sheet_%02d.png    # every second
```

Then **read the caption against the card in the same frame**. E01's worst bug — a tooltip a full
line out of step for a whole section — survived several contact sheets because I checked layout
and never checked whether the label agreed with the sentence.
