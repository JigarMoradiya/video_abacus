// EQUATION MATCH's cast: TWO elephants — an EIGHTEENTH distinct character pair for the Math
// Game Zone series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/
// puzzle den, Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint
// workshop, Raccoon/puzzle study, Frog/lily pond, Turtle/mosaic plaza, Squirrel/autumn
// treetop, Penguin/ice floe, Octopus/deep sea lagoon, Ant/chalkboard all came before this
// one). Elephants were picked on purpose: "an elephant never forgets" IS the cultural
// shorthand for a great memory — and Equation Match is literally a memory-match game.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, trunk curled loosely. The default.
//   point  — one arm out, presenting a card.
//   think  — head tilted, trunk tip to the chin (a "hmm, I remember this" gesture).
//   worry  — ears pulled in, shrinking down. The stuck beat.
//   cheer  — both arms up, bouncing, trunk raised in a trumpet. Correct-guess payoff only.
//   recall — the signature gag: taps its own temple with the trunk tip, eyes light up — a
//            real "it just clicked" beat driven by `progress`, not a static prop.

import React from "react";
import { interpolate } from "remotion";

export type ElephantMood = "sit" | "point" | "think" | "worry" | "cheer" | "recall";

export const ELEPHANT_COLORS = {
  slate: { body: "#8C9BB5", belly: "#F0F3F8", ear: "#6B7A94", nail: "#E4E9F0" },
  dusk: { body: "#9C8CB5", belly: "#F3F0F8", ear: "#7A6B94", nail: "#E9E4F0" },
} as const;

export type ElephantName = keyof typeof ELEPHANT_COLORS;

const INK = "#2A3040";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const ELEPHANT_BOX = { up: 196, down: 20, half: 100 };

export const Elephant: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: ElephantMood;
  name: ElephantName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = ELEPHANT_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -10 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const earFlap = Math.sin(t * 1.6) * 5;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // one real "recall": trunk lifts to tap the temple (0-0.4), holds with a little glow-pulse
  // read as the eyes lighting up (0.4-0.75), trunk lowers back (0.75-1).
  const tapUp = mood === "recall" ? interpolate(progress, [0, 0.35, 0.75, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const glow = mood === "recall" ? interpolate(progress, [0.35, 0.5, 0.75], [0, 1, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={6} rx={64} ry={14} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* legs */}
        <path d="M -30 26 q -2 14 2 24 M 26 26 q 4 14 -2 24" stroke={M.ear} strokeWidth={16} strokeLinecap="round" fill="none" />

        {/* body */}
        <path d="M -50 10 q -6 -48 50 -58 q 54 10 46 58 q -46 12 -96 0 Z" fill={M.body} />
        <path d="M -4 -44 q 20 4 24 40 q -12 22 -24 22 q -14 0 -24 -22 q 4 -36 24 -40 Z" fill={M.belly} opacity={0.9} />

        {/* arms
             `cheer` raises both, `point` extends one, `think`/`recall` use the trunk instead
             of the arms for their gesture, so arms stay mostly at rest for those moods. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;

          const R = { x: 30 + 24 * out + 40 * up, y: -4 - 110 * up - 8 * out };
          const L = { x: -30 - 40 * up, y: -4 - 110 * up };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 16;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={15} strokeLinecap="round" />;
          };
          const hand = (e: { x: number; y: number }) => <circle cx={e.x} cy={e.y} r={11} fill={M.ear} />;

          return (
            <g>
              {arm(-26, -30, L)}
              {arm(26, -30, R)}
              {hand(L)}
              {hand(R)}
            </g>
          );
        })()}

        {/* head, with the two big flapping ears */}
        <g transform={`translate(0 -78) rotate(${headTilt})`}>
          {[-1, 1].map((side) => (
            <ellipse
              key={side}
              cx={side * 44}
              cy={-2 + earFlap * side}
              rx={30}
              ry={34}
              fill={M.ear}
              transform={`rotate(${side * (10 + earFlap)} ${side * 44} ${-2})`}
            />
          ))}
          <ellipse cx={0} cy={0} rx={38} ry={34} fill={M.body} />
          {/* eyes */}
          {[-13, 13].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-4} r={9} fill={EYE_RING} />
              <circle cx={cx} cy={-4} r={5.5} fill={INK} />
              {glow > 0.05 && <circle cx={cx} cy={-4} r={13} fill="none" stroke="#FFD54F" strokeWidth={2} opacity={glow} />}
            </g>
          ))}
          {mood === "worry" && (
            <>
              <path d="M -24 -18 q 8 -6 15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 24 -18 q -8 -6 -15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* the trunk — curls up for `recall`, lifts for `cheer`, otherwise a gentle idle sway */}
          {(() => {
            const idle = Math.sin(t * 1.3) * 6;
            const path =
              mood === "recall"
                ? `M 0 20 Q ${14 + tapUp * 4} ${34 - tapUp * 50} ${6 - tapUp * 2} ${8 - tapUp * 46}`
                : mood === "cheer"
                ? `M 0 20 Q 18 10 22 -20 Q 24 -34 14 -40`
                : `M 0 20 Q ${10 + idle * 0.6} 40 ${idle} 58`;
            return <path d={path} stroke={M.body} strokeWidth={15} strokeLinecap="round" fill="none" />;
          })()}
        </g>
      </g>
    </g>
  );
};
