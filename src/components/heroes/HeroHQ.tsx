// HERO HQ — a rooftop at night, overlooking a comic-book city. New territory for the series on
// purpose: nothing in E01-E10 has done a night skyline with searchlights. Standalone (not
// World.tsx) because this reel isn't built on the abacus-centric SceneStage pipeline at all.

import React from "react";

export const HeroHQ: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const sweepA = Math.sin(t * 0.6) * 26;
  const sweepB = Math.sin(t * 0.5 + 1.7) * 26;

  // A simple skyline: a row of rectangles, varied height, a few lit windows each.
  const buildings = Array.from({ length: 9 }, (_, i) => {
    const w = 90 + ((i * 37) % 60);
    const h = 160 + ((i * 83) % 220);
    return { w, h, x: (i / 9) * width - 40 };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="hqSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E1240" />
          <stop offset="55%" stopColor="#1C2460" />
          <stop offset="100%" stopColor="#2E1E52" />
        </linearGradient>
        <linearGradient id="hqBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FD8FF" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#8FD8FF" stopOpacity={0} />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#hqSky)" />

      {/* stars */}
      {Array.from({ length: 26 }, (_, i) => {
        const sx = (i * 137) % width;
        const sy = (i * 71) % (height * 0.5);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i));
        return <circle key={i} cx={sx} cy={sy} r={2 + (i % 3)} fill="#FFF" opacity={tw * 0.7} />;
      })}

      {/* two sweeping searchlights — anchored at the TOP edge, reaching only down to about
          a third of the frame. They used to shoot up from the rooftop and cross behind the
          alarm console/heroes; kept to the top band, they read as sky dressing instead of
          cutting through the action. */}
      <g transform={`translate(${width * 0.3} 0) rotate(${sweepA})`}>
        <path d={`M 0 0 L -90 ${height * 0.34} L 90 ${height * 0.34} Z`} fill="url(#hqBeam)" />
      </g>
      <g transform={`translate(${width * 0.7} 0) rotate(${sweepB})`}>
        <path d={`M 0 0 L -90 ${height * 0.34} L 90 ${height * 0.34} Z`} fill="url(#hqBeam)" />
      </g>

      {/* city skyline silhouette */}
      {buildings.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={height * 0.72 - b.h} width={b.w} height={b.h} fill="#141A38" />
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
                  fill="#FFD873"
                  opacity={0.8}
                />
              ) : null;
            })
          )}
        </g>
      ))}

      {/* the rooftop itself — the foreground surface the heroes stand on */}
      <rect x={0} y={height * 0.72} width={width} height={height * 0.28} fill="#0C1024" />
      <rect x={0} y={height * 0.72} width={width} height={10} fill="#1C2460" />
      {/* a low ledge/railing along the front edge */}
      {Array.from({ length: Math.ceil(width / 70) }, (_, i) => (
        <rect key={i} x={i * 70 + 10} y={height * 0.72 - 34} width={8} height={34} fill="#1C2460" opacity={0.8} />
      ))}
    </svg>
  );
};
