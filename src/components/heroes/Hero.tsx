// MATH HEROES — Blaze and Spark, for the short-form reel (not part of the numbered episode
// series). Built on the SAME proven mood-pose rig `Fox`/`Seagull`/`Puppy` already share — body,
// arm mechanics, head — just re-costumed: a cape instead of a tail, a domino mask over the eyes,
// no ears. The engineering is reused on purpose; the world, story and costume are what's new.
//
// Seven moods:
//   sit    — resting. The default.
//   point  — one arm out, presenting the alarm console.
//   worry  — brows down, a little hunched. The stuck beat.
//   call   — one arm raised, a communicator held to the head. "Let's call a friend!"
//   entry  — the hero-entry burst: both arms flung wide, cape flared big. Paired with a
//            translateX slide-in driven by `entryProgress` for the dramatic arrival — the pose
//            alone is just a stance, the SLIDE is what makes it a landing.
//   think  — head tilted, one arm to the chin.
//   cheer  — both arms up, bouncing. Answers only.
//
// POSE IS KEYED TO THE MOOD, NEVER TO AN OSCILLATION — same rule as every other character in
// this series, for the same reason (E05's astronaut and E06's monkey both shipped with structure
// keyed to |sin(t)|, which flickered them between two bodies twice a second).

import React from "react";
import { interpolate } from "remotion";

export type HeroMood = "sit" | "point" | "worry" | "call" | "entry" | "think" | "cheer";

export const HERO_COLORS = {
  blaze: { body: "#E8432C", belly: "#FFE9DC", cape: "#B02A1C", mask: "#2A1418" },
  spark: { body: "#2C6FE8", belly: "#E4EEFF", cape: "#1C4CB0", mask: "#141B2A" },
  // Reel 2's "new mission, new gear" recostume — same rig, same proportions, so the two
  // heroes stay recognisable, but a different palette so the sequel doesn't look like the
  // first reel's footage recut with a new sky behind it.
  blazeSunrise: { body: "#FF7A3D", belly: "#FFF1DE", cape: "#0E7C7B", mask: "#1B2A2E" },
  sparkSunrise: { body: "#8B5CF6", belly: "#F1E9FF", cape: "#5B21B6", mask: "#241634" },
} as const;

export type HeroName = keyof typeof HERO_COLORS;

const INK = "#2A1418";
const SKIN = "#FFDBB0";

/** Measured off the paths below, same discipline every character in this series follows. */
export const HERO_BOX = { up: 210, down: 16, half: 110 };

