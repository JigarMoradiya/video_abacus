// DINO VALLEY'S BABY DINOSAURS (Bead Buddies pilot). Simple round shapes, ink outlines, big googly eyes, bright colours.
// Pure functions of the frame; moods are keyed to names: "calm" (breathe + blink), "cheer" (hop, mouth open), "tilt" (head cocked, "hmm").
import React from "react";

export const DINO_INK = "#0B3B4A";
export type DinoMood = "calm" | "cheer" | "tilt";
export type DinoKind = "trike" | "bronto" | "trex" | "ptero";

export const eye = (cx: number, cy: number, r: number, blink: number, look: number) => (
  <g transform={`translate(${cx} ${cy}) scale(1 ${Math.max(0.1, blink)})`}>
    <ellipse rx={r} ry={r * 1.12} fill="#FFFFFF" stroke={DINO_INK} strokeWidth={r * 0.2} />
    <circle cx={look * r * 0.25} cy={r * 0.12} r={r * 0.52} fill={DINO_INK} />
    <circle cx={look * r * 0.25 + r * 0.2} cy={-r * 0.12} r={r * 0.2} fill="#FFFFFF" />
  </g>
);
export const blinkOf = (t: number, seed: number) => ((t * 0.31 + seed) % 1) > 0.955 ? 0.1 : 1;

