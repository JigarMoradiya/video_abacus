// The props of the Big Friend 6 short (the one-minute LIGHTNING ROUND, MIXED adding and taking away): a bold
// racing look in deep indigo and black with electric lime, sunset orange and cyan. Skewed header plates, a
// live TIMER plate with a draining bar and lap lights, an oval-track "ten" of lamps for the pairs, speed-sign
// ADD / TAKE AWAY boards, a game-show buzzer, a big draining clock, a GO! burst, a race car that bonks a
// barrier, a bolt call, a neon countdown ring, bolt-linked badges for the friend bond, a dashboard strip for
// the friend trick (+n = -friend +10, or -n = +friend -10), NEXT / ONE LEFT banners and a PERFECT SCORE board.
// Every text sits on a plate chosen for measured contrast (tools/contrast_audit.py): light neon text only on
// near-black plates, dark text only on lime / orange / white plates. Bare <g> (the caption is HTML).

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import type { TPhrase } from "../../lib/timing";
import { Txt, textW, clamp01, easeOut } from "../bf1/Props";

export const INK6 = "#0B0720";
export const INDIGO = "#1A1252";
export const LIME6 = "#B6FF2E";
export const ORANGE6 = "#FF7A1A";
export const CYAN6 = "#2EE6FF";
export const WHITE6 = "#FFFFFF";
export const RED6 = "#E5273D";

const polar = (r: number, deg: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r] as const;
const fmt = (s: number) => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.floor(Math.max(0, s) % 60)).padStart(2, "0")}`;

/** a parallelogram path: skewed plate, `k` px of slant each side */
const para = (x: number, y: number, w: number, h: number, k = 26) => `M ${x + k} ${y} H ${x + w} L ${x + w - k} ${y + h} H ${x} Z`;

// ---------------------------------------------------------------- the story banner

export const raceBannerW = () => Math.round(textW("LIGHTNING ROUND!", 46, 2)) + 110;
export const RaceBanner: React.FC<{ x: number; y: number; h: number; frame: number; fps: number }> = ({ x, y, h, frame, fps }) => {
  const w = raceBannerW();
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * 10);
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={para(0, 0, w, h)} fill={LIME6} stroke={INK6} strokeWidth={6} strokeLinejoin="round" />
      <path d={para(14, 12, 40, h - 24, 12)} fill={ORANGE6} opacity={0.4 + 0.6 * pulse} />
      <Txt x={w / 2 + 14} y={h / 2 + 16} size={46} fill={INK6} stroke={INK6} sw={0} spacing={2}>LIGHTNING ROUND!</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the live timer plate (top row)

export const TimerPlate: React.FC<{ x: number; y: number; w: number; h: number; secLeft: number; done: number; pulses: number[]; flash: number; frame: number; fps: number }> = ({ x, y, w, h, secLeft, done, pulses, flash, frame, fps }) => {
  const t = frame / fps;
  const low = secLeft <= 12;
  const blink = flash > 0.02 ? Math.floor(t * 8) % 2 === 0 : false;
  const col = blink ? WHITE6 : low ? ORANGE6 : LIME6;
  const bar = clamp01(secLeft / 60);
  return (
    <g>
      <path d={para(x, y, w, h, 16)} fill={INK6} stroke={col} strokeWidth={5} strokeLinejoin="round" />
      <Txt x={x + 104} y={y + h / 2 + 10} size={44} fill={col} stroke={INK6} sw={0} spacing={1}>{fmt(secLeft)}</Txt>
      <rect x={x + 36} y={y + h - 11} width={142} height={5} rx={2.5} fill="#3A2F7A" />
      <rect x={x + 36} y={y + h - 11} width={142 * bar} height={5} rx={2.5} fill={col} />
      {[0, 1, 2, 3].map((i) => {
        const lit = i < done;
        const pop = lit ? 1 + 0.35 * (pulses[i] ?? 0) : 1;
        return (
          <g key={i} transform={`translate(${x + 220 + i * 30} ${y + h / 2}) scale(${pop})`}>
            <circle r={11} fill={lit ? LIME6 : "#2D2470"} stroke={WHITE6} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the question header: a racing plate

const Plate: React.FC<{ x: number; y: number; w: number; h: number; edge?: string }> = ({ x, y, w, h, edge = LIME6 }) => (
  <g>
    <path d={para(x, y, w, h, 40)} fill={INK6} stroke={edge} strokeWidth={8} strokeLinejoin="round" />
    <path d={para(x + 12, y + 12, w - 24, h - 24, 34)} fill="none" stroke={edge} strokeWidth={3} opacity={0.5} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${x + 10 + i * 18} ${y + h - 8} l 24 -${h - 16}`} stroke={ORANGE6} strokeWidth={5} opacity={0.0} />
    ))}
    {[0, 1, 2].map((i) => (
      <path key={`l${i}`} d={`M ${x + 6 - i * 0} ${y + 28 + i * 12} h ${10 + i * 6}`} stroke={edge} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
    ))}
  </g>
);

