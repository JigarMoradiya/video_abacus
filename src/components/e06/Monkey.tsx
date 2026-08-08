// E06's character: a monkey, SITTING ON A BRANCH, turned towards the abacus.
//
// The first version hung from the beam by one hand. It read badly for three reasons, all of which
// this rewrite is built around:
//
//   1. IT HUNG. A character dangling by one arm beside the instrument looks precarious, not helpful,
//      and it spent the whole episode swinging. Sitting on a branch is a settled pose — it is what a
//      monkey watching something actually does, and it gives the frame a second solid object.
//   2. IT FACED THE CAMERA. A front-facing character looks at the viewer; a side-on one looks at what
//      it is pointing at, and the child follows its gaze to the beads. The whole reason this episode
//      has a character is to direct attention at a rod.
//   3. IT HAD ONE ARM. The near arm was drawn and the far arm was not, so on every idle line the
//      monkey was visibly missing a limb.
//
// Now: side-on on its branch, near arm working the beads, far arm braced on the branch behind it,
// tail hanging over the front. Four moods:
//   sit   — settled, watching, tail swinging. The resting state.
//   point — near arm out at the bead being named.
//   hop   — a small hop along the branch, for the beat that moves from one rod to the other.
//   cheer — a jump on the branch with both arms up. Answers only.

import React from "react";
import { interpolate } from "remotion";

export type MonkeyMood = "sit" | "point" | "hop" | "cheer";

const FUR = "#A9713F";
const FUR_DARK = "#7E5128";
const FACE = "#F4D3A8";
const INK = "#3E2410";
const BRANCH = "#6E4B22";
const BRANCH_DARK = "#553A19";
const LEAF = "#4FB86A";

