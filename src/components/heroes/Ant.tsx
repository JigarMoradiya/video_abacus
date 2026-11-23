// KAKURO's cast: TWO ants — a SEVENTEENTH distinct character pair for the Math Game Zone
// series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle den,
// Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint workshop,
// Raccoon/puzzle study, Frog/lily pond, Turtle/mosaic plaza, Squirrel/autumn treetop, Penguin/
// ice floe, Octopus/deep sea lagoon all came before this one). Ants were picked on purpose:
// a single ant is one small, organized PART of a bigger whole (the colony) — exactly the idea
// Kakuro teaches, seeing a number as parts that add up to one sum.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, antennae drooped low. The default.
//   point  — one arm out, presenting a number.
//   think  — head tilted, one arm to the chin, antennae curled.
//   worry  — antennae flattened back, shrinking down. The stuck beat.
//   cheer  — both arms up, bouncing, antennae perked. Correct-guess payoff only.
//   carry  — the signature gag: hefts a big number-block overhead with both arms and marches
//            it into place — a real lift-carry-set-down arc driven by `progress`, not a static
//            prop.

import React from "react";
import { interpolate } from "remotion";

export type AntMood = "sit" | "point" | "think" | "worry" | "cheer" | "carry";

export const ANT_COLORS = {
  rust: { body: "#8A3E1E", shine: "#C97A45", limb: "#5E2A12" },
  ink: { body: "#2E2A28", shine: "#5A524C", limb: "#181614" },
} as const;

export type AntName = keyof typeof ANT_COLORS;

const INK = "#180E08";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const ANT_BOX = { up: 176, down: 24, half: 84 };

export const Ant: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: AntMood;
  name: AntName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = ANT_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : mood === "carry" ? 0 : Math.sin(t * 1.4) * 2;
  const antennaeDroop = mood === "sit" ? 8 : mood === "worry" ? 14 : 0;
  const antennaeBounce = mood === "cheer" ? Math.sin(t * 5) * 10 : 0;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // one real "carry": crouch to lift (0-0.25), march forward holding it overhead (0.25-0.75),
  // set it down (0.75-1) — a single deliberate delivery, not a repeating bob.
  const lift = mood === "carry" ? interpolate(progress, [0, 0.25, 0.75, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const march = mood === "carry" ? interpolate(progress, [0.25, 0.75], [0, 26], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x + march * F} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={16} rx={54} ry={13} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce - lift * 6})`}>
        {/* the three-segment ant body: rear (abdomen) - middle (thorax) - front (head),
            strung along a low arch, matching real ant silhouette proportions */}
        <ellipse cx={-40} cy={14} rx={30} ry={24} fill={M.body} />
        <ellipse cx={-40} cy={2} rx={14} ry={10} fill={M.shine} opacity={0.35} />
        <ellipse cx={0} cy={6} rx={17} ry={15} fill={M.body} />
        {/* thin waist joints linking the segments */}
        <line x1={-24} y1={12} x2={-14} y2={8} stroke={M.limb} strokeWidth={6} strokeLinecap="round" />

        {/* legs — three per side, thin and jointed */}
        {[-1, 1].map((side) =>
          [-18, 0, 16].map((lx, i) => (
            <path
              key={`${side}-${i}`}
              d={`M ${lx} ${side * 8 + 4} q ${side * 14} ${8 + i * 2} ${side * 22} ${26}`}
              stroke={M.limb}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
              opacity={0.9}
              transform={`translate(0 ${side === 1 ? 6 : -6})`}
            />
          ))
        )}

        {/* arms/gesture — attach at the thorax-head joint */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const carryUp = lift;

          const R = { x: 20 + 20 * out + 30 * up - 14 * carryUp, y: -6 - 96 * up - 6 * out - 58 * carryUp, rot: -14 * out + 20 * up };
          const L = { x: -6 - 12 * chin - 28 * up + 14 * carryUp, y: -6 - 24 * chin - 96 * up - 58 * carryUp, rot: -18 * up };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 14;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.limb} strokeWidth={6} strokeLinecap="round" />;
          };
          const hand = (e: { x: number; y: number }) => <circle cx={e.x} cy={e.y} r={7} fill={M.body} />;

          return (
            <g>
              {arm(-4, -2, L)}
              {arm(10, -2, R)}
              {hand(L)}
              {hand(R)}
              {/* the carried number-block, held between both hands */}
              {mood === "carry" && (
                <g transform={`translate(${(L.x + R.x) / 2} ${(L.y + R.y) / 2 - 14})`} opacity={lift}>
                  <rect x={-16} y={-16} width={32} height={32} rx={7} fill="#FFD54F" stroke="#C99A1E" strokeWidth={3} />
                </g>
              )}
            </g>
          );
        })()}

        {/* head, with the two curved antennae */}
        <g transform={`translate(0 -22) rotate(${headTilt})`}>
          {[-1, 1].map((side) => (
            <path
              key={side}
              d={`M ${side * 8} -10 Q ${side * 22} ${-36 - antennaeDroop} ${side * 34} ${-30 - antennaeDroop + antennaeBounce * side}`}
              stroke={M.limb}
              strokeWidth={5}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          <circle cx={0} cy={0} r={22} fill={M.body} />
          {/* eyes */}
          {[-9, 9].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={8} fill={EYE_RING} />
              <circle cx={cx} cy={-2} r={4.5} fill={INK} />
            </g>
          ))}
          {mood === "worry" && (
            <>
              <path d="M -18 -14 q 7 -5 13 -1" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
              <path d="M 18 -14 q -7 -5 -13 -1" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
            </>
          )}
          <path d="M -8 10 q 8 6 16 0" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};
