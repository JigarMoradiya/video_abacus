// HERO HQ, AT SUNRISE — the same rooftop as reel 1's HeroHQ, flipped to a true dawn instead of
// midnight. The first pass here was a flat midday-blue sky, which read as pale next to reel 1's
// rich navy-and-neon night — "different" but not "as good". A real sunrise (warm coral-to-gold
// horizon glow, a big low sun, dark silhouetted buildings) has the same dramatic contrast reel 1
// has, just in a completely different palette: warm instead of cool, dawn instead of midnight.

import React from "react";

// Three distinct puff arrangements, not one shape scaled to different sizes — every cloud
// sharing one silhouette is what made five clouds read as five copies of the same sticker.
const CLOUD_VARIANTS: { cx: number; cy: number; r: number }[][] = [
  // wide and bumpy, six puffs
  [
    { cx: -62, cy: -2, r: 30 },
    { cx: -26, cy: -22, r: 40 },
    { cx: 16, cy: -27, r: 45 },
    { cx: 58, cy: -9, r: 35 },
    { cx: 84, cy: 6, r: 22 },
    { cx: -6, cy: 2, r: 39 },
  ],
  // small and round, four puffs, compact
  [
    { cx: -36, cy: 6, r: 32 },
    { cx: -2, cy: -18, r: 42 },
    { cx: 34, cy: 2, r: 33 },
    { cx: 8, cy: 12, r: 26 },
  ],
  // long and low, five puffs, flatter profile
  [
    { cx: -74, cy: 8, r: 24 },
    { cx: -40, cy: -10, r: 32 },
    { cx: -4, cy: -17, r: 37 },
    { cx: 32, cy: -6, r: 30 },
    { cx: 64, cy: 8, r: 22 },
  ],
];

export const HeroHQDay: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  // Real drift this time — the first pass moved ~2-4px/sec, which is under 250px across the
  // WHOLE video; at any given moment it read as motionless. Each cloud now crosses the frame
  // at its own speed (18-38px/sec) with a little vertical bob, properly wrapping both edges
  // (a plain `%` on a value that can go negative snaps a cloud offscreen instead of looping).
  const SPAN = width + 460;
  const clouds = Array.from({ length: 5 }, (_, i) => {
    const speed = 18 + (i % 4) * 5;
    const baseX = (i * 233) % SPAN;
    const x = mod(baseX + t * speed, SPAN) - 230;
    const y = height * (0.09 + (i % 3) * 0.075) + Math.sin(t * 0.2 + i * 1.7) * 8;
    const scale = 0.65 + (i % 3) * 0.24;
    return { x, y, scale, variant: i % CLOUD_VARIANTS.length };
  });

  const buildings = Array.from({ length: 9 }, (_, i) => {
    const w = 90 + ((i * 37) % 60);
    const h = 150 + ((i * 83) % 200);
    return { w, h, x: (i / 9) * width - 40 };
  });

  const sunPulse = 0.85 + Math.sin(t * 0.5) * 0.08;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        {/* deep plum at the top, through rose, to a bright gold horizon — a real dawn, not a
            flat midday blue */}
        <linearGradient id="hqDawnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2B2560" />
          <stop offset="32%" stopColor="#7A3E78" />
          <stop offset="58%" stopColor="#E8637A" />
          <stop offset="78%" stopColor="#FFA35C" />
          <stop offset="100%" stopColor="#FFDD8A" />
        </linearGradient>
        <radialGradient id="hqSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6DA" stopOpacity={0.98} />
          <stop offset="35%" stopColor="#FFD37A" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#FF9D4D" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="hqRoofDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A2A4A" />
          <stop offset="100%" stopColor="#241A32" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#hqDawnSky)" />

      {/* the sun — kept in the upper corner, clear of the alert/abacus/hero band below, but
          warm and glowing; the RICH GRADIENT is what carries "sunrise" through the busy
          middle of the frame where the sun disc itself can't sit without colliding with the
          UI. */}
      <circle cx={width * 0.78} cy={height * 0.13} r={240 * sunPulse} fill="url(#hqSun)" />
      <circle cx={width * 0.78} cy={height * 0.13} r={58} fill="#FFF3D2" />

      {/* drifting clouds — three different puff arrangements (wide/bumpy, small/round,
          long/flat) so five clouds on screen read as five different clouds, not one shape
          copy-pasted at different sizes. */}
      {clouds.map((c, i) => (
        <g key={i} transform={`translate(${c.x} ${c.y}) scale(${c.scale})`} opacity={0.92}>
          {CLOUD_VARIANTS[c.variant].map((p, k) => (
            <circle key={k} cx={p.cx} cy={p.cy} r={p.r} fill="#FFFFFF" />
          ))}
        </g>
      ))}

      {/* city skyline — DARK silhouettes against the glow, the same "shape reads because of
          contrast, not colour" trick reel 1's night skyline uses, just against a warm sky
          instead of a cool one */}
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={height * 0.72 - b.h} width={b.w} height={b.h} fill="#2A2038" />
          {Array.from({ length: Math.floor(b.h / 34) }, (_, r) =>
            Array.from({ length: Math.max(1, Math.floor(b.w / 28)) }, (_, c) => {
              const lit = (i * 7 + r * 3 + c) % 5 === 0;
              return lit ? (
                <rect
                  key={`${r}-${c}`}
                  x={b.x + 10 + c * 28}
                  y={height * 0.72 - b.h + 14 + r * 34}
                  width={12}
                  height={16}
                  fill="#FFD9A0"
                  opacity={0.85}
                />
              ) : null;
            })
          )}
        </g>
      ))}

      {/* the rooftop itself — a deep plum surface catching the warm rim light, not a flat
          sand-beige slab */}
      <rect x={0} y={height * 0.72} width={width} height={height * 0.28} fill="url(#hqRoofDay)" />
      <rect x={0} y={height * 0.72} width={width} height={10} fill="#FFB877" opacity={0.7} />
      {/* a low ledge/railing along the front edge */}
      {Array.from({ length: Math.ceil(width / 70) }, (_, i) => (
        <rect key={i} x={i * 70 + 10} y={height * 0.72 - 34} width={8} height={34} fill="#4A3658" opacity={0.9} />
      ))}
    </svg>
  );
};
