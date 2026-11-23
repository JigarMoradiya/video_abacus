// THE PRIZE SHOP — the world of Big Friend 3. Candy-bright mint, lemon and coral: a mint wall with a
// pastel rainbow behind the prize wall, a scalloped coral-and-white awning with hanging lollipops, plush
// shelves at the edges, a white shop counter with a mint front and a row of swirl lollipops, a green
// CHALKBOARD for the lesson, and a pink floor with sprinkles. BACKGROUND only: busy shapes live at the
// margins. `burst` pumps sparkle on a celebration beat; `calm` quiets the decoration while the lesson
// is the focus.

import React from "react";

const SWIRL = ["#FF6F6F", "#FFE45C", "#41D8B0", "#8E6CFF", "#FF9BD2"];
const SPRINKLE = ["#FF6F6F", "#FFE45C", "#41D8B0", "#8E6CFF", "#FFFFFF"];

export const PrizeShopWorld: React.FC<{ width: number; height: number; frame: number; fps: number; burst?: number; counterY?: number; calm?: number }> = ({
  width,
  height,
  frame,
  fps,
  burst = 0,
  counterY = 600,
  calm = 0,
}) => {
  const t = frame / fps;
  const cx = width / 2;
  const floorY = height * 0.775;
  const decor = 1 - 0.5 * calm;
  const stripes = 13;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="psWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6FE3C4" />
          <stop offset="60%" stopColor="#A8F2DB" />
          <stop offset="100%" stopColor="#D5FBEF" />
        </linearGradient>
        <linearGradient id="psFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF9DB8" />
          <stop offset="100%" stopColor="#FF6F96" />
        </linearGradient>
        <linearGradient id="psSlate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#25625C" />
          <stop offset="100%" stopColor="#173F3C" />
        </linearGradient>
        <pattern id="psDots" width="70" height="70" patternUnits="userSpaceOnUse">
          <circle cx="18" cy="18" r="6" fill="#FFFFFF" opacity="0.28" />
          <circle cx="53" cy="53" r="6" fill="#FFFFFF" opacity="0.28" />
        </pattern>
      </defs>

      <rect width={width} height={height} fill="url(#psWall)" />
      <rect width={width} height={counterY} fill="url(#psDots)" opacity={decor} />

      {/* a pastel rainbow behind the prize wall */}
      <g opacity={0.55 * decor}>
        {["#FF6F6F", "#FFB347", "#FFE45C", "#6FE38C", "#6FB7FF", "#B58CFF"].map((c, i) => (
          <path key={i} d={`M ${cx - 470 + i * 26} ${counterY} A ${470 - i * 26} ${470 - i * 26} 0 0 1 ${cx + 470 - i * 26} ${counterY}`} stroke={c} strokeWidth={26} fill="none" />
        ))}
      </g>

      {/* sparkles */}
      {Array.from({ length: 26 }, (_, i) => {
        const sx = (i * 173 + 50) % width;
        const sy = 130 + ((i * 97 + 30) % Math.max(200, counterY - 140));
        const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * (1.4 + (i % 5) * 0.4) + i));
        const s = 5 + (i % 4) * 2 + burst * 4;
        return <path key={i} d={`M ${sx} ${sy - s * 1.6} L ${sx + s * 0.5} ${sy - s * 0.5} L ${sx + s * 1.6} ${sy} L ${sx + s * 0.5} ${sy + s * 0.5} L ${sx} ${sy + s * 1.6} L ${sx - s * 0.5} ${sy + s * 0.5} L ${sx - s * 1.6} ${sy} L ${sx - s * 0.5} ${sy - s * 0.5} Z`} fill={i % 2 ? "#FFFFFF" : "#FFE45C"} opacity={tw * 0.85 * decor} />;
      })}

      {/* plush shelves at the margins */}
      <g opacity={0.85 * decor}>
        {[40, width - 120].map((sx, k) => (
          <g key={k} transform={`translate(${sx} ${counterY - 250})`}>
            <rect x={0} y={96} width={92} height={10} rx={4} fill="#FF6F6F" stroke="#3B1F4E" strokeWidth={3} />
            <rect x={0} y={206} width={92} height={10} rx={4} fill="#FF6F6F" stroke="#3B1F4E" strokeWidth={3} />
            {[0, 1].map((r) => (
              <g key={r} transform={`translate(${46} ${96 + r * 110 - 6})`}>
                <circle cy={-24} r={22} fill={SWIRL[(k + r) % 5]} stroke="#3B1F4E" strokeWidth={3} />
                <circle cx={-16} cy={-42} r={9} fill={SWIRL[(k + r) % 5]} stroke="#3B1F4E" strokeWidth={3} />
                <circle cx={16} cy={-42} r={9} fill={SWIRL[(k + r) % 5]} stroke="#3B1F4E" strokeWidth={3} />
                <circle cx={-7} cy={-28} r={3.5} fill="#3B1F4E" />
                <circle cx={7} cy={-28} r={3.5} fill="#3B1F4E" />
              </g>
            ))}
          </g>
        ))}
      </g>

      {/* the awning: coral-and-white stripes with a scalloped edge, and hanging lollipops */}
      <g opacity={1}>
        {Array.from({ length: stripes }, (_, i) => {
          const w = (width + 40) / stripes;
          const x = -20 + i * w;
          return (
            <g key={i}>
              <rect x={x} y={-10} width={w + 1} height={104} fill={i % 2 ? "#FFFFFF" : "#FF6F6F"} />
              <path d={`M ${x} 94 a ${w / 2} ${w / 2} 0 0 0 ${w} 0 Z`} fill={i % 2 ? "#FFFFFF" : "#FF6F6F"} stroke="#3B1F4E" strokeWidth={4} />
            </g>
          );
        })}
        <rect x={0} y={-10} width={width} height={104} fill="none" />
        {[150, 400, 690, 930].map((lx, i) => {
          const sw = Math.sin(t * 1.6 + i) * 4;
          return (
            <g key={i} transform={`translate(${lx + sw} 130)`} opacity={decor}>
              <path d="M 0 -30 V 38" stroke="#FFFFFF" strokeWidth={4} />
              <circle cy={64} r={26} fill={SWIRL[i % 5]} stroke="#3B1F4E" strokeWidth={4} />
              <path d="M 0 64 m -14 0 a 14 14 0 1 1 14 14 a 8 8 0 1 1 -8 -8" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" />
            </g>
          );
        })}
      </g>

      {/* the SHOP COUNTER: white top, mint front, a row of swirl lollipops */}
      <g>
        <rect x={-10} y={counterY - 2} width={width + 20} height={30} rx={14} fill="#FFFFFF" stroke="#3B1F4E" strokeWidth={6} />
        <rect x={-10} y={counterY + 26} width={width + 20} height={70} fill="#41D8B0" stroke="#3B1F4E" strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i} transform={`translate(${i * 80 + 20} ${counterY + 61})`}>
            <circle r={19} fill={SWIRL[i % 5]} stroke="#3B1F4E" strokeWidth={3.5} />
            <path d="M 0 0 m -9 0 a 9 9 0 1 1 9 9 a 5 5 0 1 1 -5 -5" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          </g>
        ))}
        {Array.from({ length: 28 }, (_, i) => (
          <path key={i} d={`M ${i * 40 - 10} ${counterY + 96} a 20 20 0 0 0 40 0`} fill="#FFFFFF" stroke="#3B1F4E" strokeWidth={4} />
        ))}
      </g>

      {/* the chalkboard the abacus and the panel sit on */}
      <rect x={20} y={counterY + 118} width={width - 40} height={floorY - counterY - 118 - 8} rx={46} fill="url(#psSlate)" opacity={0.9} />
      <rect x={34} y={counterY + 132} width={width - 68} height={floorY - counterY - 118 - 36} rx={36} fill="none" stroke="#FFFFFF" strokeOpacity={0.4} strokeWidth={4} strokeDasharray="18 14" />

      {/* the floor: pink with sprinkles */}
      <g>
        <rect x={0} y={floorY} width={width} height={height - floorY} fill="url(#psFloor)" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${i * 110 - 60} ${floorY} L ${i * 110 - 160} ${height}`} stroke="#FFFFFF" strokeWidth={26} opacity={0.18} />
        ))}
        {Array.from({ length: 70 }, (_, i) => {
          const x = (i * 211) % width;
          const y = floorY + 24 + ((i * 131) % (height - floorY - 40));
          const a = (i * 47) % 180;
          const tw = 0.6 + 0.4 * Math.sin(t * 2 + i);
          return <path key={i} d="M -9 0 H 9" stroke={SPRINKLE[i % 5]} strokeWidth={6} strokeLinecap="round" transform={`translate(${x} ${y}) rotate(${a})`} opacity={0.9 * tw} />;
        })}
        <rect x={0} y={floorY} width={width} height={12} fill="#FFE45C" />
        <rect x={0} y={floorY + 12} width={width} height={6} fill="#3B1F4E" opacity={0.25} />
      </g>
    </svg>
  );
};
