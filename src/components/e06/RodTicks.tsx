// Which rods are DONE — a two-line checklist beside the sum.
//
// This is the checkmark box from the first build, brought back on request and narrowed to the job it
// was actually good at: saying how much of the sum is left. It reads `tens ✓ / ones ☐`, and each row
// ticks as its rod finishes.
//
// IT DOES NOT APPEAR EVERYWHERE, which is the point. A one-rod sum (twenty-one plus three) has
// nothing to keep track of — one row that ticks once is a label, not a checklist — and the your-turn
// sum belongs to the child, so ticking it off for them answers the question. It shows on the two
// worked TWO-ROD sums, where "which rod have we done" is a real question the viewer is holding.
//
// The tick DRAWS across the beat that finishes the rod, on the same settle the beads travel on, so
// the mark and the move land together.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";
import { PLACE_COLORS } from "../../data/tokens";

export const TICKS_NAT = { w: 244, h: 150 };

const ROW_H = 58;
const LABEL = ["ones", "tens", "hundreds"];

export const RodTicks: React.FC<{
  /** rods in the order they are worked, e.g. [1, 0] for tens-then-ones */
  rods: number[];
  /** how many are finished at the start of this line */
  done: number;
  /** 0..1 for the row being finished on this line; 0 when nothing finishes here */
  doing?: number;
  scale?: number;
}> = ({ rods, done, doing = 0, scale = 1 }) => (
  <div
    style={{
      width: TICKS_NAT.w * scale,
      background: "rgba(255,255,255,0.97)",
      borderRadius: 22 * scale,
      padding: `${14 * scale}px ${16 * scale}px`,
      boxShadow: `0 ${6 * scale}px 0 rgba(62,36,16,0.2)`,
      fontFamily: KID_FONT,
    }}
  >
    {rods.map((rod, i) => {
      const isDone = i < done;
      const isDoing = i === done;
      const fill = isDoing ? doing : isDone ? 1 : 0;
      const colour = PLACE_COLORS[rod] ?? "#7E5128";
      return (
        <div
          key={rod}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12 * scale,
            height: ROW_H * scale,
            // waiting rows stay visible but dim: a checklist you cannot see the rest of is a label
            opacity: isDone || isDoing ? 1 : 0.42,
          }}
        >
          <div
            style={{
              width: 38 * scale,
              height: 38 * scale,
              borderRadius: 12 * scale,
              border: `${4 * scale}px solid ${colour}`,
              background: fill > 0.5 ? colour : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "0 0 auto",
            }}
          >
            <svg width={26 * scale} height={26 * scale} viewBox="0 0 30 30">
              <path
                d="M 7 16 L 13 22 L 24 8"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={34}
                strokeDashoffset={
                  34 *
                  (1 -
                    interpolate(fill, [0.5, 1], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }))
                }
              />
            </svg>
          </div>
          <span style={{ fontSize: 34 * scale, fontWeight: 700, color: colour }}>
            {LABEL[rod] ?? "rod"}
          </span>
        </div>
      );
    })}
  </div>
);
