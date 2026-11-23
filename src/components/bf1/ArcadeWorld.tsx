// THE ARCADE GRAND OPENING — a very colourful, saturated, kid-bright world for the Big Friend
// shorts: a hot-pink to violet wall with a slowly turning sunburst, bunting swaying across the top,
// colourful arcade cabinets with flickering screens at the edges, rising balloons, twinkling
// confetti stars and a teal-and-cream checkerboard floor. Every motion is a pure function of the
// frame. It is BACKGROUND only — nothing here is guarded content, so it keeps its busy shapes at
// the margins and low-contrast behind the middle where the abacus and cards sit.
//
// `burst` (0..1) pumps the sunburst and sparkle density on a celebration beat.

import React from "react";

const BALLOONS = [
  { x: 56, c: "#FFE156", s: 1.0, ph: 0.0, base: 1180 },
  { x: 118, c: "#3DE0B5", s: 0.82, ph: 0.9, base: 1040 },
  { x: 36, c: "#FF5A36", s: 0.9, ph: 1.7, base: 900 },
  { x: 1026, c: "#2F7BFF", s: 1.0, ph: 0.4, base: 1170 },
  { x: 962, c: "#FF4FA3", s: 0.84, ph: 1.3, base: 1030 },
  { x: 1046, c: "#FFE156", s: 0.9, ph: 2.2, base: 880 },
];

const BUNTING = ["#FFE156", "#FF5A36", "#3DE0B5", "#2F7BFF", "#FF4FA3", "#B04DFF"];

