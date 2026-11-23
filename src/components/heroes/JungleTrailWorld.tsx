// JUNGLE TRAIL — a deep-green jungle clearing: tall leaf silhouettes, drifting fireflies and
// leaves, and a winding dirt-path floor. A TWENTIETH distinct palette in the series — not the
// indigo dojo, coral dawn, navy HeroHQ, maroon bingo hall, teal/amber den, violet-plum sky,
// charcoal noir office, sunny archery field, blueprint workshop, lavender puzzle study,
// fresh-green pond, candy mosaic plaza, warm autumn treetop, icy arctic floe, deep-sea lagoon,
// chalkboard classroom, or circus big top that came before it. A trail-following snake gets an
// actual winding trail to live on.

import React from "react";

export const JungleTrailWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const motes = Array.from({ length: 10 }, (_, i) => {
    const speed = 7 + (i % 4) * 4;
    const baseY = (i * 229) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.139 + 0.04) % 1) + Math.sin(t * 0.5 + i) * 22;
    const isFirefly = i % 3 === 0;
    const scale = 0.5 + (i % 3) * 0.2;
    return { x, y, isFirefly, scale };
  });

  const floorTop = height * 0.76;
  const floorH = height * 0.24;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="jungleSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E6B44" />
          <stop offset="55%" stopColor="#1F4E33" />
          <stop offset="100%" stopColor="#123322" />
        </linearGradient>
        <linearGradient id="jungleFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A5A34" />
          <stop offset="100%" stopColor="#573F22" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#jungleSky)" />
      <circle cx={width * 0.85} cy={height * 0.08} r={width * 0.13} fill="#FFF3D0" opacity={0.3} />

      {/* tall leaf silhouettes framing the edges */}
      {[0.02, 0.16, 0.84, 0.96].map((fx, i) => (
        <path
          key={i}
          d={`M ${width * fx} ${height * 0.4} Q ${width * fx + (i % 2 === 0 ? 60 : -60)} ${height * 0.15} ${width * fx} 0 Q ${width * fx - (i % 2 === 0 ? 60 : -60)} ${height * 0.15} ${width * fx} ${height * 0.4} Z`}
          fill="#0F2A1C"
          opacity={0.55}
        />
      ))}

      {/* drifting fireflies + leaves */}
      {motes.map((m, i) =>
        m.isFirefly ? (
          <circle key={i} cx={m.x} cy={m.y} r={5 * m.scale} fill="#FFEDA0" opacity={0.7 + Math.sin(t * 3 + i) * 0.3} />
        ) : (
          <ellipse key={i} cx={m.x} cy={m.y} rx={11 * m.scale} ry={6 * m.scale} fill="#4A8C5E" opacity={0.55} transform={`rotate(${Math.sin(t * 0.8 + i) * 30} ${m.x} ${m.y})`} />
        )
      )}

      {/* winding dirt-path floor */}
      <rect x={0} y={floorTop} width={width} height={floorH} fill="url(#jungleFloor)" />
      <rect x={0} y={floorTop} width={width} height={7} fill="#F0E0C0" opacity={0.35} />
      <path
        d={`M 0 ${floorTop + floorH * 0.5} Q ${width * 0.25} ${floorTop + floorH * 0.3} ${width * 0.5} ${floorTop + floorH * 0.55} T ${width} ${floorTop + floorH * 0.4}`}
        stroke="#D9C08A"
        strokeWidth={14}
        fill="none"
        opacity={0.3}
      />
    </svg>
  );
};
