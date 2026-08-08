// E05's character: a small astronaut, floating.
//
// Deliberately NOT another creature and not another symbol. E02 had a ladybird, E03 had the plus
// sign as a person; a third animal or a third glyph is the "one episode reskinned" problem
// (EPISODE_RULES §2). An astronaut belongs to this episode's world, and it can do the one thing
// this episode needs a character to do: react to something being taken away.
//
// Four moods, and the third is the episode's own:
//   float  — drifting, watching
//   point  — one arm out towards the rod, for "push them back down"
//   catch  — cupped hands under the beam, catching the bead that just left
//   cheer  — both arms up after an answer
//
// `catch` is why it exists. Subtraction is the first thing in this series where something LEAVES,
// and a character that catches what leaves makes "away from the beam" a place rather than an
// absence.

import React from "react";
import { interpolate } from "remotion";

export type AstroMood = "float" | "point" | "catch" | "cheer";

const SUIT = "#F2F5FA";
const SUIT_SHADE = "#C6D0E0";
const TRIM = "#8A3EE0";
const VISOR = "#1E2740";
const VISOR_LIT = "#5CE1E6";

export const Astro: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: AstroMood;
  /** 0..1 across the line, so a gesture lands with the words rather than looping */
  progress: number;
  frame: number;
  fps: number;
  /** which way it faces: -1 looks left, +1 looks right */
  facing?: -1 | 1;
  /**
   * How far to REACH, in local units, towards the rod it is working on.
   *
   * Without this the character floated beside the abacus commenting on it, which is a bystander,
   * not a helper. On `point` the arm extends this far and the hand lands ON the bead; on `catch`
   * the cupped hands sit under it. `FingerHand` has always been allowed to cross the instrument for
   * the same reason, and the astronaut's guard box carries the same permission.
   */
  reach?: number;
}> = ({ x, y, scale, mood, progress, frame, fps, facing = -1, reach: reachTo = 0 }) => {
  const t = frame / fps;
  // weightless: a slow bob plus a slight roll, never still
  const bobY = Math.sin(t * 0.9) * 9;
  const roll = Math.sin(t * 0.6) * 5;

  // 0..1 of the way to the rod, eased so the hand arrives with the words rather than starting there
  const extend =
    mood === "point" || mood === "catch"
      ? interpolate(progress, [0, 0.32, 1], [0.12, 1, 0.94], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  // POSITIVE local x. The whole character is mirrored by `facing`, so a hand drawn at -x lands on
  // the screen's RIGHT — which is how the first version reached confidently away from the abacus.
  const reach = extend * Math.max(0, reachTo);
  // WHICH POSE is a property of the MOOD; how high the arms go is the oscillation.
  //
  // Both used to hang off `cheerT`, and |sin| touches zero twice a second — so on those frames the
  // raised arms vanished and the resting pose came back. The astronaut flickered between cheering
  // and floating for the whole of every answer beat. Same bug as E06's monkey, found there first and
  // never checked for here; a thumbnail rendered at frame 0 is what finally showed it, because
  // frame 0 is exactly a zero crossing.
  const cheering = mood === "cheer";
  const cheerT = cheering ? Math.abs(Math.sin(t * 4.5)) : 0;
  const cupped = mood === "catch";

  return (
    <g
      transform={`translate(${x},${y + bobY}) rotate(${roll}) scale(${scale * facing},${scale})`}
    >
      {/* backpack */}
      <rect x={-34} y={-18} width={26} height={54} rx={10} fill={SUIT_SHADE} />
      {/* body */}
      <rect x={-24} y={-16} width={48} height={58} rx={20} fill={SUIT} />
      <rect x={-24} y={16} width={48} height={10} fill={TRIM} opacity={0.85} />
      {/* legs, tucked as they would be with no gravity */}
      <rect x={-20} y={38} width={17} height={26} rx={8} fill={SUIT} />
      <rect x={4} y={38} width={17} height={26} rx={8} fill={SUIT} />
      <rect x={-21} y={58} width={19} height={11} rx={5} fill={TRIM} />
      <rect x={3} y={58} width={19} height={11} rx={5} fill={TRIM} />

      {/* arms — the mood lives here */}
      {cheering ? (
        [-1, 1].map((side) => (
          <g key={side}>
            <path
              d={`M ${side * 20} -4 Q ${side * 44} ${-26 - cheerT * 12} ${side * 40} ${-54 - cheerT * 14}`}
              stroke={SUIT}
              strokeWidth={15}
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={side * 40} cy={-56 - cheerT * 14} r={9} fill={TRIM} />
          </g>
        ))
      ) : cupped ? (
        <>
          {/* both hands out and cupped UNDER the bead that is leaving the beam */}
          <path
            d={`M 20 0 Q ${20 + reach * 0.5} 26 ${reach} 30`}
            stroke={SUIT}
            strokeWidth={15}
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={`M 18 -8 Q ${18 + reach * 0.5} 8 ${reach - 4} 6`}
            stroke={SUIT}
            strokeWidth={13}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={reach} cy={30} r={10} fill={TRIM} />
          <circle cx={reach - 4} cy={6} r={9} fill={TRIM} />
        </>
      ) : (
        <>
          {/* The near arm RESTS when it is not reaching. At reach = 0 this collapsed to a stub
              from (20,2) to (0,-12), hidden behind the body — which is why the character appeared to
              have one arm on every `float` line. A reach of zero is a pose, not an absence. */}
          <path
            d={
              reach > 1
                ? `M 20 2 Q ${20 + reach * 0.55} ${-6} ${reach} ${-12}`
                : "M 20 2 Q 38 18 30 34"
            }
            stroke={SUIT}
            strokeWidth={15}
            strokeLinecap="round"
            fill="none"
          />
          <circle cx={reach > 1 ? reach : 30} cy={reach > 1 ? -12 : 34} r={reach > 1 ? 10 : 9} fill={TRIM} />
          <path d="M -20 2 Q -38 18 -30 34" stroke={SUIT} strokeWidth={15} strokeLinecap="round" fill="none" />
          <circle cx={-30} cy={34} r={9} fill={TRIM} />
        </>
      )}

      {/* helmet last, so it sits over the shoulders */}
      <circle cx={0} cy={-32} r={34} fill={SUIT} />
      <circle cx={0} cy={-32} r={26} fill={VISOR} />
      {/* the visor catches the light, which is what makes it read as glass */}
      <ellipse cx={-9} cy={-40} rx={11} ry={7} fill={VISOR_LIT} opacity={0.55} />
      <circle cx={0} cy={-32} r={34} fill="none" stroke={TRIM} strokeWidth={4} />
    </g>
  );
};
