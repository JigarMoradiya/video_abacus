// E10's characters: TWO foxes, rival contestants on a game show.
//
// Same reason E08 had a pair and E09 had a pair: recall is stronger when there is someone to
// recall AGAINST. A single mascot can only nod along; a pair can race each other to the buzzer,
// which is the actual shape of a quiz. It is ONE component rendered twice, with `side`, exactly
// like `Puppy` and `Seagull` — the drawing is mirrored, the markings differ, everything else is
// shared.
//
// Seven moods — the six `Seagull`/`Puppy` established, plus one new one for this episode's own
// gag:
//   sit    — resting, tail down. The default.
//   wave   — one paw up. Hello, and "ready" beats.
//   think  — head tilted, one paw to the chin. Plays across every ⏸ hold, INCLUDING the
//            "what is N's friend?" question beats — this is the fox visibly working it out.
//   worry  — ears back, eyes wide. The stuck beat.
//   point  — one paw extended towards the wheel or the abacus, presenting.
//   cheer  — both paws up, bouncing. Answers only.
//   buzz   — one paw slamming down on a buzzer in front of it. This episode's own gag: not a
//            phone call, a BUZZ-IN — the literal shape of "quick, tell me the answer".
//
// POSE IS KEYED TO THE MOOD, NEVER TO AN OSCILLATION — same rule as `Puppy`/`Seagull`, for the
// same reason (E05's astronaut and E06's monkey both shipped with structure keyed to |sin(t)|,
// which flickered them between two bodies twice a second).

import React from "react";
import { interpolate } from "remotion";

export type FoxMood = "sit" | "wave" | "think" | "worry" | "point" | "cheer" | "buzz";

/** The two of them, so a caller cannot accidentally give both foxes the same markings. */
export const MARKINGS = {
  amber: { body: "#E8792C", belly: "#FFF3E0", ear: "#3A2318", paw: "#3A2318" },
  silver: { body: "#8B95A3", belly: "#F4F3EE", ear: "#3A2A22", paw: "#3A2A22" },
} as const;

export type MarkingName = keyof typeof MARKINGS;

const INK = "#3A2A1E";
const EYE_RING = "#FFFFFF";

/**
 * THE FOX'S REAL EXTENT, in local units, measured off the paths below — the lesson E07's rabbit,
 * E08's puppy and E09's gull all cost time re-learning: measure it, do not guess it.
 *
 * `y` is the point the fox STANDS ON. It reaches `up` above that (a raised paw in `cheer`) and
 * `down` below (the shadow), and `half` either side at its widest.
 */
export const FOX_BOX = { up: 200, down: 14, half: 92 };

