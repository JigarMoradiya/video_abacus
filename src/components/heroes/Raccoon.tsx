// SUDOKU's cast: TWO raccoons — an ELEVENTH distinct character pair for the Math Game Zone
// series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle den,
// Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint workshop
// all came before this one). Raccoons were picked on purpose: cleverness and puzzle-cracking
// are their whole cultural shorthand, and Sudoku is the "Brain Puzzles" section's own logic
// game.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting. The default.
//   point  — one paw out, presenting a cell.
//   think  — head tilted, one paw to the chin. This species' signature pose.
//   worry  — ears back, eyes wide. The stuck beat.
//   cheer  — both paws up, bouncing. Correct-guess payoff only.
//   spot   — the signature gag: one paw shading the eyes, leaning forward scanning the grid,
//            like tracing a row with a fingertip. Not a static prop — a small side-to-side
//            scan sway keeps it visibly alive.

import React from "react";
import { interpolate } from "remotion";

export type RaccoonMood = "sit" | "point" | "think" | "worry" | "cheer" | "spot";

export const RACCOON_COLORS = {
  charcoal: { body: "#5B5B63", belly: "#F2F0EC", mask: "#2E2E33", ring: "#3C3C42" },
  fawn: { body: "#8C7B6B", belly: "#F5EEE2", mask: "#3A3128", ring: "#4A3F34" },
} as const;

export type RaccoonName = keyof typeof RACCOON_COLORS;

const INK = "#2A2A2E";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const RACCOON_BOX = { up: 200, down: 16, half: 92 };

export const Raccoon: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: RaccoonMood;
  name: RaccoonName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = RACCOON_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : mood === "spot" ? 10 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const tailSway = Math.sin(t * (mood === "cheer" ? 5 : 1.8)) * (mood === "cheer" ? 14 : 8);
  const scanSway = mood === "spot" ? Math.sin(t * 1.6) * 8 : 0;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const spotGest = mood === "spot" ? interpolate(progress, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x + scanSway} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={8} rx={64} ry={14} fill="#000" opacity={0.17} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* ringed tail, behind the body */}
        <g transform={`translate(-40 -2) rotate(${14 + tailSway})`}>
          <path d="M 0 0 q -34 -10 -40 -40 q -12 26 6 48 q 18 20 44 10 q -8 -10 -10 -18 Z" fill={M.body} />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={-14 - i * 9} cy={-16 - i * 6} rx={7} ry={11} fill={M.ring} opacity={0.85} transform={`rotate(${-30 - i * 8})`} />
          ))}
        </g>

        {/* feet */}
        <path d="M -16 8 l -5 13 M -16 8 l 5 13" stroke={M.mask} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M 16 8 l -5 13 M 16 8 l 5 13" stroke={M.mask} strokeWidth={7} strokeLinecap="round" fill="none" />

        {/* body */}
        <path d="M -46 -6 q -6 -50 22 -68 q 24 -14 48 0 q 28 18 22 68 q -46 10 -92 0 Z" fill={M.body} />
        <path d="M 0 -62 q 20 4 24 42 q -12 26 -24 26 q -12 0 -24 -26 q 4 -38 24 -42 Z" fill={M.belly} opacity={0.9} />

        {/* paws / arms
             `cheer` raises both, `point` extends one, `think` brings one to the chin,
             `spot` shades the eyes with one paw, leaning forward. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const shade = spotGest;

          const R = {
            x: 20 + 30 * out + 54 * up - 6 * shade,
            y: -6 - 172 * up - 12 * out - 106 * shade,
            rot: -16 * out + 22 * up - 20 * shade,
          };
          const L = {
            x: -20 - 16 * chin - 52 * up,
            y: -6 - 38 * chin - 172 * up,
            rot: -22 * up,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 20;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={18} strokeLinecap="round" />;
          };
          const paw = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={14} ry={12} fill={M.mask} opacity={0.9} />
            </g>
          );

          return (
            <g>
              {arm(-24, -50, L)}
              {arm(24, -50, R)}
              {paw(L)}
              {paw(R)}
            </g>
          );
        })()}

        {/* head */}
        <g transform={`translate(0 -92) rotate(${headTilt})`}>
          {/* ears */}
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${side * 28} ${-30})`}>
              <circle cx={0} cy={0} r={15} fill={M.body} />
              <circle cx={0} cy={1} r={8} fill={M.mask} opacity={0.7} />
            </g>
          ))}

          {/* skull */}
          <ellipse cx={0} cy={0} rx={42} ry={38} fill={M.body} />

          {/* the signature bandit mask */}
          <path d="M -38 -8 q 38 -18 76 0 q -4 20 -38 20 q -34 0 -38 -20 Z" fill={M.mask} />

          {/* eyes, in the mask's cutouts */}
          {[-15, 15].map((cx) => (
            <circle key={cx} cx={cx} cy={-2} r={5.5} fill={EYE_RING} />
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -26 -20 q 9 -6 16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 26 -20 q -9 -6 -16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* muzzle */}
          <ellipse cx={0} cy={16} rx={18} ry={13} fill={M.belly} />
          <ellipse cx={0} cy={16} rx={6} ry={4.5} fill={INK} />
        </g>
      </g>
    </g>
  );
};
