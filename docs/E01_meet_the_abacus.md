# E01 · Meet the Abacus — long-form 16:9 script

Written from the module source: Free Mode's abacus tour (`Strings.freeModeHighlightSteps:41`,
`AbacusWithDecimalView.swift:151–219`) plus Level 1 Lesson 1's opener and payoff
(`Level1Content.swift:142`). Covers **all 18 tour steps**.

**Length: 41 spoken lines, 650 words ≈ 4:48** at a kid-friendly 145 wpm, including inter-line breaths
and the 3-second recall gap. **All timings in this document are estimates.** The real ones come from
`align_audio.py`'s `.lines.json` after the take is recorded — re-derive the section marks and the
chapter list from measured times before publishing, and never from these numbers.

- **Composition id:** `meet-the-abacus` · 1920×1080 · 30 fps
- **World:** a bead workshop — warm wood bench, tools on a pegboard, sawdust motes drifting
- **Metaphor:** the abacus is a small machine, and you drive it with two fingers
- **Signature gag:** the thumb and index finger are two characters who take turns; every time the
  wrong one reaches in, the beads refuse to move
- **Palette:** `poligon_cyan` — 500 `#00BCD4` · 300 `#4DD0E1` · 200 `#80DEEA` · 50 `#E0F7FA` · 800 `#00838F` — top `607D8B`… use the app's own theme values, do not invent
- **CTA line (never reuse):** *"Search for Abacus Kids on the Apple App Store, or on Google Play, and download it free."*
- **⚠ App name unresolved.** `STORE_LISTING_COPY.md` says *Abacus Math for Kids*, `STORE_DESCRIPTIONS_ASO.md`
  says *Abacus Kids — Mental Math*, `MARKETING_30_SCRIPTS.md` says *Vedaavi Abacus*. Line 40 currently
  says **Abacus Kids**. **Confirm the live store title before recording** — the name is spoken aloud, so
  a wrong one sends viewers to a search result the app is not in.

**Vocabulary law.** Primary terms are **upper beads** and **lower beads**, matching the tour. Line 15
names heaven/earth once and never again. Say **rods**, adding "also called columns" once (line 8).

**Colour comes from two places, and nowhere else** (see `DESIGN_SYSTEM.md` §4):

- **Anything naming a place value** uses the app's place-value scale, which Free Mode itself displays:
  ones `#F57C00` · tens `#A4B42B` · hundreds `#388E3C` · thousands `#00796B` · ten-thousands `#0097A7`.
  Drawn as a chip — bold white text on the colour.
- **Everything else** derives from the episode theme: bead faces `theme500`, arrows and hint text
  `theme800`, arrow backdrops `theme300`, rods `theme200`, panel washes `theme50`.

No hardcoded hexes outside the place-value scale. A fixed accent colour breaks on the episode whose
theme happens to share its hue.

**Frame 0 is the thumbnail.** The complete 5-rod abacus, all rods lit, ones rod showing **8** (upper
bead down, three lower beads up), title text set, nothing mid-spring. Only idle motion at frame 0.

**Bands for 1920×1080 — declare as constants, never eyeball.**
```
HEADLINE   0    – 200
STAGE      220  – 840     ← abacus + FingerHand
CAPTION    860  – 1040
```

**Abacus config: 5 rods, for the whole episode. The rod count never changes.**

Soroban only — 1 upper + 4 lower beads per rod, never five beads.

Why 5:

- The narration says **"the rods"**, **"every rod"** and **"the rod on the far right"**. All three are
  false with one rod on screen. Five makes them literally true.
- **Bead size does not depend on rod count.** The stage band is 620 px tall and the app's own ratio is
  `width = rods × 0.185 × height`, so rod pitch is **115 px at any count** — height is the binding
  constraint. Fewer rods buys nothing in bead size; it only leaves the 16:9 frame emptier.
