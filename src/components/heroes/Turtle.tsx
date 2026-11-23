// MAGIC SQUARE's cast: TWO turtles — a THIRTEENTH distinct character pair for the Math Game
// Zone series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle
// den, Seagull/sky islands, Bear/detective office, Owl/archery range, Beaver/blueprint
// workshop, Raccoon/puzzle study, Frog/lily pond all came before this one). Turtles were
// picked on purpose: a turtle's shell is ALREADY a grid of scutes — the exact "every square
// has its place, every square adds to the whole" idea the game teaches. Its shell is painted
// as a RAINBOW 3x3 grid (the same vivid tile colors the real app itself uses), so the
// character IS the magic square — colorful and playful, not a muted, naturalistic critter.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting, head tucked in a little. The default.
//   point  — one arm out, presenting a tile.
//   think  — head tilted, one arm to the chin.
//   worry  — head drawn back into the shell, eyes wide. The stuck beat.
//   cheer  — both arms up, bouncing. Correct-guess payoff only.
//   nod    — the signature gag: neck stretches OUT of the shell, then one slow, confident
//            nod down-and-up — not a bare loop, a single deliberate confirmation driven by
//            `progress`, exactly the "yes, that's right" beat a finished row deserves.

import React from "react";
import { interpolate } from "remotion";

export type TurtleMood = "sit" | "point" | "think" | "worry" | "cheer" | "nod";

// the SAME vivid palette the real Magic Square tiles use — the shell's 9 scutes wear these,
// so the character visually IS a magic square.
const RAINBOW_SCUTES = ["#FF7A6B", "#2EC4C6", "#FFC93C", "#9B6BD9", "#3E7BFA", "#FF9F45", "#4CC26B", "#FF6FA5", "#38C6F4"];

export const TURTLE_COLORS = {
  coral: { skin: "#FFD9A0", belly: "#FFF0D6", rim: "#3A2A1E" },
  cobalt: { skin: "#BFE3FF", belly: "#EAF7FF", rim: "#22344A" },
} as const;

export type TurtleName = keyof typeof TURTLE_COLORS;

const INK = "#2B2016";
const EYE_RING = "#FFFFFF";

/** Measured off the paths below, same discipline every character in this series follows. */
export const TURTLE_BOX = { up: 206, down: 20, half: 64 };

