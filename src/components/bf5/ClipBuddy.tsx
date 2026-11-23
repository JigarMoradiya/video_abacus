// CLIP, the co-character of Big Friend 5: a friendly clipboard coach standing on two little feet, with a
// stopwatch on its clip and a four-row drill checklist on its paper. Its face reacts calmly: it smiles
// while it waits, tilts a brow when a problem has no room, lights a bulb for the friend, scribbles with its
// pencil while the beads move, stamps a big happy tick when a drill is solved and cheers when all four
// are checked. Each row of its checklist gets a hand-drawn tick as its drill is solved (`ticks[i]` 0..1).
// Pure function of its inputs. Bare <g>. Local box (feet at the origin, before scale): halfW 200, up 450.

import React from "react";

export type CBMood = "idle" | "puzzled" | "idea" | "write" | "check" | "cheer";
export const CB_BOX = { halfW: 200, up: 450 };

const INK = "#1D3B53";
const WOOD = "#D9A15F";
const WOOD_D = "#8A5D2B";
const PAPER = "#FFFBF0";

export const ClipBuddy: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: CBMood;
  moodFrame: number;
  frame: number;
  fps: number;
  /** per checklist row: tick progress 0..1 */
  ticks: number[];
  squash?: number;
  hop?: number;
  /** 0..1 the "idea" bulb glow */
  bulb?: number;
}> = ({ x, y, scale, mood, moodFrame, frame, fps, ticks, squash = 0, hop = 0, bulb = 0 }) => {
  const t = frame / fps;
  const since = Math.max(0, frame - moodFrame);
  const sway = Math.sin(t * 1.6) * 1.5;
  const bounce = mood === "cheer" ? Math.abs(Math.sin(t * 5)) * 14 : 0;
  const blink = (t * 0.4) % 1 > 0.95 ? 0.15 : 1;
  const sx = 1 + 0.12 * squash;
  const sy = 1 - 0.12 * squash;
  const eyeY = -300;

  const eye = (cx: number, i: number) => {
    if (mood === "check" || mood === "cheer") return <path key={i} d={`M ${cx - 24} ${eyeY + 8} Q ${cx} ${eyeY - 28} ${cx + 24} ${eyeY + 8}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />;
    const big = mood === "idea" ? 1.25 : mood === "puzzled" ? 1.08 : 1;
    const lookX = mood === "write" ? 6 : mood === "puzzled" ? Math.sin(t * 5) * 8 : Math.sin(t * 1.1 + i) * 4;
    const lookY = mood === "write" ? 9 : mood === "idea" ? -6 : 2;
    return (
      <g key={i} transform={`translate(${cx} ${eyeY}) scale(${big} ${big * blink})`}>
        <ellipse rx={27} ry={30} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={lookX} cy={lookY} r={13} fill={INK} />
        <circle cx={lookX + 4} cy={lookY - 5} r={4.2} fill="#FFFFFF" />
      </g>
    );
  };
  const brow = mood === "puzzled" ? (
    <g stroke={INK} strokeWidth={9} strokeLinecap="round" fill="none">
      <path d={`M ${-72} ${eyeY - 40} Q ${-48} ${eyeY - 56} ${-24} ${eyeY - 40}`} />
      <path d={`M ${24} ${eyeY - 34} L ${72} ${eyeY - 44}`} />
    </g>
  ) : mood === "write" ? (
    <g stroke={INK} strokeWidth={9} strokeLinecap="round">
      <path d={`M ${-72} ${eyeY - 40} L ${-26} ${eyeY - 34}`} />
      <path d={`M ${72} ${eyeY - 40} L ${26} ${eyeY - 34}`} />
    </g>
  ) : null;
  const my = -238;
  const mouth =
    mood === "puzzled" ? <path d={`M -34 ${my + 6} q 17 -16 34 0 q 17 16 34 0`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" /> :
    mood === "idea" ? <ellipse cx={0} cy={my} rx={18} ry={22} fill="#7A2A3A" stroke={INK} strokeWidth={5} /> :
    mood === "write" ? <path d={`M -26 ${my} H 26`} stroke={INK} strokeWidth={7} strokeLinecap="round" /> :
    mood === "cheer" || mood === "check" ? <path d={`M -54 ${my - 14} Q 0 ${my + 48} 54 ${my - 14} Z`} fill="#7A2A3A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> :
    <path d={`M -42 ${my - 8} Q 0 ${my + 30} 42 ${my - 8}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;

  const rows = [0, 1, 2, 3];
  const pen = mood === "write" ? Math.sin(t * 24) * 9 : 0;

  return (
    <g transform={`translate(${x + sway * scale} ${y - hop - bounce * scale}) scale(${scale * sx} ${scale * sy})`}>
      <ellipse cx={0} cy={8} rx={160} ry={14} fill="#000" opacity={0.22} />
      {/* feet */}
      {[-70, 70].map((fx) => (
        <g key={fx}>
          <rect x={fx - 14} y={-52} width={28} height={36} rx={8} fill={INK} />
          <ellipse cx={fx + (fx < 0 ? -6 : 6)} cy={-8} rx={34} ry={16} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
        </g>
      ))}
      {/* the board */}
      <rect x={-150} y={-408} width={300} height={362} rx={26} fill={WOOD} stroke={INK} strokeWidth={8} />
      <rect x={-132} y={-382} width={264} height={322} rx={10} fill={PAPER} stroke={WOOD_D} strokeWidth={4} />
      {/* ruled lines */}
      {[-190, -150, -110, -70].map((ly) => (
        <path key={ly} d={`M -120 ${ly + 30} H 120`} stroke="#9CC4E0" strokeWidth={2.5} opacity={0.7} />
      ))}
      {/* the clip */}
      <rect x={-64} y={-436} width={128} height={56} rx={14} fill="#C9D3DF" stroke={INK} strokeWidth={7} />
      <rect x={-40} y={-424} width={80} height={16} rx={7} fill="#7C8EA3" />
      {/* the stopwatch on the clip */}
      <g transform="translate(112 -392)">
        <path d="M -30 -4 Q -80 -10 -64 30" stroke={INK} strokeWidth={4} fill="none" />
        <circle r={28} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
        <rect x={-6} y={-40} width={12} height={10} rx={3} fill="#FFD84D" stroke={INK} strokeWidth={3} />
        <path d={`M 0 0 V -16 M 0 0 L ${Math.sin(t * 2) * 10} ${Math.cos(t * 2) * 10}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* the face */}
      {brow}
      {[-62, 62].map((cx, i) => eye(cx, i))}
      <ellipse cx={-100} cy={-262} rx={18} ry={10} fill="#FF9A8A" opacity={0.6} />
      <ellipse cx={100} cy={-262} rx={18} ry={10} fill="#FF9A8A" opacity={0.6} />
      {mouth}
      {mood === "puzzled" && (
        <g transform={`translate(124 ${-352 + Math.sin(t * 6) * 3})`}>
          <text fontFamily="sans-serif" fontWeight={700} fontSize={54} fill={INK} textAnchor="middle" stroke="#FFFFFF" strokeWidth={0}>?</text>
        </g>
      )}
      {/* the idea bulb */}
      {(mood === "idea" || bulb > 0.02) && (
        <g transform={`translate(0 ${-470 - 6 * Math.sin(t * 8)})`} opacity={Math.max(bulb, mood === "idea" ? 1 : 0)}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <path key={i} d={`M ${Math.cos(a) * 46} ${Math.sin(a) * 46} L ${Math.cos(a) * 66} ${Math.sin(a) * 66}`} stroke="#FFD84D" strokeWidth={8} strokeLinecap="round" />;
          })}
          <circle r={34} fill="#FFF3A0" stroke={INK} strokeWidth={6} />
          <rect x={-14} y={30} width={28} height={16} rx={5} fill="#C9D3DF" stroke={INK} strokeWidth={4} />
        </g>
      )}
      {/* the checklist: four rows, each with a box and a tick */}
      {rows.map((i) => {
        const ry = -190 + i * 40;
        const k = ticks[i] ?? 0;
        const pop = k <= 0 ? 0 : 1 + 0.3 * Math.sin(Math.min(1, k * 1.4) * Math.PI) * (1 - k);
        return (
          <g key={i}>
            <rect x={-112} y={ry - 4} width={34} height={34} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
            <path d={`M -62 ${ry + 14} H ${60 - i * 8}`} stroke="#B9C9D8" strokeWidth={6} strokeLinecap="round" />
            {k > 0.01 && (
              <g transform={`translate(-95 ${ry + 13}) scale(${pop})`}>
                <path d="M -12 0 L -3 10 L 14 -12" stroke="#1B8A3A" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="60" strokeDashoffset={60 * (1 - Math.min(1, k * 1.6))} />
              </g>
            )}
          </g>
        );
      })}
      {/* arms: the left holds a pencil that scribbles, the right waves */}
      <path d={`M -150 -200 Q -196 -170 -176 ${-132 + pen * 0.3}`} stroke={WOOD} strokeWidth={22} strokeLinecap="round" fill="none" />
      <path d={`M -150 -200 Q -196 -170 -176 ${-132 + pen * 0.3}`} stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.0} />
      <circle cx={-176} cy={-130 + pen * 0.3} r={19} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
      <g transform={`translate(${-176 + pen * 0.4} ${-128 + pen * 0.2}) rotate(${-30 + pen})`}>
        <rect x={-4} y={-50} width={9} height={64} rx={3} fill="#FFD84D" stroke={INK} strokeWidth={3} />
        <path d="M -4 14 L 0 28 L 5 14 Z" fill="#F5C99B" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
        <rect x={-4} y={-58} width={9} height={9} rx={2} fill="#FF8A5B" stroke={INK} strokeWidth={3} />
      </g>
      <path d={`M 150 -200 Q ${mood === "cheer" ? 210 : 196} ${mood === "cheer" ? -300 : -170} ${mood === "cheer" ? 190 : 176} ${mood === "cheer" ? -360 - Math.sin(t * 9) * 12 : -132 + Math.sin(t * 3) * 6}`} stroke={WOOD} strokeWidth={22} strokeLinecap="round" fill="none" />
      <circle cx={mood === "cheer" ? 190 : 176} cy={mood === "cheer" ? -364 - Math.sin(t * 9) * 12 : -130 + Math.sin(t * 3) * 6} r={19} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
      {since < 0 && null}
    </g>
  );
};
