// Code-drawn soroban. Geometry, the 1-heaven/4-earth layout and the place-value chip
// colours come from the app; the LOOK does not — see src/data/theme.ts for why.
//
// Beads are HEXAGONS, matching both the app's "poligon" artwork and the real soroban
// bead profile: flat top and bottom, tapered to a point at each side. Drawing them as
// ellipses (the first build) is what made the abacus read flat and pale.

import React from "react";
import { interpolate } from "remotion";
import { BEAD_HEX, RIG_WOOD, type RigPalette } from "../data/theme";
import { KID_FONT } from "../lib/fonts";
import {
  ABACUS_INNER_H,
  BEAD_H,
  BEAD_W,
  BEAM_H,
  FRAME_LW,
  FRAME_RADIUS,
  HEAVEN_H,
  PLACE_COLORS,
  ROD_PITCH,
} from "../data/tokens";

export interface RodState {
  /** 0-9. Rod 0 is the ones rod, i.e. the RIGHTMOST rod on screen. */
  value: number;
  /** The value this rod is coming FROM. Beads whose state is unchanged between `from`
   *  and `value` do not move at all — a real abacus never re-seats the whole rod to
   *  show the next number, it moves only the beads the sum requires. Defaults to
   *  `value`, i.e. already settled. */
  from?: number;
  /** 1 = full attention, ROD_DIM = present but not the subject. */
  focus?: number;
  /** Show the LOWER bead's value strip below this rod. */
  chipLower?: boolean;
  /** Show the UPPER bead's value strip above this rod. */
  chipUpper?: boolean;
  /**
   * NAME the place under the lower chip — "ones", "tens".
   *
   * Opt-in per rod, not derived from the index, so E04 (which also carries these chips) renders
   * exactly as it did. The chip says what a bead is WORTH; a child still has to be told that the
   * column with 10 under it is the one the narrator keeps calling "the tens rod".
   */
  placeName?: string;
}

export interface AbacusProps {
  rods: RodState[]; // index 0 = ones = rightmost
  /** Fractional bead travel, 0-1. 1 = settled. */
  settle?: number;
  highlight?: "frame" | "rods" | "beam" | "top" | "bottom" | null;
  scale?: number;
  /** Number the beads as the narration counts them.
   *  "upper" / "lower" label EVERY bead in that half (used while counting how many there
   *  are). "active" labels only the beads currently up, with what each contributes —
   *  which is what "one upper bead and two lower beads" needs. */
  /** Colours for the frame and the beads. Defaults to the wood rig E01 and E02 use. */
  palette?: RigPalette;
  count?: "upper" | "lower" | "active" | null;
  /** Show only the first N lower badges. Counting out loud reveals them one per spoken
   *  number — all four appearing at once says "four", not "one, two, three, four". */
  countLimit?: number;
  /**
   * Number the beads ADDED on this line rather than the whole raised group. On "one plus two"
   * the two being counted are the SECOND and THIRD beads, and labelling the first two put a
   * "1" on the bead that was the starting one — the child sees the wrong bead counted.
   * Pass the value the rod is coming FROM.
   */
  countFrom?: number;
  /** Restrict badges to one rod. "the lower beads can only make one to four" is about a single
   *  rod, and labelling all five put twenty numbers on screen. */
  countRod?: number;
  /**
   * Colour a bead by where it IS, not where it is going. A travelling bead used to flip to its
   * destination colour the instant it started moving, so mid-flight you saw an "on" bead
   * detached from the ones that had landed. Opt-in: E01 and E02 shipped with the old behaviour.
   */
  colorOnArrival?: boolean;
}

/** Hexagonal bead: flat top and bottom, pointed sides. */
const hexPath = (x: number, y: number, w: number, h: number): string => {
  const s = w * BEAD_HEX.shoulder;
  return [
    `M ${x} ${y + h / 2}`,
    `L ${x + s} ${y}`,
    `L ${x + w - s} ${y}`,
    `L ${x + w} ${y + h / 2}`,
    `L ${x + w - s} ${y + h}`,
    `L ${x + s} ${y + h}`,
    "Z",
  ].join(" ");
};

const Bead: React.FC<{
  x: number;
  y: number;
  on: boolean;
  shadow?: boolean;
  palette?: RigPalette;
}> = ({ x, y, on, shadow = true, palette: P = RIG_WOOD }) => (
  <g>
    {shadow && <path d={hexPath(x + 3, y + 6, BEAD_W, BEAD_H)} fill="#000" opacity={0.26} />}
    <path
      d={hexPath(x, y, BEAD_W, BEAD_H)}
      fill={`url(#${on ? "beadOn" : "beadOff"})`}
      stroke={on ? P.onEdge : P.offEdge}
      strokeWidth={3}
      strokeLinejoin="round"
    />
    {/* top facet, so the hexagon reads as a solid object rather than a flat tile */}
    <path
      d={`M ${x + BEAD_W * BEAD_HEX.shoulder} ${y + 3} L ${
        x + BEAD_W * (1 - BEAD_HEX.shoulder)
      } ${y + 3} L ${x + BEAD_W * (1 - BEAD_HEX.shoulder) - 10} ${y + BEAD_H * 0.34} L ${
        x + BEAD_W * BEAD_HEX.shoulder + 10
      } ${y + BEAD_H * 0.34} Z`}
      fill="#FFF"
      opacity={on ? 0.32 : 0.4}
    />
  </g>
);

