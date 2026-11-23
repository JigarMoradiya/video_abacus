// BINGO HALL — a warm, glowing game-show stage: deep maroon curtains, a string of round bulb
// lights along the top (each one twinkling on its own phase, not in unison), and small numbered
// bingo balls drifting slowly upward through the scene like rising bubbles. Deliberately a
// THIRD warm palette in the series but a different mood from HeroHQDay's dawn-coral — deep
// red/maroon/gold, a stage at night, not a sky at sunrise.

import React from "react";

const BALL_NUMBERS = [4, 12, 19, 7, 23, 15, 30, 2, 18, 9];

export const BingoHallWorld: React.FC<{
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;

  const bulbs = Array.from({ length: 12 }, (_, i) => {
    const x = (i + 0.5) * (width / 12);
    const y = height * 0.05 + Math.sin(i * 1.7) * 10;
    const twinkle = 0.5 + 0.5 * Math.abs(Math.sin(t * (1.4 + (i % 4) * 0.35) + i * 1.3));
    return { x, y, twinkle };
  });

  const SPAN = height + 300;
  const balls = Array.from({ length: 7 }, (_, i) => {
    const speed = 14 + (i % 4) * 6;
    const baseY = (i * 271) % SPAN;
    const y = height - mod(baseY + t * speed, SPAN) + 150;
    const x = width * ((i * 0.161 + 0.08) % 1) + Math.sin(t * 0.6 + i) * 26;
    const num = BALL_NUMBERS[i % BALL_NUMBERS.length];
    const scale = 0.55 + (i % 3) * 0.18;
    return { x, y, num, scale, hue: i % 2 === 0 ? "#FFC107" : "#FF7043" };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="bingoSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A0D12" />
          <stop offset="45%" stopColor="#5C1420" />
          <stop offset="100%" stopColor="#7A1D2B" />
        </linearGradient>
        <linearGradient id="bingoCurtain" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A1E2E" />
          <stop offset="100%" stopColor="#4A0F17" />
        </linearGradient>
        <radialGradient id="bingoGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#FFE9B0" stopOpacity={0} />
        </radialGradient>
      </defs>

      <rect width={width} height={height} fill="url(#bingoSky)" />

      {/* a soft warm spotlight wash from above, center stage */}
      <ellipse cx={width * 0.5} cy={height * 0.05} rx={width * 0.6} ry={height * 0.32} fill="url(#bingoGlow)" />

      {/* curtain folds down each side */}
      {[0, 1, 2].map((i) => (
        <rect key={`l${i}`} x={i * 46} y={0} width={40} height={height} fill="url(#bingoCurtain)" opacity={0.9 - i * 0.15} />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={`r${i}`} x={width - 40 - i * 46} y={0} width={40} height={height} fill="url(#bingoCurtain)" opacity={0.9 - i * 0.15} />
      ))}

      {/* string of bulb lights along the top */}
      <path d={`M 0 ${height * 0.045} Q ${width / 2} ${height * 0.09} ${width} ${height * 0.045}`} stroke="#3A0D12" strokeWidth={4} fill="none" opacity={0.6} />
      {bulbs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y + Math.sin(i * 2) * 6 + height * 0.02} r={9} fill="#FFE9A8" opacity={b.twinkle} />
      ))}

      {/* rising bingo balls, drifting slowly upward */}
      {balls.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.scale})`} opacity={0.85}>
          <circle cx={0} cy={0} r={26} fill="#FFFDF6" stroke={b.hue} strokeWidth={4} />
          <text x={0} y={7} textAnchor="middle" fontSize={22} fontWeight={700} fill={b.hue}>
            {b.num}
          </text>
        </g>
      ))}

      {/* stage floor */}
      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill="#2A0A10" />
      <rect x={0} y={height * 0.74} width={width} height={8} fill="#FFC107" opacity={0.55} />
    </svg>
  );
};
