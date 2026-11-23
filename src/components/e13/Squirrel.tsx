// E13's characters: TWO squirrels, best friends, in an autumn park.
//
// Same pair logic as E12's toucans — the episode is about friends that make ten, so the mascot is
// two characters who visibly interact — but a different animal and a different gesture, so the two
// episodes never look like one reskinned. ONE component rendered twice (`facing`/`phase`/marking).
//
// WHY A SQUIRREL. The animal's one unmistakable action is passing an ACORN: holding it out in two
// paws. That hands this episode its signature pose, `give` — one squirrel's inner paw reaches out
// with an acorn to its partner, exactly on the lines where the trick TRADES something (add the
// friend, take one from the tens rod). Toucans (E12) touch beaks; squirrels hand over acorns.
//
// Seven moods:
//   sit    — resting, paws tucked, tail up. The default.
//   wave   — one paw raised. Hello / goodbye.
//   think  — head tilted, paw at chin. Every ⏸ question.
//   worry  — ears flat, tail droops, head low. "We are stuck."
//   point  — one paw toward the abacus, presenting.
//   cheer  — both paws up, bouncing. Answers only.
//   give   — THE SIGNATURE POSE: the inner paw reaches toward the partner holding an acorn. With the
//            pair's `facing` set toward each other, it always reaches inward and the acorns meet.
//
// POSE IS KEYED TO THE MOOD, NEVER TO AN OSCILLATION (DESIGN_SYSTEM's one-global-animation-layer
// rule). The only sines here are an idle bob and a tail sway, on parts the mood already draws.

import React from "react";
import { interpolate } from "remotion";

export type SquirrelMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer" | "give";

export const MARKINGS = {
  rust: { fur: "#D8692E", furDark: "#A9481C", belly: "#FFE9CF", ear: "#F2A8A0" },
  cocoa: { fur: "#9A6A4A", furDark: "#6E4630", belly: "#F6E6D2", ear: "#E9B7A6" },
} as const;

export type MarkingName = keyof typeof MARKINGS;

const INK = "#2A1A12";
const ACORN = "#B97A3E";
const ACORN_CAP = "#6E4A2A";

/**
 * THE SQUIRREL'S REAL EXTENT, in local units, measured off the paths below. `y` is the ground
 * point the squirrel sits on. It reaches `up` above that (the tail tip / cheering paws), `down`
 * below (shadow), and `half` either side at its widest (the acorn at full `give` reach on the
 * front side; the tail plume on the back side is ~92).
 */
export const SQUIRREL_BOX = { up: 188, down: 16, half: 132 };

