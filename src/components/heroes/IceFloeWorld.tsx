// ICE FLOE — a crisp arctic scene: a pale cyan-to-blue sky, drifting snowflakes, and a floor
// of cracked ice floes with a soft blue glow. A FIFTEENTH distinct palette in the series — not
// the indigo dojo, coral dawn, navy HeroHQ, maroon bingo hall, teal/amber den, violet-plum
// sky, charcoal noir office, sunny archery field, blueprint workshop, lavender puzzle study,
// fresh-green pond, candy mosaic plaza, or warm autumn treetop that came before it. A sliding
// game gets a slippery world.

import React from "react";

export const IceFloeWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const SPAN = height + 260;
  const flakes = Array.from({ length: 10 }, (_, i) => {
    const speed = 7 + (i % 4) * 4;
    const baseY = (i * 223) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 120;
    const x = width * ((i * 0.131 + 0.04) % 1) + Math.sin(t * 0.5 + i) * 24;
    const scale = 0.5 + (i % 3) * 0.22;
    return { x, y, scale, spin: t * 24 + i * 36 };
  });

  const floorTop = height * 0.76;
  const floorH = height * 0.24;
  const cracks = Array.from({ length: 4 }, (_, i) => ({
    x: width * (0.15 + i * 0.24),
    wobble: Math.sin(t * 0.5 + i * 0.9) * 8,
  }));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="iceSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EAF7FF" />
          <stop offset="55%" stopColor="#CDEBFA" />
          <stop offset="100%" stopColor="#9FD3F0" />
        </linearGradient>
        <linearGradient id="iceFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#CDEEFB" />
          <stop offset="100%" stopColor="#8FC3E0" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#iceSky)" />
      <circle cx={width * 0.85} cy={height * 0.07} r={width * 0.13} fill="#FFFFFF" opacity={0.45} />

      {/* soft distant ice-mountain silhouettes for depth */}
      <path d={`M 0 ${height * 0.32} L ${width * 0.18} ${height * 0.2} L ${width * 0.34} ${height * 0.32} Z`} fill="#BFE3F5" opacity={0.5} />
      <path d={`M ${width * 0.6} ${height * 0.34} L ${width * 0.8} ${height * 0.18} L ${width} ${height * 0.34} Z`} fill="#AEDBF2" opacity={0.5} />

      {/* drifting snowflakes */}
      {flakes.map((s, i) => (
        <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.spin}) scale(${s.scale})`} opacity={0.7}>
          <path d="M 0 -12 L 0 12 M -12 0 L 12 0 M -8 -8 L 8 8 M -8 8 L 8 -8" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}

      {/* the ice-floor with cracks */}
      <rect x={0} y={floorTop} width={width} height={floorH} fill="url(#iceFloor)" />
      <rect x={0} y={floorTop} width={width} height={7} fill="#FFFFFF" opacity={0.5} />
      {cracks.map((c, i) => (
        <path
          key={i}
          d={`M ${c.x} ${floorTop} q ${c.wobble} ${floorH * 0.3}, 0 ${floorH * 0.6} t ${-c.wobble} ${floorH * 0.35}`}
          stroke="#5FA8CC"
          strokeWidth={3}
          fill="none"
          opacity={0.4}
        />
      ))}
    </svg>
  );
};
