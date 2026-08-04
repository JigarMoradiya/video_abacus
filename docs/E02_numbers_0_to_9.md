# E02 · Numbers 0 to 9 — script

Mirrors the app's **Level 1, Lesson 2 + Lesson 3** (`Level1Content.swift`): zero, one to four on
the lower beads, then the upper bead and six to nine. When it ends a child can read any single
rod, which is the whole promise of the episode.

Read `EPISODE_RULES.md` before building this. Format 16:9, 1920×1080.

**Length: 42 spoken lines, 318 words ≈ 2:31** at 145 wpm. One continuous human take.

> **BUILT — see "As recorded" below.** The take runs **167.7 s** and is a natural paraphrase
> of this script, so the reel is built from `E02_spoken.txt` (44 lines → **53 phrases**), not
> from this table. Three things written here turned out to be wrong and are corrected in
> place: the beat count, the one-rod staging, and `refine_phrase_onsets.py`.

- **Follows from E01's close:** *"next video, we'll place our very first number on the abacus."*
- **Leads to E03:** adding two numbers together.
- **CTA line (never reuse):** *"Now try it yourself. Make every number from zero to nine."*
- **⚠ App name** still spoken as **Abacus Kids** — same open question as E01.

---

## The two acts, and why the theme is what it is

The episode has a hinge in the middle: four beads that go up one at a time, then a wall, then one
bead that is worth five on its own. So the spine is **the beads as characters** — the app's own
visual language, since its icon and its `Eyes Beads` assets are literally beads with faces.

- **Act 1** — four small lower beads climb a ladder, one rung each. Counting is climbing.
- **The wall** — the ladder has four rungs. There is no fifth. Try it and see.
- **Act 2** — the upper bead comes down, and it is worth five by itself. One move, five steps.

**Signature gag:** a ladybird climbs one rung per bead. At four she looks up for a fifth rung,
finds nothing, and shrugs at camera. Then the upper bead arrives and she rides it down.

**Vocabulary is the app's:** *lower beads*, *upper bead*, *beam*, *rod*. Not "earth/heaven" —
E01 already said those are the same beads and that we would use upper and lower.

## Worlds — eight, all new (none reused from E01)

| # | World | Where | Look |
|---|---|---|---|
| 1 | `dawn` | zero | still lily pond before sunrise, nothing moving but the water |
| 2 | `ladder` | one to four | garden green, a four-rung ladder stood beside the rod |
| 3 | `wall` | four is the maximum | warm amber, the ladder's top rung with empty air above it |
| 4 | `sky` | the upper bead | bright open sky, one big star; the reveal world |
| 5 | `workshop` | six to nine | warm cream bench, five and some more |
| 6 | `board` | the reading rule | deep teal board, the rule written out |
| 7 | `askrose` | your turn | deep rose field — deliberately not E01's violet quiz |
| 8 | `balloons` | close | sunset with balloons — not E01's confetti meadow |

## Abacus config

**Five rods, ones rod lit — NOT one rod.** "One rod, large" does not exist at this aspect: the
stage band is 620 px, so a single rod is **199 × 620** — a sliver with ~860 px of dead space
each side. Five rods at `BASE` (1.15) with the other four dimmed keeps beads 110 px wide, and
it makes *"we only need one rod"* a visible choice rather than a claim. `PUSH` is unused here;
the rig never changes scale, because a rig that resizes between sections reads as a second
abacus.

Soroban only: 1 upper + 4 lower. Value shown always matches the words, in every frame.

---

## 1 · HOOK (0:00–0:13) · world `dawn`

| # | Voiceover | On screen |
|---|---|---|
| 1 | Last time, we met the abacus. | The rod slides in from E01's world, empty. Frame 0 shows it complete. |
| 2 | Today we make numbers with it. | Numbers 0-9 flick past above the rod and settle. |
| 3 | Every number from zero all the way up to nine. | `0 → 9` counter appears top-centre. |
| 4 | And you only need one rod. | Four rods fade away, leaving one, big. |

## 2 · ZERO (0:13–0:24) · world `dawn`

| # | Voiceover | On screen |
|---|---|---|
| 5 | Let's start with nothing at all. Zero. | Big `0` card above the rod. Pond still. |
| 6 | Zero means no beads are touching the beam. | Every bead pushed away from the beam; a dashed line marks the beam. |
| 7 | Push them all away, and the rod says zero. | Beads settle to their parked positions. `ValueReadout: 0`. |

## 3 · ONE TO FOUR (0:24–0:44) · world `ladder`

The ladybird arrives with the ladder. One rung lights per bead.

