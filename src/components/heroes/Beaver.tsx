// MATH PYRAMID's cast: TWO beavers — a TENTH distinct character pair for the Math Game Zone
// series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle den,
// Seagull/sky islands, Bear/detective office, Owl/archery range all came before this one).
// Beavers were picked on purpose: they are THE cultural shorthand for building and stacking,
// and this game is literally "add numbers to build the pyramid" — a construction game needs
// a builder.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting. The default.
//   point  — one paw out, presenting a block.
//   think  — head tilted, one paw to the chin.
//   worry  — ears back, eyes wide. The stuck beat.
//   cheer  — both paws up, bouncing. Correct-guess payoff only.
//   stack  — the signature gag: both paws raised overhead, setting a block on top of the
//            pyramid. Not a static prop — a small settle-bounce on landing keeps it alive.

import React from "react";
import { interpolate } from "remotion";

export type BeaverMood = "sit" | "point" | "think" | "worry" | "cheer" | "stack";

export const BEAVER_COLORS = {
  chestnut: { body: "#8B5A2B", belly: "#F0D9B5", tail: "#5C3A1E", tooth: "#FFF6D9" },
  slate: { body: "#6B6259", belly: "#E8DFD3", tail: "#453F38", tooth: "#FFF6D9" },
} as const;

export type BeaverName = keyof typeof BEAVER_COLORS;

const INK = "#3A281A";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const BEAVER_BOX = { up: 200, down: 16, half: 96 };

export const Beaver: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: BeaverMood;
  name: BeaverName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = BEAVER_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const tailFlap = Math.sin(t * (mood === "cheer" ? 6 : 2)) * (mood === "cheer" ? 10 : 5);

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // "stack" settles into place — a quick overshoot as the block lands, then still
  const stackGest = mood === "stack" ? interpolate(progress, [0, 0.35, 0.5], [0, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={8} rx={66} ry={14} fill="#000" opacity={0.17} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* flat paddle tail, behind the body */}
        <g transform={`translate(-38 4) rotate(${10 + tailFlap})`}>
          <ellipse cx={0} cy={0} rx={26} ry={17} fill={M.tail} />
          <path d="M -20 -12 L 20 -12 M -20 0 L 20 0 M -20 12 L 20 12" stroke="#000" strokeOpacity={0.12} strokeWidth={2} />
        </g>

        {/* feet */}
        <path d="M -16 8 l -5 13 M -16 8 l 5 13" stroke={M.tail} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M 16 8 l -5 13 M 16 8 l 5 13" stroke={M.tail} strokeWidth={7} strokeLinecap="round" fill="none" />

        {/* body — stout, round */}
        <path d="M -48 -6 q -6 -52 24 -70 q 24 -14 48 0 q 30 18 24 70 q -48 10 -96 0 Z" fill={M.body} />
        <path d="M 0 -64 q 20 4 24 44 q -12 26 -24 26 q -12 0 -24 -26 q 4 -40 24 -44 Z" fill={M.belly} opacity={0.9} />

        {/* paws / arms
             `cheer` raises both, `point` extends one, `think` brings one to the chin,
             `stack` raises both overhead placing a block. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const stack = stackGest;

          const R = {
            x: 20 + 30 * out + 54 * up + 20 * stack,
            y: -6 - 172 * up - 12 * out - 190 * stack,
            rot: -16 * out + 22 * up,
          };
          const L = {
            x: -20 - 16 * chin - 52 * up - 20 * stack,
            y: -6 - 38 * chin - 172 * up - 190 * stack,
            rot: -22 * up,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 20;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={19} strokeLinecap="round" />;
          };
          const paw = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={15} ry={13} fill={M.tail} />
            </g>
          );

          return (
            <g>
              {arm(-24, -50, L)}
              {arm(24, -50, R)}
              {mood !== "stack" && paw(L)}
              {mood !== "stack" && paw(R)}
              {/* the block being placed, held between the raised paws */}
              {mood === "stack" && (
                <g transform={`translate(0 ${R.y - 6})`} opacity={stack}>
                  <rect x={-30} y={-14} width={60} height={28} rx={7} fill="#FFF6E8" stroke="#D9A25C" strokeWidth={4} />
                </g>
              )}
            </g>
          );
        })()}

        {/* head */}
        <g transform={`translate(0 -94) rotate(${headTilt})`}>
          {/* small round ears */}
          {[-1, 1].map((side) => (
            <circle key={side} cx={side * 32} cy={-28} r={11} fill={M.body} />
          ))}

          {/* skull */}
          <ellipse cx={0} cy={0} rx={42} ry={38} fill={M.body} />

          {/* eyes */}
          {[-14, 14].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={10} fill={EYE_RING} />
              <circle cx={cx} cy={-2} r={6} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -26 -18 q 9 -6 16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 26 -18 q -9 -6 -16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* muzzle with the signature two front teeth */}
          <ellipse cx={0} cy={16} rx={20} ry={16} fill={M.belly} />
          <rect x={-9} y={20} width={8} height={12} rx={2} fill={M.tooth} stroke={INK} strokeWidth={1.2} />
          <rect x={1} y={20} width={8} height={12} rx={2} fill={M.tooth} stroke={INK} strokeWidth={1.2} />
        </g>
      </g>
    </g>
  );
};
