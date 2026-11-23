// E08's characters: TWO puppies.
//
// WHY TWO, when every episode before this had one. This episode is about pairs — every small number
// has exactly one friend, and the pair is the unit of the idea. A single mascot pointing at a card
// that says "friends" is a character standing next to the subject; two characters who sit on
// opposite ends of a see-saw ARE the subject. E06's monkey and E07's rabbit could not have done it.
//
// It is ONE component rendered twice, with `side`, so a pair costs barely more than a single
// character: the drawing is mirrored, the colours differ, and everything else is shared.
//
// Six moods:
//   sit    — resting. Tail wagging, ears settling. The default.
//   wave   — one front paw up. Hello, and the "ready?" beats.
//   think  — head tilted, one ear cocked, a paw to the chin. Plays across every ⏸ hold, which is
//            the pose this episode needed most: eight times the narration asks a question and stops,
//            and a character that keeps grinning through the silence tells the child not to bother.
//   worry  — ears down, eyes wide. Exactly one beat: "Oh no. Zero?"
//   point  — front paw extended towards the instrument, presenting.
//   cheer  — both front paws up, bouncing. Answers only.
//
// POSE IS KEYED TO THE MOOD, NEVER TO AN OSCILLATION. E05's astronaut and E06's monkey both shipped
// with their structure keyed to |sin(t)|, which flickered them between two bodies twice a second.
// The oscillation here only ever moves things that are ALREADY drawn.

import React from "react";
import { interpolate } from "remotion";

export type PuppyMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer";

/** The two of them, so a caller cannot accidentally give both puppies the same coat. */
export const COATS = {
  cream: { fur: "#FFF0D6", shade: "#E8CFA8", patch: "#D9A55E", ear: "#C98B45" },
  cocoa: { fur: "#C98B5E", shade: "#A96C42", patch: "#7E4A28", ear: "#7E4A28" },
} as const;

export type CoatName = keyof typeof COATS;

const INK = "#3A2A1E";
const TONGUE = "#FF7E9B";
const NOSE = "#4A3326";

/**
 * THE PUPPY'S REAL EXTENT, in local units, measured off the paths below rather than guessed.
 *
 * `y` is the point the puppy SITS ON — the ground under its bottom. It reaches `up` above that and
 * `down` below (the shadow), and `half` either side at its widest, which is the ears when they are
 * raised, not the body.
 *
 * Measured, because a guessed box is the mistake that has cost this series the most time: E07's
 * rabbit box was a radius estimate and ran the character into the caption, and its formula card
 * declared 300 while drawing 364 and overflowed with every check green.
 */
export const PUPPY_BOX = { up: 200, down: 16, half: 104 };

