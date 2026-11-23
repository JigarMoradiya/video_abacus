// E09's characters: TWO seagulls, on the pier.
//
// Same reason E08 had a pair, not a mascot: the small friend is a RELATIONSHIP between two
// numbers, and a pair of characters can enact that relationship instead of narrating it. Here the
// relationship gets a literal joke on top — "so we call a friend" is not a metaphor for these two,
// it is an instruction, and the call box on the pier is who they are calling.
//
// It is ONE component rendered twice, with `side`, exactly like `Puppy` — the drawing is mirrored,
// the markings differ, everything else is shared.
//
// Eight moods — the six `Puppy` established, plus two new ones for the phone gag:
//   sit    — resting, wings folded. The default.
//   wave   — one wing up. Hello, and "ready" beats.
//   think  — head tilted, one wing to the chin. Plays across every ⏸ hold.
//   worry  — crest flat, eyes wide. The stuck beat — "there is nothing down here to take."
//   point  — one wing extended towards the instrument, presenting.
//   cheer  — both wings up, bouncing. Answers only.
//   call   — holding a wing-phone to its head, dialling. The FIRST "so we call a friend" only —
//            after that the gag is a quick ring, not a replay of the whole bit.
//   ring   — the OTHER gull, head snapping up, one wing raised as if a phone just rang beside it.
//            Answers `call` — they are always shown as a pair, never `call` alone.
//
// POSE IS KEYED TO THE MOOD, NEVER TO AN OSCILLATION — same rule as `Puppy`, for the same reason
// (E05's astronaut and E06's monkey both shipped with structure keyed to |sin(t)|, which flickered
// them between two bodies twice a second).

import React from "react";
import { interpolate } from "remotion";

export type SeagullMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer" | "call" | "ring";

/** The two of them, so a caller cannot accidentally give both gulls the same markings. */
export const MARKINGS = {
  grey: { body: "#F4F3EE", wing: "#B9C4CC", cap: "#8B98A3", beak: "#F0A23A" },
  cream: { body: "#FBF3E6", wing: "#E3C9A0", cap: "#C79E68", beak: "#F0A23A" },
} as const;

export type MarkingName = keyof typeof MARKINGS;

const INK = "#3A2A1E";
const EYE_RING = "#FFFFFF";

/**
 * THE GULL'S REAL EXTENT, in local units, measured off the paths below rather than guessed —
 * the lesson E07's rabbit and E08's puppy both cost time re-learning.
 *
 * `y` is the point the gull STANDS ON. It reaches `up` above that (a raised wing in `cheer`) and
 * `down` below (the shadow), and `half` either side at its widest.
 */
export const GULL_BOX = { up: 208, down: 14, half: 88 };

