// PUZZLE STUDY — a cozy lavender study nook: soft violet walls, a warm desk-lamp glow, and
// drifting jigsaw-piece + numbered-tile motes, matching the real game's own puzzle-piece
// level badges and "Brain Puzzles" section color. An ELEVENTH distinct palette in the series —
// not the indigo dojo, coral dawn, navy HeroHQ, maroon bingo hall, teal/amber den,
// violet-plum sky, charcoal noir office, sunny archery field, or blueprint workshop that came
// before it — cool lavender specifically, distinct from Missing Sign's warm teal/amber den.

import React from "react";

export const PuzzleStudyWorld: React.FC<{
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
    const x = width * ((i * 0.151 + 0.05) % 1) + Math.sin(t * 0.5 + i) * 24;
    const isPuzzle = i % 2 === 0;
    const scale = 0.7 + (i % 3) * 0.22;
    const rot = Math.sin(t * 0.6 + i) * 12;
    return { x, y, isPuzzle, scale, rot };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="puzWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2A1F45" />
          <stop offset="55%" stopColor="#392A5C" />
          <stop offset="100%" stopColor="#493670" />
        </linearGradient>
        <radialGradient id="puzLamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F4B942" stopOpacity={0.32} />
          <stop offset="100%" stopColor="#F4B942" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={width} height={height} fill="url(#puzWall)" />
      <ellipse cx={width * 0.5} cy={height * 0.03} rx={width * 0.6} ry={height * 0.26} fill="url(#puzLamp)" />

      {/* drifting jigsaw pieces + small numbered tiles */}
      {motes.map((m, i) =>
        m.isPuzzle ? (
          <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.rot}) scale(${m.scale})`} opacity={0.55}>
            <rect x={-22} y={-22} width={44} height={44} rx={8} fill="#B993F5" opacity={0.9} />
            <circle cx={22} cy={0} r={11} fill="#B993F5" opacity={0.9} />
          </g>
        ) : (
          <g key={i} transform={`translate(${m.x} ${m.y}) scale(${m.scale})`} opacity={0.55}>
            <rect x={-20} y={-20} width={40} height={40} rx={10} fill="#FFFFFF" />
            <text x={0} y={8} textAnchor="middle" fontSize={24} fontWeight={700} fill="#8E4FD0">
              {(i % 4) + 1}
            </text>
          </g>
        )
      )}

      {/* floor */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="#241A3D" />
      <rect x={0} y={height * 0.74} width={width} height={7} fill="#F4B942" opacity={0.45} />
    </svg>
  );
};