export const Puppy: React.FC<{
  /** frame-space point the puppy sits on */
  x: number;
  y: number;
  scale: number;
  mood: PuppyMood;
  coat: CoatName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right. A pair should face each other. */
  facing?: -1 | 1;
  /** de-synchronise the pair: the second puppy gets a different phase so they never move as one body */
  phase?: number;
}> = ({ x, y, scale, mood, coat, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const C = COATS[coat];

  // ---------------------------------------------------------------- the mood, as numbers
  //
  // Each of these is a property of the MOOD. The only thing time does is add a little life on top.
  const earDrop = mood === "worry" ? 1 : mood === "think" ? 0.35 : 0;
  const headTilt = mood === "think" ? -13 : mood === "worry" ? 6 : 0;
  const eyeOpen = mood === "worry" ? 1.25 : mood === "cheer" ? 0.55 : 1;
  const mouthOpen = mood === "cheer" ? 1 : mood === "worry" ? 0.5 : 0;
  const bounce =
    mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 13 : Math.sin(t * 1.5) * 2.2;
  // the tail wags fast when happy, tucks when worried
  const wag =
    mood === "worry" ? -22 : Math.sin(t * (mood === "cheer" ? 11 : 5.2)) * (mood === "cheer" ? 34 : 20);

  // gestures ease in across the line so they land with the words rather than being up from frame 0
  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const F = facing;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      {/* the shadow stays put — it is on the ground, and the puppy is what moves */}
      <ellipse cx={0} cy={6} rx={62} ry={13} fill="#000" opacity={0.16} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* ---------------------------------------------------------------- tail */}
        <g transform={`translate(-44 -54) rotate(${wag})`}>
          <path d="M 0 0 q -26 -6 -34 -26 q 16 4 22 12 q 4 -10 12 -14 Z" fill={C.shade} />
        </g>

        {/* ---------------------------------------------------------------- back legs */}
        <ellipse cx={-30} cy={-16} rx={24} ry={19} fill={C.shade} />
        <ellipse cx={30} cy={-16} rx={24} ry={19} fill={C.shade} />

        {/* ---------------------------------------------------------------- body, sitting */}
        <path
          d="M -46 -8 q -6 -56 20 -74 q 26 -17 52 0 q 26 18 20 74 q -46 12 -92 0 Z"
          fill={C.fur}
        />
        {/* the chest blaze — what stops the body being one flat shape */}
        <path d="M 0 -80 q 17 20 15 52 q -15 7 -30 0 q -2 -32 15 -52 Z" fill="#FFFFFF" opacity={0.55} />


        {/* ---------------------------------------------------------------- head */}
        <g transform={`translate(0 -98) rotate(${headTilt})`}>
          {/* ears — floppy, and they DROP on worry. Drawn before the skull so they hang behind it. */}
          {[-1, 1].map((k) => (
            <path
              key={k}
              d={`M ${k * 36} -26 q ${k * 46} ${2 + earDrop * 10} ${k * 40} ${58 + earDrop * 40} q ${
                -k * 28
              } ${14 + earDrop * 10} ${-k * 44} ${-14 + earDrop * 8} Z`}
              fill={C.ear}
              transform={`rotate(${k * (Math.sin(t * 1.9 + (k > 0 ? 1 : 0)) * 4 + earDrop * 20)} ${k * 36} -26)`}
            />
          ))}

          {/* skull */}
          <ellipse cx={0} cy={0} rx={54} ry={48} fill={C.fur} />
          {/* the eye patch — the one asymmetric mark, so the two puppies read as individuals */}
          <ellipse cx={-22} cy={-6} rx={22} ry={20} fill={C.patch} opacity={0.5} />

          {/* eyes */}
          {[-20, 20].map((cx) => (
            <g key={cx}>
              <ellipse cx={cx} cy={-4} rx={9} ry={10 * eyeOpen} fill={INK} />
              <circle cx={cx + 3} cy={-8 * eyeOpen} r={3.2} fill="#FFFFFF" />
            </g>
          ))}
          {/* brows, worry only — two short strokes are the whole difference between concerned and blank */}
          {mood === "worry" && (
            <>
              <path d="M -32 -22 q 12 -8 22 -2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
              <path d="M 32 -22 q -12 -8 -22 -2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* muzzle, nose, mouth */}
          <ellipse cx={0} cy={20} rx={28} ry={20} fill="#FFFFFF" opacity={0.85} />
          <ellipse cx={0} cy={10} rx={11} ry={8.5} fill={NOSE} />
          <path
            d={`M 0 18 v 6 q -11 ${8 + mouthOpen * 4} -18 ${-1 + mouthOpen * 2} M 0 24 q 11 ${
              8 + mouthOpen * 4
            } 18 ${-1 + mouthOpen * 2}`}
            stroke={INK}
            strokeWidth={3.4}
            fill="none"
            strokeLinecap="round"
          />
          {/* tongue, on the open-mouth moods only */}
          {mouthOpen > 0.4 && (
            <ellipse cx={0} cy={32 + mouthOpen * 4} rx={9} ry={11 * mouthOpen} fill={TONGUE} />
          )}
        </g>

        {/* ---------------------------------------------------------------- front paws, IN FRONT OF THE HEAD
             `cheer` raises both, `wave` and `point` raise one, `think` brings one to the chin. The
             paw that is not doing anything rests on the ground, because a sitting dog does.

             POSITIONS ARE COMPUTED, NOT NESTED TRANSFORMS. A raised paw needs an ARM drawn to it,
             and an arm has to know where both ends are — with the paw's place buried in a transform
             the raised paws floated free of the body, which at any size reads as a mistake rather
             than as a style. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const one = mood === "wave" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;

          const R = {
            x: 22 + 34 * out + 26 * one + 48 * up,
            y: -6 - 150 * up - 96 * one - 18 * out,
            rot: -30 * one - 18 * out + 22 * up,
          };
          const L = {
            x: -22 - 22 * chin - 48 * up,
            y: -6 - 46 * chin - 150 * up,
            rot: -22 * up,
          };
          const r = 16;

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            // only when the paw has actually left its resting place
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 26;
            if (!lifted) return null;
            return (
              <line
                x1={sx}
                y1={sy}
                x2={e.x}
                y2={e.y}
                stroke={C.fur}
                strokeWidth={20}
                strokeLinecap="round"
              />
            );
          };
          const paw = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={r} ry={r * 0.88} fill={C.fur} stroke={C.shade} strokeWidth={3} />
              {/* toe beans — what makes a raised paw read as a PAW rather than a blob */}
              <ellipse cx={0} cy={r * 0.3} rx={r * 0.46} ry={r * 0.3} fill={C.shade} opacity={0.8} />
              <ellipse cx={-r * 0.4} cy={-r * 0.24} rx={r * 0.2} ry={r * 0.16} fill={C.shade} opacity={0.7} />
              <ellipse cx={r * 0.4} cy={-r * 0.24} rx={r * 0.2} ry={r * 0.16} fill={C.shade} opacity={0.7} />
            </g>
          );

          return (
            <g>
              {arm(-26, -54, L)}
              {arm(26, -54, R)}
              {paw(L)}
              {paw(R)}
            </g>
          );
        })()}

        {/* the thinking beat gets a visible question mark — the ⏸ holds are silent, so the only
            thing telling the child it is their turn to answer is the picture */}
        {mood === "think" && (
          <g
            transform={`translate(${44} ${-176 - Math.sin(t * 2.4) * 5}) scale(${F} 1) rotate(${
              Math.sin(t * 1.7) * 7
            })`}
            opacity={gest}
          >
            <text
              x={0}
              y={0}
              fontSize={54}
              fontWeight={700}
              fill="#FFFFFF"
              stroke={INK}
              strokeWidth={7}
              paintOrder="stroke"
              textAnchor="middle"
              fontFamily="Fredoka, sans-serif"
            >
              ?
            </text>
          </g>
        )}
      </g>
    </g>
  );
};
