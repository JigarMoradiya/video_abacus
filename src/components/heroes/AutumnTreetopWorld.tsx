// AUTUMN TREETOP — a warm amber-and-rust forest canopy: a soft gold sky, drifting autumn
// leaves and acorns, and a thick tree-branch floor with a carved hollow here and there. A
// FOURTEENTH distinct palette in the series — not the indigo dojo, coral dawn, navy HeroHQ,
// maroon bingo hall, teal/amber den, violet-plum sky, charcoal noir office, sunny archery
// field, blueprint workshop, lavender puzzle study, fresh-green pond, or candy mosaic plaza
// that came before it. A "gather it and put it in its own spot" game gets an acorn-gathering
// critter's own forest.

import React from "react";

export const AutumnTreetopWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const motes = Array.from({ length: 9 }, (_, i) => {
    const speed = 8 + (i % 4) * 5;
    const baseY = (i * 241) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.157 + 0.05) % 1) + Math.sin(t * 0.45 + i) * 26;
    const isLeaf = i % 3 !== 0;
    const scale = 0.6 + (i % 3) * 0.22;
    return { x, y, isLeaf, scale, spin: t * 26 + i * 44 };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="autumnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF1DC" />
          <stop offset="55%" stopColor="#FDD9A8" />
          <stop offset="100%" stopColor="#F0B36E" />
        </linearGradient>
        <linearGradient id="autumnBranch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8672E" />
          <stop offset="100%" stopColor="#7A481E" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#autumnSky)" />
      <circle cx={width * 0.82} cy={height * 0.06} r={width * 0.14} fill="#FFFFFF" opacity={0.32} />

      {/* soft distant canopy blobs for depth */}
      <ellipse cx={width * 0.1} cy={height * 0.16} rx={width * 0.22} ry={70} fill="#E8934A" opacity={0.28} />
      <ellipse cx={width * 0.92} cy={height * 0.28} rx={width * 0.2} ry={64} fill="#D97B3A" opacity={0.25} />

      {/* drifting leaves + acorns */}
      {motes.map((m, i) =>
        m.isLeaf ? (
          <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.spin}) scale(${m.scale})`} opacity={0.65}>
            <path d="M 0 -14 Q 14 -6 10 8 Q 0 16 -10 8 Q -14 -6 0 -14 Z" fill="#E2792F" />
            <line x1={0} y1={-14} x2={0} y2={8} stroke="#A8501F" strokeWidth={1.5} opacity={0.5} />
          </g>
        ) : (
          <g key={i} transform={`translate(${m.x} ${m.y}) scale(${m.scale})`} opacity={0.6}>
            <ellipse cx={0} cy={4} rx={9} ry={11} fill="#B8722E" />
            <path d="M -9 -2 Q 0 -12 9 -2 Q 0 -5 -9 -2 Z" fill="#7A4A1E" />
          </g>
        )
      )}

      {/* thick branch floor with a couple of carved hollows */}
      <rect x={0} y={height * 0.76} width={width} height={height * 0.24} fill="url(#autumnBranch)" />
      <rect x={0} y={height * 0.76} width={width} height={7} fill="#FFF1DC" opacity={0.35} />
      <ellipse cx={width * 0.28} cy={height * 0.79} rx={46} ry={16} fill="#5A3416" opacity={0.6} />
      <ellipse cx={width * 0.72} cy={height * 0.84} rx={58} ry={20} fill="#5A3416" opacity={0.6} />
    </svg>
  );
};
