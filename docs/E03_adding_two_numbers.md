# E03 · Adding two numbers — script

Follows E02's promise: *"See you in the next video, where we'll add two numbers together on
the abacus."*

Read `EPISODE_RULES.md` before building this. Format 16:9 **and** 4:5, one reel, two
registry entries.

**Length: 52 spoken lines, 334 words ≈ 2:21** at 145 wpm, ≈ **2:24** with the recall gap.
56 phrases.

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

## 1 · HOOK (0:00–0:14) · `harbour`

| # | Voiceover | On screen |
|---|---|---|
| 1 | Last time we made every number from zero to nine. | The rod counts 0→9 quickly, a recap of E02's close. |
| 2 | Today we put two numbers together. | Two small bead groups slide toward each other. |
| 3 | That is called adding. | The `+` character bounces in for the first time. |
| 4 | And the abacus makes it easy. | Rod clears to zero; bucket appears, empty. |

## 2 · WHAT ADDING LOOKS LIKE (0:14–0:30) · `sandpit`

| # | Voiceover | On screen |
|---|---|---|
| 5 | Adding just means moving more beads to the beam. | A bead slides up; the beam glows. |
| 6 | Start with your first number. | `2` set on the rod. |
| 7 | Then push up as many beads as you need. | `+` shoves one more up. |
| 8 | The rod shows the answer all by itself. | `ValueReadout: 3`, bucket shows 3. |

## 3 · ONE PLUS TWO (0:30–0:52) · `pebbles`

App Chapter 1, step 3 — its own example.

| # | Voiceover | On screen |
|---|---|---|
| 9 | Let's try one plus two. | Card: `1 + 2`. Rod at zero. |
| 10 | First, push one lower bead up. | Thumb pushes 1 up. |
| 11 | That is one. | Big `1`. Bucket: 1. |
| 12 | Now push two more up. | `+` pushes two beads, one at a time. |
| 13 | One, two. | The two new beads number themselves as they land. |
| 14 | That is three. One plus two is three. | Big `3`. Card completes: `1 + 2 = 3`. |

## 4 · TWO PLUS TWO (0:52–1:10) · `shells`

App Chapter 1, step 4.

| # | Voiceover | On screen |
|---|---|---|
| 15 | Now let's try two plus two. | Rod resets to zero, then 2. Card: `2 + 2`. |
| 16 | Start with two beads up. | 2 beads at the beam, numbered 1-2. |
| 17 | Push two more up. | `+` pushes the last two. |
| 18 | Now four beads are touching the beam. | All four lower beads up, numbered 1-4. |
| 19 | Two plus two is four. | Big `4`. Bucket: 4. |

## 5 · THE LOWER-BEAD RULE (1:10–1:24) · `slatecliff`

| # | Voiceover | On screen |
|---|---|---|
| 20 | Every lower bead you push up adds one. | One bead rises, `+1` beside it. |
| 21 | But there are only four of them. | The four pulse together; a `4` stamp. |
| 22 | So the lower beads alone can make one, two, three or four. | `1 2 3 4` fill in along the slate. |

## 6 · THE UPPER BEAD ADDS FIVE (1:24–1:44) · `goldenhour`

App Chapter 2, steps 1-2.

| # | Voiceover | On screen |
|---|---|---|
| 23 | To add five, we use the upper bead. | Camera lifts; the upper bead glows gold. |
| 24 | Start with nothing. | Rod clears to zero. |
| 25 | Push the upper bead down. | Index finger, arrow down, bead to the beam. |
| 26 | That is five. | Big `5`. Bucket jumps 0→5 in one go. |
| 27 | One bead, one move. | The four lower beads pulse once, dimmed, for contrast. |

## 7 · FIVE PLUS ONE, FIVE PLUS FOUR (1:44–2:06) · `rockpool`

App Chapter 2, steps 3-4.

