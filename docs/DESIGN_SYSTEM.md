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


---

## §8e · The caption has three states, not two (2026-08-04)

The first version drew every word that had **not been spoken yet** in the same full-strength
ink as the words already said, with one accent pill marking the current word. So the whole
sentence competed for attention and the pill was doing all the work of showing where the voice
had reached.

```
already said   #243B53   full ink
being said     world.accent pill, white text     (the karaoke beat)
not yet said   #AFBECB   same hue, dropped contrast
```

On top of that, the words carrying the LESSON get their own colour in every state — `#C2410C`,
the bead orange, so a keyword in the caption ties to the thing on screen — and a little extra
weight. A child who cannot yet read the whole sentence can still see that it is about "beam"
or "five".

The keyword list is deliberately short (`Caption.tsx`): the instrument's vocabulary and the
numbers. Highlight half a sentence and nothing is highlighted. Episodes can add their own via
the `keywords` prop.

**Applied to E01 as well**, so the two episodes match. That re-baselined E01's stills oracle —
67 of 79 frames changed. Before accepting the new baseline, the region **above** the caption
band was compared frame by frame and came back 79/79 identical, which is what proves the change
is confined to the captions and nothing else drifted. Do that check whenever a deliberate
visual change forces a re-baseline: a new baseline that hides an unrelated regression is worse
than no baseline at all.

## §8f · Reveal a count by VALUE, not by how many number words were said

`countOnNumbers` first counted *occurrences* of number words in the phrase. That works for
"One, two, three." — each step is named — and fails for "Three lower beads are touching the
beam.", which names the total in one word and so showed exactly **one** badge on a rod holding
three. It now takes the highest number VALUE spoken so far, which is right in both cases.


---

## §8g · Fitting a card must never change what it says

A card that does not fit the space beside the abacus gets a **line break**, not fewer words.

`"no beads touching the beam"` (26 chars, 560 px) did not fit the 527 px gap, so I shortened it
to `"no beads on the beam"` — which is false. Beads are never *on* the beam; they touch it. The
overlap guard was satisfied, `assertCards` was satisfied (the line does contain "beam"), and the
episode taught something wrong. The user caught it.

Wrapping to `"Zero / no beads touching / the beam"` is 449 px wide and 226 px tall, clears the
abacus by 98 px, and says the right thing.

Neither guard can catch this, because both check structure and neither checks meaning. So the
rule is a rule: **resize by wrapping, never by editing the wording.** If a card genuinely cannot
wrap, the card is too long for a card and the sentence needs rethinking — with the narration in
front of you, not the pixel budget.


---

## §8h · The overlap guard, turned on for E01 (2026-08-04)

The user found two chips stacked under the abacus on E01's decimals line. Rather than fix that
one frame, `guardOverlap` was switched on for E01 as well — and it found **four more overlaps in
the approved episode**, none of which anyone had noticed:

| phrase | what overlapped | fix |
|---|---|---|
| 49 | "Unit place · ones rod" chip still on screen when the "Decimals" chip arrived | the unit-place label belongs only to the line that names it (`p === 48`) |
| 29 | the app's 560 px tour card overhung the frame by 13 px | card placement now slides out until it clears the abacus, instead of a fixed 60 px margin |
| 55 | same card, 52 px over the frame at PUSH scale | as above — PUSH leaves 560 px and that card is 552, so it sits close to the canvas edge |
| 58 | the finger-rules list overhung the frame by ~30 px | moved from `left: 96` to `left: 40` |
| 61-68 | answer and prompt cards overlapped the abacus top by up to 55 px | into the headline band (0-200), the same fix E02 already had |

Two lessons worth more than the fixes:

**A guard checking the wrong rectangle is worse than no guard.** `StageLabel` renders in one of
two completely different places depending on `labelPos`, and the guard was registering the side
slot in both cases — so the "above" labels reported as clear while overlapping by 55 px. Register
the box the element actually renders in.

**`arrowClearance` is a separate flag from `guardOverlap` on purpose.** E01 wants the *check*
without the arrow-bow geometry change, which alters 18 of its frames. Coupling the two would have
forced a visual change on an approved episode in order to gain a check.