| # | Voiceover | On screen |
|---|---|---|
| 8 | Now push one lower bead up to the beam. | Thumb pushes 1 bead up. Rung 1 lights. Ladybird hops to rung 1. |
| 9 | That is one. | `1` card. `ValueReadout: 1`. |
| 10 | Push one more. Count them. One, two. | 2nd bead up, the two beads number themselves 1-2. |
| 11 | That is two. | `2` card. Rung 2 lights, ladybird hops. |
| 12 | One more again. One, two, three. | 3rd bead up, counted 1-2-3. |
| 13 | That is three. | `3` card. Rung 3. |
| 14 | And one more. One, two, three, four. | 4th bead up, counted 1-2-3-4. |
| 15 | That is four. | `4` card. Rung 4 — the top. |

## 4 · THE WALL (0:44–0:59) · world `wall`

| # | Voiceover | On screen |
|---|---|---|
| 16 | Now let's try to make five. | The rod holds 4. A `5?` card pulses. |
| 17 | Push another lower bead up... but there are none left. | A hand reaches for a 5th lower bead; the space below is empty. |
| 18 | Four is as high as the lower beads can go. | The four beads pulse together. Ladybird looks up at empty air and shrugs. **(the gag)** |
| 19 | So how do we make five? | Held question. Everything still except the ladybird. |

## 5 · THE UPPER BEAD IS FIVE (0:59–1:22) · world `sky`

| # | Voiceover | On screen |
|---|---|---|
| 20 | Look above the beam. The upper bead. | Camera lifts to the top section. The upper bead gets a face. |
| 21 | It has been waiting up there the whole time. | It bobs, pleased with itself. |
| 22 | Send the lower beads back down... | All four lower beads drop away. `ValueReadout: 0`. |
| 23 | ...and bring the upper bead down with your index finger. | Index finger, arrow down, bead to the beam. |
| 24 | One upper bead, and the rod says five. | `5` card, big. `ValueReadout: 5`. |
| 25 | That single bead is worth five all on its own. | `1 bead = 5` beside it. Four lower beads pulse once, dimmed, for comparison. |

## 6 · SIX TO NINE (1:22–1:41) · world `workshop`

| # | Voiceover | On screen |
|---|---|---|
| 26 | Now five is easy to build on. | The upper bead stays down for the whole section. |
| 27 | Five, and one lower bead up. That is six. | 1 lower bead up. `5 + 1 = 6`. |
| 28 | Five, and two lower beads. Seven. | `5 + 2 = 7`. |
| 29 | Five, and three. Eight. | `5 + 3 = 8`. |
| 30 | Five, and all four. Nine. | `5 + 4 = 9`. All five beads at the beam. |
| 31 | Nine is the biggest number one rod can show. | `MAX 9` stamp. Ladybird cheers from the top rung. |

## 7 · THE READING RULE (1:41–1:57) · world `board`

| # | Voiceover | On screen |
|---|---|---|
| 32 | Reading a rod is always the same two steps. | Two numbered slots appear on the board. |
| 33 | Is the upper bead down? Then that is five. | Slot 1 fills: `upper down → 5`. |
| 34 | Then count the lower beads touching the beam. | Slot 2 fills: `count the lower beads`. |
| 35 | Add them together, and that is your number. | `5 + 3 = 8` worked through on the rod. |

## 8 · YOUR TURN (1:57–2:10) · world `askrose`

| # | Voiceover | On screen |
|---|---|---|
| 36 | Your turn. What number is this rod showing? | Rod set to **3**. Big `?`. **Hold 3 full seconds of silence.** |
| 37 | It is three. Three lower beads up, and the upper bead still resting. | The three beads number themselves 1-2-3; upper bead marked as not counting. |
| 38 | Nice work. | Praise chime, ladybird cheers. |

## 9 · CLOSE (2:10–2:32) · world `balloons`

| # | Voiceover | On screen |
|---|---|---|
| 39 | Now try it yourself. Make every number from zero to nine. | The rod counts itself 0→9, one number per beat, beads moving. No phone. |
| 40 | If you liked this, tap like and subscribe for more. | **`SubscribeCard`** — a thumbs-up and a bell, both getting a tap; the bell rings once. Placed straight after the praise, while the viewer is feeling good. |
| 41 | Search for Abacus Kids on the Apple App Store, or on Google Play. | Store flow → detail page → GET. Real icon, rating, badges. No caption. |
| 42 | In the next video, we add two numbers together on the abacus. | `NextUpCard`: two numbers, and a `+` between them. |

**The close is four beats:** practice → like & subscribe → download → next video. The like ask is
first because it is the cheap one, and it lands while the child has just got the answer right. It
promises **no schedule** — no "every week", for the same reason E01 dropped "tomorrow": a promise
the upload calendar cannot keep costs trust.

