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
  | "harbour" // morning teal water, masts — the hook
  | "sandpit" // warm sand, what adding means
  | "pebbles" // cool grey-blue shingle — one plus two
  | "shells" // pale coral, scattered shells — two plus two
  | "slatecliff" // dark wet slate — the lower-bead rule
  | "goldenhour" // rich low gold — the upper bead is five
  | "rockpool" // deep turquoise — five plus one, five plus four, any number
  | "sunsetsea"; // pink and orange dusk — your turn and the close

export interface WorldTheme {
  sky: [string, string];
  ground?: string;
  ink: string; // headline + caption text
  pill: string; // headline pill fill
  accent: string;
  stars?: boolean;
  clouds?: boolean;
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
  harbour: {
    sky: ["#2E6E7E", "#9FD8DE"],
    ground: "#1F4E5A",
    ink: "#FFFFFF",
    pill: "#0E7C86",
    accent: "#FFB703",
    clouds: true,
    horizon: { at: 0.68, h: 0.32 },
  },
  sandpit: {
    sky: ["#FFE9C4", "#FFF7E6"],
    ground: "#E3C48D",
    ink: "#5A3E1B",
    pill: "#FFFFFF",
    accent: "#E07A2F",
    sun: true,
    surface: { at: 0.72, h: 0.28, edge: "#F0DDB4" },
  },
  pebbles: {
    sky: ["#4E6E80", "#A8C3D1"],
    ground: "#6E8494",
    ink: "#12303C",
    pill: "#FFFFFF",
    accent: "#0E9AA0",
    hills: true,
  },
  shells: {
    sky: ["#FFB9A6", "#FFE3D9"],
    ink: "#7A3B2E",
    pill: "#FFFFFF",
    accent: "#D2593F",
  },
  slatecliff: {
    sky: ["#2B3A42", "#465A66"],
    ink: "#EAF4F7",
    pill: "#12303C",
    accent: "#7FE3FF",
    slate: { tray: "#1B262C" },
  },
  goldenhour: {
    sky: ["#F2A03D", "#FFE0A3"],
    ground: "#B4651E",
    ink: "#4A2408",
    pill: "#FFFFFF",
    accent: "#0E7C86",
    sun: true,
    hills: true,
  },
  rockpool: {
    sky: ["#0C6E77", "#3FB3B8"],
    ink: "#EAFEFF",
    pill: "#08525A",
    accent: "#FFB703",
    water: { at: 0.64 },
  },
  sunsetsea: {
    sky: ["#F2726F", "#FFD1A1"],
    ground: "#8A4A3C",
    ink: "#4A1B18",
    pill: "#FFFFFF",
    accent: "#0E7C86",
    hills: true,
    horizon: { at: 0.7, h: 0.3 },
  },
};