**At PUSH scale there is no room above or beside the abacus.** 800 px wide leaves 560 px each
side and ~216 px of headroom; the app's widest tour card is 552 and an answer card is 170 tall.
Anything that has to sit next to a PUSH-scale abacus is a tight fit by construction — plan for
the headline band, not for the space above the frame.


## §8i · Decide a card's SIDE from a stable box, never the live one

The user saw a card start on the right and slide to the left mid-line. Cause: the side comes from
`tRodX > W / 2`, and with no `targetRod` set the default is the MIDDLE rod — which on a 5-rod
abacus at BASE lands at **x = 959** against a screen centre of **960**. E01's line 50 is also the
one place the rig changes (13 rods at 0.78 to 5 rods at 1.15), and `scale` ramps across the
boundary, so that rod walked across the centre line and the side flipped while the card was on
screen.

Two fixes, and the general one matters more:

- The side is now computed from a box built with the phrase's **own target scale and no bob** —
  never the live, mid-ramp box. Anything that decides *where* a thing lives must be stable for as
  long as that thing is visible; the same reasoning as `runSlotMap`, which exists because a card
  jumping between vertical slots looked like it had never moved at all.
- That line is about the far-right rod, so it now says `targetRod: 0` and `panelSide: "right"`
  instead of relying on a default that happens to be one pixel from the threshold.

Verified by measuring the card's pixel extent at 2, 8, 20 and 60 frames into the phrase: 1456-1856
at all four, with no pixels on the left.

---

## §8j · What E03's review pass changed (2026-08-06)

Eleven notes, and the four that generalise are all the same shape: **the frame has to be able to
be read against the sentence with the sound off.**

### A bead must be coloured by where it IS, not where it is going

`Abacus` coloured a bead from its target value, so the instant a line began, a bead still sitting
at the bottom of the rod was already the "on" colour and travelled up as a finished bead. The user
saw it as "3rd bead is in same color" — the bead had joined the answer before the answer happened.
`colorOnArrival` flips to `settle >= 0.85 ? isUp : wasUp`. Opt-in, because E01 and E02 shipped
without it.

### The arrow lived inside the hand, so most lines had none

`FingerHand` drew the only pointer in the pipeline. Seven E03 lines have a hand; nineteen move
beads. Twelve lines therefore said "push three more lower beads up" with nothing indicating which
three. `stage/BeadArrow.tsx` derives the moving beads from `(from → value)` — never a fixed slot —
and fades as they land, so the sequence reads *here is the one that moves*, then *there it goes*.

### Count badges number the beads ADDED, not the first N on the rod

"One, two." on 1 + 2 is counting the **second and third** beads. Badges numbered from bead 0, so
the child was shown "1" on a bead that was already up before the line started. `countFrom` takes
the value the rod is coming from; `countRod` stops a line about one rod from labelling all five.
Six is a heaven bead plus one lower, so "add three" is `countFrom: 1` — the geometry decides the
number, not the count.

### A line whose beads move the wrong way is a script bug, not an art bug

Turning arrows on made an old defect visible: p21, "every lower bead you push up adds one more",
reset the rod from four to one, so three beads dropped **down** under the word "up", and the new
arrows pointed down to prove it. The fix is not to suppress the arrows. The rod now HOLDS four
through the whole rule section and the four raised beads are badged 1·2·3·4, which is the sentence.
**When a guard or a new annotation makes a frame look wrong, check whether it was always wrong.**

### Celebration is content, not polish

Eight sums resolve in this episode and every one of them looked like the line before it.
`stage/Celebrate.tsx`: `burst` (ring, rays, thrown confetti, done inside the first half of the
line) on each answer, `party` (sustained fall) on "Great job" and the close. It renders **under**
the caption, so a reward can never cover the words it rewards.

It is the one layer deliberately NOT registered with the overlap guard — a transparent full-frame
particle layer would fail every frame. The rule it obeys instead: nothing in it is opaque enough,
or still enough, to hide a word. That is also why the four reward stars were **deleted** rather
than repositioned: out in the gutters they covered the bucket and the character, and anywhere else
they covered the beads.

### A world has to be somewhere, not a gradient

"Background theme is not look good in whole video" was correct for all eight. They were flat
two-stop gradients with one slab or hill on them. The test now: **could you name the place with
the abacus taken away?** New shared flags — `beach` (sea, wet sand, dry sand, and foam that laps),
`bunting`, `sandcastle`, `umbrella`, `shellsOnSand`, `gulls` — and every E03 palette rebuilt around
them. Two specifics worth keeping:

- `slatecliff` used `slate`, whose dark panel covers 70% of the frame and whose tray covers the
  bottom. Between them the beach was a brown strip and the world was a dark box again. The rule is
  stated by a **card**; the world only had to be the coolest, deepest place in the episode.
- `sunsetsea` was salmon sky over salmon sea over salmon sand — one hue, and nothing for the
  abacus to sit against. A real dusk goes **dark at the top**: violet overhead, gold on the
  horizon, plum sea.

### Scenery has to know where the characters stand

The parasol at `W * 0.9` sat exactly where the plus character stands, and the sandcastle at
`W * 0.11` touched the left end of the caption pill. World props are not registered with the guard,
so nothing catches this — they have to be placed against the **occupied** regions: the bucket in
the left gutter, the character in the right, the caption pill across the bottom middle.

### A column sum must be fitted to the band, not assumed to fit

Vertical `a / +b / ─── / answer` is three rows where the horizontal pill was one, and at full size
it reached out of the headline band into the abacus — the guard refused to render, correctly. The
card now declares its natural box (`SUM_NAT`) and the reel scales it to whatever `stageTop` leaves,
so one set of numbers governs the artwork **and** the guard box, in both aspect ratios.

### Arms on a plus sign read as a crab

Twice. Removing them except on a cheer did not fix it, because the problem was the **attachment
point**: arms curving up from the ends of the horizontal bar are two pincers either side of a face.
From the top bar's shoulders, with a round hand on the end, they read as raised arms.

---

## §8k · Review pass 2 on E03 (2026-08-06)

Seven notes. Four are one law each, and the law matters more than the frame it was spotted on.

### A world's sky is most of the frame, so it sets the whole mood

"Cloud look like too big and dark / sky also look to dark." The top third of a 1920 frame IS the
frame. Every E03 sky had a saturated top stop — deep teal, deep violet — which read as overcast and
turned the white clouds and white cards into holes punched through it. All seven lifted; the SEA
keeps its darker values, so the horizon still reads as a line.

Two worlds were worse than dark, they were **monochrome**: `shells` was a coral sea under a coral
sky, `goldenhour` an orange sea under an orange sky. One hue in a frame means no horizon and nothing
for the abacus to sit against. A coral sky over a *turquoise* sea, and golden light over a *deep*
sea, is also what those two times of day actually look like.

### Tuning a shared component per-episode means a per-world flag, not an edit

Shrinking and paling the clouds in `World.tsx` changed **20 of E01's 79 frames** — E01's meadow has
clouds too, and E01 is approved. Caught by the stills oracle, which is exactly what it is for. The
tuning became `cloudSize` / `cloudShade` on `WorldTheme`, defaulting to E01's shipped values. Any
change to a shared drawing that only one episode asked for goes in the theme, not in the component.

### Unifying two glyphs means moving to the SHIPPED one

"Why is every step's arrow UI different?" There were two: `FingerHand`'s flat `#0000EE` shaft with a
wide head, and `BeadArrow`'s haloed `#0B3B8C` shaft with a small one — so the arrow changed
appearance depending on whether that line happened to have a hand. Now one `components/MoveArrow`.

The style kept is **FingerHand's, to the pixel**, including its `len - 34` and its 18 px shaft
floor. Not a best-of-both: E01 and E02 both use FingerHand and both are approved, so the correct
direction of travel is the new code onto the shipped glyph, never two accepted episodes onto a new
one. Verified: E01 back to 78/79 identical.

### A thing that stays on screen must not re-animate at every beat

Third time this law has been paid for (after `runSlotMap` and the card-side fix). `SumCard` faded in
from zero on **every** phrase, so a five-line worked example re-popped the card at each line
boundary — which on screen is a blink. It now pops once, on the phrase the sum first appears on
(`popIn`, derived by comparing this phrase's sum to the previous phrase's), and holds.

And a step change animates the **highlight**, not the card: the plate cross-fades from the old row
to the new one and the digits' colour travels with it (`interpolateColors`), so the eye follows a
moving highlight instead of being handed a new card.

### `"none"` has to be a real state

