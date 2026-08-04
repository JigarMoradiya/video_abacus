# Abacus Video — Design System

The visual foundation for every episode. Written **before** the first frame is built, because these
rules are cheap now and cost review rounds later.

Geometry, the soroban layout and the place-value colours come from the shipped iOS app, with sources
cited. The **look** is video-grade and deliberately not the app's — see §0.

---

## 0. Direction change — read this first

**Superseded (2026-08-03):** the first version of this document said to port the app's own
`BackgroundImage` ambient layer and drive every episode from one of the 14 `ColorPresets`
themes. That was rejected on review, and the first render showed why: the app's background is
*UI chrome*, pale by design because app content sits on top of it, and `poligon_cyan` gave a pale
bead on a pale panel where the active/inactive difference was nearly invisible. The result looked
flat and empty.

**The direction now:** take the **phonics series as a visual reference, not a template.** That
series works because each video is a *place* — sky, sun, clouds and a word train for `ai_ay`; a
split night/day field for `oo` — rendered in saturated colour with bold high-contrast cards, a
headline pill, karaoke captions and a corner badge. (Our teaching cards ended up as solid colour
rather than white sheets — see the note at the head of `Tooltip.tsx`.)

For Abacus that means:

- **A different world for every section**, not one background for the episode. E01 runs twelve:
  `problem · meadow · blueprint · heavenearth · spotlight · placebands · counter · compare ·
  bench · chalk · quiz · celebrate` (`src/data/theme.ts`).
- **Saturated fields, not pale washes.** The abacus is warm wood on a cream panel so it reads on
  both bright and dark worlds.
- **Karaoke captions** — the current word highlights in the world's accent colour.
- **One corner badge**, one shared size, every episode.

### What still comes from the app
- The place-value colour scale (§4) — it is on screen in Free Mode, so the child already knows it.
- Soroban geometry and the 1-heaven/4-earth layout (§3).
- **Hexagonal beads.** The app's bead artwork is a hexagon — "poligon" — which is also the true
  soroban bead profile. Drawing ellipses instead is what made the first build read as pale pills.

### The one law, unchanged
> **The background must never compete with the foreground.**
The mechanism is different now: instead of a pale background, the worlds are saturated but *flat and
low-detail*, while the foreground carries the gradients, outlines and drop shadows. Depth is what
separates them, not lightness.

## 3. Beads — hexagons, and colour carries the value

Shape: **hexagon** — flat top and bottom, tapered to a point at each side. This is the app's
"poligon" artwork and the real soroban profile. `src/components/Abacus.tsx` `hexPath()`.

| State | Fill | Edge |
|---|---|---|
| **On** (at the beam, counted) | `#FF8A50` → `#E64A19` | `#A32B00` |
| **Off** (parked away from the beam) | `#C7D3DA` → `#9BAAB4` | `#6C7D87` |

The two states differ in **hue and value**, so they stay distinguishable in greyscale — the §9 check
the earlier pale-cyan pair failed. Every bead also carries a black drop shadow at 0.26 and a white top
facet, which is what stops a column of them merging into one shape.

Rig: warm wood frame (`#C98A5B → #A9744F → #6D4326`) on a cream panel `#FFF6E8`. Chosen so the abacus
reads identically on a bright meadow and on a dark spotlight world.

**Geometry, from the app:** bead aspect **1.8** (110 × 61), 1 heaven + 4 earth per rod, rod pitch
**115 px** at a 620 px stage (§8). Never a fifth earth bead, never the Chinese 5+2 suanpan.

---

## 3a. Correction — the "invented" hexes were the app's own

I told the user earlier that `#D81B60`, `#388E3C`, `#0000EE` and `#EE0000` in the first E01 script
draft were invented, and "corrected" them to theme-derived roles. **That was wrong.** All four are the
app's own tooltip colours, defined in the `free_mode_highlight_*` strings in
`iOS/Abacus/Resources/Localizable.xcstrings`:

