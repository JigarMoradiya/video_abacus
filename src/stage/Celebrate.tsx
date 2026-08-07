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
  /** the abacus's centre AND its half-extents: every particle starts on this outline */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}> = ({ kind, progress, frame, fps, W, H, cx, cy, rx, ry }) => {
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

  // The burst happens AROUND the abacus, never across it.
  //
  // The first version fired twelve long gold rays and a cloud of confetti out of the frame's centre,
  // which is exactly where the beads are — so the reward covered the answer it was rewarding. Every
  // particle now STARTS on the instrument's outline and travels away from it, and the rays are gone.
  // What is left reads as a pop around the abacus and leaves the beads readable throughout.
  const edge = (a: number) => ({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  const glow = interpolate(p, [0, 0.25, 0.9], [0, 0.3, 0]);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
      <defs>
        <radialGradient id="celebGlow">
          <stop offset="55%" stopColor="#FFE9A8" stopOpacity={0} />
          <stop offset="88%" stopColor="#FFD166" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#FFD166" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* A soft bloom hugging the outline — the "ta-da" that costs the beads nothing */}
      <ellipse cx={cx} cy={cy} rx={rx * 1.28} ry={ry * 1.34} fill="url(#celebGlow)" opacity={glow} />

      {/* NO RING. It survived the rewrite that removed the rays, and it was the same mistake: an
          expanding outline is only outside the instrument if the instrument is wide and short. In the
          4:5 cut the abacus is nearly square and fills the frame, so the ring swelled straight across
          the beads. The glow, the thrown confetti and the corner sparkles are the celebration; the
          ring was a big white line over the answer. */}
      {/* Confetti launched FROM the outline, outward, then falling. Nothing is ever inside the
          panel, so the answer stays legible while the frame celebrates it. */}
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2 + rand(i + 1) * 0.3;
        const start = edge(a);
        const speed = 220 + rand(i + 61) * 380;
        const d = p * speed;
        const x = start.x + Math.cos(a) * d;
        const y = start.y + Math.sin(a) * d + p * p * 300;
        const rot = p * (300 + rand(i + 91) * 520) + i * 23;
        const fade = interpolate(p, [0, 0.12, 0.8, 1], [0, 1, 1, 0]);
        const long = i % 4 === 0;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={long ? 9 : 14}
            height={long ? 30 : 20}
            rx={4}
            fill={CONFETTI[i % CONFETTI.length]}
            transform={`rotate(${rot} ${x + 7} ${y + 10})`}
            opacity={fade}
          />
        );
      })}

      {/* Four sparkles popping just off the corners of the frame — small, brief, outside */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sy], i) => {
        const px = cx + sx * rx * 1.06;
        const py = cy + sy * ry * 1.06;
        const k = interpolate(p, [0.04 + i * 0.05, 0.26 + i * 0.05, 0.6], [0, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (k <= 0.01) return null;
        const r = 16 + k * 26;
        return (
          <g key={`sp${i}`} opacity={k} transform={`translate(${px},${py}) rotate(${i * 22})`}>
            {[0, 45, 90, 135].map((ang) => (
              <rect
                key={ang}
                x={-2.5}
                y={-r}
                width={5}
                height={r * 2}
                rx={2.5}
                fill="#FFE9A8"
                transform={`rotate(${ang})`}
              />
            ))}
          </g>
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
