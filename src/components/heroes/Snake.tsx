// NUMBER SNAKE's cast: TWO snakes — a NINETEENTH distinct character pair for the Math Game
// Zone series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle
// den, Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint
// workshop, Raccoon/puzzle study, Frog/lily pond, Turtle/mosaic plaza, Squirrel/autumn
// treetop, Penguin/ice floe, Octopus/deep sea lagoon, Ant/chalkboard, Elephant/circus tent all
// came before this one). Snakes were picked on purpose: the game is literally named after one,
// and the real app's own connector line between consecutive numbers winds across the grid
// exactly like a snake's trail.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, coiled loosely. The default.
//   point  — one coil raised, presenting a number.
//   think  — head tilted, tongue flicking slowly (a "hmm" beat).
//   worry  — coils drawing in tighter, head low. The stuck beat.
//   cheer  — head thrown back, body doing a happy wiggle. Correct-guess payoff only.
//   trail  — the signature gag: the whole body uncoils and slithers forward in one continuous
//            S-curve — a real slither driven by `progress`, not a static prop.

import React from "react";
import { interpolate } from "remotion";

export type SnakeMood = "sit" | "point" | "think" | "worry" | "cheer" | "trail";

export const SNAKE_COLORS = {
  jade: { body: "#3FA65C", belly: "#EAF9EE", spot: "#2C7D42", tongue: "#E8637A" },
  amber: { body: "#D9A63E", belly: "#FBF3DC", spot: "#A87A22", tongue: "#E8637A" },
} as const;

export type SnakeName = keyof typeof SNAKE_COLORS;

const INK = "#1B3A22";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const SNAKE_BOX = { up: 168, down: 34, half: 100 };

export const Snake: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: SnakeMood;
  name: SnakeName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = SNAKE_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -10 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // one real slither: the coil unwinds into a forward S-curve (0-0.6), holds the stretched
  // pose a beat (0.6-0.8), coils back in (0.8-1).
  const slither = mood === "trail" ? interpolate(progress, [0, 0.6, 0.8, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const tighten = mood === "worry" ? gest : 0;

  // the coiled body: a stack of 3 wide loops that either sit coiled (mood != trail) or
  // stretch into a flat S (mood == trail), via the same `slither` progress.
  const coilPath = (i: number) => {
    const spread = 1 - tighten * 0.3;
    const baseY = 8 - i * 24;
    const coilX = Math.sin(i * 1.6) * 30 * spread;
    const stretchX = (i - 1) * 46 * slither;
    const stretchY = baseY * (1 - slither * 0.5);
    return { cx: coilX + stretchX, cy: stretchY };
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={26} rx={58} ry={13} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* three coiled body loops, trailing behind/below the head */}
        {[2, 1, 0].map((i) => {
          const p = coilPath(i);
          const r = 30 - i * 2;
          return <ellipse key={i} cx={p.cx} cy={p.cy} rx={r + 6} ry={r} fill={i === 0 ? M.body : M.spot} opacity={i === 0 ? 1 : 0.85} />;
        })}
        {/* belly stripe down the frontmost coil */}
        <ellipse cx={coilPath(0).cx} cy={coilPath(0).cy + 8} rx={22} ry={10} fill={M.belly} opacity={0.7} />

        {/* the two little arm-nubs some kid-friendly cartoon snakes get, for gesture readability */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const R = { x: 24 + 20 * out + 30 * up, y: -50 - 90 * up - 6 * out };
          const L = { x: -24 - 30 * up, y: -50 - 90 * up };
          const nub = (e: { x: number; y: number }, base: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - base.x, e.y - base.y) > 14;
            if (!lifted) return null;
            return (
              <g>
                <line x1={base.x} y1={base.y} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={11} strokeLinecap="round" />
                <circle cx={e.x} cy={e.y} r={9} fill={M.spot} />
              </g>
            );
          };
          return (
            <g>
              {nub(L, { x: -18, y: -58 })}
              {nub(R, { x: 18, y: -58 })}
            </g>
          );
        })()}

        {/* head, up front on the neck */}
        <g transform={`translate(${coilPath(0).cx * 0.4} ${-70 - slither * 6}) rotate(${headTilt})`}>
          <ellipse cx={0} cy={0} rx={34} ry={30} fill={M.body} />
          {[-12, 12].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-6} r={9} fill={EYE_RING} />
              <circle cx={cx} cy={-6} r={5.5} fill={INK} />
            </g>
          ))}
          {mood === "worry" && (
            <>
              <path d="M -22 -18 q 8 -6 14 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 22 -18 q -8 -6 -14 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}
          {/* the flicking forked tongue */}
          <path
            d={`M 0 20 L ${Math.sin(t * 6) * 4} ${34 + Math.abs(Math.sin(t * 6)) * 6} M ${Math.sin(t * 6) * 4} ${34 + Math.abs(Math.sin(t * 6)) * 6} l -5 6 M ${Math.sin(t * 6) * 4} ${34 + Math.abs(Math.sin(t * 6)) * 6} l 5 6`}
            stroke={M.tongue}
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
          />
          <path d="M -14 14 q 14 8 28 0" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.5} />
        </g>
      </g>
    </g>
  );
};
