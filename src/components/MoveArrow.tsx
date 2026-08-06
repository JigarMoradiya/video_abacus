// THE arrow. One drawing, used everywhere a bead is about to move.
//
// There were two: `FingerHand` drew its own shaft and head inline, and `stage/BeadArrow` drew a
// different one — so the arrow changed appearance depending on whether that line happened to have a
// hand on it. An instruction glyph has to be the same object every time it appears, or it stops
// being a glyph and becomes decoration.
//
// Unifying the COLOUR was not enough, and the reason is worth writing down: both arrows had a
// FIXED 34-unit head, and their shafts came from the travel they described. FingerHand's heaven-bead
// move is 61 units, so shaft 27 against head 34 — a dart. BeadArrow's was 48, so shaft 18 against
// head 34 — almost all head. Two arrows with identical parts and different proportions read as two
// different arrows, and both read as "the triangle is too big".
//
// So the head is PROPORTIONAL to the arrow's length, and so is the shaft's weight. Every arrow in
// the series is now the same shape at every size, which is what "one style" actually requires.
//
// Drawn in BEAD-LOCAL units, the same units as the abacus geometry at scale 1, so both callers can
// place it: FingerHand is already inside a `scale(scale)`, and BeadArrow wraps it in the abacus
// box's own scale. Same pixels on screen either way.
//
// Origin is the TAIL. `dir` is +1 for down, -1 for up. `len` is the whole arrow including the head:
// an arrow must never be longer than the travel it describes, or it points through the beam.

import React from "react";

const INK = "#0000EE";

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export const MoveArrow: React.FC<{
  dir: 1 | -1;
  /** total length, head included, in bead-local units */
  len: number;
  opacity?: number;
}> = ({ dir, len, opacity = 1 }) => {
  const total = Math.max(22, len);
  // A third of the arrow is head. Bounded so a very short arrow still has a visible point and a
  // very long one does not grow a spearhead.
  const head = clamp(total * 0.34, 12, 26);
  const halfW = head * 0.62;
  const stroke = clamp(total * 0.15, 6, 11);
  const shaftEnd = dir * (total - head);
  const tip = dir * total;
  return (
    <g opacity={opacity}>
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={shaftEnd}
        stroke={INK}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <polygon points={`${-halfW},${shaftEnd} ${halfW},${shaftEnd} 0,${tip}`} fill={INK} />
    </g>
  );
};