export const Abacus: React.FC<AbacusProps> = ({
  rods,
  settle = 1,
  highlight = null,
  scale = 1,
  count = null,
  countLimit,
  countFrom,
  countRod,
  colorOnArrival,
  palette: P = RIG_WOOD,
}) => {
  // Rod count comes from the data: section 7a widens to 13 rods and must stay the same
  // component instance rather than mounting a second abacus.
  const n = rods.length;
  const innerW = n * ROD_PITCH;
  const innerH = ABACUS_INNER_H;
  const w = innerW + FRAME_LW * 2;
  const h = innerH + FRAME_LW * 2;

  // Dimming a named part must not erase the rig. At the tour's 0.15 the beads vanished
  // and the box read empty; at 0.6 the frame turned translucent and the whole abacus
  // looked like a ghost laid over the world. The frame is the container and never dims —
  // only its contents quiet, to 0.38, which stays legible on both bright and dark worlds.
  const dimFor = (part: "frame" | "rods" | "beam" | "top" | "bottom"): number => {
    if (part === "frame") return 1;
    if (highlight === null || highlight === part) return 1;
    return 0.38;
  };

  return (
    <svg
      width={w * scale}
      height={h * scale}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="beadOn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.onTop} />
          <stop offset="100%" stopColor={P.onBottom} />
        </linearGradient>
        <linearGradient id="beadOff" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.offTop} />
          <stop offset="100%" stopColor={P.offBottom} />
        </linearGradient>
        <linearGradient id="woodG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={P.woodLight} />
          <stop offset="55%" stopColor={P.wood} />
          <stop offset="100%" stopColor={P.woodDark} />
        </linearGradient>
      </defs>

      {/* drop shadow, so the rig sits ON the world rather than in it */}
      <rect x={8} y={14} width={w} height={h} rx={FRAME_RADIUS + 6} fill="#000" opacity={0.22} />

      <g opacity={dimFor("frame")}>
        <rect x={0} y={0} width={w} height={h} rx={FRAME_RADIUS + 6} fill="url(#woodG)" />
        <rect
          x={FRAME_LW * 0.55}
          y={FRAME_LW * 0.55}
          width={w - FRAME_LW * 1.1}
          height={h - FRAME_LW * 1.1}
          rx={FRAME_RADIUS}
          fill={P.panel}
          stroke={P.panelEdge}
          strokeWidth={4}
        />
      </g>

      <g transform={`translate(${FRAME_LW},${FRAME_LW})`}>
        {rods.map((rod, i) => {
          const col = n - 1 - i; // rod 0 (ones) is rightmost
          const cx = col * ROD_PITCH + ROD_PITCH / 2;
          const x = cx - BEAD_W / 2;
          const focus = rod.focus ?? 1;
          const prev = rod.from ?? rod.value;
          const heavenOn = rod.value >= 5;
          const heavenWasOn = prev >= 5;
          const earthUp = rod.value % 5;
          const earthWasUp = prev % 5;

          // Travel from where the bead ACTUALLY was to where it must end up. When the
          // heaven bead is already down (5 -> 8) both ends are the same value, so
          // interpolate returns a constant and the bead simply stays put.
          const heavenDownY = HEAVEN_H - BEAD_H;
          const heavenY = interpolate(settle, [0, 1], [
            heavenWasOn ? heavenDownY : 0,
            heavenOn ? heavenDownY : 0,
          ]);

          return (
            <g key={i} opacity={focus}>
              {/* the rod spans the FULL panel, top edge to bottom edge — on a real abacus
                  the rods are anchored into the frame. It used to stop 7 px short at each
                  end, leaving a visible gap between rod and frame. */}
              <rect
                x={cx - 6}
                y={-FRAME_LW * 0.55}
                width={12}
                height={innerH + FRAME_LW * 1.1}
                rx={6}
                fill={P.rod}
                opacity={dimFor("rods")}
              />

              <g opacity={dimFor("top")}>
                <Bead
                  x={x}
                  y={heavenY}
                  on={
                    colorOnArrival ? (settle >= 0.85 ? heavenOn : heavenWasOn) : heavenOn
                  }
                  shadow={focus === 1}
                  palette={P}
                />
                {(count === "upper" || (count === "active" && heavenOn)) &&
                  (countRod === undefined || i === countRod) &&
                  // `countFrom` says "label only the beads ADDED on this line", and it was
                  // filtering the lower beads only — so on "add one by pushing one more lower
                  // bead up" the lower 1 and 2 correctly disappeared while the heaven bead kept
                  // its 5. A line labels the whole group or none of it: with countFrom set, the
                  // heaven bead is labelled only if IT is one of the beads that moved.
                  //
                  // Note countFrom is a lower-bead INDEX (the previous count of raised lower
                  // beads), not the rod's previous value, so it says nothing about the heaven
                  // bead — whether that moved is `heavenOn !== heavenWasOn`.
                  (countFrom === undefined || heavenOn !== heavenWasOn) && (
                  <text
                    x={cx}
                    y={heavenY + BEAD_H * 0.72}
                    textAnchor="middle"
                    fill="#FFF"
                    fontSize={34}
                    fontWeight={700}
                    stroke="#000"
                    strokeWidth={0.8}
                  >
                    {count === "active" ? 5 : 1}
                  </text>
                )}
              </g>

              <g opacity={dimFor("bottom")}>
                {[0, 1, 2, 3].map((b) => {
                  const isUp = b < earthUp;
                  const wasUp = b < earthWasUp;
                  const top = HEAVEN_H + BEAM_H;
                  const yUp = top + b * BEAD_H;
                  const yDown = top + (b + 1) * BEAD_H;
                  // same rule as the heaven bead: only beads whose state changed move
                  const y = interpolate(settle, [0, 1], [
                    wasUp ? yUp : yDown,
                    isUp ? yUp : yDown,
                  ]);
                  // it counts as "on" once it has essentially arrived, not the moment it sets off
                  const shows = colorOnArrival ? (settle >= 0.85 ? isUp : wasUp) : isUp;
                  return (
                    <g key={b}>
                      <Bead x={x} y={y} on={shows} shadow={focus === 1} palette={P} />
                      {(count === "lower" || (count === "active" && isUp)) &&
                        // A badge on a bead that has not moved yet is both premature and, now that
                        // every moving bead carries an arrow up its middle, invisible underneath it.
                        // So a badge waits for its bead: already-raised beads keep theirs from the
                        // first frame, arriving ones get theirs as they land, by which time the
                        // arrow has faded. Gated on `colorOnArrival` so E01/E02 are untouched.
                        (!colorOnArrival || wasUp || settle >= 0.85) &&
                        (countRod === undefined || i === countRod) &&
                        (countFrom === undefined || b >= countFrom) &&
                        (countLimit === undefined ||
                          (countFrom === undefined ? b + 1 : b - countFrom + 1) <=
                            countLimit) && (
                        <text
                          x={cx}
                          y={y + BEAD_H * 0.72}
                          textAnchor="middle"
                          fill="#FFF"
                          fontSize={34}
                          fontWeight={700}
                          stroke="#000"
                          strokeWidth={0.8}
                        >
                          {countFrom === undefined ? b + 1 : b - countFrom + 1}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>

              {/* Free Mode draws TWO value strips, not one: the UPPER bead's value above
                  the rods and the LOWER bead's value below. Only the lower strip was
                  drawn here, so the video showed 1 / 10 / 100 and never 5 / 50 / 500. */}
              {/* Each strip appears only once the narration has stated that value —
                  both used to appear together, so "5" was on screen a line before the
                  video said the upper bead is worth five. */}
              {(rod.chipLower || rod.chipUpper) && (
                <g>
                  {[
                    { y: -FRAME_LW - 58, worth: 5 * Math.pow(10, i), show: rod.chipUpper },
                    { y: innerH + FRAME_LW + 12, worth: Math.pow(10, i), show: rod.chipLower },
                  ]
                    .filter((s) => s.show)
                    .map((s, k) => (
                    <g key={k}>
                      <rect
                        x={cx - ROD_PITCH / 2 + 5}
                        y={s.y}
                        width={ROD_PITCH - 10}
                        height={46}
                        rx={14}
                        fill={PLACE_COLORS[i]}
                        stroke="#FFF"
                        strokeWidth={3}
                      />
                      <text
                        x={cx}
                        y={s.y + 32}
                        textAnchor="middle"
                        fill="#FFF"
                        fontSize={s.worth >= 10000 ? 20 : s.worth >= 1000 ? 23 : 27}
                        fontWeight={700}
                        fontFamily={KID_FONT}
                      >
                        {s.worth}
                      </text>
                      </g>
                    ))}
                  {/* the place's NAME, under its worth chip */}
                  {rod.chipLower && rod.placeName && (
                    <text
                      x={cx}
                      y={innerH + FRAME_LW + 12 + 46 + 30}
                      textAnchor="middle"
                      fill={PLACE_COLORS[i]}
                      fontSize={26}
                      fontWeight={700}
                      fontFamily={KID_FONT}
                    >
                      {rod.placeName}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* beam last, so it sits above the beads */}
        <g opacity={dimFor("beam")}>
          {/* exactly BEAM_H tall — see the note on BEAM_H in tokens.ts */}
          <rect
            x={-FRAME_LW * 0.5}
            y={HEAVEN_H}
            width={innerW + FRAME_LW}
            height={BEAM_H}
            rx={BEAM_H / 2}
            fill={P.beam}
          />
          <rect
            x={-FRAME_LW * 0.5}
            y={HEAVEN_H + 1}
            width={innerW + FRAME_LW}
            height={4}
            rx={2}
            fill="#FFF"
            opacity={0.22}
          />
        </g>
      </g>
    </svg>
  );
};
