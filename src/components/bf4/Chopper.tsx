// THE CHOPPER — the funny co-character of Big Friend 4. A round safety-yellow rescue helicopter seen
// head-on: its cockpit glass is its FACE (big eyes, a mouth), a row of three little DIAL gauges under it,
// skids for feet and a rotor on top. It starts cool (rotor turning lazily), SHAKES in the storm, LOCKS on
// "stuck" (rotor stops, a padlock on the hub, red warning lights flash, sweat, dials jammed in the red),
// GASPS at the friend reveal (huge eyes, O mouth, dials swing), SPINS UP during the bead moves (rotor
// whirring, determined brows), then lifts and CHEERS with a big grin. Pure function of its inputs.
// Bare <g>. Local box (skids at the origin, before scale): halfW 270, up 400.

import React from "react";

export type CHMood = "cool" | "storm" | "locked" | "gasp" | "spin" | "cheer";
export const CH_BOX = { halfW: 270, up: 362 };

const INK = "#1B2533";
const YEL = "#FFD400";
const YEL_D = "#E6B800";
const GLASS = "#BFE8FF";

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const Chopper: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: CHMood;
  moodFrame: number;
  frame: number;
  fps: number;
  squash?: number;
  hop?: number;
  /** 0..1 padlock on the rotor hub */
  lock?: number;
  /** 0..1 how clear the storm is (dial needles settle into the green as it clears) */
  clear?: number;
}> = ({ x, y, scale, mood, moodFrame, frame, fps, squash = 0, hop = 0, lock = 0, clear = 0 }) => {
  const t = frame / fps;
  const since = Math.max(0, frame - moodFrame);
  const shake = mood === "storm" ? Math.sin(t * 34) * 3.2 : mood === "locked" ? Math.sin(t * 52) * 2.6 * Math.min(1, since / 4) : 0;
  const lift = mood === "cheer" ? Math.abs(Math.sin(t * 5.2)) * 16 : 0;
  const sx = 1 + 0.12 * squash;
  const sy = 1 - 0.12 * squash;
  const blink = (t * 0.4) % 1 > 0.95 ? 0.15 : 1;

  const speed = mood === "locked" ? 0 : mood === "spin" || mood === "cheer" ? 78 : mood === "storm" ? 26 : mood === "gasp" ? 6 : 14;
  const ang = mood === "locked" ? 0.35 : (frame * speed * Math.PI) / 180;
  const bladeX = Math.cos(ang) * 250;
  const bladeY = Math.sin(ang) * 14;
  const fast = speed > 50;

  // the face
  const eyeY = -200;
  const eye = (cx: number, i: number) => {
    if (mood === "cheer") return <path key={i} d={`M ${cx - 26} ${eyeY + 8} Q ${cx} ${eyeY - 30} ${cx + 26} ${eyeY + 8}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />;
    const big = mood === "gasp" ? 1.35 : mood === "locked" ? 1.18 : mood === "spin" ? 0.9 : 1;
    const lookX = mood === "storm" ? Math.sin(t * 9) * 8 : mood === "spin" ? 6 : Math.sin(t * 1.1 + i) * 4;
    const pupil = mood === "gasp" ? 0.5 : mood === "locked" ? 0.6 : 1;
    return (
      <g key={i} transform={`translate(${cx} ${eyeY}) scale(${big} ${big * blink})`}>
        <ellipse rx={30} ry={34} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={lookX} cy={2} r={14 * pupil} fill={INK} />
        <circle cx={lookX + 4} cy={-4} r={4.5} fill="#FFFFFF" />
      </g>
    );
  };
  const brows =
    mood === "spin" ? (
      <g stroke={INK} strokeWidth={10} strokeLinecap="round">
        <path d="M -78 -250 L -26 -236" />
        <path d="M 78 -250 L 26 -236" />
      </g>
    ) : mood === "locked" || mood === "storm" ? (
      <g stroke={INK} strokeWidth={10} strokeLinecap="round">
        <path d="M -78 -238 L -26 -252" />
        <path d="M 78 -238 L 26 -252" />
      </g>
    ) : mood === "gasp" ? (
      <g stroke={INK} strokeWidth={10} strokeLinecap="round" fill="none">
        <path d="M -80 -254 Q -52 -272 -24 -254" />
        <path d="M 80 -254 Q 52 -272 24 -254" />
      </g>
    ) : null;
  const mouth = (() => {
    const my = -146;
    if (mood === "gasp") return <ellipse cx={0} cy={my} rx={20} ry={24} fill="#7A1030" stroke={INK} strokeWidth={5} />;
    if (mood === "cheer") return <path d={`M -52 ${my - 14} Q 0 ${my + 46} 52 ${my - 14} Z`} fill="#7A1030" stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
    if (mood === "locked") return <path d={`M -40 ${my} l 10 -9 l 10 9 l 10 -9 l 10 9 l 10 -9 l 10 9 l 10 -9`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === "storm") return <path d={`M -38 ${my + 6} Q 0 ${my - 16} 38 ${my + 6}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
    if (mood === "spin") return <path d={`M -34 ${my - 4} H 34`} stroke={INK} strokeWidth={8} strokeLinecap="round" />;
    return <path d={`M -42 ${my - 8} Q 0 ${my + 30} 42 ${my - 8}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
  })();

  // dials: needle level (0 left .. 1 right)
  const needle = (i: number) => {
    if (mood === "locked") return 0.92 + (hash(Math.floor(frame / 3) + i) - 0.5) * 0.06;
    if (mood === "gasp") return 0.5 + 0.45 * Math.sin(t * 14 + i * 1.6);
    if (mood === "spin") return 0.3 + 0.5 * Math.min(1, since / 24) + 0.04 * Math.sin(t * 20 + i);
    if (mood === "cheer") return 0.78 + 0.03 * Math.sin(t * 9 + i);
    if (mood === "storm") return 0.7 + 0.15 * Math.sin(t * 11 + i * 2);
    return 0.45 + 0.4 * (1 - clear) * 0.4 + 0.05 * Math.sin(t * 2 + i);
  };
  const warn = mood === "locked" && Math.floor(t * 6) % 2 === 0;

  return (
    <g transform={`translate(${x + shake * scale} ${y - hop - lift * scale}) scale(${scale * sx} ${scale * sy})`}>
      <ellipse cx={0} cy={8} rx={190} ry={16} fill="#000" opacity={0.28} />
      {/* skids */}
      <path d="M -170 -18 H 170" stroke={INK} strokeWidth={16} strokeLinecap="round" />
      <path d="M -170 -18 H 170" stroke="#8795A8" strokeWidth={8} strokeLinecap="round" />
      <path d="M -170 -18 q -24 -8 -24 -30" stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
      <path d="M 170 -18 q 24 -8 24 -30" stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />
      {[-96, 96].map((sxp) => (
        <path key={sxp} d={`M ${sxp} -18 L ${sxp * 0.74} -56`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
      ))}
      {/* the rotor mast, hub and blades */}
      <rect x={-14} y={-338} width={28} height={50} rx={8} fill="#55657A" stroke={INK} strokeWidth={5} />
      {fast && <ellipse cx={0} cy={-340} rx={262} ry={26} fill="#C8D4E2" opacity={0.45} />}
      <g transform="translate(0 -340)">
        <path d={`M ${-bladeX} ${-bladeY} L ${bladeX} ${bladeY}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d={`M ${-bladeX} ${-bladeY} L ${bladeX} ${bladeY}`} stroke="#E9EEF4" strokeWidth={11} strokeLinecap="round" />
        <circle r={20} fill="#55657A" stroke={INK} strokeWidth={6} />
        {lock > 0.02 && (
          <g transform={`translate(0 -4) scale(${0.5 + 0.7 * lock})`} opacity={lock}>
            <path d="M -13 -4 v -14 a 13 13 0 0 1 26 0 v 14" stroke={INK} strokeWidth={7} fill="none" />
            <rect x={-20} y={-6} width={40} height={32} rx={7} fill="#FF5A4D" stroke={INK} strokeWidth={5} />
            <circle cy={10} r={4.5} fill={INK} />
          </g>
        )}
      </g>
      {/* the body */}
      <ellipse cx={0} cy={-176} rx={172} ry={136} fill={YEL} stroke={INK} strokeWidth={8} />
      <path d="M -150 -120 Q 0 -60 150 -120" stroke={YEL_D} strokeWidth={14} fill="none" strokeLinecap="round" />
      {/* warning lights on the shoulders */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={s * 142} cy={-262} r={16} fill={warn ? "#FF3B3B" : mood === "cheer" ? "#5BE37A" : "#8A4A4A"} stroke={INK} strokeWidth={5} />
          {warn && <circle cx={s * 142} cy={-262} r={32} fill="#FF3B3B" opacity={0.3} />}
        </g>
      ))}
      {/* the cockpit glass = the face */}
      <ellipse cx={0} cy={-196} rx={124} ry={96} fill={GLASS} stroke={INK} strokeWidth={7} />
      <path d="M -88 -250 Q -50 -278 -6 -278" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
      {brows}
      {[-52, 52].map((cx, i) => eye(cx, i))}
      <ellipse cx={-86} cy={-168} rx={16} ry={9} fill="#FF9BB0" opacity={0.6} />
      <ellipse cx={86} cy={-168} rx={16} ry={9} fill="#FF9BB0" opacity={0.6} />
      {mouth}
      {/* the dial board */}
      <rect x={-112} y={-98} width={224} height={56} rx={16} fill="#2C3A4E" stroke={INK} strokeWidth={6} />
      {[-70, 0, 70].map((dx, i) => {
        const n = needle(i);
        const a = (-120 + 240 * n) * (Math.PI / 180);
        const red = n > 0.85;
        return (
          <g key={i} transform={`translate(${dx} -70)`}>
            <circle r={21} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
            <path d="M -15 8 A 17 17 0 0 1 -4 -16" stroke="#5BE37A" strokeWidth={4} fill="none" />
            <path d="M 8 -15 A 17 17 0 0 1 16 8" stroke="#FF5A4D" strokeWidth={4} fill="none" />
            <path d={`M 0 0 L ${Math.sin(a) * 15} ${-Math.cos(a) * 15}`} stroke={red ? "#D62B2B" : INK} strokeWidth={4} strokeLinecap="round" />
            <circle r={3.5} fill={INK} />
          </g>
        );
      })}
      {/* sweat / rain drops */}
      {(mood === "locked" || mood === "gasp" || mood === "storm") && (
        <path d={`M 150 ${-262 + ((t * 80) % 50)} q 14 24 0 36 q -14 -12 0 -36 Z`} fill="#8FDBFF" stroke="#2B8FC9" strokeWidth={3} />
      )}
    </g>
  );
};
