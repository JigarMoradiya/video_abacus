// E11's character: a circus elephant.
//
// WHY AN ELEPHANT, and why it is not another mascot. Elephants carry things with their trunk —
// that is a visual fact about the animal, nothing to do with the script (which stays in plain
// math language throughout, per docs/E11_lines.txt's own note). But it hands the character a
// pose no earlier one has had: a trunk that visibly CURLS AROUND A BEAD AND LIFTS IT, played
// exactly on the beat the carry move happens. Rabbit (E07) has `stuck`; Monkey (E06) holds the
// instrument; neither has anything to do with its limbs on the beat a bead crosses from one rod
// to another. This one does.
//
// Six moods:
//   peek   — calm, standing, trunk swaying gently. The resting state, and the arrival.
//   stuck  — ears drooped flat, trunk hanging limp, head bowed. THE pose this episode's hook
//            exists for: the ones rod is completely full and there is nowhere left to push.
//   idea   — trunk snaps straight up, ears perk forward, a spark overhead. "There is another
//            rod" — the moment the tens rod is remembered.
//   show   — trunk reaches out towards the instrument, presenting whatever is being explained.
//   carry  — THE SIGNATURE POSE. The trunk curls into a loop around a small bead and lifts it,
//            timed to "push one lower bead up on the tens rod" / "carry one bead" — the carry
//            move made physical.
//   cheer  — trunk raised in a triumphant trumpet curve, mouth open, ears out. Answers only.
//
// Pose is a property of the MOOD, decided once per line and eased in across it — never a raw
// oscillation. The only sine in this file is a small idle sway, and it only ever moves a limb
// the mood has already decided to draw (DESIGN_SYSTEM's one-global-animation-layer rule, the
// same law Rabbit.tsx and Monkey.tsx follow).

import React from "react";
import { interpolate } from "remotion";

export type ElephantMood = "peek" | "stuck" | "idea" | "show" | "carry" | "cheer";

const HIDE = "#B9C3DE";
const HIDE_SHADE = "#98A4C4";
const HIDE_LIGHT = "#D2DAF0";
const OUTLINE = "#5C6788";
const INNER_EAR = "#F2A8C8";
const INK = "#241E3A";
const TUSK = "#FFF7E8";
const BLANKET = "#B8342E";
const BLANKET_SHADE = "#7A1E1A";
const TRIM = "#FFD23F";
const BEAD = "#FF57C0";
const BEAD_EDGE = "#95095F";

