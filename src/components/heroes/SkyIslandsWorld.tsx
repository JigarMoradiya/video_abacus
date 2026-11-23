// SKY ISLANDS AT NIGHT — floating grassy islands drifting past under a deep violet-plum night
// sky, a glowing moon, and twinkling stars, with gulls wheeling in the silhouetted dark. A
// SIXTH distinct palette in the series — deep violet/plum, not the indigo dojo, coral dawn,
// maroon bingo hall, or teal den that came before it. Fits "how high can you climb?" literally:
// the islands sit at different heights, like rungs on a ladder into the night sky.

import React from "react";

export const SkyIslandsWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = width + 500;
  const islands = Array.from({ length: 5 }, (_, i) => {
    const speed = 10 + (i % 3) * 5;
    const baseX = (i * 260) % SPAN;
    const x = mod(baseX + t * speed, SPAN) - 250;
    const y = height * (0.12 + (i % 4) * 0.13) + Math.sin(t * 0.3 + i) * 10;
    const scale = 0.5 + (i % 3) * 0.25;
    return { x, y, scale };
  });

  const stars = Array.from({ length: 26 }, (_, i) => {
    const x = (i * 197 + (i % 5) * 61) % width;
    const y = height * (0.02 + ((i * 53) % 55) / 100);
    const r = 2 + (i % 3) * 1.3;
    const twinkle = 0.4 + 0.5 * Math.abs(Math.sin(t * (1.1 + (i % 4) * 0.3) + i));
    return { x, y, r, twinkle };
  });

  const island = (cx: number, cy: number, w: number, scale: number) => {
    const s = scale;
    const iw = w * s;
    return (
      <g transform={`translate(${cx} ${cy})`}>
        <ellipse cx={0} cy={22 * s} rx={iw * 0.5} ry={10 * s} fill="#241A3C" />
        <ellipse cx={0} cy={16 * s} rx={iw * 0.5} ry={10 * s} fill="#33254E" />
        <path d={`M ${-iw * 0.52} 0 Q 0 ${-18 * s} ${iw * 0.52} 0 L ${iw * 0.5} ${8 * s} Q 0 ${16 * s} ${-iw * 0.5} ${8 * s} Z`} fill="#2E6A4A" />
        <path d={`M ${-iw * 0.52} 0 Q 0 ${-18 * s} ${iw * 0.52} 0`} fill="none" stroke="#245638" strokeWidth={3 * s} />
      </g>
    );
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="skySkyNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1B1240" />
          <stop offset="55%" stopColor="#2C1E52" />
          <stop offset="100%" stopColor="#402A5E" />
        </linearGradient>
        <radialGradient id="skyMoon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6D8" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFF6D8" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={width} height={height} fill="url(#skySkyNight)" />
      <circle cx={width * 0.82} cy={height * 0.1} r={150} fill="url(#skyMoon)" />
      <circle cx={width * 0.82} cy={height * 0.1} r={54} fill="#FFF6D8" />

      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFF" opacity={s.twinkle} />
      ))}

      {islands.map((isl, i) => (
        <g key={i} opacity={0.95}>
          {island(isl.x, isl.y, 220, isl.scale)}
        </g>
      ))}

      {/* ground band at the very bottom, matching the series convention */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="#1C1436" />
      <rect x={0} y={height * 0.74} width={width} height={8} fill="#5B3E82" opacity={0.6} />
    </svg>
  );
};
