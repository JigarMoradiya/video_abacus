// BLUEPRINT WORKSHOP — a cool blueprint-blue backdrop with a fine drafting grid, and drifting
// white pyramid-block + ruler/pencil motes, matching the real game's own white number-block
// pieces. A TENTH distinct palette in the series — not the indigo dojo, coral dawn, navy
// HeroHQ, maroon bingo hall, teal/amber den, violet-plum sky, charcoal noir office, or sunny
// archery field that came before it. A construction game gets a construction-drawing world.

import React from "react";

export const BlueprintWorkshopWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const GRID = 64;
  const vLines = Math.ceil(width / GRID) + 1;
  const hLines = Math.ceil(height / GRID) + 1;

  const SPAN = height + 260;
  const motes = Array.from({ length: 8 }, (_, i) => {
    const speed = 8 + (i % 4) * 5;
    const baseY = (i * 233) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.153 + 0.06) % 1) + Math.sin(t * 0.5 + i) * 24;
    const isBlock = i % 2 === 0;
    const scale = 0.7 + (i % 3) * 0.22;
    const rot = Math.sin(t * 0.6 + i) * 10;
    return { x, y, isBlock, scale, rot };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="bpWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123B66" />
          <stop offset="55%" stopColor="#164A7A" />
          <stop offset="100%" stopColor="#1B5A90" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#bpWall)" />

      {/* fine drafting grid */}
      <g opacity={0.16} stroke="#FFFFFF" strokeWidth={1.5}>
        {Array.from({ length: vLines }, (_, i) => (
          <line key={`v${i}`} x1={i * GRID} y1={0} x2={i * GRID} y2={height} />
        ))}
        {Array.from({ length: hLines }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * GRID} x2={width} y2={i * GRID} />
        ))}
      </g>

      {/* drifting blocks + rulers, like the game's own pyramid pieces sketched loose */}
      {motes.map((m, i) =>
        m.isBlock ? (
          <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${m.rot}) scale(${m.scale})`} opacity={0.5}>
            <rect x={-24} y={-16} width={48} height={32} rx={7} fill="#FFFFFF" opacity={0.85} />
            <rect x={-24} y={-16} width={48} height={32} rx={7} fill="none" stroke="#F4B942" strokeWidth={3} />
          </g>
        ) : (
          <g key={i} transform={`translate(${m.x} ${m.y}) rotate(${20 + m.rot}) scale(${m.scale})`} opacity={0.45}>
            <rect x={-30} y={-6} width={60} height={12} rx={3} fill="#F4B942" />
            <line x1={-20} y1={-6} x2={-20} y2={6} stroke="#123B66" strokeWidth={2} />
            <line x1={0} y1={-6} x2={0} y2={6} stroke="#123B66" strokeWidth={2} />
            <line x1={20} y1={-6} x2={20} y2={6} stroke="#123B66" strokeWidth={2} />
          </g>
        )
      )}

      {/* workshop floor */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="#0E2E4F" />
      <rect x={0} y={height * 0.74} width={width} height={7} fill="#F4B942" opacity={0.5} />
    </svg>
  );
};
