// E14's characters: TWO hedgehogs, rival arcade contestants — the direct successor to E10's foxes.
//
// Same shape as `Fox` (E10) and `Squirrel` (E13): one component rendered twice with `marking` and
// `facing` doing the differentiation, seven moods keyed to the mood name (never an oscillation —
// the same rule every mascot in this series follows). The one NEW mood this episode needs is
// `curl` — replacing `worry` — a hedgehog's own stuck reaction: it tucks in and its quills bristle,
// where a fox's ears drop and a squirrel's shoulders hunch. Everything else (`sit`, `wave`,
// `think`, `point`, `cheer`, `buzz`) carries over unchanged from `Fox`, including the buzzer gag
// this episode reuses from E10 (a recall game needs someone to ring in).

import React from "react";
import { interpolate } from "remotion";

export type HedgehogMood = "sit" | "wave" | "think" | "curl" | "point" | "cheer" | "buzz";

/** Two contestants, so a caller cannot accidentally give both the same colouring. */
export const MARKINGS = {
  amber: { body: "#C9873F", belly: "#FFF3E0", quill: "#5C3B1E", paw: "#5C3B1E" },
  slate: { body: "#8A7E8C", belly: "#F4EEF3", quill: "#3E2E42", paw: "#3E2E42" },
} as const;

export type MarkingName = keyof typeof MARKINGS;

const INK = "#3A2A1E";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline `FOX_BOX`/`SQUIRREL_BOX` used: `y` is the point
 *  the hedgehog stands on, `up` is how far a raised paw in `cheer` reaches above it. */
export const HEDGEHOG_BOX = { up: 190, down: 14, half: 88 };

export const Hedgehog: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: HedgehogMood;
  marking: MarkingName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right. A pair should face each other, or both face the game. */
  facing?: -1 | 1;
  /** de-synchronise the pair: the second hedgehog gets a different phase so they never move as one body */
  phase?: number;
}> = ({ x, y, scale, mood, marking, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = MARKINGS[marking];
  const F = facing;

  // ---------------------------------------------------------------- the mood, as numbers
  // `curl` bristles the quills outward and tucks the head down, in place of a fox's ear-drop.
  const bristle = mood === "curl" ? 1 : mood === "think" ? 0.2 : 0;
  const headTilt = mood === "think" ? -10 : mood === "curl" ? 14 : mood === "buzz" ? 6 : 0;
  const tuck = mood === "curl" ? 1 : 0;
  const eyeOpen = mood === "curl" ? 0.4 : mood === "cheer" ? 0.5 : mood === "buzz" ? 1.15 : 1;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 11 : Math.sin(t * 1.4) * 2;
  const quillTwitch = Math.sin(t * (mood === "cheer" ? 6 : 2.4)) * (mood === "cheer" ? 5 : 2.5);

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // The quill fan on the back — a crescent of triangles, bristling outward on `curl`.
  const QUILL_N = 9;
  const quills = Array.from({ length: QUILL_N }, (_, i) => {
    const a = -110 + (220 / (QUILL_N - 1)) * i; // degrees, fanning across the back
    const len = 30 + bristle * 16 + Math.sin(t * 3 + i) * 1.5;
    const rot = a + quillTwitch * (i % 2 === 0 ? 1 : -0.6);
    return (
      <g key={i} transform={`rotate(${rot})`}>
        <path
          d={`M -7 0 L 7 0 L 0 ${-len} Z`}
          fill={i % 2 === 0 ? M.quill : M.body}
        />
      </g>
    );
  });

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={6} rx={58} ry={12} fill="#000" opacity={0.15} />

      <g transform={`translate(0 ${-bounce + tuck * 10}) scale(${1 - tuck * 0.08})`}>
        {/* ---------------------------------------------------------------- the quill fan, behind the body */}
        <g transform={`translate(4 -70)`}>{quills}</g>

        {/* ---------------------------------------------------------------- feet */}
        <path d="M -14 8 l -4 11 M -14 8 l 6 11" stroke={M.paw} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M 14 8 l -6 11 M 14 8 l 4 11" stroke={M.paw} strokeWidth={7} strokeLinecap="round" fill="none" />

        {/* ---------------------------------------------------------------- body, round, with a cream belly */}
        <path d="M -40 -2 q -8 -46 18 -60 q 22 -12 44 0 q 26 14 18 60 q -40 6 -80 0 Z" fill={M.body} />
        <ellipse cx={0} cy={-18} rx={26} ry={30} fill={M.belly} opacity={0.9} />

        {/* ---------------------------------------------------------------- front paw / arm
             `cheer` raises both, `wave`/`point` raise one, `think` brings one to the chin,
             `buzz` slams one down and forward onto the buzzer — identical grammar to `Fox`. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const one = mood === "wave" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const slam = mood === "buzz" ? gest : 0;

          const R = {
            x: 16 + 26 * out + 18 * one + 50 * up + 28 * slam,
            y: -4 - 164 * up - 78 * one - 12 * out + 54 * slam,
            rot: -22 * one - 12 * out + 20 * up - 46 * slam,
          };
          const L = {
            x: -16 - 14 * chin - 48 * up,
            y: -4 - 34 * chin - 164 * up,
            rot: -20 * up,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 20;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={17} strokeLinecap="round" />;
          };
          const pawTip = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={14} ry={11} fill={M.paw} />
            </g>
          );

          return (
            <g>
              {arm(-20, -44, L)}
              {arm(20, -44, R)}
              {pawTip(L)}
              {pawTip(R)}
              {mood === "buzz" && (
                <g transform={`translate(${R.x + 6} ${R.y + 16})`} opacity={0.5 + slam * 0.5}>
                  <ellipse cx={0} cy={6} rx={22} ry={8} fill="#3A2A1E" opacity={0.4} />
                  <ellipse cx={0} cy={0} rx={20} ry={9} fill="#C6FF3D" />
                  <ellipse cx={0} cy={-2} rx={14} ry={6} fill="#E9FFA8" />
                </g>
              )}
            </g>
          );
        })()}

        {/* ---------------------------------------------------------------- head — rounder than a fox's,
             tucking down and forward on `curl` (the ball-up reaction). */}
        <g transform={`translate(${tuck * -4} ${-82 + tuck * 8}) rotate(${headTilt})`}>
          {/* small round ears, unlike a fox's triangular pair */}
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${side * 24} ${-26})`}>
              <circle r={9} fill={M.body} />
              <circle r={5} fill={M.belly} opacity={0.7} />
            </g>
          ))}

          {/* skull */}
          <circle cx={0} cy={0} r={36} fill={M.belly} />
          <path d="M -36 -6 q 6 -30 36 -32 q 30 2 36 32 q -36 8 -72 0 Z" fill={M.body} />

          {/* eyes */}
          {[-13, 13].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={0} r={9} fill={EYE_RING} />
              <ellipse cx={cx} cy={0} rx={5.8} ry={5.8 * eyeOpen} fill={INK} />
            </g>
          ))}

          {/* small pointed snout, dark wet nose */}
          <path d="M -10 10 q 10 5 20 0 q -1 13 -10 16 q -9 -3 -10 -16 Z" fill={M.belly} />
          <ellipse cx={0} cy={22} rx={6} ry={4.4} fill={INK} />
        </g>
      </g>
    </g>
  );
};
