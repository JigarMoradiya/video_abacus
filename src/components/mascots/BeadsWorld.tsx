// BEADS WORLD — a bright, uncluttered backdrop for direct teaching, not a narrative location
// like Hero HQ. Bo and Pip aren't investigating anything here; the abacus itself is the star,
// so the background stays soft and out of the way: a warm gradient, a few drifting bead-shaped
// motes, a simple shelf surface for the characters and the abacus to sit on.

import React from "react";

export const BeadsWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const motes = Array.from({ length: 8 }, (_, i) => {
    const baseX = (i * 173) % width;
    const speed = 6 + (i % 3) * 3;
    const x = mod(baseX + t * speed, width + 80) - 40;
    const y = height * (0.06 + (i % 4) * 0.09) + Math.sin(t * 0.4 + i) * 14;
    const r = 10 + (i % 3) * 6;
    const hue = i % 3;
    const fill = hue === 0 ? "#FFD873" : hue === 1 ? "#8FD8E8" : "#FF9FC0";
    return { x, y, r, fill };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="beadsSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3D6" />
          <stop offset="55%" stopColor="#FFE7C2" />
          <stop offset="100%" stopColor="#FFD9A8" />
        </linearGradient>
        <linearGradient id="beadsShelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3B27A" />
          <stop offset="100%" stopColor="#D98F52" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#beadsSky)" />

      {motes.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={m.fill} opacity={0.55} />
      ))}

      {/* the shelf — a simple warm surface, no skyline or props competing with the abacus */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="url(#beadsShelf)" />
      <rect x={0} y={height * 0.74} width={width} height={10} fill="#FFE7BE" opacity={0.8} />
    </svg>
  );
};
