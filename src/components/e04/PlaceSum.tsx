// What the rods are worth, read out in the SAME ORDER as the rods.
//
//    [ 20 ] + [ 3 ]  =  23
//     tens     ones
//
// E03's sum was a vertical column, because a column is how a child writes `1 + 2`. This episode is
// not arithmetic — it is READING — so the read-out has to be horizontal and left-to-right, mapping
// cell for cell onto the rods above it. A child should be able to run a finger from the tens rod
// down to the "20" cell without crossing anything.
//
// Cells appear one at a time (`shown`), because the narration names them one at a time: "two beads
// on the tens rod is two tens, which is twenty" — then, a line later, "that is three ones". A
// read-out that arrives complete has answered the question the next line was going to ask.
//
// It lives in the HEADLINE BAND. A wide, short element belongs in a wide, short space, exactly as
// E03's tall column belonged in a side gutter — and the band is free on every phrase that shows one,
// because no read-out line in this episode also carries a headline.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export interface Place {
  /** what this rod contributes — 200, 40, 7 */
  worth: number;
  /** the rod's name, as the narration says it */
  label: string;
  /** the app's place-value colour for this rod */
  color: string;
}

const CELL_H = 108;

export const PlaceSum: React.FC<{
  places: Place[];
  /** how many cells are visible, left to right */
  shown: number;
  /** the total, once the narration has said it */
  total?: number;
  ink: string;
  progress: number;
  scale: number;
}> = ({ places, shown, total, ink, progress, scale }) => {
  // Each cell eases in on the beat it is named. Measured from the phrase's own progress, so a cell
  // that was already there does not re-animate — the same law the sum card learned in E03.
  const pop = interpolate(progress, [0, 0.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const cell = (p: Place, i: number) => {
    const on = i < shown;
    const isNewest = i === shown - 1;
    const k = isNewest ? pop : 1;
    return (
      <div
        key={p.label}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          opacity: on ? k : 0.18,
          transform: `scale(${on ? 0.92 + k * 0.08 : 0.92})`,
        }}
      >
        <div
          style={{
            minWidth: 118,
            height: CELL_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: on ? p.color : "rgba(255,255,255,0.34)",
            borderRadius: 22,
            border: "4px solid rgba(255,255,255,0.7)",
            boxShadow: on ? "0 8px 0 rgba(0,0,0,0.22)" : "none",
            padding: "0 18px",
          }}
        >
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 62,
              lineHeight: 1,
              color: "#FFFFFF",
              textShadow: "2px 2px 0 rgba(0,0,0,0.22)",
            }}
          >
            {on ? p.worth : "?"}
          </span>
        </div>
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 1,
            color: ink,
            opacity: 0.75,
          }}
        >
          {p.label}
        </span>
      </div>
    );
  };

  const glyph = (t: string, on: boolean) => (
    <span
      style={{
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: 52,
        lineHeight: 1,
        color: ink,
        opacity: on ? 0.85 : 0.2,
        // the operators sit on the cells' centre line, not on the labels below them
        marginBottom: 34,
      }}
    >
      {t}
    </span>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      {places.map((p, i) => (
        <React.Fragment key={p.label}>
          {i > 0 && glyph("+", i < shown)}
          {cell(p, i)}
        </React.Fragment>
      ))}
      {glyph("=", total !== undefined)}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          marginBottom: 34,
        }}
      >
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 84,
            lineHeight: 1,
            color: ink,
            opacity: total === undefined ? 0.25 : 1,
            textShadow: total === undefined ? "none" : "3px 3px 0 rgba(255,255,255,0.5)",
          }}
        >
          {total === undefined ? "?" : total}
        </span>
      </div>
    </div>
  );
};

/** The read-out's natural box, so the caller and the overlap guard agree on its size. */
export const placeSumBox = (places: number, hasTotal: boolean) => ({
  w: places * 118 + (places - 1) * 66 + (hasTotal ? 150 : 90),
  h: CELL_H + 40,
});
