// Where everything sits. Pure functions of (rod count, scale, frame) — no React, no
// scene object, nothing episode-specific.
//
// This exists because E01 computed the same arithmetic inline in five places, and every
// positioning bug it shipped was one copy disagreeing with another: an arrow origin
// derived from the panel slot while the label computed its own top, a hand anchor that
// let the arrow cross the beam, a rod band measured from a different inner edge than the
// group box. DESIGN_SYSTEM §8b calls this out — "measure positions from a render" is the
// verification, but one source for the arithmetic is the fix.
//
// Coordinate space is the 1920x1080 canvas. `top` already includes the idle bob, so
// anything anchored to the abacus must take its Y from here rather than recomputing it.

import {
  ABACUS_INNER_H,
  BAND,
  BEAD_H,
  BEAM_H,
  FRAME_LW,
  HEAVEN_H,
  ROD_PITCH,
} from "../data/tokens";
import { bob } from "../lib/motion";

export interface Pt {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The abacus's outer box, centred in the stage band, bobbing. */
export interface AbacusBox {
  left: number;
  top: number;
  w: number;
  h: number;
  /** inner edges — inside the wooden frame, where the rods and beads live */
  innerLeft: number;
  innerTop: number;
  innerW: number;
  scale: number;
  rodCount: number;
}

export const abacusBox = (
  rodCount: number,
  scale: number,
  canvasW: number,
  frame: number,
  fps: number
): AbacusBox => {
  const w = (rodCount * ROD_PITCH + FRAME_LW * 2) * scale;
  const h = (ABACUS_INNER_H + FRAME_LW * 2) * scale;
  const stageMidY = (BAND.stageTop + BAND.stageBottom) / 2;
  const left = (canvasW - w) / 2;
  const top = stageMidY - h / 2 + bob(frame, fps, 6, 5);
  return {
    left,
    top,
    w,
    h,
    innerLeft: left + FRAME_LW * scale,
    innerTop: top + FRAME_LW * scale,
    innerW: rodCount * ROD_PITCH * scale,
    scale,
    rodCount,
  };
};

/**
 * Centre X of a rod. Rod 0 is the ONES rod and it is the RIGHTMOST — the app numbers
 * place values outward from the ones column, so a rod index is a place value, not a
 * screen position. Getting this backwards is how a tooltip about the ones rod ended up
 * pointing at the middle of the abacus.
 */
export const rodX = (box: AbacusBox, rod: number): number => {
  const col = box.rodCount - 1 - rod;
  return box.innerLeft + (col + 0.5) * ROD_PITCH * box.scale;
};

/**
 * Centre Y of the upper (heaven) bead. It has exactly two resting places: parked at the
 * top of its section, or down against the beam where it counts as five.
 */
export const upperBeadY = (box: AbacusBox, down: boolean): number =>
  box.innerTop + (down ? HEAVEN_H - BEAD_H / 2 : BEAD_H / 2) * box.scale;

/**
 * Centre Y of a lower (earth) bead by SLOT, counting from the beam downward: slot 0.5 is
 * the first bead when it is raised against the beam, 1.5 is the first parked slot. Half
 * steps because a bead's centre sits half a bead-height into its slot.
 */
export const lowerBeadY = (box: AbacusBox, slot: number): number =>
  box.innerTop + (HEAVEN_H + BEAM_H + BEAD_H * slot) * box.scale;

/** Y of the beam's centre line. */
export const beamY = (box: AbacusBox): number =>
  box.innerTop + (HEAVEN_H + BEAM_H / 2) * box.scale;

/** A whole SECTION as a band: frame-top to beam, or beam to frame-bottom. */
export const sectionBand = (box: AbacusBox, which: "top" | "bottom"): Rect => {
  if (which === "top") {
    return { x: box.innerLeft, y: box.innerTop, w: box.innerW, h: HEAVEN_H * box.scale };
  }
  return {
    x: box.innerLeft,
    y: box.innerTop + (HEAVEN_H + BEAM_H) * box.scale,
    w: box.innerW,
    h: (ABACUS_INNER_H - HEAVEN_H - BEAM_H) * box.scale,
  };
};

/** One whole ROD as a vertical band, full inner height. */
export const rodBand = (box: AbacusBox, rod: number): Rect => {
  const col = box.rodCount - 1 - rod;
  return {
    x: box.innerLeft + col * ROD_PITCH * box.scale + 3,
    y: box.innerTop - 4,
    w: ROD_PITCH * box.scale - 6,
    h: ABACUS_INNER_H * box.scale + 8,
  };
};

/** A box around the rightmost `count` rods — the group a capacity line is about. */
export const groupBox = (box: AbacusBox, count: number): Rect => {
  const n = box.rodCount;
  const x0 = box.innerLeft + (n - count) * ROD_PITCH * box.scale - 6;
  const x1 = box.innerLeft + n * ROD_PITCH * box.scale + 6;
  const y0 = box.top + FRAME_LW * box.scale - 6;
  const y1 = box.top + (FRAME_LW + ABACUS_INNER_H) * box.scale + 6;
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
};

/**
 * Where a finger arrow starts, and how far it travels.
 *
 * Bounded to the bead's REAL travel and kept inside its own section, because an arrow
 * drawn from an arbitrary offset crossed the beam — which shows a move the abacus cannot
 * make. The upper bead's travel is its whole section minus its own height; a lower bead
 * moves exactly one slot.
 *
 * `fromValue` is what the rod reads BEFORE the move, and it decides WHICH bead the arrow
 * lands on. Without it the anchor was a fixed slot, so on 3 → 4 the arrow pointed at beads
 * that were already raised instead of the one still waiting to move. Bead b (0-indexed
 * from the beam) sits at centre slot b + 0.5 when raised and b + 1.5 when parked, so the
 * next bead to go up is the one parked at (fromValue % 5) + 1.5.
 *
 * A DOWN move keeps the topmost raised bead (slot 0.5): those gestures clear a whole group
 * with one sweep, and the sweep starts at the top of the group.
 */
export const handAnchor = (
  box: AbacusBox,
  heaven: boolean,
  direction: "up" | "down",
  fromValue = 0
): { y: number; len: number } => {
  const up = direction === "up";
  const len = (heaven ? HEAVEN_H - BEAD_H : BEAD_H) * box.scale;
  const y = heaven
    ? upperBeadY(box, up)
    : up
    ? lowerBeadY(box, (fromValue % 5) + 1.5)
    : lowerBeadY(box, 0.5);
  return { y, len };
};

// ---------------------------------------------------------------- overlap arithmetic
//
// EPISODE_RULES.md §4: no content may overlay any other content. Checked at render rather
// than by eye, because 53 frames per episode is exactly the volume where eyeballing fails.

export const intersects = (a: Rect, b: Rect, pad = 0): boolean =>
  a.x - pad < b.x + b.w &&
  b.x - pad < a.x + a.w &&
  a.y - pad < b.y + b.h &&
  b.y - pad < a.y + a.h;

export const contains = (r: Rect, p: Pt, pad = 0): boolean =>
  p.x >= r.x - pad && p.x <= r.x + r.w + pad && p.y >= r.y - pad && p.y <= r.y + r.h + pad;
