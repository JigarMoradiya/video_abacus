// E03's signature character: the plus sign, as a small round person.
//
// Deliberately NOT another animal. E02's ladybird is the most memorable thing in it, and a
// second bug in a row is exactly how a series starts feeling like one episode reskinned
// (EPISODE_RULES §2). A `+` also carries the lesson in its own shape: the child sees the
// symbol for adding doing the adding.
//
// Four states, and the last one is the episode's gag:
//   idle   — bobbing, watching
//   push   — leaning into the rod, arms out, shoving a bead up
//   cheer  — both arms up after a right answer
//   bounce — shoves, meets no room, and rebounds backwards with a spin
//
// `bounce` is the whole reason this character exists: the closing beat has to show that four
// lower beads are not enough for one plus four WITHOUT teaching the complement, and a body
// hitting a wall says it in a way no card can.

import React from "react";
import { interpolate } from "remotion";

export type PlusMood = "idle" | "push" | "cheer" | "bounce";

const BODY = "#E0562B";
const BODY_DARK = "#B23C17";
const FACE = "#3A1B0C";

export const PlusGuy: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: PlusMood;
  /** 0..1 across the current line — drives the push and the rebound */
  progress: number;
  frame: number;
  fps: number;
}> = ({ x, y, scale, mood, progress, frame, fps }) => {
  const t = frame / fps;
  const r = 46; // arm half-length in local units

  // A push is a lean toward the rod and back; a bounce is the same lean, then thrown away
  // from it. Both read from `progress` so they land with the line rather than looping.
  const lean =
    mood === "push"
      ? interpolate(progress, [0, 0.35, 0.55, 1], [0, -26, -30, -22], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : mood === "bounce"
      ? interpolate(progress, [0, 0.3, 0.42, 0.62, 1], [0, -24, -18, 78, 62], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  const spin =
    mood === "bounce"
      ? interpolate(progress, [0.38, 0.62], [0, -220], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : mood === "cheer"
      ? Math.sin(t * 7) * 9
      : Math.sin(t * 1.8) * 3;

  const hop =
    mood === "cheer"
      ? Math.abs(Math.sin(t * 5)) * 14
      : mood === "push"
      ? 0
      : Math.sin(t * 2.2) * 4;

  const cx = x + lean;
  const cy = y - hop;
  const armsUp = mood === "cheer";
  // eyes squeeze shut on the impact, which is what sells the rebound
  const squint = mood === "bounce" && progress > 0.34 && progress < 0.62;

  return (
    <g transform={`translate(${cx},${cy}) rotate(${spin}) scale(${scale})`}>
      {/* the plus body: two rounded bars */}
      <rect x={-r} y={-15} width={r * 2} height={30} rx={13} fill={BODY_DARK} />
      <rect x={-15} y={-r} width={30} height={r * 2} rx={13} fill={BODY_DARK} />
      <rect x={-r} y={-18} width={r * 2} height={30} rx={13} fill={BODY} />
      <rect x={-15} y={-r - 3} width={30} height={r * 2} rx={13} fill={BODY} />

      {/* face on the middle square */}
      {squint ? (
        <>
          <path d="M -13 -7 L -3 -1" stroke={FACE} strokeWidth={4} strokeLinecap="round" />
          <path d="M 13 -7 L 3 -1" stroke={FACE} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={-8} cy={-4} r={4.2} fill={FACE} />
          <circle cx={8} cy={-4} r={4.2} fill={FACE} />
        </>
      )}
      <path
        d={
          mood === "bounce" && squint
            ? "M -8 9 Q 0 3 8 9" // an "oof" — mouth turned down
            : "M -8 6 Q 0 14 8 6"
        }
        stroke={FACE}
        strokeWidth={3.6}
        fill="none"
        strokeLinecap="round"
      />

      {/* Arms ONLY when cheering. Drawn all the time they turned a plus sign into a crab —
          the character already has four limbs of its own, which is the point of it being a
          plus. */}
      {armsUp &&
        [-1, 1].map((side) => (
          <path
            key={side}
            d={`M ${side * 40} -6 Q ${side * 66} -36 ${side * 60} -62`}
            stroke={BODY_DARK}
            strokeWidth={10}
            strokeLinecap="round"
            fill="none"
          />
        ))}

      {/* impact star, only on the frames the bounce actually happens */}
      {mood === "bounce" && progress > 0.3 && progress < 0.52 && (
        <g transform={`translate(${-r - 26} 0)`} opacity={0.95}>
          {Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x={-3}
              y={-26}
              width={6}
              height={16}
              rx={3}
              fill="#FFD166"
              transform={`rotate(${i * 60})`}
            />
          ))}
        </g>
      )}
    </g>
  );
};
