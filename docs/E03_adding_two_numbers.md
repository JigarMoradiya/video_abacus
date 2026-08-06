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