export const RaceHeader: React.FC<{
  x: number; y: number; w: number; h: number;
  a: number; b: number; op: "add" | "take"; answer: number;
  showAnswer: number; flashA: number; flashB: number; stuck: number; appear: number; frame: number; fps: number;
}> = ({ x, y, w, h, a, b, op, answer, showAnswer, flashA, flashB, stuck, appear, frame, fps }) => {
  const t = frame / fps;
  const k = easeOut(appear);
  const mid = x + w / 2;
  const base = 108;
  const ansK = easeOut(showAnswer);
  const hot = (f: number) => (f > 0.05 ? LIME6 : WHITE6);
  const shake = stuck > 0.05 && ansK < 0.02 ? Math.sin(t * 44) * 2.4 * stuck : 0;
  return (
    <g transform={`translate(${(1 - k) * -520 + shake} 0)`} opacity={Math.min(1, k * 2.4)}>
      <Plate x={x} y={y} w={w} h={h} />
      <g transform={`translate(${mid - 245} ${y + h / 2 + 38})`}>
        <g transform={`scale(${1 + 0.3 * flashA})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashA)} stroke={INK6} sw={8}>{a}</Txt>
        </g>
        <Txt x={140} y={0} size={96} fill={op === "add" ? LIME6 : ORANGE6} stroke={INK6} sw={8}>{op === "add" ? "+" : "−"}</Txt>
        <g transform={`translate(262 0) scale(${1 + 0.3 * flashB})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashB)} stroke={INK6} sw={8}>{b}</Txt>
        </g>
        <Txt x={372} y={0} size={96} fill={CYAN6} stroke={INK6} sw={8}>=</Txt>
        {ansK < 0.02 ? (
          <Txt x={500} y={0} size={base} fill={CYAN6} stroke={INK6} sw={8}>?</Txt>
        ) : (
          <g transform={`translate(500 0) scale(${0.4 + 0.75 * ansK})`} style={{ transformOrigin: "0 -34px" }}>
            <Txt x={0} y={0} size={base} fill={LIME6} stroke={INK6} sw={8}>{answer}</Txt>
          </g>
        )}
      </g>
      {stuck > 0.02 && ansK < 0.02 && (() => {
        const size = 52;
        const bw = Math.round(textW("STUCK!", size, 2)) + 90;
        const bh = 80;
        return (
          <g transform={`translate(${x + w - 330} ${y + h - 6}) rotate(${-6 + (1 - easeOut(stuck)) * 14}) scale(${0.4 + 0.36 * easeOut(stuck)})`} opacity={clamp01(stuck * 3)}>
            <path d={para(-bw / 2, -bh / 2, bw, bh, 22)} fill={ORANGE6} stroke={INK6} strokeWidth={7} strokeLinejoin="round" />
            <Txt x={4} y={19} size={size} fill={INK6} stroke={INK6} sw={0} spacing={2}>STUCK!</Txt>
          </g>
        );
      })()}
    </g>
  );
};

export const TextHeader: React.FC<{ x: number; y: number; w: number; h: number; text: string; size: number; appear: number; tone?: "lime" | "orange" | "cyan" }> = ({ x, y, w, h, text, size, appear, tone = "lime" }) => {
  const k = easeOut(appear);
  const col = tone === "lime" ? LIME6 : tone === "orange" ? ORANGE6 : CYAN6;
  return (
    <g transform={`translate(${(1 - k) * -520} 0)`} opacity={Math.min(1, k * 2.4)}>
      <Plate x={x} y={y} w={w} h={h} edge={col} />
      <Txt x={x + w / 2 + 6} y={y + h / 2 + size * 0.36} size={size} fill={col} stroke={INK6} sw={7} spacing={2}>{text}</Txt>
    </g>
  );
};

