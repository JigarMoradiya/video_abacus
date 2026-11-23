// GAME ZONE WORLDS — one backdrop component, five themes, matching the app's own five Math
// Game Zone categories. Eighteen game reels can't each invent a world (they'd blur together
// or take forever), so variety comes from the SECTION a game belongs to: every reel in a
// section shares its palette, and no two sections look alike. All five stay bright and
// kid-playful — these are game reels, not the night-time story reels.
//
// Same engineering pattern as every world in this repo: pure function of (frame, fps),
// gradient sky, drifting themed motes, ground band at 0.74. Gradient ids are suffixed by
// section so two worlds could even coexist in a montage without def collisions.

import React from "react";

export type GameSection = "speedy" | "equation" | "adventures" | "builders" | "puzzles";

export const SECTION_META: Record<GameSection, { label: string; accent: string }> = {
  speedy: { label: "⚡ Speedy Games", accent: "#FF5A3C" },
  equation: { label: "➕ Equation Fun", accent: "#7E57C2" },
  adventures: { label: "🗺️ Number Adventures", accent: "#2E9E62" },
  builders: { label: "🔢 Number Builders", accent: "#0288D1" },
  puzzles: { label: "🧩 Brain Puzzles", accent: "#8E4FD0" },
};

const THEMES: Record<
  GameSection,
  { skyTop: string; skyMid: string; skyBottom: string; groundTop: string; groundBottom: string; groundLip: string; moteFills: string[] }
> = {
  speedy: {
    skyTop: "#FFF1D6", skyMid: "#FFDDA8", skyBottom: "#FFC27A",
    groundTop: "#F2793C", groundBottom: "#D95B22", groundLip: "#FFD9A0",
    moteFills: ["#FF5A3C", "#FFC107", "#4ECDC4"],
  },
  equation: {
    skyTop: "#F3EDFF", skyMid: "#E4D8FF", skyBottom: "#CDB9F7",
    groundTop: "#7E57C2", groundBottom: "#5E35B1", groundLip: "#E4D5FF",
    moteFills: ["#9B59B6", "#FF8FB2", "#7EC8FF"],
  },
  adventures: {
    skyTop: "#DFF4FF", skyMid: "#BEE7FF", skyBottom: "#98D6F7",
    groundTop: "#57B368", groundBottom: "#3B8F4C", groundLip: "#C4EEC9",
    moteFills: ["#FFD873", "#FF9FC0", "#6FDF9A"],
  },
  builders: {
    skyTop: "#E2FBFF", skyMid: "#C2F0F7", skyBottom: "#9BDDE9",
    groundTop: "#2E9AB8", groundBottom: "#1E7391", groundLip: "#BFEFF7",
    moteFills: ["#0288D1", "#FFC107", "#8FE3D8"],
  },
  puzzles: {
    skyTop: "#F6ECFF", skyMid: "#EBD9FF", skyBottom: "#D9BEF7",
    groundTop: "#8E4FD0", groundBottom: "#6C33A8", groundLip: "#ECD9FF",
    moteFills: ["#B983FF", "#FFC93C", "#6FD8C9"],
  },
};

/** A themed mote: speedy = comet streaks, equation = math signs, adventures = tiny flags,
 *  builders = blocks, puzzles = puzzle-ish rounded squares. Simple shapes, distinct at a
 *  glance, cheap to render. */
const Mote: React.FC<{ section: GameSection; x: number; y: number; r: number; fill: string; t: number; i: number }> = ({
  section, x, y, r, fill, t, i,
}) => {
  switch (section) {
    case "speedy":
      // a comet: dot + fading trail, always racing left-to-right
      return (
        <g opacity={0.6}>
          <rect x={x - r * 3.2} y={y - r * 0.28} width={r * 3.2} height={r * 0.56} rx={r * 0.28} fill={fill} opacity={0.5} />
          <circle cx={x} cy={y} r={r * 0.8} fill={fill} />
        </g>
      );
    case "equation": {
      const sign = ["+", "−", "×", "÷"][i % 4];
      return (
        <text x={x} y={y} textAnchor="middle" fontSize={r * 3} fontWeight={700} fill={fill} opacity={0.5} transform={`rotate(${Math.sin(t + i) * 14} ${x} ${y})`}>
          {sign}
        </text>
      );
    }
    case "adventures":
      // a tiny pennant flag
      return (
        <g opacity={0.6} transform={`translate(${x},${y})`}>
          <rect x={-1.5} y={-r * 2} width={3} height={r * 2} fill="#8D6E63" />
          <path d={`M 1.5,${-r * 2} L ${r * 2.4},${-r * 1.4} L 1.5,${-r * 0.8} Z`} fill={fill} />
        </g>
      );
    case "builders":
      return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.35} fill={fill} opacity={0.55} transform={`rotate(${Math.sin(t * 0.7 + i) * 18} ${x} ${y})`} />;
    case "puzzles":
      // a rounded square with a knob — puzzle-piece-ish without path gymnastics
      return (
        <g opacity={0.55} transform={`translate(${x},${y}) rotate(${Math.sin(t * 0.6 + i) * 16})`}>
          <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={r * 0.4} fill={fill} />
          <circle cx={0} cy={-r} r={r * 0.5} fill={fill} />
        </g>
      );
  }
};

export const GameZoneWorld: React.FC<{
  section: GameSection;
  width: number;
  height: number;
  frame: number;
  fps: number;
}> = ({ section, width, height, frame, fps }) => {
  const t = frame / fps;
  const mod = (n: number, m: number) => ((n % m) + m) % m;
  const T = THEMES[section];

  const motes = Array.from({ length: 9 }, (_, i) => {
    const baseX = (i * 157) % width;
    // speedy comets race, everything else drifts
    const speed = section === "speedy" ? 60 + (i % 3) * 30 : 7 + (i % 3) * 4;
    const x = mod(baseX + t * speed, width + 120) - 60;
    const y = height * (0.05 + (i % 5) * 0.07) + Math.sin(t * 0.5 + i) * 14;
    const r = 9 + (i % 3) * 5;
    return { x, y, r, fill: T.moteFills[i % T.moteFills.length] };
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`gzSky_${section}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.skyTop} />
          <stop offset="55%" stopColor={T.skyMid} />
          <stop offset="100%" stopColor={T.skyBottom} />
        </linearGradient>
        <linearGradient id={`gzGround_${section}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.groundTop} />
          <stop offset="100%" stopColor={T.groundBottom} />
        </linearGradient>
      </defs>

      <rect width={width} height={height} fill={`url(#gzSky_${section})`} />

      {motes.map((m, i) => (
        <Mote key={i} section={section} x={m.x} y={m.y} r={m.r} fill={m.fill} t={t} i={i} />
      ))}

      {/* adventures gets rolling hills on the horizon; others keep a clean band */}
      {section === "adventures" && (
        <>
          <ellipse cx={width * 0.2} cy={height * 0.76} rx={width * 0.42} ry={height * 0.06} fill="#4CA85C" />
          <ellipse cx={width * 0.85} cy={height * 0.77} rx={width * 0.45} ry={height * 0.07} fill="#449A54" />
        </>
      )}

      <rect x={0} y={height * 0.74} width={width} height={height * 0.26} fill={`url(#gzGround_${section})`} />
      <rect x={0} y={height * 0.74} width={width} height={9} fill={T.groundLip} opacity={0.85} />
    </svg>
  );
};