**No Free Mode shot in this episode.** The series teaches the *abacus*; the app's modules get
their own videos later, so a teaching episode does not walk through one. The download CTA stays —
that is the conversion moment, not a module tour — and the practice line points at the child's own
abacus instead. The rod counting itself 0→9 also doubles as the recap the episode never had.

---

## Audio

- One human take, all 42 lines, from `E02_lines.txt`. No TTS.
- **Hold three full seconds** after line 36. The recall beat is the point.
- `tools/align_by_matching.py` only. **Do NOT run `tools/refine_phrase_onsets.py`** — it is
  phonics legacy and reads `src/data/letterPhrases.json` and `src/data/letters.ts`, neither of
  which exists in this project; it would crash. It is also unnecessary: the aligner splits on
  sentence boundaries, so each counted run ("One, two, three.") is its **own phrase** and the
  bead numbering comes from progress within that phrase.
- The fix that actually mattered was `canon()` in the aligner: Whisper writes spoken numbers as
  digits, so `"four"` never matched `"4"` and **1 of 51** number-words aligned. Folding both to
  the digit form took the take to **313/313**.
- SFX: the app's `abacus_move.mp3` on every real bead move, `option_correct_ans.mp3` on lines 24
  and 37, `clap.mp3` under line 38, and a bead click per number on line 39's 0→9 count. **A new sting for line 20** (the upper bead's reveal) —
  synthesise a second one in `make_reveal_sfx.py`, don't reuse E01's.
- Keep the mix peak under −1 dB.

## Verification, beyond the standard checklist

1. **Value matches the words in every frame** — 0,1,2,3,4 then 5,6,7,8,9 and 3 for the quiz.
2. **No illegal bead moves.** Going 4 → 5 clears four lower beads *and* brings the upper bead
   down; both happen, and neither bead crosses the beam.
3. **The upper bead never moves during lines 27–30** — only lower beads do.
4. **Read the caption against the card in the same frame**, for all 42 lines.


---

## As recorded (built 2026-08-04)

The narrator read the script naturally rather than literally, which is the right call for a
warm take — but it means the phrase table above is not what is on screen. `E02_lines.txt` stays
as the approved script; **`E02_spoken.txt` is the alignment input and the authority for scenes**.

| Written | Spoken |
|---|---|
| "Last time, we met the abacus." + "Today we make numbers with it." | merged; "we're going to make" |
| "And you only need one rod." | "and **we** only need one rod" |
| "Push one more. **Count them.** One, two." | "Push one more. One, two." — **"Count them." was never said** |
| "Now let's **try to** make five." | "Now let's make five." |
| "…but there are none left." | "**Oh,** there aren't any left." |
| "That **single** bead is worth five all **on its own**." | "That **one little** bead is worth five all **by itself**." |
| "Reading a rod is always the same **two steps**." | "Reading a rod is always the same." |
| "Is the upper bead down? Then that is five." | "**First,** is the upper bead down? **If it is,** that's five." |
| "…and the upper bead still resting." | "Three lower beads **are touching the beam**. The upper bead is still **up**." |
| "Now try it yourself." | "Now **it's your turn**," |
| — | **"Download it free."** added |
| "In the next video, we add…" | "**See you** in the next video, where we'll add…" |

**44 lines → 53 phrases.** The splits are a gift: each counted run is its own beat, and "Send
the lower beads back down." separates from "Now bring the upper bead down", so the 4 → 5 move
clears the lower beads *before* the upper bead lands — legal by construction.

The recall gap survived the take: phrase 43 ends at 135.16 s, the answer starts at 137.52 s.

### Corrections found by rendering it

Each of these was invisible in the code and obvious in a still, which is why the check is
"read the card against the caption in the same frame":

- **`dawn` and `board` had white headline pills under white ink** — `HeadlinePill` takes
  `world.ink` on a white pill, so both headlines rendered white-on-white, i.e. blank.
- **The "5 + n" strip crossed the caption band.** Under the abacus it began at 827 px against a
  caption top of 860. It sits above the abacus now, in the big number's slot.
- **`workshop`'s surface reached 799 px**, inside the 220–840 stage band. Matched to `bench` at
  0.78.
- **The `sky` world's clouds erased its star.** A white cloud drifting over a pale-yellow star
  is nothing at all, and the clouds sweep the whole upper band. An open sky with one star is
  also what a reveal wants.
- **Phrases 24–26 and 46 dimmed the half holding the value.** "Look above the beam" with four
  beads up dims those four to 0.15, and the parked upper bead is grey anyway, so the frame had
  no bright element and read as an *empty* abacus at the exact moment the four mattered. A
  section **band** marks the region without quieting anything (DESIGN_SYSTEM §6).
- **`sumBreakdown` on the answer rendered "0 upper beads = 0"** — a row about a bead that is
  not there.
