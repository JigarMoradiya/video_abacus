# Abacus Learning Video Series — Plan & Porting Spec

Porting the phonics video pipeline (`eng/video-pipeline`) to the Abacus app.
Source method: `eng/video-pipeline/docs/PORTING_TO_A_NEW_APP.md`.

**Decision:** a **curriculum series** — teaching episodes that mirror the app's own levels and
chapters, built as *templates + data tables*, not a folder of one-off reels. The app appears as the
place to continue, never as the subject. This is the model that made 42 phonics videos maintainable.

**Status (2026-08-04): Episodes 1 and 2 are DONE.**
- `out/e01_meet_the_abacus.mp4` — 16:9, 7784 frames (4:19), narration + SFX. Approved.
- `out/e02_numbers_0_to_9.mp4` — 16:9, **5031 frames (2:48)**, narration + SFX, eight new
  worlds, peak −2.9 dB. Zero STALE, zero QUIET, zero FROZEN beats.

The nine per-number shorts move to their own 9:16 series.

**The episode template now exists.** `src/stage/` holds the shared Scene interpreter and E01
was ported onto it, so E03 is `sceneFor` + its own props + one registry line rather than
another 1500-line reel. The port is verified by 79 byte-identical phrase stills — do the same
before and after any future change to shared code (`tools/phrase_stills.mjs --png`).

This project is now a **git repository**; it was not when the refactor started.

What exists now, reusable for every later episode:
- **Timing** — `tools/align_by_matching.py` (sequence-matched, worst drift 0.50 s; the
  inherited greedy aligner drifted 15.6 s and was unusable).
- **Line map** — `tools/gen_line_map.py` derives tooltip/highlight/count per line from the
  spoken TEXT, and `tools/check_line_sync.py` fails if a line names one part while its card
  is about another. Never hand-number these.
