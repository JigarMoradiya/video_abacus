// DEEP SEA LAGOON — a rich teal-to-navy underwater scene: drifting bubbles, soft coral
// silhouettes, and a sandy seafloor with gentle light-ray glints. A SIXTEENTH distinct palette
// in the series — not the indigo dojo, coral dawn, navy HeroHQ, maroon bingo hall, teal/amber
// den, violet-plum sky, charcoal noir office, sunny archery field, blueprint workshop,
// lavender puzzle study, fresh-green pond, candy mosaic plaza, warm autumn treetop, or icy
// arctic floe that came before it. A multi-armed "juggle everything at once" critter gets a
// world with real depth behind it.

import React from "react";

export const DeepSeaLagoonWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const bubbles = Array.from({ length: 11 }, (_, i) => {
    const speed = 10 + (i % 4) * 6;
    const baseY = (i * 211) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.143 + 0.05) % 1) + Math.sin(t * 0.5 + i) * 20;
    const scale = 0.4 + (i % 3) * 0.22;
    return { x, y, scale };
  });

  const floorTop = height * 0.78;
  const floorH = height * 0.22;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="lagoonSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E7D82" />
          <stop offset="55%" stopColor="#1D5C74" />
          <stop offset="100%" stopColor="#123C56" />
        </linearGradient>
        <linearGradient id="lagoonFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D2C42" />
          <stop offset="100%" stopColor="#08202F" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#lagoonSky)" />

      {/* soft light-ray glints from above */}
      {[0.2, 0.5, 0.78].map((fx, i) => (
        <polygon
          key={i}
          points={`${width * fx - 40},0 ${width * fx + 40},0 ${width * fx + 90},${height * 0.7} ${width * fx - 90},${height * 0.7}`}
          fill="#BFEFEF"
          opacity={0.06}
        />
      ))}

      {/* distant coral silhouettes for depth */}
      <path d={`M 0 ${height * 0.74} Q ${width * 0.08} ${height * 0.6} ${width * 0.18} ${height * 0.74} Z`} fill="#1B4D5C" opacity={0.6} />
      <path d={`M ${width * 0.78} ${height * 0.76} Q ${width * 0.9} ${height * 0.58} ${width} ${height * 0.76} Z`} fill="#1B4D5C" opacity={0.6} />

      {/* drifting bubbles */}
      {bubbles.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={10 * b.scale} fill="none" stroke="#CFF3F0" strokeWidth={2} opacity={0.5} />
      ))}

      {/* sandy seafloor */}
      <rect x={0} y={floorTop} width={width} height={floorH} fill="url(#lagoonFloor)" />
      <rect x={0} y={floorTop} width={width} height={6} fill="#7FE0D6" opacity={0.35} />
      {[0.18, 0.5, 0.82].map((fx, i) => (
        <ellipse key={i} cx={width * fx} cy={floorTop + floorH * 0.55} rx={50} ry={14} fill="#0A2233" opacity={0.5} />
      ))}
    </svg>
  );
};
