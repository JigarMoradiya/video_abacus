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
  | "balloons"; // sunset with balloons — the close, not E01's confetti meadow

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
    pill: "#FFFFFF",
    accent: "#FF8F5E",
    stars: true,
    water: { at: 0.66 },
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
    clouds: true,
    starburst: true,
  },
  workshop: {
    sky: ["#FFF3DC", "#FFDFAE"],
    ground: "#A9744F",
    ink: "#4A2600",
    pill: "#FFFFFF",
    accent: "#00838F",
    surface: { at: 0.74, h: 0.26, edge: "#C98A5B" },
  },
  board: {
    sky: ["#0F3B3A", "#1E6F66"],
    ink: "#EAFFFB",
    pill: "#FFFFFF",
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
};
