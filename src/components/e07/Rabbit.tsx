// E07's character: the magician's rabbit.
//
// WHY A RABBIT, and why it is not another mascot. This episode is about a TRICK, and a rabbit out of
// a hat is the only character that IS one. But the real reason is a pose none of the others could
// play: E07 is the first episode that FAILS on purpose — the sum runs out of beads and sits there
// stuck for four lines — and a character needs something to do during a failure. E02's ladybird,
// E03's plus sign, E05's astronaut and E06's monkey are all built to point, catch or cheer. None of
// them can be baffled.
//
// Five moods:
//   peek   — only the ears and eyes over the hat brim. The resting state, and the arrival.
//   stuck  — up to the shoulders, ears flat, one paw scratching its head. THE pose this episode
//            exists for: it plays across the beat where the beads have run out.
//   idea   — ears snap up, a sparkle. The moment the upper bead is remembered.
//   show   — out of the hat, one paw presenting whatever is being explained.
//   cheer  — both paws up. Answers only.
//
// The hat is drawn HERE rather than as scenery, because the rabbit's relationship to it is the whole
// character: it hides in it, gets stuck in it, and comes out of it.

import React from "react";
import { interpolate } from "remotion";

export type RabbitMood = "peek" | "stuck" | "idea" | "show" | "cheer";

const FUR = "#F3EAF2";
const FUR_SHADE = "#D8C7DA";
const INNER_EAR = "#F5A8C0";
const INK = "#3A2340";
const HAT = "#241533";
const HAT_LIT = "#2E1B40";
const BAND = "#C4284C";
const GOLD = "#FFD873";