export const Hero: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: HeroMood;
  name: HeroName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
  /** 0..1 — only meaningful with mood="entry". 0 is fully off-stage (the slide-in start), 1 is
   *  landed. Separate from `progress` (which drives the ARM gesture) so the slide and the pose
   *  can be timed independently — a burst-in needs to travel a real distance, not just gesture. */
  entryProgress?: number;
  /** how far off-stage (px, local units before `scale`) the slide starts from */
  entryDistance?: number;
}> = ({
  x,
  y,
  scale,
  mood,
  name,
  progress,
  frame,
  fps,
  facing = 1,
  phase = 0,
  entryProgress = 1,
  entryDistance = 420,
}) => {
  const t = frame / fps + phase;
  const M = HERO_COLORS[name];
  const F = facing;

  const slideEase = 1 - Math.pow(1 - Math.min(1, Math.max(0, entryProgress)), 3);
  const slideX = mood === "entry" ? -entryDistance * F * (1 - slideEase) : 0;

  // ---------------------------------------------------------------- the mood, as numbers
  // "worry" used to be a fixed 4° tilt — held for a long line (a beat with no bead move and
  // no console change) it read as a static frame, not a held pose. A slow uncertain head-shake
  // keeps it visibly alive without changing the silhouette enough to look like a new pose.
  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 7 : 0;
  const hunch = mood === "worry" ? 16 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const capeFlutter = Math.sin(t * 3.2) * 6 + (mood === "entry" ? (1 - slideEase) * 30 : 0);
  const capeFlare = mood === "entry" ? 1 - slideEase * 0.4 : mood === "cheer" ? 0.3 : 0;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // entry's own arm-fling uses the slide itself, not `progress` — the pose should already be
  // set by the time it lands, not gesture in separately afterward
  const entryGest = mood === "entry" ? slideEase : 0;

  return (
    <g transform={`translate(${x + slideX} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={8} rx={70} ry={14} fill="#000" opacity={0.18} />

      <g transform={`translate(0 ${-bounce + hunch * 0.3})`}>
        {/* ---------------------------------------------------------------- the cape, behind the body */}
        <g transform={`translate(0 -46) rotate(${capeFlutter * 0.3})`}>
          <path
            d={`M -30 -20 q ${-40 - capeFlare * 30} ${40 + capeFlare * 20} ${-24 - capeFlare * 16} ${100 + capeFlare * 40} q 30 14 60 0 q ${28 + capeFlare * 16} ${-14} ${24 + capeFlare * 16} ${-100 - capeFlare * 40} Z`}
            fill={M.cape}
          />
        </g>

        {/* ---------------------------------------------------------------- feet */}
        <path d="M -18 8 l -6 14 M -18 8 l 0 15" stroke={M.mask} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M 18 8 l 6 14 M 18 8 l 0 15" stroke={M.mask} strokeWidth={8} strokeLinecap="round" fill="none" />

        {/* ---------------------------------------------------------------- body — rounded, hero-suit belly panel */}
        <path
          d={`M -46 -${8 - hunch * 0.4} q -6 -52 22 -70 q 24 -14 48 0 q 28 18 22 70 q -46 10 -92 0 Z`}
          fill={M.body}
        />
        <path d="M 0 -62 q 22 4 26 42 q -13 26 -26 26 q -13 0 -26 -26 q 4 -38 26 -42 Z" fill={M.belly} opacity={0.92} />

        {/* ---------------------------------------------------------------- arm / gesture
             `point` extends one, `think` brings one to the chin, `cheer` raises both, `call`
             raises one to the head with a communicator, `entry` flings both wide. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const toEar = mood === "call" ? gest : 0;
          const fling = entryGest;

          const R = {
            x: 20 + 32 * out + 58 * up + 26 * toEar + 66 * fling,
            y: -8 - 178 * up - 16 * out - 96 * toEar - 40 * fling,
            rot: -16 * out + 22 * up - 30 * toEar - 50 * fling,
          };
          const L = {
            x: -20 - 18 * chin - 56 * up - 66 * fling,
            y: -8 - 40 * chin - 178 * up - 40 * fling,
            rot: -22 * up + 50 * fling,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 22;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={19} strokeLinecap="round" />;
          };
          const hand = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <circle cx={0} cy={0} r={13} fill={SKIN} />
            </g>
          );

          return (
            <g>
              {arm(-24, -50, L)}
              {arm(24, -50, R)}
              {hand(L)}
              {hand(R)}
              {/* the communicator, held to the head for "call" */}
              {mood === "call" && (
                <g transform={`translate(${R.x + 8} ${R.y - 8}) rotate(18)`} opacity={gest}>
                  <rect x={-9} y={-17} width={18} height={32} rx={5} fill={M.mask} />
                  <rect x={-6} y={-13} width={12} height={9} rx={2} fill="#8FD8E8" />
                </g>
              )}
            </g>
          );
        })()}

        {/* ---------------------------------------------------------------- head */}
        <g transform={`translate(0 -92) rotate(${headTilt})`}>
          {/* skull */}
          <ellipse cx={0} cy={0} rx={40} ry={38} fill={SKIN} />
          {/* the mask, over the eyes */}
          <path d="M -38 -8 q 38 -20 76 0 q -4 18 -38 18 q -34 0 -38 -18 Z" fill={M.mask} />
          {/* eyes, in the mask's cutouts */}
          {[-15, 15].map((cx) => (
            <circle key={cx} cx={cx} cy={-4} r={5} fill="#FFFFFF" />
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -26 -18 q 9 -6 16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
              <path d="M 26 -18 q -9 -6 -16 -1" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            </>
          )}
          {/* a simple smiling mouth */}
          <path d="M -12 18 q 12 10 24 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

/** A few quick speed-line streaks, trailing an "entry" hero mid-slide — drawn by the caller
 *  (a scene-level effect, not part of the body) so it can sit BEHIND the character in z-order. */
export const HeroSpeedLines: React.FC<{
  x: number;
  y: number;
  facing: -1 | 1;
  entryProgress: number;
  color: string;
}> = ({ x, y, facing, entryProgress, color }) => {
  if (entryProgress <= 0.02 || entryProgress >= 0.85) return null;
  const fade = Math.min(1, (1 - entryProgress) * 2.4);
  return (
    <g opacity={fade * 0.6}>
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={x + facing * (140 + i * 30)}
          y1={y - 40 + i * 30}
          x2={x + facing * (60 + i * 30)}
          y2={y - 40 + i * 30}
          stroke={color}
          strokeWidth={10 - i * 2}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
};
