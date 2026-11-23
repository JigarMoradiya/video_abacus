// E12's characters: TWO toucans, best friends, perched together.
//
// Same reason E08/E09/E10 each had a pair: recall is stronger when there is someone to recall
// WITH. This episode's whole subject is FRIEND PAIRS — five numbers that only work in twos — so
// the mascot has to be two characters who visibly interact, not one narrator plus a silent second
// body. It is ONE component rendered twice, with `facing`/`phase`, exactly like `Fox`/`Puppy`/
// `Seagull` — the drawing is mirrored, the beak colour differs, everything else is shared.
//
// WHY A TOUCAN. The bird's one unmistakable feature is a huge, brightly banded beak — a shape
// with nothing to do with the script (which stays in plain math language throughout, per
// docs/E12_lines.txt) but which hands the character something no earlier mascot had: two beaks
// that can TOUCH TIP TO TIP. That is this episode's signature pose, `highfive` — two friends
// touching beaks over the abacus on the exact line a pair is named or confirmed as friends. Fox
// (E10) has `buzz`, Elephant (E11) has `carry`; neither has a pose that is ABOUT the two characters
// touching each other. This one does, because this episode is about pairs, not about one animal
// acting on an object.
//
// Seven moods, echoing Fox's own seven:
//   perch    — resting on the branch, wings folded. The default.
//   wave     — one wing raised. Hello, and "ready" beats.
//   think    — head tilted, considering. Plays across every ⏸ hold, including "who is N's
//              friend?" — the toucan visibly working it out before answering.
//   worry    — head low, wings drooped. The ONE callback beat to E11's stuck moment — "do you
//              remember nine plus one? We pushed, and pushed, and there was nothing left."
//   point    — one wing extended towards the abacus, presenting.
//   cheer    — both wings up, bouncing. Answers only.
//   highfive — THE SIGNATURE POSE. The LOCAL "inner" wing reaches straight out toward wherever the
//              pair's partner stands, beak angled the same way — timed to every line that NAMES
//              a friend pair or confirms one ("so they are friends", "same trick, just flipped").
//              With the pair's `facing` set correctly (each toward the other), the inner wing
//              always reaches toward the partner, whichever side each bird stands on.
//
// POSE IS KEYED TO THE MOOD, NEVER TO AN OSCILLATION — same rule Fox/Puppy/Seagull/Elephant all
// follow (DESIGN_SYSTEM's one-global-animation-layer rule). The only sines in this file are a
// small idle bob and a wing-tip flutter, and both only ever move a part the mood has already
// decided to draw.

import React from "react";
import { interpolate } from "remotion";

export type ToucanMood = "perch" | "wave" | "think" | "worry" | "point" | "cheer" | "highfive";

/** The two of them, so a caller cannot accidentally give both toucans the same beak. */
export const MARKINGS = {
  sunrise: { beak: "#FF7A3D", beakTip: "#FFD23F", chest: "#FFF6E2", eyeSkin: "#2FE0C4" },
  citrus: { beak: "#FFC800", beakTip: "#FF7A3D", chest: "#FFF6E2", eyeSkin: "#FF9EC4" },
} as const;

export type MarkingName = keyof typeof MARKINGS;

const BODY = "#1E2224";
const BODY_LIGHT = "#33393C";
const INK = "#14171A";
const FOOT = "#FFC800";
const BRANCH = "#7A5230";

/**
 * THE TOUCAN'S REAL EXTENT, in local units, measured off the paths below — the lesson every
 * earlier mascot in this series cost time re-learning: measure it, do not guess it.
 *
 * `y` is the point the toucan STANDS ON (its feet, gripping the branch). It reaches `up` above
 * that (the raised beak tip in `cheer`/`highfive`) and `down` below (the branch + shadow), and
 * `half` either side at its widest (the beak, fully extended in `highfive`/`point`).
 */
export const TOUCAN_BOX = { up: 176, down: 20, half: 150 };

