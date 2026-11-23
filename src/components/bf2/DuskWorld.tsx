// CLOSING TIME AT THE GAME HALL — the world of Big Friend 2. Warm orange, teal and navy at dusk:
// big arched windows with a low sun and a skyline, strings of warm bulbs, a basketball hoop and a
// trophy shelf on the wall, a navy ledge with a row of bulbs (where the heroes and the scoreboard
// stand), a dark teal workspace board for the lesson, and a polished wooden court floor with white
// lines. BACKGROUND only: busy shapes live at the margins, quiet behind the middle.
//
// `burst` pumps the warm rays on a celebration beat; `calm` quiets the decoration while the lesson is
// the focus; `lights` (0..1) dims the bulbs for the lights-out gag in the finale.

import React from "react";

const BULB_COLS = ["#FFC93C", "#FF8A1F", "#7FF3E6", "#FF5A4D"];

export const DuskWorld: React.FC<{ width: number; height: number; frame: number; fps: number; burst?: number; counterY?: number; calm?: number; lights?: number }> = ({
  width,
  height,
  frame,
  fps,
  burst = 0,
  counterY = 600,
  calm = 0,
  lights = 1,
}) => {
  const t = frame / fps;
  const cx = width / 2;
  const floorY = height * 0.775;
  const winTop = 150;
  const winBot = Math.max(winTop + 200, counterY - 24);
  const wins = [
    { x: 40, w: 250 },
    { x: 415, w: 250 },
    { x: 790, w: 250 },
  ];
  const wallOp = 1 - 0.45 * calm;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="dkWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#101C47" />
          <stop offset="55%" stopColor="#1D3A78" />
          <stop offset="100%" stopColor="#1E5C7E" />
        </linearGradient>
        <linearGradient id="dkSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B2E7E" />
          <stop offset="45%" stopColor="#FF6B5A" />
          <stop offset="100%" stopColor="#FFC93C" />
        </linearGradient>
        <radialGradient id="dkSun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3B0" stopOpacity={0.95} />
          <stop offset="100%" stopColor="#FFC93C" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="dkFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E88A2C" />
          <stop offset="100%" stopColor="#B85A1A" />
        </linearGradient>
        <linearGradient id="dkBoard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E3A55" />
          <stop offset="100%" stopColor="#0A2342" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#dkWall)" />

      {/* warm rays from the low sun, pumped by a celebration */}
      <g transform={`translate(${cx} ${counterY - 40}) rotate(${Math.sin(t * 0.3) * 4})`} opacity={(0.12 + burst * 0.2) * (1 - 0.6 * calm)}>
        {Array.from({ length: 14 }, (_, i) => {
          const a = -Math.PI + (i / 13) * Math.PI;
          const a2 = a + 0.1;
          return <path key={i} d={`M 0 0 L ${Math.cos(a) * 1500} ${Math.sin(a) * 1500} L ${Math.cos(a2) * 1500} ${Math.sin(a2) * 1500} Z`} fill="#FFE9A8" />;
        })}
      </g>

      {/* arched windows: the dusk sky, a low sun, a skyline */}
      <g opacity={wallOp}>
        {wins.map((w, i) => {
          const h = winBot - winTop;
          return (
            <g key={i} transform={`translate(${w.x} ${winTop})`}>
              <path d={`M 0 ${h} V ${w.w / 2} A ${w.w / 2} ${w.w / 2} 0 0 1 ${w.w} ${w.w / 2} V ${h} Z`} fill="url(#dkSky)" stroke="#0B1330" strokeWidth={9} />
              <clipPath id={`dkWin${i}`}>
                <path d={`M 0 ${h} V ${w.w / 2} A ${w.w / 2} ${w.w / 2} 0 0 1 ${w.w} ${w.w / 2} V ${h} Z`} />
              </clipPath>
              <g clipPath={`url(#dkWin${i})`}>
                <circle cx={w.w / 2} cy={h - 70} r={90 + burst * 20} fill="url(#dkSun)" />
                <circle cx={w.w / 2} cy={h - 70} r={34} fill="#FFF3B0" />
                {[0, 1, 2, 3, 4].map((b) => {
                  const bx = b * (w.w / 5);
                  const bh = 50 + ((b * 37 + i * 23) % 70);
                  return (
                    <g key={b}>
                      <rect x={bx} y={h - bh} width={w.w / 5 + 2} height={bh} fill="#1A2358" />
                      <rect x={bx + 8} y={h - bh + 12} width={9} height={11} fill="#FFC93C" opacity={((Math.floor(t * 0.5) + b + i) % 3 === 0 ? 0.3 : 0.9)} />
                    </g>
                  );
                })}
              </g>
              <path d={`M ${w.w / 2} ${w.w / 2 - w.w / 2} V ${h}`} stroke="#0B1330" strokeWidth={6} opacity={0.7} />
              <path d={`M 0 ${h * 0.55} H ${w.w}`} stroke="#0B1330" strokeWidth={6} opacity={0.7} />
            </g>
          );
        })}
      </g>

      {/* the basketball hoop and a trophy shelf, small, between the windows */}
      <g opacity={0.9 * wallOp}>
        <g transform={`translate(335 ${winTop + 250})`}>
          <rect x={-34} y={-44} width={68} height={52} rx={6} fill="#FFFFFF" stroke="#0B1330" strokeWidth={4} />
          <rect x={-16} y={-24} width={32} height={24} fill="none" stroke="#FF5A4D" strokeWidth={4} />
          <ellipse cx={0} cy={16} rx={22} ry={6} fill="none" stroke="#FF8A1F" strokeWidth={5} />
          <path d="M -18 18 L -10 48 M 18 18 L 10 48 M 0 20 V 50" stroke="#FFFFFF" strokeWidth={3} opacity={0.8} />
        </g>
        <g transform={`translate(710 ${winTop + 300})`}>
          <rect x={-40} y={0} width={80} height={10} rx={4} fill="#8C5A2B" stroke="#0B1330" strokeWidth={3} />
          <path d="M -14 0 v -26 h 28 v 26 M -14 -22 q -16 0 -16 12 q 0 8 10 10 M 14 -22 q 16 0 16 12 q 0 8 -10 10" fill="#FFC93C" stroke="#0B1330" strokeWidth={3} />
        </g>
      </g>

      {/* strings of warm bulbs across the top */}
      <g opacity={(1 - 0.5 * calm) * (0.35 + 0.65 * lights)}>
        {[0, 1].map((row) => {
          const y0 = 52 + row * 54;
          const sag = 40 + row * 12;
          const n = 16;
          return (
            <g key={row}>
              <path d={`M -20 ${y0 - 8} Q ${cx} ${y0 + sag} ${width + 20} ${y0 - 8}`} stroke="#0B1330" strokeWidth={4} fill="none" opacity={0.8} />
              {Array.from({ length: n }, (_, i) => {
                const u = (i + 0.5) / n;
                const px = -20 + u * (width + 40);
                const py = (1 - u) * (1 - u) * (y0 - 8) + 2 * u * (1 - u) * (y0 + sag) + u * u * (y0 - 8);
                const tw = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7 + row);
                const col = BULB_COLS[(i + row) % BULB_COLS.length];
                return (
                  <g key={i}>
                    <circle cx={px} cy={py + 14} r={26} fill={col} opacity={0.18 * tw * lights} />
                    <path d={`M ${px - 3} ${py} h 6 v 6 h -6 Z`} fill="#0B1330" />
                    <ellipse cx={px} cy={py + 16} rx={9} ry={12} fill={col} stroke="#0B1330" strokeWidth={2.5} opacity={0.55 + 0.45 * tw * lights} />
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>

      {/* dust motes floating in the low light */}
      {Array.from({ length: 22 }, (_, i) => {
        const mx = (i * 211 + 70) % width;
        const my = (counterY + 200 + ((i * 97 + t * (12 + (i % 4) * 4)) % 700));
        return <circle key={i} cx={mx} cy={my} r={2 + (i % 3)} fill="#FFE9A8" opacity={0.22 * (1 - 0.5 * calm)} />;
      })}

      {/* the LEDGE the heroes and the scoreboard stand on: navy with a row of bulbs */}
      <g>
        <rect x={-10} y={counterY - 2} width={width + 20} height={30} rx={14} fill="#FF8A1F" stroke="#0B1330" strokeWidth={6} />
        <rect x={-10} y={counterY - 2} width={width + 20} height={9} rx={4} fill="#FFFFFF" opacity={0.4} />
        <rect x={-10} y={counterY + 26} width={width + 20} height={66} fill="#14224D" stroke="#0B1330" strokeWidth={6} />
        {Array.from({ length: 22 }, (_, i) => {
          const on = (Math.floor(t * 4) + i) % 3 === 0;
          return <circle key={i} cx={24 + i * 48} cy={counterY + 59} r={9} fill={on ? "#FFC93C" : "#6A5320"} opacity={on ? lights : 0.7} />;
        })}
        <rect x={-10} y={counterY + 88} width={width + 20} height={10} fill="#0B1330" opacity={0.4} />
      </g>

      {/* the workspace board the abacus and the panel sit on — a dark stage so every number reads */}
      <rect x={20} y={counterY + 112} width={width - 40} height={floorY - counterY - 112 - 8} rx={46} fill="url(#dkBoard)" opacity={0.78} />
      <rect x={20} y={counterY + 112} width={width - 40} height={floorY - counterY - 112 - 8} rx={46} fill="none" stroke="#7FF3E6" strokeOpacity={0.3} strokeWidth={5} />

      {/* the court floor: warm wood planks with white lines in gentle perspective */}
      <g>
        <rect x={0} y={floorY} width={width} height={height - floorY} fill="url(#dkFloor)" />
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M ${cx + (i - 4) * 70} ${floorY} L ${cx + (i - 4) * 190} ${height}`} stroke="#8A4310" strokeWidth={3} opacity={0.45} />
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M 0 ${floorY + 30 + i * 60} H ${width}`} stroke="#8A4310" strokeWidth={2} opacity={0.3} />
        ))}
        <path d={`M ${cx - 380} ${height - 60} Q ${cx} ${floorY + 30} ${cx + 380} ${height - 60}`} stroke="#FFFFFF" strokeWidth={9} fill="none" opacity={0.7} strokeLinecap="round" />
        <rect x={0} y={floorY} width={width} height={12} fill="#FFC93C" />
        <rect x={0} y={floorY + 12} width={width} height={6} fill="#0B1330" opacity={0.3} />
      </g>
    </svg>
  );
};
