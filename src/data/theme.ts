import { BB_WORLDS } from "./bbworlds";
// Visual system for the Abacus series.
//
// This REPLACES the earlier "port the app's background" approach. The app's ambient
// orb/sparkle layer is UI chrome: pale by design, because app content sits on top of it.
// A video needs the opposite — saturated colour fields, high-contrast cards, and a real
// *place* per scene. The reference is the phonics series (eng/video-pipeline): sky-and-
// hills with a word train for ai_ay, a split night/day field for oo.
//
// What stays from the app: the place-value colour scale (it is on screen in Free Mode),
// the soroban geometry, and the 1-heaven/4-earth layout. Everything else is video-grade.

// ---------------------------------------------------------------- abacus hardware

// The app's beads are hexagons — "poligon" — which is also the true soroban bead
// profile: flat top and bottom, tapered to a point at each side. The first build drew
// ellipses, which read as pale pills and was the main reason the frame looked flat.
export const BEAD_HEX = { shoulder: 0.22 }; // side taper as a fraction of bead width

// Warm wood frame + cream panel, so the abacus reads the same on a bright world and on
// a dark one. Per-theme app colours were dropped: poligon_cyan gave a pale bead on a
// pale panel, and the active/inactive difference was nearly invisible.
export const RIG = {
  woodLight: "#C98A5B",
  wood: "#A9744F",
  woodDark: "#6D4326",
  panel: "#FFF6E8",
  panelEdge: "#E8C9A0",
  rod: "#C0A184",
  beam: "#5A3520",
} as const;

// Active beads are warm and vivid; inactive are cool and quiet. A hue shift plus a
// value shift means the two states stay obviously different in greyscale, which is the
// DESIGN_SYSTEM §9 check the pale-cyan version failed.
export const BEAD = {
  onTop: "#FF8A50",
  onBottom: "#E64A19",
  onEdge: "#A32B00",
  offTop: "#C7D3DA",
  offBottom: "#9BAAB4",
  offEdge: "#6C7D87",
} as const;

// ---------------------------------------------------------------- per-episode rigs
//
// The abacus itself changes colour per episode. E01 and E02 share one look — orange beads on
// brown wood — and a third episode in the same livery is the "one episode reskinned" problem
// (EPISODE_RULES §2) applied to the one object that is on screen the whole time.
//
// `RIG_WOOD` is exactly the E01/E02 values above, so an episode that asks for nothing renders
// byte-identically to before.

export interface RigPalette {
  woodLight: string;
  wood: string;
  woodDark: string;
  panel: string;
  panelEdge: string;
  rod: string;
  beam: string;
  onTop: string;
  onBottom: string;
  onEdge: string;
  offTop: string;
  offBottom: string;
  offEdge: string;
}

export const RIG_WOOD: RigPalette = { ...RIG, ...BEAD };

/**
 * E03 · driftwood and sea glass. The on/off states also swap temperature — cool beads on warm
 * sand, where the wood rig has warm beads on cool grey — so the two read as different
 * instruments rather than a recolour, and the states stay separable in greyscale
 * (DESIGN_SYSTEM §9), which is the check the app's pale poligon_cyan failed.
 */
export const RIG_SEA: RigPalette = {
  woodLight: "#A9C0CC",
  wood: "#7E9AA8",
  woodDark: "#4E6875",
  // The panel is COOL and the off beads WARM. The first pass had sand beads (#E4D7C2) on a
  // near-white panel (#FFFBF2) and the unset beads all but disappeared into it — an abacus has
  // to show the beads it is NOT using as clearly as the ones it is.
  panel: "#E9F2F4",
  panelEdge: "#B9CFD6",
  rod: "#C2AE90",
  beam: "#3E5560",
  onTop: "#34D3D3",
  onBottom: "#0E9AA0",
  onEdge: "#05666E",
  offTop: "#DCC6A4",
  offBottom: "#B99C74",
  offEdge: "#7E6647",
};

/**
 * E04 · steel and lit windows. The frame is cool slate, the beads amber — the colour of a lit
 * window in the city this episode is set in, so a raised bead reads as "this floor is on". Third
 * distinct instrument in the series after wood-and-orange (E01/E02) and driftwood-and-teal (E03),
 * and the states stay separable in greyscale (DESIGN_SYSTEM §9): warm bright against cool mid.
 */
export const RIG_CITY: RigPalette = {
  woodLight: "#71829A",
  wood: "#51617A",
  woodDark: "#333F4E",
  panel: "#F5F7FA",
  panelEdge: "#C9D4E0",
  rod: "#9AA7B5",
  beam: "#26313D",
  onTop: "#FFC94E",
  onBottom: "#F08C00",
  onEdge: "#A25A00",
  offTop: "#CBD4DC",
  offBottom: "#A7B3BE",
  offEdge: "#7A8792",
};

/**
 * E05 · flight hardware. Graphite frame, violet beads.
 *
 * Fourth distinct instrument: wood-and-orange (E01/E02), driftwood-and-teal (E03), steel-and-amber
 * (E04), and now graphite-and-violet. Violet is the one hue the series has not used on a bead, and
 * against the pale panel it holds the greyscale separation DESIGN_SYSTEM §9 asks for.
 */
export const RIG_SPACE: RigPalette = {
  woodLight: "#68789B",
  wood: "#46567A",
  woodDark: "#2A3552",
  panel: "#EFF2F9",
  panelEdge: "#C3CCDF",
  rod: "#93A0B9",
  beam: "#1E2740",
  onTop: "#C88CFF",
  onBottom: "#8A3EE0",
  onEdge: "#5A20A6",
  offTop: "#CDD4E2",
  offBottom: "#A8B2C6",
  offEdge: "#7C8698",
};

/**
 * E06 · jungle. Bamboo frame, coral beads.
 *
 * Fifth distinct instrument. Wood-and-orange (E01/E02), driftwood-and-teal (E03), steel-and-amber
 * (E04), graphite-and-violet (E05) — and coral is the one warm hue left that is not the orange those
 * first two already own. Against the warm bamboo it still clears DESIGN_SYSTEM §9's greyscale test,
 * because the frame is mid and the live bead is bright.
 */
export const RIG_JUNGLE: RigPalette = {
  woodLight: "#C9A961",
  wood: "#A8863C",
  woodDark: "#6E5622",
  panel: "#FFFBF0",
  panelEdge: "#E4D5AE",
  rod: "#C2AE7E",
  beam: "#4A3A16",
  onTop: "#FF8A73",
  onBottom: "#F2543D",
  onEdge: "#B32D1C",
  // The OFF beads are cool grey-green, not tan. Warm tan on a warm cream panel gave the dimmed rods
  // almost no separation from the wood behind them — the three inactive rods vanished and the live
  // rods' parked beads read as part of the frame. Cool against warm is what DESIGN_SYSTEM §9's
  // greyscale test actually asks for.
  offTop: "#C3CFC4",
  offBottom: "#9FAEA2",
  offEdge: "#74847A",
};

/**
 * E07 · the magic show. Plum frame, gold beads.
 *
 * Sixth distinct instrument, and the last easy hue: wood-and-orange (E01/E02), driftwood-and-teal
 * (E03), steel-and-amber (E04), graphite-and-violet (E05), bamboo-and-coral (E06), and now
 * plum-and-gold. Gold sits close to E04's amber on paper and nowhere near it on screen, because
 * E04's amber is a lit window in a grey-blue city and this is gold on deep plum under stage light.
 */
export const RIG_MAGIC: RigPalette = {
  woodLight: "#6E4A78",
  wood: "#4E3157",
  woodDark: "#331E3A",
  panel: "#FDF6E8",
  panelEdge: "#D9C2A8",
  rod: "#B49BBE",
  beam: "#2A1730",
  onTop: "#FFD873",
  onBottom: "#F2A917",
  onEdge: "#A96908",
  offTop: "#CFC6D6",
  offBottom: "#ADA2B6",
  offEdge: "#82778C",
};

/**
 * E09 · SOFT MINT AND SUNSET PINK — a boardwalk at dusk.
 *
 * Eighth distinct instrument. E08 was daytime teal/orange; this mirrors it in every way that
 * matters — the small friends are the SAME idea, used backwards — while looking nothing like it:
 * evening light, cool mint against warm pink, so a viewer bingeing both feels an afternoon become
 * an evening, not a reskin of the same park.
 */
export const RIG_ICE: RigPalette = {
  woodLight: "#6FA79E",
  wood: "#4C7F78",
  woodDark: "#33574F",
  panel: "#FFF7F0",
  panelEdge: "#E3C9BC",
  rod: "#B7D6CF",
  beam: "#22403A",
  onTop: "#FF9AB0",
  onBottom: "#F5567F",
  onEdge: "#B02F53",
  offTop: "#D9DDD4",
  offBottom: "#B7BDB1",
  offEdge: "#8B928A",
};

/**
 * E08 · TEAL AND SUNNY ORANGE — a park.
 *
 * Seventh distinct instrument. E06 was lime-and-coral jungle, E07 plum-and-gold magic show; a
 * complementary teal/orange pair is bright and warm without landing on either, and orange beads on
 * a teal frame are the highest-contrast "on/off" the series has had — which matters more in this
 * episode than in any before it, because the child is being asked to READ the rod after every move.
 */
export const RIG_DINO: RigPalette = {
  woodLight: "#C79A5B",
  wood: "#9C6B34",
  woodDark: "#6B4420",
  panel: "#FFF9E8",
  panelEdge: "#E3D2A8",
  rod: "#C9B48A",
  beam: "#4A2E14",
  onTop: "#FFAE4A",
  onBottom: "#F0741B",
  onEdge: "#B24A08",
  offTop: "#D9DDD2",
  offBottom: "#B8BDB0",
  offEdge: "#8A8E84",
};

export const RIG_PARK: RigPalette = {
  woodLight: "#3F8E7E",
  wood: "#2C6B5E",
  woodDark: "#1C4A40",
  panel: "#FFFBEF",
  panelEdge: "#D8CDB4",
  rod: "#A9C6BE",
  beam: "#173A32",
  onTop: "#FFAE4A",
  onBottom: "#F0741B",
  onEdge: "#B24A08",
  offTop: "#D5D9D2",
  offBottom: "#B3B8B1",
  offEdge: "#888E86",
};

/**
 * E10 · ELECTRIC INDIGO AND BUZZER GOLD — a TV game show.
 *
 * Tenth distinct instrument, and the first that is not a place at all — this episode's world is a
 * STAGE, on purpose: RecapQuiz has no new idea to teach, so the abacus itself becomes the game
 * prop, lit like a buzzer that lights up gold the instant a bead answers correctly. E07 already
 * owns velvet-and-gold theatre magic, so this goes electric-blue-and-arcade-gold instead — same
 * "stage" family, nothing like the same room.
 */
export const RIG_SHOW: RigPalette = {
  woodLight: "#3D4A9E",
  wood: "#2B3480",
  woodDark: "#1C2359",
  panel: "#FFF9E8",
  panelEdge: "#F0D68A",
  rod: "#8FA0E8",
  beam: "#151B45",
  onTop: "#FFE156",
  onBottom: "#FFC300",
  onEdge: "#B88600",
  offTop: "#C7CEDB",
  offBottom: "#9AA3BE",
  offEdge: "#6E7796",
};

/**
 * E11 · the big top circus. Cherry-red-and-cream tent frame, vivid magenta beads.
 *
 * Eleventh distinct instrument. E07 already owns velvet-and-gold theatre magic and E10 owns
 * electric-indigo-and-arcade-gold game show — both NIGHT stages under artificial light. This one
 * is a stage too (the episode composes its worlds from the same curtains/spot/boards vocabulary
 * E07 built), but the hue family is new: warm cherry red instead of plum or indigo, and the beads
 * are a saturated magenta-pink rather than E09's soft rose (`RIG_ICE`) — cooler and far more
 * electric, so the two do not read as the same pink reused. The off beads go cool blue-grey
 * against the warm red frame, the same warm/cool split DESIGN_SYSTEM §9's greyscale test asks
 * every rig for.
 */
export const RIG_CIRCUS: RigPalette = {
  woodLight: "#E2685F",
  wood: "#B8342E",
  woodDark: "#7A1E1A",
  panel: "#FFF9EE",
  panelEdge: "#F2DAB6",
  rod: "#E3B79C",
  beam: "#5C1712",
  onTop: "#FF57C0",
  onBottom: "#E0128B",
  onEdge: "#95095F",
  offTop: "#D6CFD2",
  offBottom: "#ABA3A8",
  offEdge: "#7C7579",
};

/**
 * E12 · the rainbow treehouse jungle. Deep leaf-green frame, sunshine-yellow beads.
 *
 * Twelfth distinct instrument. Every earlier warm hue is already spoken for — orange (E01/E02,
 * E04's amber, E06's coral-red, E08), teal (E03, E08's frame), violet (E05), gold (E07, E10), pink
 * (E09, E11) — so this is the first rig with a GREEN frame and the first with beads that read as
 * pure sunshine yellow rather than gold or amber. Green-and-yellow is also just a toucan: a bright
 * beak colour sitting on a deep jungle green, which is the whole point of this episode's world.
 */
export const RIG_TOUCAN: RigPalette = {
  woodLight: "#3FA34D",
  wood: "#2D7A3A",
  woodDark: "#1D5226",
  panel: "#FFFDF2",
  panelEdge: "#D9E8B8",
  rod: "#8FC97E",
  beam: "#1A3D1F",
  onTop: "#FFE066",
  onBottom: "#FFC800",
  onEdge: "#B88A00",
  offTop: "#C7D6C9",
  offBottom: "#9AAE9C",
  offEdge: "#6E7F70",
};