export const Monkey: React.FC<{
  /** frame-space point the monkey SITS on: the top of its branch */
  x: number;
  y: number;
  scale: number;
  mood: MonkeyMood;
  /** 0..1 across the line, so a reach lands with the words rather than looping */
  progress: number;
  frame: number;
  fps: number;
  /**
   * +1 draws it as authored — sitting on the right, facing LEFT towards the abacus. -1 mirrors the
   * whole figure for a character placed on the other side.
   *
   * The artwork is drawn facing left already (muzzle, working arm and feet all at negative local x),
   * so the default is +1 and NOT the mirrored -1 the first version used: mirroring sent the reaching
   * arm away from the instrument and swung the branch straight through it.
   */
  facing?: -1 | 1;
  /** how far the near hand reaches, in local units, POSITIVE towards the beads */
  reach?: number;
  /** vertical offset of the reaching hand, for a bead above or below the beam */
  reachY?: number;
  /** draw the branch it sits on. On for every mood — even the cheer, which is a jump OFF it. */
  branch?: boolean;
  /** the far arm is holding the abacus, so it is drawn behind it by `MonkeyHoldArm` instead */
  holding?: boolean;
}> = ({
  x,
  y,
  scale,
  mood,
  progress,
  frame,
  fps,
  facing = 1,
  reach: reachTo = 0,
  reachY = 0,
  branch = true,
  holding = false,
}) => {
  const t = frame / fps;
  // A settled character still breathes. Small vertical bob, and the tail keeps time.
  const bob = Math.sin(t * 1.2) * 3;
  const tailSwing = Math.sin(t * 0.9) * 12;

  // the hop: a single arc along the branch, landing before the line ends
  const hopT = mood === "hop" ? interpolate(progress, [0.1, 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) : 0;
  const hopY = mood === "hop" ? -Math.sin(hopT * Math.PI) * 54 : 0;
  const hopX = mood === "hop" ? -Math.sin(hopT * Math.PI) * 16 : 0;

  const extend =
    mood === "point"
      ? interpolate(progress, [0, 0.32, 1], [0.12, 1, 0.94], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;
  const reach = extend * Math.max(0, reachTo);
  // WHICH POSE is a property of the MOOD; how high the arms are is the oscillation. Keeping both on
  // `cheerT` was a real bug: |sin| touches zero twice a second, so on those frames the cheer arms
  // disappeared and the braced far arm came back — the monkey flickered between cheering and sitting,
  // and any frame near a zero crossing showed limbs from both poses at once.
  const cheering = mood === "cheer";
  const cheerT = cheering ? Math.abs(Math.sin(t * 4.2)) : 0;
  // CHEER IS A JUMP, ON the tree. The branch used to be switched off for this mood, so the monkey
  // simply floated — a character that was sitting on something a moment ago must still have the
  // something. Now it bounces off the branch with its arms up, which is what the note asked for and
  // reads as delight rather than levitation.
  const jumpY = cheering ? -cheerT * 46 : 0;

  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`}>
      {/* THE BRANCH, drawn first so the monkey sits ON it. It comes in from behind the character
          (screen right once mirrored) and ends under them, so it reads as a limb reaching out of the
          canopy rather than a bar floating in space. */}
      {branch && (
        <g>
          {/* It reaches out of the canopy on the FAR side and stops just under the monkey. It used to
              run 250 units the other way, straight across the abacus — scenery is not allowed over
              the instrument any more than a card is. */}
          <path
            d="M -46 14 Q 110 -2 300 12"
            fill="none"
            stroke={BRANCH}
            strokeWidth={26}
            strokeLinecap="round"
          />
          <path
            d="M -46 22 Q 110 6 300 20"
            fill="none"
            stroke={BRANCH_DARK}
            strokeWidth={9}
            strokeLinecap="round"
            opacity={0.55}
          />
          {/* a couple of leaves so the branch belongs to the jungle */}
          {[[150, 2], [246, 6]].map(([lx, ly], i) => (
            <g key={i} transform={`translate(${lx} ${ly}) rotate(${i ? 18 : -14})`}>
              <ellipse cx={0} cy={-16} rx={13} ry={26} fill={LEAF} />
              <path d="M 0 -40 L 0 6" stroke={BRANCH_DARK} strokeWidth={3} opacity={0.5} />
            </g>
          ))}
        </g>
      )}

      <g transform={`translate(${hopX} ${-46 + bob + hopY + jumpY})`}>
        {/* THE TAIL, and the third attempt at it. What was wrong each time is worth keeping:
              v1 — left the middle of the back at limb thickness and hung down across the branch, so
                   it read as a third leg.
              v2 — came off the rear and curled, but was two constant-width strokes (12 then 8), and
                   a tube of uniform thickness with a visible step in it still reads as a limb.
            A tail's whole silhouette is that it TAPERS, and an SVG stroke cannot taper. So this is a
            chain of circles along a Bezier spine with the radius falling from 7.6 to 1.6 — thick where
            it leaves the body, a point at the tip, smooth all the way. Drawn behind the torso, so the
            root is covered and it reads as growing out of the animal. */}
        {(() => {
          const sw = tailSwing;
          // spine: out of the rear, right and down, then up and back over into a curl
          const P = [
            { x: 6, y: 24 },
            { x: 54, y: 48 + sw * 0.3 },
            { x: 96 + sw, y: 30 },
            { x: 72 + sw, y: -6 },
          ];
          // DENSE ENOUGH TO OVERLAP. At 18 steps the circles stopped touching towards the tip and the
          // tail read as a dotted caterpillar; the spine is ~130 units, so 48 steps puts them ~2.7
          // apart against a minimum diameter of 4.4 — always overlapping, so the edge is continuous.
          const N = 48;
          return (
            <g>
              {Array.from({ length: N + 1 }, (_, i) => {
                const t2 = i / N;
                const u = 1 - t2;
                const bx =
                  u * u * u * P[0].x + 3 * u * u * t2 * P[1].x + 3 * u * t2 * t2 * P[2].x + t2 * t2 * t2 * P[3].x;
                const by =
                  u * u * u * P[0].y + 3 * u * u * t2 * P[1].y + 3 * u * t2 * t2 * P[2].y + t2 * t2 * t2 * P[3].y;
                // eased taper: stays full for a moment at the root, then narrows to a point
                const r = 2.2 + 5.6 * Math.pow(1 - t2, 1.35);
                return <circle key={i} cx={bx} cy={by} r={r} fill={FUR} />;
              })}
            </g>
          );
        })()}

        {/* FAR ARM, braced on the branch behind. Drawn before the body so it sits behind it — this
            is the arm that was missing, and it is what makes the pose read as "propped up".
            Suppressed when the monkey is HOLDING the abacus, because that arm is then drawn by
            `MonkeyHoldArm` in the slot behind the instrument. */}
        {!holding && !cheering && (
          <>
            <path
              d={`M 12 -6 Q ${40} ${16} ${44} ${44}`}
              fill="none"
              stroke={FUR_DARK}
              strokeWidth={12}
              strokeLinecap="round"
            />
            <circle cx={45} cy={46} r={8} fill={FUR_DARK} />
          </>
        )}

        {/* legs, folded on the branch, seen from the side */}
        <path d="M -6 26 Q -26 44 -34 40" fill="none" stroke={FUR} strokeWidth={15} strokeLinecap="round" />
        <ellipse cx={-38} cy={40} rx={13} ry={8} fill={FUR_DARK} />
        <path d="M 8 30 Q -8 48 -18 44" fill="none" stroke={FUR_DARK} strokeWidth={13} strokeLinecap="round" opacity={0.9} />

        {/* torso, leaning slightly towards the abacus */}
        <g transform="rotate(-6)">
          <ellipse cx={0} cy={0} rx={27} ry={33} fill={FUR} />
          <ellipse cx={-6} cy={4} rx={18} ry={24} fill={FACE} opacity={0.92} />
        </g>

        {/* NEAR ARM — the working one. Its hand lands exactly at (reach, reachY), which the caller
            sets to the bead's own position, so a point is a point AT something. */}
        {!cheering && (
          <>
            <path
              d={
                reach > 1
                  ? `M -14 -8 Q ${-14 - reach * 0.5} ${reachY * 0.45} ${-reach} ${reachY}`
                  : "M -14 -8 Q -34 10 -30 32"
              }
              fill="none"
              stroke={FUR}
              strokeWidth={13}
              strokeLinecap="round"
            />
            <circle
              cx={reach > 1 ? -reach : -30}
              cy={reach > 1 ? reachY : 34}
              r={9}
              fill={FUR_DARK}
            />
          </>
        )}

        {/* HEAD, in three-quarter profile facing the abacus. The muzzle leads, so the character is
            looking where it is pointing — a front-facing head looks at the viewer instead. */}
        <g transform="translate(-10 -46)">
          {/* far ear, small and behind */}
          <circle cx={20} cy={2} r={9} fill={FUR_DARK} />
          {/* near ear */}
          <circle cx={-16} cy={0} r={12} fill={FUR} />
          <circle cx={-16} cy={0} r={7} fill={FACE} opacity={0.85} />
          <circle cx={0} cy={0} r={25} fill={FUR} />
          {/* muzzle, pushed towards the abacus — this is the whole three-quarter read */}
          <ellipse cx={-12} cy={9} rx={19} ry={14} fill={FACE} />
          <ellipse cx={-2} cy={-9} rx={20} ry={10} fill={FACE} opacity={0.5} />
          {/* nostrils on the leading edge of the muzzle */}
          {[-19, -12].map((nx) => (
            <ellipse key={nx} cx={nx} cy={5} rx={2} ry={2.6} fill={INK} opacity={0.65} />
          ))}
          {/* eyes: the near one large, the far one narrowed by the turn of the head */}
          <g>
            <circle cx={-14} cy={-6} r={4.8} fill={INK} />
            <circle cx={-12.4} cy={-7.6} r={1.8} fill="#FFF" opacity={0.9} />
          </g>
          <g>
            <ellipse cx={4} cy={-6} rx={3.4} ry={4.4} fill={INK} />
            <circle cx={5.2} cy={-7.6} r={1.4} fill="#FFF" opacity={0.85} />
          </g>
          <path
            d={`M -22 ${13} Q -14 ${17 + cheerT * 4} -6 ${12}`}
            fill="none"
            stroke={INK}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        </g>

        {/* BOTH CHEER ARMS, drawn AFTER the head so neither is hidden behind it — and spread wider
            than the head is round. Drawn before it, the left arm disappeared into the skull and the
            pose read as one arm up plus a spare limb somewhere below. */}
        {cheering &&
          ([-1, 1] as const).map((side) => (
            <g key={side}>
              <path
                d={`M ${side * 14} -18 Q ${side * 46} ${-54 - cheerT * 12} ${side * 46} ${-88 - cheerT * 14}`}
                fill="none"
                stroke={FUR}
                strokeWidth={13}
                strokeLinecap="round"
              />
              <circle cx={side * 46} cy={-90 - cheerT * 14} r={9} fill={FUR_DARK} />
            </g>
          ))}
      </g>
    </g>
  );
};


/**
 * The monkey's far arm, reaching left to take hold of the abacus — drawn in SceneStage's `renderBehind`
 * slot so it passes BEHIND the instrument.
 *
 * That slot exists for this. Every other episode slot draws over the stage, so an arm placed in one
 * of them lay on top of the frame, which reads as a hand resting on a photograph rather than a hand
 * holding an object. Occlusion is the only thing that makes "holding" legible.
 *
 * Takes the monkey's own anchor and scale, so the shoulder lines up with the body drawn in front.
 */
export const MonkeyHoldArm: React.FC<{
  x: number;
  y: number;
  scale: number;
  frame: number;
  fps: number;
  /** how far left the hand reaches, in local units */
  reach: number;
  /** vertical offset of the hand from the shoulder, in local units */
  reachY?: number;
}> = ({ x, y, scale, frame, fps, reach, reachY = 0 }) => {
  const t = frame / fps;
  const bob = Math.sin(t * 1.2) * 3;
  return (
    <g transform={`translate(${x},${y + (-46 + bob)}) scale(${scale},${scale})`}>
      <path
        d={`M 8 -4 Q ${-reach * 0.45} ${reachY * 0.5 - 6} ${-reach} ${reachY}`}
        fill="none"
        stroke={FUR_DARK}
        strokeWidth={12}
        strokeLinecap="round"
      />
      <circle cx={-reach} cy={reachY} r={9} fill={FUR_DARK} />
    </g>
  );
};
