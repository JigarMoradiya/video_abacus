// NUMBER SEQUENCE PUZZLE's cast: TWO penguins — a FIFTEENTH distinct character pair for the
// Math Game Zone series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall,
// Puppy/puzzle den, Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/
// blueprint workshop, Raccoon/puzzle study, Frog/lily pond, Turtle/mosaic plaza, Squirrel/
// autumn treetop all came before this one). Penguins were picked on purpose: belly-sliding
// across ice IS their whole cultural shorthand — and this game is literally "slide the tiles"
// — a sliding game needs a sliding critter.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, flippers at sides. The default.
//   point  — one flipper out, presenting a tile.
//   think  — head tilted, one flipper to the chin.
//   worry  — eyes wide, shrinking down. The stuck beat.
//   cheer  — both flippers up, bouncing. Correct-guess payoff only.
//   slide  — the signature gag: drops flat onto its belly and SLIDES sideways across the ice
//            — a real belly-flop-then-glide arc driven by `progress`, not a static prop.

import React from "react";
import { interpolate } from "remotion";

export type PenguinMood = "sit" | "point" | "think" | "worry" | "cheer" | "slide";

export const PENGUIN_COLORS = {
  classic: { body: "#2B2E3A", belly: "#F4F7FA", beak: "#F2A93B", foot: "#F2A93B" },
  frost: { body: "#3E5C76", belly: "#EAF4FB", beak: "#F2A93B", foot: "#F2A93B" },
} as const;

export type PenguinName = keyof typeof PENGUIN_COLORS;

const INK = "#1B1E28";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const PENGUIN_BOX = { up: 186, down: 18, half: 92 };

export const Penguin: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: PenguinMood;
  name: PenguinName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = PENGUIN_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : mood === "slide" ? 0 : Math.sin(t * 1.4) * 2;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // one real belly-slide: drop down onto the belly (0-0.2), glide sideways across the ice
  // (0.2-0.8), pop back upright (0.8-1) — a single deliberate slide, not a repeating wobble.
  const drop = mood === "slide" ? interpolate(progress, [0, 0.2, 0.8, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const glide = mood === "slide" ? interpolate(progress, [0.2, 0.8], [0, 90], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const tilt = drop * 90;

  return (
    <g transform={`translate(${x + glide * F} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={8} rx={58} ry={14} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce + drop * 46}) rotate(${tilt})`}>
        {/* feet */}
        <path d="M -16 34 l -10 12 M -16 34 l 4 12" stroke={M.foot} strokeWidth={9} strokeLinecap="round" fill="none" />
        <path d="M 16 34 l 10 12 M 16 34 l -4 12" stroke={M.foot} strokeWidth={9} strokeLinecap="round" fill="none" />

        {/* body — round tuxedo shape */}
        <path d="M -46 20 q -10 -70 46 -84 q 56 14 46 84 q -46 14 -92 0 Z" fill={M.body} />
        <path d="M 0 -46 q 26 6 30 50 q -14 26 -30 26 q -16 0 -30 -26 q 4 -44 30 -50 Z" fill={M.belly} opacity={0.95} />

        {/* flippers
             `cheer` raises both, `point` extends one, `think` brings one to chin,
             `slide` sweeps both back along the body. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const back = drop;

          const R = { x: 34 + 22 * out + 40 * up - 10 * back, y: -6 - 120 * up - 8 * out + 30 * back, rot: -16 * out + 24 * up + 70 * back };
          const L = { x: -34 - 14 * chin - 38 * up + 10 * back, y: -6 - 28 * chin - 120 * up + 30 * back, rot: -22 * up - 70 * back };

          const flipper = (sx: number, sy: number, e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${sx} ${sy}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={22} rx={13} ry={30} fill={M.body} />
            </g>
          );

          return (
            <g>
              {flipper(-30, -10, L)}
              {flipper(30, -10, R)}
            </g>
          );
        })()}

        {/* head */}
        <g transform={`translate(0 -92) rotate(${headTilt})`}>
          <ellipse cx={0} cy={0} rx={36} ry={32} fill={M.body} />
          {/* the white face-mask patch */}
          <ellipse cx={0} cy={4} rx={22} ry={22} fill={M.belly} opacity={0.95} />
          {/* eyes */}
          {[-11, 11].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={8} fill={EYE_RING} />
              <circle cx={cx} cy={-2} r={5} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -22 -16 q 8 -6 15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 22 -16 q -8 -6 -15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}
          {/* the orange beak */}
          <path d="M -9 10 Q 0 22 9 10 Q 0 16 -9 10 Z" fill={M.beak} />
        </g>
      </g>
    </g>
  );
};
