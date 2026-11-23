// THE CELEBRATION BURST — confetti for the reveal, but shaped like the app's own beads
// (hexagons, the exact silhouette Abacus.tsx draws) rather than generic stars. A win in an
// abacus story should look like ITS win, not a stock "you did it" effect borrowed from
// anywhere else.
//
// Bare <g>, same rule as every other prop in this reel — render it inside an <svg> ancestor.

import React from "react";
import { interpolate } from "remotion";

const hexPath = (x: number, y: number, w: number, h: number): string => {
  const hw = w / 2;
  const hh = h / 2;
  const shoulder = 0.62;
  return [
    `M ${x - hw * shoulder} ${y - hh}`,
    `L ${x + hw * shoulder} ${y - hh}`,
    `L ${x + hw} ${y}`,
    `L ${x + hw * shoulder} ${y + hh}`,
    `L ${x - hw * shoulder} ${y + hh}`,
    `L ${x - hw} ${y}`,
    "Z",
  ].join(" ");
};

const PIECES = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.22;
  const dist = 130 + (i % 4) * 46;
  const size = 14 + (i % 3) * 6;
  const spin = (i % 2 === 0 ? 1 : -1) * (200 + (i % 5) * 30);
  return { angle, dist, size, spin, delay: (i % 5) * 0.025 };
});

const COLORS = ["#FF8A50", "#E64A19", "#2C6FE8", "#E8432C", "#FFE156", "#3FE07A"];

export const Celebration: React.FC<{
  x: number;
  y: number;
  frame: number;
  fps: number;
  startFrame: number;
}> = ({ x, y, frame, fps, startFrame }) => {
  const t = (frame - startFrame) / fps;
  if (t < 0 || t > 1.15) return null;

  return (
    <g>
      {PIECES.map((piece, i) => {
        const local = Math.max(0, t - piece.delay);
        const prog = Math.min(1, local / 0.8);
        if (prog <= 0) return null;
        const ease = 1 - Math.pow(1 - prog, 2);
        const r = piece.dist * ease;
        const px = x + Math.cos(piece.angle) * r;
        const py = y + Math.sin(piece.angle) * r - ease * 60; // a slight upward arc, not a flat radial
        const opacity = interpolate(prog, [0, 0.12, 0.7, 1], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const rot = prog * piece.spin;
        const color = COLORS[i % COLORS.length];
        return (
          <path
            key={i}
            d={hexPath(0, 0, piece.size, piece.size * 0.88)}
            fill={color}
            opacity={opacity}
            transform={`translate(${px} ${py}) rotate(${rot})`}
          />
        );
      })}
    </g>
  );
};
