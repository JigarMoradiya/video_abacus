// CIRCUS BIG TOP — a warm red-and-cream striped tent interior: a spotlight glow from above,
// drifting confetti and streamers, and a sawdust-ring floor. A NINETEENTH distinct palette in
// the series — not the indigo dojo, coral dawn, navy HeroHQ, maroon bingo hall, teal/amber
// den, violet-plum sky, charcoal noir office, sunny archery field, blueprint workshop,
// lavender puzzle study, fresh-green pond, candy mosaic plaza, warm autumn treetop, icy
// arctic floe, deep-sea lagoon, or chalkboard classroom that came before it. A "watch closely,
// remember what you saw" game gets the classic showman's stage.

import React from "react";

export const CircusTentWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const confetti = Array.from({ length: 11 }, (_, i) => {
    const speed = 9 + (i % 4) * 5;
    const baseY = (i * 217) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.147 + 0.05) % 1) + Math.sin(t * 0.5 + i) * 22;
    const scale = 0.5 + (i % 3) * 0.2;
    const colors = ["#FFD54F", "#4FCB8D", "#3E8FE0", "#FFFFFF"];
    return { x, y, scale, spin: t * 30 + i * 40, fill: colors[i % colors.length] };
  });

  const floorTop = height * 0.76;
  const floorH = height * 0.24;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="tentSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A2530" />
          <stop offset="55%" stopColor="#5E1B24" />
          <stop offset="100%" stopColor="#3E1219" />
        </linearGradient>
        <radialGradient id="spotlight" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="#FFF3D0" stopOpacity={0.55} />
          <stop offset="100%" stopColor="#FFF3D0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="tentFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9955C" />
          <stop offset="100%" stopColor="#9C6E3D" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#tentSky)" />

      {/* red/cream striped tent ceiling wedges converging toward a center point */}
      {Array.from({ length: 7 }, (_, i) => {
        const cx = width / 2;
        const spread = width * 0.9;
        const x0 = cx + (i - 3.5) * (spread / 7);
        const x1 = cx + (i - 2.5) * (spread / 7);
        return (
          <polygon
            key={i}
            points={`${cx},-40 ${x0},${height * 0.34} ${x1},${height * 0.34}`}
            fill={i % 2 === 0 ? "#C94A4A" : "#FBEFE0"}
            opacity={0.5}
          />
        );
      })}
      <rect width={width} height={height} fill="url(#spotlight)" />

      {/* drifting confetti + streamers */}
      {confetti.map((c, i) => (
        <rect
          key={i}
          x={c.x - 6 * c.scale}
          y={c.y - 6 * c.scale}
          width={12 * c.scale}
          height={12 * c.scale}
          fill={c.fill}
          opacity={0.75}
          transform={`rotate(${c.spin} ${c.x} ${c.y})`}
        />
      ))}

      {/* sawdust-ring floor */}
      <rect x={0} y={floorTop} width={width} height={floorH} fill="url(#tentFloor)" />
      <rect x={0} y={floorTop} width={width} height={8} fill="#FBEFE0" opacity={0.4} />
      <ellipse cx={width / 2} cy={floorTop + floorH * 0.55} rx={width * 0.42} ry={floorH * 0.32} fill="none" stroke="#7A5230" strokeWidth={4} opacity={0.4} />
    </svg>
  );
};