- At 5 rods the abacus occupies **574 × 620 px**, centred, leaving **673 px of clear space on each
  side** for the part labels. Labels never overlap the beads. At 3 rods the abacus fills 344 px of a
  1920 px frame and the stage reads as sparse; at 13 (Free Mode's count) it is a wall of beads.
- Five rods covers ones through ten-thousands — more than this episode discusses, which is fine, and
  it means lines 19–21 have somewhere to go.

**Spotlight, never rebuild.** The app's tour keeps all 13 rods on screen for all 18 steps and dims the
irrelevant ones to **0.15 opacity** while setting values (`AbacusWithDecimalView.swift:151–219`). The
video does the same: one stable 5-rod abacus, dimming and a camera push-in to focus attention.
Rebuilding the abacus between beats would restart its idle motion and break the one-global-layer rule.

**The single exception is §7a**, where the difference between a big and a small abacus *is* the subject.
Even there the rod count changes by **widening the same component** — rods slide in from both sides and
slide back out. It is one continuous transform of one instance, never a remount, so idle motion keeps
running throughout.

| Lines | What the rods are doing |
|---|---|
| 1–15 | All 5 lit; parts label themselves in turn |
| 16 | Camera pushes in on the rightmost rod; other 4 dim to 0.15 |
| 17–18 | Held close on the ones rod |
| 19–21 | Pull back to all 5; the 2nd and 3rd rods light in turn, then a ×10 arrow crosses all five |
| 22 | Ones rod lit and running 0→9; other 4 dimmed |
| 23 | Rightmost **two** lit, showing 99 |
| 24 | Rightmost **three** lit, showing 999 |
| **25–27** | **The one exception — widens to 13 rods to show the centre-rod layout, then back to 5 (§7a)** |
| 28–38 | Camera back in close on the ones rod for the finger work and the reading |
| 39–41 | App footage / outro |

---

## 1 · HOOK (0:00–0:22)

| # | Voiceover — read exactly | On screen |
|---|---|---|
| 1 | Your child can count all the way to one hundred. | Numbers 1…100 race across the bench in a ribbon, then stop dead. |
| 2 | But ask them what seven plus eight is, and out come the fingers. | The ribbon collapses; two cartoon hands rise and count off eight fingers, slowly. |
| 3 | There is a missing step in between. This is it. | Hands drop away. The abacus rises onto the bench, complete, and settles with a wooden knock. |
| 4 | This is an abacus. By the end of this video, you will understand every single part of it. | Seven part-labels flick on around the frame for half a second each, then all wipe off. |

## 2 · WHAT IT IS (0:22–0:34)

| # | Voiceover | On screen |
|---|---|---|
| 5 | An abacus is a counting frame, with beads that slide along rods. | One lower bead slides up and back down, unhurried. Bead-click SFX (`abacus_move.mp3`). |
| 6 | People were solving big sums on this long before the first calculator was ever built. | A pocket calculator fades up beside it, then powders away into sawdust. |

## 3 · ANATOMY — the outside (0:34–0:57) · tour steps 0–2

| # | Voiceover | On screen |
|---|---|---|
| 7 | Let's start on the outside. This border is called the frame, and it holds everything together. | Frame traces itself in `theme800`; rods and beads sit at 0.15 behind it. Label: **Frame**. |
| 8 | These vertical wires are the rods. You will also hear them called columns — both words mean the same thing. | Rods light one after another in `theme200` → `theme500`. Label: **Rods · Columns**. |
| 9 | Running straight across the middle is the beam. Some people call it the bar. | Beam sweeps in from the left in `theme800`; the frame drops back to 0.15. Label: **Beam · Bar**. |

## 4 · ANATOMY — the two halves (0:57–1:36) · tour steps 3–6

| # | Voiceover | On screen |
|---|---|---|
| 10 | The beam matters more than it looks, because it splits the abacus into two halves. | The whole abacus separates slightly along the beam, then closes. |
| 11 | Everything above the beam is the top section. | Top half holds full saturation; everything below the beam dims to 0.15. Label: **Top section**. |
| 12 | And everything below the beam is the bottom section. | The dim swaps: bottom half comes up to full, top half drops to 0.15. Label: **Bottom section**. |
| 13 | Up in the top section, every rod carries one single bead. We call these the upper beads. | The one upper bead lifts out, spins once, drops back. Label: **Upper bead**. |
| 14 | Down in the bottom section, every rod carries four beads. These are the lower beads. | Four lower beads fan out and re-stack, counting 1-2-3-4. Label: **Lower beads · 4**. |
| 15 | You may also hear them called heaven beads and earth beads. Upper and lower, heaven and earth — they are the very same beads. | Two ghost labels fade in beside the first two, then fade out. Said once, never again. |

## 5 · WHERE TO START (1:36–1:47) · tour step 7

| # | Voiceover | On screen |
|---|---|---|
| 16 | Now look at the rod on the far right. On an abacus this size, that one is the ones column, and it is where we begin. | Camera pushes in on the rightmost rod; the others dim to 0.15. Label: **Ones column**. |

## 6 · WHAT EACH BEAD IS WORTH (1:47–2:34) · tour steps 8–10

| # | Voiceover | On screen |
|---|---|---|
| 17 | On the ones column, each lower bead is worth one, and that single upper bead is worth five. | `1` chips on each lower bead, a big `5` chip on the upper bead — both **`#F57C00`** orange, the app's ones colour. |
| 18 | One bead worth five. That is the whole idea, and it is the moment counting turns into calculating. | Four lower beads slide up, then collapse into the one upper bead. |
| 19 | Move one rod to the left, and every value grows ten times over. Each lower bead is worth ten now, and the upper bead is worth fifty. | Camera pulls back to all 5 rods. The 2nd-from-right lights; chips read `10` and `50` in **`#A4B42B`** olive. |
| 20 | Take one more step to the left and it happens all over again. The lower beads are worth one hundred, and the upper bead is worth five hundred. | The 3rd-from-right lights; chips read `100` and `500` in **`#388E3C`** green. |
| 21 | Every rod you move to the left is worth ten times the one before it. Nothing else changes. | A ×10 arrow hops right-to-left across all five rods; the last two chips land on `1,000` **`#00796B`** and `10,000` **`#0097A7`**. The five chips now read as one colour ramp. |

## 7 · HOW MUCH IT HOLDS (2:34–2:53) · tour steps 11–13

| # | Voiceover | On screen |
|---|---|---|
| 22 | So how much can it hold? One single column will show you any number from zero to nine. | Ones rod lit and running 0→9; the other four dim to 0.15. Counter top-right in `theme800`: **0–9**. |
| 23 | Two columns carry you from zero all the way up to ninety-nine. | The rightmost **two** light and settle on 99. Counter: **0–99**. |
| 24 | And three columns reach nine hundred and ninety-nine. The rods simply keep going. | The rightmost **three** light and settle on 999; the remaining two pulse once to say *and onward*. Counter: **0–999**. |

## 7a · BIG ABACUS, SMALL ABACUS (2:53–3:22) — *where the far-right rule stops being true*

The app's Free Mode abacus has **13 rods, and its ones column is the centre one** — `%013ld` with
`suffix(6)` as the fraction, so 6 integer rods sit left of centre and 6 decimal rods sit right of it.
Without these three lines, line 16's far-right rule is a **false rule**: a child who learns it and then
opens Free Mode will start on a decimal rod. Never teach a partial pattern as a rule.

| # | Voiceover | On screen |
|---|---|---|
| 25 | One more thing, before you open the app. The abacus inside it is bigger — it has thirteen rods. | Eight more rods slide in from both sides. **Continuous widen of the same component, never a remount.** |
| 26 | On a big abacus, the ones column is not on the far right. It is the rod in the middle, and the six rods to its right are there for decimals. | Centre rod lights and labels **Ones**; the right six tint separately and label **Decimals**. |
| 27 | On a small abacus like this one, five rods or seven, there are no decimal rods at all — so we simply begin at the far right. | Rods slide back out to 5. Far-right rod lights, labelled **Ones**. Both layouts sit side by side for a beat, then the big one fades. |

## 8 · THE TWO FINGERS (3:22–3:58) · tour steps 14–17 — *the differentiator*

| # | Voiceover | On screen |
|---|---|---|
| 28 | Now here is the part most people get wrong. You only ever use two fingers. | Camera pushes back in on the ones rod; the other four stay dimmed. The hand enters; thumb and index finger each take a bow. |
| 29 | To add with the lower beads, push them upward with your thumb. | Thumb pushes 0→4. Arrows in `theme800`, as the app draws them. Label: **Add · thumb · up**. |
| 30 | To add with the upper bead, bring it down with your index finger. | Reset. Index finger brings the upper bead down, 0→5. Label: **Add · index · down**. |
| 31 | To subtract with the lower beads, push them down with your index finger. | From 4, index finger clears to 0. Label: **Subtract · index · down**. |
| 32 | And to subtract with the upper bead, lift it back up with your thumb. | From 5, thumb lifts to 0. Label: **Subtract · thumb · up**. |
| 33 | Thumb up, index finger down. Two fingers, four rules, and that is the whole technique. | Four rules stack into a 2×2 card via `CollapseRow`. **The gag:** the wrong finger reaches in and the beads simply refuse to budge. |

## 9 · READ YOUR FIRST NUMBER (3:58–4:12)

| # | Voiceover | On screen |
|---|---|---|
| 34 | Let's read one together. The upper bead is down, so that is five. | Upper bead already down. `5` chip floats up in **`#F57C00`**. |
| 35 | Three lower beads are up, and that is three more. | Three lower beads rise, counting 1-2-3. `3` chip floats up in **`#F57C00`**. |
| 36 | Five and three. This abacus is showing eight. | `5 + 3 = 8`. Confetti tick (`option_correct_ans.mp3`). |

## 10 · YOUR TURN (4:12–4:23)

| # | Voiceover | On screen |
|---|---|---|
| 37 | Your turn. What number is this one showing? | Abacus resets to **7** (upper down, two lower up). `ValueReadout` hidden. |
| — | *(silent gap — 3 full seconds, no narration)* | A ring timer closes. **Not an audio-only stretch:** beads keep their idle bob and the readout slot holds a ghost `?`. |
| 38 | It is seven. One upper bead, and two lower beads. | Readout reveals **7**; the two contributions light in turn. |

## 11 · CLOSE (4:23–4:48)

| # | Voiceover | On screen |
|---|---|---|
| 39 | Everything you just learned is sitting inside the app, in Free Mode, where your child can tap every bead themselves. | `StoreFlow`: Free Mode opens, a finger taps a bead, the number changes. One logo only. |
| 40 | Search for Abacus Kids on the Apple App Store, or on Google Play, and download it free. | Both store badges land side by side, App Store first. App name under them. Mascot waves. |
| 41 | In the next video, we put the very first number onto the rod. | `NextUpCard`: **Next · Number 1**. |

---

## Audio

**Narration:** one human take, all 41 lines, from `E01_lines.txt`. No TTS.
Measure it, then align:
```
ffprobe -v error -show_entries format=duration -of csv=p=0 public/audio/e01.mp3
python3 tools/align_audio.py public/audio/e01.mp3 docs/E01_lines.txt
```
Beats are phrase-index ranges over the resulting `.lines.json`. Measured times only — never an even
stagger.

**Run `tools/refine_phrase_onsets.py` on this episode.** Lines 14, 22 and 35 contain counted
sequences ("one, two, three, four"), and forced alignment collapses repeated identical words. This is
the failure that mistimed 13 of 26 phonics episodes — treat it as routine here, not as a fix.

**SFX, from the app** (`iOS/Abacus/Resources/Audio/`): `abacus_move.mp3` on every bead landing,
`abacus_reset.mp3` on each reset, `option_correct_ans.mp3` on line 36, `clap.mp3` under the outro (lines 39–41).

**Music:** `tools/make_music.py`, quartal pad, **11-second loop**, pitched below the phonics bed.
Never a common progression, never a 4-bar-aligned loop length.

**No echo:** there are no recorded number clips in this episode — the narration says every number
itself. Do not layer number recordings under lines 22–24 or 34–36.

## Verification before shipping

1. `ffmpeg -i out/meet-the-abacus.mp4 -vf "fps=1,scale=470:-1,tile=4x4" sheet_%02d.png` — look at
   **every second**.
2. Crop real frames at 1:1 and check: nothing crosses a band, no caption collision, no clipping.
3. **`ValueReadout` matches the beads in every frame, mid-transition included.**
4. **Every finger beat matches the tour's own rule** (lines 29–32 against `freeModeHighlightSteps`
   14–17). A wrong finger teaches a habit the child must unlearn, and a parent cannot detect it.
