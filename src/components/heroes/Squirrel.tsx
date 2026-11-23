// PLACE VALUE's cast: TWO squirrels — a FOURTEENTH distinct character pair for the Math Game
// Zone series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle
// den, Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint
// workshop, Raccoon/puzzle study, Frog/lily pond, Turtle/mosaic plaza all came before this
// one). Squirrels were picked on purpose: they're the cultural shorthand for "gathering and
// stashing things in their own proper spot" — an acorn goes in ITS hole, not any hole — which
// is exactly what place value teaches: a digit goes in ITS place, tens or ones, not anywhere.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, tail curled up behind. The default.
//   point  — one paw out, presenting an acorn.
//   think  — head tilted, one paw to the chin.
//   worry  — ears back, ta il drooping. The stuck beat.
//   cheer  — both paws up, bouncing, tail flicking. Correct-guess payoff only.
//   stash  — the signature gag: both paws tuck an acorn down into a tree-hollow below —
//            a real reach-down-and-place motion driven by `progress`, not a static prop.

import React from "react";
import { interpolate } from "remotion";

export type SquirrelMood = "sit" | "point" | "think" | "worry" | "cheer" | "stash";

export const SQUIRREL_COLORS = {
  rust: { body: "#C9702F", belly: "#FBE3C4", tail: "#A8501F", ear: "#8A3E18" },
  ash: { body: "#8C7A6B", belly: "#F2E6D8", tail: "#6B5B4E", ear: "#544636" },
} as const;

export type SquirrelName = keyof typeof SQUIRREL_COLORS;

const INK = "#3A2415";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const SQUIRREL_BOX = { up: 214, down: 20, half: 96 };

export const Squirrel: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: SquirrelMood;
  name: SquirrelName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = SQUIRREL_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const tailFlick = Math.sin(t * (mood === "cheer" ? 5 : 1.6)) * (mood === "cheer" ? 14 : 6);

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // one real "stash": lean down (0-0.35), tuck the acorn into the hollow (0.35-0.7), settle
  // back up (0.7-1) — a single deliberate placement, not a repeating loop.
  const leanDown = mood === "stash" ? interpolate(progress, [0, 0.35, 0.7, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const tuckIn = mood === "stash" ? interpolate(progress, [0.35, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={10} rx={62} ry={14} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce + leanDown * 20})`}>
        {/* the big plume tail, arcing up behind — squirrels' own cultural signature */}
        <g transform={`translate(-42 -18) rotate(${-18 + tailFlick - leanDown * 10})`}>
          <path d="M 0 0 Q -18 -60 10 -92 Q 40 -110 46 -78 Q 50 -50 26 -30 Q 40 -10 18 6 Q 2 14 0 0 Z" fill={M.tail} />
          <path d="M -6 -30 Q -8 -56 8 -76" stroke={M.body} strokeWidth={4} opacity={0.35} fill="none" />
        </g>

        {/* legs / feet */}
        <path d="M -18 30 q -4 14 0 22 M 18 30 q 4 14 0 22" stroke={M.tail} strokeWidth={13} strokeLinecap="round" fill="none" />

        {/* body */}
        <path d="M -40 6 q -6 -46 20 -62 q 20 -12 40 0 q 26 16 20 62 q -40 10 -80 0 Z" fill={M.body} />
        <path d="M 0 -50 q 18 4 22 38 q -10 22 -22 22 q -12 0 -22 -22 q 4 -34 22 -38 Z" fill={M.belly} opacity={0.92} />

        {/* arms/paws
             `cheer` raises both, `point` extends one, `think` brings one to chin,
             `stash` reaches down together holding the acorn. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const down = tuckIn;

          const R = { x: 16 + 24 * out + 42 * up - 6 * down, y: -2 - 140 * up - 8 * out + 60 * down, rot: -14 * out + 20 * up };
          const L = { x: -16 - 14 * chin - 40 * up + 6 * down, y: -2 - 30 * chin - 140 * up + 60 * down, rot: -20 * up };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 16;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={14} strokeLinecap="round" />;
          };
          const paw = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={11} ry={10} fill={M.tail} />
            </g>
          );

          return (
            <g>
              {arm(-18, -38, L)}
              {arm(18, -38, R)}
              {paw(L)}
              {paw(R)}
              {/* the acorn, carried between the paws while stashing */}
              {mood === "stash" && (
                <g transform={`translate(0 ${R.y + 4}) scale(${1 - down * 0.3})`} opacity={1 - down}>
                  <ellipse cx={0} cy={4} rx={11} ry={13} fill="#B8722E" />
                  <path d="M -11 -2 Q 0 -14 11 -2 Q 0 -6 -11 -2 Z" fill="#7A4A1E" />
                </g>
              )}
            </g>
          );
        })()}

        {/* head */}
        <g transform={`translate(0 -78) rotate(${headTilt})`}>
          {/* big rounded ears */}
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${side * 28} -28)`}>
              <circle cx={0} cy={0} r={13} fill={M.ear} />
              <circle cx={0} cy={0} r={7} fill={M.belly} opacity={0.6} />
            </g>
          ))}
          <ellipse cx={0} cy={0} rx={38} ry={34} fill={M.body} />
          {/* eyes */}
          {[-13, 13].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={9} fill={EYE_RING} />
              <circle cx={cx} cy={-2} r={5.5} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -24 -18 q 8 -6 15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 24 -18 q -8 -6 -15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}
          {/* muzzle + nose + whisker-ish mouth */}
          <ellipse cx={0} cy={16} rx={16} ry={13} fill={M.belly} opacity={0.85} />
          <circle cx={0} cy={10} r={4} fill={INK} />
          <path d="M -8 20 q 8 8 16 0" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};
