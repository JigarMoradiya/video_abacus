// PUZZLE DEN — a cozy reading-den at night: deep teal-brown walls, a warm lamp glow, and the
// four operator symbols (+, −, ×, ÷) drifting through the scene like fireflies — since Missing
// Sign is all about finding the right one of these four. A FIFTH distinct palette in the
// series: warm teal/amber, not the indigo dojo, coral dawn, or maroon bingo hall that came
// before it.

import React from "react";

const SYMBOLS = ["+", "−", "×", "÷"];

export const PuzzleDenWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const shelves = Array.from({ length: 3 }, (_, i) => ({
    y: height * (0.1 + i * 0.06),
    books: Array.from({ length: 7 }, (_, k) => ({
      w: 20 + ((k * 13 + i * 5) % 18),
      h: 40 + ((k * 7 + i * 9) % 26),
    })),
  }));

  const SPAN = height + 260;
  const motes = Array.from({ length: 9 }, (_, i) => {
    const speed = 12 + (i % 4) * 5;
    const baseY = (i * 233) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.137 + 0.06) % 1) + Math.sin(t * 0.5 + i) * 30;
    const sym = SYMBOLS[i % SYMBOLS.length];
    const scale = 0.7 + (i % 3) * 0.22;
    const glow = 0.55 + 0.4 * Math.abs(Math.sin(t * (1.2 + (i % 3) * 0.4) + i));
    return { x, y, sym, scale, glow };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="denWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F2C2C" />
          <stop offset="55%" stopColor="#173B38" />
          <stop offset="100%" stopColor="#204A42" />
        </linearGradient>
        <radialGradient id="denLamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE1A0" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFE1A0" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={width} height={height} fill="url(#denWall)" />

      {/* a warm lamp glow, upper area, clear of the sim/UI band below */}
      <ellipse cx={width * 0.5} cy={height * 0.02} rx={width * 0.65} ry={height * 0.3} fill="url(#denLamp)" />

      {/* bookshelves along the very top edge — set dressing, not competing with the UI */}
      {shelves.map((s, si) => (
        <g key={si} opacity={0.5}>
          <rect x={0} y={s.y} width={width} height={6} fill="#0A1E1E" />
          {(() => {
            let x = 20;
            return s.books.map((b, i) => {
              const bx = x;
              x += b.w + 6;
              return <rect key={i} x={bx} y={s.y - b.h} width={b.w} height={b.h} rx={3} fill={i % 2 === 0 ? "#2E5C52" : "#3A6B5E"} />;
            });
          })()}
        </g>
      ))}

      {/* drifting operator symbols, glowing like fireflies */}
      {motes.map((m, i) => (
        <text
          key={i}
          x={m.x}
          y={m.y}
          fontSize={34 * m.scale}
          fontWeight={700}
          fill="#FFE1A0"
          opacity={m.glow}
          textAnchor="middle"
          style={{ filter: "drop-shadow(0 0 6px rgba(255,225,160,0.7))" }}
        >
          {m.sym}
        </text>
      ))}

      {/* floor */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="#0A1F1E" />
      <rect x={0} y={height * 0.74} width={width} height={7} fill="#FFC46B" opacity={0.5} />
    </svg>
  );
};