export const Elephant: React.FC<{
  /** frame-space point the elephant's FEET stand on */
  x: number;
  y: number;
  scale: number;
  mood: ElephantMood;
  /** 0..1 across the line, so a gesture lands with the words */
  progress: number;
  frame: number;
  fps: number;
  /** -1 faces left towards the abacus, +1 faces right */
  facing?: -1 | 1;
  /** how far the presenting/reaching trunk tip travels, in local units, POSITIVE towards the
   *  instrument */
  reach?: number;
  reachY?: number;
}> = ({ x, y, scale, mood, progress, frame, fps, facing = -1, reach: reachTo = 0, reachY = 0 }) => {
  const t = frame / fps;

  const stuck = mood === "stuck";
  const idea = mood === "idea";
  const showing = mood === "show";
  const carrying = mood === "carry";
  const cheering = mood === "cheer";

  // HEAD BOW. Level by default, dropped low on `stuck` — the whole animal sags, not just the
  // trunk. Eased in across the line so it settles rather than snapping.
  const bowTarget = stuck ? 1 : 0;
  const bow =
    interpolate(progress, [0, 0.3], [stuck ? 0.3 : 0, bowTarget], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) + Math.sin(t * 1.2) * 0.01;

  // EARS. Flat back on `stuck`, perked forward on `idea`, wide open on `cheer`, resting
  // otherwise. A single number 0 (drooped) .. 1 (resting) .. 2 (perked/wide) drives both ears.
  const earTarget = stuck ? 0 : idea || cheering ? 2 : 1;
  const ear =
    interpolate(progress, [0, 0.28], [stuck || idea ? 1 : earTarget, earTarget], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) + Math.sin(t * 1.6) * 0.02;

  // THE TRUNK, one curl per mood — this is the character. `trunkT` eases the pose in across
  // the line so it arrives rather than teleporting.
  const trunkT = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // reach: only on `show`, and only once the pose has arrived
  const reach = showing ? trunkT * Math.max(0, reachTo) : 0;
  const reachYAt = showing ? reachY : 0;

  // carry: the bead travels UP the trunk's curl as the pose arrives — the lift itself
  const liftT = carrying ? trunkT : 0;

  const bob = Math.sin(t * 1.5) * 3;
  const sway = stuck || carrying ? 0 : Math.sin(t * 1.1) * 4;
  const cheerT = cheering ? Math.abs(Math.sin(t * 4.6)) : 0;

  const bodyY = bob;

  // TRUNK PATH. Built per mood rather than interpolated point-by-point — a trunk is not a
  // straight limb that lerps cleanly, and each pose needs its own silhouette to read at a
  // glance. All paths start at the same base (the mouth, roughly 30,-6 in head-local space).
  const trunk = (() => {
    if (stuck) {
      // limp: hangs straight down and pools at the tip, bow-weighted so it drops further as
      // the head bows
      const droop = 34 + bow * 30;
      return {
        d: `M 30 -4 Q ${34 + sway * 0.3} ${18 + droop * 0.4} ${30 + sway} ${54 + droop} Q ${28 + sway} ${64 + droop} 36 ${66 + droop}`,
        tipX: 36 + sway,
        tipY: 66 + droop,
      };
    }
    if (idea) {
      // straight up, pointing — the "there is another rod" gesture
      const up = interpolate(trunkT, [0, 1], [10, 78]);
      return {
        d: `M 30 -4 Q ${18 - sway * 0.2} ${-20} ${10} ${-up}`,
        tipX: 10,
        tipY: -up,
      };
    }
    if (showing) {
      // reaches out towards the instrument
      const rx = interpolate(trunkT, [0, 1], [30, 30 + Math.max(24, reach)]);
      const ry = interpolate(trunkT, [0, 1], [40, reachYAt || 20]);
      return {
        d: `M 30 -4 Q ${34} ${14} ${rx} ${ry}`,
        tipX: rx,
        tipY: ry,
      };
    }
    if (carrying) {
      // curls into a loop that CLOSES around the bead — the signature pose
      const close = interpolate(trunkT, [0, 0.6], [0.15, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      const midX = interpolate(close, [0, 1], [50, 6]);
      const midY = interpolate(close, [0, 1], [20, -2]);
      const tipX = interpolate(close, [0, 1], [64, 26]);
      const tipY = interpolate(close, [0, 1], [46, -30]);
      return {
        d: `M 30 -4 Q ${52} ${8} ${midX} ${midY} Q ${8} ${-8} ${tipX} ${tipY}`,
        tipX,
        tipY,
        ballX: interpolate(close, [0, 1], [56, 16]),
        ballY: interpolate(liftT, [0, 1], [50, -8]),
      };
    }
    if (cheering) {
      // a trumpet curve, up and out
      const up = interpolate(trunkT, [0, 1], [10, 64]);
      return {
        d: `M 30 -4 Q ${46} ${-10} ${44} ${-up} Q ${42} ${-up - 14} ${52} ${-up - 10}`,
        tipX: 52,
        tipY: -up - 10,
      };
    }
    // peek — the resting curl, gently swaying
    return {
      d: `M 30 -4 Q ${40 + sway} ${20} ${32 + sway * 1.4} ${44} Q ${28 + sway} ${52} ${36 + sway} ${54}`,
      tipX: 36 + sway,
      tipY: 54,
    };
  })();

  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`}>
      <g transform={`translate(0 ${bodyY})`}>
        {/* shadow under the feet, so the animal sits ON the ground rather than floating */}
        <ellipse cx={0} cy={4} rx={58} ry={12} fill="#000" opacity={0.18} />

        {/* LEGS: two clearly separated PAIRS (front/back), not four evenly-spaced rects that
            fuse into one pedestal at small render sizes — a real gap down the middle, plus a
            small foot ellipse under each so it reads as "standing on feet", not "on pills". */}
        {[-38, -14, 16, 40].map((lx, i) => (
          <g key={i}>
            <rect
              x={lx - 10}
              y={-58}
              width={20}
              height={58}
              rx={9}
              fill={i % 2 === 0 ? HIDE_SHADE : HIDE}
              stroke={OUTLINE}
              strokeWidth={2}
            />
            <ellipse cx={lx} cy={2} rx={13} ry={6} fill={i % 2 === 0 ? HIDE_SHADE : HIDE} stroke={OUTLINE} strokeWidth={2} />
          </g>
        ))}

        {/* BODY: a big rounded barrel, the back higher than the belly so it has a silhouette
            rather than reading as a circle — and a real outline, so it reads as a shape against
            the world behind it instead of a soft-edged smudge. */}
        <ellipse cx={4} cy={-124} rx={64} ry={54} fill={HIDE} stroke={OUTLINE} strokeWidth={3} />
        <ellipse cx={-2} cy={-146} rx={50} ry={26} fill={HIDE_LIGHT} opacity={0.5} />

        {/* the little tufted tail */}
        <path d="M 66 -116 Q 90 -102 84 -82" stroke={HIDE_SHADE} strokeWidth={7} fill="none" strokeLinecap="round" />
        <circle cx={84} cy={-80} r={7} fill={HIDE_SHADE} stroke={OUTLINE} strokeWidth={1.5} />

        {/* the CIRCUS BLANKET — sits on the BACK, well below the head/neck line, so it never
            merges with the head silhouette the way it did when it reached the shoulders. */}
        <path
          d="M -42 -132 Q 4 -148 50 -132 L 46 -96 Q 4 -108 -38 -96 Z"
          fill={BLANKET}
          stroke={BLANKET_SHADE}
          strokeWidth={3}
        />
        <path d="M -42 -132 Q 4 -148 50 -132" stroke={TRIM} strokeWidth={6} fill="none" strokeLinecap="round" />
        {[-20, 4, 28].map((tx, i) => (
          <circle key={i} cx={tx} cy={-94} r={5} fill={TRIM} />
        ))}

        {/* HEAD, bowed low on `stuck` — pushed further up and clear of the body/blanket so a
            real neck gap separates the two silhouettes instead of them touching. */}
        <g transform={`translate(${34 + bow * -6} ${-198 + bow * 34}) rotate(${bow * 22})`}>
          {/* the neck: a short visible column joining head to body, so the head doesn't look
              like it's floating OR fused to the body */}
          <path d={`M -14 44 Q 4 ${64 + bow * 10} 18 84`} stroke={HIDE_SHADE} strokeWidth={30} strokeLinecap="round" fill="none" opacity={0.9} />

          {/* the far ear — a hint, so the animal reads as three-dimensional */}
          <ellipse cx={4} cy={2} rx={28} ry={30} fill={HIDE_SHADE} opacity={0.7} stroke={OUTLINE} strokeWidth={2} />

          {/* the NEAR EAR — huge and flappy, the single most elephant-y shape there is, in a
              visibly DARKER tone than the head so it separates instead of blending into it.
              `ear` 0 = drooped flat against the neck, 1 = resting, 2 = perked/spread wide. */}
          <g transform={`translate(-4 -6) rotate(${interpolate(ear, [0, 1, 2], [58, 4, -18])})`}>
            <path
              d="M -6 -6 C -54 -24 -74 18 -50 56 C -32 82 10 76 16 44 C 22 16 22 -2 -6 -6 Z"
              fill={HIDE_SHADE}
              stroke={OUTLINE}
              strokeWidth={3}
            />
            <path
              d="M -10 2 C -38 -6 -50 20 -34 46 C -22 62 2 56 6 34 C 10 18 10 6 -10 2 Z"
              fill={INNER_EAR}
              opacity={0.9}
            />
          </g>

          {/* HEAD shape: a rounded dome with a gentle forehead, cheeks and a soft chin, wide
              enough for the trunk to visibly grow out of it rather than sit pasted on — outlined
              so its edge holds even when it's the same base hue as everything behind it. */}
          <ellipse cx={0} cy={0} rx={40} ry={38} fill={HIDE} stroke={OUTLINE} strokeWidth={3} />
          <ellipse cx={-10} cy={-14} rx={28} ry={16} fill={HIDE_LIGHT} opacity={0.45} />

          {/* tusks — small cream curves, a circus elephant's smile-adjacent detail */}
          <path d="M 20 10 Q 32 16 30 28" stroke={TUSK} strokeWidth={7} fill="none" strokeLinecap="round" />

          {/* EYE — worried (a soft downward arc) when stuck, closed-happy on cheer, round
              otherwise */}
          {stuck ? (
            <path d="M 10 -14 Q 18 -8 26 -13" stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
          ) : cheering ? (
            <path d="M 8 -16 Q 17 -24 26 -16" stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx={17} cy={-15} rx={6.4} ry={7.2} fill={INK} />
              <circle cx={19.4} cy={-17.6} r={2.3} fill="#FFF" opacity={0.92} />
            </g>
          )}

          {/* mouth: open on cheer (trumpeting), a small closed line otherwise */}
          {cheering ? (
            <ellipse cx={26} cy={8} rx={8} ry={10} fill="#7A2A3A" />
          ) : (
            <path d="M 18 6 Q 26 10 32 4" stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
          )}

          {/* THE TRUNK — outlined, not just a same-colour stroke, so it reads as a limb against
              the head it grows out of instead of disappearing into it. */}
          <path d={trunk.d} stroke={OUTLINE} strokeWidth={21} fill="none" strokeLinecap="round" />
          <path d={trunk.d} stroke={HIDE} strokeWidth={15} fill="none" strokeLinecap="round" />
          {/* the trunk's underside wrinkles — three short dots along its length, so it reads
              as a trunk and not a hose */}
          {[0.3, 0.55, 0.8].map((f, i) => (
            <circle
              key={i}
              cx={trunk.tipX * f + 30 * (1 - f)}
              cy={trunk.tipY * f + -4 * (1 - f)}
              r={1.6}
              fill={HIDE_SHADE}
              opacity={0.6}
            />
          ))}

          {/* the carried bead — a little magenta bead, exactly what the abacus itself uses,
              riding the curl of the trunk as it lifts */}
          {carrying && "ballX" in trunk && trunk.ballX !== undefined && trunk.ballY !== undefined && (
            <g>
              <circle cx={trunk.ballX} cy={trunk.ballY + 4} r={13} fill="#000" opacity={0.18} />
              <circle cx={trunk.ballX} cy={trunk.ballY} r={13} fill={BEAD} stroke={BEAD_EDGE} strokeWidth={3} />
              <circle cx={trunk.ballX - 3.5} cy={trunk.ballY - 4} r={4} fill="#FFF" opacity={0.55} />
            </g>
          )}

          {/* the idea spark, over the head */}
          {idea && (
            <g
              transform={`translate(-4 ${-96}) scale(${interpolate(progress, [0.06, 0.3], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`}
            >
              <path d="M 0 -20 L 5.5 -5.5 L 20 0 L 5.5 5.5 L 0 20 L -5.5 5.5 L -20 0 L -5.5 -5.5 Z" fill={TRIM} />
            </g>
          )}
        </g>

        {/* FRONT LEGS FLOURISH on cheer — a little kick, drawn over the body so it reads as
            motion rather than a fifth leg */}
        {cheering && (
          <g>
            <path
              d={`M -36 -60 Q -50 ${-70 - cheerT * 10} -60 ${-52 - cheerT * 14}`}
              stroke={HIDE}
              strokeWidth={16}
              strokeLinecap="round"
              fill="none"
            />
            <circle cx={-60} cy={-52 - cheerT * 14} r={11} fill={HIDE} />
          </g>
        )}
      </g>
    </g>
  );
};