export const PairHeader: React.FC<{ x: number; y: number; w: number; h: number; l: number; r: number; flashL: number; flashR: number; appear: number }> = ({ x, y, w, h, l, r, flashL, flashR, appear }) => {
  const k = easeOut(appear);
  const mid = x + w / 2;
  const base = 108;
  const hot = (f: number) => (f > 0.05 ? LIME6 : WHITE6);
  return (
    <g transform={`translate(${(1 - k) * -520} 0)`} opacity={Math.min(1, k * 2.4)}>
      <Plate x={x} y={y} w={w} h={h} />
      <g transform={`translate(${mid - 235} ${y + h / 2 + 38})`}>
        <g transform={`scale(${1 + 0.3 * flashL})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashL)} stroke={INK6} sw={8}>{l}</Txt>
        </g>
        <Txt x={118} y={0} size={92} fill={LIME6} stroke={INK6} sw={8}>+</Txt>
        <g transform={`translate(236 0) scale(${1 + 0.3 * flashR})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashR)} stroke={INK6} sw={8}>{r}</Txt>
        </g>
        <Txt x={352} y={0} size={92} fill={CYAN6} stroke={INK6} sw={8}>=</Txt>
        <Txt x={470} y={0} size={base} fill={ORANGE6} stroke={INK6} sw={8}>10</Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the panel props

/** an oval race track with ten lamps: the first n lime, the rest orange; the numbers sit in the middle */
export const TrackTen: React.FC<{ cx: number; cy: number; n: number; f: number; k: number; flashN: number; flashF: number; frame: number; fps: number }> = ({ cx, cy, n, f, k, flashN, flashF, frame, fps }) => {
  const t = frame / fps;
  const rx = 190;
  const ry = 250;
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as const;
  });
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx + 34} ry={ry + 34} fill={INK6} stroke={WHITE6} strokeWidth={6} />
      <ellipse cx={cx} cy={cy} rx={rx - 34} ry={ry - 34} fill="#2B2C3A" stroke={WHITE6} strokeWidth={4} strokeDasharray="14 12" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#4B4E66" strokeWidth={46} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#FFFFFF" strokeWidth={4} strokeDasharray="22 18" strokeDashoffset={-t * 90} opacity={0.7} />
      {pts.map(([px, py], i) => {
        const shown = clamp01(k * 11 - i);
        const isN = i < n;
        return (
          <g key={i} transform={`translate(${px} ${py}) scale(${0.3 + 0.7 * easeOut(shown)})`} opacity={clamp01(shown * 3)}>
            <circle r={24} fill={isN ? LIME6 : ORANGE6} stroke={INK6} strokeWidth={5} />
            <circle cx={-7} cy={-8} r={6} fill="#FFFFFF" opacity={0.7} />
          </g>
        );
      })}
      <g transform={`translate(${cx - 62} ${cy - 20}) scale(${1 + 0.4 * flashN})`}>
        <Txt x={0} y={0} size={110} fill={LIME6} stroke={INK6} sw={9}>{n}</Txt>
      </g>
      <g transform={`translate(${cx + 62} ${cy + 66}) scale(${1 + 0.4 * flashF})`}>
        <Txt x={0} y={0} size={110} fill={ORANGE6} stroke={INK6} sw={9}>{f}</Txt>
      </g>
      <path d={`M ${cx - 30} ${cy + 70} L ${cx + 30} ${cy - 20}`} stroke={WHITE6} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
    </g>
  );
};

/** a skewed speed sign: dark text on lime or orange */
export const SpeedSign: React.FC<{ cx: number; cy: number; text: string; size: number; tone: "lime" | "orange"; k: number; frame: number; fps: number }> = ({ cx, cy, text, size, tone, k, frame, fps }) => {
  const pop = easeOut(Math.min(1, k * 3));
  const pad = 46;
  const w = Math.round(textW(text, size, 2)) + pad * 2;
  const h = size + 64;
  const sh = Math.sin((frame / fps) * 12) * 2;
  return (
    <g transform={`translate(${cx + (1 - pop) * -300 + sh} ${cy}) scale(${0.6 + 0.4 * pop})`} opacity={clamp01(k * 3)}>
      <path d={para(-w / 2, -h / 2, w, h, 30)} fill={tone === "lime" ? LIME6 : ORANGE6} stroke={INK6} strokeWidth={8} strokeLinejoin="round" />
      <Txt x={4} y={size * 0.36} size={size} fill={INK6} stroke={INK6} sw={0} spacing={2}>{text}</Txt>
    </g>
  );
};

