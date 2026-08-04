// Design tokens for the Abacus video series.
// Every value here traces to the iOS app — see docs/DESIGN_SYSTEM.md for the source
// file and line of each. Do not add a colour that isn't from the app.

export const FPS = 30;

// 16:9 canvas. Portrait cuts get their own reel module and their own bands.
export const W = 1920;
export const H = 1080;

// --- Bands (DESIGN_SYSTEM §8). Nothing may cross a boundary. ---
export const BAND = {
  headlineTop: 0,
  headlineBottom: 200,
  stageTop: 220,
  stageBottom: 840,
  captionTop: 860,
  captionBottom: 1010,
} as const;

// --- Ambient layer (BackgroundImage.swift) ---
export const AMBIENT_GRADIENT = [
  { color: "#F7F2FF", at: 0.0 },
  { color: "#FDFCFF", at: 0.45 },
  { color: "#EFF6FF", at: 1.0 },
] as const;

// radius is phone-scale; multiply by W/390 at render (DESIGN_SYSTEM §1)
export const ORBS = [
  { cx: 0.10, cy: 0.20, radius: 240, color: "#A78BFA", speed: 0.10, phase: 0.0, drift: 28 },
  { cx: 0.82, cy: 0.15, radius: 200, color: "#60A5FA", speed: 0.08, phase: 1.5, drift: 22 },
  { cx: 0.55, cy: 0.80, radius: 220, color: "#F472B6", speed: 0.11, phase: 0.8, drift: 26 },
  { cx: 0.18, cy: 0.75, radius: 175, color: "#FCD34D", speed: 0.07, phase: 2.2, drift: 18 },
  { cx: 0.90, cy: 0.60, radius: 165, color: "#34D399", speed: 0.12, phase: 1.0, drift: 20 },
  { cx: 0.48, cy: 0.38, radius: 185, color: "#C084FC", speed: 0.09, phase: 3.1, drift: 15 },
] as const;

export const SPARKLES = [
  { cx: 0.05, cy: 0.10, size: 0.028, speed: 0.40, phase: 0.0 },
  { cx: 0.93, cy: 0.08, size: 0.022, speed: 0.35, phase: 1.2 },
  { cx: 0.28, cy: 0.92, size: 0.030, speed: 0.45, phase: 0.5 },
  { cx: 0.72, cy: 0.88, size: 0.020, speed: 0.38, phase: 2.0 },
  { cx: 0.96, cy: 0.42, size: 0.024, speed: 0.42, phase: 1.7 },
  { cx: 0.07, cy: 0.58, size: 0.018, speed: 0.30, phase: 3.0 },
  { cx: 0.50, cy: 0.04, size: 0.026, speed: 0.50, phase: 0.3 },
  { cx: 0.76, cy: 0.52, size: 0.016, speed: 0.55, phase: 2.5 },
  { cx: 0.38, cy: 0.15, size: 0.020, speed: 0.36, phase: 1.1 },
  { cx: 0.62, cy: 0.65, size: 0.022, speed: 0.44, phase: 0.7 },
] as const;

export const SPARKLE_COLOR = "#6D28D9";
export const ORB_SCALE = W / 390; // phone → video

// The app's per-orb peak is 0.28 on a 390 px-wide phone. At 1920 the same relative
// radii overlap several deep, and overlapping radial gradients ADD — the first render
// came out a saturated pink wash that swamped the foreground, breaking DESIGN_SYSTEM
// §0. Peak is lowered so the COMPOSITE stays near the app's 0.28 ceiling.
export const ORB_PEAK = 0.13;

// --- Episode theme. ColorPresets.swift, `poligon_cyan` — the app's own first pick. ---
export const THEME = {
  c500: "#00BCD4", // bead faces          (abacusTopGradient)
  c300: "#4DD0E1", // arrow backdrops     (abacusCenterGradient)
  c200: "#80DEEA", // rods                (columnColors)
  c50: "#E0F7FA", // panel washes        (abacusBottomGradient)
  c800: "#00838F", // arrows, hint text   (buttonColor)
  displayBG: "#5F0F40",
  displayBorder: "#DA7422",
} as const;

// --- Place-value scale (AbacusWithDecimalView.swift:641-681). Theme-independent. ---
// Index 0 = ones, ascending leftward.
export const PLACE_COLORS = [
  "#F57C00", // ones
  "#A4B42B", // tens
  "#388E3C", // hundreds
  "#00796B", // thousands
  "#0097A7", // ten-thousands
  "#1976D2", // lakhs
  "#303F9F", // ten-lakhs
] as const;

export const PLACE_NAMES = ["Ones", "Tens", "Hundreds", "Thousands", "Ten thousands"] as const;

// --- Bead geometry (DimensionsUtils.swift; pitch derived in DESIGN_SYSTEM §3) ---
// The app's `aspectRatio(rods * 0.185)` is really pitch/height = 47/254 on phone.
// Scaling that whole abacus to the 620 px stage gives s = 620/254 = 2.44, and every
// dimension below is an app value times s. Cross-check: 5 * 115 = 575 wide, which
// leaves 672 px clear on each side of a 1920 frame, as DESIGN_SYSTEM §8 states.
export const ROD_COUNT = 5;
export const ROD_PITCH = 115; // 47 * 2.44
export const BEAD_ASPECT = 1.8;
export const BEAD_W = 110; // 45 * 2.44
export const BEAD_H = 61; //  25 * 2.44  (110/61 = 1.80 ✓)
// The beam's DRAWN height must equal the height reserved for it here. It was drawn at
// BEAM_H + 6 while the layout reserved BEAM_H, so the beam overlapped the top 6 px of the
// first earth bead and visibly sliced it. 16 keeps the beam chunky enough to read.
export const BEAM_H = 16;
export const FRAME_LW = 20;
export const FRAME_RADIUS = 28;

// Vertical layout inside the frame: 2 bead-heights of heaven, then the beam, then
// 5 slots of earth (4 beads + 1 slot of travel).
export const HEAVEN_H = BEAD_H * 2; // 122
export const EARTH_H = BEAD_H * 5; //  305
export const ABACUS_INNER_H = HEAVEN_H + BEAM_H + EARTH_H; // 437
export const ABACUS_W = ROD_COUNT * ROD_PITCH; // 575

// --- The sticker idiom (KidsActionButton.swift) ---
export const DEPTH_OFFSET = 6; // base layer sits this far below the face
export const TEXT_SHADOW = "rgba(0,0,0,0.35)";
export const TEXT_SHADOW_EM = 0.035;

// Focus levels (AbacusWithDecimalView.swift tour + ColumnView bead states)
export const DIM = 0.15; // dimming a named PART (frame / beam / top / bottom)

// Dimming a whole rod is different from dimming a part: a rod at 0.15 whose beads are
// already washed to 25% saturation disappears completely, and the abacus reads as an
// empty box — the "a container on screen must never be empty" failure. 0.35 keeps the
// rod present but clearly not the subject.
export const ROD_DIM = 0.35;
export const BEAD_ACTIVE_MIX = 0.15; // theme500 mixed with white
export const BEAD_IDLE_MIX = 0.75;
export const BEAD_SHADOW_ALPHA = 0.25;
