// FINGER WORLD — a cool teal/violet backdrop, deliberately NOT Bead Values' warm orange
// palette. Same series, same Bo & Pip, but a viewer scrolling past should be able to tell
// this is a different reel at a glance, not the same video again.

import React from "react";

export const FingerWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const motes = Array.from({ length: 9 }, (_, i) => {
    const baseX = (i * 151) % width;
    const speed = 8 + (i % 3) * 4;
    const x = mod(baseX + t * speed, width + 80) - 40;
    const y = height * (0.05 + (i % 4) * 0.085) + Math.sin(t * 0.45 + i) * 16;
    const r = 9 + (i % 3) * 6;
    const hue = i % 3;
    const fill = hue === 0 ? "#8FE3D8" : hue === 1 ? "#B9A6FF" : "#FFD873";
    return { x, y, r, fill };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="fingerSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E4F3FF" />
          <stop offset="55%" stopColor="#CFE8FF" />
          <stop offset="100%" stopColor="#A9CFFB" />
        </linearGradient>
        <linearGradient id="fingerShelf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5E7FD9" />
          <stop offset="100%" stopColor="#3E5AB0" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#fingerSky)" />

      {motes.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={m.fill} opacity={0.55} />
      ))}

      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="url(#fingerShelf)" />
      <rect x={0} y={height * 0.74} width={width} height={10} fill="#8FA6E8" opacity={0.8} />
    </svg>
  );
};
