// MISTY CLIFFS — the dark backdrop for Zip & Dash's subtraction reel. Same characters as
// the adding reel, deliberately DIFFERENT backdrop: NightDojoWorld is indigo/violet with a
// crescent moon, twinkling stars and pagoda-roof silhouettes; this one is a cooler teal-green
// aurora-tinged sky with jagged cliff silhouettes and drifting fog instead of stars, so a
// viewer can tell the two reels apart at a glance even with the same cast.

import React from "react";

export const NightCliffWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  // real clouds are lumpy clusters of puffs, not one flat ellipse — same fix the daytime
  // reels needed for the same complaint. Three variants so they don't all read as one
  // shape copy-pasted across the sky, tinted pale mint to sit inside this reel's palette.
  const PUFF_VARIANTS: { dx: number; dy: number; r: number }[][] = [
    [{ dx: -60, dy: 6, r: 34 }, { dx: -20, dy: -10, r: 42 }, { dx: 24, dy: -4, r: 38 }, { dx: 62, dy: 8, r: 30 }, { dx: 10, dy: 14, r: 30 }],
    [{ dx: -34, dy: 4, r: 26 }, { dx: 0, dy: -8, r: 32 }, { dx: 32, dy: 4, r: 24 }],
    [{ dx: -70, dy: 4, r: 24 }, { dx: -34, dy: -6, r: 30 }, { dx: 8, dy: -2, r: 28 }, { dx: 46, dy: 6, r: 26 }],
  ];

  const fog = Array.from({ length: 7 }, (_, i) => {
    const baseX = (i * 191) % width;
    const speed = 5 + (i % 3) * 3;
    const x = mod(baseX + t * speed, width + 260) - 130;
    const y = height * (0.08 + (i % 4) * 0.08);
    const scale = (0.75 + (i % 3) * 0.22);
    return { x, y, scale, opacity: 0.16 + (i % 3) * 0.05, puffs: PUFF_VARIANTS[i % PUFF_VARIANTS.length] };
  });

  const auroraShift = Math.sin(t * 0.25) * 30;

  // a jagged cliff silhouette, built from a zig-zag path
  const cliffPath = (baseY: number, amp: number, seedOffset: number) => {
    const pts: string[] = [`M 0,${height}`];
    const step = 90;
    for (let x = 0; x <= width + step; x += step) {
      const y = baseY - Math.abs(Math.sin((x + seedOffset) * 0.012)) * amp - ((x + seedOffset) % 3) * 6;
      pts.push(`L ${x},${y}`);
    }
    pts.push(`L ${width},${height} Z`);
    return pts.join(" ");
  };

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="cliffSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E2A2E" />
          <stop offset="55%" stopColor="#163C3E" />
          <stop offset="100%" stopColor="#1F4A48" />
        </linearGradient>
        <radialGradient id="auroraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3FE0B0" stopOpacity={0.32} />
          <stop offset="60%" stopColor="#3FE0B0" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#3FE0B0" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="cliffGround" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B2422" />
          <stop offset="100%" stopColor="#071615" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#cliffSky)" />

      <ellipse cx={width * 0.5 + auroraShift} cy={height * 0.13} rx={width * 0.62} ry={height * 0.16} fill="url(#auroraGlow)" />

      {fog.map((f, i) => (
        <g key={i} transform={`translate(${f.x},${f.y}) scale(${f.scale})`} opacity={f.opacity}>
          {f.puffs.map((puff, j) => (
            <circle key={j} cx={puff.dx} cy={puff.dy} r={puff.r} fill="#BEEFDD" />
          ))}
        </g>
      ))}

      <path d={cliffPath(height * 0.62, 90, 0)} fill="#0F2E2C" opacity={0.9} />
      <path d={cliffPath(height * 0.7, 70, 240)} fill="#0A2220" />

      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="url(#cliffGround)" />
      <rect x={0} y={height * 0.74} width={width} height={6} fill="#2B5C56" opacity={0.6} />
    </svg>
  );
};
