# E03 · Adding two numbers — script

Follows E02's promise: *"See you in the next video, where we'll add two numbers together on
the abacus."*

Read `EPISODE_RULES.md` before building this. Format 16:9 **and** 4:5, one reel, two
registry entries.

**Length: 59 spoken lines, 586 words ≈ 4:02** at 145 wpm, ≈ **4:05** with the recall gap.
61 phrases. Longer than E02's 2:48 because every starting number is now MADE on screen rather
than assumed — see the two script rules below.

---

## Where this comes from in the app — and a correction

**Level 1 has no addition lesson at all.** I assumed it would and checked before writing:
Level 1 goes Lesson 4 "Place Value" and Lesson 5 "Numbers to 99", both *reading* multi-rod
numbers. Single-rod addition is **Level 2, Chapters 1 and 2** (`Level2Content.swift:61-64`):

| Chapter | Title | Subtitle | Type |
|---|---|---|---|
| 1 | Earth Add | "Push earth beads — result 1 to 4" | `.direct` |
| 2 | Heaven Add | "Add with heaven bead — direct only" | `.direct` |

So this episode is Level 2 Chapters 1 + 2 in one, exactly as E02 was Level 1 Lessons 2 + 3.

**The app's own worked examples are used, not invented ones:**

- Chapter 1 (`Level2Content.swift:311-326`): `0 + 1`, **`1 + 2 = 3`**, **`2 + 2 = 4`**, try `1 + 3`
- Chapter 2 (`Level2Content.swift:328-343`): **`0 + 5 = 5`**, **`5 + 1 = 6`**, **`5 + 4 = 9`**

⚠ **`5 + 3` is NOT an addition example in the app.** It appears in Level 1 only as a *reading*
decomposition (`Level1Content.swift:196`). E02's `NextUpCard` teaser shows `5 + 3` — that is
fine as a teaser, but this episode teaches the app's real pairs.

**The quiz** uses `5 + 2`, which is in the app's own generated Chapter 2 pool
(`Level2Content.swift:263`).

**Vocabulary.** The app's verb is **push**, with a direction: *"push that many earth beads UP
toward the beam"*, *"push it DOWN to add 5"* (`Level2Content.swift:313, 330`). We keep **upper
/ lower** for the beads, because E01 promised the child exactly that — *"upper and lower are
the names we'll use"* — even though Level 2's UI says earth/heaven.

**The boundary is the app's own, and it is SHOWN but not taught.** Chapters 1–4 are `.direct`;
6–10 are `.formula`. Chapter 6 opens: *"Try 1+4. Can't just add 4 earth (only 3 free!)"*
(`Level2Content.swift:382`). This episode ends by pointing at that without teaching it —
EPISODE_RULES §3.8, never teach a partial rule as a rule.

**But the trick is NOT the next episode.** The app's own Level 1 order is Meet the Abacus →
Numbers 1 to 4 → Number 5 & Beyond → **Place Value** → **Numbers to 99**
(`Level1HomeView.swift:18-24`), and only then Level 2's addition. Place value comes before any
formula, and it has to: the big-friend complement (+9 = +10 − 1) carries onto the tens rod, so
a child who has never set a two-digit number cannot follow it.

E02's recorded take already promises *"we'll add two numbers together"*, so addition stays here
at E03. Two-digit and three-digit numbers become **E04**, and the small-friend trick **E05**:

| ep | content | app source |
|---|---|---|
| E03 | adding two numbers, direct only | L2 Ch 1-2 |
| **E04** | **tens and hundreds — setting and reading bigger numbers** | **L1 Lesson 4 + 5** |
| E05 | the small-friend trick, when the lower beads run out | L2 Ch 5-6 |

So line 47 says the trick is coming *soon*, not next, and the closing teaser points at bigger
numbers.

---

## Two rules this script follows

Both came out of review, and both change how the lines are written.

**1 · Never say a number is "already on the rod".** An earlier draft had *"Six is already on
the rod, so push three more lower beads up"* — which skips the only interesting part. Where did
the six come from? Every starting number is now made on screen and the words say which beads
make it: *"To make six, push the upper bead down for five, and push one lower bead up for
one."* This is also why the episode grew by ninety seconds.

