// DETECTIVE OFFICE — a mystery-noir night office: deep charcoal-slate walls, diagonal
// venetian-blind light bars, a warm desk-lamp glow, and drifting "?" clue marks + tiny
// magnifying-glass motes. An EIGHTH distinct palette in the series — not the indigo dojo,
// coral dawn, maroon bingo hall, teal/amber den, violet-plum sky, or navy HeroHQ that came
// before it — and thematically the one built for this specific game: Number Detective is
// about a hidden number and "Higher!/Lower!" clues, so the room IS a clue board.

import React from "react";

export const DetectiveOfficeWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  // diagonal blind-light bars, slowly drifting sideways like dust in a lamp beam
  const bars = Array.from({ length: 7 }, (_, i) => {
    const baseX = (i * 210) % (width + 400);
    const x = mod(baseX + t * 10, width + 400) - 200;
    return { x, w: 46 + (i % 3) * 10 };
  });

  const SPAN = height + 260;
  const motes = Array.from({ length: 8 }, (_, i) => {
    const speed = 10 + (i % 4) * 5;
    const baseY = (i * 233) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.151 + 0.08) % 1) + Math.sin(t * 0.5 + i) * 26;
    const isGlass = i % 3 === 0;
    const scale = 0.7 + (i % 3) * 0.22;
    const glow = 0.5 + 0.4 * Math.abs(Math.sin(t * (1.1 + (i % 3) * 0.4) + i));
    return { x, y, isGlass, scale, glow };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="detWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#171B24" />
          <stop offset="55%" stopColor="#1F2530" />
          <stop offset="100%" stopColor="#2A2F3B" />
        </linearGradient>
        <radialGradient id="detLamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F4B942" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#F4B942" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={width} height={height} fill="url(#detWall)" />

      {/* warm lamp glow, upper area — clear of the sim/UI band below */}
      <ellipse cx={width * 0.5} cy={height * 0.03} rx={width * 0.62} ry={height * 0.28} fill="url(#detLamp)" />

      {/* diagonal blind-light bars across the whole wall, set dressing behind everything */}
      <g opacity={0.14}>
        {bars.map((b, i) => (
          <polygon
            key={i}
            points={`${b.x},0 ${b.x + b.w},0 ${b.x + b.w - 260},${height} ${b.x - 260},${height}`}
            fill="#F4B942"
          />
        ))}
      </g>

      {/* drifting clue marks: "?" glyphs and tiny magnifying glasses, glowing like fireflies */}
      {motes.map((m, i) =>
        m.isGlass ? (
          <g key={i} transform={`translate(${m.x} ${m.y}) scale(${m.scale})`} opacity={m.glow}>
            <circle cx={0} cy={0} r={14} fill="none" stroke="#F4B942" strokeWidth={4} style={{ filter: "drop-shadow(0 0 5px rgba(244,185,66,0.7))" }} />
            <line x1={10} y1={10} x2={20} y2={20} stroke="#F4B942" strokeWidth={5} strokeLinecap="round" />
          </g>
        ) : (
          <text
            key={i}
            x={m.x}
            y={m.y}
            fontSize={32 * m.scale}
            fontWeight={700}
            fill="#F4B942"
            opacity={m.glow}
            textAnchor="middle"
            style={{ filter: "drop-shadow(0 0 6px rgba(244,185,66,0.6))" }}
          >
            ?
          </text>
        )
      )}

      {/* floor */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="#12161E" />
      <rect x={0} y={height * 0.74} width={width} height={7} fill="#F4B942" opacity={0.45} />
    </svg>
  );
};