| Hex | Used by the app for |
|---|---|
| `#FF5722` | Frame |
| `#0000EE` | Rods / Column, and every bead-direction instruction |
| `#6200EA` | Bar / Beam |
| `#E91E63` | Top section, Upper Beads |
| `#9C27B0` | Bottom section, Lower Beads |
| `#D81B60` | a LOWER bead's value ("value is 1") |
| `#388E3C` | an UPPER bead's value ("value is 5") |
| `#EE0000` | a capacity range ("0 to 9") |

I had searched `ColorPresets.swift` and the Swift views, concluded the hexes appeared nowhere, and
declared them invented. They live in the **string catalogue**, as inline `<font color=…>` markup — a
place I had not looked. The lesson is narrow and worth keeping: **an app's colour vocabulary is not
only in its colour files.** Check the localisation catalogue before calling a value invented.

These eight are now the authoritative accents for anything the tour covers, via `src/data/tour.ts`.

---

## 4. Colour

Two sources, and nothing else:

1. **The world** (`src/data/theme.ts` `WORLDS`) supplies `sky`, `ground`, `ink`, `pill` and `accent`
   for the current section. Headline pills, captions and counters take their colour from here, so they
   stay legible whether the world is a bright meadow or a dark quiz field.
2. **The place-value scale** below, for anything that names a place value.

The 14 app `ColorPresets` themes are **no longer** the episode palette — see §0. They remain useful as
a reference for in-app screenshots, not for the video.

### The place-value colour scale — use this, it is already on screen in Free Mode

Source: `AbacusWithDecimalView.swift:641–681` and `Strings.abacusBottomLabels` (`Strings.swift:71–83`).

Free Mode draws two value strips above and below the rods, plus a unit-name row. **Each place value has
its own fixed colour**, identical across all three rows and independent of the abacus theme:

| Place | Lower bead | Upper bead | Unit label | Colour |
|---|---|---|---|---|
| Ones | `1` | `5` | Ones | **`#F57C00`** orange |
| Tens | `10` | `50` | Tens | **`#A4B42B`** olive |
| Hundreds | `100` | `500` | Hundreds | **`#388E3C`** green |
| Thousands | `1000` | `5000` | Thousands | **`#00796B`** teal |
| Ten-thousands | `10000` | `50000` | Ten thousands | **`#0097A7`** cyan |
| Lakhs | `100000` | `500000` | Lakhs | **`#1976D2`** blue |
| Ten-lakhs | `1000000` | `5000000` | Ten lakhs | **`#303F9F`** indigo |

Rendered as a **chip**: bold white text on the colour as a solid background. That is the app's idiom for
a value label, and it is exactly what the video's value pips should be.

For the video's **5 rods**, right to left: `#F57C00` · `#A4B42B` · `#388E3C` · `#00796B` · `#0097A7`.

This scale beats a theme-derived colour for anything that names a place value, for one reason: **the
child sees these exact colours the moment they open Free Mode.** Lines 17–21 of episode 1 walk ones →
tens → hundreds, so they should walk orange → olive → green.

Everything else — headline pills, captions, counters, labels — takes its colour from the current
world's `pill`, `ink` and `accent`, so it adapts as the section changes.

---

## 5. Typography

**Fredoka**, via `@remotion/google-fonts/Fredoka`, weights **400–700**. Baloo 2 was the first pick —
on the theory that a different face from the phonics series would keep the two products distinct — but
it renders tall and narrow and read closer to a UI font than a children's one. The series is
distinguished by its worlds and palette; the font's only job is to belong to a kids' product.

**Fredoka has no 800.** Asking for an unloaded weight does not synthesise it — that element alone drops
to a system font, so one component silently renders in a different family. That shipped once: tooltips
were fine at 600/800 while the captions asked for 700, which was not in the loaded list, and the
captions came out in a fallback face. Everything reads its size and weight from `TYPE` in
`src/lib/fonts.ts`; add a weight there before using it anywhere.

| Role | Size (1920×1080) | Weight |
|---|---|---|
| Headline pill | 62 | 700 |
| Caption | 46 | 700 |
| Tooltip / label | 37 | 600, emphasis 700 |
| Answer number | 104 | 700 |
| Value chip, bead number | 27 | 700 |

**Numbers are always bold.** Never a light or regular weight anywhere on screen.

---

## 6. Focus mechanics

Three tools, in escalating strength. Use the weakest one that works.

