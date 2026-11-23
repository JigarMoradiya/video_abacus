// BO & PIP — the app's own icon mascots, animated. Same engineering pattern as Hero.tsx (pose
// keyed to a named mood, never to a raw oscillation, so nothing flickers between two bodies),
// but a completely different body: a rounded gem/blob silhouette with no cape or mask, because
// these two aren't superheroes — they're the app's own characters teaching the basics.
//
// Six moods:
//   sit    — resting. The default.
//   point  — one arm out, presenting the abacus.
//   wave   — one arm raised, waving side to side. The hook-line greeting.
//   think  — head tilted, one arm toward the chin.
//   cheer  — both arms up, bouncing. The close.
//   watch  — head turned toward the abacus, hands together — listening, not performing.

import React from "react";
import { interpolate } from "remotion";

export type MascotMood = "sit" | "point" | "wave" | "think" | "cheer" | "watch";

export const MASCOT_COLORS = {
  bo: { body: "#4C8DF5", bodyDark: "#2B62D9", belly: "#DCEBFF", blush: "#FF9FC0" },
  pip: { body: "#9B6BF2", bodyDark: "#7440D6", belly: "#EEE3FF", blush: "#FF9FC0" },
} as const;

export type MascotName = keyof typeof MASCOT_COLORS;

/** Measured off the gem path below. */
export const MASCOT_BOX = { up: 150, down: 20, half: 100 };

const gemPath = (w: number, h: number): string => {
  const hw = w / 2;
  const hh = h / 2;
  return [
    `M 0 ${-hh}`,
    `Q ${hw * 0.92} ${-hh} ${hw} ${-hh * 0.1}`,
    `Q ${hw * 0.96} ${hh * 0.3} 0 ${hh}`,
    `Q ${-hw * 0.96} ${hh * 0.3} ${-hw} ${-hh * 0.1}`,
    `Q ${-hw * 0.92} ${-hh} 0 ${-hh}`,
    "Z",
  ].join(" ");
};

export const Mascot: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: MascotMood;
  name: MascotName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = MASCOT_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -14 : mood === "watch" ? 8 * F : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 14 : Math.sin(t * 1.3) * 3;
  const squash = mood === "cheer" ? 1 + Math.sin(t * 4.6) * 0.03 : 1;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const waveWag = mood === "wave" ? Math.sin(t * 7) * 22 : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={12} rx={78} ry={16} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce}) scale(${1 / squash} ${squash})`}>
        {/* feet, just enough to read as standing */}
        <path d="M -20 78 l -5 14 M -20 78 l 0 15" stroke={M.bodyDark} strokeWidth={9} strokeLinecap="round" fill="none" />
        <path d="M 20 78 l 5 14 M 20 78 l 0 15" stroke={M.bodyDark} strokeWidth={9} strokeLinecap="round" fill="none" />

        {/* the gem body */}
        <path d={gemPath(150, 150)} fill={M.body} />
        <path
          d={`M 0 -50 Q 34 -30 30 14 Q 16 40 0 40 Q -16 40 -30 14 Q -34 -30 0 -50 Z`}
          fill={M.belly}
          opacity={0.9}
        />

        {/* arms — simple rounded stubs from the body's shoulders, since a gem has no defined
            arm sockets to reuse from a humanoid rig */}
        {(() => {
          const out = mood === "point" ? gest : 0;
          const up = mood === "cheer" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const wave = mood === "wave" ? gest : 0;

          const R = {
            x: 44 + 30 * out + 40 * up + 18 * wave,
            y: -10 - 130 * up - 10 * out + waveWag - 60 * wave,
            rot: -14 * out + 18 * up + waveWag * 0.6,
          };
          const L = {
            x: -44 - 16 * chin - 34 * up,
            y: -10 - 30 * chin - 130 * up,
            rot: -18 * up,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 18;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.bodyDark} strokeWidth={17} strokeLinecap="round" />;
          };
          const hand = (e: { x: number; y: number }) => (
            <circle cx={e.x} cy={e.y} r={13} fill={M.body} stroke={M.bodyDark} strokeWidth={3} />
          );

          return (
            <g>
              {arm(-38, -20, L)}
              {arm(38, -20, R)}
              {hand(L)}
              {hand(R)}
            </g>
          );
        })()}

        {/* the face — dot eyes with a highlight, blush, a simple smile, right on the gem's
            own body (no separate head shape, matching the icon) */}
        <g transform={`rotate(${headTilt})`}>
          {[-18, 18].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-8} r={9} fill="#221033" />
              <circle cx={cx - 3} cy={-11} r={2.6} fill="#FFFFFF" />
            </g>
          ))}
          <circle cx={-30} cy={8} r={9} fill={M.blush} opacity={0.75} />
          <circle cx={30} cy={8} r={9} fill={M.blush} opacity={0.75} />
          <path d="M -13 14 Q 0 24 13 14" stroke="#221033" strokeWidth={3.4} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};
