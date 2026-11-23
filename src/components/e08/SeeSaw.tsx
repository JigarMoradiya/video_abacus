// E08's teaching device: a see-saw that only balances when the two sides make five.
//
// This is the episode's whole argument as one object. "Every small number has a friend" is an idea a
// six-year-old can hold, but a spoken list of four numbers is four numbers, not two friendships —
// E07 learned that and answered it with two cards that snap together. A see-saw goes further,
// because it can be WRONG: put two and two on it and it tips, and the child sees that two's friend
// is not two without being told. A card cannot fail; a see-saw can, and a device that can fail is
// the only kind that teaches a rule rather than announcing one.
//
// It also carries the quiz beats. On "who is one's friend?" the left seat holds a 1 and the right
// holds a question mark, and the plank hangs down on the left — the picture states the problem
// during the ⏸ silence, which is the only thing on screen while the child is answering.
//
// The see-saw NEVER lies: the tilt is computed from the two numbers, so a wrong pair cannot
// accidentally render level.

import React from "react";
import { Easing, interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

/**
 * THE DEVICE'S REAL EXTENT, in local units, measured off the geometry below — not estimated.
 * `y` is the ground under the fulcrum; it reaches `up` above that and `half` either side.
 *
 * up: pivot 100 + the plank end's rise at full tilt (190·sin13° ≈ 43) + half a tile (38) + the
 * tile's lift off the plank (12) = 193, and the "= 5" seal sits at 184. Rounded to 200.
 */
export const SEESAW_NAT = { up: 200, down: 10, half: 232 };

const PLANK_HALF = 190;
const PIVOT_Y = -100;
const TILE = 76;
const MAX_TILT = 13;

const WOOD = "#E08A3C";
const WOOD_DARK = "#B4661F";
const FRAME = "#3F8E7E";
const FRAME_DARK = "#2C6B5E";
const INK = "#1C4A40";

/** A seat holds a number, a question mark, or nothing. */
export type Seat = number | "?" | null;

/** What the seat weighs when deciding which way the plank tips. A "?" weighs nothing — the side
 *  being asked about is the side that is UP, waiting to be filled. */
const weigh = (s: Seat): number => (typeof s === "number" ? s : 0);

export const SeeSaw: React.FC<{
  x: number;
  y: number;
  scale: number;
  left: Seat;
  right: Seat;
  /** 0..1 across the line, so the plank swings as the words land */
  progress: number;
  frame: number;
  fps: number;
  /** what the seats held on the LINE BEFORE, so the plank travels between states instead of jumping */
  prevLeft?: Seat;
  prevRight?: Seat;
  /** dim everything except this seat — for "who is one's friend?", where one side is the question */
  asking?: "left" | "right";
  /** Opt-in (Bead Buddies remake): darker seal and "?" so the text passes the contrast audit. */
  strong?: boolean;
  /**
   * Show the "= 5" seal.
   *
   * DERIVING THIS FROM THE NUMBERS WAS WRONG. The plank going level is a consequence of the two
   * seats and belongs to the physics; the FIVE is a thing the narration says, and on "one and four"
   * it has not been said yet. Deriving it printed the answer a full line before the word — the same
   * class of error as a celebration that fires on a line's first frame.
   */
  seal?: boolean;
}> = ({ x, y, scale, left, right, progress, frame, fps, prevLeft, prevRight, asking, seal = false, strong = false }) => {
  const t = frame / fps;

  /**
   * WHICH WAY IT TIPS, from the numbers alone.
   *
   * Level exactly when the two sides make five — that is the rule the device exists to show, so it
   * is the one condition hard-coded here. Everything else leans towards the heavier seat, and a
   * seat with nothing in it (or a "?") is the light one.
   */
  const tiltFor = (l: Seat, r: Seat): number => {
    const a = weigh(l);
    const b = weigh(r);
    if (l !== null && r !== null && typeof l === "number" && typeof r === "number" && a + b === 5) {
      return 0;
    }
    if (a === b) return 0;
    // positive tilt drops the RIGHT seat
    return b > a ? MAX_TILT : -MAX_TILT;
  };

  // eased, and it travels from the previous state — a plank that snaps between angles reads as a
  // glitch rather than as a see-saw
  const from = tiltFor(prevLeft ?? left, prevRight ?? right);
  const to = tiltFor(left, right);
  const k = interpolate(progress, [0, 0.42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  // a settled see-saw still breathes; a balanced one rocks a touch, which is what says "balanced"
  // rather than "frozen"
  const settle = Math.sin(t * 1.7) * (to === 0 ? 0.7 : 0.35);
  const tilt = from + (to - from) * k + settle;

  const balanced =
    typeof left === "number" && typeof right === "number" && left + right === 5;
  // the seal fades in only once it is level, and only after the swing has finished
  const sealOn = balanced && seal ? interpolate(k, [0.55, 1], [0, 1], { extrapolateLeft: "clamp" }) : 0;

  const rad = (tilt * Math.PI) / 180;
  const seat = (side: -1 | 1) => ({
    cx: side * PLANK_HALF * Math.cos(rad),
    cy: PIVOT_Y + side * PLANK_HALF * Math.sin(rad),
  });

  const tile = (s: Seat, side: -1 | 1) => {
    if (s === null) return null;
    const { cx, cy } = seat(side);
    const dim = asking ? ((asking === "left") === (side === -1) ? 1 : strong ? 0.88 : 0.5) : 1;
    const isQ = s === "?";
    // the tile sits ON the plank, so it lifts perpendicular to it rather than straight up
    const lift = TILE / 2 + 12;
    const ox = -Math.sin(rad) * lift;
    const oy = -Math.cos(rad) * lift;
    return (
      <g transform={`translate(${cx + ox} ${cy + oy}) rotate(${tilt})`} opacity={dim}>
        <rect
          x={-TILE / 2}
          y={-TILE / 2}
          width={TILE}
          height={TILE}
          rx={16}
          fill={isQ ? "#FFFFFF" : "#FFF6E4"}
          stroke={isQ ? (strong ? "#5B3FD0" : "#8E6BFF") : WOOD_DARK}
          strokeWidth={5}
        />
        <text
          x={0}
          y={0}
          fontFamily={KID_FONT}
          fontWeight={700}
          fontSize={46}
          fill={isQ ? (strong ? "#5B3FD0" : "#8E6BFF") : INK}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {String(s)}
        </text>
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx={0} cy={4} rx={110} ry={16} fill="#000" opacity={0.14} />

      {/* the fulcrum */}
      <path d={`M -52 0 L 0 ${PIVOT_Y + 8} L 52 0 Z`} fill={FRAME} />
      <path d={`M -52 0 L 0 ${PIVOT_Y + 8} L 0 0 Z`} fill={FRAME_DARK} opacity={0.55} />
      <rect x={-64} y={-8} width={128} height={12} rx={6} fill={FRAME_DARK} />

      {/* the plank */}
      <g transform={`translate(0 ${PIVOT_Y}) rotate(${tilt})`}>
        <rect x={-PLANK_HALF - 16} y={-11} width={(PLANK_HALF + 16) * 2} height={22} rx={11} fill={WOOD} />
        <rect x={-PLANK_HALF - 16} y={2} width={(PLANK_HALF + 16) * 2} height={9} rx={5} fill={WOOD_DARK} opacity={0.6} />
        {/* the handles, so it reads as a see-saw and not a plank on a wedge */}
        {[-1, 1].map((k2) => (
          <rect key={k2} x={k2 * (PLANK_HALF - 30) - 5} y={-34} width={10} height={26} rx={5} fill={WOOD_DARK} />
        ))}
      </g>
      <circle cx={0} cy={PIVOT_Y} r={11} fill={FRAME_DARK} />

      {tile(left, -1)}
      {tile(right, 1)}

      {/* THE SEAL: what the pair adds up to, shown only when it actually balances. This is the
          payoff of the whole device — the plank going level and a five appearing is the sentence
          "one and four make five" without the sentence. */}
      {sealOn > 0.01 && (
        <g transform={`translate(0 ${PIVOT_Y - 74}) scale(${0.86 + sealOn * 0.14})`} opacity={sealOn}>
          <rect x={-52} y={-30} width={104} height={60} rx={22} fill={strong ? "#A8340A" : "#F0741B"} />
          <text
            x={0}
            y={2}
            fontFamily={KID_FONT}
            fontWeight={700}
            fontSize={40}
            fill="#FFFFFF"
            textAnchor="middle"
            dominantBaseline="central"
          >
            = 5
          </text>
        </g>
      )}
    </g>
  );
};