**2 · Complete sentences, not clipped fragments.** *"Six plus three."* and *"That is nine."* are
telegraphic. Kid-friendly means short WORDS and one idea per sentence
(EPISODE_RULES §1) — it does not mean dropping the verbs. The only fragment left in the script
is a counting chant (*"one, two"*), which is deliberate.

## The theme — a day at the seaside

E01 was fields and workbenches, E02 a pond, a garden and an open sky. A **seaside day** is a
third place, and "collecting things into one bucket" is what adding *is*.

**Signature gag: the plus sign is a character.** A round, bouncy `+` that hops in, shoves the
beads up to the beam with a grunt, and dusts itself off. Deliberately NOT another small animal
— E02's ladybird is the most memorable thing in it, and a second bug in a row is how a series
starts feeling like one episode reskinned (EPISODE_RULES §2). At the end the `+` tries to push
when there is no room left and bounces off, which sets up E04 in one wordless beat.

A **bucket** beside the rod fills as the total grows — a second reading of the same number, so
a child who loses the beads can still follow the count.

## Worlds — eight, all new (none from E01 or E02)

| # | World | Where | Look |
|---|---|---|---|
| 1 | `harbour` | hook | morning teal water, masts, gulls |
| 2 | `sandpit` | what adding is | warm sand, bucket and spade |
| 3 | `pebbles` | one plus two | cool grey-blue shingle |
| 4 | `shells` | two plus two | pale coral pink, scattered shells |
| 5 | `slatecliff` | the lower-bead rule | dark wet slate, chalk marks |
| 6 | `goldenhour` | the upper bead is five | rich low gold |
| 7 | `rockpool` | five plus one, five plus four | deep turquoise |
| 8 | `sunsetsea` | your turn + close | pink and orange dusk |

## Abacus config

Five rods, ones rod lit, one scale throughout — same rig as E02, so the two episodes read as
one course. The `+` character needs room on the **right** (it pushes from the side the hand
used in E02); the bucket sits **left**.

---

## 1 · HOOK · `harbour`

Lines are quoted rather than numbered. Scenes are keyed to the frozen phrase JSON once the take
is aligned — E02's doc numbered 42 rows against 53 real phrases, which is exactly the
hand-numbering trap DESIGN_SYSTEM §8a records.

| Voiceover | On screen |
|---|---|
| Last time we learned to make every number from zero to nine. | The rod counts 0→9 quickly — a recap of E02's close. |
| Today we are going to put two numbers together. | Two small bead groups slide toward each other. |
| When we put two numbers together, that is called adding. | The `+` character bounces in for the first time. |
| And the abacus makes adding really easy. | Rod clears to zero; the bucket appears, empty. |

## 2 · WHAT ADDING MEANS · `sandpit`

| Voiceover | On screen |
|---|---|
| Adding on the abacus just means moving more beads to the beam. | A bead slides up; the beam glows. |
| First you make your starting number. | Two lower beads rise. `ValueReadout: 2`. |
| Then you push up as many more beads as you want to add. | The `+` shoves one more up. |
| When you stop, the rod is already showing you the answer. | `ValueReadout: 3`; the bucket reads 3. |

## 3 · ONE PLUS TWO · `pebbles`

App Chapter 1, step 3 — its own example.

| Voiceover | On screen |
|---|---|
| Let us try one plus two together. | Card `1 + 2`. Rod at zero. |
| To make one, push one lower bead up to the beam. | Thumb pushes 1 up. |
| The rod is showing one. | Big `1`. Bucket: 1. |
| Now we add two, so push two more lower beads up. | The `+` pushes two, one at a time. |
| Count them as they go up: one, two. | The two new beads number themselves as they land. |
| Three lower beads are touching the beam, so one plus two is three. | Big `3`; card completes `1 + 2 = 3`. |

## 4 · TWO PLUS TWO · `shells`

App Chapter 1, step 4.

