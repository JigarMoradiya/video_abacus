// NIGHT DOJO — the dark backdrop for Zip & Dash's two "quick math" reels. Deliberately
// distinct from HeroHQ's night-city skyline (this is a dojo rooftop, not a hero's tower) and
// from every daytime world in the series (BeadsWorld/FingerWorld/CountingWorld): deep indigo
// sky, twinkling stars, a crescent moon, curved pagoda-roof silhouettes instead of a shelf.

import React from "react";

export const NightDojoWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;

  const stars = Array.from({ length: 22 }, (_, i) => {
    const x = (i * 227 + (i % 5) * 61) % width;
    const y = height * (0.03 + ((i * 53) % 60) / 100) ;
    const r = 2 + (i % 3) * 1.4;
    const twinkle = 0.4 + 0.5 * Math.abs(Math.sin(t * (1.1 + (i % 4) * 0.3) + i));
    return { x, y, r, twinkle };
  });

  // a pagoda-roof silhouette: a few stacked, gently curved eaves
  const pagoda = (cx: number, baseY: number, w: number, tiers: number) => {
    const parts: string[] = [];
    let y = baseY;
    let tw = w;
    for (let i = 0; i < tiers; i++) {
      const eaveH = 26;
      parts.push(
        `M ${cx - tw / 2},${y} Q ${cx},${y - eaveH} ${cx + tw / 2},${y}`,
        `L ${cx + tw * 0.32},${y}`,
        `L ${cx + tw * 0.32},${y - 30}`,
        `L ${cx - tw * 0.32},${y - 30}`,
        `L ${cx - tw * 0.32},${y}`,
        "Z"
      );
      y -= 30;
      tw *= 0.68;
    }
    return parts.join(" ");
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="dojoSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1440" />
          <stop offset="55%" stopColor="#251B54" />
          <stop offset="100%" stopColor="#33245F" />
        </linearGradient>
        <radialGradient id="dojoMoonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6D8" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFF6D8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="dojoGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B2158" />
          <stop offset="100%" stopColor="#1C1640" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#dojoSky)" />

      <circle cx={width * 0.16} cy={height * 0.1} r={120} fill="url(#dojoMoonGlow)" />
      <path
        d={`M ${width * 0.16 - 46},${height * 0.1} a 46 46 0 1 0 60 -40 a 60 60 0 1 1 -60 40 Z`}
        fill="#FFF6D8"
      />

      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFF" opacity={s.twinkle} />
      ))}

      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="url(#dojoGround)" />
      <rect x={0} y={height * 0.74} width={width} height={6} fill="#4A3A82" opacity={0.7} />

      <g opacity={0.85}>
        <path d={pagoda(width * 0.14, height * 0.745, 190, 2)} fill="#140F2E" />
        <path d={pagoda(width * 0.87, height * 0.745, 220, 3)} fill="#140F2E" />
      </g>
    </svg>
  );
};