/** a game-show buzzer: a big dome on a base with starry rays and a QUIZ plate */
export const QuizBuzzer: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const press = Math.max(0, Math.sin(t * 6)) * 10;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.45 + 0.55 * pop})`} opacity={pop}>
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2 + t;
        return <path key={i} d={`M ${Math.cos(a) * 130} ${Math.sin(a) * 130 - 40} L ${Math.cos(a) * (170 + 14 * Math.sin(t * 9 + i))} ${Math.sin(a) * (170 + 14 * Math.sin(t * 9 + i)) - 40}`} stroke={LIME6} strokeWidth={10} strokeLinecap="round" />;
      })}
      <ellipse cy={80} rx={140} ry={42} fill={INK6} stroke={WHITE6} strokeWidth={6} />
      <path d={`M -110 ${60 + press} Q -110 -60 0 -60 Q 110 -60 110 ${60 + press} Z`} fill={ORANGE6} stroke={INK6} strokeWidth={8} />
      <path d="M -70 0 Q -64 -34 -20 -42" stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.7} />
      <g transform="translate(0 170)">
        <path d={para(-120, -36, 240, 72, 22)} fill={LIME6} stroke={INK6} strokeWidth={6} strokeLinejoin="round" />
        <Txt x={0} y={14} size={44} fill={INK6} stroke={INK6} sw={0} spacing={3}>QUIZ!</Txt>
      </g>
    </g>
  );
};

/** a spiky burst with dark text on lime / orange (GO!, NEXT!, ONE LEFT!) — plate sized from its text */
export const Burst: React.FC<{ cx: number; cy: number; text: string; size: number; k: number; frame: number; fps: number; tone?: "lime" | "orange"; spin?: boolean }> = ({ cx, cy, text, size, k, frame, fps, tone = "lime", spin = true }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const R = Math.round(textW(text, size, 1) / 2) + 50;
  const n = 16;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? R * 1.22 : R * 0.98;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.3 + 0.7 * pop}) rotate(${spin ? Math.sin(t * 9) * 5 : 0})`} opacity={clamp01(k * 3)}>
      <polygon points={pts} fill={tone === "lime" ? LIME6 : ORANGE6} stroke={INK6} strokeWidth={8} strokeLinejoin="round" />
      <Txt x={0} y={size * 0.36} size={size} fill={INK6} stroke={INK6} sw={0} spacing={1}>{text}</Txt>
    </g>
  );
};