const Cabinet: React.FC<{ x: number; y: number; w: number; h: number; c: string; frame: number; seed: number }> = ({ x, y, w, h, c, frame, seed }) => {
  const flick = (Math.floor(frame / 7) + seed) % 4;
  const screens = ["#7DF9FF", "#FFE156", "#FF9BD2", "#9DFFB0"];
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M 0 ${h} v ${-h * 0.78} q 0 -22 22 -22 h ${w - 44} q 22 0 22 22 v ${h * 0.78} Z`} fill={c} stroke="#2A1430" strokeWidth={5} />
      <rect x={14} y={h * 0.14} width={w - 28} height={h * 0.3} rx={12} fill="#1B1F4B" stroke="#2A1430" strokeWidth={4} />
      <rect x={22} y={h * 0.14 + 8} width={w - 44} height={h * 0.3 - 16} rx={8} fill={screens[flick]} opacity={0.9} />
      <rect x={14} y={h * 0.5} width={w - 28} height={h * 0.14} rx={8} fill="#FFFFFF" opacity={0.25} />
      <circle cx={w * 0.3} cy={h * 0.58} r={9} fill="#FF3D5E" stroke="#2A1430" strokeWidth={3} />
      <circle cx={w * 0.55} cy={h * 0.58} r={9} fill="#FFE156" stroke="#2A1430" strokeWidth={3} />
      <circle cx={w * 0.78} cy={h * 0.58} r={9} fill="#3DE0B5" stroke="#2A1430" strokeWidth={3} />
    </g>
  );
};

export const ArcadeWorld: React.FC<{ width: number; height: number; frame: number; fps: number; burst?: number; counterY?: number; calm?: number }> = ({
  width,
  height,
  frame,
  fps,
  burst = 0,
  counterY = 752,
  calm = 0,
}) => {
  const t = frame / fps;
  const cx = width / 2;
  const rays = 20;
  const spin = t * 5 + burst * 12;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="bfWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF4FA3" />
          <stop offset="45%" stopColor="#B04DFF" />
          <stop offset="100%" stopColor="#5B34E8" />
        </linearGradient>
        <radialGradient id="bfGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3A8" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#FFF3A8" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="bfFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2FD7C4" />
          <stop offset="100%" stopColor="#1FA3C9" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#bfWall)" />

      {/* sunburst behind the machine */}
      <g transform={`translate(${cx} ${height * 0.3}) rotate(${spin})`} opacity={(0.16 + burst * 0.18) * (1 - 0.6 * calm)}>
        {Array.from({ length: rays }, (_, i) => {
          const a0 = (i / rays) * Math.PI * 2;
          const a1 = a0 + (Math.PI * 2) / rays / 2;
          const R = 1700;
          return (
            <path key={i} d={`M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} L ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill="#FFFFFF" />
          );
        })}
      </g>
      <circle cx={cx} cy={height * 0.3} r={460 + burst * 80} fill="url(#bfGlow)" />

      {/* twinkling stars/confetti */}
      {Array.from({ length: 34 }, (_, i) => {
        const sx = (i * 197 + 40) % width;
        const sy = (i * 113 + 60) % (height * 0.7);
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (1.6 + (i % 5) * 0.4) + i));
        const col = ["#FFE156", "#FFFFFF", "#7DF9FF", "#FF9BD2"][i % 4];
        const s = 5 + (i % 4) * 2 + burst * 4;
        return <path key={i} d={`M ${sx} ${sy - s * 1.6} L ${sx + s * 0.5} ${sy - s * 0.5} L ${sx + s * 1.6} ${sy} L ${sx + s * 0.5} ${sy + s * 0.5} L ${sx} ${sy + s * 1.6} L ${sx - s * 0.5} ${sy + s * 0.5} L ${sx - s * 1.6} ${sy} L ${sx - s * 0.5} ${sy - s * 0.5} Z`} fill={col} opacity={tw * 0.9} />;
      })}

      {/* disco light beams from the top corners */}
      <g opacity={0.2 * (1 - 0.6 * calm)}>
        <g transform={`translate(80 0) rotate(${Math.sin(t * 0.9) * 14 - 12})`}>
          <path d="M 0 0 L -120 900 L 120 900 Z" fill="#7DF9FF" />
        </g>
        <g transform={`translate(${width - 80} 0) rotate(${Math.sin(t * 0.8 + 1.4) * 14 + 12})`}>
          <path d="M 0 0 L -120 900 L 120 900 Z" fill="#FFE156" />
        </g>
      </g>

      {/* arcade cabinets standing behind the ticket counter, dimmed so the heroes read in front */}
      <g opacity={0.8 * (1 - 0.55 * calm)}>
        <Cabinet x={-20} y={counterY - 330} w={150} h={330} c="#FF5A36" frame={frame} seed={0} />
        <Cabinet x={width - 130} y={counterY - 330} w={150} h={330} c="#2F7BFF" frame={frame} seed={2} />
        <Cabinet x={118} y={counterY - 250} w={100} h={250} c="#FFB400" frame={frame} seed={1} />
        <Cabinet x={width - 218} y={counterY - 250} w={100} h={250} c="#3DE0B5" frame={frame} seed={3} />
      </g>

      {/* bunting: two swaying strings across the top */}
      <g opacity={1 - 0.5 * calm}>
      {[0, 1].map((row) => {
        const y0 = 128 + row * 46;
        const sag = 34 + row * 10;
        const n = 14;
        return (
          <g key={row}>
            <path d={`M -20 ${y0 - 10} Q ${cx} ${y0 + sag} ${width + 20} ${y0 - 10}`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.85} />
            {Array.from({ length: n }, (_, i) => {
              const u = (i + 0.5) / n;
              const px = -20 + u * (width + 40);
              const py = (1 - u) * (1 - u) * (y0 - 10) + 2 * u * (1 - u) * (y0 + sag) + u * u * (y0 - 10) + 2;
              const sw = Math.sin(t * 2.2 + i * 0.7 + row) * 6;
              return (
                <path
                  key={i}
                  d={`M ${px - 22} ${py} L ${px + 22} ${py} L ${px + sw} ${py + 46} Z`}
                  fill={BUNTING[(i + row * 2) % BUNTING.length]}
                  stroke="#2A1430"
                  strokeWidth={3}
                  strokeLinejoin="round"
                />
              );
            })}
          </g>
        );
      })}
      </g>

      {/* rising balloons at the margins */}
      <g opacity={1 - 0.55 * calm}>
      {BALLOONS.map((b, i) => {
        const bob = Math.sin(t * 0.9 + b.ph) * 22;
        const sway = Math.sin(t * 0.7 + b.ph * 2) * 12;
        const by = b.base - 360 + bob - burst * 40;
        return (
          <g key={i} transform={`translate(${b.x + sway} ${by}) scale(${b.s})`}>
            <path d={`M 0 90 q ${-8 + Math.sin(t * 1.4 + i) * 6} 80 0 170`} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.8} />
            <ellipse cx={0} cy={0} rx={50} ry={62} fill={b.c} stroke="#2A1430" strokeWidth={5} />
            <path d="M -34 -26 q 8 -26 28 -30" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.55} />
            <path d="M -9 62 l 9 12 l 9 -12 Z" fill={b.c} stroke="#2A1430" strokeWidth={4} strokeLinejoin="round" />
          </g>
        );
      })}
      </g>


      {/* the TICKET COUNTER: a long striped counter the machine and the heroes stand on */}
      <g>
        <rect x={-10} y={counterY - 2} width={width + 20} height={28} rx={14} fill="#FFD27A" stroke="#2A1430" strokeWidth={6} />
        <rect x={-10} y={counterY - 2} width={width + 20} height={10} rx={5} fill="#FFFFFF" opacity={0.45} />
        <rect x={-10} y={counterY + 24} width={width + 20} height={70} fill="#FF3D5E" stroke="#2A1430" strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={i * 84 - 20} y={counterY + 26} width={42} height={66} fill="#FFFFFF" opacity={0.9} />
        ))}
        <rect x={-10} y={counterY + 90} width={width + 20} height={10} fill="#2A1430" opacity={0.35} />
      </g>

      {/* the workspace board the abacus and the panel float on — a soft dark stage so every number reads */}
      <rect x={20} y={counterY + 112} width={width - 40} height={height * 0.775 - counterY - 112 - 8} rx={46} fill="#3A1B8A" opacity={0.5} />
      <rect x={20} y={counterY + 112} width={width - 40} height={height * 0.775 - counterY - 112 - 8} rx={46} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={5} />

      {/* the floor: teal checkerboard in gentle perspective */}
      <g>
        <rect x={0} y={height * 0.775} width={width} height={height * 0.225} fill="url(#bfFloor)" />
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 16 }, (_, c) => {
            const y0 = height * 0.775 + r * ((height * 0.225) / 6);
            const h = (height * 0.225) / 6;
            const w = (width / 12) * (1 + r * 0.16);
            const x0 = cx + (c - 8) * w;
            if ((r + c) % 2 === 0) return null;
            return <rect key={`${r}-${c}`} x={x0} y={y0} width={w} height={h} fill="#FFFFFF" opacity={0.28} />;
          })
        )}
        <rect x={0} y={height * 0.775} width={width} height={12} fill="#FFE156" />
        <rect x={0} y={height * 0.775 + 12} width={width} height={6} fill="#2A1430" opacity={0.25} />
      </g>
    </svg>
  );
};