export const Turtle: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: TurtleMood;
  name: TurtleName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = TURTLE_COLORS[name];
  const F = facing;

  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 11 : Math.sin(t * 1.3) * 2;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // one real "nod": neck stretches out (0-0.3), holds, dips into a confirming nod (0.4-0.75),
  // settles back (0.75-1) — a single deliberate beat, not a bobble loop.
  const stretch = mood === "nod" ? interpolate(progress, [0, 0.3, 0.85, 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const nodDip = mood === "nod" ? interpolate(progress, [0.4, 0.58, 0.75], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const tuck = mood === "worry" ? 1 : 0;
  const headTilt = mood === "think" ? -11 : mood === "worry" ? 3 + Math.sin(t * 1.8) * 5 : 0;

  // the shell sits as a back-hump BEHIND the head (like Beaver's tail, Frog's legs — a
  // secondary shape, not the whole silhouette), well above the ground; the head then sits
  // clearly ABOVE it with a real neck gap, exactly like every other character in this series.
  const SHELL_TOP = -142;
  const SHELL_BOTTOM = -20;
  const neckY = 6 * stretch + 14 * nodDip - 10 * tuck;
  const headY = SHELL_TOP - 34 + neckY;

  // the 9 scute cells, laid out as a real 3x3 grid across the dome — same positions every
  // render (not randomized), so the "shell = magic square" read is consistent frame to frame.
  const scuteCells = [
    { cx: -40, cy: -116 },
    { cx: 0, cy: -122 },
    { cx: 40, cy: -116 },
    { cx: -44, cy: -80 },
    { cx: 0, cy: -82 },
    { cx: 44, cy: -80 },
    { cx: -40, cy: -44 },
    { cx: 0, cy: -40 },
    { cx: 40, cy: -44 },
  ];

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={6} rx={56} ry={14} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* the shell — a rounded back-hump painted as a rainbow 3x3 grid, clipped to the
            dome shape, with a plain belly punched out of its center so only a colorful RIM
            of scutes shows — the same "grid around a plain center" read as a real shell,
            not a solid disc */}
        <g>
          <defs>
            <clipPath id={`turtleDome-${name}`}>
              <path d={`M -64 ${SHELL_BOTTOM} q -8 -100 64 -120 q 72 20 64 120 q -64 18 -128 0 Z`} />
            </clipPath>
          </defs>
          <path d={`M -64 ${SHELL_BOTTOM} q -8 -100 64 -120 q 72 20 64 120 q -64 18 -128 0 Z`} fill={M.rim} />
          <g clipPath={`url(#turtleDome-${name})`}>
            {scuteCells.map((c, i) => (
              <circle key={i} cx={c.cx} cy={c.cy} r={26} fill={RAINBOW_SCUTES[i]} stroke={M.rim} strokeWidth={4} />
            ))}
            <ellipse cx={0} cy={-78} rx={36} ry={48} fill={M.belly} />
          </g>
          <path d={`M -64 ${SHELL_BOTTOM} q 64 18 128 0`} stroke={M.rim} strokeWidth={5} fill="none" opacity={0.5} />
        </g>

        {/* stubby legs peeking from under the shell — a single close pair, not a spread */}
        <path d={`M -16 ${SHELL_BOTTOM + 2} q -3 12 -1 20 M 16 ${SHELL_BOTTOM + 2} q 3 12 1 20`} stroke={M.skin} strokeWidth={16} strokeLinecap="round" fill="none" />

        {/* arms
             `cheer` raises both, `point` extends one, `think` brings one to the chin —
             short stubby sockets at the shell's sides, not long diagonal reaches. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const sockX = 44;
          const sockY = -68;

          const R = { x: sockX + 14 * out + 28 * up, y: sockY + 6 - 96 * up - 6 * out, rot: -14 * out + 20 * up };
          const L = { x: -sockX - 10 * chin - 26 * up, y: sockY + 6 - 22 * chin - 96 * up, rot: -20 * up };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 14;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.skin} strokeWidth={14} strokeLinecap="round" />;
          };
          const paw = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={12} ry={10} fill={M.skin} />
            </g>
          );

          return (
            <g>
              {arm(-sockX, sockY, L)}
              {arm(sockX, sockY, R)}
              <ellipse cx={-sockX} cy={sockY} rx={11} ry={10} fill={M.skin} />
              <ellipse cx={sockX} cy={sockY} rx={11} ry={10} fill={M.skin} />
              {paw(L)}
              {paw(R)}
            </g>
          );
        })()}

        {/* head + neck — clearly above the shell, with a real gap between them; stretches
            further out for "nod", draws back down toward the shell for "worry" */}
        <g transform={`translate(0 ${headY}) rotate(${headTilt})`}>
          {/* neck bridges the gap down to the shell's top edge */}
          <rect x={-15} y={20} width={30} height={SHELL_TOP - headY - 20 + 16 - tuck * 10} rx={13} fill={M.skin} />
          <ellipse cx={0} cy={0} rx={34} ry={30 - tuck * 6} fill={M.skin} />
          {/* eyes */}
          {[-13, 13].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-4} r={9} fill={EYE_RING} />
              <circle cx={cx} cy={-4} r={5} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -24 -18 q 8 -6 15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 24 -18 q -8 -6 -15 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}
          {/* rosy cheeks — keeps the face warm and playful, not reptilian */}
          {[-23, 23].map((cx) => (
            <circle key={cx} cx={cx} cy={8} r={7} fill="#FF9E9E" opacity={0.55} />
          ))}
          {/* small beak-like mouth */}
          <path d="M -10 14 q 10 8 20 0" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};