/** a big draining clock: the digits and a ring that empties as the minute runs out */
export const BigClock: React.FC<{ cx: number; cy: number; secLeft: number; k: number; flash: number; frame: number; fps: number }> = ({ cx, cy, secLeft, k, flash, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const low = secLeft <= 12;
  const blink = flash > 0.02 && Math.floor(t * 8) % 2 === 0;
  const col = blink ? WHITE6 : low ? ORANGE6 : LIME6;
  const r = 150;
  const bar = clamp01(secLeft / 60);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.5 + 0.5 * pop})`} opacity={pop}>
      <circle r={r + 14} fill={INK6} stroke={WHITE6} strokeWidth={8} />
      <circle r={r - 8} fill="none" stroke="#3A2F7A" strokeWidth={22} />
      <circle r={r - 8} fill="none" stroke={col} strokeWidth={22} strokeDasharray={`${bar * 2 * Math.PI * (r - 8)} 2000`} transform="rotate(-90)" strokeLinecap="round" />
      <Txt x={0} y={38} size={112} fill={col} stroke={INK6} sw={0} spacing={2}>{fmt(secLeft)}</Txt>
      <Txt x={0} y={-58} size={26} fill={WHITE6} stroke={INK6} sw={0} spacing={4}>THE CLOCK</Txt>
    </g>
  );
};

/** a little race car with the number on its door that drives at the full ones rod and bounces off */
export const CarBonk: React.FC<{ x0: number; x1: number; cy: number; label: string; start: number; frame: number }> = ({ x0, x1, cy, label, start, frame }) => {
  const cyc = 30;
  const d = frame - start;
  if (d < 0) return null;
  const u = (d % cyc) / cyc;
  const fwd = u < 0.5;
  const x = fwd ? x0 - (x0 - x1) * (u * 2) * (u * 2) : x1 + (x0 - x1) * (1 - Math.pow(1 - (u - 0.5) * 2, 2));
  const hit = u >= 0.5 && u < 0.72;
  const tilt = hit ? -14 * (1 - (u - 0.5) * 4.5) : 0;
  const appear = clamp01(d / 8);
  return (
    <g transform={`translate(${x} ${cy}) rotate(${tilt}) scale(${0.5 + 0.5 * appear})`}>
      <path d="M -120 30 Q -124 -6 -90 -10 L -52 -52 Q -40 -62 -20 -62 H 40 Q 60 -62 72 -46 L 96 -10 Q 124 -8 124 28 Z" fill={ORANGE6} stroke={INK6} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -44 -12 L -30 -46 H 36 L 54 -12 Z" fill="#BFF3FF" stroke={INK6} strokeWidth={5} strokeLinejoin="round" />
      {[-70, 72].map((wx) => (
        <g key={wx} transform={`translate(${wx} 34)`}>
          <circle r={26} fill={INK6} />
          <circle r={12} fill="#C9D3DF" />
        </g>
      ))}
      <rect x={-34} y={0} width={68} height={34} rx={8} fill={WHITE6} stroke={INK6} strokeWidth={4} />
      <Txt x={0} y={27} size={32} fill={INK6} stroke={INK6} sw={0}>{label}</Txt>
      {hit && (
        <g transform="translate(150 -30)" opacity={1 - (u - 0.5) * 3.5}>
          <path d="M 0 0 l -22 -14 l 2 22 l -24 -4 l 18 16 l -18 18 l 26 -6 l 0 20 l 18 -18 l 16 14 l -4 -22 l 22 -4 l -18 -12 Z" fill={LIME6} stroke={INK6} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

/** a lightning bolt burst for the call, "CALL A FRIEND!" on a dark plate in lime */
export const BoltCall: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const size = 40;
  const lw = Math.round(textW("CALL A FRIEND!", size, 1)) + 60;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.45 + 0.55 * pop})`} opacity={pop}>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + t * 2;
        return <path key={i} d={`M ${Math.cos(a) * 120} ${Math.sin(a) * 120 - 50} L ${Math.cos(a) * (170 + 16 * Math.sin(t * 14 + i))} ${Math.sin(a) * (170 + 16 * Math.sin(t * 14 + i)) - 50}`} stroke={i % 2 ? CYAN6 : ORANGE6} strokeWidth={10} strokeLinecap="round" />;
      })}
      <path d="M 28 -190 L -62 -36 H -4 L -36 100 L 70 -62 H 10 Z" fill={LIME6} stroke={INK6} strokeWidth={10} strokeLinejoin="round" transform={`translate(0 ${-4 + Math.sin(t * 20) * 3})`} />
      <g transform="translate(0 168)">
        <path d={para(-lw / 2, -36, lw, 72, 24)} fill={INK6} stroke={LIME6} strokeWidth={6} strokeLinejoin="round" />
        <Txt x={0} y={15} size={size} fill={LIME6} stroke={INK6} sw={0} spacing={1}>CALL A FRIEND!</Txt>
      </g>
    </g>
  );
};