/**
 * E13 · the autumn park. Chestnut-and-cream frame, sky-blue beads.
 *
 * Thirteenth distinct instrument, the direct sequel to E12's rig. Deliberately does NOT reuse
 * E12's sunshine-yellow on-beads — this episode has to read as its own thing next to its own
 * template, not a reskin — so the "on" bead goes to a clear autumn-sky blue family instead,
 * popping hard against a warm rust/chestnut wood frame. Off beads stay neutral grey, the same
 * greyscale-test split DESIGN_SYSTEM §9 asks of every rig.
 */
export const RIG_AUTUMN: RigPalette = {
  woodLight: "#C97A3D",
  wood: "#B5651D",
  woodDark: "#7A4013",
  panel: "#FFF6E8",
  panelEdge: "#EAD0AA",
  rod: "#E3B98D",
  beam: "#5C3410",
  onTop: "#6EC6F2",
  onBottom: "#2E9BD6",
  onEdge: "#1C6B96",
  offTop: "#D8D2CC",
  offBottom: "#AEA79E",
  offEdge: "#7C766E",
};

/**
 * E14 · the arcade. Near-black cabinet frame, neon lime beads.
 *
 * Fourteenth distinct instrument. Every earlier warm/cool hue pairing is spoken for — the closest
 * neighbours are E10's electric-indigo-and-arcade-gold game show and E11's cherry-and-magenta
 * circus — so this goes darker and more electric than either: a near-black cabinet frame (an
 * actual arcade machine's own colour) with beads that glow neon lime, a hue no earlier rig uses.
 * Off beads stay a cool charcoal-blue, keeping the on/off split separable in greyscale
 * (DESIGN_SYSTEM §9) the same way every rig in the series does.
 */
export const RIG_ARCADE: RigPalette = {
  woodLight: "#3A3A46",
  wood: "#232330",
  woodDark: "#131320",
  panel: "#F4F2FF",
  panelEdge: "#C9C2E8",
  rod: "#8A84B0",
  beam: "#0E0E18",
  onTop: "#D6FF6E",
  onBottom: "#A6E020",
  onEdge: "#6E9A0E",
  offTop: "#C5C7D6",
  offBottom: "#9497AC",
  offEdge: "#666980",
};

/**
 * E15 · the sea-otter kelp cove. A warm sand-and-driftwood frame against cool teal water, coral-orange beads.
 *
 * Fifteenth distinct instrument. The world is cool (teal to aqua), so the frame goes warm — sun-bleached
 * sand with a deep kelp beam — and the "on" beads a bright coral-orange, a hue no earlier rig uses (E03's
 * sea glass is cool-on-warm; E13's autumn is blue-on-rust). Off beads stay a pale shell grey, so on/off is
 * separable in greyscale (DESIGN_SYSTEM §9) the same way every rig in the series does.
 */
export const RIG_COVE: RigPalette = {
  woodLight: "#F2D3A0",
  wood: "#E0B375",
  woodDark: "#A8793C",
  panel: "#FFF9EC",
  panelEdge: "#EBD3A6",
  rod: "#9C7A4A",
  beam: "#0E4F5C",
  onTop: "#FFAE6B",
  onBottom: "#F2693E",
  onEdge: "#A8381C",
  offTop: "#DDE6EA",
  offBottom: "#B5C3CB",
  offEdge: "#7C8D97",
};

// ---------------------------------------------------------------- worlds

/** Every beat gets its own world, so no two stretches of the video look alike. */
export type WorldKind =
  | "problem" // deep indigo — the gap the video fixes
  | "meadow" // sky, sun, clouds, hills — the friendly intro
  | "blueprint" // dark technical grid — naming the parts
  | "heavenearth" // split field: sky above the beam, earth below
  | "spotlight" // dark vignette, one rod lit
  | "placebands" // vertical colour bands, one per place value
  | "counter" // bright expanding number field
  | "compare" // split field: small abacus vs big abacus
  | "bench" // warm close-up for the finger work
  | "chalk" // green board for reading a number
  | "quiz" // deep violet, one question
  | "celebrate" // bright confetti close
  // --- E02 · numbers 0 to 9. EPISODE_RULES.md §2: a viewer bingeing two episodes must
  // feel two episodes, so none of these reuses an E01 palette. ---
  | "dawn" // still lily pond before sunrise — nothing has been counted yet
  | "ladder" // garden green, a four-rung ladder beside the rod
  | "wall" // warm amber ceiling — four is as high as the lower beads go
  | "sky" // bright open sky, one big star — the upper bead's reveal
  | "workshop" // warm bench — building on five
  | "board" // deep teal board — the reading rule
  | "askrose" // deep rose field — the quiz, deliberately not E01's violet
  | "balloons" // sunset with balloons — the close, not E01's confetti meadow
  // --- E03 · adding two numbers. A seaside day: a third place after E01's fields and
  // workbenches and E02's pond, garden and open sky. "Collecting things into one bucket" is
  // what adding IS. ---
  | "harbour" // bright morning sea, bunting and gulls — the hook
  | "sandpit" // full sun on a sandcastle — what adding means
  | "pebbles" // sunny cove with a parasol — one plus two
  | "shells" // coral light, shells on the sand — two plus two
  | "slatecliff" // the coolest, deepest sea in the episode — the lower-bead rule
  | "goldenhour" // the richest light in the episode — the upper bead is five
  | "rockpool" // deep turquoise — five plus one, five plus four, any number
  | "sunsetsea" // violet dusk over a gold horizon — your turn and the close
  // --- E04 · bigger numbers. A CITY, dawn to night. The episode's idea is magnitude — each rod
  // to the left is worth ten times more — so the world grows with the numbers: a skyline whose
  // windows light up as the lesson goes from ten to ninety-nine to two hundred and forty-seven.
  // "Bigger number = taller tower" is a metaphor a six-year-old already owns, and after fields, a
  // pond and a beach the series has not yet been anywhere built. ---
  | "rooftop" // dawn over a low skyline — the hook
  | "crane" // morning, a crane putting up more towers — which rod is which
  | "tenblock" // clean and bright — making ten
  | "market" // warm awning light under the towers — twenty-three
  | "noon" // bright and plain — the reading rule
  | "duskstreet" // late afternoon over the towers — fifty-six
  | "summit" // the tallest tower against a low sun — ninety-nine
  | "starcity" // deep indigo night, every window lit — a hundred numbers, and the close
  // --- E05 · taking away. A LAUNCH, ground to orbit. Subtraction IS a countdown — nine, eight,
  // seven — so the episode climbs as the numbers come down, which is the opposite motion to E04's
  // city and the reason the two do not feel like the same episode twice. ---
  | "launchpad" // dawn at the pad, gantry against the sky — the hook
  | "ignition" // the sky goes warm — what taking away means
  | "ascent" // climbing, thinning air — four take two
  | "highair" // deep blue, the curve beginning — eight take three
  | "edgespace" // black above, blue below — the rule, and five take five
  | "orbit" // Earth's limb below, stars above — seven take five
  | "deepspace" // nebula and stars — nine take eight
  | "homeview" // Earth full in frame — your turn, and the close
  // --- E06 · two rods together. A JUNGLE, and the brightest world set in the series. E05 ended in
  // black space, so this opens on lime and coral; a playlist that runs them back to back should feel
  // like walking out of a cinema into daylight. The episode is about TWO of something working
  // together, so the scenery is full of paired things — twin vines, two banana bunches, a rope
  // bridge with two ropes. ---
  | "canopy" // morning light through big leaves — the hook
  | "vinebridge" // two vines side by side — what the second rod is for
  | "clearing" // open and bright — the big idea
  | "bananagrove" // twenty-one plus three
  | "waterfall" // bright teal water — fourteen plus twenty-five
  | "riverbank" // the rule so far
  | "treehouse" // thirty-nine take away fifteen
  | "blossom" // coral flowers everywhere — your turn, and the close
  // --- E07 · the first formula. A MAGIC SHOW, because the episode is literally about a trick. It
  // is also the only episode that FAILS on purpose, and a stage is the one place where being stuck
  // in front of everyone is part of the act rather than an accident. ---
  | "curtain" // closed velvet, footlights — the hook
  | "hardspot" // one hard spot, everything else dark — the sum that jams. NOT "spotlight":
  //             E01 already owns that name for its dark starfield beat.
  | "goldlight" // a warm second spot finds the upper bead — the thing we forgot
  | "backstage" // ropes, crates, a workbench — where the secret is explained
  | "hatreveal" // the top hat, mid-trick — friends of five
  | "stagefull" // full stage, warm and open — the trick performed
  | "encore" // deeper reds, a second run — the second sum
  | "applause" // confetti in the lights — your turn
  | "finale" // curtain call, everything lit — the close
  // --- E08 · all four small friends. A PARK, morning to evening. The episode is about PAIRS, so
  // the world is the one place a child already knows where things come in twos and only work in
  // twos — a see-saw. E07 ended on a dark stage under artificial light; this opens on grass and
  // daylight, so a viewer watching both back to back walks outdoors. ---
  | "parkgate" // morning at the gate, arch and path — the recap
  | "seesawlawn" // open lawn, the see-saw's own world — meeting the friends
  | "hopscotch" // chalk squares on the path — the four formulas written down
  | "sandtoys" // the sandpit corner, buckets and spades — when we do NOT need a trick
  | "swingset" // swings under a big tree — four plus one
  | "slidehill" // the slide, bright and steep — four plus two
  | "picnic" // blanket under the tree — three plus four
  | "flowerbed" // beds of colour along the path — the pattern
  | "bandstand" // the little bandstand — your turn
  | "lanternpark" // evening, lanterns lit in the trees — the close
  // --- E09 · small friends for taking away. A BOARDWALK AT DUSK, string lights coming on. The
  // mirror of E08's daytime park: same idea, used backwards, so the world moves from afternoon
  // into evening rather than repeating it. The signature gag is a call box on the pier where one
  // seagull calls the other — literal, because "call a friend" says exactly that. ---
  | "boardwalkdusk" // the pier at golden hour, gulls arriving — the recap
  | "cartfront" // the ice-cream cart, awning down — look at the lower beads first
  | "cartfrontclean" // same sky and pier as cartfront, no cart — the thumbnail's crop clips the
  // cart at an odd height and it reads as debris rather than scenery; nothing in the episode
  // itself uses this variant
  | "emptytray" // the tray with nothing loose in it — the wall
  | "callbox" // the red call box on the pier — "so we call a friend"
  | "scoopdelivery" // a friend's tray slides over — the trick performed
  | "pierstroll" // strolling past the stalls — one more
  | "benchlights" // a bench under the string lights — the like ask
  | "carouselglow" // a carousel turning, lit up — another one
  | "duskdock" // the dock, sky gone violet — the pattern
  | "ferriswheel" // the wheel turning against the sky — your turn
  | "fireworks" // fireworks over the pier — the close
  // --- E10 · Beat the Beads. A TV GAME SHOW, because this episode teaches nothing new — it is
  // the recall test for everything E08 and E09 taught. Reuses the generic `curtains`/`spot`/
  // `boards`/`bulbs` stage vocabulary E07 built, in an entirely different palette and mood: arcade
  // gold and electric blue, not velvet and top hats. ---
  | "showlights" // curtain closed, cool blue footlights — the hook, before the game starts
  | "buzzerstage" // the main stage, warm gold spots, bulbs chasing — rounds one through four
  | "greenroom" // dimmer, quieter, off to the side — the like ask
  | "buzzerstagehot" // the same stage, brighter and hotter — rounds five through eight
  | "confettifinale" // confetti in every spotlight — the recap and the close
  // --- E11 · the big top circus. The first BIG FRIEND formula, and the first two-rod stage —
  // the tens rod has to be on screen from the very first frame, so the ring itself has to feel
  // like it has ROOM for a second act from the start. Composed from the same curtains/spot/
  // boards/backstage/bulbs vocabulary E07 built for its magic show, in cherry-red and gold
  // instead of plum, and pushed brighter and warmer throughout — a circus is a daytime, kids'
  // party of a place even when the tent is lit for a show, never as moody as a magician's stage. ---
  | "ringclosed" // the flap still down, one spotlight sneaking through the gap — the hook
  | "sawdustring" // the main ring, spotlight hunting hard — the sum runs out of beads
  | "secondring" // a second, cooler spotlight finds the EMPTY tens rod
  | "bigtopnaming" // ropes and ladders backstage — the five big friends, named one by one
  | "bigtopchant" // full reveal light, the ringmaster's top hat on the ring — saying them together
  | "centerring" // centre ring, warm and rich — the trick explained in words
  | "showtime" // full stage, bulbs chasing — the trick performed: nine plus one
  | "secondact" // deeper reds, a second run — eight plus two
  | "yourturnring" // confetti in the lights — your turn: seven plus three
  | "finalebow" // curtain call, everything lit — the close
  // --- E12 · all five big friends. A RAINBOW TREEHOUSE JUNGLE, morning to dusk — deliberately not
  // E11's circus tent (indoor, artificial light) and not E06's own jungle palette (lime and coral,
  // daytime only): this stays in the SAME jungle vocabulary (canopy/vines/ferns/godrays/blossoms)
  // E06 built, in a brighter teal-and-toucan-orange family, because the episode's whole idea is
  // FRIEND PAIRS — and `vines` already has a `pairs` mode built for exactly that, unused since E06
  // only ever drew them singly. Two toucan friends live here, perched together, wingtip to wingtip. ---
  | "canopyrise" // morning light breaking through the leaves — the recap hook
  | "friendbranch" // five vine PAIRS hanging together — meeting the five big friends
  | "clearingcheck" // an open sunny clearing, no vines — when we do NOT need the trick
  | "twinvines" // two vines paired again — "it works flipped around too" (2+8)
  | "buddyperch" // blossoms out, warm midday — the new pair taught in full (6+4)
  | "patternleaf" // calm, uncluttered canopy — the pattern recap
  | "flipbridge" // a rope bridge, crossable either direction — the second flip (4+6)
  | "yourturncanopy" // confetti and a waterfall — your turn (5+5)
  | "duskfarewell" // dusk, blossoms drifting down — the close
  // --- E13 · big friend taking away. An AUTUMN PARK, morning to golden-hour dusk. Direct sequel
  // to E12's jungle — same "friends that make ten" idea, run backwards — so the world has to be
  // visibly a DIFFERENT place: E06/E12 already own the jungle (canopy/vines/ferns), E08/E09 own
  // the park-by-day and boardwalk-by-dusk vocabularies respectively, so this reuses E08's park
  // primitives (parkground/trees/fence/flowers/birds/blanket/bandstand) recoloured rust-and-gold,
  // with one new prop this episode needs and no earlier one drew: falling autumn `leaves`. The
  // signature gag is an ACORN, handed paw to paw — the two squirrels' `give` pose — on every line
  // that TRADES something (add the friend, take one from the tens rod), mirroring E12's beak-touch. ---
  | "parkfall" // autumn morning at the park gate — the recap hook
  | "acornstash" // a stash of acorns tucked in a hollow — meeting friends by passing one
  | "emptybranch" // a bare branch, nothing on it — when the ones rod has nothing
  | "whyclearing" // an open clearing, leaves settled and still — the WhyCard explanation beat
  | "hollowtrunk" // a hollow in the old oak — the trick performed in full
  | "russetpath" // the leaf-strewn path — the second worked example
  | "goldenfall" // full golden-hour canopy — the like-and-subscribe ask
  | "duskgrove" // a deeper grove, dusk creeping in — the third example, bigger numbers
  | "leafdrift" // calm, leaves drifting slow — the pattern recap
  | "acornchallenge" // a pile of acorns waiting to be counted — your turn
  | "harvestglow" // dusk, lanterns and drifting leaves — the close
  // --- E14 · Beat the Beads: big friend recap. Direct sequel to E10's own TV-game-show format,
  // played this time with BIG friend tricks (adding and taking away, mixed) instead of small — so
  // the world has to visibly be a DIFFERENT show, not E10's reskinned. E10 owns velvet-curtain
  // TV-studio night; this is a lit ARCADE at night — a ticket booth, a prize wall, a change
  // machine's neon glow — composed from the same curtains/spot/boards/bulbs vocabulary E07/E10/E11
  // already built, in a hue family none of them uses: near-black cabinets, neon lime and hot pink,
  // never indigo-and-gold (E10) or cherry-and-magenta (E11). TWO HEDGEHOGS, rival contestants —
  // the buzz-in gag E10's foxes started, reused on purpose (same game, same energy), with `curl`
  // (not `worry`) as the stuck reaction — a hedgehog's own signature move. ---
  | "ticketglow" // the booth shutter still down, one neon sign flickering on — the hook
  | "arcadefloor" // the main cabinet row, neon lime and pink chasing — rounds one through four
  | "prizewall" // dimmer, off to the side, shelves of prizes — the milestone and the like ask
  | "arcadeneon" // the same floor, every cabinet lit and louder — rounds five through eight
  | "jackpotfinale" // every light on the wall lit at once — the recap and the close

  // --- E15 · the sea-otter KELP COVE (Family Plus). The first world that lives UNDER the waterline:
  // deep teal to aqua with warm peach light falling from a rippling surface, kelp swaying at both
  // gutters, bubbles, fish and starfish — morning to dusk across the episode. Nothing here shares E03's
  // beach-from-above-the-waterline or any earlier room. No entry sets `confetti: true`: every
  // celebration beat routes through the scene-level `celebrate` prop. ---
  | "covedawn" // dawn mist, peach light on the surface — the hook
  | "coveshallows" // sunny shallows, wide light shafts — the recap of the big friend and the small friend
  | "covetidepool" // a rocky tide pool, fewer fish, quieter — the wall (the big friend gets stuck)
  | "covereef" // a coral shelf, bright and busy — the family formula
  | "covekelp" // sunlit kelp, schools of fish — the like ask
  | "covedeep" // deep blue current, fish streaming past — 26 + 7
  | "covedrift" // calm kelp drift — the pattern
  | "covegold" // golden shallows, late light — your turn
  | "covemoon" // a moonlit raft of otters — the close
  // E08 · Dino Valley (the Bead Buddies pilot)
  | "dinomorning" // misty morning valley — the recap
  | "dinomeadow" // bright fern meadow — the friends, the tricks
  | "dinoegg" // a nest of eggs under a big tree — when do we need it
  | "dinovolcano" // the smiling volcano — the worked examples
  | "dinosunset" // warm dusk — the close
  | import("./bbworlds").BBWorldKind; // the Bead Buddies themes (E07, E09 to E14)