1. **The off state** — a bead not at the beam is cool grey, not warm orange. Always on, free, and it
   carries the value read on its own.
2. **Quiet a rod** — `ROD_DIM = 0.35`. Use when the eye must go to one rod out of five.
3. **Quiet a part** — `0.38` for rods/beam/top/bottom when another part is named. **The frame never
   dims**, at any strength: it is the container, and at 0.6 the whole abacus turned translucent and
   read as a ghost laid over the world.
4. **Camera push-in** — scale the stage group. Only for the finger work, where bead-level detail is
   the point.

**Never dim to zero and never unmount.** A quieted rod still holds its place, so the frame doesn't
reflow and idle motion keeps running. Removing it restarts everything. Values below ~0.3 are not
"quiet" but "gone" — beads are already low-contrast in the off state, so 0.15 erased them and left an
empty cream box.

### Naming a part uses dimming, not a colour code

When the narration names an anatomical part — frame, rod, beam, top section, bottom section — that part
stays at full strength and **everything else inside the frame quiets to 0.38**. Do not assign each part
its own colour.

Two reasons. The app's tour works exactly this way and has no part-colour scheme, so a colour code would
be ours alone and would have to survive every world without colliding. And the parts are introduced in
consecutive lines, so a viewer only needs to see *which one is lit right now* — dimming says that
unambiguously, while four invented hues just add noise.

The place-value scale (§4) is the one exception, and it earns it: those colours are already on screen in
Free Mode, and a place value is a lasting property of a rod rather than a momentary highlight.

---

## 7. Motion vocabulary

- **Idle is mandatory.** Every foreground object carries a slow bob, float or pulse from
  `src/lib/motion.ts`. A static card over a spoken line is an automatic reject.
- **Entry:** spring from `scale 0.9`, ~5 frames — the app's press animation played in reverse.
- **Pulse the whole card, never a child of it.** `transform: scale()` reserves no layout space; a
  scaled child escapes its parent's border.
- **Bead moves are physically legal.** No bead crosses the beam or another bead. Pushing three earth
  beads moves them **as a group**.
- **Frame 0 has only idle motion.** Nothing mid-spring, because frame 0 is the upload thumbnail.

---

## 8. Bands — 16:9, 1920×1080

Declare as named constants. Never eyeball a position.

```
HEADLINE    0    –  200
STAGE       220  –  840      ← abacus + FingerHand. 5 rods = 574 × 620, centred
CAPTION     860  – 1010
```

The 5-rod abacus leaves **673 px of clear space on each side** of the stage. Part labels live there, not
over the beads. Nothing crosses a band boundary; any new overlay must fit inside one.

---

## 8a. Paid once already — bugs from building E01

Four of these cost a render round each. They are cheap to avoid and invisible until you look
at an actual frame.

- **`pulse()` already returns a scale centred on 1.0** (`1 + sin·amp`). Writing
  `scale(${1 + pulse(...)})` is a **2× scale**, not a 3% breath. It clipped the headline off
  the top of the frame, and the symptom looked exactly like a font-size bug — two rounds went
  into checking font loading and stale bundles before measuring ink rows found it. `bob()` and
  `wiggle()` return offsets and *do* need adding to a base; `pulse()` does not. Read
  `src/lib/motion.ts` before using any of them.

- **The app's 0.28 orb peak does not survive the scale-up.** Orb radii are relative to frame
  width, so at 1920 the same six orbs overlap several deep — and overlapping radial gradients
  **add**. The first render was a saturated pink wash that swamped the foreground and broke §0.
  Peak is now `ORB_PEAK = 0.13` so the *composite* lands near the app's ceiling. If you re-tune
  the ambient layer, judge the composite, never the per-orb value.

- **A settle/travel ramp keyed to "every phrase" makes frame 0 mid-transition.** Frame 0 is the
  thumbnail, and it rendered with the heaven bead parked at the top of a rod that read 8. Animate
  bead travel **only when the rod values actually changed** at that phrase; then frame 0 is
  settled by construction rather than by luck.