export const Toucan: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: ToucanMood;
  marking: MarkingName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right. A pair should face each other. */
  facing?: -1 | 1;
  /** de-synchronise the pair: the second toucan gets a different phase so they never move as one body */
  phase?: number;
}> = ({ x, y, scale, mood, marking, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = MARKINGS[marking];
  const F = facing;

  // ---------------------------------------------------------------- the mood, as numbers
  const headTilt = mood === "think" ? -14 : mood === "worry" ? 10 : 0;
  const headDrop = mood === "worry" ? 22 : 0;
  const eyeOpen = mood === "worry" ? 0.55 : mood === "cheer" ? 0.6 : 1;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 11 : Math.sin(t * 1.3) * 2;
  const wingFlutter = Math.sin(t * (mood === "cheer" ? 7 : 2)) * (mood === "cheer" ? 10 : 4);

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      {/* the branch they perch on */}
      <rect x={-96} y={2} width={192} height={12} rx={6} fill={BRANCH} />
      <ellipse cx={0} cy={20} rx={70} ry={12} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce - 6})`}>
        {/* ---------------------------------------------------------------- tail, square-ish, behind the body */}
        <g transform="translate(-30 -30) rotate(24)">
          <path d="M 0 0 L -12 -58 L 14 -50 L 10 4 Z" fill={BODY} />
        </g>

        {/* ---------------------------------------------------------------- feet, gripping the branch */}
        <path d="M -18 4 q -6 6 -10 2 M -18 4 q 2 8 -4 10" stroke={FOOT} strokeWidth={6} strokeLinecap="round" fill="none" />
        <path d="M 18 4 q 6 6 10 2 M 18 4 q -2 8 4 10" stroke={FOOT} strokeWidth={6} strokeLinecap="round" fill="none" />

        {/* ---------------------------------------------------------------- body — round, mostly black, cream chest */}
        <ellipse cx={0} cy={-46} rx={46} ry={54} fill={BODY} />
        <ellipse cx={4} cy={-38} rx={26} ry={34} fill={M.chest} opacity={0.95} />
        <ellipse cx={-14} cy={-84} rx={20} ry={16} fill={M.beakTip} opacity={0.9} />

        {/* ---------------------------------------------------------------- wings
             `cheer` raises both, `wave` raises one, `point` extends one toward the abacus,
             `worry` droops both, `highfive` reaches the LOCAL positive-x wing straight out to
             meet the partner (which, with facing set toward each other, always points inward). */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const one = mood === "wave" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const reach = mood === "highfive" ? gest : 0;
          const droop = mood === "worry" ? 1 : 0;

          const R = {
            x: 30 + 16 * one + 30 * up + 96 * reach + 18 * out,
            y: -60 - 60 * up - 40 * one - 30 * reach - 10 * out + 20 * droop + wingFlutter,
            rot: -18 * one + 30 * up + 58 * reach + 14 * out + 30 * droop,
          };
          const L = {
            x: -30 - 18 * out,
            y: -56 - 6 * out + 22 * droop - wingFlutter,
            rot: 12 * out - 24 * droop,
          };

          const wing = (sx: number, sy: number, e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${sx} ${sy})`}>
              <path
                d="M 0 0 q 30 4 34 30 q -18 -6 -34 -30 Z"
                fill={BODY_LIGHT}
                transform={`rotate(${e.rot}) translate(${e.x - sx} ${e.y - sy}) rotate(${-e.rot})`}
              />
            </g>
          );

          return (
            <g>
              {wing(-34, -54, L)}
              {wing(34, -54, R)}
            </g>
          );
        })()}

        {/* ---------------------------------------------------------------- head + the signature beak */}
        <g transform={`translate(2 ${-108 + headDrop}) rotate(${headTilt})`}>
          {/* skull */}
          <ellipse cx={0} cy={0} rx={26} ry={24} fill={BODY} />

          {/* eye — a bright skin patch is the toucan's other real-world tell */}
          <ellipse cx={-2} cy={-2} rx={13} ry={12} fill={M.eyeSkin} />
          <circle cx={-2} cy={-2} r={7.5} fill="#FFFFFF" />
          <ellipse cx={-2} cy={-2} rx={4.2} ry={4.2 * eyeOpen} fill={INK} />

          {/* THE BEAK — the biggest shape on the character on purpose, banded orange to yellow,
              reaching further forward (and, in `highfive`/`point`, angled up) than anything else. */}
          {(() => {
            const lift = mood === "highfive" || mood === "point" ? gest : 0;
            // RESTING beak is short on purpose — 48 units — so the pair's beaks do NOT touch
            // at idle, and `highfive` reaching out to +52 more (100 total) is the one moment
            // they visibly close the gap and meet, instead of permanently overlapping regardless
            // of mood (the bug an early version of this file had: a long resting beak made every
            // mood look like a beak-touch, so `highfive` never read as a distinct interaction).
            const reachLen = mood === "highfive" ? gest : 0;
            const len = 48 + reachLen * 52;
            return (
              <g transform={`translate(20 4) rotate(${-lift * 18})`}>
                <path
                  d={`M 0 -6 Q ${len * 0.86} ${-14 - lift * 6} ${len} 2 Q ${len * 0.86} ${10 + lift * 4} 0 14 Z`}
                  fill={M.beak}
                />
                <path
                  d={`M ${len * 0.46} -8 Q ${len * 0.82} -10 ${len} 2 Q ${len * 0.82} 8 ${len * 0.46} 10 Z`}
                  fill={M.beakTip}
                />
                <path d={`M 4 3 L ${len * 0.95} 3`} stroke={INK} strokeWidth={1.4} opacity={0.35} />
              </g>
            );
          })()}
        </g>
      </g>
    </g>
  );
};
