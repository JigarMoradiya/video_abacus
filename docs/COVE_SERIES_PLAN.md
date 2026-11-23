# The Bead Buddies — series plan (recurring cast, new theme per episode)

Status: PLAN ONLY. Nothing here has been built except what E15 already contains (the otter cast, the cove kit, the card set).
Waits for the user's approval, then ONE pilot remake (proposed: E08) before the rest.

Decisions from the user (2026-10-06), as relayed:

1. The Small Friend, Big Friend and the Family become recurring CHARACTERS across the whole series, drawn with E15's otters.
2. Remake E07 to E14 with that cast. KEEP the recorded audio, scripts, phrase tables, timings and teaching beats exactly.
3. Each episode keeps its OWN, DIFFERENT theme — and the existing themes are CHANGED (replaced by new ones). The kelp cove stays E15's world only.
4. Finish E15 first (the look of E15 is the template for character quality, colour and focus).

---

## (a) THE CAST

One family of three sea otters, drawn by ONE component (`src/components/e15/Otter.tsx` becomes `src/components/cast/`), whatever the world. They are otters everywhere: they float in the cove, but on land, snow or in space they stand or hover in their same rounded silhouette with a world-specific costume and prop. Same faces, same colours, same accessories, so a child recognises them in one frame.

| Character | Name (kid-sayable) | Job in the maths | Look | Personality |
|---|---|---|---|---|
| Little otter | **Pip** | The lower beads (the "plus some beads" part) and the LEARNER: asks the questions the child would ask ("but I have no beads left!") | Smallest, golden-orange fur, bead-necklace (five coloured beads), yellow bandana | Curious, giggly, a bit clumsy, says "Wait, why?" |
| Middle otter | **Fifi** — the SMALL FRIEND (five-helper) | The five: "minus five", the upper bead, the small friend of every pair | Medium, caramel fur, coral bandana, a yellow star badge with the five-bead | Cheerful, the quick fixer, always has an answer, does a little spin when she helps |
| Big otter | **Tenzo** — the BIG FRIEND (ten-helper) | The ten: "plus ten", the carry to the tens rod | Biggest, deep rust fur, aqua bandana, a golden crown with "+10" | Booming, proud, a bit dramatic, gets stuck-and-flustered in "the wall" scenes, then saves the day |
| The Family | **The Bead Buddies** | Fifi + Tenzo + Pip together: the family formula (plus the beads, minus five, plus ten) | All three, paws joined, link glows at the paws | Teamwork; they only appear linked when the family formula is being used |

Colour language that never changes (it is also the formula-card chip colour): Pip yellow `#FFC53D`, Fifi coral `#FF7A66`, Tenzo aqua `#2CC4D8`. Ink `#0B3B4A`.

### Shared component API (what every episode calls)

```
<Cast
  who="pip" | "fifi" | "tenzo" | "family"      // one or all
  x y scale                                      // waterline / ground point between the feet
  mood="float|wave|point|think|worry|gasp|cheer|link|doze|present"
  lit={[pip, fifi, tenzo]}                       // glow + bounce on the part being worked
  badges={["+1","−5","+10"]}                     // chip over a lit head
  costume={CostumeId}                            // hat / cape / ticket / scarf / helmet ... per world (below)
  prop={PropId}                                  // what they hold: wand, ticket, spoon, torch, flag ...
  look={-1..1}  progress={0..1}                  // where the eyes point; gesture lands with the words
  stand="water" | "ground" | "float"             // waterline ripple, ground contact shadow, or a hover bob
/>
```

Costume and prop are drawn on top of the body in layers (head layer, neck layer, hand layer), so the faces and accessories (necklace, star, crown) never change. Moods stay keyed to mood NAMES, never to an oscillation.

### Signature poses (the shared vocabulary every script beat maps onto)

- **Call a friend**: Pip cups paws to mouth and shouts; Fifi (or Tenzo) pops up from behind the abacus frame. Replaces E09's call-box gag in spirit (in the new theme it becomes that world's own "call" prop).
- **Hand over a bead**: Fifi/Tenzo holds a bead in a paw and passes it paw to paw (the old squirrel `give`, the elephant trunk lift).
- **Stuck / worried (the wall)**: Pip's ears flat, Tenzo flustered, sweat drop, paws on cheeks.
- **Gasp**: all three, eyes huge, paws up.
- **Cheer**: hop with squash and stretch, paws up, mouth wide.
- **Hug for the family**: paws join, link glows, a little bump.
- **Present**: both paws out toward a card ("ta-da").
- **Point**: the near paw aims at a bead, a rod or a card.

