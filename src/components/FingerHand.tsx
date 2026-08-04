// The finger-technique device. The one place a wrong frame teaches a habit the child
// must unlearn while the parent cannot detect the error.
//
// The rule, verbatim from the app's own tour (freeModeHighlightSteps 14-17):
//   Addition    · thumb        · move LOWER beads UPWARD
//   Addition    · index finger · move UPPER bead DOWNWARD
//   Subtraction · index finger · move LOWER beads DOWNWARD
//   Subtraction · thumb        · move UPPER bead UPWARD
// Nothing here may contradict that table.
//
// Drawn as a recognisable hand seen from the side, with the working digit extended and
// the other three curled. The earlier version used a plain rounded blob for the palm and
// one rectangle for the digit, which read as an orange lump — thumb and index looked
// identical apart from a text label.

import React from "react";
import { KID_FONT } from "../lib/fonts";

export type Digit = "thumb" | "index";

const SKIN = "#F6C39B";
const SHADE = "#E0A176";
const EDGE = "#B87A50";

export const FingerHand: React.FC<{
  digit: Digit;
  direction: "up" | "down";
  /** frame-space position of the bead being moved */
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
  /** How far the bead actually travels, in the same units as x/y. The arrow was a fixed
   *  84px regardless, so "pull the upper bead down" drew a line straight through the beam
   *  and into the lower section — a move no bead can make. */
  len: number;
}> = ({ digit, direction, x, y, opacity = 1, scale = 1, len }) => {
  const dir = direction === "up" ? -1 : 1;
  // the head has to fit inside the travel, and the whole thing must not exceed it
  const arrowLen = Math.max(18, len / scale - 34);
  const isThumb = digit === "thumb";

  return (
    <g opacity={opacity} transform={`translate(${x},${y}) scale(${scale})`}>
      {/* direction arrow on the bead */}
      <line
        x1={0}
        y1={0}
        x2={0}
        y2={dir * arrowLen}
        stroke="#0000EE"
        strokeWidth={13}
        strokeLinecap="round"
      />
      <polygon
        points={`${-24},${dir * arrowLen} ${24},${dir * arrowLen} 0,${dir * (arrowLen + 34)}`}
        fill="#0000EE"
      />

      {/* the hand, entering from the right of the ones rod */}
      <g transform={`translate(120,${dir * 26})`}>
        {isThumb ? (
          // THUMB: short, broad, hinged low off the side of the fist, pointing LEFT-UP.
          // A thumb reads as a thumb because of the web between it and the fist.
          <g>
            {/* fist */}
            <path
              d="M 92,-96 C 196,-96 244,-46 244,20 C 244,92 190,132 110,132 C 44,132 12,100 12,44 L 12,-38 C 12,-74 44,-96 92,-96 Z"
              fill={SKIN}
              stroke={EDGE}
              strokeWidth={5}
            />
            {/* curled fingers, as three soft ridges on the fist */}
            {[-40, 6, 52].map((oy, i) => (
              <path
                key={i}
                d={`M 236,${oy} C 196,${oy - 6} 150,${oy - 4} 128,${oy + 10}`}
                fill="none"
                stroke={SHADE}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.85}
              />
            ))}
            {/* the thumb itself: broad, two-segment, angled up and left */}
            <path
              d="M 30,26 C -22,10 -74,-24 -66,-56 C -58,-86 -6,-78 30,-56 C 54,-42 60,-6 44,22 Z"
              fill={SKIN}
              stroke={EDGE}
              strokeWidth={5}
            />
            {/* the web — the detail that makes it unmistakably a thumb */}
            <path
              d="M 34,26 C 20,6 20,-24 32,-52"
              fill="none"
              stroke={SHADE}
              strokeWidth={6}
              strokeLinecap="round"
            />
            {/* nail */}
            <ellipse cx={-44} cy={-52} rx={16} ry={11} fill="#FFF" opacity={0.5} transform="rotate(-24 -44 -52)" />
          </g>
        ) : (
          // INDEX FINGER: long, slim, three segments, pointing LEFT and clearly separate
          // from the fist. Length is what distinguishes it from the thumb at a glance.
          <g>
            {/* fist */}
            <path
              d="M 118,-70 C 214,-70 258,-26 258,32 C 258,96 208,132 136,132 C 76,132 48,102 48,52 L 48,-16 C 48,-48 76,-70 118,-70 Z"
              fill={SKIN}
              stroke={EDGE}
              strokeWidth={5}
            />
            {/* curled fingers on the fist */}
            {[10, 56, 100].map((oy, i) => (
              <path
                key={i}
                d={`M 250,${oy} C 210,${oy - 6} 164,${oy - 4} 142,${oy + 8}`}
                fill="none"
                stroke={SHADE}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={0.85}
              />
            ))}
            {/* thumb tucked over the fist, so the hand is complete */}
            <path
              d="M 96,-56 C 60,-70 30,-56 30,-26 C 30,-2 56,6 84,-4 Z"
              fill={SKIN}
              stroke={EDGE}
              strokeWidth={5}
            />
            {/* the extended index finger */}
            <path
              d="M 64,-34 C -8,-40 -80,-38 -80,-14 C -80,10 -8,14 64,8 Z"
              fill={SKIN}
              stroke={EDGE}
              strokeWidth={5}
            />
            {/* knuckle creases along it */}
            {[-14, 16].map((ox, i) => (
              <path
                key={i}
                d={`M ${ox},-34 C ${ox - 5},-22 ${ox - 5},-4 ${ox},8`}
                fill="none"
                stroke={SHADE}
                strokeWidth={5}
                strokeLinecap="round"
                opacity={0.8}
              />
            ))}
            <ellipse cx={-64} cy={-14} rx={12} ry={16} fill="#FFF" opacity={0.5} />
          </g>
        )}
      </g>

      {/* name it in words too — the app's tooltip does the same, and a parent copying the
          technique needs no ambiguity */}
      <g transform={`translate(214,${dir * 26 + (dir > 0 ? 186 : -150)})`}>
        <rect x={-108} y={-32} width={216} height={64} rx={32} fill="#D81B60" />
        <text
          x={0}
          y={12}
          textAnchor="middle"
          fill="#FFF"
          fontSize={34}
          fontWeight={700}
          fontFamily={KID_FONT}
        >
          {isThumb ? "thumb" : "index finger"}
        </text>
      </g>
    </g>
  );
};
