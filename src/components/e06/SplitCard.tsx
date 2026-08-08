// A number pulled apart into the two pieces the narration names.
//
//        26  =  20  +  6
//         6  =   5  +  1
//        15  =  10  +  5
//
// This episode splits a number three times and, before this card existed, said all three out loud
// with nothing on screen but a running value chip. "Six is five and one" is the most important of
// them: it is the first time the series decomposes a DIGIT rather than a two-digit number, and every
// formula from E08 onwards is built on exactly that move. Saying it and not showing it wasted the one
// beat where a child could see it.
//
// The pieces arrive as they are spoken — "twenty-six is twenty" … "and six" — so the card is never
// ahead of the voice. The second piece sits dimmed until its own line, rather than being absent, so
// the shape of the sentence is visible from the start.
//
// BEAD GLYPHS, for the digit split only. Five and one are not just numbers here, they are a
// particular bead each: the heaven bead and one earth bead. Drawing them makes the arithmetic a
// statement about the instrument instead of a statement about numbers.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export const SPLIT_NAT = { w: 700, h: 152 };

const CELL_W = 132;
const CELL_H = 104;

/**
 * A bead ON A ROD, above or below the beam.
 *
 * Not a bare bead: in this rig the heaven and earth beads are the same colour, so two loose hexagons
 * said "five is a bead and one is a bead" — true and useless. What makes a bead worth five is WHERE
 * IT SITS, so the glyph carries a beam line and puts the bead on the correct side of it.
 */
const BeadOnRod: React.FC<{
  heaven: boolean;
  fill: string;
  stroke: string;
  rod: string;
  beam: string;
  size: number;
}> = ({ heaven, fill, stroke, rod, beam, size }) => {
  const w = size;
  const h = size * 0.92;
  return (
    <svg width={w} height={h} viewBox="0 0 110 100" style={{ display: "block" }}>
      {/* the rod */}
      <rect x={52} y={4} width={6} height={92} rx={3} fill={rod} />
      {/* the bead, above the beam for five and below it for one */}
      <g transform={`translate(0 ${heaven ? 6 : 52})`}>
        <path
          d="M 26 2 L 84 2 L 108 21 L 84 40 L 26 40 L 2 21 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={5}
        />
      </g>
      {/* the beam, last so it reads as in front */}
      <rect x={0} y={46} width={110} height={8} rx={2} fill={beam} />
    </svg>
  );
};

export const SplitCard: React.FC<{
  whole: string;
  parts: [string, string];
  /** 1 = only the first piece is named yet, 2 = both */
  shown: number;
  /** colour per piece */
  colours: [string, string];
  /** draw a heaven bead beside the first piece and an earth bead beside the second */
  beads?: { heaven: [string, string]; earth: [string, string]; rod: string; beam: string };
  accent: string;
  progress: number;
  scale?: number;
}> = ({ whole, parts, shown, colours, beads, accent, progress, scale = 1 }) => {
  // the piece named on THIS line fades up across its first third; earlier pieces are already there
  const arrive = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const piece = (text: string, i: number) => {
    const on = i < shown - 1 ? 1 : i === shown - 1 ? arrive : 0;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6 * scale,
          opacity: 0.25 + 0.75 * on,
          transform: `translateY(${(1 - on) * 10 * scale}px)`,
        }}
      >
        <div
          style={{
            minWidth: CELL_W * scale,
            height: CELL_H * scale,
            borderRadius: 22 * scale,
            background: colours[i],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 62 * scale,
            color: "#FFFFFF",
            boxShadow: `0 ${5 * scale}px 0 rgba(0,0,0,0.18)`,
          }}
        >
          {text}
        </div>
        {beads && (
          <BeadOnRod
            heaven={i === 0}
            size={70 * scale}
            fill={i === 0 ? beads.heaven[0] : beads.earth[0]}
            stroke={i === 0 ? beads.heaven[1] : beads.earth[1]}
            rod={beads.rod}
            beam={beads.beam}
          />
        )}
      </div>
    );
  };

  const sign = (t: string) => (
    <span
      style={{
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: 56 * scale,
        color: accent,
        padding: `0 ${10 * scale}px`,
        alignSelf: "flex-start",
        marginTop: 18 * scale,
      }}
    >
      {t}
    </span>
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        background: "rgba(255,255,255,0.97)",
        borderRadius: 34 * scale,
        padding: `${18 * scale}px ${26 * scale}px`,
        boxShadow: `0 ${9 * scale}px 0 rgba(62,36,16,0.2)`,
      }}
    >
      <div
        style={{
          minWidth: CELL_W * scale,
          height: CELL_H * scale,
          borderRadius: 22 * scale,
          background: accent,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: 62 * scale,
          color: "#FFFFFF",
          boxShadow: `0 ${5 * scale}px 0 rgba(0,0,0,0.18)`,
        }}
      >
        {whole}
      </div>
      {sign("=")}
      {piece(parts[0], 0)}
      {sign("+")}
      {piece(parts[1], 1)}
    </div>
  );
};
