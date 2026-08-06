// The arrow that says WHICH bead is about to move, and WHICH WAY.
//
// Until now this only existed as part of FingerHand, so it appeared on the seven lines with a
// hand and on none of the twelve where something else did the pushing. A child watching those
// twelve had no idea which bead was about to travel.
//
// Rules it follows, both learned on E02:
//   · it points at the bead that ACTUALLY moves, derived from (from -> value), never a fixed
//     slot;
//   · it is on screen BEFORE the move and fades as the bead lands, so the sequence reads
//     "here is the one that moves" then "there it goes", not both at once.

import React from "react";
import { interpolate } from "remotion";
import { BEAD_H, HEAVEN_H } from "../data/tokens";
import { lowerBeadY, rodX, upperBeadY, type AbacusBox } from "./geometry";
import { MoveArrow } from "../components/MoveArrow";

/** Which beads travel between two rod values, and in which direction. */
export const movingBeads = (
  from: number,
  to: number
): { heaven: boolean; lower: number[]; up: boolean } | null => {
  if (from === to) return null;
  const fUp = from % 5;
  const tUp = to % 5;
  const heaven = from >= 5 !== to >= 5;
  const lower: number[] = [];
  const lo = Math.min(fUp, tUp);
  const hi = Math.max(fUp, tUp);
  for (let b = lo; b < hi; b++) lower.push(b);
  // a lower bead rising, or the heaven bead coming down, both mean "adding"
  return { heaven, lower, up: tUp > fUp };
};

/** The shared glyph, placed at a frame-space point and drawn in the abacus's own scale so it
 *  matches the one FingerHand draws to the pixel. */
const Arrow: React.FC<{ x: number; y: number; s: number; len: number; up: boolean; opacity: number }> = ({
  x,
  y,
  s,
  len,
  up,
  opacity,
}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <MoveArrow dir={up ? -1 : 1} len={len} opacity={opacity} />
  </g>
);

export const BeadArrow: React.FC<{
  box: AbacusBox;
  rod: number;
  from: number;
  to: number;
  /** 0..1 bead travel — the arrow leads the move and fades as it completes */
  settle: number;
}> = ({ box, rod, from, to, settle }) => {
  const move = movingBeads(from, to);
  if (!move) return null;
  const s = box.scale;
  const x = rodX(box, rod);
  // full strength before the bead sets off, gone once it has arrived
  const opacity = interpolate(settle, [0, 0.55, 0.9], [1, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (opacity <= 0.01) return null;

  return (
    <>
      {move.heaven && (
        <Arrow
          x={x}
          // it starts where the bead starts: parked high when coming down, at the beam when
          // going back up
          y={upperBeadY(box, from >= 5)}
          s={s}
          // 0.8 of the real travel, the same fraction the lower beads use — the two used 0.72 and
          // 0.78, which is a difference nobody can justify and everybody can see
          len={(HEAVEN_H - BEAD_H) * 0.8}
          up={to < 5}
          opacity={opacity}
        />
      )}
      {move.lower.map((b) => (
        <Arrow
          key={b}
          x={x}
          y={lowerBeadY(box, move.up ? b + 1.5 : b + 0.5)}
          s={s}
          len={BEAD_H * 0.8}
          up={move.up}
          opacity={opacity}
        />
      ))}
    </>
  );
};
