// LILY POND — a bright fresh-green pond: soft teal-to-mint sky-water gradient, drifting lily
// pads and dragonflies, gentle ripple rings. A TWELFTH distinct palette in the series — not
// the indigo dojo, coral dawn, navy HeroHQ, maroon bingo hall, teal/amber den, violet-plum
// sky, charcoal noir office, sunny archery field, blueprint workshop, or lavender puzzle study
// that came before it. A hopping game gets a hopping-critter's own world.

import React from "react";

export const PondWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const motes = Array.from({ length: 8 }, (_, i) => {
    const speed = 8 + (i % 4) * 5;
    const baseY = (i * 233) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.151 + 0.06) % 1) + Math.sin(t * 0.5 + i) * 24;
    const isPad = i % 2 === 0;
    const scale = 0.7 + (i % 3) * 0.22;
    return { x, y, isPad, scale };
  });

  const ripples = Array.from({ length: 3 }, (_, i) => {
    const cycle = mod(t * 0.35 + i * 0.33, 1);
    return { x: width * (0.2 + i * 0.3), y: height * 0.78, r: 20 + cycle * 90, opacity: (1 - cycle) * 0.35 };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="pondSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAFBF0" />
          <stop offset="55%" stopColor="#C6F2D9" />
          <stop offset="100%" stopColor="#9FE6C3" />
        </linearGradient>
        <linearGradient id="pondWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3FB8A8" />
          <stop offset="100%" stopColor="#278F82" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#pondSky)" />
      <circle cx={width * 0.84} cy={height * 0.05} r={width * 0.15} fill="#FFFFFF" opacity={0.4} />

      {/* drifting lily pads + dragonflies */}
      {motes.map((m, i) =>
        m.isPad ? (
          <g key={i} transform={`translate(${m.x} ${m.y}) scale(${m.scale})`} opacity={0.6}>
            <ellipse cx={0} cy={0} rx={24} ry={18} fill="#4CAF7D" />
            <path d="M 0 0 L 22 -4 L 6 4 Z" fill="#EAFBF0" opacity={0.6} />
          </g>
        ) : (
          <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${Math.sin(t * 0.8 + i) * 20}) scale(${m.scale})`} opacity={0.55}>
            <ellipse cx={0} cy={0} rx={5} ry={16} fill="#2E8B57" />
            <line x1={-18} y1={-3} x2={18} y2={-3} stroke="#8FE3D8" strokeWidth={3} strokeLinecap="round" />
            <line x1={-16} y1={3} x2={16} y2={3} stroke="#8FE3D8" strokeWidth={3} strokeLinecap="round" />
          </g>
        )
      )}

      {/* water floor with ripple rings */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="url(#pondWater)" />
      <rect x={0} y={height * 0.74} width={width} height={7} fill="#EAFBF0" opacity={0.5} />
      {ripples.map((r, i) => (
        <circle key={i} cx={r.x} cy={r.y} r={r.r} fill="none" stroke="#EAFBF0" strokeWidth={3} opacity={r.opacity} />
      ))}
    </svg>
  );
};
