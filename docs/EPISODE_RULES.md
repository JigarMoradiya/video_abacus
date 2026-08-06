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
   1a. **If the take paraphrases the script, the TAKE wins and gets its own file.** A warm
   read is worth more than a literal one, so write `<EP>_spoken.txt` from the recording and
   align that; keep `<EP>_lines.txt` as the approved record. E02's take differed on about
   twenty lines, dropped one entirely and added two.
2. **Read the real app screen before writing.** The episode is a trailer for a feature that
   exists. Open the actual lesson and copy its real flow and real examples.
3. **One human take, one file.** No TTS, no stitching.
4. **Every spoken LINE gets its own visual change.** Not every section — every line. A changing
   caption does **not** count as a changing screen.
5. **The visual shows what the words say.** If the line is about fingers, show fingers. Do not
   leave the abacus parked on stage during a line that is not about the abacus. E01's reveal
   only works because the abacus is absent until "This is an abacus."
6. **Say numbers as words** in the script ("seven plus eight"). Whisper transcribes them as
   digits, so `canon()` in `align_by_matching.py` folds both to the digit form — without it
   E02 matched **1 of 51** number-words, i.e. every beat where a bead moves.
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

## 3a. Every episode ships two cuts

**16:9 for YouTube, 4:5 for Facebook and Instagram — from the SAME reel.** One component,
registered twice in `src/reels/index.ts` at 1920x1080 and 1080x1350. The phrase table, worlds,
audio, SFX and teaching are identical; only the arrangement differs, and that lives in
`src/stage/layout.ts`. A second reel file per aspect drifts the moment either is edited — the
phonics series settled this (`oo` and `oo-4x5` are one component).

What changes in 4:5:

| 16:9 | 4:5 |
|---|---|
| card sits BESIDE the part it names | no "beside" exists — cards go in a band under the stage, arrow pointing up |
| abacus centred, ~530 px each side | fitted to the width, shifted off centre to reserve room for props |
| answers/prompts above the abacus | headline band (there are only ~40-80 px above a portrait abacus) |
| phone and CTA side by side | stacked |
| credit bottom-left | top-left — the caption band reaches to 1340 |

**`sideRoom` is per-episode and asymmetric.** E02 needs ~165 px for the ladder on the left and
~280 for the pushing hand on the right; one figure for both either clips the hand off the frame
or wastes a third of the width. Reserve it on EVERY line of a section, not only the lines that
use it, or the abacus resizes mid-section.

**Check both cuts before calling it done.** `tools/phrase_stills.mjs --id <id>-4x5` runs the same
guards. Nothing may run off the frame either — an element half outside the canvas overlaps
nothing, so the overlap check alone cannot see it.

## 4. Non-negotiables in the build

- **NO CONTENT MAY OVERLAY ANY OTHER CONTENT.** Not a card over the abacus, not a card over
  the hand, not a chip inside a headline pill, not an arrow passing behind the card it comes
  out of. Enforced at render: every placed element declares a box (`boxesFor`), SceneStage
  adds its own, and `guardOverlap` fails the render on any intersection — including sampling
  the arrow's path. Turn it on for every new episode. Checking 53 frames by eye does not work;
  this was found by the user, on five separate frames, after I had checked them all.
- **Bead moves must be physically legal.** Only beads whose state changes may move. A rod never
  re-seats itself to show the next number. Arrows never cross the beam.
- **Resize a card by WRAPPING, never by cutting words.** Shortening "no beads touching the beam"
  to "no beads on the beam" to save 100 px made it false — beads touch the beam, they are never
  on it. No guard can catch this; both check structure, neither checks meaning.
- **Captions have three states.** Already said, being said, not yet said — the unspoken tail is
  faded so the eye reads only as far as the voice. Teaching words get their own colour in every
  state. Keep the keyword list short; highlighting half a sentence highlights nothing.
- **The picture must not run ahead of the voice.** An instruction is obeyed AFTER it is spoken:
  set `moveOn: "$last"` so the bead travels on the line's final word, and the pointer sits on
  the bead beforehand so the child sees WHICH bead is about to move. A counted run reveals one
  badge per spoken number (`countOnNumbers`) — all of them at once says "four", not
  "one, two, three, four". Props that stand for the count (a ladder, a tally) follow
  `ctx.settle`, not the phrase boundary.
