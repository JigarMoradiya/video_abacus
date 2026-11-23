// CHALKBOARD CLASSROOM — a deep chalkboard-green backdrop with a wooden frame lip, drifting
// chalk-dust motes and faint ghost numbers, and a wooden-floor base with a chalk tray. An
// EIGHTEENTH distinct palette in the series — not the indigo dojo, coral dawn, navy HeroHQ,
// maroon bingo hall, teal/amber den, violet-plum sky, charcoal noir office, sunny archery
// field, blueprint workshop, lavender puzzle study, fresh-green pond, candy mosaic plaza, warm
// autumn treetop, icy arctic floe, or deep-sea lagoon that came before it. A "numbers as parts
// of a whole" game gets the one backdrop that's always literally covered in sums.

import React from "react";

export const ChalkboardWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const motes = Array.from({ length: 10 }, (_, i) => {
    const speed = 6 + (i % 4) * 4;
    const baseY = (i * 227) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.137 + 0.06) % 1) + Math.sin(t * 0.45 + i) * 22;
    const scale = 0.4 + (i % 3) * 0.2;
    return { x, y, scale };
  });

  const ghostNumbers = ["+", "7", "−", "3", "=", "9", "×"];
  const floorTop = height * 0.78;
  const floorH = height * 0.22;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="boardSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#274A3C" />
          <stop offset="55%" stopColor="#1E3B30" />
          <stop offset="100%" stopColor="#152A22" />
        </linearGradient>
        <linearGradient id="boardFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A5A34" />
          <stop offset="100%" stopColor="#6B4426" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#boardSky)" />
      {/* wooden frame lip along the very top, like a chalkboard's rail */}
      <rect x={0} y={0} width={width} height={22} fill="#8A5A34" opacity={0.85} />

      {/* faint ghost chalk numbers drifting in the background */}
      {ghostNumbers.map((n, i) => (
        <text
          key={i}
          x={width * ((i * 0.157 + 0.08) % 1)}
          y={height * (0.12 + ((i * 0.13) % 0.55))}
          fontSize={60}
          fill="#EAF2EA"
          opacity={0.05}
          fontFamily="sans-serif"
          fontWeight={700}
        >
          {n}
        </text>
      ))}

      {/* drifting chalk dust */}
      {motes.map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={5 * m.scale} fill="#EAF2EA" opacity={0.28} />
      ))}

      {/* wooden floor with a chalk tray lip */}
      <rect x={0} y={floorTop} width={width} height={floorH} fill="url(#boardFloor)" />
      <rect x={0} y={floorTop} width={width} height={10} fill="#C99A5C" opacity={0.5} />
      <rect x={width * 0.15} y={floorTop + 6} width={width * 0.7} height={10} rx={5} fill="#4A3018" opacity={0.55} />
    </svg>
  );
};
