// NUMBER PATH's cast: TWO frogs — a TWELFTH distinct character pair for the Math Game Zone
// series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle den,
// Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint workshop,
// Raccoon/puzzle study all came before this one). Frogs were picked on purpose: hopping is
// their whole cultural shorthand, and Number Path is literally a hop-from-tile-to-tile game —
// the real app's own "buddy" riding the path is even a hopping critter emoji.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, crouched. The default.
//   point  — one arm out, presenting a tile.
//   think  — head tilted, one arm to the chin.
//   worry  — eyes wide, shrinking down. The stuck beat.
//   cheer  — both arms up, bouncing. Correct-guess payoff only.
//   hop    — the signature gag: a mid-air leap, legs tucked, arms back — not a static prop,
//            a real crouch-launch-land arc driven by `progress` so it reads as ONE hop, not
//            a bounce loop.

import React from "react";
import { interpolate } from "remotion";

export type FrogMood = "sit" | "point" | "think" | "worry" | "cheer" | "hop";

export const FROG_COLORS = {
  meadow: { body: "#4CAF7D", belly: "#EAFBEF", spot: "#2E8B57", eye: "#1B4332" },
  lily: { body: "#7FBF6A", belly: "#F1FBE8", spot: "#4E8C3F", eye: "#2E4A1F" },
} as const;

export type FrogName = keyof typeof FROG_COLORS;

const INK = "#1B3A2A";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const FROG_BOX = { up: 210, down: 14, half: 90 };

export const Frog: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: FrogMood;
  name: FrogName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = FROG_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : mood === "hop" ? 0 : Math.sin(t * 1.4) * 2;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // one real hop arc: crouch (0-0.2), launch+airborne (0.2-0.7), land+settle (0.7-1)
  const hopArc = mood === "hop"
    ? interpolate(progress, [0, 0.2, 0.45, 0.7, 1], [0, -14, -70, -14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const crouch = mood === "hop" ? interpolate(progress, [0, 0.2, 0.35], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const legTuck = mood === "hop" ? interpolate(progress, [0.2, 0.5, 0.75], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x} ${y + hopArc}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={8} rx={62 - crouch * 6} ry={13} fill="#000" opacity={0.16 - crouch * 0.06} />

      <g transform={`translate(0 ${-bounce + crouch * 14})`}>
        {/* back legs — tucked under in "hop", splayed for a crouch/sit otherwise */}
        <path
          d={legTuck > 0
            ? `M -30 -10 q -8 18 4 30 M 30 -10 q 8 18 -4 30`
            : `M -34 0 q -14 14 -10 30 M 34 0 q 14 14 10 30`}
          stroke={M.spot}
          strokeWidth={13}
          strokeLinecap="round"
          fill="none"
        />

        {/* body — squat and round */}
        <path d={`M -48 ${-4 + crouch * 10} q -4 -50 24 -66 q 24 -14 48 0 q 28 16 24 66 q -48 10 -96 0 Z`} fill={M.body} />
        <path d={`M 0 ${-58 + crouch * 8} q 20 4 24 40 q -12 24 -24 24 q -12 0 -24 -24 q 4 -36 24 -40 Z`} fill={M.belly} opacity={0.92} />
        {/* belly spots */}
        {[[-14, -20], [12, -8]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={5} fill={M.spot} opacity={0.4} />
        ))}

        {/* arms
             `cheer` raises both, `point` extends one, `think` brings one to the chin,
             `hop` sweeps both back for launch. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const back = mood === "hop" ? legTuck : 0;

          const R = { x: 18 + 28 * out + 50 * up - 30 * back, y: -2 - 160 * up - 10 * out + 20 * back, rot: -16 * out + 22 * up };
          const L = { x: -18 - 16 * chin - 48 * up - 30 * back, y: -2 - 36 * chin - 160 * up + 20 * back, rot: -22 * up };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 18;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={16} strokeLinecap="round" />;
          };
          const pad = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <circle cx={0} cy={0} r={12} fill={M.spot} opacity={0.9} />
            </g>
          );

          return (
            <g>
              {arm(-22, -44, L)}
              {arm(22, -44, R)}
              {pad(L)}
              {pad(R)}
            </g>
          );
        })()}

        {/* head — wide, with the big top-mounted frog eyes */}
        <g transform={`translate(0 ${-88 + crouch * 6}) rotate(${headTilt})`}>
          <ellipse cx={0} cy={4} rx={40} ry={30} fill={M.body} />
          {/* eye bumps sit ON TOP of the head, frog-style */}
          {[-22, 22].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-20} r={16} fill={M.body} />
              <circle cx={cx} cy={-22} r={10} fill={EYE_RING} />
              <circle cx={cx} cy={-22} r={5.5} fill={M.eye} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -34 -34 q 9 -6 16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 34 -34 q -9 -6 -16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}
          {/* the wide grin */}
          <path d="M -18 14 q 18 12 36 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};
