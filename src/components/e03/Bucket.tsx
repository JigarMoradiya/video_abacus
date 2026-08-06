// A seaside bucket that fills as the rod's total grows.
//
// It exists because addition has TWO numbers and one answer, and the rod alone only ever shows
// the answer. The bucket is a second reading of the same value — a child who loses track of
// which beads were the start and which were added can still see the total rise.
//
// It is not decoration: the pebble count always equals the rod's value, so it is checked by the
// same rule as everything else (value matches the words in every frame).

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

const PAIL = "#E4572E";
const PAIL_DARK = "#B23C17";
const PEBBLE = ["#5FBFC4", "#4AA9AE", "#7FD0D4"];

export const Bucket: React.FC<{
  /** how many pebbles are in it — always the rod's value */
  count: number;
  /** the value it is coming FROM, so pebbles drop in rather than appearing */
  from: number;
  /** 0..1 travel for this frame, shared with the beads */
  settle: number;
  x: number;
  y: number;
  scale: number;
  frame: number;
  fps: number;
}> = ({ count, from, settle, x, y, scale, frame, fps }) => {
  const t = frame / fps;
  const W = 150;
  const H = 130;
  // Pebbles stack five per row along the bottom, which is also how the rod is grouped. They
  // were rx 13 on a 25 px pitch — six of them read as a smudge rather than as six things, and
  // the whole point of the prop is that you can COUNT it. Wider pitch, bigger stones.
  const slot = (i: number) => ({
    px: -W / 2 + 27 + (i % 5) * 24,
    py: H - 30 - Math.floor(i / 5) * 32,
  });

  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      {/* pail */}
      <path
        d={`M ${-W / 2} 0 L ${W / 2} 0 L ${W / 2 - 16} ${H} L ${-W / 2 + 16} ${H} Z`}
        fill={PAIL}
        stroke={PAIL_DARK}
        strokeWidth={5}
        strokeLinejoin="round"
      />
      <rect x={-W / 2 - 4} y={-14} width={W + 8} height={20} rx={9} fill={PAIL_DARK} />
      {/* handle, swinging gently so the prop is never frozen */}
      <path
        d={`M ${-W / 2 + 10} -6 Q 0 ${-64 + Math.sin(t * 1.6) * 5} ${W / 2 - 10} -6`}
        fill="none"
        stroke={PAIL_DARK}
        strokeWidth={6}
        strokeLinecap="round"
      />

      {Array.from({ length: count }, (_, i) => {
        const { px, py } = slot(i);
        // pebbles arriving on THIS line drop in from above as the beads travel
        const arriving = i >= from;
        // from the RIM, not from far overhead: at -150 an arriving pebble spent most of the
        // line hovering outside the pail entirely, which reads as a bug rather than a drop
        const drop = arriving
          ? interpolate(settle, [0, 1], [-56, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 0;
        const fade = arriving
          ? interpolate(settle, [0, 0.45], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          : 1;
        const wob = Math.sin(t * 2.4 + i) * 1.4;
        return (
          <ellipse
            key={i}
            cx={px + wob}
            cy={py + drop}
            rx={16}
            ry={13}
            opacity={fade}
            fill={PEBBLE[i % PEBBLE.length]}
            stroke="#06666E"
            strokeWidth={2.5}
          />
        );
      })}

      {/* The label counts up WITH the pebbles. It read the final total while the arriving
          pebbles were still fading in, so the bucket said 3 while showing 1.

          On a white plate, in the PEBBLE colour rather than the pail's: dark red digits sitting
          just under a dark red pail read as part of the pail, and the one number the prop exists
          to state was the hardest thing on it to find. */}
      <g transform={`translate(0 ${H + 6})`}>
        <rect x={-44} y={0} width={88} height={54} rx={16} fill="#FFFFFF" opacity={0.95} />
        <rect x={-44} y={0} width={88} height={54} rx={16} fill="none" stroke="#06666E" strokeWidth={3} />
        <text
          x={0}
          y={42}
          textAnchor="middle"
          fontFamily={KID_FONT}
          fontWeight={700}
          fontSize={42}
          fill="#06666E"
        >
          {settle >= 0.45 ? count : from}
        </text>
      </g>
    </g>
  );
};