| Voiceover | On screen |
|---|---|
| Now let us try two plus two. | Rod resets to zero. Card `2 + 2`. |
| To make two, push two lower beads up to the beam. | Two rise, numbered 1-2. |
| Now we add two more, so push two more lower beads up. | The `+` pushes the last two. |
| All four lower beads are touching the beam now. | Four up, numbered 1-4. |
| So two plus two is four. | Big `4`. Bucket: 4. |

## 5 · THE LOWER BEAD RULE · `slatecliff`

| Voiceover | On screen |
|---|---|
| Every lower bead you push up adds one more. | One bead rises with `+1` beside it. |
| But each rod only has four lower beads. | The four pulse together; a `4` stamp. |
| So the lower beads on their own can make one, two, three or four. | `1 2 3 4` fill in along the slate. |

## 6 · THE UPPER BEAD ADDS FIVE · `goldenhour`

App Chapter 2, steps 1-2.

| Voiceover | On screen |
|---|---|
| When we want to add five, we use the upper bead instead. | Camera lifts; the upper bead glows gold. |
| Start with all the beads away from the beam, so the rod is showing zero. | Rod clears to zero. |
| Now push the upper bead down until it touches the beam. | Index finger, arrow down, bead to the beam. |
| The rod is showing five. | Big `5`. The bucket jumps 0→5 in one go. |
| One single bead gave us five, in one move. | The four lower beads pulse once, dimmed, for contrast. |

## 7 · FIVE PLUS ONE · `rockpool`

App Chapter 2, step 3. Note the five is **made**, not assumed.

| Voiceover | On screen |
|---|---|
| Now let us try five plus one. | Card `5 + 1`. Rod at zero. |
| First we make five by pushing the upper bead down. | Upper bead travels down. |
| Then we add one, so push one lower bead up. | The `+` pushes 1. |
| The upper bead is worth five and the lower bead is worth one. | `5` chip on the upper bead, `1` on the lower. |
| So five plus one is six. | Big `6`. Bucket: 6. |

## 8 · FIVE PLUS FOUR · `rockpool`

App Chapter 2, step 4.

| Voiceover | On screen |
|---|---|
| Let us try five plus four. | Rod resets to zero. Card `5 + 4`. |
| Make five again by pushing the upper bead down. | Upper bead down. |
| Now push all four lower beads up to the beam. | Four rise together, numbered 1-4. |
| Five and four more makes nine. | Big `9`; `MAX 9` stamp — a callback to E02. |

## 9 · STARTING FROM ANY NUMBER · `rockpool`

**The section that fixes the gap.** Everything before it starts from zero or five, which would
leave a child thinking the upper bead has to be the first thing on the rod. Both pairs are in
the app's own Chapter 2 practice pool (`Level2Content.swift:263` generates 6+1, 6+2, **6+3**,
**7+1**, 7+2, 8+1).

| Voiceover | On screen |
|---|---|
| This works when you start from any number, not only from five. | The `5` card fades; a `?` takes its place. |
| Let us start from six this time. | Rod at zero. Card `6 + 3`. |
| To make six, push the upper bead down for five, and push one lower bead up for one. | **Both moves shown in order**, with `5` and `1` chips. |
| The rod is showing six. | Big `6`. Bucket: 6. |
| Now we add three, so push three more lower beads up. | Three rise; the lower beads number 2-3-4. |
| Six plus three is nine. | Big `9`. |
| Let us do one more, starting from seven. | Rod resets to zero. Card `7 + 1`. |
| To make seven, push the upper bead down, then push two lower beads up. | Both moves shown again. |
| Now we add one, so push one more lower bead up. | One rises. |
| Seven plus one is eight. | Big `8`. Bucket: 8. |

## 10 · YOUR TURN · `sunsetsea`

`5 + 2` — from the app's own Chapter 2 practice pool.

| Voiceover | On screen |
|---|---|
| Now it is your turn. Try five plus two on your own abacus. | Card `5 + 2 = ?`. Rod at zero. **Hold three full seconds.** |
| Push the upper bead down to make five, then push two lower beads up. | The two moves, in order. |
| The rod is showing seven, so five plus two is seven. | Big `7`. Bucket: 7. |
| That was lovely work. | Praise chime; the `+` cheers. |

## 11 · WHEN THE BEADS RUN OUT · `sunsetsea`