export interface WorldTheme {
  sky: [string, string];
  ground?: string;
  ink: string; // headline + caption text
  pill: string; // headline pill fill
  accent: string;
  stars?: boolean;
  clouds?: boolean;
  /** Cloud size multiplier, how strong the underside shading is, and the cloud's own opacity.
   *  Defaults reproduce E01/E02 exactly — E03 asked for smaller, paler clouds and those two
   *  episodes are already approved, so this is per-world rather than a change to the drawing. */
  cloudSize?: number;
  cloudShade?: number;
  cloudShadeInk?: string;
  /** The cloud's own fill and opacity. Solid #FFFFFF at 0.97 is E01/E02's look — on E03's pale
   *  skies that reads as white shapes cut out of the sky rather than as cloud. */
  cloudInk?: string;
  cloudAlpha?: number;
  /** Squash the lobes and drop the solid base, for cloud seen from above or from altitude. */
  cloudFlat?: number;
  /** Fish swimming in the sea band. Only means anything with `beach`. */
  fish?: number;
  /** Their colours. Defaults to the warm shoal every beach world started with. */
  fishInk?: string[];

  // ---------------------------------------------------------------- flight (E05)
  /** The curve of a planet across the bottom of the frame, with an atmospheric rim. */
  planet?: { at: number; body: string; rim: string; lit: string };
  /** Soft drifting colour clouds, for the deep-space beats. */
  nebula?: string[];
  /** The launch gantry, left of frame. Ground beats only. */
  gantry?: boolean;

  // ---------------------------------------------------------------- city (E04)
  /**
   * A skyline: two parallax rows of towers with lit windows, standing on a ground band.
   * `windows` is the fraction of them that are ON (0..1), which is how one drawing gets from dawn
   * to full night — the world brightens with the numbers instead of needing eight illustrations.
   */
  skyline?: { at: number; far: string; near: string; ground: string; lit: string; windows: number };
  /** A tower crane over the near towers: motion in the sky, and it says "more are going up". */
  crane?: boolean;
  sun?: boolean;
  hills?: boolean;
  grid?: boolean;
  vignette?: boolean;
  confetti?: boolean;
  /** Ground fills below `at`, with a bright seam on the line itself — the beam's own
   *  metaphor, a world split into an above and a below. */
  horizon?: { at: number; h: number };
  /** Dashed vertical rule, for a world that holds two things side by side. */
  divider?: boolean;
  /** A surface to work on: a band at `at` with a lit front edge. */
  surface?: { at: number; h: number; edge: string };
  /** A board to write the rule on, with a tray under it. */
  slate?: { tray: string };
  /** Still water with lily pads — a world where nothing has happened yet. */
  water?: { at: number };
  /** One big slow star. The reveal world; nothing else on screen competes with it. */
  starburst?: boolean;
  /** Balloons drifting up, for a close that is a send-off rather than a party. */
  balloons?: boolean;

  // ---------------------------------------------------------------- seaside (E03)
  // The first pass at this episode's worlds was eight flat gradients with a hill or a slab
  // on them, and it read exactly as flat and grey as it was. A world is only doing its job
  // if you could name the place with the abacus taken away. These are the props that name it.
  /** Sea to the horizon, then wet sand, then dry sand, with foam that actually laps. */
  beach?: { at: number; sea: string; wet: string; sand: string };
  /** Triangle flags on a slung line across the top. The single fastest way to make a frame
   *  read as "somewhere fun" — and it lives in the sky, where nothing else is. */
  bunting?: string[];
  /** A sandcastle with a flag, bottom-left. Sits under the stage band, out of the way. */
  sandcastle?: boolean;
  /** A striped beach umbrella, bottom-right. */
  umbrella?: boolean;
  /** Starfish and shells scattered on the sand — the detail that stops sand being a rectangle. */
  shellsOnSand?: boolean;
  /** Two gulls gliding across, high up. Motion in an otherwise empty sky. */
  gulls?: boolean;

  // ---------------------------------------------------------------- jungle (E06)
  /** Big overlapping leaves hanging from the top of the frame, in two parallax rows. */
  canopy?: { far: string; near: string; depth: number };
  /** Hanging vines with a leaf at the tip, swaying. `pairs` draws them in TWOS — the episode is
   *  about two rods, and the scenery says so before the script does. */
  vines?: { colour: string; count: number; pairs?: boolean };
  /** Undergrowth along the bottom: ferns and blades, in front of the ground band. */
  ferns?: string;
  /** A waterfall on one side, with a plunge pool. Bright teal, the coolest thing in a warm world. */
  falls?: {
    at: number;
    water: string;
    foam: string;
    /** run the column off the bottom edge with no plunge pool or spray — a sheet of water the
     *  frame is standing in front of, not a waterfall landing in shot. E12's your-turn world. */
    toBottom?: boolean;
  };
  /** Coral blossoms scattered through the canopy, and a few drifting down. */
  blossoms?: string[];
  /** A rope bridge across the frame, well below the stage. TWO ropes, one deck. */
  ropebridge?: { at: number; rope: string; plank: string };
  /** Two butterflies, wandering. The jungle's equivalent of E03's gulls. */
  butterflies?: string[];
  /** Sun shafts through the canopy — the thing that makes a jungle read as a jungle. */
  godrays?: boolean;

  // ---------------------------------------------------------------- magic show (E07)
  /** Velvet curtains down both sides, with a swag across the top. `closed` draws them met in the
   *  middle, for the beat before anything has happened. */
  curtains?: { cloth: string; shade: string; closed?: boolean };
  /** A hard spotlight cone from above. `at` is its centre as a fraction of the width. */
  spot?: { at: number; colour: string; width: number };
  /** A second, warmer spot — for the beat that finds the upper bead. */
  spot2?: { at: number; colour: string; width: number };
  /** The stage floor: a lit boards band with a front edge. */
  boards?: { at: number; face: string; edge: string };
  /** A top hat sitting on the boards, with a little sparkle over it. */
  tophat?: boolean;
  /** Backstage clutter — ropes down from the flies, a crate, a stool. */
  backstage?: boolean;
  /** Sparkles drifting in the light. The magic-show equivalent of E03's gulls. */
  sparkle?: string[];
  /** Bulbs around the proscenium, chasing. */
  bulbs?: boolean;
  // ---------------------------------------------------------------- park (E08)
  /** Grass to `at`, then a lighter path band across the bottom. The base every park world stands on. */
  parkground?: { at: number; grass: string; grassDark: string; path: string };
  /** A row of round trees behind the stage, in two parallax depths. */
  trees?: { far: string; near: string; trunk: string };
  /** A picket fence along the grass line. */
  fence?: string;
  /** Flowers dotted in the grass, in these colours. */
  flowers?: string[];
  /** A swing set, left gutter — two swings, because everything in this world comes in twos. */
  swings?: boolean;
  /** A slide, right gutter. */
  slide?: { rail: string; chute: string };
  /** Kites on strings, high in the sky. Motion where nothing else is. */
  kites?: string[];
  /** Chalk hopscotch squares on the path. */
  chalksquares?: boolean;
  /** A picnic blanket on the grass, bottom-left. */
  blanket?: [string, string];
  /** A bandstand behind the stage — the only built thing in the park. */
  bandstand?: boolean;
  /** Paper lanterns strung between the trees, for the evening close. */
  lanterns?: string[];
  /** Two small birds, wandering the sky. The park's equivalent of E03's gulls. */
  birds?: boolean;
  /** Falling autumn leaves, drifting and swaying as they fall, looping from the top once they
   *  pass the bottom edge. E13's equivalent of `kites`/`butterflies` — motion where nothing else
   *  is, in an autumn palette. Each colour gets 2-3 individually phased leaf shapes. */
  leaves?: string[];

  /** TWO banana bunches hanging from the canopy, one per gutter. Paired, like everything in this
   *  world set — and the world called `bananagrove` should have bananas in it. */
  bananas?: boolean;

  // ---------------------------------------------------------------- boardwalk (E09)
  /** Deck to `at`, then dark water below with a soft shimmer. The base every pier world stands on. */
  pier?: { at: number; deck: string; deckDark: string; sea: string };
  /** Background stalls: peaked-roof silhouettes in two parallax rows, lit windows. */
  stalls?: { far: string; near: string; roof: string };
  /** A wooden pier railing along the deck line. */
  railing?: string;
  /** The ice-cream cart — awning, wheels, a chalkboard sign. Left gutter. */
  cart?: boolean;
  /** The red call box — "so we call a friend" made literal. Right gutter, or wherever the scene
   *  needs it; drawn distinctly enough it reads at thumbnail size. */
  callbox?: boolean;
  /** A carousel silhouette, turning, with warm lit canopy bulbs. */
  carousel?: boolean;
  /** A ferris wheel silhouette, turning, spokes lit. */
  ferriswheel?: boolean;
  /** Fireworks bursting over the pier, in these colours. */
  fireworksBurst?: string[];

