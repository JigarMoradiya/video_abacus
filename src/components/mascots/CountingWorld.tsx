// COUNTING WORLD — a bright mint-and-lemon playground backdrop. Bead Values is warm orange,
// Which Finger? is cool blue; this one needs to look like neither at a glance. Drifting motes
// are small stars/balloons instead of plain dots, since this reel is the most purely playful
// of the three ("count to ten!" is a celebration, not a technique lesson).

import React from "react";

export const CountingWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const motes = Array.from({ length: 10 }, (_, i) => {
    const baseX = (i * 137) % width;
    const speed = 7 + (i % 3) * 5;
    const x = mod(baseX + t * speed, width + 80) - 40;
    const y = height * (0.04 + (i % 5) * 0.07) + Math.sin(t * 0.5 + i) * 15;
    const r = 8 + (i % 3) * 5;
    const hue = i % 4;
    const fill = hue === 0 ? "#FFE066" : hue === 1 ? "#7BE0AD" : hue === 2 ? "#FF9FC0" : "#8FD6FF";
    return { x, y, r, fill, star: i % 2 === 0 };
  });

  const starPath = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let k = 0; k < 5; k++) {
      const outer = (k * 2 * Math.PI) / 5 - Math.PI / 2;
      const inner = outer + Math.PI / 5;
      const ox = cx + Math.cos(outer) * r;
      const oy = cy + Math.sin(outer) * r;
      const ix = cx + Math.cos(inner) * r * 0.45;
      const iy = cy + Math.sin(inner) * r * 0.45;
      pts.push(`${k === 0 ? "M" : "L"} ${ox},${oy}`, `L ${ix},${iy}`);
    }
    return pts.join(" ") + " Z";
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="countSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAFFF3" />
          <stop offset="55%" stopColor="#D3F7E4" />
          <stop offset="100%" stopColor="#B8ECD2" />
        </linearGradient>
        <linearGradient id="countGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5FC98A" />
          <stop offset="100%" stopColor="#3EA36B" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#countSky)" />

      {motes.map((m, i) =>
        m.star ? (
          <path key={i} d={starPath(m.x, m.y, m.r)} fill={m.fill} opacity={0.65} />
        ) : (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={m.fill} opacity={0.6} />
        )
      )}

      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="url(#countGround)" />
      <rect x={0} y={height * 0.74} width={width} height={10} fill="#A6E8C0" opacity={0.85} />
    </svg>
  );
};