The app's own Chapter 6 opening, **shown and not taught**.

| Voiceover | On screen |
|---|---|
| Here is one last thing to notice. | Rod resets to zero. |
| Make one on your rod, and then try to add four more. | One bead up, then card `1 + 4`. |
| There are only three lower beads left, so there is not enough room. | The `+` pushes and **bounces off**; the three free beads flash. **(the gag)** |
| There is a clever trick for moments like that, and we will learn it very soon. | A `?` over the rod; the `+` shrugs at camera. |

## 12 · CLOSE · `sunsetsea`

| Voiceover | On screen |
|---|---|
| Now try some of your own. Add two small numbers on your abacus. | The rod works through `1+1`, `2+2`, `5+3`, beads moving. No phone. |
| If you liked this video, please tap like and subscribe for more. | `SubscribeCard`. |
| Search for abacus kids on the Apple App Store or on Google Play. | Store flow → detail → GET. No caption. |
| You can download it for free. | Download completes. |
| See you in the next video, where we will put much bigger numbers on the abacus. | `NextUpCard`: a two-rod abacus showing `2 4`. |

**The close is the four beats** (EPISODE_RULES §3.9): practice → like & subscribe → download →
teaser. New wording throughout, and it promises no schedule.

---

## Audio

- One human take, all 59 lines, from `E03_lines.txt`. No TTS.
- **Hold three full seconds** after "Try five plus two on your own abacus." The recall beat is
  the point.
- `tools/align_by_matching.py` only. Numbers stay words; `canon()` matches them to the digits
  Whisper writes.
- SFX: a bead click on every real move; the app's chime on "The rod is showing five" and on the
  quiz answer; `clap.mp3` under the praise; a **new comic boing** for the `+` bouncing off —
  `nope.mp3` is E02's and means "there is nothing there", which is not what happens here.
- Keep the mix peak under −1 dB.

## Verification, beyond the standard checklist

1. **Value matches the words in every frame:** 0,1,3 · 2,4 · 0,5 · 5,6 · 5,9 · 6,9 · 7,8 · 7 · 1.
2. **No illegal bead moves.** Every pair here is DIRECT — no line ever needs a complement.
3. **Every starting number is MADE on screen**, never assumed. That is the point of the rewrite.
4. **The upper bead never moves while lower beads are being added** (sections 7-9).
5. Read the caption against the card in the same frame, for all 59 lines, in **both cuts**.


---

## As built (2026-08-06)