/** the neon countdown: a cyan ring that closes, a giant digit */
export const NeonCount: React.FC<{ cx: number; cy: number; n: number; k: number; frame: number; fps: number }> = ({ cx, cy, n, k }) => {
  const pop = 0.4 + 0.6 * easeOut(Math.min(1, k * 2.4)) + 0.1 * Math.max(0, 1 - k * 3);
  const col = n === 3 ? ORANGE6 : n === 2 ? LIME6 : CYAN6;
  const r = 140;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pop})`}>
      <circle r={r + 14} fill={INK6} stroke={WHITE6} strokeWidth={7} />
      <circle r={r - 10} fill="none" stroke="#3A2F7A" strokeWidth={20} />
      <circle r={r - 10} fill="none" stroke={col} strokeWidth={20} strokeDasharray={`${clamp01(k) * 2 * Math.PI * (r - 10)} 2000`} transform="rotate(-90)" strokeLinecap="round" />
      <Txt x={0} y={58} size={176} fill={col} stroke={INK6} sw={9}>{n}</Txt>
    </g>
  );
};

/** the friend bond: two hexagon badges (n lime, friend orange) linked by a lightning bolt, "= 10" under */
export const BoltBond: React.FC<{ cx: number; cy: number; n: number; friend: number; k: number; flashN: number; flashF: number; friendReveal: number; frame: number; fps: number }> = ({ cx, cy, n, friend, k, flashN, flashF, friendReveal, frame, fps }) => {
  const t = frame / fps;
  const move = easeOut(clamp01(k * 1.5));
  const gap = 150 - 36 * move;
  const joined = clamp01((k - 0.5) / 0.25);
  const hexPath = (r: number) => Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");
  const sN = 1 + 0.26 * flashN;
  const sF = (1 + 0.26 * flashF) * (0.6 + 0.4 * easeOut(friendReveal));
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g transform={`translate(${-gap} ${Math.sin(t * 5) * 3}) scale(${sN})`}>
        <polygon points={hexPath(88)} fill={LIME6} stroke={INK6} strokeWidth={8} strokeLinejoin="round" />
        <Txt x={0} y={34} size={100} fill={INK6} stroke={INK6} sw={0}>{n}</Txt>
      </g>
      <g transform={`translate(${gap} ${Math.sin(t * 5 + 1) * 3}) scale(${sF})`}>
        <polygon points={hexPath(88)} fill={ORANGE6} stroke={INK6} strokeWidth={8} strokeLinejoin="round" />
        <Txt x={0} y={34} size={100} fill={INK6} stroke={INK6} sw={0}>{friendReveal > 0.02 ? friend : "?"}</Txt>
      </g>
      <path d={`M ${-gap + 74} -8 L -10 -34 L 6 -4 L -4 24 L ${gap - 74} 4`} stroke={CYAN6} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.35 + 0.65 * joined} />
      {joined > 0.05 && (
        <g transform={`translate(0 ${124}) scale(${0.4 + 0.6 * easeOut(joined)})`} opacity={joined}>
          <path d={para(-96, -34, 192, 68, 18)} fill={INK6} stroke={LIME6} strokeWidth={6} strokeLinejoin="round" />
          <Txt x={0} y={17} size={52} fill={LIME6} stroke={INK6} sw={0} spacing={2}>= 10</Txt>
        </g>
      )}
    </g>
  );
};

/** the friend trick on a DASHBOARD strip: add: +n = −friend +10, take away: −n = +friend −10 */
export const DashStrip: React.FC<{ x: number; y: number; w: number; h: number; op: "add" | "take"; n: number; friend: number; appear: number; friendReveal: number; flashOperand: number; flashFriend: number; flashTen: number; frame: number; fps: number }> = ({ x, y, w, h, op, n, friend, appear, friendReveal, flashOperand, flashFriend, flashTen, frame, fps }) => {
  const k = easeOut(appear);
  const t = frame / fps;
  const hot = (f: number) => (f > 0.05 ? LIME6 : WHITE6);
  const sc = (f: number) => 1 + 0.28 * f;
  const fsz = Math.round(Math.min((h - 70) * 0.72, w * 0.17));
  const cy = y + 62 + (h - 62 - 14) / 2 + fsz * 0.34;
  const rev = easeOut(friendReveal);
  const sgnN = op === "add" ? "+" : "−";
  const sgnF = op === "add" ? "−" : "+";
  const ten = op === "add" ? "+10" : "−10";
  const tag = "FRIEND TRICK";
  const tagW = Math.round(textW(tag, 26, 4)) + 90; // even padding either side of the text, clear of the slant
  return (
    <g transform={`translate(${(1 - k) * -300} 0)`} opacity={Math.min(1, k * 2.4)}>
      <path d={para(x, y, w, h, 24)} fill={INK6} stroke={CYAN6} strokeWidth={6} strokeLinejoin="round" />
      {Array.from({ length: Math.ceil((w - 80) / 22) }, (_, i) => (
        <rect key={i} x={x + 40 + i * 22} y={y + 8} width={11} height={11} fill={i % 2 ? WHITE6 : "#3A2F7A"} />
      ))}
      <path d={para(x + w / 2 - tagW / 2, y + 20, tagW, 38, 14)} fill={ORANGE6} stroke={INK6} strokeWidth={4} strokeLinejoin="round" />
      <Txt x={x + w / 2 + 2} y={y + 48} size={26} fill={INK6} stroke={INK6} sw={0} spacing={4}>{tag}</Txt>
      <g transform={`translate(${x + w * 0.17} ${cy}) scale(${sc(flashOperand)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashOperand)} stroke={INK6} sw={7}>{`${sgnN}${n}`}</Txt>
      </g>
      <Txt x={x + w * 0.34} y={cy - 4} size={58} fill={CYAN6} stroke={INK6} sw={6}>=</Txt>
      <g transform={`translate(${x + w * 0.52} ${cy}) scale(${sc(flashFriend)})`}>
        {rev < 0.02 ? (
          <g transform={`rotate(${Math.sin(t * 8) * 4})`}>
            <Txt x={0} y={0} size={fsz} fill={CYAN6} stroke={INK6} sw={7}>{`${sgnF}?`}</Txt>
          </g>
        ) : (
          <g transform={`scale(${0.5 + 0.5 * rev})`}>
            <Txt x={0} y={0} size={fsz} fill={flashFriend > 0.05 ? LIME6 : ORANGE6} stroke={INK6} sw={7}>{`${sgnF}${friend}`}</Txt>
          </g>
        )}
      </g>
      <g transform={`translate(${x + w * 0.8} ${cy}) scale(${sc(flashTen)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashTen)} stroke={INK6} sw={7}>{ten}</Txt>
      </g>
    </g>
  );
};

/** the perfect-score board: four lime checks and 4/4 on a dark plate */
export const PerfectBoard: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const e = easeOut(Math.min(1, k * 2));
  const w = 760;
  const h = 250;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * e}) rotate(${Math.sin(t * 4) * 1})`} opacity={clamp01(k * 3)}>
      <path d={para(-w / 2, -h / 2, w, h, 50)} fill={INK6} stroke={LIME6} strokeWidth={10} strokeLinejoin="round" />
      <path d={para(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28, 44)} fill="none" stroke={ORANGE6} strokeWidth={4} strokeLinejoin="round" opacity={0.8} />
      <Txt x={0} y={-h / 2 + 76} size={64} fill={LIME6} stroke={INK6} sw={0} spacing={3}>PERFECT SCORE!</Txt>
      {[0, 1, 2, 3].map((i) => {
        const u = clamp01(k * 3 - 0.6 - i * 0.35);
        return (
          <g key={i} transform={`translate(${-290 + i * 100} 40) scale(${0.3 + 0.7 * easeOut(u)})`} opacity={clamp01(u * 3)}>
            <circle r={44} fill={LIME6} stroke={INK6} strokeWidth={6} />
            <path d="M -22 2 L -6 18 L 24 -18" stroke={INK6} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );
      })}
      <Txt x={250} y={66} size={92} fill={WHITE6} stroke={INK6} sw={8}>4/4</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the caption