export const Rabbit: React.FC<{
  /** frame-space point the HAT sits on — its brim centre */
  x: number;
  y: number;
  scale: number;
  mood: RabbitMood;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left towards the abacus, +1 faces right */
  facing?: -1 | 1;
  /** how far the presenting paw reaches, in local units, POSITIVE towards the instrument */
  reach?: number;
  reachY?: number;
  /** draw the hat. Off once the rabbit is fully out and standing elsewhere. */
  hat?: boolean;
}> = ({
  x,
  y,
  scale,
  mood,
  progress,
  frame,
  fps,
  facing = -1,
  reach: reachTo = 0,
  reachY = 0,
  hat = true,
}) => {
  const t = frame / fps;

  // HOW FAR OUT OF THE HAT. The mood decides it, and it eases in across the line so the rabbit
  // rises rather than appearing. `stuck` is deliberately mid-way: shoulders out, still in the hat.
  // STUCK HAS TO CLEAR THE HAT. At 0.52 the rabbit's shoulders were still below the brim, so the
  // scratching paw — the entire point of the pose — was hidden inside the hat and the mood read as
  // "peek" with different ears. The hat front covers 104 local units above the brim, and the paw
  // reaches about 32 above the body, so the body has to sit high enough to clear both.
  const target = mood === "peek" ? 0.18 : mood === "stuck" ? 0.84 : mood === "idea" ? 0.9 : 1;
  const rise =
    interpolate(progress, [0, 0.34], [Math.max(0, target - 0.22), target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) + Math.sin(t * 1.3) * 0.012;

  // POSE IS A PROPERTY OF THE MOOD, never of an oscillation. Keying a pose to |sin| is what made the
  // astronaut and the monkey flicker between two poses twice a second; the wobble below only ever
  // moves a limb that the pose has already decided to draw.
  const cheering = mood === "cheer";
  const stuck = mood === "stuck";
  const idea = mood === "idea";
  const showing = mood === "show";

  const bob = Math.sin(t * 1.6) * 3;
  const cheerT = cheering ? Math.abs(Math.sin(t * 4.4)) : 0;
  const scratch = stuck ? Math.sin(t * 5.5) * 7 : 0;
  // ears: up by default, FLAT when stuck, and they snap up on the idea
  const earLift = stuck ? -34 : idea ? interpolate(progress, [0, 0.22], [-20, 6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) : 0;

  const extend = showing
    ? interpolate(progress, [0, 0.32, 1], [0.12, 1, 0.95], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const reach = extend * Math.max(0, reachTo);

  // the body sits this far above the brim once fully out
  const bodyY = -70 - rise * 96 + bob;

  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`}>
      {/* the back of the hat, so the rabbit rises OUT of it */}
      {hat && <ellipse cx={0} cy={-104} rx={66} ry={17} fill="#160C1F" />}

      <g transform={`translate(0 ${bodyY})`}>
        {/* EARS. A rabbit's ear is not an oval — it is narrow at the base, widest two-thirds up, and
            it BENDS. Drawn as a path so it tapers, with the inner ear following the same curve
            slightly inset. This is most of what makes the silhouette read as a rabbit at all. */}
        {[-1, 1].map((side) => (
          <g
            key={side}
            transform={`translate(${side * 15} ${-30}) rotate(${side * (stuck ? 96 : 7) + (stuck ? 0 : earLift * side * 0.2)})`}
          >
            <path
              d="M 0 4 C -13 -14 -15 -52 -6 -78 C -2 -90 6 -90 10 -78 C 19 -52 15 -14 3 4 Z"
              fill={FUR}
              stroke={FUR_SHADE}
              strokeWidth={2.5}
            />
            <path
              d="M 1 -4 C -7 -18 -8 -48 -2 -68 C 0 -76 5 -76 7 -68 C 13 -48 11 -18 3 -4 Z"
              fill={INNER_EAR}
              opacity={0.9}
            />
          </g>
        ))}

        {/* HEAD. Rounded, but with CHEEKS — two fur puffs either side of a muzzle — because a plain
            circle with dots on it reads as a smiley, not an animal. The muzzle sits proud of the
            face, the nose is a soft triangle, and the mouth is the rabbit's split lip rather than a
            smile curve. */}
        <ellipse cx={0} cy={-8} rx={33} ry={30} fill={FUR} />
        {/* cheeks */}
        {[-1, 1].map((side) => (
          <ellipse key={side} cx={side * 21} cy={4} rx={16} ry={13} fill={FUR} />
        ))}
        {/* brow shading, so the face has a top and a front */}
        <ellipse cx={0} cy={-20} rx={26} ry={13} fill="#FFFFFF" opacity={0.5} />
        {/* muzzle */}
        <ellipse cx={0} cy={4} rx={17} ry={13} fill={FUR} />

        {/* eyes — closed to happy arcs on a cheer, wide otherwise */}
        {cheering ? (
          [-15, 15].map((ex) => (
            <path
              key={ex}
              d={`M ${ex - 7} -12 Q ${ex} -21 ${ex + 7} -12`}
              stroke={INK}
              strokeWidth={3.4}
              fill="none"
              strokeLinecap="round"
            />
          ))
        ) : (
          [-15, 15].map((ex) => (
            <g key={ex}>
              <ellipse cx={ex} cy={-13} rx={5.6} ry={6.4} fill={INK} />
              <circle cx={ex + 2} cy={-15.4} r={2.1} fill="#FFF" opacity={0.92} />
            </g>
          ))
        )}

        {/* NOSE: a soft triangle, and the SPLIT LIP under it — the two marks that say "rabbit"
            faster than anything except the ears. */}
        <path d="M -5.5 -1 L 5.5 -1 L 0 5 Z" fill={INNER_EAR} stroke="#D98BA4" strokeWidth={1.4} />
        <path
          d={
            stuck
              ? "M 0 5 L 0 10 M -7 13 L 7 13"
              : `M 0 5 L 0 10 M -8 ${10 + cheerT * 2} Q -4 ${15 + cheerT * 3} 0 10 Q 4 ${15 + cheerT * 3} 8 ${10 + cheerT * 2}`
          }
          stroke={INK}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
        />

        {/* whiskers, from the muzzle rather than the middle of the face */}
        {[-1, 1].map((side) =>
          [0, 1, 2].map((k) => (
            <line
              key={`${side}${k}`}
              x1={side * 13}
              y1={2 + k * 3}
              x2={side * 40}
              y2={-4 + k * 8}
              stroke={FUR_SHADE}
              strokeWidth={1.8}
              strokeLinecap="round"
              opacity={0.9}
            />
          ))
        )}

        {/* BODY: a pear, not a circle — narrower at the shoulders, wider at the haunches — with a
            paler chest so it has a front. The cotton tail sits behind it. */}
        <circle cx={26} cy={52} r={13} fill={FUR} stroke={FUR_SHADE} strokeWidth={2} />
        <path
          d="M 0 8 C 20 8 32 30 32 48 C 32 66 18 76 0 76 C -18 76 -32 66 -32 48 C -32 30 -20 8 0 8 Z"
          fill={FUR}
        />
        <ellipse cx={-2} cy={48} rx={19} ry={22} fill="#FFFFFF" opacity={0.55} />

        {/* PAWS. The scratching paw is the stuck pose and the reason this character exists. */}
        {cheering ? (
          [-1, 1].map((side) => (
            <g key={side}>
              <path
                d={`M ${side * 20} 20 Q ${side * 42} ${-6 - cheerT * 10} ${side * 38} ${-30 - cheerT * 12}`}
                stroke={FUR}
                strokeWidth={15}
                strokeLinecap="round"
                fill="none"
              />
              <circle cx={side * 38} cy={-32 - cheerT * 12} r={11} fill={FUR} />
            </g>
          ))
        ) : stuck ? (
          <>
            {/* ONE PAW UP AT THE EAR, SCRATCHING — the pose this whole character exists for.
                It has to end OUTSIDE the head: at (26,-32) the paw landed on the head's own edge, and
                since both are the same white it simply vanished. Out at (46,-50) it is clear of the
                skull, and the shade outline separates limb from face wherever they do meet. */}
            <path
              d={`M 20 16 Q ${54 + scratch} -18 ${46 + scratch} -48`}
              stroke={FUR}
              strokeWidth={14}
              strokeLinecap="round"
              fill="none"
            />
            <circle
              cx={46 + scratch}
              cy={-50}
              r={11}
              fill={FUR}
              stroke={FUR_SHADE}
              strokeWidth={3}
            />
            <path d="M -20 22 Q -36 36 -28 48" stroke={FUR} strokeWidth={14} strokeLinecap="round" fill="none" />
            <circle cx={-28} cy={50} r={10} fill={FUR} stroke={FUR_SHADE} strokeWidth={3} />
          </>
        ) : (
          <>
            <path
              d={
                reach > 1
                  ? `M -18 18 Q ${-18 - reach * 0.5} ${reachY * 0.45} ${-reach} ${reachY}`
                  : "M -18 18 Q -38 32 -32 50"
              }
              stroke={FUR}
              strokeWidth={14}
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={reach > 1 ? -reach : -32} cy={reach > 1 ? reachY : 52} r={10} fill={FUR} />
            <path d="M 18 20 Q 36 34 30 50" stroke={FUR} strokeWidth={14} strokeLinecap="round" fill="none" />
            <circle cx={30} cy={52} r={10} fill={FUR} />
          </>
        )}

        {/* the idea: a gold spark over the head, on the beat the upper bead is remembered */}
        {idea && (
          <g
            transform={`translate(0 ${-108}) scale(${interpolate(progress, [0.06, 0.3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })})`}
          >
            <path
              d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z"
              fill={GOLD}
            />
          </g>
        )}
      </g>

      {/* the front of the hat, drawn last so the rabbit is INSIDE it */}
      {hat && (
        <g>
          <rect x={-46} y={-104} width={92} height={92} rx={8} fill={HAT} />
          <rect x={-46} y={-58} width={92} height={22} fill={BAND} />
          <ellipse cx={0} cy={-12} rx={104} ry={22} fill={HAT_LIT} />
          <ellipse cx={0} cy={-16} rx={104} ry={20} fill={HAT} />
        </g>
      )}
    </g>
  );
};
