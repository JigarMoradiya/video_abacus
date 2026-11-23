// MOSAIC PLAZA — a bright, candy-colored courtyard: the ground is a giant checkerboard of
// rainbow tiles (a magic-square grid you could stand on), with rainbow bunting flags overhead
// and confetti + drifting number-bubbles in the air. A THIRTEENTH distinct palette in the
// series — not the indigo dojo, coral dawn, navy HeroHQ, maroon bingo hall, teal/amber den,
// violet-plum sky, charcoal noir office, sunny archery field, blueprint workshop, lavender
// puzzle study, or fresh-green pond that came before it. A GRID game gets a world built out of
// a grid — vivid and playful, matching the real app's own rainbow tile palette.

import React from "react";

const TILE_COLORS = ["#FF9EA8", "#7FE0D6", "#FFD873", "#B9A2F0", "#8FC3FF", "#FFB07A"];

export const MosaicPlazaWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const motes = Array.from({ length: 9 }, (_, i) => {
    const speed = 7 + (i % 4) * 4;
    const baseY = (i * 251) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.146 + 0.06) % 1) + Math.sin(t * 0.4 + i) * 26;
    const kind = i % 3; // 0 confetti square, 1 confetti circle, 2 tiny number bubble
    const scale = 0.55 + (i % 3) * 0.2;
    const color = TILE_COLORS[i % TILE_COLORS.length];
    return { x, y, kind, scale, color, spin: t * 40 + i * 50 };
  });

  // the raked/grid floor: a checkerboard of big rainbow tiles, receding toward the horizon
  const floorTop = height * 0.74;
  const floorH = height * 0.26;
  const cols = 6;
  const rows = 3;
  const cellW = width / cols;
  const cellH = floorH / rows;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="mosaicSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3E4" />
          <stop offset="45%" stopColor="#FBD9EC" />
          <stop offset="100%" stopColor="#D7C9F7" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#mosaicSky)" />
      <circle cx={width * 0.16} cy={height * 0.07} r={width * 0.13} fill="#FFFFFF" opacity={0.4} />

      {/* rainbow bunting strung across the top */}
      <path d={`M 0 40 Q ${width * 0.5} 100 ${width} 40`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.6} />
      {Array.from({ length: 11 }, (_, i) => {
        const p = i / 10;
        const bx = width * p;
        const by = 40 + Math.sin(Math.PI * p) * 60;
        return (
          <path
            key={i}
            d={`M ${bx - 16} ${by} L ${bx + 16} ${by} L ${bx} ${by + 30} Z`}
            fill={TILE_COLORS[i % TILE_COLORS.length]}
            opacity={0.9}
          />
        );
      })}

      {/* drifting confetti + number-bubble motes */}
      {motes.map((m, i) =>
        m.kind === 0 ? (
          <rect key={i} x={m.x - 8} y={m.y - 8} width={16} height={16} rx={4} fill={m.color} opacity={0.7} transform={`rotate(${m.spin} ${m.x} ${m.y})`} />
        ) : m.kind === 1 ? (
          <circle key={i} cx={m.x} cy={m.y} r={9 * m.scale} fill={m.color} opacity={0.65} />
        ) : (
          <g key={i} opacity={0.55}>
            <circle cx={m.x} cy={m.y} r={16} fill="#FFFFFF" stroke={m.color} strokeWidth={3} />
          </g>
        )
      )}

      {/* the grid floor — a giant checkerboard of rainbow tiles, the same "every square" idea
          the game teaches, gently breathing so it never sits frozen */}
      <rect x={0} y={floorTop} width={width} height={floorH} fill="#F4E9D8" />
      <rect x={0} y={floorTop} width={width} height={6} fill="#FFFFFF" opacity={0.5} />
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const breathe = 0.85 + Math.sin(t * 1.2 + r * 0.7 + c * 0.5) * 0.15;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * cellW}
              y={floorTop + r * cellH}
              width={cellW - 4}
              height={cellH - 4}
              rx={10}
              fill={TILE_COLORS[(r + c) % TILE_COLORS.length]}
              opacity={0.3 * breathe}
            />
          );
        })
      )}
    </svg>
  );
};
