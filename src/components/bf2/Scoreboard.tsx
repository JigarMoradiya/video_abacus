// THE SCOREBOARD — the funny character of Big Friend 2. A navy-and-orange hall scoreboard on two legs:
// a score window on top (amber LED digits), and under it a FACE made of LEDs — square eyes and a
// dot-matrix mouth. It starts cool, goes alert at the closing-bell line, FREEZES on "stuck" (ice tint,
// glitching digits, x-eyes, a zigzag mouth, sweat), GASPS at the friend reveal, REBOOTS (loading dots)
// during the bead moves, then CHEERS (^ ^ eyes, a huge smile, strobing bulbs, foam hands) with the answer.
// Pure function of its inputs. Bare <g>. Local box (feet at origin, before scale): halfW 270, up 470.

import React from "react";
import { Txt } from "../bf1/Props";
import { AMBER, AQUA, CORAL, DEEP, INK2, LIME, NAVY, ORANGE, TEAL } from "./Props2";

export type SBMood = "cool" | "alert" | "freeze" | "gasp" | "reboot" | "cheer";
export const SB_BOX = { halfW: 270, up: 470 };

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** dot-matrix mouth: the dot positions for each mood, `open` 0..1 for the talking flap */
const mouthDots = (mood: SBMood, t: number, frame: number): [number, number][] => {
  const dots: [number, number][] = [];
  const N = 11;
  if (mood === "gasp") {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      dots.push([Math.cos(a) * 34, Math.sin(a) * 38]);
    }
    return dots;
  }
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const x = (u - 0.5) * 150;
    let y = 0;
    if (mood === "cool") y = 16 * (1 - Math.pow(2 * u - 1, 2)) - 4;
    else if (mood === "alert") y = -6 * (1 - Math.pow(2 * u - 1, 2)) + 4;
    else if (mood === "freeze") y = (i % 2 === 0 ? -9 : 9) + (hash(frame * 0.2 + i) - 0.5) * 6;
    else if (mood === "reboot") y = Math.sin(t * 10 + i * 0.7) * 3;
    else if (mood === "cheer") y = 30 * (1 - Math.pow(2 * u - 1, 2)) - 10;
    dots.push([x, y]);
  }
  return dots;
};

