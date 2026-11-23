// NUMBER DETECTIVE's cast: TWO bear detectives — an EIGHTH distinct character pair for the
// Math Game Zone series (Ninja/dojo, Bo&Pip/gamezone ×2, Hero/HeroHQ ×2, Fox/bingo hall,
// Puppy/puzzle den, Seagull/sky islands all came before this one). A bear was picked on
// purpose, not at random: the real game's own mascot — confirmed from the user's gameplay
// screenshots — is a bear giving "Higher!"/"Lower!" mood bubbles, and the app's HOME screen
// mascot is a bear too. Recasting that same species as the reel's host pair ties the video
// straight back to a mascot parents will already recognize.
//
// Same rig discipline as `Fox`/`Puppy`/`Seagull`/`Hero`: one component, two palettes, mirrored
// by `facing`, pose keyed to mood (never to a bare oscillation).
//
// Six moods:
//   sit     — resting. The default.
//   point   — one paw out, presenting a clue.
//   think   — head tilted, one paw to the chin.
//   worry   — ears back, brows knit. The "too high/too low" miss beat.
//   cheer   — both paws up, bouncing. Correct-guess payoff only.
//   magnify — the signature detective gag: one paw holds a magnifying glass up in front of
//             an eye. Not a static prop — the glass has its own idle sway.

import React from "react";
import { interpolate } from "remotion";

export type BearMood = "sit" | "point" | "think" | "worry" | "cheer" | "magnify";

export const BEAR_COLORS = {
  cocoa: { body: "#A9682F", belly: "#F6DDB0", ear: "#7A4A20", paw: "#7A4A20" },
  slate: { body: "#7C8A94", belly: "#EDEFF0", ear: "#4E5A62", paw: "#4E5A62" },
} as const;

export type BearName = keyof typeof BEAR_COLORS;

const INK = "#3A281A";
const EYE_RING = "#FFFFFF";
const GLASS_RIM = "#C9A227";

/** Measured off the paths below, same discipline every character in this series follows. */
export const BEAR_BOX = { up: 205, down: 15, half: 96 };

export const Bear: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: BearMood;
  name: BearName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right */
  facing?: -1 | 1;
  phase?: number;
}> = ({ x, y, scale, mood, name, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = BEAR_COLORS[name];
  const F = facing;

  const earDrop = mood === "worry" ? 1 : 0;
  const headTilt = mood === "think" ? -12 : mood === "worry" ? 4 + Math.sin(t * 1.8) * 6 : mood === "magnify" ? 6 : 0;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const browKnit = mood === "worry" ? 1 : 0;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={8} rx={68} ry={14} fill="#000" opacity={0.17} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* ---------------------------------------------------------------- stub tail, behind */}
        <ellipse cx={-40} cy={-2} rx={16} ry={13} fill={M.body} opacity={0.9} />

        {/* ---------------------------------------------------------------- feet */}
        <path d="M -18 8 l -6 14 M -18 8 l 0 15" stroke={M.paw} strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d="M 18 8 l 6 14 M 18 8 l 0 15" stroke={M.paw} strokeWidth={8} strokeLinecap="round" fill="none" />

        {/* ---------------------------------------------------------------- body — stout, round */}
        <path d="M -50 -6 q -6 -54 24 -72 q 26 -14 52 0 q 30 18 24 72 q -50 10 -100 0 Z" fill={M.body} />
        <path d="M 0 -64 q 22 4 26 44 q -13 28 -26 28 q -13 0 -26 -28 q 4 -40 26 -44 Z" fill={M.belly} opacity={0.9} />

        {/* ---------------------------------------------------------------- paws / arms
             `cheer` raises both, `point` extends one, `think` brings one to the chin,
             `magnify` raises one holding the glass up in front of the face. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const lift = mood === "magnify" ? gest : 0;

          const R = {
            x: 20 + 30 * out + 56 * up + 34 * lift,
            y: -6 - 176 * up - 14 * out - 150 * lift,
            rot: -16 * out + 22 * up - 30 * lift,
          };
          const L = {
            x: -20 - 18 * chin - 54 * up,
            y: -6 - 40 * chin - 176 * up,
            rot: -22 * up,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 22;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={19} strokeLinecap="round" />;
          };
          const pawTip = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={15} ry={13} fill={M.paw} />
            </g>
          );

          return (
            <g>
              {arm(-24, -50, L)}
              {arm(24, -50, R)}
              {pawTip(L)}
              {mood !== "magnify" && pawTip(R)}
              {/* the magnifying glass itself, held at the raised paw, with a small idle sway
                  and a soft glint so it never sits as a dead prop */}
              {mood === "magnify" && (
                <g transform={`translate(${R.x} ${R.y}) rotate(${8 + Math.sin(t * 2.2) * 5})`} opacity={0.3 + lift * 0.7}>
                  <circle cx={0} cy={0} r={26} fill="rgba(255,255,255,0.28)" stroke={GLASS_RIM} strokeWidth={7} />
                  <line x1={18} y1={18} x2={38} y2={38} stroke={GLASS_RIM} strokeWidth={9} strokeLinecap="round" />
                  <circle cx={-8} cy={-9} r={7} fill="#FFFFFF" opacity={0.6} />
                </g>
              )}
            </g>
          );
        })()}

        {/* ---------------------------------------------------------------- head */}
        <g transform={`translate(0 -94) rotate(${headTilt})`}>
          {/* round ears */}
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${side * 30} ${-30 + earDrop * 4})`}>
              <circle cx={0} cy={0} r={17} fill={M.body} />
              <circle cx={0} cy={0} r={9} fill={M.ear} opacity={0.85} />
            </g>
          ))}

          {/* skull */}
          <ellipse cx={0} cy={0} rx={44} ry={40} fill={M.body} />

          {/* eyes */}
          {[-15, 15].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={10} fill={EYE_RING} />
              <circle cx={cx} cy={-2} r={6.2} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {browKnit > 0 && (
            <>
              <path d="M -26 -18 q 9 -6 16 -1" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
              <path d="M 26 -18 q -9 -6 -16 -1" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* muzzle — a pale rounded patch with a dark nose */}
          <ellipse cx={0} cy={14} rx={22} ry={17} fill={M.belly} />
          <ellipse cx={0} cy={7} rx={9} ry={6.5} fill={INK} />
          <path d="M -10 20 q 10 8 20 0" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};
