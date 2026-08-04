// Counting is climbing.
//
// E02's spine: four lower beads that go up one at a time, then a wall, then one bead worth
// five on its own. A ladder makes the ceiling visible BEFORE the narration names it — the
// child can see there is no fifth rung while the voice is still on four.
//
// Rung pitch is taken from the abacus geometry, not chosen, so the rungs line up with the
// bead rows they stand for. Rung 1 is the LOWEST: counting goes up, and rung 4 lands right
// against the beam, which is exactly where "four is as high as the lower beads can go".

import React from "react";
import { BEAD_H } from "../../data/tokens";
import { lowerBeadY, type AbacusBox } from "../../stage/geometry";

/** Y of rung k (1..4). k=4 sits against the beam. */
export const rungY = (box: AbacusBox, k: number): number =>
  lowerBeadY(box, 4.5 - k);

const RAIL = "#8D5A2B";
const RAIL_LIT = "#B4763C";

export const Ladder: React.FC<{
  box: AbacusBox;
  /** how many rungs have been climbed — lights rungs 1..lit */
  lit: number;
  /** 0..1 fade-in */
  progress: number;
  /** X of the ladder's centre */
  x: number;
  /** flash the empty space above rung 4 — the moment the ceiling is the point */
  showCeiling?: boolean;
  frame: number;
  fps: number;
}> = ({ box, lit, progress, x, showCeiling, frame, fps }) => {
  const s = box.scale;
  const halfW = 52 * s;
  const top = rungY(box, 4) - BEAD_H * s * 0.9;
  const bottom = rungY(box, 1) + BEAD_H * s * 0.9;
  const t = frame / fps;
  const appear = Math.max(0, Math.min(1, progress / 0.25));

  return (
    <g opacity={appear}>
      {/* rails, running a little past the top and bottom rungs */}
      {[-1, 1].map((side) => (
        <rect
          key={side}
          x={x + side * halfW - 7 * s}
          y={top}
          width={14 * s}
          height={bottom - top}
          rx={7 * s}
          fill={RAIL}
        />
      ))}

      {/* Empty air above the top rung. Dashed, so it reads as "nothing here" rather than
          as another rung — this is the wall the episode turns on. */}
      {showCeiling && (
        <g opacity={0.55 + 0.35 * Math.sin(t * 4)}>
          <line
            x1={x - halfW}
            y1={top - BEAD_H * s * 0.75}
            x2={x + halfW}
            y2={top - BEAD_H * s * 0.75}
            stroke="#C62828"
            strokeWidth={7 * s}
            strokeDasharray={`${16 * s} ${12 * s}`}
            strokeLinecap="round"
          />
          <text
            x={x}
            y={top - BEAD_H * s * 1.25}
            textAnchor="middle"
            fill="#C62828"
            fontSize={44 * s}
            fontWeight={700}
            fontFamily="Fredoka, sans-serif"
          >
            ✕
          </text>
        </g>
      )}

      {[1, 2, 3, 4].map((k) => {
        const on = k <= lit;
        const y = rungY(box, k);
        return (
          <g key={k}>
            <rect
              x={x - halfW}
              y={y - 6 * s}
              width={halfW * 2}
              height={12 * s}
              rx={6 * s}
              fill={on ? RAIL_LIT : RAIL}
            />
            {/* a lit rung gets a warm glow, so the count is readable at a glance */}
            {on && (
              <rect
                x={x - halfW - 6 * s}
                y={y - 13 * s}
                width={halfW * 2 + 12 * s}
                height={26 * s}
                rx={13 * s}
                fill="#FFC46B"
                opacity={0.42}
              />
            )}
            <text
              x={x - halfW - 26 * s}
              y={y + 12 * s}
              textAnchor="middle"
              fill={on ? "#3B2410" : "#8D7A63"}
              fontSize={34 * s}
              fontWeight={700}
              fontFamily="Fredoka, sans-serif"
            >
              {k}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export type BirdMood = "climb" | "shrug" | "ride" | "cheer";

/**
 * The episode's signature gag (EPISODE_RULES.md §1.2 — every episode needs one moment a
 * child would repeat out loud). She climbs one rung per bead; at four she looks up for a
 * fifth rung, finds nothing, and shrugs at camera; then the upper bead arrives and she
 * rides it down.
 */
export const Ladybird: React.FC<{
  box: AbacusBox;
  /** rung she is on, 1..4. 0 parks her at the foot of the ladder. */
  rung: number;
  mood: BirdMood;
  x: number;
  /** for "ride" and "cheer": an explicit Y, instead of sitting on a rung */
  rideY?: number;
  frame: number;
  fps: number;
}> = ({ box, rung, mood, x, rideY, frame, fps }) => {
  const s = box.scale;
  const t = frame / fps;
  const r = 26 * s;

  // "ride" and "cheer" both sit somewhere that is not a rung, so an explicit Y wins
  const y =
    (mood === "ride" || mood === "cheer") && rideY !== undefined
      ? rideY
      : rung >= 1
      ? rungY(box, rung) - r - 8 * s
      : rungY(box, 1) + r * 1.4;

  // She never sits still: a small hop on the rung, a lean when puzzled, a bounce when glad.
  const hop = mood === "cheer" ? Math.abs(Math.sin(t * 5)) * 16 * s : Math.sin(t * 2.2) * 3 * s;
  const lean =
    mood === "shrug" ? Math.sin(t * 1.6) * 12 : mood === "cheer" ? Math.sin(t * 6) * 10 : 0;
  const cy = y - hop;

  return (
    <g transform={`rotate(${lean} ${x} ${cy})`}>
      {/* legs */}
      {[-0.6, 0, 0.6].map((k, i) => (
        <line
          key={i}
          x1={x + k * r * 0.7}
          y1={cy + r * 0.6}
          x2={x + k * r * 0.9}
          y2={cy + r * 1.15 + Math.sin(t * 6 + i) * 2 * s}
          stroke="#22140A"
          strokeWidth={3.4 * s}
          strokeLinecap="round"
        />
      ))}
      {/* shell */}
      <ellipse cx={x} cy={cy} rx={r} ry={r * 0.86} fill="#E53935" />
      <path
        d={`M ${x} ${cy - r * 0.86} L ${x} ${cy + r * 0.86}`}
        stroke="#22140A"
        strokeWidth={3 * s}
      />
      {[
        [-0.45, -0.3],
        [0.45, -0.3],
        [-0.4, 0.35],
        [0.4, 0.35],
      ].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx * r} cy={cy + dy * r} r={r * 0.17} fill="#22140A" />
      ))}
      {/* head */}
      <circle cx={x} cy={cy - r * 0.82} r={r * 0.5} fill="#22140A" />
      <circle cx={x - r * 0.18} cy={cy - r * 0.92} r={r * 0.1} fill="#FFF" />
      <circle cx={x + r * 0.18} cy={cy - r * 0.92} r={r * 0.1} fill="#FFF" />
      {/* antennae */}
      {[-1, 1].map((side) => (
        <g key={side}>
          <line
            x1={x + side * r * 0.2}
            y1={cy - r * 1.2}
            x2={x + side * r * 0.45}
            y2={cy - r * 1.6}
            stroke="#22140A"
            strokeWidth={2.8 * s}
            strokeLinecap="round"
          />
          <circle cx={x + side * r * 0.45} cy={cy - r * 1.62} r={r * 0.1} fill="#22140A" />
        </g>
      ))}

      {/* THE gag: she looks up for a fifth rung and there isn't one */}
      {mood === "shrug" && (
        <text
          x={x + r * 1.3}
          y={cy - r * 1.1}
          fill="#C62828"
          fontSize={54 * s}
          fontWeight={700}
          fontFamily="Fredoka, sans-serif"
          opacity={0.7 + 0.3 * Math.sin(t * 3)}
        >
          ?
        </text>
      )}
      {mood === "cheer" && (
        <text
          x={x + r * 1.2}
          y={cy - r * 1.0}
          fill="#F57F17"
          fontSize={46 * s}
          fontFamily="Fredoka, sans-serif"
        >
          ★
        </text>
      )}
    </g>
  );
};