export const Scoreboard: React.FC<{
  x: number;
  y: number;
  scale: number;
  mood: SBMood;
  moodFrame: number;
  frame: number;
  fps: number;
  /** the digits in the score window */
  score: string;
  /** "freeze" glitches, "answer" is the green solved number */
  scoreMode: "normal" | "freeze" | "answer";
  squash?: number;
  hop?: number;
  /** 0..1 how frozen (ice tint) */
  ice?: number;
  /** 0..1 the lights-out finale dimming of the bulbs */
  lights?: number;
}> = ({ x, y, scale, mood, moodFrame, frame, fps, score, scoreMode, squash = 0, hop = 0, ice = 0, lights = 1 }) => {
  const t = frame / fps;
  const since = Math.max(0, frame - moodFrame);
  const shake = mood === "freeze" ? Math.sin(t * 52) * 3 * Math.min(1, since / 4) : mood === "alert" ? Math.sin(t * 30) * 1.4 : 0;
  const cheerBounce = mood === "cheer" ? Math.abs(Math.sin(t * 5.4)) * 12 : 0;
  const blink = (t * 0.4) % 1 > 0.95 ? 0.15 : 1;
  const sx = 1 + 0.12 * squash;
  const sy = 1 - 0.12 * squash;

  const eyeY = -218;
  const eye = (cx: number, i: number) => {
    if (mood === "freeze") {
      const showX = Math.floor(frame / 5) % 3 !== 0;
      return showX ? (
        <g key={i} transform={`translate(${cx} ${eyeY})`}>
          <path d="M -26 -26 L 26 26 M 26 -26 L -26 26" stroke={AQUA} strokeWidth={14} strokeLinecap="round" />
        </g>
      ) : (
        <g key={i} transform={`translate(${cx} ${eyeY})`}>
          <rect x={-34} y={-30} width={68} height={60} rx={10} fill={AQUA} opacity={0.8} />
          <Txt x={0} y={22} size={64} fill={DEEP} stroke={DEEP} sw={0}>8</Txt>
        </g>
      );
    }
    if (mood === "cheer") {
      return (
        <g key={i} transform={`translate(${cx} ${eyeY})`}>
          <path d="M -32 14 Q 0 -34 32 14" stroke={AMBER} strokeWidth={15} fill="none" strokeLinecap="round" />
        </g>
      );
    }
    if (mood === "reboot") {
      return (
        <g key={i} transform={`translate(${cx} ${eyeY})`}>
          {[0, 1, 2].map((d) => (
            <circle key={d} cx={(d - 1) * 24} cy={0} r={9 + 4 * Math.max(0, Math.sin(t * 12 - d * 1.2))} fill={AQUA} />
          ))}
        </g>
      );
    }
    const big = mood === "gasp" ? 1.3 : mood === "alert" ? 1.12 : 1;
    const pupil = mood === "gasp" ? 0.5 : 1;
    const look = Math.sin(t * 1.1 + i) * 5;
    return (
      <g key={i} transform={`translate(${cx} ${eyeY}) scale(${big} ${big * blink})`}>
        <rect x={-36} y={-36} width={72} height={72} rx={18} fill={AQUA} stroke={INK2} strokeWidth={4} />
        <circle cx={look} cy={mood === "alert" ? -4 : 2} r={17 * pupil} fill={DEEP} />
        <circle cx={look + 5} cy={-6} r={5} fill="#FFFFFF" />
      </g>
    );
  };

  const brows = (() => {
    if (mood === "alert") {
      return (
        <g stroke={AMBER} strokeWidth={12} strokeLinecap="round">
          <path d="M -140 -274 L -62 -258" />
          <path d="M 140 -274 L 62 -258" />
        </g>
      );
    }
    if (mood === "freeze") {
      return (
        <g stroke={AMBER} strokeWidth={12} strokeLinecap="round">
          <path d="M -140 -256 L -62 -276" />
          <path d="M 140 -256 L 62 -276" />
        </g>
      );
    }
    if (mood === "gasp") {
      return (
        <g stroke={AMBER} strokeWidth={12} strokeLinecap="round">
          <path d="M -134 -282 Q -100 -300 -64 -282" fill="none" />
          <path d="M 134 -282 Q 100 -300 64 -282" fill="none" />
        </g>
      );
    }
    return null;
  })();

  const dots = mouthDots(mood, t, frame);
  const glowCol = mood === "freeze" ? AQUA : mood === "alert" ? CORAL : AMBER;
  const bulbOn = (i: number) => (mood === "cheer" ? Math.floor(t * 9 + i) % 2 === 0 : mood === "freeze" ? hash(Math.floor(frame / 4) + i * 3) > 0.45 : (Math.floor(t * 4) + i) % 3 === 0);
  const glitchOff = mood === "freeze" || scoreMode === "freeze" ? (hash(Math.floor(frame / 3)) - 0.5) * 14 : 0;
  const shownScore = scoreMode === "freeze" && Math.floor(frame / 6) % 4 === 3 ? "88" : score;
  const scoreCol = scoreMode === "answer" ? LIME : scoreMode === "freeze" ? AQUA : AMBER;
  const flick = scoreMode === "freeze" ? (Math.floor(frame / 2) % 5 === 0 ? 0.4 : 1) : 1;

  return (
    <g transform={`translate(${x + shake * scale} ${y - hop - cheerBounce * scale}) scale(${scale * sx} ${scale * sy})`}>
      <ellipse cx={0} cy={8} rx={250} ry={20} fill="#000" opacity={0.28} />
      {/* legs */}
      {[-150, 150].map((lx) => (
        <g key={lx}>
          <rect x={lx - 22} y={-96} width={44} height={96} rx={8} fill={NAVY} stroke={INK2} strokeWidth={6} />
          <rect x={lx - 38} y={-14} width={76} height={20} rx={8} fill={ORANGE} stroke={INK2} strokeWidth={5} />
        </g>
      ))}
      {/* foam hands on sticks (cheer) */}
      {mood === "cheer" &&
        [-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 262} ${-250 - 30 * Math.abs(Math.sin(t * 5.4 + (s > 0 ? 1 : 0)))}) rotate(${s * 14 * Math.sin(t * 5.4)})`}>
            <rect x={-7} y={0} width={14} height={120} rx={5} fill="#E0A81C" stroke={INK2} strokeWidth={4} />
            <path d="M -38 4 q -10 -52 14 -54 q 4 0 6 8 q 2 -22 16 -20 q 12 2 8 22 q 14 -14 22 -2 q 6 14 -10 30 q -4 30 -26 30 q -24 0 -30 -14 Z" fill="#FF5A4D" stroke={INK2} strokeWidth={5} strokeLinejoin="round" />
          </g>
        ))}
      {/* the board */}
      <rect x={-250} y={-440} width={500} height={350} rx={34} fill={ORANGE} stroke={INK2} strokeWidth={9} />
      <rect x={-232} y={-422} width={464} height={314} rx={24} fill={NAVY} stroke={INK2} strokeWidth={5} />
      {/* bulbs round the frame */}
      {Array.from({ length: 16 }, (_, i) => {
        const on = bulbOn(i) && lights > 0.2;
        const bx = -222 + i * (444 / 15);
        return (
          <g key={i}>
            <circle cx={bx} cy={-431} r={7} fill={on ? AMBER : "#7A5A1C"} opacity={on ? lights : 0.7} />
            <circle cx={bx} cy={-99} r={7} fill={on ? AMBER : "#7A5A1C"} opacity={on ? lights : 0.7} />
          </g>
        );
      })}
      {/* the score window */}
      <rect x={-190} y={-404} width={380} height={96} rx={16} fill={DEEP} stroke={INK2} strokeWidth={5} />
      <g opacity={flick} transform={`translate(${glitchOff} 0)`}>
        {scoreMode === "freeze" && (
          <>
            <Txt x={-4} y={-326} size={86} fill="#FF5A4D" stroke={DEEP} sw={0} spacing={8} opacity={0.65}>{shownScore}</Txt>
            <Txt x={4} y={-326} size={86} fill={AQUA} stroke={DEEP} sw={0} spacing={8} opacity={0.65}>{shownScore}</Txt>
          </>
        )}
        <g transform={`translate(0 ${-326}) scale(${scoreMode === "answer" ? 1 + 0.18 * Math.max(0, 1 - since / 14) : 1})`}>
          <Txt x={0} y={0} size={86} fill={scoreCol} stroke={DEEP} sw={0} spacing={8}>{shownScore}</Txt>
        </g>
      </g>
      {/* the face panel */}
      <rect x={-190} y={-296} width={380} height={176} rx={20} fill={DEEP} stroke={INK2} strokeWidth={5} />
      {brows}
      {[-92, 92].map((cx, i) => eye(cx * 0.62 + (cx < 0 ? -26 : 26) * 0.5, i))}
      {/* the dot-matrix mouth */}
      <g transform="translate(0 -160)">
        {dots.map(([dx, dy], i) => (
          <circle key={i} cx={dx} cy={dy} r={mood === "gasp" ? 8 : 9} fill={glowCol} />
        ))}
      </g>
      {/* ice and sweat while frozen */}
      {ice > 0.02 && (
        <g opacity={ice}>
          <rect x={-250} y={-440} width={500} height={350} rx={34} fill="#BFF3FF" opacity={0.26} />
          {[-190, -110, 60, 150, 205].map((ix, i) => (
            <path key={ix} d={`M ${ix - 14} -436 L ${ix} ${-436 + 44 + (i % 2) * 24} L ${ix + 14} -436 Z`} fill="#E9FBFF" stroke="#7FD6EE" strokeWidth={3} strokeLinejoin="round" />
          ))}
          <path d="M -120 -380 l 30 22 l -14 16 l 26 20" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
        </g>
      )}
      {(mood === "freeze" || mood === "gasp") && (
        <path d={`M 220 ${-300 + ((t * 80) % 50)} q 14 24 0 36 q -14 -12 0 -36 Z`} fill="#8FDBFF" stroke="#2B8FC9" strokeWidth={3} />
      )}
      {/* antenna light */}
      <rect x={-8} y={-476} width={16} height={36} fill={INK2} />
      <circle cx={0} cy={-480} r={16} fill={mood === "alert" || mood === "freeze" ? (Math.floor(t * 8) % 2 === 0 ? CORAL : "#7A2A28") : TEAL} stroke={INK2} strokeWidth={5} />
    </g>
  );
};
