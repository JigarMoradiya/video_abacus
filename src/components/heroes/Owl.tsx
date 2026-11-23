// TARGET NUMBER's cast: TWO owls — a NINTH distinct character pair for the Math Game Zone
// series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall, Puppy/puzzle den,
// Seagull/sky islands, Bear/detective office all came before this one). An owl was picked on
// purpose: keen eyesight and steady aim are the owl's whole cultural shorthand, and this game
// is about lining up numbers to hit an exact target — the same idea Number Detective's bears
// borrowed from the in-app mascot, just aimed at a different real-world association instead.
//
// Same rig discipline as every character before it: one component, two palettes, mirrored by
// `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit    — resting. The default.
//   point  — one wing out, presenting a tile.
//   think  — head tilted, one wing to the chin.
//   worry  — eyes wide, brows knit. The miss beat.
//   cheer  — both wings up, bouncing. Correct-guess payoff only.
//   aim    — the signature gag: wings drawn back like nocking a bow, head fixed dead ahead.
//            Not a static prop — a small held-breath tremor keeps it visibly alive without
//            changing the silhouette enough to look like a new pose.

import React from "react";
import { interpolate } from "remotion";

export type OwlMood = "sit" | "point" | "think" | "worry" | "cheer" | "aim";

export const OWL_COLORS = {
  amber: { body: "#C9862F", belly: "#FFEFCF", face: "#7A4A20", wing: "#A6691F" },
  slate: { body: "#5E6B7A", belly: "#EAF0F4", face: "#37414D", wing: "#4A5766" },
} as const;

export type OwlName = keyof typeof OWL_COLORS;

const INK = "#33241A";
const EYE_RING = "#FFFFFF";
const BEAK = "#E8A23B";

/** Measured off the paths below, same discipline every character in this series follows. */
export const OWL_BOX = { up: 200, down: 15, half: 92 };

export const Owl: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: OwlMood;
  name: OwlName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = OWL_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : 0;
  const browKnit = mood === "worry" ? 1 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  // "aim" holds still except a tiny held-breath tremor — the pose is fixed, the life comes
  // from a sub-pixel shiver, not a swing
  const aimTremor = mood === "aim" ? Math.sin(t * 9) * 1.6 : 0;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const aimGest = mood === "aim" ? interpolate(progress, [0, 0.25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={8} rx={64} ry={14} fill="#000" opacity={0.16} />

      <g transform={`translate(${aimTremor} ${-bounce})`}>
        {/* ---------------------------------------------------------------- feet */}
        <path d="M -16 8 l -5 13 M -16 8 l 5 13" stroke={BEAK} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M 16 8 l -5 13 M 16 8 l 5 13" stroke={BEAK} strokeWidth={7} strokeLinecap="round" fill="none" />

        {/* ---------------------------------------------------------------- body — egg-shaped, owl proportions */}
        <path d="M -48 -6 q -8 -56 24 -76 q 24 -16 48 0 q 32 20 24 76 q -48 10 -96 0 Z" fill={M.body} />
        <path d="M 0 -66 q 20 6 24 46 q -12 26 -24 26 q -12 0 -24 -26 q 4 -40 24 -46 Z" fill={M.belly} opacity={0.92} />
        {/* belly speckles — a couple of soft dashes, owl-feather shorthand without real texture cost */}
        {[[-10, -30], [10, -14], [-6, 2]].map(([cx, cy], i) => (
          <ellipse key={i} cx={cx} cy={cy} rx={7} ry={3} fill={M.wing} opacity={0.35} />
        ))}

        {/* ---------------------------------------------------------------- wing / arm
             `cheer` raises both, `point` extends one, `think` brings one to the chin,
             `aim` draws both back and in, like nocking a bow. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const draw = aimGest;

          const R = {
            x: 22 + 30 * out + 54 * up - 10 * draw,
            y: -6 - 172 * up - 12 * out - 40 * chin - 26 * draw,
            rot: -16 * out + 22 * up - 60 * draw,
          };
          const L = {
            x: -22 - 16 * chin - 52 * up - 34 * draw,
            y: -6 - 38 * chin - 172 * up - 6 * draw,
            rot: -22 * up + 40 * draw,
          };

          const wing = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 20;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.wing} strokeWidth={18} strokeLinecap="round" />;
          };
          const tip = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <path d="M -13 0 q 8 -14 22 -4 q -6 12 -22 4 Z" fill={M.wing} />
            </g>
          );

          return (
            <g>
              {wing(-24, -48, L)}
              {wing(24, -48, R)}
              {tip(L)}
              {tip(R)}
              {/* the arrow, nocked between the wings, only in "aim" */}
              {mood === "aim" && (
                <line
                  x1={L.x - 4}
                  y1={L.y}
                  x2={R.x + 30}
                  y2={R.y}
                  stroke="#8D6E63"
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={aimGest}
                />
              )}
            </g>
          );
        })()}

        {/* ---------------------------------------------------------------- head — big, forward-facing eyes */}
        <g transform={`translate(0 -96) rotate(${headTilt})`}>
          {/* ear tufts */}
          {[-1, 1].map((side) => (
            <path key={side} d={`M ${side * 20} -34 L ${side * 30} -58 L ${side * 8} -40 Z`} fill={M.body} />
          ))}

          {/* skull */}
          <circle cx={0} cy={0} r={42} fill={M.body} />
          {/* facial disc */}
          <ellipse cx={0} cy={4} rx={36} ry={32} fill={M.face} opacity={0.9} />

          {/* big forward eyes */}
          {[-15, 15].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={13} fill={EYE_RING} />
              <circle cx={cx} cy={-2} r={7.5} fill={INK} />
              {mood === "aim" && <circle cx={cx - 2} cy={-4} r={2} fill="#FFFFFF" />}
            </g>
          ))}
          {/* brows, worry only */}
          {browKnit > 0 && (
            <>
              <path d="M -26 -16 q 9 -6 16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 26 -16 q -9 -6 -16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* beak */}
          <path d="M -7 12 q 7 12 14 0 q -7 -8 -14 0 Z" fill={BEAK} />
        </g>
      </g>
    </g>
  );
};