  // ---------------------------------------------------------------- the kelp cove (E15)
  /**
   * An underwater cove, drawn by `CoveLayer` (src/components/e15). Every field is a knob on the SAME
   * drawing, so nine beats are nine times of day in one place rather than nine rooms: `light` is the
   * colour of the surface glow and the shafts that fall from it, `shafts` how many fall, `kelp` the
   * far and near blade colours, `floor` the sand and the rock, `bubbles` and `fish` how busy the water
   * is, `mist` a dawn haze, `night` swaps the glow for a moon. Pure function of the frame.
   */
  bb?: { theme: import("./bbworlds").BBTheme; mood: number };
  dino?: { hills: [string, string]; fern: [string, string]; volcano?: boolean; glow: string; eggs?: boolean; sun?: string; dusk?: boolean };
  cove?: {
    light: string;
    shafts: number;
    kelp: [string, string];
    floor: [string, string];
    bubbles: number;
    fish?: string[];
    mist?: number;
    night?: boolean;
    coral?: string[];
    rocks?: boolean;
    stream?: boolean;
  };
}

export const WORLDS: Record<WorldKind, WorldTheme> = {
  problem: {
    sky: ["#241454", "#4B2A8E"],
    ink: "#FFFFFF",
    pill: "#F4511E",
    accent: "#FFD166",
    stars: true,
  },
  meadow: {
    sky: ["#8FD3FF", "#CFEEFF"],
    ground: "#7CC44B",
    ink: "#123A5C",
    pill: "#FFFFFF",
    accent: "#F4511E",
    clouds: true,
    sun: true,
    hills: true,
  },
  blueprint: {
    sky: ["#0E2A38", "#164457"],
    ink: "#EAF7FF",
    pill: "#00A2C7",
    accent: "#7FE3FF",
    grid: true,
  },
  heavenearth: {
    sky: ["#5B8DEF", "#A7C9FF"],
    ground: "#6B8E3D",
    ink: "#12233F",
    pill: "#FFFFFF",
    accent: "#F4511E",
    clouds: true,
    horizon: { at: 0.46, h: 0.54 },
  },
  spotlight: {
    sky: ["#1A1230", "#2E1F52"],
    ink: "#FFFFFF",
    pill: "#F57C00",
    accent: "#FFD166",
    vignette: true,
    stars: true,
  },
  placebands: {
    sky: ["#FFF6E8", "#FFE9CC"],
    ink: "#3B2410",
    pill: "#FFFFFF",
    accent: "#E64A19",
  },
  counter: {
    sky: ["#FFE9A8", "#FFC46B"],
    ink: "#4A2600",
    pill: "#FFFFFF",
    accent: "#D84315",
  },
  compare: {
    sky: ["#2A6F97", "#61A5C2"],
    ink: "#FFFFFF",
    pill: "#FFFFFF",
    accent: "#FFD166",
    divider: true,
  },
  bench: {
    sky: ["#FFEAD1", "#FFD3A5"],
    ground: "#B4693A",
    ink: "#4A2600",
    pill: "#FFFFFF",
    accent: "#D84315",
    surface: { at: 0.78, h: 0.22, edge: "#DDA15E" },
  },
  chalk: {
    sky: ["#1F4636", "#2E6B50"],
    ink: "#F3FFF8",
    pill: "#FFFFFF",
    accent: "#FFD166",
    slate: { tray: "#6D4326" },
  },
  quiz: {
    sky: ["#3A1C71", "#6A3AB0"],
    ink: "#FFFFFF",
    pill: "#FFD166",
    accent: "#FFD166",
    stars: true,
  },
  celebrate: {
    sky: ["#7FD8FF", "#E8F7FF"],
    ground: "#7CC44B",
    ink: "#0F3A57",
    pill: "#FFFFFF",
    accent: "#F4511E",
    clouds: true,
    sun: true,
    hills: true,
  },

  // ---------------------------------------------------------------- E02
  dawn: {
    sky: ["#3B4A85", "#F6B99B"],
    ink: "#FFFFFF",
    // NOT white: HeadlinePill uses world.ink on a white pill, and this world's ink is
    // white for the caption over a dark sky — a white pill made the headline invisible.
    pill: "#E2562C",
    accent: "#FF8F5E",
    stars: true,
    water: { at: 0.62 },
  },
  ladder: {
    sky: ["#A8E86B", "#E6FFD0"],
    ground: "#4E9A3D",
    ink: "#1E3D14",
    pill: "#FFFFFF",
    accent: "#E0562B",
    hills: true,
    sun: true,
  },
  wall: {
    sky: ["#FFB300", "#FFE7A8"],
    ink: "#4A2600",
    pill: "#FFFFFF",
    accent: "#C62828",
    vignette: true,
  },
  sky: {
    sky: ["#4FC3F7", "#DBF4FF"],
    ink: "#08344F",
    pill: "#FFFFFF",
    accent: "#FF8F00",
    // NO clouds. They drift across the whole upper band, and a white cloud passing over a
    // pale-yellow star erased the one thing this world exists to show. An open sky with a
    // single star is also what the reveal wants: nothing else to look at.
    starburst: true,
  },
  workshop: {
    sky: ["#FFF3DC", "#FFDFAE"],
    ground: "#A9744F",
    ink: "#4A2600",
    pill: "#FFFFFF",
    accent: "#00838F",
    surface: { at: 0.78, h: 0.22, edge: "#C98A5B" },
  },
  board: {
    sky: ["#0F3B3A", "#1E6F66"],
    ink: "#EAFFFB",
    // near-white ink, so the pill cannot be white either
    pill: "#0A6B5F",
    accent: "#FFD166",
    slate: { tray: "#3E2A18" },
  },
  askrose: {
    sky: ["#6E0F3C", "#C2185B"],
    ink: "#FFFFFF",
    pill: "#FFD166",
    accent: "#FFD166",
    vignette: true,
    stars: true,
  },
  balloons: {
    sky: ["#FF8A65", "#FFD9AE"],
    ground: "#8E4A2F",
    ink: "#4A1F0E",
    pill: "#FFFFFF",
    accent: "#6A1B9A",
    hills: true,
    balloons: true,
  },

  // ---------------------------------------------------------------- E03 · seaside
  //
  // Second pass on the skies (2026-08-06): every top stop lifted. The first set put a deep teal
  // or violet at the top of the frame, and on a 1920 frame the top third IS the frame — it read
  // as overcast, and it made the white clouds and white cards look like holes punched in it. The
  // SEA keeps the old darker values, so the horizon still reads as a line.
  // Rebuilt. The first set was eight gradients with a hill or a slab on them: "too grey and
  // empty" was the correct read. Every one of these now has a horizon, a floor a character
  // could stand on, and at least one piece of built scenery, and each is warm enough that the
  // teal beads and the white cards both sit on it.
  harbour: {
    // the hook: bright morning, bunting over the water
    sky: ["#69CDE0", "#D7F4F8"],
    ink: "#0A3A44",
    pill: "#FFFFFF",
    accent: "#F4772B",
    clouds: true,
    cloudSize: 0.72,
    // The grey underside is what made these read as "too dark white" — at 0.22 it was still a
    // smudge across the bottom of every cloud on a pale sky. Near zero, and warmed off blue.
    // no underside shading at all: any grey on a pale cloud is what made these read as dirty
    cloudShade: 0,
    cloudShadeInk: "#E9F5FF",
    // NOT solid white. Semi-transparent and very slightly cool, so the sky reads THROUGH the
    // cloud and it sits in the air instead of on top of it.
    // A LIGHT COLOUR, not white and not blurred. Pure white on a pale teal sky is the highest
    // contrast in the frame, so the eye goes to the clouds instead of the abacus — which is what
    // "currently focus goes on cloud" means. A pale tint close to the sky's own value keeps them
    // as scenery. (A blur was tried here and was wrong: the note was about colour.)
    cloudInk: "#E7F7FB",
    cloudAlpha: 0.82,
    gulls: true,
    bunting: ["#F4772B", "#FFD166", "#2FB3A8", "#EF5D5D", "#FFFFFF"],
    fish: 7,
    beach: { at: 0.6, sea: "#1E8FA8", wet: "#D9B67F", sand: "#F3D9A6" },
  },
  sandpit: {
    // what adding means: full sun, and a castle to show that more is more
    sky: ["#FFD98A", "#FFF3D6"],
    ink: "#5A3312",
    pill: "#FFFFFF",
    accent: "#E0621F",
    sun: true,
    sandcastle: true,
    shellsOnSand: true,
    fish: 7,
    beach: { at: 0.62, sea: "#3AAFC0", wet: "#E0BC85", sand: "#F7E2B4" },
  },
  pebbles: {
    // one plus two. Was grey shingle; now a bright cove with a parasol, which is the same
    // place seen in better weather.
    sky: ["#8BDCEC", "#E4FAFD"],
    ink: "#0C3B45",
    pill: "#FFFFFF",
    accent: "#0E9AA0",
    clouds: true,
    cloudSize: 0.72,
    // The grey underside is what made these read as "too dark white" — at 0.22 it was still a
    // smudge across the bottom of every cloud on a pale sky. Near zero, and warmed off blue.
    // no underside shading at all: any grey on a pale cloud is what made these read as dirty
    cloudShade: 0,
    cloudShadeInk: "#E9F5FF",
    // NOT solid white. Semi-transparent and very slightly cool, so the sky reads THROUGH the
    // cloud and it sits in the air instead of on top of it.
    // A LIGHT COLOUR, not white and not blurred. Pure white on a pale teal sky is the highest
    // contrast in the frame, so the eye goes to the clouds instead of the abacus — which is what
    // "currently focus goes on cloud" means. A pale tint close to the sky's own value keeps them
    // as scenery. (A blur was tried here and was wrong: the note was about colour.)
    cloudInk: "#E7F7FB",
    cloudAlpha: 0.82,
    umbrella: true,
    fish: 7,
    beach: { at: 0.58, sea: "#26A2B8", wet: "#D3B481", sand: "#F0DBAA" },
  },
  shells: {
    // two plus two: coral light, shells on the sand. Had no ground at all before, so the
    // abacus floated in a peach wash.
    sky: ["#FFB79C", "#FFEFE4"],
    ink: "#7A2E1E",
    pill: "#FFFFFF",
    accent: "#D2452F",
    shellsOnSand: true,
    bunting: ["#FFFFFF", "#D2452F", "#FFD166", "#2FB3A8"],
    // a coral sky over a TURQUOISE sea: the first version was coral on coral on coral, so the
    // frame had one hue in it and the horizon was invisible
    fish: 7,
    beach: { at: 0.6, sea: "#3FA7B5", wet: "#DCB07E", sand: "#FBE0BC" },
  },
  slatecliff: {
    // The lower-bead rule. It had `slate`, whose dark panel covers 70% of the frame and a tray
    // across the bottom — between them the beach was reduced to a brown strip and the world was
    // back to being a dark box. The rule is stated by a CARD, so the world does not need a board
    // at all; it only needs to be the coolest, deepest place in the episode, so the boundary the
    // line is about reads as a limit. Late afternoon, sea well up the frame, gulls over it.
    sky: ["#4FAFC4", "#C4EEF2"],
    ink: "#04343A",
    pill: "#FFFFFF",
    accent: "#F2843C",
    gulls: true,
    shellsOnSand: true,
    fish: 7,
    beach: { at: 0.52, sea: "#125C6E", wet: "#B08A55", sand: "#DFBE88" },
  },
  goldenhour: {
    // the upper bead is five: the richest light in the episode, for its biggest reveal
    sky: ["#FBA84E", "#FFEDC8"],
    ink: "#4A2408",
    pill: "#FFFFFF",
    accent: "#0E7C86",
    sun: true,
    gulls: true,
    // same fix as `shells`: an orange sea under an orange sky was one flat field. Golden light
    // on a deep sea is what low sun over water actually looks like.
    fish: 7,
    beach: { at: 0.63, sea: "#2E7F92", wet: "#C4924F", sand: "#F0CE93" },
  },
  rockpool: {
    // the worked examples: deep turquoise, the one world that keeps its water
    sky: ["#4CBECC", "#CDF3F5"],
    ink: "#04343A",
    pill: "#FFFFFF",
    accent: "#FF8A3D",
    shellsOnSand: true,
    clouds: true,
    cloudSize: 0.72,
    // The grey underside is what made these read as "too dark white" — at 0.22 it was still a
    // smudge across the bottom of every cloud on a pale sky. Near zero, and warmed off blue.
    // no underside shading at all: any grey on a pale cloud is what made these read as dirty
    cloudShade: 0,
    cloudShadeInk: "#E9F5FF",
    // NOT solid white. Semi-transparent and very slightly cool, so the sky reads THROUGH the
    // cloud and it sits in the air instead of on top of it.
    // A LIGHT COLOUR, not white and not blurred. Pure white on a pale teal sky is the highest
    // contrast in the frame, so the eye goes to the clouds instead of the abacus — which is what
    // "currently focus goes on cloud" means. A pale tint close to the sky's own value keeps them
    // as scenery. (A blur was tried here and was wrong: the note was about colour.)
    cloudInk: "#E7F7FB",
    cloudAlpha: 0.82,
    // THREE, not seven, and cool against the turquoise. Seven put fish half-behind the abacus in
    // every frame, and five shades of orange made them indistinguishable from the starfish and
    // shells — the shoal read as more dressing rather than as fish.
    fish: 3,
    fishInk: ["#FF5CA8", "#5CE1E6", "#C77DFF"],
    beach: { at: 0.61, sea: "#0B7A86", wet: "#CDA871", sand: "#EFDCAF" },
  },
  sunsetsea: {
    // Your turn and the close. The first version was salmon sky over a salmon sea over salmon
    // sand — one hue for the whole frame, and the abacus had nothing to sit against. A real dusk
    // goes DARK at the top: violet overhead, gold on the horizon, a plum sea underneath.
    sky: ["#7C57A8", "#FFD8A6"],
    ink: "#3A1440",
    pill: "#FFFFFF",
    accent: "#0E7C86",
    umbrella: true,
    bunting: ["#FFFFFF", "#FFD166", "#F4715F", "#2FB3A8", "#B8459B"],
    fish: 7,
    beach: { at: 0.64, sea: "#8E4A6E", wet: "#B47A52", sand: "#EFCB96" },
  },

  // ---------------------------------------------------------------- E04 · Number City
  //
  // One skyline drawing, eight lightings. `windows` climbs across the episode, so the city fills up
  // as the numbers do; the sky carries the time of day. That is the whole set — no world here needs
  // its own illustration.
  //
  // TOWER VALUES SIT CLOSE TO THEIR OWN SKY, ON PURPOSE. The first pass used mid-tone browns and
  // greys against pale skies, with a dense grid of bright windows on top, and the result was that
  // the busiest, highest-contrast region in the frame was the BACKGROUND. A world has to be
  // somewhere without asking to be looked at: every TOWER fill here is roughly halfway to the sky's
  // own lower stop, and every `windows` density is about half what it was.
  //
  // The GROUND is DARKER THAN THE TOWERS BUT NOT BLACK. It is not competing with anything — it is the
  // base the abacus stands on and the surface the caption pill sits against, and both want contrast
  // underneath them. But the three-step search matters: lightening it with the towers took the floor
  // out of the frame, and taking it all the way back to full dark made the pale towers above it read
  // as washed out. It sits about a third up from dark — grounded, without a hard step at the kerb.
  rooftop: {
    sky: ["#F3A874", "#FFE7CC"],
    ink: "#3A2413",
    pill: "#FFFFFF",
    accent: "#EF7B18",
    skyline: { at: 0.79, far: "#D3C4C0", near: "#B5A5A8", ground: "#5F5462", lit: "#FFE9BE", windows: 0.16 },
  },
  crane: {
    sky: ["#79C6EA", "#DCF2FB"],
    ink: "#0C3348",
    pill: "#FFFFFF",
    accent: "#E85D2A",
    clouds: true,
    cloudSize: 0.7,
    cloudShade: 0.06,
    cloudShadeInk: "#E9F5FF",
    cloudInk: "#F4FCFF",
    cloudAlpha: 0.8,
    crane: true,
    skyline: { at: 0.79, far: "#CEDEE9", near: "#AFC5D2", ground: "#60747F", lit: "#FFEBC4", windows: 0.2 },
  },
  tenblock: {
    sky: ["#5CBECB", "#D6F1F4"],
    ink: "#083A40",
    pill: "#FFFFFF",
    accent: "#F0A500",
    skyline: { at: 0.79, far: "#C9E1E4", near: "#A5C8CD", ground: "#577E84", lit: "#FFEEC2", windows: 0.26 },
  },
  market: {
    sky: ["#FFC873", "#FFF1DA"],
    ink: "#5A2A18",
    pill: "#FFFFFF",
    accent: "#C1443F",
    skyline: { at: 0.79, far: "#EBD8C8", near: "#D5BCA6", ground: "#866D5A", lit: "#FFF6E2", windows: 0.28 },
  },
  noon: {
    sky: ["#A2D8F2", "#EAF7FD"],
    ink: "#0B3550",
    pill: "#FFFFFF",
    accent: "#1E7BB8",
    clouds: true,
    cloudSize: 0.7,
    cloudShade: 0.06,
    cloudShadeInk: "#E9F5FF",
    cloudInk: "#FCFEFF",
    cloudAlpha: 0.78,
    skyline: { at: 0.79, far: "#D8E6EF", near: "#B9CCD8", ground: "#6F8594", lit: "#FFF1D4", windows: 0.22 },
  },
  duskstreet: {
    sky: ["#E8823A", "#FFD9A6"],
    ink: "#4A1D2C",
    pill: "#FFFFFF",
    accent: "#B8318C",
    skyline: { at: 0.79, far: "#DCBBB0", near: "#C29A99", ground: "#6C4C54", lit: "#FFEECB", windows: 0.34 },
  },
  summit: {
    sky: ["#E8663C", "#FFD494"],
    ink: "#40160F",
    pill: "#FFFFFF",
    accent: "#2E5F8A",
    skyline: { at: 0.79, far: "#E2BBAE", near: "#C99795", ground: "#714A51", lit: "#FFF2D8", windows: 0.36 },
  },
  starcity: {
    // Full night, every window on — the frame the quiz, the hundreds rod and the close all share.
    // Near-white ink, so the headline pill cannot be white either.
    sky: ["#1A2450", "#4A6098"],
    ink: "#EAF0FF",
    pill: "#26305C",
    accent: "#FFC94E",
    stars: true,
    skyline: { at: 0.79, far: "#3E4A7C", near: "#2C355F", ground: "#1A203E", lit: "#F0D9A6", windows: 0.4 },
  },

  // ---------------------------------------------------------------- E05 · Launch
  //
  // Ground to orbit across eight beats. The sky darkens as the episode climbs, which is exactly
  // inverse to E04's city filling with light — the two sit next to each other in a playlist and had
  // to not feel like one episode twice.
  launchpad: {
    sky: ["#8FC4E8", "#FFE3C2"],
    ink: "#1B2A45",
    pill: "#FFFFFF",
    accent: "#E8543F",
    gantry: true,
    planet: { at: 0.86, body: "#5C6B52", rim: "#9FBF7E", lit: "#D8E8BE" },
  },
  ignition: {
    sky: ["#F2A24E", "#FFE6C4"],
    ink: "#4A2410",
    pill: "#FFFFFF",
    accent: "#C0392B",
    gantry: true,
    planet: { at: 0.86, body: "#6B5B44", rim: "#C79B62", lit: "#F0D6A8" },
  },
  ascent: {
    sky: ["#4E96D6", "#CDE7FA"],
    ink: "#0C2A4A",
    pill: "#FFFFFF",
    accent: "#E8543F",
    clouds: true,
    // Back to the ROUNDED cloud. The flattened "seen from altitude" version was more accurate and
    // looked worse — stretched wisps read as smears at feed size, where the rounded lobes read
    // instantly as cloud. Accuracy lost to legibility, which is the right way round for a children's
    // series. Only the softening is kept: paler ink, no grey underside.
    cloudSize: 0.75,
    cloudShade: 0.05,
    cloudShadeInk: "#E9F5FF",
    cloudInk: "#FBFEFF",
    cloudAlpha: 0.8,
    planet: { at: 0.92, body: "#4E6B5A", rim: "#8FC0A0", lit: "#CFE8D8" },
  },
  highair: {
    sky: ["#1F4E8C", "#7FB4E4"],
    ink: "#EAF2FF",
    pill: "#173B6B",
    accent: "#FFB03A",
    stars: true,
    planet: { at: 0.94, body: "#3E5C6B", rim: "#7FB0C4", lit: "#BFE0EC" },
  },
  edgespace: {
    sky: ["#0B1836", "#3C6DA8"],
    ink: "#EAF2FF",
    pill: "#132445",
    accent: "#FFB03A",
    stars: true,
    planet: { at: 0.9, body: "#2E5A78", rim: "#6FB8D8", lit: "#B8E4F4" },
  },
  orbit: {
    sky: ["#050A20", "#16305C"],
    ink: "#EAF2FF",
    pill: "#101E3C",
    accent: "#5CE1E6",
    stars: true,
    planet: { at: 0.82, body: "#2A6E9C", rim: "#6FD0F0", lit: "#CFF2FF" },
  },
  deepspace: {
    sky: ["#04061A", "#181446"],
    ink: "#EDEBFF",
    pill: "#161341",
    accent: "#C88CFF",
    stars: true,
    nebula: ["#7B3FE0", "#2E6FD8", "#C84FA8"],
  },
  homeview: {
    sky: ["#04061A", "#0E1A44"],
    ink: "#EDF2FF",
    pill: "#121E45",
    accent: "#5CE1E6",
    stars: true,
    nebula: ["#2E6FD8", "#7B3FE0"],
    planet: { at: 0.74, body: "#2D7AA8", rim: "#7FDCF4", lit: "#DAF4FF" },
  },

  // ---------------------------------------------------------------- E06 · Jungle
  //
  // Eight beats, and the light walks through the day: morning canopy, open clearing, the waterfall
  // at its brightest, then late gold at the treehouse and full coral blossom for the close. Kept
  // BRIGHT throughout on purpose — E05 finished in black space, and this is the palette cleanser.
  //
  // Every world carries something PAIRED, because the episode is about two rods: twin vines, two
  // ropes on the bridge, two butterflies, a pair of banana bunches.
  canopy: {
    sky: ["#8FE3C8", "#E8FBEE"],
    ground: "#3E8E4E",
    ink: "#12401F",
    pill: "#FFFFFF",
    accent: "#F2543D",
    canopy: { far: "#2F7A46", near: "#43A85C", depth: 0.9 },
    vines: { colour: "#43A85C", count: 5, pairs: true },
    ferns: "#2F7A46",
    godrays: true,
    butterflies: ["#FF8A73", "#FFD166"],
  },
  vinebridge: {
    sky: ["#7FD8E8", "#E4F9FB"],
    ground: "#3E8E4E",
    ink: "#0E3B44",
    pill: "#FFFFFF",
    accent: "#F2543D",
    canopy: { far: "#2F7A46", near: "#4FB86A", depth: 0.62 },
    vines: { colour: "#4FB86A", count: 6, pairs: true },
    ropebridge: { at: 0.86, rope: "#B98B4A", plank: "#D8A863" },
    ferns: "#357F48",
    butterflies: ["#FFD166", "#FF8A73"],
  },
  clearing: {
    sky: ["#A9EEDC", "#F2FEF6"],
    ground: "#4CA35C",
    ink: "#12401F",
    pill: "#FFFFFF",
    accent: "#F2543D",
    // deeper canopy and a pair of vines: at depth 0.34 with nothing else, this world was a flat mint
    // field — "could you name the place with the abacus taken away?" answered no.
    canopy: { far: "#358C46", near: "#4FB86A", depth: 0.62 },
    vines: { colour: "#4FB86A", count: 4, pairs: true },
    ferns: "#3E8E4E",
    godrays: true,
    blossoms: ["#FF8A73", "#FFC2B4"],
    butterflies: ["#FF8A73", "#8ED9F0"],
  },
  bananagrove: {
    sky: ["#B8ECB0", "#F6FEF0"],
    ground: "#4CA35C",
    ink: "#173F16",
    pill: "#FFFFFF",
    accent: "#F2543D",
    canopy: { far: "#358C46", near: "#57BF66", depth: 0.5 },
    vines: { colour: "#57BF66", count: 4, pairs: true },
    ferns: "#3E8E4E",
    bananas: true,
    blossoms: ["#FFD166", "#FFE9A8"],
    butterflies: ["#FFD166", "#FF8A73"],
  },
  waterfall: {
    // GREEN sky, not blue. At #7ADCEE the whole frame went teal and the falling streaks read as being
    // UNDER water rather than beside a waterfall — the one world in the set that stopped looking like
    // a jungle. The water is the only cool thing in frame now, which is what makes it read as water.
    sky: ["#9FE8C0", "#EFFBF0"],
    ground: "#3E8E4E",
    ink: "#0B3A45",
    pill: "#FFFFFF",
    accent: "#F2543D",
    canopy: { far: "#2F7A46", near: "#43A85C", depth: 0.44 },
    falls: { at: 0.2, water: "#5FCBE6", foam: "#EAFBFF" },
    ferns: "#357F48",
    godrays: true,
    butterflies: ["#8ED9F0", "#FF8A73"],
  },
  riverbank: {
    sky: ["#9EE8DA", "#EFFCF4"],
    ground: "#4CA35C",
    ink: "#0E3B33",
    pill: "#FFFFFF",
    accent: "#F2543D",
    canopy: { far: "#358C46", near: "#4FB86A", depth: 0.3 },
    water: { at: 0.88 },
    ferns: "#3E8E4E",
    blossoms: ["#FF8A73", "#FFD166"],
    butterflies: ["#FFD166", "#8ED9F0"],
  },
  treehouse: {
    sky: ["#FFD9A0", "#FFF4DC"],
    ground: "#57843E",
    ink: "#4A2A10",
    pill: "#FFFFFF",
    accent: "#F2543D",
    canopy: { far: "#3B7A3E", near: "#5A9E4C", depth: 0.56 },
    vines: { colour: "#5A9E4C", count: 5, pairs: true },
    ropebridge: { at: 0.88, rope: "#A9743C", plank: "#CE9A53" },
    ferns: "#4A7C3E",
    godrays: true,
    butterflies: ["#FFD166", "#FF8A73"],
  },
  blossom: {
    sky: ["#FFCFD6", "#FFF1F3"],
    ground: "#4CA35C",
    ink: "#5A1B22",
    pill: "#FFFFFF",
    accent: "#F2543D",
    canopy: { far: "#3E8E4E", near: "#57BF66", depth: 0.5 },
    blossoms: ["#FF8A73", "#FFB3C1", "#FFD166"],
    ferns: "#3E8E4E",
    vines: { colour: "#57BF66", count: 4, pairs: true },
    butterflies: ["#FF8A73", "#FFD166"],
  },

  // ---------------------------------------------------------------- E07 · The magic show
  //
  // ACCENT IS A BACKGROUND COLOUR, not a highlight colour. The caption paints the word being spoken
  // as a filled pill in `accent` with white text on it, and the sum card and the answer card use it
  // the same way — so a pale gold picked to glow against dark plum turned every one of those white
  // on near-white. All nine use one deep gold that carries white text; the plum backdrop is dark
  // enough that it still reads as gold against the set.
  //
  // The light tells the story. It starts closed and dark, narrows to one hard spot for the sum that
  // jams, finds a second warm spot on the thing we forgot, opens out for the trick, and finishes
  // fully lit. Nine beats, and a viewer could follow the shape of the episode with the sound off.
  //
  // Deep plum everywhere, which is the one background family the series has not used — E05's dark
  // was black space with stars, and this is warm and enclosed rather than cold and endless.
  curtain: {
    sky: ["#2A0E33", "#5A1B43"],
    ink: "#FFE9B0",
    pill: "#3A1246",
    accent: "#C07A05",
    curtains: { cloth: "#9C1B3B", shade: "#6E0F28", closed: true },
    boards: { at: 0.86, face: "#7A4B2A", edge: "#C88A4A" },
    bulbs: true,
    sparkle: ["#FFD873", "#FFF3C4"],
  },
  hardspot: {
    sky: ["#210B2A", "#3E1338"],
    ink: "#FFE9B0",
    pill: "#33103E",
    accent: "#C07A05",
    curtains: { cloth: "#9C1B3B", shade: "#6E0F28" },
    spot: { at: 0.5, colour: "#FFF6DC", width: 0.46 },
    boards: { at: 0.88, face: "#6E4326", edge: "#B77E42" },
    sparkle: ["#FFD873"],
  },
  goldlight: {
    sky: ["#2A0E33", "#4A1740"],
    ink: "#FFE9B0",
    pill: "#381244",
    accent: "#C07A05",
    curtains: { cloth: "#9C1B3B", shade: "#6E0F28" },
    spot: { at: 0.5, colour: "#FFF6DC", width: 0.44 },
    // the second, warmer spot — this is the beat that finds the upper bead
    spot2: { at: 0.5, colour: "#FFC53D", width: 0.2 },
    boards: { at: 0.88, face: "#6E4326", edge: "#B77E42" },
    sparkle: ["#FFD873", "#FFF3C4"],
  },
  backstage: {
    sky: ["#241A2E", "#3B2A44"],
    ink: "#FFEFD0",
    pill: "#2E2038",
    accent: "#C07A05",
    backstage: true,
    boards: { at: 0.88, face: "#5E4630", edge: "#96754A" },
    sparkle: ["#FFE9B0"],
  },
  hatreveal: {
    sky: ["#2E0F3A", "#63204C"],
    ink: "#FFE9B0",
    pill: "#3C1348",
    accent: "#C07A05",
    curtains: { cloth: "#9C1B3B", shade: "#6E0F28" },
    spot: { at: 0.5, colour: "#FFF6DC", width: 0.5 },
    tophat: true,
    boards: { at: 0.87, face: "#7A4B2A", edge: "#C88A4A" },
    sparkle: ["#FFD873", "#FFF3C4", "#FF9EC4"],
  },
  stagefull: {
    sky: ["#3A1444", "#7A2A56"],
    ink: "#FFF1CE",
    pill: "#44184F",
    accent: "#C07A05",
    curtains: { cloth: "#B02244", shade: "#7C1230" },
    boards: { at: 0.86, face: "#8A5730", edge: "#D89A55" },
    bulbs: true,
    sparkle: ["#FFD873", "#FFF3C4"],
  },
  encore: {
    sky: ["#450F3F", "#8E2450"],
    ink: "#FFF1CE",
    pill: "#4E1449",
    accent: "#C07A05",
    curtains: { cloth: "#B02244", shade: "#7C1230" },
    boards: { at: 0.86, face: "#8A5730", edge: "#D89A55" },
    spot: { at: 0.5, colour: "#FFF6DC", width: 0.54 },
    sparkle: ["#FFD873"],
  },
  applause: {
    sky: ["#4A1548", "#95305E"],
    ink: "#FFF1CE",
    pill: "#541750",
    accent: "#C07A05",
    curtains: { cloth: "#B02244", shade: "#7C1230" },
    boards: { at: 0.86, face: "#8A5730", edge: "#D89A55" },
    bulbs: true,
    sparkle: ["#FFD873", "#FFF3C4", "#FF9EC4"],
  },
  finale: {
    sky: ["#53185A", "#A8386A"],
    ink: "#FFF6E2",
    pill: "#5C1B62",
    accent: "#C07A05",
    curtains: { cloth: "#C4284C", shade: "#8C1636" },
    boards: { at: 0.86, face: "#966034", edge: "#E2A75E" },
    bulbs: true,
    sparkle: ["#FFD873", "#FFF3C4"],
  },

  // ---------------------------------------------------------------- E08 · the park
  //
  // Ten worlds, morning to evening. The GROUND is the constant — grass and a path — and what
  // stands on it changes: a gate, then the lawn, then a sandpit, swings, a slide, a picnic, beds
  // of flowers, a bandstand, and finally lanterns in the dark. The sky carries the clock, going
  // from pale morning blue to dusk violet, so the episode reads as one afternoon rather than ten
  // unrelated backdrops.
  parkgate: {
    sky: ["#BFE9FF", "#EAF7E2"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.78, grass: "#6FBF63", grassDark: "#4E9A46", path: "#E9D9B4" },
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    fence: "#FFFFFF",
    clouds: true,
    cloudSize: 0.9,
    cloudAlpha: 0.9,
    birds: true,
    sun: true,
  },
  seesawlawn: {
    sky: ["#AEE4FF", "#E7F6DC"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.80, grass: "#6FBF63", grassDark: "#4E9A46", path: "#E9D9B4" },
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    flowers: ["#FF6B8A", "#FFD23F", "#8E6BFF", "#FF9F45"],
    clouds: true,
    cloudSize: 0.85,
    cloudAlpha: 0.88,
    kites: ["#FF6B8A", "#FFD23F"],
  },
  hopscotch: {
    sky: ["#CFEEFF", "#F3F8E6"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.72, grass: "#6FBF63", grassDark: "#4E9A46", path: "#E9D9B4" },
    chalksquares: true,
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    fence: "#FFFFFF",
    clouds: true,
    cloudSize: 0.8,
    cloudAlpha: 0.85,
  },
  sandtoys: {
    sky: ["#B8E7FF", "#EDF7DE"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.78, grass: "#6FBF63", grassDark: "#4E9A46", path: "#F2E3BC" },
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    flowers: ["#FF6B8A", "#FFD23F", "#8E6BFF", "#FF9F45"],
    clouds: true,
    cloudSize: 0.9,
    cloudAlpha: 0.9,
    birds: true,
  },
  swingset: {
    sky: ["#A6DFFF", "#E4F4DA"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.79, grass: "#6FBF63", grassDark: "#4E9A46", path: "#E9D9B4" },
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    swings: true,
    flowers: ["#FF6B8A", "#FFD23F", "#8E6BFF", "#FF9F45"],
    clouds: true,
    cloudSize: 0.85,
    cloudAlpha: 0.88,
  },
  slidehill: {
    sky: ["#9FDBFF", "#E1F2D6"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.79, grass: "#6FBF63", grassDark: "#4E9A46", path: "#E9D9B4" },
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    slide: { rail: "#FF6B8A", chute: "#FFD23F" },
    clouds: true,
    cloudSize: 0.85,
    cloudAlpha: 0.86,
    kites: ["#8E6BFF"],
  },
  picnic: {
    sky: ["#FFE3B8", "#F6F3D8"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.78, grass: "#6BB85F", grassDark: "#4A9442", path: "#E9D9B4" },
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    blanket: ["#FF6B8A", "#FFFFFF"],
    flowers: ["#FF6B8A", "#FFD23F", "#8E6BFF", "#FF9F45"],
    clouds: true,
    cloudSize: 0.9,
    cloudAlpha: 0.8,
    birds: true,
  },
  flowerbed: {
    sky: ["#FFD9A8", "#FBEFD2"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.76, grass: "#66B25B", grassDark: "#468E3F", path: "#E9D9B4" },
    trees: { far: "#3E8E52", near: "#57B06A", trunk: "#7A5230" },
    flowers: ["#FF6B8A", "#FFD23F", "#8E6BFF", "#FF9F45", "#FF4E78", "#6BE0C0"],
    fence: "#FFFFFF",
    clouds: true,
    cloudSize: 0.85,
    cloudAlpha: 0.72,
  },
  bandstand: {
    sky: ["#FFC79A", "#FFE9C8"],
    ink: "#1C4A40",
    pill: "#FFFFFF",
    accent: "#F0741B",
    parkground: { at: 0.77, grass: "#5FA956", grassDark: "#41843B", path: "#E9D9B4" },
    trees: { far: "#347A46", near: "#4C9E5F", trunk: "#6E4A2C" },
    bandstand: true,
    flowers: ["#FF6B8A", "#FFD23F", "#8E6BFF", "#FF9F45"],
    birds: true,
  },
  lanternpark: {
    sky: ["#3B2A63", "#7C4A6E"],
    ink: "#FFF0D2",
    pill: "#2E2050",
    accent: "#FFAE4A",
    parkground: { at: 0.77, grass: "#2F6B48", grassDark: "#1F4C33", path: "#8E7C5C" },
    trees: { far: "#204A38", near: "#2C6349", trunk: "#4A3220" },
    lanterns: ["#FFAE4A", "#FF8FA8", "#FFE08A"],
    stars: true,
    sparkle: ["#FFE08A", "#FFF6DC"],
  },

  // ---------------------------------------------------------------- E09 · the boardwalk at dusk
  //
  // Eleven worlds, afternoon into evening — the sky is the clock, same trick E04's city used,
  // going from warm gold through pink to violet as the episode runs. The PIER is the constant
  // (deck, railing, dark water), and what stands on it changes: the cart, the empty tray, the call
  // box, a carousel, a ferris wheel, and fireworks for the close.
  boardwalkdusk: {
    sky: ["#FFCE8A", "#FFA6C0"],
    ink: "#3A2340",
    pill: "#FFFFFF",
    accent: "#F5567F",
    pier: { at: 0.74, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#3A6B8A" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    railing: "#FFF7F0",
    gulls: true,
    clouds: true,
    cloudSize: 0.85,
    cloudAlpha: 0.7,
  },
  cartfront: {
    sky: ["#FFC17A", "#FF9EB8"],
    ink: "#3A2340",
    pill: "#FFFFFF",
    accent: "#F5567F",
    pier: { at: 0.76, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#3A6B8A" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    cart: true,
    gulls: true,
    clouds: true,
    cloudSize: 0.8,
    cloudAlpha: 0.65,
  },
  // The thumbnail's own background: cartfront with the cart dropped (a thumbnail crops the scene
  // at an arbitrary height, and the cart landed half-cut behind the tag, reading as debris) and
  // the sea lightened a step (a thumbnail has no scrim to soften it the way the episode's own
  // captions and cards do, so the same sea read noticeably heavier here than the sky above it).
  cartfrontclean: {
    sky: ["#FFC17A", "#FF9EB8"],
    ink: "#3A2340",
    pill: "#FFFFFF",
    accent: "#F5567F",
    pier: { at: 0.76, deck: "#8A6A48", deckDark: "#6A4C34", sea: "#5B93AE" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    gulls: true,
    clouds: true,
    cloudSize: 0.8,
    cloudAlpha: 0.65,
  },
  emptytray: {
    sky: ["#FF9E6E", "#F06A96"],
    ink: "#3A2340",
    pill: "#FFFFFF",
    accent: "#F5567F",
    pier: { at: 0.76, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#33607E" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    cart: true,
    vignette: true,
  },
  callbox: {
    sky: ["#F0855E", "#D45C8C"],
    ink: "#3A2340",
    pill: "#FFFFFF",
    accent: "#F5567F",
    pier: { at: 0.75, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#2E5876" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    callbox: true,
    sparkle: ["#FFE08A", "#FFD1E0"],
  },
  scoopdelivery: {
    sky: ["#F0855E", "#D45C8C"],
    ink: "#3A2340",
    pill: "#FFFFFF",
    accent: "#F5567F",
    pier: { at: 0.75, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#2E5876" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    cart: true,
    sparkle: ["#FFE08A", "#FFD1E0"],
  },
  pierstroll: {
    sky: ["#E97C6E", "#C25C96"],
    ink: "#FFF3EC",
    pill: "#7A2A56",
    accent: "#FFAE4A",
    pier: { at: 0.75, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#2A4E6C" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    railing: "#FFF7F0",
    bulbs: true,
  },
  benchlights: {
    sky: ["#C86A8C", "#8A4C8E"],
    ink: "#FFF3EC",
    pill: "#6B2A5E",
    accent: "#FFAE4A",
    pier: { at: 0.76, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#254462" },
    stalls: { far: "#9C6B8E", near: "#C98BAE", roof: "#7A4A6C" },
    bulbs: true,
    sparkle: ["#FFE08A", "#FFD1E0"],
  },
  carouselglow: {
    sky: ["#B95E8E", "#6B3E82"],
    ink: "#FFF3EC",
    pill: "#5A2360",
    accent: "#FFAE4A",
    pier: { at: 0.76, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#203A56"},
    carousel: true,
    bulbs: true,
  },
  duskdock: {
    sky: ["#8A4C8E", "#4A3070"],
    ink: "#FFF3EC",
    pill: "#3E2360",
    accent: "#FFAE4A",
    pier: { at: 0.76, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#1C2E4C" },
    stalls: { far: "#5E3E68", near: "#7A4E7E", roof: "#4A2E52" },
    stars: true,
    bulbs: true,
  },
  ferriswheel: {
    sky: ["#6B3E82", "#2E2456"],
    ink: "#FFF3EC",
    pill: "#2E2360",
    accent: "#FFAE4A",
    pier: { at: 0.77, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#16223E" },
    ferriswheel: true,
    stars: true,
  },
  fireworks: {
    sky: ["#3A2A64", "#1A1642"],
    ink: "#FFF3EC",
    pill: "#241A4A",
    accent: "#FFAE4A",
    pier: { at: 0.78, deck: "#7A5A3C", deckDark: "#5A3F28", sea: "#101832" },
    stars: true,
    fireworksBurst: ["#FF6B8A", "#FFD23F", "#8E6BFF", "#6BE0C0"],
  },

  // ---------------------------------------------------------------- E10 · the game show
  showlights: {
    sky: ["#0E1240", "#1C2668"],
    ink: "#FFE156",
    pill: "#141A50",
    accent: "#FF4D8D",
    curtains: { cloth: "#1C2478", shade: "#10164E", closed: true },
    boards: { at: 0.86, face: "#141A50", edge: "#2B3690" },
    spot: { at: 0.5, colour: "#8FD8FF", width: 0.4 },
    sparkle: ["#8FD8FF", "#C7E8FF"],
  },
  buzzerstage: {
    sky: ["#1C2470", "#3A2C8E"],
    ink: "#FFE156",
    pill: "#1C2470",
    accent: "#FF4D8D",
    curtains: { cloth: "#1C2478", shade: "#10164E" },
    boards: { at: 0.86, face: "#141A50", edge: "#2B3690" },
    spot: { at: 0.28, colour: "#FF6B4A", width: 0.32 },
    spot2: { at: 0.72, colour: "#4AC4FF", width: 0.3 },
    bulbs: true,
    sparkle: ["#FFE156", "#FFF3B0"],
  },
  greenroom: {
    // Brighter and more festive than the first pass — the deep-navy backstage (ropes, a bare
    // crate) read as flat and washed out for what is a celebratory beat ("you are on fire
    // today!" plus the like ask), not a quiet aside.
    sky: ["#8A2C8E", "#3E1E7A"],
    ink: "#FFE9FF",
    pill: "#4A1E70",
    accent: "#FFE156",
    boards: { at: 0.86, face: "#3A1E70", edge: "#5A2E9E" },
    bulbs: true,
    sparkle: ["#FFE156", "#8FD8FF", "#FF9EC4"],
  },
  buzzerstagehot: {
    sky: ["#2A2C8E", "#5A2C9E"],
    ink: "#FFE156",
    pill: "#241F80",
    accent: "#FF4D8D",
    curtains: { cloth: "#2A2C8E", shade: "#1A1C60" },
    boards: { at: 0.86, face: "#241F80", edge: "#4438B8" },
    spot: { at: 0.28, colour: "#FF4D8D", width: 0.34 },
    spot2: { at: 0.72, colour: "#FFE156", width: 0.32 },
    bulbs: true,
    sparkle: ["#FFE156", "#FF9EC4", "#8FD8FF"],
  },
  confettifinale: {
    sky: ["#341F90", "#6B2CA8"],
    ink: "#FFF6E2",
    pill: "#301A80",
    accent: "#FFE156",
    curtains: { cloth: "#2A2C8E", shade: "#1A1C60" },
    boards: { at: 0.86, face: "#241F80", edge: "#4438B8" },
    bulbs: true,
    sparkle: ["#FFE156", "#FF9EC4", "#8FD8FF", "#FFF3B0"],
  },

  // ---------------------------------------------------------------- E14 · the arcade
  //
  // Five worlds, same curtains/boards/spot/bulbs vocabulary E10's game show already built, in an
  // electric hue family neither E10 (indigo/gold) nor E11 (cherry/magenta) uses: near-black
  // cabinets, neon lime and hot pink. `accent` is neon lime (`#C6FF3D`) everywhere — the abacus
  // rig's own on-bead colour — so the cards, the headline pill and the round chip all read as
  // pulled from the same light. No entry sets `confetti: true` — every celebration beat routes
  // through the scene-level `celebrate` prop instead, same discipline the whole series holds to.
  ticketglow: {
    sky: ["#0A0A16", "#161028"],
    ink: "#C6FF3D",
    pill: "#141024",
    accent: "#FF3DA6",
    curtains: { cloth: "#1A1430", shade: "#0E0A1C", closed: true },
    boards: { at: 0.86, face: "#141024", edge: "#2C2048" },
    spot: { at: 0.5, colour: "#FF3DA6", width: 0.4 },
    sparkle: ["#C6FF3D", "#8FE8FF"],
  },
  arcadefloor: {
    sky: ["#100C24", "#301A4A"],
    ink: "#C6FF3D",
    pill: "#180F30",
    accent: "#FF3DA6",
    curtains: { cloth: "#1A1430", shade: "#0E0A1C" },
    boards: { at: 0.86, face: "#141024", edge: "#2C2048" },
    spot: { at: 0.28, colour: "#C6FF3D", width: 0.32 },
    spot2: { at: 0.72, colour: "#FF3DA6", width: 0.3 },
    bulbs: true,
    sparkle: ["#C6FF3D", "#8FE8FF"],
  },
  prizewall: {
    sky: ["#241238", "#3A1A48"],
    ink: "#FFF3FA",
    pill: "#2C1440",
    accent: "#C6FF3D",
    boards: { at: 0.86, face: "#2C1440", edge: "#4A2460" },
    bulbs: true,
    sparkle: ["#C6FF3D", "#8FE8FF", "#FF9ED6"],
  },
  arcadeneon: {
    sky: ["#180E30", "#4A1858"],
    ink: "#C6FF3D",
    pill: "#200F3C",
    accent: "#FF3DA6",
    curtains: { cloth: "#2A1846", shade: "#160C2E" },
    boards: { at: 0.86, face: "#200F3C", edge: "#48246A" },
    spot: { at: 0.28, colour: "#FF3DA6", width: 0.34 },
    spot2: { at: 0.72, colour: "#C6FF3D", width: 0.32 },
    bulbs: true,
    sparkle: ["#C6FF3D", "#FF9ED6", "#8FE8FF"],
  },
  jackpotfinale: {
    sky: ["#160A2C", "#4A1858"],
    ink: "#FFF6FA",
    pill: "#200F3C",
    accent: "#C6FF3D",
    curtains: { cloth: "#2A1846", shade: "#160C2E" },
    boards: { at: 0.86, face: "#200F3C", edge: "#48246A" },
    bulbs: true,
    sparkle: ["#C6FF3D", "#FF9ED6", "#8FE8FF", "#FFF3B0"],
  },

  // ---------------------------------------------------------------- E11 · the big top circus
  //
  // Ten worlds. The palette stays in one family throughout — cherry red through hot magenta to
  // gold — so the episode reads as one tent lit differently across an afternoon, never as ten
  // unrelated rooms. `accent` is gold (`#FFD23F`) everywhere: it is the ring's own colour, on the
  // bulbs and the sparkle, and it is what the headline pill and the cards borrow it for.
  ringclosed: {
    sky: ["#3A0E14", "#6E1B24"],
    ink: "#FFEFD8",
    pill: "#4A121A",
    accent: "#FFD23F",
    curtains: { cloth: "#B8342E", shade: "#7A1E1A", closed: true },
    boards: { at: 0.86, face: "#6E2620", edge: "#C46A4A" },
    bulbs: true,
    sparkle: ["#FFD23F"],
  },
  sawdustring: {
    sky: ["#4A1018", "#7A2028"],
    ink: "#FFEFD8",
    pill: "#551620",
    accent: "#FFD23F",
    curtains: { cloth: "#B8342E", shade: "#7A1E1A" },
    spot: { at: 0.5, colour: "#FFF3D6", width: 0.46 },
    boards: { at: 0.88, face: "#6E2620", edge: "#C46A4A" },
    sparkle: ["#FFD23F"],
  },
  secondring: {
    sky: ["#3A1030", "#6E2050"],
    ink: "#FFEFEA",
    pill: "#431640",
    accent: "#FF57C0",
    curtains: { cloth: "#B8342E", shade: "#7A1E1A" },
    spot: { at: 0.32, colour: "#FFF3D6", width: 0.3 },
    // the SECOND spot is COOL, not warm — the tens rod is empty, and a cool light on an empty
    // thing reads differently from the warm one finding a full rod, before either is explained
    spot2: { at: 0.68, colour: "#8FE3FF", width: 0.3 },
    boards: { at: 0.88, face: "#6E2620", edge: "#C46A4A" },
    sparkle: ["#FFD23F", "#8FE3FF"],
  },
  bigtopnaming: {
    sky: ["#4A1830", "#8A2E58"],
    ink: "#FFF3E0",
    pill: "#551C3E",
    accent: "#FFD23F",
    backstage: true,
    boards: { at: 0.88, face: "#5E2420", edge: "#96543A" },
    sparkle: ["#FFD23F", "#FFB8E6"],
  },
  bigtopchant: {
    sky: ["#5A1030", "#B8306A"],
    ink: "#FFF3E0",
    pill: "#63163C",
    accent: "#FFD23F",
    curtains: { cloth: "#B8342E", shade: "#7A1E1A" },
    spot: { at: 0.5, colour: "#FFF6DC", width: 0.5 },
    // the ringmaster's top hat, on the ring — the same prop field E07 used for its magician's
    // hat, standing in here for the ring's own master of ceremonies
    tophat: true,
    boards: { at: 0.87, face: "#6E2620", edge: "#C46A4A" },
    sparkle: ["#FFD23F", "#FF9EC4", "#FFF3C4"],
  },
  centerring: {
    sky: ["#40102A", "#8C2454"],
    ink: "#FFF1E4",
    pill: "#4A1332",
    accent: "#FF57C0",
    curtains: { cloth: "#B8342E", shade: "#7A1E1A" },
    spot: { at: 0.5, colour: "#FFF6DC", width: 0.4 },
    boards: { at: 0.86, face: "#6E2620", edge: "#C46A4A" },
    sparkle: ["#FFD23F"],
  },
  showtime: {
    sky: ["#6E1626", "#C4406A"],
    ink: "#FFF6E2",
    pill: "#7A1B30",
    accent: "#FFD23F",
    curtains: { cloth: "#D23F5C", shade: "#8C1A34" },
    boards: { at: 0.86, face: "#7A3020", edge: "#D8905A" },
    bulbs: true,
    sparkle: ["#FFD23F", "#FFF3C4"],
  },
  secondact: {
    sky: ["#5A0F22", "#9E2A50"],
    ink: "#FFF1E4",
    pill: "#63132A",
    accent: "#FFD23F",
    curtains: { cloth: "#C4284C", shade: "#8C1636" },
    boards: { at: 0.86, face: "#7A3020", edge: "#D8905A" },
    spot: { at: 0.5, colour: "#FFF6DC", width: 0.54 },
    sparkle: ["#FFD23F"],
  },
  yourturnring: {
    sky: ["#7A1030", "#E8447A"],
    ink: "#FFF6E8",
    pill: "#7A1030",
    accent: "#FF57C0",
    curtains: { cloth: "#D23F5C", shade: "#8C1A34" },
    boards: { at: 0.86, face: "#7A3020", edge: "#D8905A" },
    bulbs: true,
    sparkle: ["#FFD23F", "#FF9EC4", "#8FE3FF"],
  },
  finalebow: {
    sky: ["#8C1438", "#D23F6A"],
    ink: "#FFF6E8",
    pill: "#8C1438",
    accent: "#FFD23F",
    curtains: { cloth: "#D23F5C", shade: "#8C1A34" },
    boards: { at: 0.86, face: "#7A3020", edge: "#D8905A" },
    bulbs: true,
    sparkle: ["#FFD23F", "#FFF3C4", "#FF9EC4", "#8FE3FF"],
  },

  // ---------------------------------------------------------------- E12 · rainbow treehouse jungle
  //
  // Nine worlds, morning to dusk, all in the canopy/vines/ferns vocabulary E06 built. `accent`
  // stays toucan-orange (#FF7A3D) almost throughout, the one exception being `flipbridge`'s teal
  // (#2FE0C4) — the single beat this episode wants to visually set apart, because it is teaching
  // the one genuinely new idea (the trick reversed).
  canopyrise: {
    sky: ["#0E3B2E", "#2E8B6F"],
    ink: "#FFF8E8",
    pill: "#123A2A",
    accent: "#FF7A3D",
    canopy: { far: "#1C5C42", near: "#2E8B6F", depth: 0.6 },
    godrays: true,
    ferns: "#1F5E3A",
    butterflies: ["#FFD23F", "#FF7A3D"],
  },
  friendbranch: {
    sky: ["#123A2A", "#3AA07C"],
    ink: "#FFF8E8",
    pill: "#153F2E",
    accent: "#FF7A3D",
    canopy: { far: "#1C5C42", near: "#3AA07C", depth: 0.6 },
    // FIVE vine pairs — the five big-friend pairs, hanging together before the script even
    // names the first one. `pairs` was built for E06's "two rods" and has sat unused since.
    vines: { colour: "#2E8B6F", count: 5, pairs: true },
    ferns: "#1F5E3A",
  },
  clearingcheck: {
    sky: ["#1C5C42", "#5BC49A"],
    ink: "#0E3B2E",
    pill: "#FFFFFF",
    accent: "#FF7A3D",
    ferns: "#2E8B6F",
    godrays: true,
  },
  twinvines: {
    sky: ["#153F2E", "#3AA07C"],
    ink: "#FFF8E8",
    pill: "#153F2E",
    accent: "#FF7A3D",
    canopy: { far: "#1C5C42", near: "#3AA07C", depth: 0.55 },
    vines: { colour: "#FFD23F", count: 2, pairs: true },
    ferns: "#1F5E3A",
  },
  buddyperch: {
    sky: ["#1F5E3A", "#6BCB9E"],
    ink: "#0E3B2E",
    pill: "#FFFFFF",
    accent: "#FF7A3D",
    canopy: { far: "#2E8B6F", near: "#6BCB9E", depth: 0.5 },
    blossoms: ["#FF9EC4", "#FFD23F"],
    ferns: "#2E8B6F",
  },
  patternleaf: {
    sky: ["#123A2A", "#2E8B6F"],
    ink: "#FFF8E8",
    pill: "#123A2A",
    accent: "#FF7A3D",
    canopy: { far: "#1C5C42", near: "#2E8B6F", depth: 0.6 },
    ferns: "#1F5E3A",
  },
  flipbridge: {
    sky: ["#153F2E", "#3AA07C"],
    ink: "#FFF8E8",
    pill: "#153F2E",
    accent: "#2FE0C4",
    // a rope bridge you can walk either direction — the exact shape of "it works flipped too".
    // Raised above the usual ground line, and `ferns` deliberately left off this one world: the
    // ferns band paints over anything at the ferns' own height, which hid the bridge entirely
    // the first time this was rendered.
    ropebridge: { at: 0.64, rope: "#8A5A2E", plank: "#C89355" },
    canopy: { far: "#1C5C42", near: "#3AA07C", depth: 0.5 },
  },
  yourturncanopy: {
    sky: ["#7A2E50", "#E8447A"],
    ink: "#FFF6E8",
    pill: "#7A2E50",
    accent: "#FFD23F",
    canopy: { far: "#2E8B6F", near: "#5BC49A", depth: 0.4 },
    falls: { at: 0.7, water: "#4AC4E0", foam: "#FFFFFF", toBottom: true },
  },
  duskfarewell: {
    sky: ["#3A1848", "#B8497A"],
    ink: "#FFF6E8",
    pill: "#3A1848",
    accent: "#FF7A3D",
    canopy: { far: "#1C5C42", near: "#2E8B6F", depth: 0.5 },
    blossoms: ["#FFD23F", "#FF9EC4", "#FF7A3D"],
    butterflies: ["#FFD23F"],
  },

  // ---------------------------------------------------------------- E13 · the autumn park
  //
  // Eleven worlds, morning to golden-hour dusk, all in E08's park vocabulary recoloured rust,
  // gold and chestnut. `accent` stays a warm amber (#D9791E) through most of it — the one
  // exception is `whyclearing`'s cool plum (#6B4FA0), set apart because it is the one beat that
  // stops the story to explain WHY the trick works rather than perform it.
  parkfall: {
    sky: ["#F2C879", "#FCE7B8"],
    ink: "#5C3410",
    pill: "#FFFFFF",
    accent: "#D9791E",
    parkground: { at: 0.70, grass: "#C68A3D", grassDark: "#9C6A28", path: "#EAD4A6" },
    trees: { far: "#B5651D", near: "#D9791E", trunk: "#6E4630" },
    fence: "#FFF6E8",
    clouds: true,
    cloudSize: 0.85,
    cloudAlpha: 0.85,
    birds: true,
    sun: true,
    leaves: ["#C0392B", "#D9791E", "#E8B84B"],
  },
  acornstash: {
    sky: ["#EAB768", "#F6D896"],
    ink: "#5C3410",
    pill: "#FFFFFF",
    accent: "#D9791E",
    parkground: { at: 0.70, grass: "#BE813A", grassDark: "#946125", path: "#E6CE9E" },
    trees: { far: "#A9571A", near: "#C97A3D", trunk: "#6E4630" },
    leaves: ["#D9791E", "#B5651D"],
  },
  emptybranch: {
    sky: ["#D9A85E", "#F0CE8E"],
    ink: "#4A2E10",
    pill: "#FFFFFF",
    accent: "#B5651D",
    parkground: { at: 0.70, grass: "#B27936", grassDark: "#8A5C22", path: "#E0C692" },
    trees: { far: "#9C5218", near: "#B5651D", trunk: "#5C3410" },
    leaves: ["#E8B84B"],
  },
  whyclearing: {
    sky: ["#E8CE94", "#F6E6BE"],
    ink: "#3A2A50",
    pill: "#FFFFFF",
    accent: "#6B4FA0",
    parkground: { at: 0.70, grass: "#C79646", grassDark: "#9E7530", path: "#EEDCAE" },
    clouds: true,
    cloudSize: 0.8,
    cloudAlpha: 0.9,
  },
  hollowtrunk: {
    sky: ["#E8B85E", "#F6D48C"],
    ink: "#4A2E10",
    pill: "#FFFFFF",
    accent: "#D9791E",
    parkground: { at: 0.70, grass: "#C0873C", grassDark: "#966A28", path: "#E6CE9E" },
    trees: { far: "#A9571A", near: "#D9791E", trunk: "#5C3410" },
    fence: "#FFF6E8",
    leaves: ["#C0392B", "#E8B84B"],
  },
  russetpath: {
    sky: ["#E0AE5E", "#F0CE8E"],
    ink: "#4A2E10",
    pill: "#FFFFFF",
    accent: "#D9791E",
    parkground: { at: 0.70, grass: "#B98038", grassDark: "#8F6224", path: "#E4C88F" },
    trees: { far: "#9C5218", near: "#C0873C", trunk: "#5C3410" },
    flowers: ["#C0392B", "#E8B84B"],
    leaves: ["#B5651D", "#D9791E"],
  },
  goldenfall: {
    sky: ["#F2C56A", "#FCE7B8"],
    ink: "#5C3410",
    pill: "#FFFFFF",
    accent: "#D9791E",
    parkground: { at: 0.70, grass: "#CB9040", grassDark: "#A0702B", path: "#EEDCAE" },
    trees: { far: "#B5651D", near: "#E8B84B", trunk: "#6E4630" },
    bandstand: true,
    leaves: ["#E8B84B", "#D9791E"],
  },
  duskgrove: {
    sky: ["#8C4A2E", "#D9791E"],
    ink: "#FFF6E8",
    pill: "#5C2E12",
    accent: "#F0CE8E",
    parkground: { at: 0.70, grass: "#7A5024", grassDark: "#573A18", path: "#C69C5E" },
    trees: { far: "#5C3410", near: "#8A5228", trunk: "#3A2410" },
    leaves: ["#C0392B", "#8A5228"],
  },
  leafdrift: {
    sky: ["#E8C078", "#F6E0A8"],
    ink: "#4A2E10",
    pill: "#FFFFFF",
    accent: "#D9791E",
    parkground: { at: 0.70, grass: "#C0873C", grassDark: "#966A28", path: "#E6CE9E" },
    trees: { far: "#A9571A", near: "#C97A3D", trunk: "#5C3410" },
    leaves: ["#C0392B", "#D9791E", "#E8B84B"],
  },
  acornchallenge: {
    sky: ["#7A2E3A", "#E88A4A"],
    ink: "#FFF6E8",
    pill: "#5C2412",
    accent: "#E8B84B",
    parkground: { at: 0.70, grass: "#8A5C28", grassDark: "#603E18", path: "#D0A362" },
    trees: { far: "#6E3A18", near: "#9C5218", trunk: "#3A2410" },
    leaves: ["#E8B84B", "#C0392B"],
  },
  harvestglow: {
    sky: ["#4A2018", "#B5651D"],
    ink: "#FFF6E8",
    pill: "#3A1810",
    accent: "#E8B84B",
    parkground: { at: 0.70, grass: "#5C3A1C", grassDark: "#3E2610", path: "#8A6636" },
    trees: { far: "#3E2410", near: "#6E3A18", trunk: "#2A1A0C" },
    lanterns: ["#E8B84B", "#D9791E", "#C0392B"],
    leaves: ["#D9791E", "#E8B84B"],
  },

  // ---------------------------------------------------------------- E15 · the sea-otter kelp cove
  //
  // Nine beats, one palette family: deep teal to aqua water with a warm light falling through it,
  // morning to dusk. `accent` is a DARK ocean teal (#0B6B7D) everywhere — white caption text sits on it as
  // the karaoke pill, so it has to pass 4.5:1 against white; `pill` is a deep sea blue for the headline.
  covedawn: {
    sky: ["#FFC2A0", "#19C3D9"],
    ink: "#0B3B4A",
    pill: "#0B4F63",
    accent: "#0B6B7D",
    cove: { light: "#FFD9B8", shafts: 4, kelp: ["#17B58A", "#0A8F78"], floor: ["#E8C79B", "#6E8C8A"], bubbles: 12, fish: ["#FFB27A"], mist: 0.42, coral: ["#FF8F70", "#FFC36B"] },
  },
  coveshallows: {
    sky: ["#6FF0E6", "#1BA6E0"],
    ink: "#0B3B4A",
    pill: "#0B4F63",
    accent: "#0B6B7D",
    cove: { light: "#FFF6CC", shafts: 6, kelp: ["#2BCB7F", "#12A064"], floor: ["#F2D9A6", "#7BA6A0"], bubbles: 16, fish: ["#FFC857", "#FF8F70", "#7FE0D0"], coral: ["#FF8F70", "#FFC36B", "#B58CFF"] },
  },
  covetidepool: {
    sky: ["#58DCD8", "#1A86C9"],
    ink: "#0B3B4A",
    pill: "#0B4F63",
    accent: "#0B6B7D",
    cove: { light: "#FFE9C2", shafts: 3, kelp: ["#1FBF88", "#0E9A70"], floor: ["#D9BE93", "#5E7F82"], bubbles: 8, fish: ["#FFC857"], rocks: true, coral: ["#FF8F70"] },
  },
  covereef: {
    sky: ["#3FE0E8", "#1470D0"],
    ink: "#0B3B4A",
    pill: "#0B4F63",
    accent: "#0B6B7D",
    cove: { light: "#FFF0C8", shafts: 5, kelp: ["#25D08A", "#0FA66C"], floor: ["#EFD3A0", "#6F9A9B"], bubbles: 14, fish: ["#FFC857", "#FF6F91", "#7FE0D0", "#B58CFF"], coral: ["#FF6F91", "#FFC36B", "#B58CFF", "#FF8F70"] },
  },
  covekelp: {
    sky: ["#8FF5D8", "#17B3B0"],
    ink: "#0B3B4A",
    pill: "#0B4F63",
    accent: "#0B6B7D",
    cove: { light: "#FFF6C8", shafts: 7, kelp: ["#47D96B", "#25B050"], floor: ["#F0DBA8", "#7DAA9A"], bubbles: 18, fish: ["#FFC857", "#FF8F70", "#7FE0D0", "#FFFFFF"], coral: ["#FFC36B"] },
  },
  covedeep: {
    sky: ["#2FB4F2", "#1A3FB5"],
    ink: "#FFFFFF",
    pill: "#0B3F6E",
    accent: "#0B6B7D",
    cove: { light: "#BFE8FF", shafts: 4, kelp: ["#16A5B8", "#0C7096"], floor: ["#9DB8C6", "#385E7A"], bubbles: 20, fish: ["#FFC857", "#7FE0D0", "#FFFFFF"], stream: true, coral: ["#FF8F70"] },
  },
  covedrift: {
    sky: ["#5CE6D6", "#1C8FD0"],
    ink: "#0B3B4A",
    pill: "#0B4F63",
    accent: "#0B6B7D",
    cove: { light: "#E8FFE8", shafts: 5, kelp: ["#2FD08A", "#1BA278"], floor: ["#EBD7A6", "#7AA89F"], bubbles: 10, fish: ["#7FE0D0", "#FFFFFF"], coral: ["#FFC36B", "#FF8F70"] },
  },
  covegold: {
    sky: ["#FFD26E", "#16B8B0"],
    ink: "#0B3B4A",
    pill: "#0B4F63",
    accent: "#0B6B7D",
    cove: { light: "#FFE6A0", shafts: 6, kelp: ["#46D18A", "#22A06A"], floor: ["#F6DDA2", "#7FB1A0"], bubbles: 14, fish: ["#FFC857", "#FF8F70", "#FFFFFF"], coral: ["#FFC36B", "#FF8F70"] },
  },
  covemoon: {
    sky: ["#4B5FD0", "#14246B"],
    ink: "#FFFFFF",
    pill: "#13285A",
    accent: "#0B6B7D",
    cove: { light: "#D8E6FF", shafts: 3, kelp: ["#2C86B0", "#1B5C86"], floor: ["#5B7894", "#2A4562"], bubbles: 10, fish: ["#9DC8FF"], night: true, coral: ["#7FA6E8"] },
  },
  // ---------------------------------------------------------------- E08 · Dino Valley
  dinomorning: { sky: ["#FFD27A", "#7FE0E0"], ink: "#123F2E", pill: "#14573F", accent: "#14573F", dino: { hills: ["#7FDC5E", "#3FC25A"], fern: ["#22B25A", "#128F45"], volcano: true, glow: "#FFA23D", sun: "#FFE9A8" } },
  dinomeadow: { sky: ["#6FD6FF", "#C8F59A"], ink: "#123F2E", pill: "#14573F", accent: "#14573F", dino: { hills: ["#8CE06A", "#3FCB5C"], fern: ["#22B25A", "#12A04A"], glow: "#FFC24D", sun: "#FFF1B8" } },
  dinoegg: { sky: ["#9AEBD0", "#FFF1A0"], ink: "#123F2E", pill: "#14573F", accent: "#14573F", dino: { hills: ["#9BE56E", "#45CC62"], fern: ["#26B85E", "#139A4C"], glow: "#FFC24D", sun: "#FFF1B8" } },
  dinovolcano: { sky: ["#FFC27A", "#8FE3D6"], ink: "#123F2E", pill: "#14573F", accent: "#14573F", dino: { hills: ["#86DA5E", "#3DC058"], fern: ["#22B25A", "#128F45"], volcano: true, glow: "#FF7A2A", sun: "#FFE9A8" } },
  dinosunset: { sky: ["#FF9E7A", "#9B7BE8"], ink: "#FFFFFF", pill: "#3E2A6B", accent: "#14573F", dino: { hills: ["#6CCB68", "#37AE68"], fern: ["#1EA255", "#0F7F3F"], volcano: true, glow: "#FF6A3A", dusk: true } },

  ...BB_WORLDS,
};