export const Fox: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: FoxMood;
  marking: MarkingName;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left, +1 faces right. A pair should face each other, or both face the game. */
  facing?: -1 | 1;
  /** de-synchronise the pair: the second fox gets a different phase so they never move as one body */
  phase?: number;
}> = ({ x, y, scale, mood, marking, progress, frame, fps, facing = 1, phase = 0 }) => {
  const t = frame / fps + phase;
  const M = MARKINGS[marking];
  const F = facing;

  // ---------------------------------------------------------------- the mood, as numbers
  const earDrop = mood === "worry" ? 1 : mood === "think" ? 0.25 : 0;
  const headTilt = mood === "think" ? -12 : mood === "worry" ? 5 : mood === "buzz" ? 6 : 0;
  const eyeOpen = mood === "worry" ? 1.3 : mood === "cheer" ? 0.5 : mood === "buzz" ? 1.15 : 1;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 4.6)) * 12 : Math.sin(t * 1.4) * 2;
  const tailWag = Math.sin(t * (mood === "cheer" ? 6 : 2.2)) * (mood === "cheer" ? 16 : 7);

  const gest = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <g transform={`translate(${x} ${y}) scale(${scale * F} ${scale})`}>
      <ellipse cx={0} cy={6} rx={62} ry={13} fill="#000" opacity={0.15} />

      <g transform={`translate(0 ${-bounce})`}>
        {/* ---------------------------------------------------------------- tail, bushy, behind the body */}
        <g transform={`translate(-46 -44) rotate(${18 + tailWag})`}>
          <path
            d="M 0 0 q -34 -6 -42 -34 q -14 22 4 46 q 18 20 44 12 q -10 -12 -6 -24 Z"
            fill={M.body}
          />
          <path d="M -34 -30 q -8 12 2 26" stroke={M.belly} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
        </g>

        {/* ---------------------------------------------------------------- feet */}
        <path d="M -16 6 l -5 12 M -16 6 l 6 12" stroke={M.paw} strokeWidth={7} strokeLinecap="round" fill="none" />
        <path d="M 16 6 l -6 12 M 16 6 l 5 12" stroke={M.paw} strokeWidth={7} strokeLinecap="round" fill="none" />

        {/* ---------------------------------------------------------------- body, with a cream belly wedge */}
        <path d="M -44 -4 q -6 -50 20 -66 q 24 -14 48 0 q 26 16 20 66 q -44 8 -88 0 Z" fill={M.body} />
        <path d="M 0 -60 q 20 4 24 40 q -12 26 -24 26 q -12 0 -24 -26 q 4 -36 24 -40 Z" fill={M.belly} opacity={0.9} />

        {/* ---------------------------------------------------------------- front paw / arm
             `cheer` raises both, `wave`/`point` raise one, `think` brings one to the chin,
             `buzz` slams one down and forward onto the buzzer. */}
        {(() => {
          const up = mood === "cheer" ? gest : 0;
          const one = mood === "wave" ? gest : 0;
          const out = mood === "point" ? gest : 0;
          const chin = mood === "think" ? gest : 0;
          const slam = mood === "buzz" ? gest : 0;

          // CHEER MUST CLEAR THE HEAD — same measured fix E09's gull needed. Skull sits at local
          // y=-88, r~42, top edge near y=-128; 174 clears it with margin to spare.
          const R = {
            x: 18 + 28 * out + 20 * one + 54 * up + 30 * slam,
            y: -4 - 174 * up - 84 * one - 14 * out + 58 * slam,
            rot: -24 * one - 14 * out + 22 * up - 50 * slam,
          };
          const L = {
            x: -18 - 16 * chin - 52 * up,
            y: -4 - 38 * chin - 174 * up,
            rot: -22 * up,
          };

          const arm = (sx: number, sy: number, e: { x: number; y: number }) => {
            const lifted = Math.hypot(e.x - sx, e.y - sy) > 22;
            if (!lifted) return null;
            return <line x1={sx} y1={sy} x2={e.x} y2={e.y} stroke={M.body} strokeWidth={18} strokeLinecap="round" />;
          };
          const pawTip = (e: { x: number; y: number; rot: number }) => (
            <g transform={`translate(${e.x} ${e.y}) rotate(${e.rot})`}>
              <ellipse cx={0} cy={0} rx={15} ry={12} fill={M.paw} />
            </g>
          );

          return (
            <g>
              {arm(-22, -48, L)}
              {arm(22, -48, R)}
              {pawTip(L)}
              {pawTip(R)}
              {/* the buzzer itself — a bright button the paw slams onto */}
              {mood === "buzz" && (
                <g transform={`translate(${R.x + 6} ${R.y + 16})`} opacity={0.5 + slam * 0.5}>
                  <ellipse cx={0} cy={6} rx={22} ry={8} fill="#3A2A1E" opacity={0.4} />
                  <ellipse cx={0} cy={0} rx={20} ry={9} fill="#B02F53" />
                  <ellipse cx={0} cy={-2} rx={14} ry={6} fill="#FF6B8A" />
                </g>
              )}
            </g>
          );
        })()}

        {/* ---------------------------------------------------------------- head */}
        <g transform={`translate(0 -88) rotate(${headTilt})`}>
          {/* ears — triangular, dropping flat on worry */}
          {[-1, 1].map((side) => (
            <g key={side} transform={`translate(${side * 26} ${-30}) rotate(${side * (10 + earDrop * 26)})`}>
              <path d="M 0 0 L -14 -34 L 16 -8 Z" fill={M.body} />
              <path d="M 0 -4 L -9 -24 L 9 -10 Z" fill={M.ear} opacity={0.85} />
            </g>
          ))}

          {/* skull */}
          <ellipse cx={0} cy={0} rx={42} ry={38} fill={M.body} />

          {/* eyes */}
          {[-14, 14].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy={-2} r={10} fill={EYE_RING} />
              <ellipse cx={cx} cy={-2} rx={6.4} ry={6.4 * eyeOpen} fill={INK} />
            </g>
          ))}
          {/* brows, worry only */}
          {mood === "worry" && (
            <>
              <path d="M -24 -16 q 9 -6 16 -1" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
              <path d="M 24 -16 q -9 -6 -16 -1" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
            </>
          )}

          {/* snout — a pale triangular muzzle with a dark nose tip */}
          <path d="M -14 8 q 14 4 28 0 q -2 16 -14 20 q -12 -4 -14 -20 Z" fill={M.belly} />
          <ellipse cx={0} cy={22} rx={7} ry={5} fill={INK} />
        </g>
      </g>
    </g>
  );
};
