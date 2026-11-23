// CALCUDOKU's cast: TWO octopuses — a SIXTEENTH distinct character pair for the Math Game
// Zone series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle
// den, Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint
// workshop, Raccoon/puzzle study, Frog/lily pond, Turtle/mosaic plaza, Squirrel/autumn
// treetop, Penguin/ice floe all came before this one). Octopuses were picked on purpose:
// eight arms is the cultural shorthand for "juggling many things at once" — and Calcudoku is
// exactly that, several cages each combining their own arithmetic at the same time.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, tentacles curled loosely below. The default.
//   point  — one tentacle out, presenting a cage/number.
//   think  — head tilted, one tentacle curled to the chin.
//   worry  — eyes wide, tentacles drawing in. The stuck beat.
//   cheer  — all tentacles thrown up, bouncing. Correct-guess payoff only.
//   juggle — the signature gag: several tentacles curl and uncurl in a quick staggered wave,
//            like actually working several cages at once — driven by `progress`, not a bare
//            oscillation loop.

import React from "react";
import { interpolate } from "remotion";

export type OctopusMood = "sit" | "point" | "think" | "worry" | "cheer" | "juggle";

export const OCTOPUS_COLORS = {
  coral: { body: "#E8637A", belly: "#FDE3E8", tentacle: "#D14764", spot: "#B8324E" },
  teal: { body: "#3FA9A0", belly: "#E3FBF6", tentacle: "#2C8B82", spot: "#1F6B64" },
} as const;

export type OctopusName = keyof typeof OCTOPUS_COLORS;

const INK = "#1B2A2E";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const OCTOPUS_BOX = { up: 168, down: 46, half: 96 };

export const Octopus: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: OctopusMood;
  name: OctopusName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = OCTOPUS_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -10 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const worryPull = mood === "worry" ? gest * 0.4 : 0;

  // the 6 skirt tentacles (2 are reserved as gesture arms) each get their own idle sway, plus
  // a staggered curl-uncurl wave during "juggle" so it reads as working several things at once.
  const skirtTentacles = [-70, -42, -18, 18, 42, 70];
  const juggleWave = (i: number) =>
    mood === "juggle" ? interpolate((progress * 3 - i * 0.35 + 3) % 1, [0, 0.35, 0.7, 1], [0, 1, 0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={44} rx={72} ry={15} fill="#000" opacity={0.15} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* skirt tentacles — wavy, trailing below the mantle */}
        {skirtTentacles.map((baseX, i) => {
          const sway = Math.sin(t * 1.6 + i * 0.8) * 8;
          const curl = juggleWave(i) * 22;
          const bx = baseX * (1 - worryPull);
          return (
            <path
              key={i}
              d={`M ${bx} 6 Q ${bx + sway} 34 ${bx * 0.7} ${52 + curl} Q ${bx * 0.5} ${64 + curl} ${bx * 0.3} ${58 + curl}`}
              stroke={M.tentacle}
              strokeWidth={15}
              strokeLinecap="round"
              fill="none"
            />
          );
        })}

        {/* the two gesture tentacles — point/think/cheer read through these */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;

          const R = { x: 30 + 26 * out + 44 * up, y: -10 - 130 * up - 10 * out, rot: -16 * out + 24 * up };
          const L = { x: -30 - 16 * chin - 42 * up, y: -10 - 32 * chin - 130 * up, rot: -22 * up };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 18;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.tentacle} strokeWidth={15} strokeLinecap="round" />;
          };
          const tip = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <circle cx={0} cy={0} r={12} fill={M.spot} opacity={0.85} />
            </g>
          );

          return (
            <g>
              {arm(-24, -20, L)}
              {arm(24, -20, R)}
              {tip(L)}
              {tip(R)}
            </g>
          );
        })()}

        {/* the big bulbous mantle/head */}
        <g transform={`rotate(${headTilt})`}>
          <path d="M -66 6 Q -76 -60 0 -76 Q 76 -60 66 6 Q 40 22 0 22 Q -40 22 -66 6 Z" fill={M.body} />
          {/* belly patch */}
          <ellipse cx={0} cy={-6} rx={30} ry={28} fill={M.belly} opacity={0.85} />
          {/* suction-cup spots along the mantle edge */}
          {[-44, -22, 22, 44].map((cx) => (
            <circle key={cx} cx={cx} cy={14} r={5} fill={M.spot} opacity={0.4} />
          ))}
          {/* eyes */}
          {[-24, 24].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-24} r={17} fill={EYE_RING} />
              <circle cx={cx} cy={-24} r={9.5} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -38 -42 q 10 -7 18 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 38 -42 q -10 -7 -18 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}
          {/* the small grin */}
          <path d="M -14 4 q 14 10 28 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};