export const Seagull: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: SeagullMood;
  marking: MarkingName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right. A pair should face each other, or both face the instrument. */
  facing?: -1 | 1;
  /** de-synchronise the pair: the second gull gets a different phase so they never move as one body */
  phase?: number;
}> = ({ x, y, scale, mood, marking, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = MARKINGS[marking];
  const F = facing;

  // ---------------------------------------------------------------- the mood, as numbers
  const crestDrop = mood === "worry" ? 1 : mood === "think" ? 0.3 : 0;
  const headTilt = mood === "think" ? -12 : mood === "worry" ? 5 : mood === "call" ? 8 : 0;
  const eyeOpen = mood === "worry" ? 1.3 : mood === "cheer" ? 0.5 : mood === "ring" ? 1.2 : 1;
  const bounce =
    mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const bob = mood === "ring" ? Math.abs(Math.sin(t * 8)) * 10 : 0;
  const tailFlick = Math.sin(t * (mood === "cheer" ? 6 : 2.4)) * (mood === "cheer" ? 14 : 6);

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={6} rx={58} ry={12} fill="#000" opacity={0.15} />

      <g transform={`translate(0 ${-(bounce + bob)})`}>
        {/* ---------------------------------------------------------------- tail */}
        <g transform={`translate(-40 -50) rotate(${tailFlick})`}>
          <path d="M 0 0 q -22 -4 -30 -22 q 14 3 20 10 q 3 -8 10 -12 Z" fill={M.wing} />
        </g>

        {/* ---------------------------------------------------------------- feet */}
        <path d="M -14 4 l -6 12 M -14 4 l 0 13 M -14 4 l 8 11" stroke={M.beak} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d="M 14 4 l -6 12 M 14 4 l 0 13 M 14 4 l 8 11" stroke={M.beak} strokeWidth={3.5} strokeLinecap="round" fill="none" />

        {/* ---------------------------------------------------------------- body */}
        <path
          d="M -42 -6 q -6 -52 18 -70 q 24 -16 48 0 q 24 18 18 70 q -42 10 -84 0 Z"
          fill={M.body}
        />
        {/* the folded far wing, resting on the body */}
        <path d="M 6 -56 q 30 4 40 34 q -22 6 -40 -6 Z" fill={M.wing} opacity={0.85} />

        {/* ---------------------------------------------------------------- front wing / arm
             `cheer` raises both, `wave`/`point`/`call`/`ring` raise one. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const one =
            mood === "wave" ? gest : mood === "ring" ? Math.min(1, gest + 0.3) : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const toEar = mood === "call" ? gest : 0;

          // CHEER MUST CLEAR THE HEAD. The skull sits at local y=-92 with r~44, so its top edge is
          // near y=-132 — the first pass raised the wingtip only to y=-136, four units of daylight
          // that vanished at thumbnail scale and read as a stray mark grazing the head instead of a
          // raised wing. 178 clears it by a comfortable margin; the wider X spread (56, was 42)
          // splays the wings into a V instead of straight up beside the ears.
          const R = {
            x: 20 + 30 * out + 22 * one + 56 * up + 26 * toEar,
            y: -6 - 178 * up - 88 * one - 16 * out - 100 * toEar,
            rot: -26 * one - 16 * out + 24 * up - 30 * toEar,
          };
          const L = {
            x: -20 - 18 * chin - 56 * up,
            y: -6 - 40 * chin - 178 * up,
            rot: -24 * up,
          };
          const r = 15;

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 24;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.wing} strokeWidth={17} strokeLinecap="round" />;
          };
          const wingTip = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <path d="M 0 0 q 20 2 24 -18 q -10 22 -24 18 Z" fill={M.wing} />
            </g>
          );

          return (
            <g>
              {arm(-24, -50, L)}
              {arm(24, -50, R)}
              {wingTip(L)}
              {wingTip(R)}
              {/* the call gull's own wing-phone, held to its head */}
              {mood === "call" && (
                <g transform={`translate(${R.x + 10} ${R.y - 6}) rotate(20)`} opacity={gest}>
                  <rect x={-8} y={-16} width={16} height={30} rx={5} fill="#3A2A1E" />
                  <rect x={-5} y={-12} width={10} height={8} rx={2} fill="#8FD8E8" />
                </g>
              )}
            </g>
          );
        })()}

        {/* ---------------------------------------------------------------- head */}
        <g transform={`translate(0 -92) rotate(${headTilt})`}>
          {/* the crest — a small tuft that DROPS on worry, same job as the puppies' ears */}
          <path
            d={`M -8 ${-40 + crestDrop * 8} q 8 ${-14 + crestDrop * 10} 16 ${1 + crestDrop * 6}`}
            stroke={M.cap}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
          />

          {/* skull */}
          <ellipse cx={0} cy={0} rx={46} ry={40} fill={M.body} />
          {/* the cap — the one asymmetric marking, so the two gulls read as individuals */}
          <path d="M -40 -18 q 30 -24 60 -6 q -10 20 -30 18 q -20 2 -30 -12 Z" fill={M.cap} opacity={0.55} />

          {/* eyes */}
          {[-16, 16].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={11} fill={EYE_RING} />
              <ellipse cx={cx} cy={-2} rx={7} ry={7 * eyeOpen} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -28 -18 q 10 -6 18 -1" stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
              <path d="M 28 -18 q -10 -6 -18 -1" stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* the beak — orange, the one bright feature on the face */}
          <path d="M 20 6 q 26 4 30 14 q -14 6 -30 -2 Z" fill={M.beak} />
          <path d="M 20 6 q 26 4 30 14" stroke="#B36E10" strokeWidth={1.6} fill="none" opacity={0.5} />
        </g>

        {/* the ring gull's alert mark — a little sound burst, so the pair's phone gag reads even
            with only ONE of them visibly holding anything */}
        {mood === "ring" && (
          <g transform="translate(30 -150)" opacity={0.6 + Math.abs(Math.sin(t * 10)) * 0.4}>
            <path d="M 0 8 q 10 -14 0 -28" stroke="#3A2A1E" strokeWidth={3} fill="none" strokeLinecap="round" />
            <path d="M 8 12 q 16 -20 0 -40" stroke="#3A2A1E" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />
          </g>
        )}
      </g>
    </g>
  );
};
