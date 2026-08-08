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
  | "blossom"; // coral flowers everywhere — your turn, and the close

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
  falls?: { at: number; water: string; foam: string };
  /** Coral blossoms scattered through the canopy, and a few drifting down. */
  blossoms?: string[];
  /** A rope bridge across the frame, well below the stage. TWO ropes, one deck. */
  ropebridge?: { at: number; rope: string; plank: string };
  /** Two butterflies, wandering. The jungle's equivalent of E03's gulls. */
  butterflies?: string[];
  /** Sun shafts through the canopy — the thing that makes a jungle read as a jungle. */
  godrays?: boolean;
  /** TWO banana bunches hanging from the canopy, one per gutter. Paired, like everything in this
   *  world set — and the world called `bananagrove` should have bananas in it. */
  bananas?: boolean;
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
    confetti: true,
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
};