const BARE = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const NUMS = new Set("zero one two three four five six seven eight nine ten twenty thirty forty fifty sixty seventy eighty ninety seventysix sixtynine seventyseven eighty thirtyfour eightythree seventyeight forty".split(" "));
const KEYS = new Set("friend friends ten ones rod stuck add take away go next left time lightning perfect score clock minute".split(" "));

export const BF6Caption: React.FC<{ phrase: TPhrase; wordIdx: number; top: number; height: number; width: number }> = ({ phrase, wordIdx, top, height, width }) => (
  <div style={{ position: "absolute", left: 0, top, width, height, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
    <div
      style={{
        background: INK6,
        border: `7px solid ${LIME6}`,
        borderRadius: 18,
        padding: "8px 28px 12px",
        textAlign: "center",
        boxShadow: `0 10px 0 ${ORANGE6}`,
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: "inherit" as unknown as number,
        lineHeight: 1.16,
        color: WHITE6,
        maxWidth: "100%",
        transform: "skewX(-6deg)",
      }}
    >
      {phrase.words.map((w, i) => {
        const active = i === wordIdx;
        const coming = i > wordIdx;
        const b = BARE(w.word);
        const special = NUMS.has(b) || KEYS.has(b);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 5px",
              padding: active ? "0 10px" : "0",
              borderRadius: 10,
              background: active ? LIME6 : "transparent",
              color: active ? INK6 : special ? (coming ? "#7E9A2E" : LIME6) : coming ? "#8E86C9" : WHITE6,
              transform: active ? "scale(1.12) rotate(-2deg)" : "none",
            }}
          >
            {w.word}
          </span>
        );
      })}
    </div>
  </div>
);