- **Dimming a rod is not the same as dimming a part.** Beads are already washed to 25%
  low contrast in the off state (§3), so a rod at the tour's 0.15 disappears completely and the
  abacus reads as an empty box. Whole rods quiet to `ROD_DIM = 0.35`, named parts to 0.38, and the
  frame never dims at all. Beads also need their own edge stroke, or a column of them merges into
  one shape against the panel.

- **Labels must be positioned from the stage's real edge, not a constant.** A hardcoded
  `left: 96; width: 480` was clear of a 5-rod abacus and sat on top of the 13-rod one. Derive the
  label width from the measured gap.

### The one that reached the user

**A hand-numbered line lookup shipped a whole section out of step.** The tooltip said
*"This is Frame of Abacus"* while the narration said *"these long lines are called rods"*, for the
entire anatomy block. I had built `LINE_TOOLTIP` by hand from a phrase list I had guessed at earlier
in the session — and I had even noticed those guesses were wrong once, corrected them for one section,
then reused the wrong numbers for another.

Two rules come out of it:

1. **Never hand-number a phrase-index table.** `src/data/lineMap.ts` is generated by matching each
   line's *text* (`tools/` generator in-session), so a shifted list cannot produce a silent mismatch.
2. **Assert the invariant, don't eyeball it.** `tools/check_line_sync.py` fails if a line names one
   part while its tooltip or highlight is about another. Re-injecting the original bug makes it
   report `line 11: names ['rods'] but tooltip 0 is about ['frame']`. Run it after any change to the
   script, the audio or the map.

It also matters that this one was found by the user watching the video, not by my contact sheet — a
sheet at 1 frame every 3 seconds shows a tooltip and a caption in the same frame but reading them
against each other is exactly the check I did not do. **Read the caption and the label against each
other**, not just look for layout faults.

### Process lessons from E01 — these cost the most time

1. **Never hand-number anything keyed to a phrase index.** Derive it from the line's text.
   A hand-numbered tooltip table shipped a whole section one line out of step, and a second
   hand-numbered label table repeated the same bug in a different place.
2. **Fix the generator, not the generated file.** Line 40's tooltip was corrected by editing
   `lineMap.ts`, then a later regeneration silently reverted it.
3. **Measure positions from a render; do not derive them from the CSS.** The store flow's tap
   target was calculated three times and wrong every time. One render plus a pixel measure
   settled it. Anything positional gets measured.
4. **Read a colour-keyed measurement sceptically.** A grey dot over a blue button is not grey,
   so a colour filter measured the background instead of the dot and reported a miss that
   wasn't there. Crop and look.
5. **Assert every string replacement.** Two silent no-op `replace()` calls shipped "fixes"
   that never applied, and one bad slice corrupted a file badly enough to need a rewrite.
6. **Check the render output, not just that the command exited.** A guard I added threw and
   killed two of four stills; I noticed only because the contact tile came back half black.
7. **Re-open the reference when the brief is "match this".** The download section was built
   from memory of the phonics outro and had to be redone after actually extracting its frames.

## 9. Verification

Beyond the contact sheet, check these at 1:1 on real frames:

1. **Nothing in the background exceeds 0.28 opacity.** If a frame feels busy, this is why.
2. **Every foreground text has both draw layers.** A single-layer label on a colourful surface is the
   most common legibility failure.
3. **Active vs inactive beads are obviously different** in a greyscale screenshot. If they aren't, the
   value read is ambiguous — desaturate the frame and look again.
4. **No invented hex.** Every colour traces to a `ColorPresets` role or the ambient table above.
5. **`ValueReadout` matches the beads in every frame**, mid-transition included.
6. **Frame 0 is a complete image** — full 5-rod abacus, `8` set on the ones rod, title placed.

---

Sources: `BackgroundImage.swift` · `KidsActionButton.swift` · `ColumnView.swift` · `ColorPresets.swift` ·
`AbacusDimensions.swift` · `DimensionsUtils.swift` · `AppTheme.swift` · `AbacusWithDecimalView.swift`


---

## §8c · What E02 added (2026-08-04)

**The structure.** The Scene interpreter is shared now (`src/stage/`): `types.ts` is the scene
vocabulary, `geometry.ts` the pixel arithmetic, `clock.ts` the frame→state functions,
`SceneStage.tsx` the renderer. An episode writes `sceneFor(phrase)` plus its own props and
passes them through render slots (`renderProp`, `renderUnder`, `renderOver`) so episode content
cannot reorder the annotation layers. E01 was ported onto it and reproduces all 79 of its
phrase stills byte-for-byte.