5. No rod ever shows a fifth lower bead.
6. Frame 0 is a complete image.
7. Measure audio energy in each expected window — **a wrong path renders silent, not an error.**

## YouTube chapters — every gap ≥10 s (one violation kills all chapters silently)

Section 5 gets **no chapter of its own**. It is a single line, which put it 9 s after the previous
mark — one second under the limit, which would have silently disabled chapters for the whole video. It
is folded into the chapter below instead.

```
0:00 Counting is not calculating
0:22 What an abacus is
0:34 Frame, rods and beam
0:57 The two halves
1:36 Where to start, and what each bead is worth
2:34 How big a number it holds
2:53 Big abacus, small abacus
3:22 The only two fingers you need
3:58 Read your first number
4:12 Your turn
```

Gaps: 22 · 12 · 23 · 39 · 58 · 19 · 29 · 36 · 14. Smallest is 12 s. **Re-check every gap against the
measured `.lines.json` before pasting** — these are estimates, and the margin on the 0:22→0:34 pair is
only two seconds.

## The 9:16 cut — needs its own script, not a subset

Do not build the vertical version by selecting lines from this one. The leanest usable subset (hook +
anatomy + two fingers + close) still runs about **2:45**, well past the ~90 s where a vertical cut
earns its reach. It should also **drop §7a entirely** — the 13-rod comparison cannot read at portrait
width, and a 5-rod-only short can say "begin at the far right" without qualification.

The 9:16 version is a **purpose-written ~70 s script** covering the anatomy and the two fingers only,
with its own world and palette. It shares this episode's narration approach but gets a fresh take and
a fresh beat map — a re-cropped landscape video reads as a lazy repost. Treat it as a separate
deliverable after this episode ships.