`sumFor` fell through to `"first"` for any line it had no rule for — including the announcement.
So "Now, let's try five plus one" lit the **5** while the rod still read zero, telling the child the
first number was already made. An enum that covers "being worked" needs a member for "not yet".

### Where a card lives is decided by what else is in that gutter

Moving the column sum to the right gutter (it was above the abacus, where the 232 px band cost it a
third of its size and put it far from the rod) produced two guard failures in a row, both correct:

- the finger hand reaches ~330 px past the abacus, leaving 2 px for a 268-wide card. The card
  narrowed to 200 — the numbers are all single digits, so the width was padding, and a narrow tall
  column is what column arithmetic looks like anyway.
- on p33 the teaching card then had **nowhere to go**: sum right, bucket left, caption below,
  headline band too tight for the `aboveRod` slot. That card was the app's "1st ROD · lower 1 ·
  upper 5" and the line already puts a **5** on the upper bead and a **1** on the lower one, so it
  was saying the same thing twice, in words, about a rod the line is not about. Dropped. Same call
  as E02's finger cards.

### A filter that says "only the beads that moved" has to cover every bead

`countFrom` filtered the lower beads only, so on "add one by pushing one more lower bead up" the
lower 1 and 2 correctly vanished while the heaven bead kept its **5**. Note `countFrom` is a lower-
bead *index* (the previous count of raised lower beads), not the rod's previous value — it carries
no information about the heaven bead at all. Whether that moved is `heavenOn !== heavenWasOn`.
**A line labels the whole group or none of it.**

---

## §8l · Review pass 3 on E03 (2026-08-06)

### A reward has to land on the word that earns it

"This celebration and its sound, timing mismatch in all sums." Correct, in all eight. The burst ran
off `beatProgress`, so it fired on the answer line's FIRST frame — a full second of confetti before
the voice reached "four" — and the chime was anchored to the word `"is"`, which is mid-sentence.

One number now drives all three. `ANSWER_FRAME` is the frame of each answer line's **final** word
(the word that names the total), computed once from the alignment, and the burst, the chime and the
answer digit in the sum card all key off it. This is the same law as `moveOn: "$last"` for beads,
applied to the reward: **the picture must not run ahead of the voice** — and a card that shows the
total while the voice is still building to it is giving the answer away.

Two consequences worth keeping:

- The burst is now anchored to an ABSOLUTE frame (`Scene.celebrateFrom`) with its own fixed duration,
  not a fraction of the phrase. The last word starts 0.3-0.5 s before its line ends and the burst
  runs ~1.1 s, so it necessarily outlives the line — which is why the reel also sets `celebrate` on
  the phrase AFTER an answer. A celebration cut off at a line boundary reads as a dropped frame.
- `celebrate` moved out of the eight section blocks and into `base`, driven by one table. It was
  written eight times, which is exactly how it came to be missing from p15 on the first pass.

### Matching the colour of two glyphs does not make them one glyph

"Color same, but arrow style is different yar, so still arrow is not same at all." Also correct, and
the reason is the useful part: both arrows had a **fixed 34-unit head**, and their shafts came from
whatever travel they described. FingerHand's heaven move is 61 units → shaft 27 against head 34.
BeadArrow's was 48 → shaft 18 against head 34. Same parts, same colour, different proportions —
which is enough to read as two different objects, and both read as "the triangle is too big".

The head is now a **fraction of the arrow's length** (0.34, bounded 12-26), and so is the shaft's
weight. Both callers also describe the same fraction of the travel (0.8; they were 0.72 and 0.78,
a difference nobody could justify and everybody could see). One shape at every size.

This is the first deliberate break of E01's byte-identity: it changes **4 of E01's 79 frames**, all
in the finger-work section, because the old head was too big there too. The alternative was leaving
E03 with two arrows, which is the thing being fixed. E01 and E02 need re-rendering to pick it up.

### Three separate leaks into approved episodes, all caught by the same oracle

Within one review round, three changes meant for E03 hit E01: the cloud **size**, the cloud shade
**opacity**, and then the cloud shade **colour** — 20, then 20, then 5 frames. Each time the fix was
to move the value onto `WorldTheme` (`cloudSize`, `cloudShade`, `cloudShadeInk`, `cloudAlpha`) with
E01's shipped number as the default.