export const Squirrel: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: SquirrelMood;
  marking: MarkingName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right. A pair should face each other. */
  facing?: -1 | 1;
  /** de-synchronise the pair */
  phase?: number;
}> = ({ x, y, scale, mood, marking, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = MARKINGS[marking];
  const F = facing;

  const headTilt = mood === "think" ? -14 : mood === "worry" ? 12 : 0;
  const headDrop = mood === "worry" ? 16 : 0;
  const earFlat = mood === "worry" ? 1 : 0;
  const eyeOpen = mood === "worry" ? 0.55 : mood === "cheer" ? 0.55 : 1;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 1.6;
  const tailSway = Math.sin(t * (mood === "cheer" ? 5 : 1.6)) * (mood === "cheer" ? 9 : 4);
  const tailDroop = mood === "worry" ? 26 : 0;

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const up = mood === "cheer" ? gest : 0;
  const one = mood === "wave" ? gest : 0;
  const out = mood === "point" ? gest : 0;
  const reach = mood === "give" ? gest : 0;
  const chin = mood === "think" ? gest : 0;

  // front (inner) paw — the one that gives / points / waves
  const R = {
    x: 22 + 36 * out + 90 * reach + 10 * one + 26 * up,
    y: -54 - 10 * out - 22 * reach - 62 * one - 104 * up,
  };
  // back paw — chin in `think`, up in `cheer`
  const L = {
    x: 8 - 26 * up + 18 * chin,
    y: -52 - 104 * up - 50 * chin,
  };

  const arm = (sx: number, sy: number, e: { x: number; y: number }) => (
    <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.fur} strokeWidth={13} strokeLinecap="round" />
  );
  const paw = (e: { x: number; y: number }) => <ellipse cx={e.x} cy={e.y} rx={9} ry={8} fill={M.furDark} />;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={6} rx={60} ry={11} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* ---------------------------------------------------------------- the bushy tail, behind */}
        <g transform={`translate(-26 -24) rotate(${-8 + tailSway + tailDroop})`}>
          <path
            d="M 0 0 C -52 -6 -70 -60 -52 -112 C -40 -148 -6 -164 22 -150 C 2 -138 -8 -114 -4 -88 C 0 -52 -8 -24 0 0 Z"
            fill={M.fur}
          />
          <path
            d="M -10 -14 C -44 -24 -54 -70 -40 -108 C -32 -132 -12 -146 8 -144"
            stroke={M.furDark}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            opacity={0.55}
          />
        </g>

        {/* ---------------------------------------------------------------- haunch + feet */}
        <ellipse cx={-6} cy={-18} rx={34} ry={22} fill={M.furDark} />
        <ellipse cx={14} cy={2} rx={16} ry={6} fill={M.furDark} />

        {/* ---------------------------------------------------------------- body + belly */}
        <ellipse cx={4} cy={-52} rx={34} ry={44} fill={M.fur} />
        <ellipse cx={12} cy={-46} rx={18} ry={30} fill={M.belly} />

        {/* ---------------------------------------------------------------- paws */}
        {arm(4, -66, L)}
        {paw(L)}
        {arm(18, -68, R)}
        {paw(R)}
        {/* THE ACORN — only in `give`, held at the reaching paw's tip */}
        {mood === "give" && (
          <g transform={`translate(${R.x + 12} ${R.y - 4})`} opacity={0.4 + 0.6 * reach}>
            <ellipse cx={0} cy={4} rx={11} ry={13} fill={ACORN} />
            <path d="M -13 -2 Q 0 -14 13 -2 Q 0 2 -13 -2 Z" fill={ACORN_CAP} />
            <rect x={-1.5} y={-15} width={3} height={6} rx={1.5} fill={ACORN_CAP} />
          </g>
        )}

        {/* ---------------------------------------------------------------- head */}
        <g transform={`translate(10 ${-110 + headDrop}) rotate(${headTilt})`}>
          {/* ears — tufted, flatten on worry */}
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${sd * 13} -20) rotate(${sd * (8 + earFlat * 40)})`}>
              <path d="M 0 0 L -8 -26 L 9 -4 Z" fill={M.fur} />
              <path d="M 0 -3 L -4 -17 L 5 -5 Z" fill={M.ear} />
            </g>
          ))}
          <ellipse cx={0} cy={0} rx={27} ry={24} fill={M.fur} />
          {/* muzzle toward the front */}
          <ellipse cx={16} cy={7} rx={14} ry={11} fill={M.belly} />
          <ellipse cx={27} cy={4} rx={4.5} ry={3.8} fill={INK} />
          {/* cheeks */}
          <circle cx={6} cy={12} r={5} fill="#F28C7A" opacity={0.45} />
          {/* eye */}
          <circle cx={6} cy={-6} r={7} fill="#FFFFFF" />
          <ellipse cx={8} cy={-6} rx={4.2} ry={4.2 * eyeOpen} fill={INK} />
          {mood === "worry" && (
            <path d="M -2 -16 q 8 -5 16 0" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          )}
          {(mood === "cheer" || mood === "give") && (
            <path d="M 14 14 q 6 5 12 0" stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          )}
        </g>
      </g>
    </g>
  );
};
