// "Each lower bead is worth ten." — a sentence that needs a picture, not a phrase.
//
// This draws the actual bead in question, an equals sign, and what it is worth. The
// earlier label printed "1 -> 10   5 -> 50", which named neither bead and read as
// nonsense. Showing the bead removes the ambiguity entirely: the child sees WHICH bead
// and WHAT it counts, and the shape matches the bead the arrow is pointing at.

import React from "react";
import { BEAD, BEAD_HEX } from "../data/theme";
import { KID_FONT } from "../lib/fonts";

const hex = (w: number, h: number): string => {
  const s = w * BEAD_HEX.shoulder;
  return `M 0 ${h / 2} L ${s} 0 L ${w - s} 0 L ${w} ${h / 2} L ${w - s} ${h} L ${s} ${h} Z`;
};

export const BeadWorth: React.FC<{
  which: "upper" | "lower";
  worth: number;
  /** 0-1 pop-in */
  progress: number;
}> = ({ which, worth, progress }) => {
  const bw = 132;
  const bh = bw / 1.8;
  const pop = Math.min(1, progress * 3);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 22,
        background: "rgba(255,255,255,0.96)",
        borderRadius: 40,
        padding: "22px 34px",
        boxShadow: "0 9px 0 rgba(0,0,0,0.22)",
        transform: `scale(${0.86 + pop * 0.14})`,
      }}
    >
      {/* the bead itself, in its on-colour, with a mini beam showing which half it
          lives in — so "upper" and "lower" are shown, not just written */}
      <svg width={bw + 16} height={bh * 2 + 22} viewBox={`0 0 ${bw + 16} ${bh * 2 + 22}`}>
        <defs>
          <linearGradient id="bwOn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BEAD.onTop} />
            <stop offset="100%" stopColor={BEAD.onBottom} />
          </linearGradient>
        </defs>
        {/* rod */}
        <rect x={(bw + 16) / 2 - 5} y={0} width={10} height={bh * 2 + 22} rx={5} fill="#C0A184" />
        {/* beam */}
        <rect x={0} y={bh + 6} width={bw + 16} height={10} rx={5} fill="#5A3520" />
        {/* the bead, seated against the beam on the correct side */}
        <g transform={`translate(8,${which === "upper" ? 6 : bh + 22})`}>
          <path d={hex(bw, bh)} fill="url(#bwOn)" stroke={BEAD.onEdge} strokeWidth={3} strokeLinejoin="round" />
          <path
            d={`M ${bw * BEAD_HEX.shoulder} 3 L ${bw * (1 - BEAD_HEX.shoulder)} 3 L ${
              bw * (1 - BEAD_HEX.shoulder) - 12
            } ${bh * 0.34} L ${bw * BEAD_HEX.shoulder + 12} ${bh * 0.34} Z`}
            fill="#FFF"
            opacity={0.32}
          />
        </g>
      </svg>

      <span
        style={{
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: 62,
          color: "#3B2410",
          lineHeight: 1,
        }}
      >
        =
      </span>
      <span
        style={{
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: worth >= 100 ? 82 : 96,
          color: BEAD.onBottom,
          lineHeight: 1,
        }}
      >
        {worth}
      </span>
    </div>
  );
};

/**
 * The answer, broken down.
 *
 * No multiplication: the line is "one upper bead and two lower beads", and a child learning
 * to READ an abacus has not met times tables. "1 x 5 = 5" restated the reveal in a harder
 * notation than the reveal itself. It is addition, so it reads as addition.
 *
 * Fixed width, because the card was sized from an empty label string and every row wrapped.
 */
export const SumBreakdown: React.FC<{
  upper: number;
  lower: number;
  progress: number;
}> = ({ upper, lower, progress }) => {
  const total = upper * 5 + lower;
  const pop = Math.min(1, progress * 3);
  const totalIn = progress > 0.45;
  const bw = 62;
  const bh = bw / 1.8;

  const Row: React.FC<{ n: number; word: string; worth: number; gid: string }> = ({ n, word, worth, gid }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 16, whiteSpace: "nowrap" }}>
      <svg width={bw + 6} height={bh + 6} style={{ flex: "0 0 auto" }}>
        <defs>
          {/* id must be a bare token: `sb${word}` contained a space, so the fill silently
              fell back to black */}
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BEAD.onTop} />
            <stop offset="100%" stopColor={BEAD.onBottom} />
          </linearGradient>
        </defs>
        <g transform="translate(3,3)">
          <path
            d={hex(bw, bh)}
            fill={`url(#${gid})`}
            stroke={BEAD.onEdge}
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <span
        style={{
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: 36,
          color: "#3B2410",
          flex: 1,
        }}
      >
        {n} {word}
      </span>
      <span
        style={{
          fontFamily: KID_FONT,
          fontWeight: 700,
          fontSize: 40,
          color: BEAD.onBottom,
        }}
      >
        = {worth}
      </span>
    </div>
  );

  return (
    <div
      style={{
        width: 520,
        background: "rgba(255,255,255,0.97)",
        borderRadius: 40,
        padding: "26px 32px",
        boxShadow: "0 12px 0 rgba(0,0,0,0.22)",
        transform: `scale(${0.9 + pop * 0.1})`,
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Row n={upper} word={upper === 1 ? "upper bead" : "upper beads"} worth={upper * 5} gid="sbUpper" />
        <Row n={lower} word={lower === 1 ? "lower bead" : "lower beads"} worth={lower} gid="sbLower" />
        <div style={{ height: 4, background: "#E8C9A0", borderRadius: 2 }} />
        <div
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 54,
            color: totalIn ? BEAD.onBottom : "#C9D3DA",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          {upper * 5} + {lower} = {totalIn ? total : "?"}
        </div>
      </div>
    </div>
  );
};
