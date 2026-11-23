// ZIP & DASH — the hosts for the dark-themed "quick math" reels (adding/subtracting on one
// rod), a deliberately different cast from Bo & Pip (the bright daytime basics trio) and from
// Blaze & Spark (the Math Heroes superheroes). Same mood-pose-rig engineering pattern as
// Hero.tsx and Mascot.tsx — pose is a pure function of a named mood, never a raw oscillation —
// but a humanoid ninja silhouette: masked eyes, a trailing headband, a flowing sash, because
// "quick" is the whole point of these two reels and a ninja sells speed instantly.

import React from "react";
import { interpolate } from "remotion";

export type NinjaMood = "sit" | "point" | "wave" | "think" | "cheer" | "watch";

export const NINJA_COLORS = {
  zip: { body: "#16324F", bodyDark: "#0B1E33", accent: "#2EE6D6", skin: "#F0C29A" },
  dash: { body: "#3A1750", bodyDark: "#230C33", accent: "#F24DB0", skin: "#F0C29A" },
} as const;

export type NinjaName = keyof typeof NINJA_COLORS;

export const Ninja: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: NinjaMood;
  name: NinjaName;
  progress: number;
  frame: number;
  fps: number;
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const N = NINJA_COLORS[name];
  const F = facing;

  const headTilt = mood === "think" ? -12 : mood === "watch" ? 7 * F : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.8)) * 15 : Math.sin(t * 1.3) * 3;
  const squash = mood === "cheer" ? 1 + Math.sin(t * 4.8) * 0.03 : 1;

  const gest = interpolate(progress, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const waveWag = mood === "wave" ? Math.sin(t * 7.2) * 22 : 0;
  // the headband tails and sash flutter continuously — a ninja standing still never reads
  // as "quick", so something is always fluttering even at rest
  const flutter = Math.sin(t * 3.4) * 10;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={82} rx={70} ry={15} fill="#000" opacity={0.28} />

      <g transform={`translate(0 ${-bounce}) scale(${1 / squash} ${squash})`}>
        {/* headband tails, trailing from behind the head */}
        <path d={`M -14 -78 Q ${-50 + flutter} ${-70 + flutter * 0.5} ${-62 + flutter} -40`} stroke={N.accent} strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.9} />
        <path d={`M 2 -80 Q ${34 - flutter} ${-74 - flutter * 0.4} ${46 - flutter} -46`} stroke={N.accent} strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.9} />

        {/* feet */}
        <path d="M -18 78 l -4 14 M -18 78 l 0 15" stroke={N.bodyDark} strokeWidth={11} strokeLinecap="round" fill="none" />
        <path d="M 18 78 l 4 14 M 18 78 l 0 15" stroke={N.bodyDark} strokeWidth={11} strokeLinecap="round" fill="none" />

        {/* the sash, fluttering at the waist */}
        <path d={`M -20 34 Q ${-34 + flutter * 0.6} ${58 + flutter} ${-14 + flutter * 0.4} 80`} stroke={N.accent} strokeWidth={14} strokeLinecap="round" fill="none" opacity={0.85} />

        {/* torso — a rounded tunic */}
        <path
          d="M -40 -6 C -46 30 -40 62 -30 82 L 30 82 C 40 62 46 30 40 -6 C 40 -34 22 -50 0 -50 C -22 -50 -40 -34 -40 -6 Z"
          fill={N.body}
        />
        <path d="M -14 -46 L 0 6 L 14 -46 Z" fill={N.accent} opacity={0.35} />

        {/* arms — same reach math as Mascot, so gestures read identically across the cast */}
        {(() => {
          const out = mood === "point" ? gest : 0;
          const up = mood === "cheer" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const wave = mood === "wave" ? gest : 0;

          const R = {
            x: 40 + 28 * out + 36 * up + 16 * wave,
            y: -4 - 118 * up - 8 * out + waveWag - 54 * wave,
            rot: -14 * out + 18 * up + waveWag * 0.6,
          };
          const L = {
            x: -40 - 14 * chin - 30 * up,
            y: -4 - 26 * chin - 118 * up,
            rot: -18 * up,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 16;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={N.body} strokeWidth={15} strokeLinecap="round" />;
          };
          const hand = (e: { x: number; y: number }) => (
            <circle cx={e.x} cy={e.y} r={11} fill={N.skin} stroke={N.bodyDark} strokeWidth={2.5} />
          );

          return (
            <g>
              {arm(-32, -14, L)}
              {arm(32, -14, R)}
              {hand(L)}
              {hand(R)}
            </g>
          );
        })()}

        {/* head + mask — eyes are the only visible skin, everything else wrapped */}
        <g transform={`rotate(${headTilt})`}>
          <circle cx={0} cy={-64} r={30} fill={N.bodyDark} />
          <path d="M -30 -70 Q 0 -92 30 -70 L 30 -62 Q 0 -78 -30 -62 Z" fill={N.body} />
          <path d="M -22 -60 Q 0 -50 22 -60 L 22 -46 Q 0 -38 -22 -46 Z" fill={N.skin} />
          {[-10, 10].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={-58} rx={6.5} ry={7.5} fill="#221033" />
              <circle cx={cx - 2} cy={-60} r={2} fill="#FFFFFF" />
            </g>
          ))}
        </g>
      </g>
    </g>
  );
};