- **Visual system** — `src/data/theme.ts` (12 worlds), `Abacus.tsx` (hexagonal soroban),
  `Tooltip.tsx` (colour cards from the app's own tour wording), `World.tsx`, `PartArrow.tsx`,
  `AppShowcase.tsx` (Free Mode + store flow), `Brand.tsx`.
- **Audio** — the app's SFX plus `tools/make_reveal_sfx.py` for original stings.
- **Assets** — real app icon, real store screenshots, both store badges in `public/brand/`.

---

## 1. The hook — write this before any script

> **"Your child can count to 100… but still counts on their fingers to do 7 + 8."**

This is the series' spine. It names a gap the parent has already noticed but can't explain — the same
shape as the phonics line ("can sing the whole alphabet… still can't read *cat*"). It becomes the
title of episode 1, the thumbnail text, the first caption line, and the push notification.

Every episode must be able to answer: *which invisible missing step does this one fix?*

---

## 2. The five constraints, adapted

| # | Phonics constraint | Status for Abacus |
|---|---|---|
| 1 | Fully code-generated. No camera, no TTS. | **Unchanged.** Every frame is React; every voice is a real human take. |
| 2 | Script first. Confirm. Then build. | **Unchanged.** A script change after the build is a rebuild. |
| 3 | Constant motion — something animates every second. | **Unchanged.** Idle bob/float/pulse on everything by default. |
| 4 | Every video feels different from the last. | **Unchanged**, and easier — see §10, the world/metaphor table. |
| 5 | Reuse the app's own audio and art. | **Changed — read carefully.** |

### Why constraint 5 changes

The phonics app held 1,859 recorded word clips and hundreds of illustrations. The Abacus app holds
**13 sound files and zero recorded voice** — the "Voice Pronunciation" setting is device TTS, which
constraint 1 forbids on video. So:

- **All narration and all spoken words must be newly recorded.** No existing library to draw on.
- **But the recording set is genuinely small** — roughly **80 short clips** (number names, operation
  words, bead vocabulary, praise takes) plus one narration take per episode. That's two recording
  sessions, against months of phonics recording. See §9.
- **Art needs no sourcing at all.** Beads and rods are shapes with positions, so a bead frame is
  cheaper to draw than an illustrated word — and it animates for free.
- **The SFX kit does transfer.** Reuse the app's real sounds so the video sounds like the app:
  `abacus_move.mp3`, `abacus_reset.mp3`, `clap.mp3`, `play_win.mp3`, `option_correct_ans.mp3`,
  `btn_click.mp3`. Copy them into the pipeline's `public/audio/sfx/`.

### The three existing Abacus video docs are not usable as production plans

`MARKETING_VIDEOS.md`, `MARKETING_30_SCRIPTS.md` and `MARKETING_VIDEO_SCRIPTS.md` all assume a kid on
camera, sped-up screen recordings, and trending audio attached at upload. Constraint 1 rules out the
camera; §9 rules out baked-in trending audio. **Mine them for hooks, angles and CTA wording only** —
several are excellent (the calculator race, "the trick schools don't teach", "screen time you won't
feel guilty about") and map directly onto episodes below.

---

## 3. What the app hands us for free

Three findings that materially reduce the build. All verified in the iOS source.

### A palette engine already exists — 14 abacus themes
`iOS/Abacus/Utils/Abacus Presets/Core/ColorPresets.swift` defines 14 themes (`poligon_blue`,
`poligon_purple`, `poligon_green`, …), each a consistent Material ramp:

```
abacusTopGradient    = 500   e.g. blue 3F51B5
abacusCenterGradient = 300        7986CB
abacusBottomGradient = 50         E8EAF6
buttonColor          = 800        283593
columnColors         = 200        9FA8DA
```

This *is* the sibling trick from the porting doc, already built and already shipped in the app. **Each
episode takes one app theme as its palette.** Brand identical, episode distinct, and the video's
colours are literally the colours the child sees in the app. Do not invent new palettes.

### The bead-movement data model already exists
`iOS/Abacus/Common/Models/FormulaStepDirection.swift`:

```swift
struct Movement {
    var upperUp, upperDown: Bool
    var lowerUp, lowerDown: Int
    var lowerOldValue: Int
}
struct RodMovement { let rodIndex: Int; … }
enum AbacusFormulaType { smallFriend, smallFriendSub, bigFriend, bigFriendSub, combination, … }
```

Port this struct verbatim to TypeScript as the animation input. **Consequence: the video's bead moves
are computed by the same model as the app's**, so they cannot drift from what the child is taught
in-app. `AbacusCalculations.swift` is the reference for how movements are derived per step.

### Real bead geometry
`Abacus/Utils/Constants/DimensionsUtils.swift` — phone values, scale up for 1080-wide video:

| Property | Phone value | Note |
|---|---|---|
| bead width × height | 45 × 25 | aspect ratio **1.8**, locked across all themes |
| beam height | 4 | |
| frame line width / corner | 16 / 12 | |
| column spacing | 1 | |
| value text size | 15 | |

**Soroban layout is locked: 1 heaven bead + 4 earth beads per rod.** Never draw a fifth earth bead,
never mix in the Chinese 5+2 suanpan. The app is a soroban; the videos must be too.

---

## 4. Project setup

New sibling project: **`abacus/video-pipeline/`**. Not a folder inside the phonics project.

Reasoning: different brand, different data model, and the phonics `out/` is already 2.4 GB. Mixing
them means every abacus render risks a phonics regression, which is exactly what per-project isolation
prevented last time.

**Copy from `eng/video-pipeline`:**

| Path | Action |
|---|---|
| `src/lib/timing.ts`, `src/lib/motion.ts` | copy as-is — the highest-value files in the repo |
| `tools/align_audio.py` | copy as-is — forced alignment, the single biggest leverage tool |
| `tools/refine_phrase_onsets.py` | copy — needed for repeated identical words (see §9) |
| `tools/make_music.py`, `make_sfx.py`, `make_brand_chime.py` | copy, then re-tune (§9) |
| `tools/render.sh`, `preflight.sh`, `check_video.sh`, `motion_check.py`, `phrase_sheet.py` | copy as-is |
| `src/Root.tsx`, `src/reels/index.ts` | copy the **registry pattern**, empty the entries |
| `src/components/Caption.tsx`, `Subtitles.tsx`, `Confetti.tsx`, `Mascot.tsx`, `BrandMarks.tsx`, `Watermark.tsx`, `Scene.tsx`, `Stage.tsx`, `StoreOutro*.tsx` | copy, restyle to Abacus brand |
| `remotion.config.ts`, `tsconfig.json`, `package.json` | copy; rename package to `abacus-video-pipeline` |
| every `*World*.tsx`, `Letter*.tsx`, `Word*.tsx`, `Mouth.tsx`, `TraceGlyph.tsx`, `PhonicsMouth.tsx` | **do not copy** — phonics-specific |

**Registry rules, carried over unchanged:**
- One entry per video: `{ id, component, durationInFrames, width?, height? }`; `Root.tsx` maps each to
  a composition. Adding an episode is one line.
- Composition ids use **hyphens**. Remotion forbids underscores.
- Per-entry `width`/`height` so 9:16 and 16:9 cuts coexist in one project.
- Stills (thumbnails, poll cards) are entries with `durationInFrames: 1`.
- One file per episode in `src/reels/`. Editing one episode must never touch another.
- Durations compute at module-eval, so composition length is known without rendering.

**Neither `abacus/` nor `eng/` is a git repository.** Before building, run `git init` in `abacus/` with
a `.gitignore` covering `video-pipeline/out/`, `video-pipeline/node_modules/`, `build/`. Without this,
there is no way to roll back a bad render pass — and the phonics series needed that repeatedly.

---

## 5. The teaching-device kit

Each phonics device maps to one Abacus component. Build these once; every episode composes them.

| Component | Replaces | What it does |
|---|---|---|
| `AbacusFrame` | — | Code-drawn soroban. Props: `columns` (1–3), `theme`, `value`. Geometry from §3. |
| `BeadSlide` | `TraceGlyph` | A bead travels its rod in real time, finger shown. The signature motion of the series. |
| `FingerHand` | `Mouth` / `PhonicsMouth` | Thumb pushes earth beads up; index finger pushes earth down and works the heaven bead. **This is the differentiator — budget for it properly.** It carries the same weight as the mouth-shape work, and it's what a parent can copy. |
| `NumberFace` | `LetterFace` | The numeral as a character. Per-episode expression from the data row. |
| `WaysToMake` | "More A words" 6 tiles | *"More ways to make 7"* — 5+2, 4+3, 6+1 tiles lighting as each is spoken. |
| `BlockedCase` | — | **New, and the most important device in the series.** The moment the beads run out: 3 + 4 with one earth bead left. Freeze, let it be uncomfortable, then the formula rescues it. This single beat is the whole argument for abacus formulas. |
| `YourTurn` | "Your turn!" + silent gap | Problem shown, gap held, then reveal with the bead move. Active recall. |
| `CompareCard` | ai vs ay comparison card | *Which friend?* Adding 4 as `−1+5` versus `+10−6`, and when each applies. |
| `NextUpCard` | "Tomorrow: E" | *"Next: number 1."* Chains each episode to the following one. **Never says "tomorrow"** — the series does not post daily, and a promise the schedule cannot keep costs trust. |
| `ValueReadout` | — | The running number, mirroring the app's display panel. **Must match the beads in every frame, including mid-transition.** |
| `CollapseRow` | `CollapseRow` (LettersPinkFx) | Copy as-is. Anchored flex column, each beat a row whose height and content scale by progress. No holes, overlap impossible by construction. |

---

## 6. The episode map

47 episodes across 6 seasons, built from **6 templates**. Season order *is* the curriculum — unlike
letters, this cannot be reordered.

### Season 1 — Bead Basics (app Level 1) · 12 episodes

| id | Template | Content | Format |
|---|---|---|---|
| `meet-the-abacus` | `HeroLesson` | **The complete Free Mode abacus tour** — all 18 steps (§6a), plus the centre-rod rule (§6b). ~4:49. | 16:9; separate 9:16 script |
| `numbers-0-to-9` | `HeroLesson` | **E02, BUILT (2:48).** App Lessons 2 + 3 in one: zero, 1-4 on the lower beads, the wall at four, the upper bead = five, then 6-9. A child can read any single rod when it ends. ~2:32 | 16:9 |
| `number-1` … `number-9` | `NumberShort` × 9 data rows | One short per number, as a **separate 9:16 shorts series** — decided 2026-08-04. A 40-second short per number works; a 4-minute episode about the number 1 does not, and it would split what the app teaches as one lesson across nine videos. | 9:16 |
| `making-ten` | `HeroLesson` | Place value: the rod fills, the ten moves left | 16:9 + 9:16 |
| `read-any-number` | `HeroLesson` | 2-digit reading to 99 | 9:16 |

### 6a. Episode 1 is sourced from Free Mode, not from Level 1 Lesson 1

Both modules were read before scripting. **Level 1 → Lesson 1 → Learn**
(`Level1Content.swift:142`) has only 5 steps — what is an abacus, frame & beam, the heaven bead, the
earth beads, reading 5+3=8. **Free Mode's abacus tour** is far fuller: 18 steps, defined in
`Strings.freeModeHighlightSteps:41` and driven by `AbacusWithDecimalView.swift:151–219`.
(`AbacusFreeModeView` is the live view, routed from `HomeView.swift:874`; the `Temp`/`Temp2` variants
are dead copies — don't read those.)

The tour's 18 steps:

| Group | Steps | Content |
|---|---|---|
| Anatomy | 0–6 | Frame · Rods/Columns · Bar/Beam · Top section · Bottom section · Upper Beads · Lower Beads |
| Place | 7 | Unit's Place (Ones column) |
| Bead values | 8–10 | Rod 1: lower=1, upper=5 · Rod 2: lower=10, upper=50 · Rod 3: lower=100, upper=500 |
| Capacity | 11–13 | 1 column = 0–9 · 2 = 0–99 · 3 = 0–999 |
| Finger technique | 14–17 | Add: **thumb** moves lower beads up · Add: **index finger** moves upper bead down · Subtract: **index finger** moves lower beads down · Subtract: **thumb** moves upper bead up |

**Decision: episode 1 covers all 18 steps in one long 16:9 episode**, opening with Lesson 1's "long
before calculators" framing and closing on its read-a-number payoff (5 + 3 = 8). Full sentences, not
fragments, plus one added section (§7a) covering where the ones column sits on a big abacus — see §6b.
Script: `video-pipeline/docs/E01_meet_the_abacus.md`, recording lines in `E01_lines.txt`.
**41 spoken lines, 652 words ≈ 4:49.**

The 9:16 version needs a **purpose-written ~70 s script**, not a selection of these lines — the
leanest usable subset still runs ~2:45. Separate deliverable, after this episode ships.

**Vocabulary law for the whole series:** **upper beads / lower beads** are the primary terms, matching
the Free Mode tour. The script says once that *"you may also hear them called heaven beads and earth
beads"*, so a parent who searches the term recognises it. Level 1 Lesson 1 and `AbacusFormulaType` use
heaven/earth, so this one aside is what keeps the video consistent with both screens.

**Label colours are the app's own** — reuse them exactly, so a child who watched the video recognises
the same colour coding in Free Mode:

| Part | Hex |
|---|---|
| Frame | `#FF5722` |
| Rods / columns | `#0000EE` |
| Beam / bar | `#6200EA` |
| Upper beads / top section | `#E91E63` |
| Lower beads / bottom section | `#9C27B0` |
| "value is 1" (lower) | `#D81B60` |
| "value is 5" (upper) | `#388E3C` |
| Capacity numbers | `#EE0000` |

**Finger technique is lower-risk than first assumed.** Tour steps 14–17 are not static tooltips — each
calls `MathUtils().calculateRodMovements(from:to:rods:)` (0→4, 0→5, 4→0, 5→0) with
`showDirectionHints = true`, so the app already renders directional bead arrows for all four rules.
`FingerHand` has a verified in-app reference for every case, and the wording to teach is already fixed.

**Two divergences from the app, accepted knowingly:**
- Free Mode runs a **13-column** abacus with 6 decimal rods (`totalValue / 1_000_000`). **Episode 1
  uses 5 rods**, held constant except for §7a. Rod pitch is fixed at 115 px by the stage height (the
  app's own `aspectRatio(rods × 0.185)`), so fewer rods buys no bead size — it only empties the frame.
  5 makes "the rods" and "the rod on the far right" literally true, and leaves 673 px of clear space
  each side for labels. Focus comes from dimming to 0.15 opacity and a camera push-in, exactly as the
  app's tour does — not from rebuilding the abacus.

### 6b. Where the ones column is — a series-wide rule, and a false-rule trap

**On a big abacus you count from the centre rod, not the far right.** The rods right of centre are
decimal places. On a small abacus (5 or 7 rods) there are no decimal rods, so counting starts at the
far right.

The app is unambiguous about this: Free Mode formats `%013ld` and takes `suffix(6)` as the fractional
part, so its 13 rods are **6 integer rods · the ones rod at centre · 6 decimal rods**. The ones column
is rod 7 of 13.

**This is a false-rule trap in the exact sense the porting doc warns about.** "The ones column is on
the far right" is true of the video's 5-rod abacus and false of the abacus the child meets when they
open the app. Taught unqualified, it sends them to a decimal rod on their first attempt.

Rules for every episode from here on:

1. Any episode that says "far right" must **qualify it with the abacus size on screen**
   ("on an abacus this size…"), never state it as a universal.
2. **Episode 1 carries the full explanation** in §7a — three lines showing the 13-rod layout, the
   centre ones column, and the six decimal rods, then returning to 5. Later episodes may then rely on
   it rather than re-teaching it.
3. Rod-count changes are always a **widen of the same component**, never a remount — a remount restarts
   idle motion and breaks the one-global-layer rule.
4. Decimals are never *taught* in Season 1. §7a exists only so the child isn't confused by what they
   see in Free Mode.
- `abacusBottomLabels` uses Indian numbering (Lakhs, Ten Lakhs). No effect on episode 1 (0–999), but
  `read-any-number` and beyond must decide between Lakhs and Thousands/Millions for a global audience.

### Season 2 — Direct Add & Subtract (app L2 ch1–4) · 5 episodes

| id | Template | Content |
|---|---|---|
| `earth-bead-add` | `DirectOpShort` | Direct addition, result ≤ 4 |
| `heaven-bead-add` | `DirectOpShort` | Addition using the heaven bead, no formula |
| `earth-bead-subtract` | `DirectOpShort` | Direct subtraction, earth range |
| `heaven-bead-subtract` | `DirectOpShort` | Direct subtraction, heaven bead involved |
| `beat-the-beads-1` | `RecapQuiz` | Mixed recall of S1+S2 |

### Season 3 — Little Friends, complements of 5 (app ch5–7) · 10 episodes

| id | Template | Content |
|---|---|---|
| `why-formulas` | `HeroLesson` | **`BlockedCase` episode.** The highest-hook teaching video in the series — this is "the trick schools don't teach". |
| `little-friend-plus-1` … `-4` | `FriendShort` × 4 rows | `+1=−4+5`, `+2=−3+5`, `+3=−2+5`, `+4=−1+5` |
| `little-friend-minus-1` … `-4` | `FriendShort` × 4 rows (mirrored) | `−1=−5+4`, `−2=−5+3`, `−3=−5+2`, `−4=−5+1` |
| `beat-the-beads-2` | `RecapQuiz` | Little Friend recall |

*One episode per case here, not per pair — this is the first real rule and each case earns its own
short. It's also the app's own chapter split (ch6, ch7).*

### Season 4 — Big Friends, complements of 10 (app ch8–9) · 12 episodes

| id | Template | Content |
|---|---|---|
| `meet-big-friend` | `HeroLesson` | Carry to the tens rod. **2-column abacus from here on**, matching the app. |
| `big-friend-plus-1-9`, `-2-8`, `-3-7`, `-4-6`, `-5-5` | `FriendShort` × 5 rows | Taught as complement *pairs* |
| `big-friend-minus-1-9` … `-5-5` | `FriendShort` × 5 rows | Borrow from tens |
| `beat-the-beads-3` | `RecapQuiz` | Big Friend recall |

*Pairs rather than 18 singles: complements of 10 come in pairs (1&9, 2&8, 3&7, 4&6, 5&5), teaching
them paired is better pedagogy and halves the episode count at no loss.*

### Season 5 — Family (app ch10) · 3 episodes
`family-plus` (+5−10) · `family-minus` (−5+10) — both on `FriendShort`, since Family is the two
friends combined · `beat-the-beads-4`

### Season 6 — Anzan & Speed (app Level 3) · 5 episodes
The WOW pillar, and where the "faster than a calculator" hook finally pays off.
`beads-in-your-head` (the abacus fades and lights up inside the head) · `semi-anzan` · `full-anzan` ·
`speed-drill` · `flash-challenge`

### Later — Times Tables (app Level 4)
Deferred. Level 4 is the existing Times Table feature and doesn't depend on the soroban curriculum, so
it can be its own mini-season whenever it's wanted.

### Template count

| Template | Episodes served |
|---|---|
| `HeroLesson` (16:9, long) | 5 |
| `NumberShort` | 9 |
| `DirectOpShort` | 4 |
| `FriendShort` | 20 |
| `RecapQuiz` | 4 |
| `AnzanShort` | 5 |

**47 episodes, 6 templates.** Budget the effort into the templates and the data model; the episodes
then cost almost nothing. This is the single decision that made the phonics series survive.

Scope note: this document is the plan for all 47. The **first implementation plan covers Phase 0 and
Phase 1 only** (pipeline port + one complete episode). Each later phase gets its own plan, written
after the previous one has shipped.

---

## 7. Build order

Strictly sequential. Each phase gates the next.

**Phase 0 — port the pipeline.** Scaffold `abacus/video-pipeline`, copy per §4, `git init`, get an
empty composition rendering. Copy the app's SFX in. Re-tune the music bed (§9). No episode content.

**Phase 1 — one complete episode, end to end.** `meet-the-abacus`: script → approval → single human
narration take → `align_audio.py` → `AbacusFrame` + `BeadSlide` + `FingerHand` → render → contact
sheet → 1:1 frame crops → ship. **Do not start a second episode before this one is shipped.** Every
layout rule in §8 earns its keep here, and this episode becomes the template the rest of the series
costs almost nothing to produce.

**Phase 2 — the `NumberShort` template + 9 data rows.** This is where the template-and-data-table
pattern gets proven. If adding `number-7` isn't a data edit, the template is wrong — fix the template,
not the episode.

**Phase 3 — Season 2** (`DirectOpShort`, 4 rows + recap).

**Phase 4 — `why-formulas`.** Build `BlockedCase` properly here; it's reused by every remaining season
and it's the strongest marketing asset in the whole plan.

**Phase 5 — `FriendShort` template**, then Season 3's 8 rows, then Season 4's 10 rows. Season 4 needs
2-column support in `AbacusFrame` — add it before the Big Friend rows, not during.

**Phase 6 — Season 5**, then **Phase 7 — Season 6** (Anzan; new visual language, budget for it).

---

## 8. Format and the layout law

### Format
- **Under ~90 s → 9:16 first.** Posts as a Short/Reel on all three platforms. Most episodes.
- **Over ~90 s → 16:9 first**, captions on. The `HeroLesson` episodes — except `read-any-number`,
  which is short enough to stay 9:16 only.
- **A vertical cut is not a crop.** It shares the narration and beat map (imported, never
  copy-pasted) but gets a genuinely different world and theme.
- **Frame 0 is the upload thumbnail** — a finished image. For Abacus that means **a complete abacus
  with the number already set**. Nothing may start mid-spring; only idle motion, which has a defined
  value at frame 0.

### Bands for 9:16 (1080 × 1920) — declare as named constants, never eyeball

```
HEADLINE   0    – 320
STAGE      340  – 1120     ← abacus + FingerHand live here; 2-column needs the full height
CAPTION    1140 – 1440
RESERVED   1450 – 1920     ← SAFE_BOTTOM, platform UI covers it
```

Counters, progress rails and the `ValueReadout` go at the **top**. Any new overlay must fit inside a
band; nothing may cross one. One phonics video shipped with panels at y=205 while overlays rendered
from y=40 down, and three elements landed on a street sign.

### Rules paid for once already — apply from the first frame

- **Every spoken LINE gets its own visual change.** Not every beat — every *line*. A changing caption
  does not count as a changing screen. No audio-only stretch anywhere. *(Cost of learning it on
  phonics: ~10 review rounds on one video.)*
- **Use `CollapseRow` for staged beats.** Opacity-only transitions left a 487 px hole; fixed pixel
  heights with `overflow:hidden` sliced the mascot's feet mid-transition.
- **`transform: scale()` reserves no layout space.** Pulse a whole card, never a child of it — a
  scaled child pushed outside its card border, but only for content with no slack, so it looked fine
  in testing.
- **A container that stays on screen must never be empty.** Persisting panels need content in *every*
  beat, including a resting state — a dimmed number, a ghost `?`.
- **The background is ONE global layer on the absolute frame.** Per-scene backgrounds restart their
  animation at every cut and drifting particles visibly jump. Never paint an opaque background inside
  a scene.
- **Never overlap, never clip. Check mid-transition frames**, not just resting states.
- **Composite emoji break** — anything joined with a zero-width joiner renders as garbage. Test every
  emoji in an actual frame.

### Abacus-specific traps — new, and the dangerous ones

- **Every bead move must be physically legal.** No bead passes through the beam or through another
  bead. Pushing three earth beads moves them **as a group**, not independently.
- **Finger technique must be correct.** Thumb pushes earth beads **up**; index finger pushes earth
  beads **down** and works the heaven bead. A wrong finger teaches a habit the child will have to
  unlearn — and unlike a mispronounced sound, **a parent cannot detect the error**. Verify every
  `FingerHand` beat against `AbacusFreeModeView.swift`'s finger-movement guidance before shipping.
- **`ValueReadout` must match the beads in every single frame**, mid-transition included. Add this to
  the contact-sheet check as an explicit pass.
- **Never a fifth earth bead.** Soroban only: 1 heaven + 4 earth. Locked.
- **Never say "carry" without the tens rod on screen.** Big Friend episodes are 2-column, matching the
  app's own chapter 8 spec.
- **Never teach a partial pattern as a rule.** Abacus has shortcuts that hold only in some cases. Say
  "try it and check" and teach exceptions by sight, exactly as the ambiguous-vowel videos do.
- **Read the real app module before scripting any episode.** Open the actual Learn screen for that
  chapter and copy its real flow and real examples. The video is a trailer for a feature that exists;
  if they diverge, the app looks broken.

### Verification
`ffmpeg -i out/x.mp4 -vf "fps=1,scale=470:-1,tile=4x4" sheet_%02d.png` and **look at every second**.
Then crop real frames at 1:1 — overflow, caption collisions, safe-area breaches and bead/readout
mismatches are all invisible on a contact sheet.

---

## 9. Audio

> **A wrong asset path renders SILENT, not an error.** After any audio path change, measure energy in
> each expected window. That check is the only thing standing between you and 47 mute videos.

### Per-episode narration
One human take for the whole episode. No TTS. Measure it:
`ffprobe -v error -show_entries format=duration -of csv=p=0 <audio>`
Then `tools/align_audio.py <audio> <script.txt>` → `.phrases.json`, `.words.json`, `.srt`.
Beats are **phrase-index ranges** that auto-tile to the audio with no gaps; `beat.word("seven")` gives
the exact frame a word is spoken. **Measured times, never an even stagger** — an even stagger drifts
audibly against real speech.

### The clip library to record — ~80 items, two sessions

| Group | Items |
|---|---|
| Number names | one … twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, hundred (~29) |
| Operations | plus, minus, take away, equals, makes, and |
| Bead vocabulary | heaven bead, earth bead, rod, beam, frame, thumb, index finger, up, down, slide, clear |
| Formula names | Little Friend, Big Friend, Family, complement |
| Praise takes | Yes! / That's it! / Perfect! / Nearly! — 3 variants each, so no episode repeats a take |
| Framing lines | Your turn · Watch · Try it and check · Tomorrow |

Rules carried over:
- **Convert `.opus` to mp3 first** — the renderer can't decode opus.
- **Never trim a clip.** Play the whole recording and stage a visual over the tail.
- **Measure every duration with ffprobe and hardcode it** in the data file, so composition length is
  known at module-eval.
- **Never echo.** Don't play a recorded "seven" while the narration is saying seven. Recorded clips go
  in narration gaps only.
- **Alignment can't time repeated identical words** — it collapses them. "Meow meow meow" came out
  0.6 s wrong and 13 of 26 phonics episodes were mistimed before a second pass re-timed them from the
  audio envelope's syllable peaks. **This will bite Abacus harder**: counting beats are inherently
  repetitive ("one, two, three, four" and "plus five, plus five"). Run
  `tools/refine_phrase_onsets.py` on every counting episode as a matter of course, not as a fix.
- **Missing audio should degrade, not block.** A tile with no clip takes its turn silently, so
  episodes ship before every recording lands.

### Music — synthesize it. Not optional.
`tools/make_music.py`, pure Python sine synthesis, no samples. Facebook geo-muted a phonics reel
because its progression was C–Am–F–G — the most common progression in pop — and the fingerprinter
matched it against a licensed catalogue. Rewriting it as a **quartal pad on a 13-second loop** fixed
it, confirmed across two uploads.

For Abacus: keep the quartal approach, **change the loop length** (11 s, not 13, and never 4-bar
aligned) and pitch it a little lower so the two series don't sound identical. Avoid common
progressions entirely.

**Trending audio only earns distribution when attached in-app at upload.** Baked into the mp4 it gets
none of the lift and all of the copyright risk — which is why the existing three marketing docs'
"trending suspense→reveal sound" instruction cannot be followed here.

### SFX
Copy from the app and use them as the primary kit — the video should sound like the app:
`abacus_move.mp3` (bead click), `abacus_reset.mp3`, `clap.mp3`, `play_win.mp3`,
`option_correct_ans.mp3`, `option_wrong_ans.mp3`, `btn_click.mp3`.
Generate anything missing with `tools/make_sfx.py` / `make_smooth_sfx.py`.

---

## 10. Same brand, new story

### Locked across every episode

**The full visual foundation is `video-pipeline/docs/DESIGN_SYSTEM.md`** — ambient layer, sticker idiom,
bead states, the place-value colour scale, typography, focus mechanics and bands, all derived from the
iOS source. Read it before building any episode.

**Season 1 palettes come from the app's own vetted picks.** `AppTheme.colorBasedOnSelectedThemeTemp()`
maps abacus 1 → `poligon_cyan`, 2 → `poligon_skyblue`, 3 → `poligon_orange`, 4 → `poligon_yellow`. Those
four are the themes the app itself chooses for kid-facing screens, so draw from them first and leave the
muted themes (`brown`, `silver`, `black`) for the Anzan season where a darker mood is the point.
- One rounded display font; numbers always bold
- Exactly **one logo on screen at a time**, at one shared size
- Content anchored upper-middle, safe areas respected
- Mascot hosts; store badges close
- Soroban geometry and bead aspect ratio 1.8 (§3)
- Self-synthesized music bed + the app's SFX kit

### Must change every episode
The world, the metaphor, one signature gag, the colour mood, and **the closing CTA line** — never
reuse CTA wording. Pre-assigned so no two episodes collide:

**Every episode closes on the same three beats, in this order:** what the app lets them do next → **the
download CTA, naming both the Apple App Store and Google Play** → the `NextUpCard` teaser. The store CTA
is not optional; it is the only conversion moment in the episode. The teaser never says "tomorrow" — the
series does not post daily, and a promise the schedule cannot keep costs trust.

**⚠ The spoken app name is unresolved.** `STORE_LISTING_COPY.md` says *Abacus Math for Kids*,
`STORE_DESCRIPTIONS_ASO.md` says *Abacus Kids — Mental Math* (iOS) and *Abacus Kids — Mental Math &
Brain Training* (Play), and `MARKETING_30_SCRIPTS.md` says *Vedaavi Abacus*. Episode 1 currently says
**Abacus Kids**. Confirm the live store title before the first recording session: it is spoken aloud in
every episode, a wrong name sends viewers to a search result the app is not in, and fixing one line
means re-recording the whole take.

| Episode / group | World | Metaphor | Palette (app theme) |
|---|---|---|---|
| `meet-the-abacus` | Bead workshop | The abacus is a tiny machine you drive with two fingers | `poligon_cyan` |
| `number-1` … `number-9` | One shared world, per-episode look **derived from the data row** | Each numeral is a character with its own bead shape | 9 different app themes, one per number |
| `making-ten` | A lift / elevator | Ten fills the rod, so it rides up to the next floor | `poligon_skyblue` |
| `read-any-number` | House-number street | Every door is a two-rod number | `poligon_green` |
| Season 2 (direct ops) | Seesaw yard | Adding tips it one way, taking away the other | `poligon_yellow` |
| `heaven-bead-add` | Piggy bank | The heaven bead is the big coin worth five | `poligon_orange` |
| `why-formulas` | **A full parking lot** | No space left — so you trade a big spot for a small one | `poligon_red` |
| Little Friends (S3) | Playground | **Two kids who hold hands to make 5** — 1&4, 2&3 | `poligon_pink` |
| Big Friends (S4) | A ten-seat bus | Friends who pair to 10 — the bus only leaves full | `poligon_blue` |
| Family (S5) | Family dinner table | Both friends at once, sitting together | `poligon_purple` |
| Anzan (S6) | Starry mind-space | The abacus fades, then lights up **inside the head** | `poligon_black` |

Per-episode derived values for the template seasons (exactly the phonics letter-shorts pattern):
accent colour, background tint, `NumberFace` expression, confetti seed, example problem, praise take,
`NextUpCard` teaser. Adding a number to an episode is a data edit.

---

## 11. Publishing

One platform, one job. The same text pasted three times underperforms on all three.

| Platform | What the copy is for | Leads with |
|---|---|---|
| YouTube | Search — keywords, chapters and problem lists all get indexed | Front-loaded keywords in the title and first 150 characters |
| Facebook | Comments, which drive reach | Emotion, then a question. Link in the first comment, not the caption. |
| Instagram | The stop-scroll — only line one is visible | A curiosity hook specific to that episode |

- **YouTube chapters need ≥10 seconds between every entry.** One violation silently disables chapters
  for the whole video, with no warning. Check every gap before pasting.
- **Only the first 3 hashtags display** above a YouTube title. Spend them well.
- **`#viral` and `#trending` do nothing.**
- **Weave keywords into sentences**, never a labelled keyword list — a visible "also searched as"
  block reads as gaming the system and costs trust.
- **Cross-link every episode to its neighbours in the sequence.** A curriculum compounds; isolated
  clips don't. This matters more for Abacus than phonics, because the order is mandatory.
- Search terms worth owning: *abacus for kids · soroban · anzan · mental math for kids · small friend
  formula · little friend abacus · how to use an abacus · abacus addition.*

---

## 12. Open items

1. **Narrator.** Same voice as the phonics series, or a different one? Same voice ties the two
   products together; a different voice keeps them separate brands. Needed before Phase 1.
2. **`git init` in `abacus/`** — required before Phase 0 (§4).
3. **`FingerHand` art direction** — drawn hand versus code-animated shapes. This is the biggest single
   unknown in the plan and the one place the schedule can slip. Decide with a Phase 1 spike.
4. **Level 4 / Times Tables** — deferred, not cancelled.
5. **App-demo pillar** — the three existing marketing docs' app-tour angles aren't in the 47. Worth one
   `StoreFlow`-based episode per season rather than a separate pillar.

---

Method distilled from `eng/video-pipeline/docs/PORTING_TO_A_NEW_APP.md`, `CONTEXT.md`,
`REEL_PLAYBOOK.md` and `CREATING_A_REEL.md`. Every cost noted above was paid once already on the
phonics series — the point of writing them down is not paying them twice.