- **Point at the thing that moves.** `handAnchor` takes the value the rod is coming FROM, so
  the arrow lands on the bead that is about to travel rather than on a fixed slot. From E03 this
  is not the hand's job alone: turn on `beadArrows` so EVERY line that changes the rod's value
  gets an arrow on the beads it actually moves. Seven E03 lines had a hand; nineteen moved beads,
  so twelve said "push three more lower beads up" with nothing pointing at the three.
- **A bead is coloured by where it IS, not where it is going.** Turn on `colorOnArrival`. Without
  it a bead is the "on" colour from the first frame of the line and travels up already counted.
- **Count badges number the beads being ADDED.** `countFrom` takes the rod's previous value; on
  1 + 2 the two being counted are the second and third beads, not the first two. Pair it with
  `countRod` so a sentence about one rod does not label all five.
- **Every answer gets a celebration.** `celebrate: "burst"` on each resolved sum, `"party"` on the
  praise beat and the close. Eight sums resolved in E03 and every one of them looked exactly like
  the line before it. The layer renders UNDER the caption, and it is the one thing exempt from
  the overlap guard — see DESIGN_SYSTEM §8j for why, and for the rule it obeys instead.
- **A world has to be somewhere.** The test: could you name the place with the abacus taken away?
  A two-stop gradient with one hill on it fails, eight times over — which is what E03 shipped its
  first cut with. World props are NOT guarded, so place them against the occupied regions by hand:
  the left gutter (bucket), the right gutter (the character), and the caption pill across the
  bottom middle.
- **One notation per episode.** If the sums are written as columns, the quiz prompt is a column
  too. The one line that asks the child to work it out is the worst place to change notation.
- **Teach only this episode's idea.** E02 is about READING a rod, so nothing on screen writes
  `5 + 3 = 8` — that is E03's lesson. Show the number the rod reads.
- **Frame 0 is the thumbnail.** A finished image, nothing mid-spring.
- **Bands:** headline 0–200 · stage 220–840 · caption 860–1010. Nothing crosses.
- **One abacus instance, one world instance**, driven by the absolute frame. Never remount —
  it restarts idle motion.
- **Scenes are keyed to PHRASES, not lines.** The aligner splits every line on sentence
  boundaries: E01's 72 lines are 79 phrases, E02's 44 are 53. A table numbered by line is out
  of step from the first split onward.
- **Derive, never hand-number**, and assert it at RENDER time. E01 used
  `tools/gen_line_map.py` + `tools/check_line_sync.py`; E02 uses `assertCards`
  (`src/data/e02Cards.ts`), which throws if a card lacks a word its line says. Prefer the
  render-time guard — it cannot be skipped, and it needs no Python parser for TypeScript.
- **Measure positions from a render.** Do not calculate a tap target or an arrow origin from
  the CSS; render a frame and measure it.
- **SFX on every real event** — bead clicks where beads actually move, the app's chime on a
  reveal, an original sting for a reveal moment. Keep the mix peak under −1 dB.

---

## 5. The checklist before showing anyone

```bash
npx tsc --noEmit

# one still per PHRASE — read the card against the caption in the SAME frame
node tools/phrase_stills.mjs --id <id> --phrases src/data/<ep>.phrases.json \
     --out out/<ep>_stills

npx remotion render <id> out/<id>.mp4
ffprobe -v error -show_entries stream=codec_type -of csv=p=0 out/<id>.mp4   # audio present?
ffmpeg -i out/<id>.mp4 -af volumedetect -f null -                          # peak under -1 dB?
python3 tools/phrase_sheet.py  out/<id>.mp4 src/data/<ep>.phrases.json out/<ep>_sheet  # STALE
python3 tools/motion_check.py  out/<id>.mp4 src/data/<ep>.phrases.json                 # FROZEN
```

**Refactoring shared code?** Capture `--png` stills for an already-approved episode FIRST and
diff the hashes after. Every scene value is a pure function of the frame, so a change that
alters nothing must reproduce them byte-for-byte. E01 was ported onto a shared interpreter and
verified 79/79 identical at each step — which is the only reason the refactor was safe to do
at all.

Then **read the caption against the card in the same frame**. E01's worst bug — a tooltip a full
line out of step for a whole section — survived several contact sheets because I checked layout
and never checked whether the label agreed with the sentence.
