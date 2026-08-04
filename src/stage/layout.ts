// One layout per aspect ratio, derived from the canvas the composition was registered at.
//
// The series ships 16:9 for YouTube and 4:5 for Facebook and Instagram, from the SAME reel —
// the phrase table, the worlds, the audio and the teaching are identical, and only the
// arrangement changes. That is the pattern the phonics series uses (`oo` and `oo-4x5` are one
// component registered twice), and it is the only way two cuts stay in step: a second reel
// file would drift the moment either was edited.
//
// The one structural difference is where a teaching card goes. At 16:9 there is ~530 px beside
// the abacus, so a card sits next to the part it names. At 4:5 the frame is 1080 wide and the
// abacus fills nearly all of it, so there is no "beside" — cards get their own band under the
// stage, and the arrow points up into the beads.

import {
  ABACUS_INNER_H,
  BAND,
  FRAME_LW,
  ROD_PITCH,
} from "../data/tokens";

export interface Bands {
  headlineTop: number;
  headlineBottom: number;
  stageTop: number;
  stageBottom: number;
  captionTop: number;
  captionBottom: number;
}

export interface Layout {
  W: number;
  H: number;
  /** taller than it is wide — the 4:5 cut */
  portrait: boolean;
  band: Bands;
  /** Portrait only: the strip under the stage where teaching cards live. */
  cardBand: { top: number; height: number } | null;
  /** How much clear space a card may use. */
  cardMaxW: number;
  /** Side margin for anything pinned to an edge. */
  edge: number;
  /** Caption sizing — a 1360 px caption has no margin at all in a 1080 frame. */
  captionMaxW: number;
  captionSize: number;
  /**
   * Scale for the non-abacus stage props. They are drawn at absolute sizes designed for a
   * 1920 frame — E01's history timeline is ~1400 px wide — so in portrait they must be fitted
   * or they run off the edge.
   */
  propScale: number;
}

// 4:5 is 1080x1350. The extra 270 px over a 1080-tall frame buys the card band; everything
// else keeps roughly the proportions the 16:9 cut was designed at.
// Budget for 1350: headline 195 · stage 720 (holds a PUSH-scale abacus at 713) · cards 240
// (holds a three-line card at 226) · caption 140. A card band sized for two lines pushed the
// zero card 16 px into the caption band.
const PORTRAIT_BANDS: Bands = {
  headlineTop: 0,
  headlineBottom: 195,
  stageTop: 210,
  stageBottom: 930,
  captionTop: 1185,
  // the last 64 px are the brand strip: badge right, credit left, out of everything's way
  captionBottom: 1282,
};

export const layoutFor = (W: number, H: number): Layout => {
  const portrait = H > W;
  if (!portrait) {
    return {
      W,
      H,
      portrait: false,
      band: { ...BAND },
      cardBand: null,
      cardMaxW: 560,
      edge: 4,
      captionMaxW: W - 260,
      captionSize: 0, // 0 = keep the type scale's own size
      propScale: 1,
    };
  }
  return {
    W,
    H,
    portrait: true,
    band: PORTRAIT_BANDS,
    cardBand: { top: 930, height: 240 },
    // full width less margins: a portrait card is wide and short rather than narrow and tall
    cardMaxW: W - 120,
    edge: 30,
    captionMaxW: W - 90,
    captionSize: 38,
    // the widest prop is ~1400 px; (1080 - 2*30) / 1400
    propScale: 0.72,
  };
};

/**
 * The scale to draw the abacus at.
 *
 * The episode asks for a scale tuned to 16:9 (BASE 1.15, PUSH 1.3). In portrait that has to be
 * FITTED rather than multiplied: a fixed multiplier works for the 5-rod sections and breaks on
 * E01's 13-rod view, which at 0.78 x 1.15 would be 1341 px wide in a 1080 frame. So take the
 * smallest of what the episode wants, what the width allows, and what the stage band allows.
 *
 * `sideRoom` is space the episode needs next to the abacus — E02's ladder — so the fit leaves
 * it rather than the prop overlapping the frame.
 */
export interface SideRoom {
  left: number;
  right: number;
}

export const NO_ROOM: SideRoom = { left: 0, right: 0 };

export const fitScale = (
  layout: Layout,
  rodCount: number,
  desired: number,
  room: SideRoom = NO_ROOM
): number => {
  if (!layout.portrait) return desired;
  const outerW = rodCount * ROD_PITCH + FRAME_LW * 2;
  const outerH = ABACUS_INNER_H + FRAME_LW * 2;
  const usableW = layout.W - layout.edge * 2 - room.left - room.right;
  const usableH = layout.band.stageBottom - layout.band.stageTop;
  // 1.15 is the most a 4:5 frame can enlarge the 16:9 sizes before the stage band overflows
  return Math.min(desired * 1.15, usableW / outerW, usableH / outerH);
};

/**
 * How far to shift the abacus off centre, so the room reserved on each side is actually there.
 * Asymmetric because the two things that need room are different sizes: E02 has a ladder on the
 * left (~165) and the pushing hand on the right (~280), and reserving one figure for both
 * either clipped the hand off the frame or wasted a third of the width.
 */
export const stageOffsetX = (layout: Layout, room: SideRoom = NO_ROOM): number =>
  layout.portrait ? (room.left - room.right) / 2 : 0;
