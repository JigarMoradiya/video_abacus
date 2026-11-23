// THE LIGHTNING ROUND — the world of Big Friend 6: a bold, fast game-show racetrack in deep indigo and
// black with electric lime, sunset orange and cyan. Speed lines streak past, spotlight beams sweep the
// dark, a crowd of silhouettes flashes its phones, a checkered banner runs along the top, the ledge is
// a lime-and-black racing curb on a track whose centre dashes scroll, the lesson sits on an indigo
// console with a neon cyan edge and the floor is asphalt with converging lane lines and a finish line.
// BACKGROUND only. `speed` (0..1) is how fast the streaks run; `calm` quiets the decoration while the
// lesson is the focus; `flash` (0..1) is the end-of-round flash.

import React from "react";

export const RaceWorld: React.FC<{ width: number; height: number; frame: number; fps: number; speed?: number; burst?: number; counterY?: number; calm?: number; flash?: number }> = ({
  width,
  height,
  frame,
  fps,
  speed = 0.5,
  burst = 0,
  counterY = 600,
  calm = 0,
  flash = 0,
}) => {
  const t = frame / fps;
  const cx = width / 2;
  const floorY = height * 0.775;
  const decor = 1 - 0.5 * calm;
  const streaks = 34;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="rwBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#241575" />
          <stop offset="55%" stopColor="#120A3A" />
          <stop offset="100%" stopColor="#07041A" />
        </linearGradient>
        <linearGradient id="rwRoad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A3F55" />
          <stop offset="100%" stopColor="#1C1F2E" />
        </linearGradient>
        <linearGradient id="rwConsole" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E1561" />
          <stop offset="100%" stopColor="#0F0A38" />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill="url(#rwBg)" />

      {/* sweeping spotlights */}
      <g opacity={(0.2 + burst * 0.2) * decor}>
        <g transform={`translate(110 0) rotate(${Math.sin(t * 1.3) * 16 - 8})`}>
          <path d="M 0 0 L -170 900 L 170 900 Z" fill="#2EE6FF" />
        </g>
        <g transform={`translate(${width - 110} 0) rotate(${Math.sin(t * 1.1 + 1.6) * 16 + 8})`}>
          <path d="M 0 0 L -170 900 L 170 900 Z" fill="#FF7A1A" />
        </g>
      </g>

      {/* speed streaks */}
      {Array.from({ length: streaks }, (_, i) => {
        const y = 90 + ((i * 137) % Math.max(300, counterY - 100));
        const len = 90 + (i % 5) * 70;
        const v = (260 + (i % 7) * 120) * (0.25 + speed);
        const x = width + 200 - ((t * v + i * 211) % (width + 500));
        const col = ["#B6FF2E", "#2EE6FF", "#FF7A1A", "#FFFFFF"][i % 4];
        return <rect key={i} x={x} y={y} width={len} height={4 + (i % 3) * 2} rx={3} fill={col} opacity={(0.18 + 0.3 * speed) * decor} />;
      })}

      {/* the crowd: silhouettes with flashing phones */}
      <g opacity={decor}>
        {Array.from({ length: 22 }, (_, i) => {
          const x = i * 52 - 10;
          const h = 54 + ((i * 29) % 30);
          const bob = Math.abs(Math.sin(t * (4 + (i % 3)) + i)) * 8 * (0.3 + speed);
          return (
            <g key={i} transform={`translate(${x + 26} ${counterY - 4 - bob})`}>
              <ellipse cy={-h} rx={22} ry={24} fill="#0A0626" />
              <path d={`M -30 0 Q -26 ${-h + 24} 0 ${-h + 22} Q 26 ${-h + 24} 30 0 Z`} fill="#0A0626" />
              {i % 3 === 0 && (Math.floor(t * 6 + i) % 3 === 0) && <circle cx={14} cy={-h - 20} r={6} fill="#FFFFFF" opacity={0.95} />}
            </g>
          );
        })}
      </g>

      {/* the checkered banner along the top */}
      <g>
        {Array.from({ length: 2 }, (_, r) =>
          Array.from({ length: 46 }, (_, c) => (
            <rect key={`${r}-${c}`} x={c * 26 - 6} y={r * 26 - 4} width={26} height={26} fill={(r + c) % 2 === 0 ? "#FFFFFF" : "#0B0720"} opacity={0.92} />
          ))
        )}
        <rect x={0} y={44} width={width} height={6} fill="#B6FF2E" />
      </g>

      {/* the LEDGE: a racing curb on a moving track */}
      <g>
        {Array.from({ length: 24 }, (_, i) => (
          <rect key={i} x={i * 48 - 10} y={counterY - 2} width={48} height={34} fill={i % 2 ? "#B6FF2E" : "#0B0720"} stroke="#0B0720" strokeWidth={4} />
        ))}
        <rect x={-10} y={counterY + 30} width={width + 20} height={66} fill="url(#rwRoad)" stroke="#0B0720" strokeWidth={6} />
        {Array.from({ length: 14 }, (_, i) => {
          const x = ((i * 90 - t * (200 + speed * 500)) % (width + 180)) - 90 + (width + 180) * (i * 90 - t * (200 + speed * 500) < -90 ? 1 : 0);
          return <rect key={i} x={x} y={counterY + 58} width={54} height={9} rx={4} fill="#FFFFFF" opacity={0.85} />;
        })}
        <rect x={-10} y={counterY + 90} width={width + 20} height={10} fill="#0B0720" opacity={0.5} />
      </g>

      {/* the neon console the lesson sits on */}
      <rect x={20} y={counterY + 118} width={width - 40} height={floorY - counterY - 118 - 8} rx={42} fill="url(#rwConsole)" opacity={0.96} />
      <rect x={20} y={counterY + 118} width={width - 40} height={floorY - counterY - 118 - 8} rx={42} fill="none" stroke="#2EE6FF" strokeOpacity={0.75} strokeWidth={5} />
      <rect x={14} y={counterY + 112} width={width - 28} height={floorY - counterY - 118 + 4} rx={46} fill="none" stroke="#2EE6FF" strokeOpacity={0.18} strokeWidth={14} />

      {/* the asphalt floor with lane lines and a finish line */}
      <g>
        <rect x={0} y={floorY} width={width} height={height - floorY} fill="url(#rwRoad)" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${cx + (i - 3.5) * 70} ${floorY} L ${cx + (i - 3.5) * 240} ${height}`} stroke={i % 2 ? "#FFFFFF" : "#B6FF2E"} strokeWidth={5} opacity={0.35} strokeDasharray="28 22" strokeDashoffset={-t * 120 * (0.4 + speed)} />
        ))}
        {Array.from({ length: 2 }, (_, r) =>
          Array.from({ length: 46 }, (_, c) => (
            <rect key={`${r}-${c}`} x={c * 24 - 4} y={floorY + r * 12} width={24} height={12} fill={(r + c) % 2 === 0 ? "#FFFFFF" : "#0B0720"} />
          ))
        )}
      </g>

      {flash > 0.02 && <rect width={width} height={height} fill="#FFFFFF" opacity={0.28 * flash} />}
    </svg>
  );
};