| # | Voiceover | On screen |
|---|---|---|
| 28 | Now five plus one. | Card: `5 + 1`. Upper bead stays down all section. |
| 29 | The upper bead is already down. | It pulses; the lower half stays quiet. |
| 30 | Push one lower bead up. | `+` pushes 1. Big `6`. |
| 31 | Five plus one is six. | Card completes. Bucket: 6. |
| 32 | And five plus four. | Card: `5 + 4`. |
| 33 | Push all four lower beads up. | Four rise together. |
| 34 | Five plus four is nine. | Big `9`. `MAX 9` stamp — callback to E02. |

## 7b · FROM ANY NUMBER (2:06–2:24) · `rockpool`

The generalising beat. Everything before it starts from five, which would leave a child
thinking the upper bead has to be the FIRST thing. Both pairs are in the app's own Chapter 2
practice pool (`Level2Content.swift:263` generates 6+1, 6+2, **6+3**, **7+1**, 7+2, 8+1).

| # | Voiceover | On screen |
|---|---|---|
| 35 | It works from any number, not just five. | The `5` card fades; a `?` takes its place. |
| 36 | Six plus three. | Rod set to 6 — upper bead down, one lower up. Card `6 + 3`. |
| 37 | Six is already on the rod, so push three more lower beads up. | `+` pushes three; they number 2-3-4. |
| 38 | That is nine. | Big `9`. Bucket: 9. |
| 39 | Now seven plus one. | Rod resets to 7. Card `7 + 1`. |
| 40 | Push one more lower bead up. That is eight. | One bead rises. Big `8`. |

## 8 · YOUR TURN (2:24–2:40) · `sunsetsea`

`5 + 2` — from the app's own Chapter 2 practice pool.

| # | Voiceover | On screen |
|---|---|---|
| 35 | Your turn. Five plus two. | Card `5 + 2 = ?`. Rod at zero. **Hold three full seconds.** |
| 36 | Push the upper bead down, then two lower beads up. | The two moves, in order. |
| 37 | That is seven. | Big `7`. Bucket: 7. |
| 38 | Nice work. | Praise chime, the `+` cheers. |

## 9 · WHEN THE BEADS RUN OUT (2:22–2:32) · `sunsetsea`

The app's own Chapter 6 opening, shown and **not** taught.

| # | Voiceover | On screen |
|---|---|---|
| 45 | One more thing. | Rod set to 1. |
| 46 | Sometimes there is no room left for more lower beads. | `1 + 4` card; the `+` pushes and **bounces off** — only three free. **(the gag)** |
| 47 | There is a clever trick for that, and we will learn it soon. | A `?` over the rod; the `+` shrugs at camera. |

## 10 · CLOSE (2:32–2:52) · `sunsetsea`

| # | Voiceover | On screen |
|---|---|---|
| 42 | Now try it yourself. Add two small numbers on your abacus. | The rod works through `1+1`, `2+2`, `5+3`, beads moving. No phone. |
| 43 | If you liked this, tap like and subscribe for more. | `SubscribeCard`. |
| 44 | Search for abacus kids on the Apple App Store or Google Play. | Store flow → detail → GET. No caption. |
| 52 | See you in the next video, where we put bigger numbers on the abacus. | `NextUpCard`: a two-rod abacus showing `2 4`. |

**Close is the four beats** (EPISODE_RULES §3.9): practice → like & subscribe → download →
teaser. The practice line is new wording, and it promises no schedule.

---

## Audio

- One human take, all 45 lines, from `E03_lines.txt`. No TTS.
- **Hold three full seconds** after line 35. The recall beat is the point.
- `tools/align_by_matching.py` only. Numbers stay words; `canon()` matches them to Whisper's
  digits.
- SFX: a bead click on every real move; the app's chime on 26, 37; `clap.mp3` under 38; a
  **new comic boing** for the `+` bouncing off at line 40 — `nope.mp3` is E02's and means
  "there is nothing there", which is not what happens here.
- Keep the mix peak under −1 dB.

## Verification, beyond the standard checklist

1. **Value matches the words in every frame.** 0,1,3 · 2,4 · 5,6,9 · 7 · 1.
2. **No illegal bead moves.** Every example here is DIRECT: no line ever needs a complement.
3. **The upper bead never moves during lines 28-34** — only lower beads do.
4. Read the caption against the card in the same frame, for all 45 lines, in **both cuts**.