export const Mouth: React.FC<{ x: number; y: number; w: number; open: number }> = ({ x, y, w, open }) =>
  open > 0.3 ? (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M ${-w} 0 Q 0 ${4 + open * w * 0.5} ${w} 0 Q 0 ${-2} ${-w} 0 Z`} fill="#6B1F33" stroke={DINO_INK} strokeWidth={3} strokeLinejoin="round" />
      <ellipse cx={0} cy={open * w * 0.28} rx={w * 0.45} ry={Math.max(2, open * w * 0.14)} fill="#FF7F9A" />
    </g>
  ) : (
    <path d={`M ${x - w} ${y} Q ${x} ${y + w * 0.55} ${x + w} ${y}`} stroke={DINO_INK} strokeWidth={4} fill="none" strokeLinecap="round" />
  );

export const Dino: React.FC<{
  kind: DinoKind;
  x: number;
  y: number; // ground (feet) point
  scale: number;
  mood: DinoMood;
  frame: number;
  fps: number;
  /** -1 faces left, 1 faces right */
  facing?: 1 | -1;
  seed?: number;
  /** trex only: 0 = closed egg, 1 = hatched */
  hatch?: number;
}> = ({ kind, x, y, scale, mood, frame, fps, facing = 1, seed = 0, hatch = 1 }) => {
  const t = frame / fps + seed;
  const cheer = mood === "cheer";
  const hop = cheer ? Math.abs(Math.sin(t * 5)) : 0;
  const breathe = Math.sin(t * 1.5) * 0.015;
  const sq = cheer ? (hop - 0.5) * 0.16 : breathe;
  const bl = blinkOf(t, seed * 0.37);
  const tilt = mood === "tilt" ? -11 + Math.sin(t * 2) * 2 : Math.sin(t * 0.8) * 1.5;
  const open = cheer ? 0.9 : 0;
  const body = (() => {
    if (kind === "trike") {
      return (
        <g>
          {/* tail */}
          <path d="M -88 -58 Q -140 -52 -150 -86 Q -120 -78 -84 -78 Z" fill="#4FBF68" stroke={DINO_INK} strokeWidth={5} strokeLinejoin="round" />
          {/* back legs and front legs */}
          {[-62, -22, 28, 66].map((lx, i) => (
            <rect key={i} x={lx - 15} y={-44} width={30} height={44} rx={13} fill="#3DA85A" stroke={DINO_INK} strokeWidth={5} />
          ))}
          {/* body */}
          <ellipse cx={0} cy={-76} rx={104} ry={66} fill="#5FCB6B" stroke={DINO_INK} strokeWidth={5} />
          <ellipse cx={4} cy={-52} rx={70} ry={34} fill="#C9F2A6" />
          {[-50, -10, 34].map((sx, i) => (
            <circle key={i} cx={sx} cy={-122 + (i % 2) * 6} r={9} fill="#FFB84D" stroke={DINO_INK} strokeWidth={3} />
          ))}
          {/* head with frill and horns */}
          <g transform={`translate(78 -92) rotate(${tilt})`}>
            <path d="M -30 -30 Q -70 -90 -10 -96 Q 40 -100 38 -36 Z" fill="#FF9A5B" stroke={DINO_INK} strokeWidth={5} strokeLinejoin="round" />
            {[-26, -4, 18].map((fx, i) => (
              <circle key={i} cx={fx} cy={-70 + Math.abs(i - 1) * 8} r={6} fill="#FFE066" />
            ))}
            <ellipse cx={20} cy={0} rx={52} ry={42} fill="#5FCB6B" stroke={DINO_INK} strokeWidth={5} />
            <path d="M 8 -34 L 0 -70 L 24 -36 Z" fill="#FFF6D6" stroke={DINO_INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M 34 -34 L 40 -70 L 54 -30 Z" fill="#FFF6D6" stroke={DINO_INK} strokeWidth={4} strokeLinejoin="round" />
            <path d="M 52 -6 L 78 -22 L 66 8 Z" fill="#FFF6D6" stroke={DINO_INK} strokeWidth={4} strokeLinejoin="round" />
            {eye(8, -8, 15, bl, -0.3)}
            {eye(38, -8, 13, bl, -0.3)}
            <ellipse cx={-4} cy={10} rx={9} ry={6} fill="#FF9AAE" opacity={0.7} />
            <Mouth x={26} y={20} w={20} open={open} />
          </g>
        </g>
      );
    }
    if (kind === "bronto") {
      const sway = Math.sin(t * 0.8) * 10 + (cheer ? Math.sin(t * 5) * 8 : 0);
      const hx = -10 + sway;
      return (
        <g>
          {/* the big round body and tail, half hidden behind the hill */}
          <path d="M -40 0 Q -40 -110 50 -118 Q 150 -120 160 -20 L 160 0 Z" fill="#8AD65F" stroke={DINO_INK} strokeWidth={5} />
          <path d="M 40 -112 Q 150 -110 156 -30" stroke="#BDEB8F" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.7} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={60 + i * 34} cy={-86 + (i % 2) * 14} r={9} fill="#FFB84D" stroke={DINO_INK} strokeWidth={3} />
          ))}
          <path d={`M 0 -10 C 4 -160 ${hx - 50} -210 ${hx} -330`} stroke={DINO_INK} strokeWidth={84} strokeLinecap="round" fill="none" />
          <path d={`M 0 -10 C 4 -160 ${hx - 50} -210 ${hx} -330`} stroke="#8AD65F" strokeWidth={70} strokeLinecap="round" fill="none" />
          <g transform={`translate(${hx} -336) rotate(${tilt})`}>
            <ellipse cx={-16} cy={0} rx={70} ry={52} fill="#8AD65F" stroke={DINO_INK} strokeWidth={5} />
            <circle cx={-64} cy={8} r={5} fill={DINO_INK} />
            <circle cx={-64} cy={-6} r={5} fill={DINO_INK} />
            <ellipse cx={8} cy={-16} rx={22} ry={11} fill="#FFFFFF" opacity={0} />
            {eye(-6, -14, 21, bl, -0.5)}
            <ellipse cx={-34} cy={14} rx={9} ry={6} fill="#FF9AAE" opacity={0.7} />
            <Mouth x={-38} y={26} w={22} open={open} />
            {[10, 24].map((dx, i) => (
              <circle key={i} cx={dx} cy={-34 + i * 8} r={5} fill="#FFB84D" stroke={DINO_INK} strokeWidth={2.5} />
            ))}
          </g>
        </g>
      );
    }
    if (kind === "trex") {
      const h = Math.max(0, Math.min(1, hatch));
      const pop = h < 1 ? 0 : 1;
      return (
        <g>
          {h < 0.05 && (
            <g transform={`rotate(${Math.sin(t * 6) * 3})`}>
              <path d="M 0 0 C -56 0 -52 -96 0 -104 C 52 -96 56 0 0 0 Z" fill="#FFF3D6" stroke={DINO_INK} strokeWidth={5} />
              <circle cx={-20} cy={-62} r={9} fill="#FF9A5B" />
              <circle cx={18} cy={-40} r={10} fill="#6BBF8A" />
              <circle cx={14} cy={-80} r={6} fill="#FF7AB6" />
              <path d="M -10 -104 l 8 14 l -8 8 l 10 12" stroke={DINO_INK} strokeWidth={3.5} fill="none" strokeLinejoin="round" />
            </g>
          )}
          {/* egg half under the body once hatched */}
          <path opacity={h < 0.05 ? 0 : 1} d="M -46 0 Q -50 -34 -34 -44 L -18 -28 L -4 -46 L 10 -28 L 26 -44 Q 46 -32 46 0 Z" fill="#FFF3D6" stroke={DINO_INK} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={-22} cy={-12} r={6} fill="#FF9A5B" />
          <circle cx={18} cy={-14} r={7} fill="#6BBF8A" />
          <g transform={`translate(0 ${-10 - 46 * h}) scale(${0.35 + 0.65 * h})`} opacity={h > 0.05 ? 1 : 0}>
            <path d="M -50 -4 Q -96 6 -84 -30 Q -60 -20 -42 -26 Z" fill="#FF8F4D" stroke={DINO_INK} strokeWidth={5} strokeLinejoin="round" />
            <ellipse cx={0} cy={-34} rx={50} ry={48} fill="#FF9A5B" stroke={DINO_INK} strokeWidth={5} />
            <ellipse cx={4} cy={-22} rx={30} ry={28} fill="#FFE0B8" />
            <path d="M -20 -78 L -8 -90 L 2 -76 L 14 -90 L 24 -74" stroke={DINO_INK} strokeWidth={4} fill="#FFC857" strokeLinejoin="round" />
            <g transform={`translate(18 -64) rotate(${tilt})`}>
              <ellipse cx={0} cy={0} rx={52} ry={40} fill="#FF9A5B" stroke={DINO_INK} strokeWidth={5} />
              <path d="M -20 -38 L -12 -50 L -4 -38 Z" fill="#FFC857" stroke={DINO_INK} strokeWidth={3} />
              {eye(-10, -10, 15, bl, 0.3)}
              {eye(20, -10, 14, bl, 0.3)}
              <Mouth x={8} y={16} w={24} open={Math.max(open, 0.5)} />
              <rect x={-4} y={12} width={6} height={9} rx={2} fill="#FFFFFF" stroke={DINO_INK} strokeWidth={1.5} />
              <rect x={5} y={12} width={6} height={9} rx={2} fill="#FFFFFF" stroke={DINO_INK} strokeWidth={1.5} />
            </g>
            <path d="M 28 -30 q 20 6 14 20" stroke={DINO_INK} strokeWidth={9} strokeLinecap="round" fill="none" />
            <path d="M 28 -30 q 20 6 14 20" stroke="#FF9A5B" strokeWidth={5} strokeLinecap="round" fill="none" />
            <ellipse cx={-14} cy={4} rx={16} ry={9} fill="#FF8F4D" stroke={DINO_INK} strokeWidth={4} />
            <ellipse cx={20} cy={4} rx={16} ry={9} fill="#FF8F4D" stroke={DINO_INK} strokeWidth={4} />
          </g>
          {pop === 1 && (
            <g>
              <path d="M -48 -4 L -40 -24 L -28 -8 Z" fill="#FFF3D6" stroke={DINO_INK} strokeWidth={4} strokeLinejoin="round" />
              <path d="M 48 -4 L 40 -24 L 28 -8 Z" fill="#FFF3D6" stroke={DINO_INK} strokeWidth={4} strokeLinejoin="round" />
            </g>
          )}
        </g>
      );
    }
    // ptero
    const flap = Math.sin(t * (cheer ? 9 : 3.4));
    return (
      <g transform={`translate(0 ${-80 + Math.sin(t * 1.1) * 10}) rotate(${tilt * 0.5})`}>
        <path d={`M -10 0 Q -70 ${-50 - flap * 50} -150 ${-16 - flap * 36} Q -90 ${12 - flap * 6} -20 20 Z`} fill="#FF7AB6" stroke={DINO_INK} strokeWidth={5} strokeLinejoin="round" />
        <path d={`M 10 0 Q 70 ${-50 - flap * 50} 150 ${-16 - flap * 36} Q 90 ${12 - flap * 6} 20 20 Z`} fill="#FF7AB6" stroke={DINO_INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={0} cy={14} rx={32} ry={26} fill="#FFB84D" stroke={DINO_INK} strokeWidth={5} />
        <path d="M -8 -10 L -34 -42 L 6 -22 Z" fill="#FF7AB6" stroke={DINO_INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 22 4 L 76 12 L 24 24 Z" fill="#FFD36B" stroke={DINO_INK} strokeWidth={4} strokeLinejoin="round" />
        {eye(8, 2, 13, bl, 0.6)}
        <path d="M -30 34 L -52 62" stroke={DINO_INK} strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  })();
  return (
    <g transform={`translate(${x} ${y - hop * 22 * scale}) scale(${facing * scale} ${scale})`}>
      <g transform={`scale(${1 - sq * 0.7} ${1 + sq})`}>{body}</g>
    </g>
  );
};