The pattern is now explicit: **touching a shared drawing to satisfy one episode means adding a theme
field, not editing the drawing.** And run the E01 oracle after every such change, not at the end of
the round — the third leak was a single unconditional hex literal I had introduced while fixing the
second.

### Scenery that moves earns its place

"Near send in beach water, add some fish please with moving." Added to the `beach` band, drawn
BEFORE the sand so the sand always covers their bottom edge — a fish overlapping the beach is the
one way this can go wrong. Deterministic from frame time, wrapping, half swimming each way, tails
beating. The first size (rx 17) was invisible at 1920 and had to go to rx 22 with a bigger scale
range: a detail nobody can see is not a detail, it is cost.

---

## §8m · "Light" meant a light COLOUR — four rounds to hear it

The user asked for the clouds to be lighter four times. Every attempt of mine was wrong in a
different way, and the sequence is the lesson:

1. shade opacity 0.45 → 0.22. Still read dark.
2. shade 0.22 → 0.07, fill opacity 0.97 → 0.9 → 0.62. "Not solid white color."
3. **A Gaussian blur.** Rejected outright: *"I dont need blur / need light color bro / currently
   focus goes on cloude"*.
4. What was actually being asked for the whole time: **a light cloud COLOUR** — `#E7F7FB`, a pale
   tint close to the sky's own value, hard-edged as before, with the underside shading removed
   entirely.

The diagnosis I should have reached on round one: pure white on a pale teal sky is the **highest
contrast in the frame**, so the eye lands on the clouds instead of on the abacus. That is what
"focus goes on cloud" means, and it is a contrast problem with a one-value answer. Blur addresses a
*shape* complaint; nobody had made one.

Two rules out of it:

- **Read the note for what it says.** "Light colour" is about colour. Twice I changed opacity, which
  is not colour, and once I changed the edge, which is not colour either.
- **When the same note returns a third time, the diagnosis is wrong, not the amount.** Stop turning
  the dial and work out what the viewer's eye is actually doing.

---

## §8n · Verify the edit, not just the typecheck

I reported the 4:5 parasol as dropped in portrait. It was not: the scripted replacement matched
nothing, wrote the file back unchanged, and I moved on to the next item without checking. Typecheck
passed (nothing had changed), the guards passed (world props are not guarded), the render succeeded,
and I told the user it was fixed. They found it still there.

Four other edits in the same batch had landed. That is exactly why this is worth a rule: a silent
no-op is indistinguishable from success unless you look for the result.

**After any scripted edit, grep for the thing you just wrote before claiming it is done.** `tsc` only
proves the file still compiles — for a deletion or a condition change, an unchanged file compiles
perfectly. One `grep -c` per edit costs nothing:

    grep -c "w.umbrella && !portrait" src/components/World.tsx

The same applies to reporting: "fixed" means the change is present in the file AND visible in a
rendered frame, not that the command exited 0.

### A guard that can only fail is half a tool

The arrow's bow was one of two constants, so an arrow with something in its way had no way out: the
guard threw, and the frame waited for a human to move the card. That is fine when the obstruction is
a placement mistake. It is useless when the obstruction is the layout itself.

The 4:5 cut is exactly that case. The card sits BELOW the abacus, so every arrow it sends up crosses
the place-chip row on the way in — and the chip row spans the middle of the frame, so no card
position avoids it. E01 phrase 38 sent its arrow straight through the "100" chip and then straight
up through the three beads it was pointing at. The 16:9 cut of the same phrase is fine, because
there the card is in the left gutter and the arrow comes in sideways.

So the router now **widens the arc until it is clear** instead of only reporting that it is not:
keep the natural bow when it works, and otherwise search outward for the smallest arc that clears
every guard box, trying the natural side first at each magnitude.

Two properties make this safe to apply to already-approved episodes:

- **A frame that already passes is bit-for-bit unchanged.** The search only runs when the natural
  bow fails, so nothing that shipped can move. This is the same reason `arrowClearance` is a flag —
  the last time a bow constant changed, it altered 18 of E01's 79 approved frames.
- **It still fails loudly when it genuinely cannot route.** Ten magnitudes in both directions, then
  a throw naming the phrase, the card and both endpoints.

The general rule: **when a guard fails on geometry rather than on a mistake, give the geometry a
degree of freedom.** A check that can only say no makes every layout variant a manual fix.