Take: **246.1 s**, 70 lines → **71 phrases**, word match **544/544**. Alignment input is
`E03_spoken.txt`; the take follows the script closely and mostly RESTRUCTURES rather than
rewords ("Now we add two, so push two more lower beads up" → "Now, add two by pushing two more
lower beads up"), with several long lines delivered as two.

⚠ **The three-second recall gap was not held** — only **0.84 s** separates "Try five plus two on
your own abacus" from the answer. The visuals hold the question as long as they can, but the
voice answers almost immediately. Fixing it needs that line re-recorded.

### Its own abacus

`RIG_SEA` — teal beads on driftwood, where E01 and E02 share orange-on-brown. The palette is a
per-episode prop on `Abacus` with `RIG_WOOD` as the default, so the earlier episodes render
byte-identically (verified by A/B against the previous commit, not by assumption).

The first pass put **sand beads on a near-white panel** and the unset beads all but vanished
into it. The panel is cool and the beads warm now: an abacus has to show the beads it is NOT
using as clearly as the ones it is.

### What the guard caught, in order

Every one of these was a real defect the render refused to produce:

| phrase | what |
|---|---|
| 9, 27 | the finger cards duplicated the hand's own chip AND collided with it — dropped, exactly as in E02 |
| 10, 58, 63, 65 | `big` and `sum` both wanted the headline band; the sum already contains the answer |
| 4, 21 | teaching cards landed on the plus character |
| 9 | the hand and the plus character reached for the same bead from the same side |
| 62 | the card sat on top of the bouncing plus |

The last three only surfaced **after** registering the plus character as a guard box. Before
that the guard could not see it — the same blind spot that let E01's badge sit off-frame.

Two rules came out of it: **the hand and the plus character never share a line** (two pushers
is a muddle as well as a collision), and **the plus appears only when it acts** — standing idle
it occupied the right-hand card slot on every line of the episode.

### Verification

- 71/71 phrases pass overlap, frame-bounds and arrow-path checks, in **both** cuts.
- 0 STALE, 0 FROZEN. One QUIET (`Make one on your rod`, diff 0.94) — one bead rising plus its
  number card, which is genuinely a small change for a short line.
- 7384 frames, audio present, peak **−1.5 dB**, both cuts.

---

## Review pass 1 (2026-08-06)

Eleven notes from the first 16:9 cut. Nine were fixed; one cannot be fixed in visuals and one is
deliberately deferred. The generalisable lessons went into `DESIGN_SYSTEM.md` §8j.

| # | Note | What changed |
|---|---|---|
| 1 | "Why is the 3rd bead in the same colour?" | `colorOnArrival` — a bead stays sand until `settle >= 0.85`. Every example, not the one frame. |
| 2 | Highlight the number being added | `SumCard` gives each row its own line; the row the narration is on gets a white plate. |
| 3 | Show the sum vertically, not horizontally | Column form, scaled to whatever the headline band leaves above the abacus. |
| 4 | Arrows missing in all the examples | `stage/BeadArrow.tsx` on every value change (~12 lines had none). |
| 5 | Counting is wrong — "we count for 2 as one and two" | `countFrom`: badges number the beads **added**. `countRod` keeps them on the ones rod. |
| 6 | `1·2·3·4` should reveal per spoken number, on one rod | `countOnNumbers` + `countRod: 0` on p23. |
| 7 | No celebration anywhere in the video | `stage/Celebrate.tsx` — `burst` on all 8 answers, `party` on "Great job" and the close. |
| 8 | Backgrounds don't work — grey and empty | All eight worlds rebuilt on new shared seaside flags. `slatecliff` lost its dark slab; `sunsetsea` is a real dusk instead of one salmon hue. |
| 9 | *(mine)* the bucket's number was the pail's own red | White plate, teal digits. Pebbles enlarged so six of them can be counted rather than read as a smudge. |
| 10 | *(mine)* the recall gap is 0.84 s, not the scripted 3 s | **Cannot be fixed in visuals.** Needs "Try five plus two on your own abacus" re-recorded with the pause. |
| 11 | *(mine)* 4:5 | **Not touched.** The 16:9 gets signed off first; `out/e03_adding_two_numbers_4x5.mp4` on disk is the pre-review cut and is stale. |

### One thing the review exposed that was not on the list

p21, "Every lower bead you push up adds one more", reset the rod from four to one — three beads
travelling **down** under the word "up". Nobody had spotted it because nothing pointed at the beads;
switching arrows on drew three down-arrows and made it obvious. The rod now holds four right
through the rule section and the four raised beads are badged 1·2·3·4.

The your-turn prompt was also still a horizontal `5 + 2 = ?` card — the one line in the episode
that ASKS the child to work a sum out was using the notation the rest of it had stopped using. It
is now the same column, with a highlighted `?` on the answer row, tinted in the ones-place colour
so the quiz still reads as a quiz.

p62 gained the same treatment: "there are only three lower beads left" numbers the three that are
left (`countFrom: 1`, one per spoken number) instead of only asserting it.

---

## Review pass 2 (2026-08-06)

| # | Note | What changed |
|---|---|---|
| 1 | Clouds too big and dark; sky too dark | All seven E03 skies lifted at the top stop. Clouds shrunk and paled via new `cloudSize` / `cloudShade` — per-world, because E01's meadow has clouds too and this change broke 20 of its frames on the first attempt. `shells` and `goldenhour` also got a contrasting sea; they were coral-on-coral and orange-on-orange, one hue per frame. |
| 2 | Don't highlight a number when the sum is only being introduced | `"none"` is now a real `SumStep`. "Now, let's try five plus one" highlights nothing — it used to light the 5 while the rod still read zero. |
| 3 | Every step's arrow looks different | One `components/MoveArrow`, used by both `FingerHand` and `BeadArrow`. The style kept is FingerHand's shipped glyph to the pixel, so E01 and E02 are untouched. |
| 4 + 7 | Sum card blinks; a step change re-animates the whole card | It pops in once, on the phrase the sum first appears on, then holds. A step change cross-fades the plate from the old row to the new one and carries the digit colour with it. |
| 5 | Put the vertical sum on the right, not above the abacus | Right gutter, level with the top of the abacus, full size. It narrowed 268 → 200 to clear the finger hand's reach, and p33's card was dropped (see below). |
| 6 | The heaven bead's "5" survives after the lower badges clear | `countFrom` now gates the heaven bead too — a line labels the whole group or none of it. |

### The one card that lost its home

With the sum in the right gutter and the bucket in the left, p33 ("the upper bead is worth five and
the lower bead is worth one") had no slot left for a 560 px card. It was the app's tour segment
"1st ROD · lower 1 · upper 5" — and the line already badges the upper bead **5** and the lower bead
**1**, so the card was restating it in words, about a rod the sentence is not about. Dropped, and its
`assertCards` entry with it. The badges are the better annotation: the number is on the bead.

---

## Review pass 3 (2026-08-06)

| # | Note | What changed |
|---|---|---|
| 1 | Celebration and its sound mistimed in all sums | One frame now drives the burst, the chime AND the answer digit: the first frame of the answer line's final word — the word that names the total. The burst was firing on the line's first frame and the chime was anchored to `"is"`. |
| 2 | Arrow triangle too big; arrows still not the same style | The head is now a fraction of the arrow's length (not a fixed 34), and so is the shaft weight. Both callers describe the same 0.8 of the travel. One shape at every size. |
| 3 | Clouds still too dark/white | `cloudShade` down to 0.07 on a warmer ink, `cloudAlpha` 0.9 — both per-world. |
| 4 | Add moving fish in the beach water | Seven per beach world, drawn behind the sand, wrapping, tails beating, half swimming each way. |

### This round broke E01's byte-identity on purpose — 4 frames

The unified arrow changes E01's finger-work section (p54-p57). The old fixed 34-unit head was too big
against a 61-unit travel there as well, so keeping E01 frozen would have meant leaving E03 with two
different arrows — the thing being fixed. **E01 and E02 need re-rendering to pick up the new arrow.**
Their shipped mp4s are otherwise unaffected.

Also worth recording: three separate attempts to tune the clouds for E03 leaked into E01 (20, 20 then
5 frames) before all four values became `WorldTheme` fields with E01's numbers as defaults.

### Clouds took four rounds

"Light" meant a light COLOUR. I tried lower shade opacity, then lower fill opacity, then a Gaussian
blur (rejected: *"I dont need blur"*), before doing the obvious thing: `cloudInk: "#E7F7FB"`, a pale
tint close to the sky's own value, hard edges kept, underside shading off. Pure white on a pale teal
sky is the highest contrast in the frame, which is why the eye was going to the clouds instead of the
abacus. See DESIGN_SYSTEM §8m.

---

## The 4:5 cut (2026-08-06)

Same theme, same audio, same teaching — three elements move, and the 16:9 cut is **byte-identical**
(71/71 stills) because every change is inside a `portrait` branch.

| Element | 16:9 | 4:5 | Why |
|---|---|---|---|
| Column sum | right gutter, level with the abacus top | **headline band, centred** | Portrait has ~140 px of gutter and the finger hand takes all of it. The headline band is the only region free on every phrase that shows a sum — no sum line in this episode also has a headline or a big number — and at 0.63 of natural the digits are ~43 px in a 1080 frame, proportionally *larger* than the 68 px they get in 1920. |
| Bucket | left gutter, beside the beads | **bottom-left, in the card band** | It is 175 px wide and was being clipped by the frame edge. Moving it also fixes the cut's real compositional problem: 370 px of empty sand under the abacus while the props crowded the sides. |
| Plus character | right gutter, beside the beads | **bottom-right, mirroring the bucket** | At the 16:9 multiplier it needed 230 px of a 140 px gutter and walked off the frame. |

Consequences, each measured rather than guessed:

- **`PORTRAIT_ROOM` 185/205 → 90/190.** With nothing to fit beside the abacus it can take the largest
  size the portrait fit allows. At 90/90 it reached 813 px and looked excellent — but the finger hand
  was reduced to a fingertip and a sliver of fist, and the hand carries seven lines of technique. So
  the right gutter came back and the abacus settled at **740 px**, up from 630.
- **The horizon comes up 0.10 in portrait.** At the shared fraction the sea line landed *below* the
  abacus's feet, so the instrument floated over the water with a field of empty sand beneath it.
- **The parasol moved** to `x 1.02 · y 0.97` in portrait: at the 16:9 position its canopy landed on
  the plus character, which now stands in the bottom-right.
- **The subscribe beat was regrouped** — the Like chip and its card were 270 px apart with empty sky
  between them and the text card sitting on the horizon line.

### Two guard boxes that disagreed with their own artwork

The bucket's box was derived from `175 * scale * 0.72` while the pail was drawn at `scale * 1.05`,
and the plus character's box repeated its placement arithmetic instead of sharing it. Both meant the
art could be clipped or off-frame with the guard reporting nothing wrong — the character only
surfaced because it happened to fail a *frame-bounds* check. Both now come from one function used by
the drawing **and** the box (`bucketAt`/`bucketRect`, `plusAt`). **A guard box must be derived from
the same numbers as the thing it guards, or it is guarding a different shape.**

---

## 4:5 review pass 1 (2026-08-06)

| # | Note | What it actually was |
|---|---|---|
| 1 | Bottom-right umbrella is cut | I had pushed it to `x 1.02` to clear the character, which sliced it on the frame edge. **Dropped in portrait**: the bucket holds the bottom-left, the character the bottom-right, and there is no third corner. The starfish and shells carry the dressing in that cut — they are small and set away from the edges, so they cannot be cut. |
| 2 | Question card not centred horizontally | Real, and 39 px. `left` positions the element at its NATURAL width and `SumCard` then scales about its own top-centre, so centring the **scaled** width pushed it right. The laid-out box has to be centred; the guard box stays the scaled one. |
| 3 | Index finger shown for five, no thumb for the lower beads | The hands were listed **per phrase**, so the heaven bead got a finger on all six of its lines and thirteen lower-bead pushes got none — the identical failure to the missing bead arrows. Replaced with `handFor(p)`, derived from the move: earth up → **thumb**, earth down → index, heaven either way → index. |
| 4 | Like-and-subscribe text card overlaying | `SubscribeCard` is TWO pills — Like and a red Subscribe — 246 px tall. My previous "regrouping" put the text card at 250 and it covered the Subscribe button completely. The closing beats are not registered with the overlap guard, which is why nothing caught it. |
| 5 | Phone too narrow; "Vedaavi Learning Apps" on two lines | The 4:5 phone was 245 px in a 1080 frame — under a quarter of the width. Now 353. The developer line also gets `white-space: nowrap`, because no real store listing wraps it. |

### The thumb cost the multi-bead arrows, briefly

`BeadArrow` was suppressed whenever a hand was present, so the moment lower-bead lines gained a
thumb, "push three more lower beads up" went from three arrows to one. Now that both draw the same
glyph there is no reason to choose: `FingerHand` takes `showArrow={false}` under `beadArrows`, and
every arrow in the frame comes from one place.

That in turn revealed a third-order collision — the arrows run straight up the middle of the beads,
which is exactly where the count badges sit. So **a badge now waits for its bead**: already-raised
beads keep theirs from the first frame, arriving ones get theirs as they land, by which time the
arrow has faded. Better teaching as well as a fix; a badge counting a bead that has not moved yet was
premature either way. Gated on `colorOnArrival`, so E01 and E02 are untouched.

**Both cuts were re-rendered** — items 3, and its two consequences, are shared logic, not 4:5 layout.

### The parasol, again

Reported as dropped in portrait; it was not. The scripted replacement matched nothing, the file went
back unchanged, and I never checked — typecheck passes trivially when nothing changed, and world props
are not registered with the overlap guard. Now gated on a real `!portrait` flag and verified in a
rendered frame. See DESIGN_SYSTEM §8n.
