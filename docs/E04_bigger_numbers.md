# E04 · Bigger numbers

Place value: the tens rod, the hundreds rod, and reading both. The app's **Level 1 Lesson 4 (Place
Value)** and **Lesson 5 (Numbers to 99)**, plus one closing section on the hundreds rod. The worked
numbers — ten, twenty-three, fifty-six, ninety-nine, thirty-eight — are the app's own, in its order.

**3:57 · 56 phrases · 486/486 words matched (100%) · both cuts.**

For the first time in the series **every line is exactly one phrase**, so a phrase index here is also
a line number.

## What this episode does differently

- **Its own instrument.** `RIG_CITY` — slate frame, amber beads, the colour of a lit window in the
  city it is set in, so a raised bead reads as "this floor is on".
- **One world drawing, eight lightings.** A skyline whose `windows` fraction climbs 0.16 → 0.4 across
  the episode under a sky that runs dawn to night. The city fills up as the numbers grow, which is
  the lesson. No world here needed its own illustration.
- **The teaching device was already built.** `Abacus` has always taken `chipLower` / `chipUpper` per
  rod, drawing `1 / 10 / 100` below and `5 / 50 / 500` above in the app's own `PLACE_COLORS`. Nothing
  was invented; it had to be driven per phrase.
- **Two phrases widen to thirteen rods**, because the line says the ones rod moves to the middle on a
  bigger abacus — the one claim in the series that is false unqualified (VIDEO_SERIES_PLAN §6b). It
  is shown, with the centre rod boxed, rather than asserted.
- **1.04 scale, not the series' 1.15.** This is the only episode whose abacus carries labels below it,
  and the chips reach 58 px past the frame. Solved arithmetically: the chips' bottom sits at
  `stageMid + 296.5 × scale` against a caption band starting at 860, so the scale must stay under
  1.086. The beads give up 10% so the labels can exist, which is the right way round.

## What it changed for every other episode

Five fixes here were general, not local:

1. **`script_tokens()`** splits a hyphenated token when every part is a number word. Every number in
   this episode is compound, and `norm()` collapsed "twenty-three" to `twentythree` while Whisper
   emits two words. One token against two never matches. This is what got 100%.
2. **The hand and the bead arrows follow the rod that actually moves.** `x={onesCx}` and
   `rod={targetRod}` were invisibly correct for three episodes because nothing but the ones rod ever
   moved — and wrong the moment a bead went up on the tens rod. Arrows now draw on *every* rod whose
   value changed, which also fixes the line that sets three rods at once.
3. **The caption band and the place chips are guard boxes.** Neither had ever been registered. The
   check can only see what it is told about, and the caption is on screen in nearly every frame of
   every episode — which is exactly how the chips slid underneath it unnoticed.
4. **The celebration fires AROUND the instrument.** Rays and an expanding ring both lay across the
   beads; every particle now starts on the abacus's outline and travels away from it.
5. **`transcribe.py`** takes an argument and reports the silence between sentences, so a scripted
   pause can be checked before the episode is built rather than after.

## The take

The three-second recall gap **was held: 2.50 s** after "What number is that?", against E03's 0.84 s.
Peak came in at −0.6 dB, hotter than E01–E03's −1.4; the pipeline pulled it back to −1.6.

The take restructures six places — lines 1+2 joined, the reading rule and "three tens is thirty"
split, "ninety-nine is the most" reworded, and the 247 line shortened to "Two hundred, forty-seven".
`E04_lines.txt` is the approved record; `E04_spoken.txt` is the alignment input.

## Review notes and what they changed

| note | what it actually was |
|---|---|
| background greys pulling focus | The towers were mid-tone against pale skies under a dense grid of bright windows, making the **background** the highest-contrast region of the frame. Fills moved halfway to their own sky, window density halved. |
| base too light, then too dark | Three passes. Lightening the ground with the towers took the floor out of the frame; full dark made the pale towers read as washed out. It sits about a third up from dark. |
| finger on the wrong rod | See fix 2 above. |
| chips cut behind the caption | See fix 3 above, and the 1.04 scale. |
| "5" missing on the ones rod | The line is a **comparison** — "worth ten, *not one*" — and with only the tens rod chipped there was nothing for "not one" to point at. |
| pink and yellow vertical lines | Neon signs I had added to one world. A decoration nobody can identify is noise; removed, and the world renamed from `neonstreet` to `duskstreet` rather than left lying. |
| the ring in the celebration | Kept from the old burst while removing the rays — the same mistake. An expanding outline only stays outside the instrument if the instrument is wide and short. |
| 4:5 read-out too small | Capped at 0.62 in portrait, and the cap was binding — so it rendered smallest in the cut that needed it largest. Now 1.0. |

The 4:5 cut also caught a **teaching** error, not a layout one: p46 was showing the `100` chip while
only *naming* the hundreds rod, pre-empting p47, whose whole job is to give its worth. In portrait
that chip sat across the naming card's arrow, which is how the guard found it.