**A highlight DIMS the other half — so never highlight the half that is empty.** §6 said don't
dim the half holding the moving bead; E02 found the sharper version. On "look above the beam"
the rod holds four, so the four raised lower beads got dimmed to 0.15 — and the upper bead is
*parked*, i.e. grey — so the frame had no bright element at all and read as an **empty
abacus**, at exactly the moment the child needs to remember there are four. Use a section
`band` when the line names a region: it marks without quieting anything.

**A white headline pill needs dark ink.** `HeadlinePill` takes `world.ink` when the pill is
white. Two new worlds had white or near-white ink for their captions and a white pill, so their
headlines rendered white-on-white — blank. Any new world with light ink must set a coloured pill.

**A card directly above its target should not draw an arrow.** At `aboveRod` the card sits
~60 px above the rod band, and a 60 px arrow with a 70 px bow renders as a curl that reads as a
rendering glitch. Put the card beside the rod instead, on the same side, and the arrow has room
to be an arrow.

**Check what a world's own features do to each other.** The reveal world had one big star and
drifting clouds; the clouds sweep the whole upper band, and a white cloud over a pale-yellow
star is nothing at all. The star was invisible in every frame.

**Props must have something to stand on.** The ladybird works on the ladder and on the abacus
frame. Beside the bare frame she was a 60 px speck with no context, and on one line the hand
covered her completely. Leaving her off stage for that section was also the better arc.

**Bands are not advisory.** A card placed under the abacus started at 827 px against a caption
top of 860. Measure against `BAND` rather than eyeballing "below the abacus".


---

## §8d · The review pass on E02, and what it changed

Ten defects, found by watching the render rather than reading the code. Every one existed in
more than one place, which is the real lesson: **fix the mechanism, then apply it everywhere.**

**Overlap is now a render error, not a judgement.** `SceneStage` takes `boxesFor` (the boxes an
episode's own slots occupy) and `guardOverlap`, and throws on any intersection between content,
between content and the abacus, or between the arrow's sampled path and anything at all. It
caught a card overhanging the frame by 13 px on the first run — a card whose natural width
(560) simply did not fit the 527 px beside the abacus. Two cards were reworded to fit rather
than squeezed narrower: `cardHeight` counts newlines, not wrapped lines, so forcing a narrower
CSS width would have left the arrow's origin computed from the wrong height.

**Timing was all keyed to phrase boundaries, so the picture ran ahead of the voice.** Beads
finished moving a third of a second into a line — before the words that command them. Now
`moveOn` anchors travel to a word, and `"$last"` means the line's final word, because anchoring
to a word *inside* the sentence is not enough: "push" is the first word of "Push one more".
`countOnNumbers` reveals count badges one per spoken number. Props that represent the count
(the ladder, the ladybird) read `ctx.settle` so they climb with the bead.

**An arrow needs room to be an arrow.** A card sitting ~60 px above its target draws a 60 px
curl that reads as a rendering glitch — put the card beside the target instead. And when the
target is roughly LEVEL with the card, a modest bow arcs out and straight back through the
card, so the bow scales to the card's own width. Both are gated on `guardOverlap`: E01 shipped
with the flat bow, and enlarging it there changed 18 of its 79 frames — a change to an accepted
episode, not a fix to the current one.

**Hard-coded frame numbers do not survive a second episode.** `StoreFlow`'s keyframes were
tuned to E01's 181-frame beat; in E02's 159 the search phase lasted under a second and the
screenshot strip never finished. It takes `span` now and scales time by one factor, so every
stage keeps its proportion and the flow lands on OPEN exactly as the beat ends.

**Don't teach next episode's lesson.** The 6–9 section wrote `5 + 3 = 8`, turning a
reading lesson into arithmetic. The take says "five AND three, eight" — so the screen shows
the number the rod reads.

**Two cards, one idea.** Both finger lines had a tour card saying what the hand's own chip
already said, and the card physically collided with the hand every time. The cards went.
