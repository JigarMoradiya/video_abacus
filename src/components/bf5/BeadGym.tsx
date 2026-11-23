// THE BEAD GYM — the world of Big Friend 5, a calm check-up / speed-drill. Soft sky-blue, peach and
// leaf-green: a bright training room with big windows onto green trees, wall bars, a couple of posters, a
// potted plant, a green gym MAT as the ledge (a wooden bench front under it), a calm blue board for the
// lesson, and a peach parquet floor with white court lines. BACKGROUND only; busy shapes stay at the
// margins. `burst` adds a soft sparkle on a celebration; `calm` quiets the decoration; `done` (0..4)
// brightens the room a little with every drill.

import React from "react";

export const BeadGym: React.FC<{ width: number; height: number; frame: number; fps: number; burst?: number; counterY?: number; calm?: number; done?: number }> = ({
  width,
  height,
  frame,
  fps,
  burst = 0,
  counterY = 600,
  calm = 0,
  done = 0,
}) => {
  const t = frame / fps;
  const cx = width / 2;
  const floorY = height * 0.775;
  const decor = 1 - 0.5 * calm;
  const winTop = 150;
  const winH = Math.max(210, counterY - winTop - 60);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="bgWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A9DBFA" />
          <stop offset="100%" stopColor="#E6F6FF" />
        </linearGradient>
        <linearGradient id="bgFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD2AE" />
          <stop offset="100%" stopColor="#FFB88C" />
        </linearGradient>
        <linearGradient id="bgBoard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4A8DB5" />
          <stop offset="100%" stopColor="#3A769E" />
        </linearGradient>
        <linearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8FD3FF" />
          <stop offset="100%" stopColor="#D8F1FF" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#bgWall)" />

      {/* soft light from the windows */}
      <g opacity={(0.16 + burst * 0.15 + done * 0.02) * decor}>
        <path d={`M 120 ${winTop} L 520 ${counterY} L 20 ${counterY} Z`} fill="#FFFFFF" />
        <path d={`M ${width - 120} ${winTop} L ${width - 520} ${counterY} L ${width - 20} ${counterY} Z`} fill="#FFFFFF" />
      </g>

      {/* two big windows with trees outside */}
      <g opacity={decor}>
        {[60, 640].map((wx, k) => (
          <g key={k} transform={`translate(${wx} ${winTop})`}>
            <rect width={380} height={winH} rx={18} fill="url(#bgSky)" stroke="#FFFFFF" strokeWidth={14} />
            <ellipse cx={90 + Math.sin(t * 0.3 + k) * 8} cy={winH * 0.28} rx={64} ry={26} fill="#FFFFFF" opacity={0.9} />
            <ellipse cx={270 + Math.sin(t * 0.25 + k * 2) * 10} cy={winH * 0.42} rx={52} ry={20} fill="#FFFFFF" opacity={0.85} />
            <path d={`M 0 ${winH} V ${winH * 0.72} Q 90 ${winH * 0.5} 190 ${winH * 0.72} T 380 ${winH * 0.68} V ${winH} Z`} fill="#7CCB5A" />
            {[70, 200, 320].map((tx, i) => (
              <g key={i} transform={`translate(${tx} ${winH * 0.74})`}>
                <rect x={-6} y={0} width={12} height={winH * 0.2} fill="#9A6B3A" />
                <circle cy={-14} r={34} fill="#3FA34D" />
                <circle cx={-18} cy={4} r={24} fill="#4CB85A" />
                <circle cx={18} cy={4} r={24} fill="#4CB85A" />
              </g>
            ))}
            <path d={`M 190 0 V ${winH} M 0 ${winH / 2} H 380`} stroke="#FFFFFF" strokeWidth={10} />
          </g>
        ))}
      </g>

      {/* wall bars (a gym ladder) at the edge, and a poster */}
      <g opacity={0.9 * decor}>
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${k === 0 ? 8 : width - 70} ${counterY - 380})`}>
            <rect x={0} y={0} width={10} height={380} fill="#D9A15F" stroke="#7A5530" strokeWidth={3} />
            <rect x={50} y={0} width={10} height={380} fill="#D9A15F" stroke="#7A5530" strokeWidth={3} />
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x={0} y={20 + i * 40} width={60} height={9} rx={4} fill="#E8B878" stroke="#7A5530" strokeWidth={2.5} />
            ))}
          </g>
        ))}
        <g transform={`translate(${cx - 70} ${winTop + 8})`}>
          <rect width={140} height={100} rx={8} fill="#FFFFFF" stroke="#7A5530" strokeWidth={5} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <path d={`M 18 ${30 + r * 22} H 122`} stroke="#9A6B3A" strokeWidth={4} />
              {[0, 1, 2, 3].map((b) => (
                <ellipse key={b} cx={34 + b * 24 + (r % 2) * 8} cy={30 + r * 22} rx={9} ry={6} fill={["#FF8A5B", "#6CC24A", "#2F7FBF"][r]} />
              ))}
            </g>
          ))}
        </g>
      </g>

      {/* the ledge: a green gym mat on a wooden bench */}
      <g>
        <rect x={-10} y={counterY - 2} width={width + 20} height={34} rx={14} fill="#8ADB6A" stroke="#2F6B3A" strokeWidth={6} />
        <rect x={-10} y={counterY - 2} width={width + 20} height={10} rx={5} fill="#FFFFFF" opacity={0.4} />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M ${i * 52 + 14} ${counterY + 14} h 22`} stroke="#2F6B3A" strokeWidth={4} strokeLinecap="round" opacity={0.5} />
        ))}
        <rect x={-10} y={counterY + 30} width={width + 20} height={66} fill="#F0BE8A" stroke="#7A5530" strokeWidth={6} />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${i * 100 + 40} ${counterY + 34} V ${counterY + 92}`} stroke="#7A5530" strokeWidth={3} opacity={0.5} />
        ))}
        <rect x={-10} y={counterY + 90} width={width + 20} height={10} fill="#7A5530" opacity={0.35} />
      </g>

      {/* a potted plant on the right of the bench */}
      <g opacity={decor} transform={`translate(${width - 96} ${counterY + 30})`}>
        <path d="M -30 0 L -22 -50 H 22 L 30 0 Z" fill="#D9774A" stroke="#7A3A1E" strokeWidth={4} strokeLinejoin="round" />
        {[-40, -14, 14, 40].map((lx, i) => (
          <path key={i} d={`M 0 -50 Q ${lx * 1.6} ${-110 - (i % 2) * 30} ${lx} ${-150 - (i % 2) * 20 + Math.sin(t * 1.4 + i) * 4}`} stroke="#2F8F46" strokeWidth={14} fill="none" strokeLinecap="round" />
        ))}
      </g>

      {/* the calm blue board the lesson sits on */}
      <rect x={20} y={counterY + 118} width={width - 40} height={floorY - counterY - 118 - 8} rx={44} fill="url(#bgBoard)" opacity={0.95} />
      <rect x={34} y={counterY + 132} width={width - 68} height={floorY - counterY - 118 - 36} rx={34} fill="none" stroke="#FFFFFF" strokeOpacity={0.45} strokeWidth={4} strokeDasharray="4 16" strokeLinecap="round" />

      {/* the floor: peach parquet with court lines */}
      <g>
        <rect x={0} y={floorY} width={width} height={height - floorY} fill="url(#bgFloor)" />
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${cx + (i - 5) * 80} ${floorY} L ${cx + (i - 5) * 210} ${height}`} stroke="#E79A68" strokeWidth={3} opacity={0.5} />
        ))}
        <path d={`M ${cx - 400} ${height - 40} Q ${cx} ${floorY + 10} ${cx + 400} ${height - 40}`} stroke="#FFFFFF" strokeWidth={10} fill="none" opacity={0.7} strokeLinecap="round" />
        <rect x={0} y={floorY} width={width} height={12} fill="#6CC24A" />
        <rect x={0} y={floorY + 12} width={width} height={6} fill="#2F6B3A" opacity={0.3} />
      </g>
    </svg>
  );
};
