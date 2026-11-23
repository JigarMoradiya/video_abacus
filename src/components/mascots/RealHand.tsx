// A REAL-LOOKING HAND — built fresh for this reel, not the flat-cartoon FingerHand.tsx the
// numbered episodes use. Same locked rule underneath (thumb moves things UP, index finger
// moves things DOWN, regardless of which bead — docs/EPISODE_RULES.md's hard lock).
//
// Style matches the reference the user supplied: flat cream skin, one coral shading stripe,
// bold dark outline, a smooth curled fist with one extended digit. A knuckle-bump silhouette
// was tried and made the fist read as scratched-on hair rather than fingers — reverted to the
// smooth fist. The thumb is the one digit that needs a visible joint bend to read as a thumb
// rather than a stub; it's built as two thick, gently-bent segments instead of one capsule.

import React from "react";
import { MoveArrow } from "../MoveArrow";
import { KID_FONT } from "../../lib/fonts";

export type Digit = "thumb" | "index";

export const HAND_DIGIT_TIP: Record<Digit, { dx: number; dy: number }> = {
  thumb: { dx: 90, dy: -133 },
  index: { dx: 5, dy: -163 },
};

const SKIN = "#F6DFB8";
const SHADE = "#EE9E71";
const OUTLINE = "#2A160B";
const NAIL = "#FBEEDC";

/** One straight capsule digit (used for the index) with knuckle creases and a nail. */
const Digit_: React.FC<{
  attachX: number;
  attachY: number;
  angleDeg: number;
  width: number;
  digitLen: number;
  creaseAt: number[];
}> = ({ attachX, attachY, angleDeg, width, digitLen, creaseAt }) => {
  const r = width / 2;
  return (
    <g transform={`translate(${attachX},${attachY}) rotate(${angleDeg})`}>
      <rect x={-r} y={-digitLen} width={width} height={digitLen} rx={r} fill={SKIN} stroke={OUTLINE} strokeWidth={7} />
      <path
        d={`M ${r * 0.15},${-digitLen + r} C ${r * 0.5},${-digitLen * 0.6} ${r * 0.5},${-r * 1.6} ${r * 0.15},${-r * 0.4} Z`}
        fill={SHADE}
        opacity={0.75}
      />
      {creaseAt.map((cy, i) => (
        <path
          key={i}
          d={`M ${-r * 0.75},${cy} Q 0,${cy + r * 0.35} ${r * 0.75},${cy}`}
          fill="none"
          stroke={OUTLINE}
          strokeWidth={3.5}
          strokeLinecap="round"
          opacity={0.55}
        />
      ))}
      <ellipse cx={0} cy={-digitLen + r * 0.9} rx={r * 0.62} ry={r * 0.82} fill={NAIL} stroke={OUTLINE} strokeWidth={2.5} />
    </g>
  );
};

/** The thumb: two THICK segments with a gentle joint bend — a real thumb is short and
 *  stout, not a thin bent stick. The distal segment barely narrows from the proximal one
 *  and the bend between them is shallow, so it stays visually continuous. */
const Thumb: React.FC<{ attachX: number; attachY: number; angleDeg: number }> = ({ attachX, attachY, angleDeg }) => (
  <g transform={`translate(${attachX},${attachY}) rotate(${angleDeg})`}>
    <rect x={-31} y={-52} width={62} height={56} rx={28} fill={SKIN} stroke={OUTLINE} strokeWidth={7} />
    <path d="M -20,-46 C -8,-40 8,-40 20,-46" fill="none" stroke={OUTLINE} strokeWidth={3.5} strokeLinecap="round" opacity={0.45} />
    <g transform="translate(0,-48) rotate(-16)">
      <rect x={-26} y={-70} width={52} height={72} rx={26} fill={SKIN} stroke={OUTLINE} strokeWidth={7} />
      <path d="M 4,-62 C 12,-46 12,-28 4,-14" fill={SHADE} opacity={0.7} stroke="none" />
      <ellipse cx={0} cy={-56} rx={16} ry={20} fill={NAIL} stroke={OUTLINE} strokeWidth={2.5} />
    </g>
  </g>
);

const FIST_PATH =
  "M 55,-55 C 130,-95 235,-55 255,25 C 268,95 205,145 115,135 C 45,127 15,85 15,20 C 15,-22 25,-38 55,-55 Z";

export const RealHand: React.FC<{
  digit: Digit;
  direction: "up" | "down";
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
  len?: number;
  showArrow?: boolean;
  showLabel?: boolean;
}> = ({ digit, direction, x, y, opacity = 1, scale = 1, len = 60, showArrow = true, showLabel = true }) => {
  const dir: 1 | -1 = direction === "up" ? -1 : 1;
  const arrowLen = len / scale;
  const isThumb = digit === "thumb";

  return (
    <g opacity={opacity} transform={`translate(${x},${y}) scale(${scale})`}>
      {showArrow && <MoveArrow dir={dir} len={arrowLen} />}

      <g transform={`translate(126,${dir * 24})`}>
        <path d={FIST_PATH} fill={SKIN} stroke={OUTLINE} strokeWidth={7} />
        <path d={FIST_PATH} fill={SHADE} opacity={0.28} />
        {[-25, 20, 68].map((oy, i) => (
          <path
            key={i}
            d={`M 235,${oy} C 200,${oy - 12} 155,${oy - 10} 130,${oy + 6}`}
            fill="none"
            stroke={OUTLINE}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.45}
          />
        ))}

        {isThumb ? (
          <>
            <Thumb attachX={44} attachY={-24} angleDeg={-34} />
            <path d="M 40,10 C 24,2 16,-14 22,-32" fill="none" stroke={OUTLINE} strokeWidth={5} strokeLinecap="round" opacity={0.4} />
          </>
        ) : (
          <>
            <Digit_ attachX={60} attachY={-45} angleDeg={-52} width={52} digitLen={228} creaseAt={[-92, -160]} />
            {/* the tucked thumb, curled against the palm — visible but not extended */}
            <path
              d="M 68,8 C 58,-18 84,-38 116,-27 C 137,-19 136,10 115,21 C 99,29 76,25 68,8 Z"
              fill={SKIN}
              stroke={OUTLINE}
              strokeWidth={6}
            />
            <path d="M 82,-6 C 92,-14 104,-14 112,-6" fill="none" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
          </>
        )}
      </g>

      {/* pushed further out from the digit than before — it was sitting right up against the
          fingertip/thumb-tip with almost no breathing room between the label and the hand. */}
      {showLabel && (
        <g transform={`translate(${isThumb ? 300 : 320},${dir * 24 - (isThumb ? 150 : 190)})`}>
          <rect x={-112} y={-32} width={224} height={64} rx={32} fill="#D81B60" />
          <text x={0} y={12} textAnchor="middle" fill="#FFF" fontSize={32} fontWeight={700} fontFamily={KID_FONT}>
            {isThumb ? "thumb" : "index finger"}
          </text>
        </g>
      )}
    </g>
  );
};
