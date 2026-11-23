// ARCHERY RANGE — a sunny outdoor target range: warm sky, a grassy field, and drifting
// bullseye targets + feather-fletched arrows, matching the real game's own dartboard icon and
// "🎯 Target: N" header. A NINTH distinct palette in the series — not the indigo dojo, coral
// dawn, navy HeroHQ, maroon bingo hall, teal/amber den, violet-plum sky, or charcoal noir
// office that came before it, and the first BRIGHT DAYTIME world since the pastel Game Zone
// itself, on purpose: hitting a target is a cheerful, outdoorsy idea, not a moody one.

import React from "react";

export const ArcheryRangeWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const motes = Array.from({ length: 8 }, (_, i) => {
    const speed = 9 + (i % 4) * 5;
    const baseY = (i * 233) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.149 + 0.07) % 1) + Math.sin(t * 0.5 + i) * 26;
    const isArrow = i % 3 === 1;
    const scale = 0.7 + (i % 3) * 0.22;
    const bob = Math.sin(t * (1.2 + (i % 3) * 0.3) + i) * 10;
    return { x, y: y + bob, isArrow, scale, rot: Math.sin(t * 0.6 + i) * 12 };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="archSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3D6" />
          <stop offset="55%" stopColor="#FFE0A8" />
          <stop offset="100%" stopColor="#FFC98A" />
        </linearGradient>
        <linearGradient id="archGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6FBF6C" />
          <stop offset="100%" stopColor="#469A48" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#archSky)" />

      {/* a couple of soft sun-rays, upper area, clear of the sim/UI band below */}
      <circle cx={width * 0.82} cy={height * 0.06} r={width * 0.16} fill="#FFFFFF" opacity={0.35} />

      {/* drifting bullseye targets + arrows */}
      {motes.map((m, i) =>
        m.isArrow ? (
          <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${40 + m.rot}) scale(${m.scale})`} opacity={0.62}>
            <line x1={-20} y1={0} x2={20} y2={0} stroke="#8D6E63" strokeWidth={4} strokeLinecap="round" />
            <path d="M 20 0 L 12 -6 L 12 6 Z" fill="#5C4033" />
            <path d="M -20 0 L -28 -6 M -20 0 L -28 6" stroke="#E53935" strokeWidth={4} strokeLinecap="round" />
          </g>
        ) : (
          <g key={i} transform={`translate(${m.x} ${m.y}) scale(${m.scale})`} opacity={0.6}>
            <circle cx={0} cy={0} r={20} fill="#FFFFFF" />
            <circle cx={0} cy={0} r={20} fill="none" stroke="#E53935" strokeWidth={5} />
            <circle cx={0} cy={0} r={11} fill="#E53935" />
            <circle cx={0} cy={0} r={11} fill="none" stroke="#FFFFFF" strokeWidth={3} />
            <circle cx={0} cy={0} r={3.5} fill="#FFFFFF" />
          </g>
        )
      )}

      {/* rolling field on the horizon */}
      <ellipse cx={width * 0.18} cy={height * 0.76} rx={width * 0.4} ry={height * 0.06} fill="#5AAE57" />
      <ellipse cx={width * 0.86} cy={height * 0.77} rx={width * 0.44} ry={height * 0.07} fill="#4E9E4C" />

      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="url(#archGround)" />
      <rect x={0} y={height * 0.74} width={width} height={7} fill="#B7E6A8" opacity={0.7} />
    </svg>
  );
};