### How the cast appears per episode type

- **Teaching episodes (E07, E08, E09, E11, E12, E13)**: all three at the foot of the lesson card, small but readable (about 20 percent of frame height), with the ONE who owns the idea in front (Fifi in E07 to E09, Tenzo in E11 to E13, Pip as the asking learner everywhere). Big and expressive on hook, celebration and close.
- **Hook beats**: the three big and centred (about 40 percent of the height) in the world's costume.
- **Recap games (E10, E14)**: the game-show setting is kept as a SETTING (a new one, see below), with the cast in the contestant roles. Proposal: **Fifi versus Tenzo** are the two rival contestants (each is the champion of her own friends: Fifi of the small friends in E10, Tenzo of the big friends in E14), **Pip is the host / the one who reads the question** (the child's stand-in), and in E14's mixed round both contestants are seen buzzing. The wheel is the world's own spinner (planet wheel in E10, Ferris wheel in E14).

---

## THE WORLDS (new theme per episode)

Each episode gets a NEW theme. None repeats E15's kelp cove, none repeats the six Math Heroes shorts' worlds (arcade, game hall, candy shop, storm rescue, bead gym, racetrack), and none repeats any existing one (magic show, park, boardwalk, game show, circus, jungle canopy, autumn park, arcade). Each is a kit of 3 to 5 set pieces, a palette, a story reason and the cast's costume.

All of them follow the E15 rules, including the calm-background rule added 2026-10-06 (docs/SCRIPT_CHECKLIST.md section 8): every world is a soft gradient with gentle light, detail only at the far left and right edges and along the floor as a low-contrast, slightly blurred frame, open clean space behind the abacus, the cards and the caption, only a few slow ambient pieces in the margins, slow smooth motion. A theme layer that fills the frame with props is wrong; the set pieces named below sit at the edges or are the lesson itself (the wheel, the chest, the crates). Bright and colourful, the background steps back (desaturate and wash) while a lesson card or the abacus carries the frame, large cards with rim and shadow, no empty cards (ghost chips), measured contrast (tools/contrast_audit.py), small safe margins, brand badge and caption position unchanged.

| Ep | Theme (new) | One-line pitch | Colour mood | Key set pieces | Cast costume and props |
|---|---|---|---|---|---|
| E07 | **Cloud Castle** (sky kingdom) | The rainbow bridge is one plank short — the bead is stuck — and the Small Friend flies in to fill it | Pastel sunrise sky: peach, lavender, baby blue with a rainbow, gold sparkles | Floating islands, a rainbow bridge with a missing plank, a pink cloud castle, balloons, a sun with sunglasses | Fifi with tiny fairy wings and a wand-spoon; Pip with a pilot cap; Tenzo watching from a cloud, crown on |
| E08 | **Dino Valley** | A see-saw log, a friendly volcano and a nest of eggs: look at the lower beads first, call a friend only when they run out | Fresh jungle greens, sunny yellow, volcano orange, egg-speckled pastels | Log see-saw, baby dinos, smiling volcano with puffy smoke, giant ferns, a nest of numbered eggs | Explorer hats and field binoculars; Fifi with a dino-footprint badge; Pip with a magnifying glass |
| E09 | **Snow Mountain** | Taking away is going DOWN: the sled run, with the friend at the bend | Icy cyan and white with cosy cabin yellow and aurora pink and green | Snowy slope with a sled run, pine trees, cabin with lit windows, snowman umpire, aurora sky | Woolly scarves and beanies; sleds for props; Fifi holds a hot-cocoa mug as her "five" |
| E10 | **Galaxy Quiz Station** | The recap game on a space station: planet-shaped spinner, rocket buzzers, a countdown that is a launch | Deep indigo space with neon aqua, magenta and lime; starlight sparkles | Planet wheel, rocket buzzers, ringed-planet scoreboard, comet trail confetti, glass dome | Space helmets with the badge on the front; Fifi and Tenzo at podiums, Pip as host with a star microphone |
| E11 | **Pirate Treasure Island** | The ones rod is full: carry a bead to the tens rod, like putting a coin in the treasure chest | Turquoise lagoon, warm sand, red sails, gold treasure | Palm island, pirate ship, treasure chest (the tens rod), map with an X, parrot cameo | Pirate hats and eye-patches on foreheads; Tenzo's crown over a pirate hat; chest-lifting pose |
| E12 | **Sunny Farm Market** | The five big-friend PAIRS as matching produce crates: nine and one, eight and two, seven and three... | Barn red, hay gold, sky blue, vegetable greens and tomato reds | Windmill, barn, crates of pairs (crate lids show the friends), scarecrow, tractor, sunflowers | Straw hats and overalls; Pip with a wheelbarrow; pairs of crates handed paw to paw |
| E13 | **Toy Train Valley** | Taking away: unhook a carriage of ten (the friend), a tiny train in a valley of hills | Sunset orange, plum hills, mint tracks, cream station | Train station, carriages marked ten, tunnels, semaphore signals, a viaduct, steam puffs | Conductor caps and whistles; Tenzo as the engine driver; Fifi checks tickets |
| E14 | **Starlight Funfair** | The second recap game: the Ferris wheel is the wheel of friends, the games stalls are the rounds | Warm night: deep blue sky, string lights, candy colours, neon signs | Ferris wheel spinner, ticket booths, balloon stalls, a carousel, fireworks for the milestone | Ticket-collector caps and glow bands; Fifi versus Tenzo as rival contestants, Pip hosts with a megaphone |

(E15 stays the Kelp Cove.)

Why these eight: each is a place a child can name in one word, each one has a set piece that is the lesson (the plank, the see-saw, the sled run, the planet wheel, the chest, the crates, the carriage, the Ferris wheel), each is visually distinct from the cove and from the six shorts.

World kit mechanics (reused from E15): a `WorldTheme` block per world drawn by a world layer component (like `CoveLayer`), background calm via `worldCalm`, all numbers pure functions of the frame. One layer component per theme (8), around 150 to 250 lines each.

---

## (c) THE REMAKE METHOD for E07 to E14

Reuse everything that carries the teaching; swap only the old mascot, the old world and the old decoration.

KEEP, per episode, byte for byte: the audio (`public/audio/e00N_*`), the phrase tables and timings (`src/data/eNN.phrases.json`), the scripts, the abacus logic (`VALUE`, `rig`, hands, bead steps, the worked numbers), the SFX cues keyed to words, the cards' content (formula cards, big-friend pairs, pattern tables), the on-screen sums, the like ask and store beats, the 4:5 layout rules.

CHANGE, per episode:
1. World entries in `src/data/theme.ts` (new `WorldKind`s) + a `<ThemeLayer>` component. The old worlds stay in `theme.ts` but are unused by the remade reels (older reels untouched until replaced).
2. Mascot references replaced by `<Cast>` with moods mapped from the old mascot moods (mapping table per episode below).
3. Cards restyled with E15's card shell and `Ghosted` chips (never empty), formula cards using the three part colours.
4. The abacus: E15's size (box about 55 percent of the frame, shifted right via `stageOffset`, upper chips removed, `chipInk`, `labelInk`, `countInk`, `placeLabelHalo`, a pale pill behind place names), `rigBand`, per-world palette (`RIG_*`).
5. The focus and contrast rules: `worldCalm` per phrase, hand/chip/sum-card slot rule, scripted phrase audit (`tools/e15_audit.ts` generalised), `tools/contrast_audit.py --landscape`.

### Per-episode checklist

| Ep | Old mascot / world | New | Mood mapping notes | Special care |
|---|---|---|---|---|
| E07 | Rabbit + magic show | Cast in Cloud Castle | rabbit STUCK pose -> Pip worried + Fifi pop-in; the hat reveal -> Fifi flying in | It FAILS ON PURPOSE (the stuck beat, 5 lines of stuck): the bridge plank stays missing for the whole stretch |
| E08 | Two puppies + park | Cast in Dino Valley | left puppy / right puppy -> Pip and Fifi; the see-saw stays the teaching device (now a log) | The see-saw can be WRONG; keep that exactly |
| E09 | Two seagulls + boardwalk dusk, the call box | Cast in Snow Mountain | call-box gag -> Pip shouts, Fifi slides in on a sled | Played in full exactly once |
| E10 | Two foxes + game show | Fifi versus Tenzo in Galaxy Quiz Station, Pip hosts | fox buzz-in/cheer/think grammar maps one-to-one | Wheel of friends = planet wheel; the milestone-then-like-ask pair stays |
| E11 | Elephant + circus | Tenzo (lead) + Pip + Fifi in Pirate Island | trunk lift -> Tenzo's two-paw lift of a bead into the chest | Carry-to-tens-rod = into the chest; order rule (friend first, then ten) unchanged |
| E12 | Two toucans + jungle | Fifi + Tenzo pair in Farm Market | highfive mood -> paw-bump | Subject is PAIRS: the crates show the pair |
| E13 | Two squirrels + autumn park | Fifi + Tenzo in Toy Train Valley | `give` (acorn paw to paw) -> bead paw to paw | Taking-away formulas friend-first; the two-rod convention |
| E14 | Two hedgehogs + arcade | Fifi versus Tenzo in Starlight Funfair, Pip hosts | `curl` -> worry/duck | Two rods; round table untouched |

---

## (d) STATUS TABLE: what needs re-rendering

Both cuts (16:9 and 4:5), the thumbnails, the intro merge through `tools/render.sh` (16:9 and 4:5 each: raw render, `merge_intro.sh`, raw deleted). The remade 4:5 uses the existing portrait rules of each reel.

| Ep | Files that will be REPLACED (existing outputs) | New reel / components |
|---|---|---|
| E07 | `out/e07_small_friend_intro/e07_small_friend_intro_16x9.mp4`, `_4x5.mp4`, `_thumb_16x9.png`, `_thumb_9x16.png` | theme layer, `short`ened reel `src/reels/e07_small_friend_intro.tsx` |
| E08 | `out/e08_all_small_friends/e08_all_small_friends_16x9.mp4`, `_4x5.mp4`, `_thumb_16x9.png`, `_thumb_9x16.png` | `src/reels/e08_all_small_friends.tsx` |
| E09 | `out/e09_small_friend_subtract/e09_small_friend_subtract_16x9.mp4`, `_4x5.mp4`, `_thumb_16x9.png`, `_thumb_9x16.png` | `src/reels/e09_small_friend_subtract.tsx` |
| E10 | `out/e10_small_friend_game/e10_small_friend_game_16x9.mp4`, `_4x5.mp4`, `_thumb_16x9.png`, `_thumb_9x16.png` | `src/reels/e10_small_friend_game.tsx` |
| E11 | `out/e11_big_friend_intro/e11_16x9.mp4`, `e11_4x5.mp4`, `thumb_e11_16x9.png`, `thumb_e11_9x16.png` (and the `sheet/` folder) | `src/reels/e11_big_friend_intro.tsx` |
| E12 | `out/e12_all_five_big_friends/e12_16x9.mp4`, `e12_4x5.mp4`, `thumb_e12_16x9.png`, `thumb_e12_9x16.png` | `src/reels/e12_all_five_big_friends.tsx` |
| E13 | `out/e13_big_friend_taking_away/e13_16x9.mp4`, `e13_4x5.mp4` (no thumbnails exist yet; make them) | `src/reels/e13_big_friend_taking_away.tsx` |
| E14 | `out/e14_big_friend_recap/e14_16x9.mp4`, `e14_big_friend_recap_thumb_16x9.png`, `_thumb_9x16.png` (no 4:5 exists yet; make it) | `src/reels/e14_big_friend_recap.tsx` |

Totals: 8 episodes x 2 cuts = 16 videos, 16 thumbnails (14 exist, 2 new episodes' sets to complete), 8 theme layers, one shared cast package.

Order of work: (1) E15 delivered. (2) Extract the cast and shared card/abacus helpers from E15 into `src/components/cast/` (about 1 day, no behaviour change; E15 re-rendered to prove it). (3) PILOT: E08 16:9 only, for the user's review. (4) After approval: E07, E09, E10, E11, E12, E13, E14 in that order, 16:9 first, then each 4:5, then thumbnails.

Proposed PILOT: **E08 (Dino Valley)**, the first small-friend teaching episode. It exercises every shared piece at once: two characters talking to each other, the teaching see-saw that can be wrong, the trigger rule, four formula cards, the hand rules, the like ask and the close. If E08 works, the other seven are variations.

---

## (e) RISKS AND TIME ESTIMATE

Estimates are working time for one person (me), including verification (tsc, guard sweep, sheets, audits, render, checks); they assume the cast package exists. Render times are about 6 to 9 minutes per 16:9 cut on this machine.

| Item | Estimate | Main risk |
|---|---|---|
| Cast package extraction (+ costume layers) | 1 day | Costumes must not distort the face/accessory layers; keep costume art simple and layered |
| E08 pilot (16:9) incl. Dino Valley layer | 1.5 days | Sets the template; the see-saw redraw with otters on a log; two-character blocking |
| E07 | 1 day | The deliberate 5-line stuck stretch must stay visually alive without breaking the "fails on purpose" beat |
| E09 | 1 day | The call-box gag, played once; the sled run set piece |
| E10 | 1.5 days | Wheel-of-friends mechanic, rival buzz grammar, host role, countdown, milestone/like ask |
| E11 | 1 day | The lift/carry choreography (Tenzo and the chest) must match the corrected formula order |
| E12 | 1.5 days | Many pairs (nine formulas), crates art, highfive beats |
| E13 | 1.5 days | Two-rod rig, nine formulas, train set pieces |
| E14 | 1.5 days | Game with two rods, round table, Ferris wheel spinner |
| 4:5 cuts, thumbnails, intro merges for all 8 | 2 days | Each reel's portrait layout needs re-checks (the new abacus size and the card column logic differ from E15's 16:9 numbers) |
| Total | about 12 to 13 working days | |

Other risks:
- Consistency drift: eight new theme layers by one hand over days; mitigation: one `ThemeKit` contract (palette, calm values, fish-equivalent ambient layer, contrast checks).
- Contrast audit coverage: `tools/contrast_audit.py --landscape` now exists for 16:9; the 4:5 cut needs a portrait variant of its skip regions.
- Shared files: `SceneStage`, `Abacus`, `ColumnSum`, `Caption`, `World` carry E15's opt-in props (stageOffset, chipInk, labelInk, countInk, placeholderOpacity, comingColors, worldCalm, beadSteps). Old reels render unchanged because every addition defaults to the old behaviour; each remade episode must be checked against its own earlier render for beat parity (phrase count, timings).
- Audio: no re-recording is assumed. Anywhere an old script line references the old mascot by name or type (for example "the puppy", "the toucan"), the script would need a change: this must be checked per episode BEFORE building; if any line names an old character, we need the user's decision (keep the line as spoken and show the cast, or re-record that line).
- Disk: renders and stills are large; keep scratch cleaned (a full disk interrupted work once during E15).

---

## CAST RULES (user, 2026-10-07, authoritative; E16 and E17 follow them)

- PIP is "ME": the child's stand-in, in every episode.
- FIFI is the SMALL FRIEND: she appears ONLY in the small friend episodes (E07 to E10) and in the family episodes.
- TENZO is the BIG FRIEND: he appears ONLY in the big friend episodes (E11 to E14) and in the family episodes.
- Small friend episodes show ONLY Pip and Fifi. Big friend episodes show ONLY Pip and Tenzo. Family episodes (E15, E16, E17) show all three, and the family is Fifi plus Tenzo together WITH Pip.
- Recap games (E10, E14): Pip (me) against the episode's friend (Fifi in E10, Tenzo in E14) as contestants; the host is an edge critter (E10 the space robot, E14 the teddy).
- NAME TAGS under every character on screen: "ME" (yellow), "SMALL FRIEND" (coral), "BIG FRIEND" (aqua), dark ink. Pip's, Fifi's and Tenzo's badges show only the number: "5" on Fifi's star, "10" on Tenzo's crown.
- Brand: the "powered by VEDAAVI" pill is navy with a yellow wordmark and the logo card has a navy rim, so it reads on every light world (brandDark).
- Place indicator under each rod is ONE card ("10 / tens", "1 / ones") via Abacus `placeCard`.
