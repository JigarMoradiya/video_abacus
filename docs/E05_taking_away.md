# E05 · Taking away

Direct subtraction on the **ones rod**. The app's Level 2 Chapter 3 (Earth Subtract) and Chapter 4
(Heaven Subtract); the worked numbers 4−2, 8−3, 5−5, 7−5, 9−8 and the practice 9−4 are its own.
Nothing here needs a complement — that is E07.

**3:47 · 74 phrases · 505/505 words matched (100%) · both cuts.** Lines and phrases are 1:1 again.

## What this episode does differently

- **`RIG_SPACE`** — graphite frame, violet beads. Fourth distinct instrument, and violet is the one
  hue the series had not put on a bead.
- **A launch for a world set**, ground to orbit. Subtraction *is* a countdown, so the episode climbs
  as the numbers come down — deliberately the inverse motion to E04's city filling with light,
  because those two sit next to each other in a playlist.
- **An astronaut whose main job is `catch`.** This is the first thing in the series where something
  *leaves*, so it cups its hands under the beam and catches the bead. That makes "away from the
  beam" a place rather than an absence. It reaches ONTO the rod (`mayTouchAbacus`, the same
  permission FingerHand has) rather than gesturing at it from a distance.
- **The closing line counts the rod down from nine**, which is what the whole episode was.

## The finger rule — corrected here, and it was wrong

The rule is decided by **direction, not by which bead**:

> moving **up** → THUMB · moving **down** → INDEX FINGER

So the thumb pushes earth beads up *and* pushes the heaven bead back up; the index brings earth beads
down *and* brings the heaven bead down to the beam.

E05 shipped its first build with the heaven bead on the index finger in **both** directions, which is
wrong on exactly the four lines where the upper bead goes back up — on the one episode whose entire
hook is which finger to use. Caught by the user, not by any guard.

**No guard can catch this, so the check is an audit.** Every line with a hand is now enumerated from
the VALUE table and checked against the rule by computation, because eyeballing frames is how it got
through. E05: 19 hands, all correct. E04: 9 hands, all correct, plus two lines that move more than
one rod and therefore correctly show no hand at all.

The first run of that audit was itself wrong — it compared whole values (0→10) rather than per-rod
digits, so it mislabelled E04's earth moves as heaven ones. **An audit that has not been checked is
not evidence.**

## What it changed for the rest of the series

**`ASR_HOMOPHONES` in the aligner.** Whisper transcribes every "bead" as "beat", and "bead" is the
most-spoken word in this series — roughly twenty-five times in this episode alone. Under `norm()`
those never matched, and every one took the surrounding timing with it. The script keeps the correct
spelling, because that is what the caption renders; matching is taught to see through the error. Same
shape as E04's compound-number fix, and the reason this take reached 100%.

**`cloudFlat`.** Cloud seen from a climbing rocket is a thin stretched sheet, not round puffs on a
baseline — the flag squashes the lobes and drops the solid base that gives E01's clouds their cartoon
bottom edge.

**The gantry stands on the ground.** The planet is a very wide ellipse whose apex is at `planet.at`,
so its surface DROPS towards the frame edge; anchoring the tower to the apex left it hanging in the
air. The base is solved from the ellipse at the tower's own x.

## The take

Recall gap after "What number is left?": **2.10 s**. Peak **−0.5 dB** — hot, like E04's −0.6, and
worth about 3 dB lower next time so the SFX have room underneath.

74 lines as recorded against 58 scripted: the take breaks almost every long line into two short ones,
which is a warmer read and gives the visuals more beats to land on, not fewer.
