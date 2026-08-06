// The celebration layer: what happens when the child gets it right.
//
// It was missing from the whole of E03, and that is a content bug rather than a polish one.
// Eight times in this episode a sum resolves — "so, one plus two is three" — and every one of
// them looked exactly like the line before it. The app rewards a correct answer with a burst;
// a lesson video that never rewards anything teaches that being right is unremarkable.
//
// Two kinds:
//   burst  — a one-shot pop on an answer line: a ring, rays, and confetti thrown outward from
//            the abacus, all of it over in about half the line so the caption still reads
//   party  — sustained fall for the two big beats ("Great job", and the close)
//
// Every particle's position is a pure function of `progress` and `frame`, so a still rendered
// at frame N is byte-identical every time (DESIGN_SYSTEM §8f — the stills oracle depends on it).
//
// It is deliberately NOT registered with the overlap guard. Confetti is a transparent full-frame
// layer whose whole job is to pass over other content; a box around it would fail every frame.
// The rule it obeys instead: nothing in here is opaque enough, or still enough, to hide a word.

import React from "react";
import { interpolate } from "remotion";

export type CelebrateKind = "burst" | "party";

const CONFETTI = ["#FFD166", "#FF7043", "#2FB3A8", "#42A5F5", "#EF5D5D", "#FFFFFF"];

const rand = (i: number): number => {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

export const Celebrate: React.FC<{
  kind: CelebrateKind;
  /** 0..1 across the line, so the burst lands with the words rather than looping */
  progress: number;
  frame: number;
  fps: number;
  W: number;
  H: number;
  /** where the burst comes FROM — the abacus, not the middle of the frame */
  cx: number;
  cy: number;
}> = ({ kind, progress, frame, fps, W, H, cx, cy }) => {
  const t = frame / fps;

  if (kind === "party") {
    // no ramp: this one is already going when the line starts
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        {Array.from({ length: 54 }, (_, i) => {
          const x = rand(i + 3) * W;
          const fall = ((t * (150 + rand(i + 17) * 160) + rand(i + 29) * H) % (H + 200)) - 100;
          const rot = t * 220 + i * 41;
          const sway = Math.sin(t * 1.8 + i) * 22;
          return (
            <rect
              key={i}
              x={x + sway}
              y={fall}
              width={15}
              height={24}
              rx={4}
              fill={CONFETTI[i % CONFETTI.length]}
              transform={`rotate(${rot} ${x + sway + 7} ${fall + 12})`}
              opacity={0.9}
            />
          );
        })}
      </svg>
    );
  }

  // ---- burst. `progress` is now 0..1 across the burst's OWN duration, measured from the word
  // that names the answer, not across the phrase — see Scene.celebrateFrom.
  const p = interpolate(progress, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (p >= 1 || progress < 0) return null;

  const ring = interpolate(p, [0, 1], [40, 520]);
  const ringFade = interpolate(p, [0, 0.35, 1], [0, 0.5, 0]);
  const rayLen = interpolate(p, [0, 0.4, 1], [20, 150, 96]);
  const rayFade = interpolate(p, [0, 0.25, 0.8], [0, 0.85, 0]);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
      <circle
        cx={cx}
        cy={cy}
        r={ring}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={interpolate(p, [0, 1], [22, 3])}
        opacity={ringFade}
      />
      <g transform={`translate(${cx},${cy}) rotate(${p * 30})`} opacity={rayFade}>
        {Array.from({ length: 12 }, (_, i) => (
          <rect
            key={i}
            x={-6}
            y={-(160 + rayLen)}
            width={12}
            height={rayLen}
            rx={6}
            fill="#FFD166"
            transform={`rotate(${i * 30})`}
          />
        ))}
      </g>

      {/* Confetti thrown outward and then falling — a burst, not a shower. Gravity is what
          makes it read as thrown rather than as an expanding circle. */}
      {Array.from({ length: 34 }, (_, i) => {
        const a = rand(i + 1) * Math.PI * 2;
        const speed = 300 + rand(i + 61) * 460;
        const d = p * speed;
        const x = cx + Math.cos(a) * d;
        const y = cy + Math.sin(a) * d * 0.72 + p * p * 320;
        const rot = p * (360 + rand(i + 91) * 540) + i * 23;
        const fade = interpolate(p, [0, 0.15, 0.82, 1], [0, 1, 1, 0]);
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={14}
            height={22}
            rx={4}
            fill={CONFETTI[i % CONFETTI.length]}
            transform={`rotate(${rot} ${x + 7} ${y + 11})`}
            opacity={fade}
          />
        );
      })}

      {/* NO stars. There were four, out in the gutters — and the gutters are exactly where the
          bucket and the plus character live, so the reward covered the props. Moving them
          anywhere else put them back over the beads. The ring, the rays and the thrown confetti
          already read as a celebration, and they are all transparent and all in motion, which
          is the only way this layer is allowed to cross other content. */}
    </svg>
  );
};
