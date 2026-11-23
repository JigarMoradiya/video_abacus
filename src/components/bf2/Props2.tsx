// The props of the Big Friend 2 short (closing time at the game hall, the frozen scoreboard).
// A different set from bf1's ticket-counter props: LED score headers, ten-frame bulb pairs, an octagon
// "NO ROOM" stop sign, a referee whistle call, a stopwatch countdown, flip-tile friend bond, a teal
// friend-trick plate, a wall clock, a brass closing bell, a bulb/clock progress strip.
// All pure functions of their inputs; every spoken number gets its own flash input. Bare <g>.

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import type { TPhrase } from "../../lib/timing";
import { Txt, textW, clamp01, easeOut } from "../bf1/Props";

export const INK2 = "#10183A";
export const NAVY = "#14224D";
export const DEEP = "#0C1636";
export const TEAL = "#19C2B8";
export const AQUA = "#7FF3E6";
export const ORANGE = "#FF8A1F";
export const AMBER = "#FFC93C";
export const CORAL = "#FF5A4D";
export const LIME = "#8CF05A";
export const CREAM = "#FFF4DC";

/** a row of chasing bulbs */
const Bulbs: React.FC<{ x: number; y: number; w: number; n: number; t: number; r?: number; on?: string; off?: string; dir?: number }> = ({ x, y, w, n, t, r = 5, on = AMBER, off = "#7A5A1C", dir = 1 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const lit = (Math.floor(t * 6) + i * dir) % 3 === 0;
      return <circle key={i} cx={x + (i + 0.5) * (w / n)} cy={y} r={r} fill={lit ? on : off} opacity={lit ? 1 : 0.7} />;
    })}
  </g>
);

const polar = (r: number, deg: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r] as const;

// ---------------------------------------------------------------- the top banner (story beats)

export const ClosingBanner: React.FC<{ x: number; y: number; w: number; h: number; frame: number; fps: number }> = ({ x, y, w, h, frame, fps }) => {
  const t = frame / fps;
  const size = 62;
  const tw = textW("CLOSING TIME!", size, 3);
  const bw = Math.min(w, tw + 160); // text + even padding + the swallowtail ends
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M 0 0 H ${bw} L ${bw - 34} ${h / 2} L ${bw} ${h} H 0 L 34 ${h / 2} Z`} fill={ORANGE} stroke={INK2} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M 22 12 H ${bw - 22} L ${bw - 52} ${h / 2} L ${bw - 22} ${h - 12} H 22 L 52 ${h / 2} Z`} fill={NAVY} />
      <Bulbs x={60} y={9} w={bw - 120} n={14} t={t} r={4.5} />
      <Bulbs x={60} y={h - 9} w={bw - 120} n={14} t={t} r={4.5} dir={-1} />
      <Txt x={bw / 2} y={h / 2 + 22} size={size} fill={AMBER} stroke={INK2} sw={7} spacing={3}>
        CLOSING TIME!
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the question header (LED score plate)

export const ScoreHeader: React.FC<{
  x: number; y: number; w: number; h: number;
  a: number; b: number; answer: number;
  showAnswer: number; flashA: number; flashB: number;
  stuck: number; appear: number; frame: number; fps: number; alarm: number;
}> = ({ x, y, w, h, a, b, answer, showAnswer, flashA, flashB, stuck, appear, frame, fps, alarm }) => {
  const t = frame / fps;
  const k = easeOut(appear);
  const shake = alarm > 0.05 ? Math.sin(t * 38) * 2.5 * alarm : 0;
  const mid = x + w / 2;
  const base = 112;
  const sA = 1 + 0.3 * flashA;
  const sB = 1 + 0.3 * flashB;
  const ansK = easeOut(showAnswer);
  const hot = (f: number) => (f > 0.05 ? "#FFFFFF" : AMBER);
  return (
    <g transform={`translate(${shake} ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <rect x={x} y={y} width={w} height={h} rx={26} fill={alarm > 0.05 ? CORAL : ORANGE} stroke={INK2} strokeWidth={7} />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx={16} fill={DEEP} />
      <Bulbs x={x + 24} y={y + 6} w={w - 48} n={22} t={t} r={4} />
      <Bulbs x={x + 24} y={y + h - 6} w={w - 48} n={22} t={t} r={4} dir={-1} />
      <g transform={`translate(${mid - 250} ${y + h / 2 + 34})`}>
        <g transform={`scale(${sA})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashA)} stroke={INK2} sw={8}>{a}</Txt>
        </g>
        <Txt x={140} y={0} size={92} fill={AQUA} stroke={INK2} sw={7}>+</Txt>
        <g transform={`translate(262 0) scale(${sB})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashB)} stroke={INK2} sw={8}>{b}</Txt>
        </g>
        <Txt x={372} y={0} size={92} fill={AQUA} stroke={INK2} sw={7}>=</Txt>
        {ansK < 0.02 ? (
          <Txt x={500} y={0} size={base} fill={AQUA} stroke={INK2} sw={8}>?</Txt>
        ) : (
          <g transform={`translate(500 0) scale(${0.4 + 0.75 * ansK})`} style={{ transformOrigin: "0 -34px" }}>
            <Txt x={0} y={0} size={base} fill={LIME} stroke={INK2} sw={8}>{answer}</Txt>
          </g>
        )}
      </g>
      {/* frozen badge: an ice-blue hexagon, plate sized from its text */}
      {stuck > 0.02 && ansK < 0.02 && (() => {
        const size = 54;
        const bw = Math.round(textW("STUCK!", size, 2)) + 96;
        const bh = 84;
        return (
          <g transform={`translate(${x + w - 150} ${y + h - 14}) rotate(${-8 + (1 - easeOut(stuck)) * 16}) scale(${0.4 + 0.36 * easeOut(stuck)})`} opacity={clamp01(stuck * 3)}>
            <path d={`M ${-bw / 2 + 26} ${-bh / 2} H ${bw / 2 - 26} L ${bw / 2} 0 L ${bw / 2 - 26} ${bh / 2} H ${-bw / 2 + 26} L ${-bw / 2} 0 Z`} fill="#BFF3FF" stroke={INK2} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M ${-bw / 2 + 34} ${-bh / 2 + 9} H ${bw / 2 - 34}`} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
            <Txt x={0} y={19} size={size} fill="#1E5FD8" stroke="#FFFFFF" sw={0} spacing={2}>STUCK!</Txt>
          </g>
        );
      })()}
    </g>
  );
};

/** the plain LED text plate that holds the header in the intro */
export const HeaderText: React.FC<{ x: number; y: number; w: number; h: number; text: string; size: number; appear: number; frame: number; fps: number }> = ({ x, y, w, h, text, size, appear, frame, fps }) => {
  const t = frame / fps;
  const k = easeOut(appear);
  return (
    <g transform={`translate(0 ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <rect x={x} y={y} width={w} height={h} rx={26} fill={TEAL} stroke={INK2} strokeWidth={7} />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx={16} fill={DEEP} />
      <Bulbs x={x + 24} y={y + 6} w={w - 48} n={22} t={t} r={4} on={AQUA} off="#1A5C63" />
      <Bulbs x={x + 24} y={y + h - 6} w={w - 48} n={22} t={t} r={4} on={AQUA} off="#1A5C63" dir={-1} />
      <Txt x={x + w / 2} y={y + h / 2 + size * 0.34} size={size} fill={AMBER} stroke={INK2} sw={7} spacing={2}>
        {text}
      </Txt>
    </g>
  );
};

/** the intro header: "6 + 4 = 10" with each number lighting on its own word */
export const PairHeader: React.FC<{ x: number; y: number; w: number; h: number; l: number; r: number; flashL: number; flashR: number; appear: number; frame: number; fps: number }> = ({ x, y, w, h, l, r, flashL, flashR, appear, frame, fps }) => {
  const t = frame / fps;
  const k = easeOut(appear);
  const mid = x + w / 2;
  const base = 112;
  const hot = (f: number) => (f > 0.05 ? "#FFFFFF" : AMBER);
  return (
    <g transform={`translate(0 ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <rect x={x} y={y} width={w} height={h} rx={26} fill={TEAL} stroke={INK2} strokeWidth={7} />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx={16} fill={DEEP} />
      <Bulbs x={x + 24} y={y + 6} w={w - 48} n={22} t={t} r={4} on={AQUA} off="#1A5C63" />
      <Bulbs x={x + 24} y={y + h - 6} w={w - 48} n={22} t={t} r={4} on={AQUA} off="#1A5C63" dir={-1} />
      <g transform={`translate(${mid - 235} ${y + h / 2 + 34})`}>
        <g transform={`scale(${1 + 0.3 * flashL})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashL)} stroke={INK2} sw={8}>{l}</Txt>
        </g>
        <Txt x={118} y={0} size={92} fill={AQUA} stroke={INK2} sw={7}>+</Txt>
        <g transform={`translate(236 0) scale(${1 + 0.3 * flashR})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashR)} stroke={INK2} sw={8}>{r}</Txt>
        </g>
        <Txt x={352} y={0} size={92} fill={AQUA} stroke={INK2} sw={7}>=</Txt>
        <Txt x={470} y={0} size={base} fill={LIME} stroke={INK2} sw={8}>10</Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the ten-frames (the big friends)

export const PAIRS2: [number, number][] = [
  [6, 4],
  [7, 3],
  [8, 2],
  [9, 1],
  [5, 5],
];

/** The five big-friend pairs, each as a TEN-FRAME of bulbs (2 x 5): the first n bulbs amber, the rest teal,
 *  with the two numbers on flip tiles either side. Sizes follow `rowH` so one component fits any panel. */
export const TenFrames: React.FC<{
  x: number; y: number; w: number; rowH: number;
  rows: number[]; flashes: [number, number][]; frame: number; fps: number;
}> = ({ x, y, w, rowH, rows, flashes, frame, fps }) => {
  const tile = Math.min(rowH * 0.62, 92);
  const gap = 10;
  const frameW = w - 2 * tile - 4 * gap;
  const cell = frameW / 5;
  const bulbR = Math.min(cell * 0.38, rowH * 0.2);
  return (
    <g>
      {PAIRS2.map(([l, r], i) => {
        const k = rows[i] ?? 0;
        if (k < 0.01) return null;
        const pop = easeOut(k);
        const ry = y + i * rowH;
        const rh = rowH - 14;
        const cy = ry + rh / 2;
        const fl = flashes[i]?.[0] ?? 0;
        const fr = flashes[i]?.[1] ?? 0;
        const fx = x + gap * 2 + tile;
        return (
          <g key={i} transform={`translate(${(1 - pop) * -80} 0)`} opacity={pop}>
            <rect x={x} y={ry} width={w} height={rh} rx={22} fill={DEEP} stroke={INK2} strokeWidth={5} />
            <rect x={x + 5} y={ry + 5} width={w - 10} height={rh - 10} rx={18} fill="none" stroke={ORANGE} strokeWidth={3} opacity={0.8} />
            <g transform={`translate(${x + gap + tile / 2} ${cy}) scale(${1 + 0.35 * fl})`}>
              <rect x={-tile / 2} y={-tile / 2} width={tile} height={tile} rx={14} fill={fl > 0.05 ? "#FFFFFF" : ORANGE} stroke={INK2} strokeWidth={4} />
              <path d={`M ${-tile / 2} 0 H ${tile / 2}`} stroke={INK2} strokeWidth={3} opacity={0.5} />
              <Txt x={0} y={tile * 0.2} size={tile * 0.72} fill={INK2} stroke={INK2} sw={0}>{l}</Txt>
            </g>
            {Array.from({ length: 10 }, (_, b) => {
              const col = b % 5;
              const row = Math.floor(b / 5);
              const isL = b < l;
              const bx = fx + (col + 0.5) * cell;
              const by = cy + (row - 0.5) * (bulbR * 2.5);
              const glow = 0.85 + 0.15 * Math.sin((frame / fps) * 5 + b);
              return <circle key={b} cx={bx} cy={by} r={bulbR} fill={isL ? AMBER : TEAL} stroke={INK2} strokeWidth={3} opacity={glow} />;
            })}
            <g transform={`translate(${x + w - gap - tile / 2} ${cy}) scale(${1 + 0.35 * fr})`}>
              <rect x={-tile / 2} y={-tile / 2} width={tile} height={tile} rx={14} fill={fr > 0.05 ? "#FFFFFF" : TEAL} stroke={INK2} strokeWidth={4} />
              <path d={`M ${-tile / 2} 0 H ${tile / 2}`} stroke={INK2} strokeWidth={3} opacity={0.5} />
              <Txt x={0} y={tile * 0.2} size={tile * 0.72} fill={INK2} stroke={INK2} sw={0}>{r}</Txt>
            </g>
          </g>
        );
      })}
    </g>
  );
};

/** a small amber tag that tops a panel — plate width follows the text */
export const LedTag: React.FC<{ cx: number; cy: number; text: string; size: number; maxW: number; k: number }> = ({ cx, cy, text, size, maxW, k }) => {
  const pad = 30;
  let sz = size;
  while (textW(text, sz, 1) + pad * 2 > maxW && sz > 20) sz -= 2;
  const w = Math.round(textW(text, sz, 1)) + pad * 2;
  const h = sz + 36;
  const pop = easeOut(k);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * pop})`} opacity={clamp01(k * 2)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={AMBER} stroke={INK2} strokeWidth={6} />
      <Txt x={0} y={sz * 0.34} size={sz} fill={INK2} stroke={INK2} sw={0} spacing={1}>
        {text}
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the wall clock and the bell

/** minute: continuous minutes (55.0 .. 60.0); the hour hand follows */
export const WallClock: React.FC<{ cx: number; cy: number; minute: number; k: number; frame: number; fps: number; glow?: number; r?: number }> = ({ cx, cy, minute, k, frame, fps, glow = 0, r = 150 }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const mDeg = (minute % 60) * 6;
  const hDeg = (5 + minute / 60) * 30;
  const [mx, my] = polar(r * 0.78, mDeg);
  const [hx, hy] = polar(r * 0.5, hDeg);
  const [sx, sy] = polar(r * 0.84, (t * 90) % 360);
  const hh = 5 + Math.floor(minute / 60);
  const mm = Math.floor((minute % 60) + 1e-6);
  const digital = `${hh}:${String(mm).padStart(2, "0")}`;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.45 + 0.55 * pop})`} opacity={pop}>
      {glow > 0.02 && <circle r={r + 30 + 8 * Math.sin(t * 14)} fill={CORAL} opacity={0.35 * glow} />}
      <path d={`M 0 ${-r - 6} V ${-r - 46}`} stroke={INK2} strokeWidth={8} strokeLinecap="round" />
      <circle r={r + 14} fill={ORANGE} stroke={INK2} strokeWidth={8} />
      <circle r={r} fill={CREAM} stroke={INK2} strokeWidth={6} />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const [x1, y1] = polar(r - (big ? 22 : 11), i * 6);
        const [x2, y2] = polar(r - 4, i * 6);
        return <path key={i} d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke={INK2} strokeWidth={big ? 6 : 2.5} strokeLinecap="round" />;
      })}
      {[12, 3, 6, 9].map((n) => {
        const [x, y] = polar(r * 0.64, n * 30);
        return <Txt key={n} x={x} y={y + r * 0.09} size={r * 0.26} fill={INK2} stroke={INK2} sw={0}>{n}</Txt>;
      })}
      <path d={`M 0 0 L ${hx} ${hy}`} stroke={INK2} strokeWidth={r * 0.075} strokeLinecap="round" />
      <path d={`M 0 0 L ${mx} ${my}`} stroke={NAVY} strokeWidth={r * 0.052} strokeLinecap="round" />
      <path d={`M 0 0 L ${sx} ${sy}`} stroke={CORAL} strokeWidth={r * 0.022} strokeLinecap="round" />
      <circle r={r * 0.07} fill={CORAL} stroke={INK2} strokeWidth={4} />
      <g transform={`translate(0 ${r + 66})`}>
        <rect x={-96} y={-34} width={192} height={68} rx={16} fill={DEEP} stroke={INK2} strokeWidth={5} />
        <Txt x={0} y={20} size={52} fill={AMBER} stroke={INK2} sw={0} spacing={2}>{digital}</Txt>
      </g>
    </g>
  );
};

export const ClosingBell: React.FC<{ cx: number; cy: number; scale?: number; swing: number; frame: number; fps: number; ring?: number }> = ({ cx, cy, scale = 1, swing, frame, fps, ring = 0 }) => {
  const t = frame / fps;
  const ang = swing * Math.sin(t * 16) * 16;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {ring > 0.05 &&
        [0, 1, 2].map((i) => {
          const ph = (t * 1.8 + i / 3) % 1;
          return <circle key={i} cy={70} r={90 + ph * 120} fill="none" stroke={AMBER} strokeWidth={10} opacity={(1 - ph) * 0.8 * ring} />;
        })}
      <g transform={`rotate(${ang})`}>
        <rect x={-10} y={-92} width={20} height={34} rx={6} fill={INK2} />
        <path d="M -72 70 Q -72 -20 -50 -50 Q -30 -78 0 -78 Q 30 -78 50 -50 Q 72 -20 72 70 Q 90 76 96 96 H -96 Q -90 76 -72 70 Z" fill={AMBER} stroke={INK2} strokeWidth={8} strokeLinejoin="round" />
        <path d="M -48 -30 Q -52 20 -48 58" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.55} />
        <path d="M -96 96 H 96" stroke={ORANGE} strokeWidth={10} strokeLinecap="round" />
        <circle cx={Math.sin(t * 16) * 14 * swing} cy={110} r={17} fill={ORANGE} stroke={INK2} strokeWidth={6} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the lesson-panel props

/** the "+n" tile trying to hop onto a full ones rod and bonking back */
export const BonkTile: React.FC<{ x0: number; x1: number; cy: number; label: string; start: number; frame: number }> = ({ x0, x1, cy, label, start, frame }) => {
  const cyc = 34;
  const d = frame - start;
  if (d < 0) return null;
  const u = (d % cyc) / cyc;
  const fwd = u < 0.5;
  const x = fwd ? x0 - (x0 - x1) * (u * 2) * (u * 2) : x1 + (x0 - x1) * (1 - Math.pow(1 - (u - 0.5) * 2, 2));
  const hit = u >= 0.5 && u < 0.72;
  const squash = hit ? 1 - (u - 0.5) * 2.2 : 0;
  const tilt = fwd ? 0 : (u - 0.5) * 50;
  const appear = clamp01(d / 8);
  return (
    <g transform={`translate(${x} ${cy}) rotate(${tilt}) scale(${(0.5 + 0.5 * appear) * (1 - 0.2 * squash)} ${(0.5 + 0.5 * appear) * (1 + 0.12 * squash)})`}>
      <rect x={-70} y={-70} width={140} height={140} rx={30} fill={ORANGE} stroke={INK2} strokeWidth={8} />
      <path d="M -70 0 H 70" stroke={INK2} strokeWidth={4} opacity={0.4} />
      <rect x={-52} y={-56} width={104} height={26} rx={13} fill="#FFFFFF" opacity={0.28} />
      <g transform={`rotate(${-tilt})`}>
        <Txt x={0} y={26} size={78} fill="#FFFFFF" stroke={INK2} sw={7}>{label}</Txt>
      </g>
      {hit && (
        <g transform="translate(-92 -70)" opacity={1 - (u - 0.5) * 3}>
          <path d="M 0 0 l 22 -14 l -2 22 l 24 -4 l -18 16 l 18 18 l -26 -6 l 0 20 l -18 -18 l -16 14 l 4 -22 l -22 -4 l 18 -12 Z" fill={AMBER} stroke={INK2} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

/** an octagon stop sign: "NO ROOM / FOR n!" — plate sized from the longest line */
export const NoRoomStop: React.FC<{ cx: number; cy: number; text: string; k: number; frame: number; fps: number }> = ({ cx, cy, text, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const wob = Math.sin(t * 18) * 3;
  const [l1, rest] = text.split(" FOR ");
  const lines = [l1, `FOR ${rest}`];
  const size = 56;
  const pad = 44;
  const w = Math.round(Math.max(...lines.map((ln) => textW(ln, size, 1)))) + pad * 2;
  const h = size * 2.25 + 56;
  const c = Math.min(w, h) * 0.3;
  const pts = [
    [-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2 - c],
    [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c],
  ];
  const d = "M " + pts.map((p) => p.join(" ")).join(" L ") + " Z";
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${wob * 0.4}) scale(${0.5 + 0.5 * pop})`} opacity={pop}>
      <path d={d} fill={CORAL} stroke="#FFFFFF" strokeWidth={9} strokeLinejoin="round" />
      {lines.map((ln, i) => (
        <Txt key={i} x={0} y={i === 0 ? -6 : 56} size={size} fill="#FFFFFF" stroke={INK2} sw={7} spacing={1}>{ln}</Txt>
      ))}
    </g>
  );
};

/** the referee whistle with sound waves, "CALL A FRIEND!" under it */
export const WhistleCall: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const shake = Math.sin(t * 40) * 3 * (k < 0.9 ? 1 : 0.4);
  const size = 40;
  const lw = Math.round(textW("CALL A FRIEND!", size, 1)) + 56;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * pop})`} opacity={pop}>
      {[0, 1, 2].map((i) => {
        const ph = (t * 1.5 + i / 3) % 1;
        return <path key={i} d={`M ${70 + ph * 100} ${-40 - ph * 30} q ${28 + ph * 20} ${40 + ph * 30} 0 ${80 + ph * 60}`} stroke={AQUA} strokeWidth={11} fill="none" strokeLinecap="round" opacity={(1 - ph) * 0.95} />;
      })}
      <g transform={`rotate(${shake}) scale(1.9)`}>
        <path d="M -62 14 q -10 -34 14 -42 h 62 q 24 0 24 28 q 0 28 -28 28 h -26 q -26 0 -46 -14 Z" fill={AMBER} stroke={INK2} strokeWidth={5} strokeLinejoin="round" />
        <rect x={-62} y={-8} width={34} height={14} rx={4} fill="#E0A81C" stroke={INK2} strokeWidth={3} />
        <circle cx={14} cy={-2} r={10} fill={DEEP} stroke={INK2} strokeWidth={3} />
        <path d="M -4 -28 q 2 -14 18 -14" stroke={INK2} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(0 170)">
        <rect x={-lw / 2} y={-34} width={lw} height={68} rx={16} fill={DEEP} stroke={INK2} strokeWidth={6} />
        <Txt x={0} y={14} size={size} fill={AMBER} stroke={INK2} sw={0} spacing={1}>CALL A FRIEND!</Txt>
      </g>
    </g>
  );
};

/** the stopwatch countdown: 3, 2, 1 with a ring that fills every second */
export const Stopwatch: React.FC<{ cx: number; cy: number; n: number; k: number; frame: number; fps: number }> = ({ cx, cy, n, k, frame, fps }) => {
  const pop = 0.35 + 0.65 * easeOut(Math.min(1, k * 2.4)) + 0.1 * Math.max(0, 1 - k * 3);
  const col = n === 3 ? CORAL : n === 2 ? AMBER : LIME;
  const r = 150;
  const [hx, hy] = polar(r * 0.7, clamp01(k) * 360);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pop})`}>
      <rect x={-22} y={-r - 54} width={44} height={34} rx={10} fill={ORANGE} stroke={INK2} strokeWidth={7} />
      <rect x={-12} y={-r - 24} width={24} height={22} fill={INK2} />
      <circle r={r + 14} fill={TEAL} stroke={INK2} strokeWidth={9} />
      <circle r={r - 6} fill={CREAM} stroke={INK2} strokeWidth={5} />
      <circle r={r - 20} fill="none" stroke={col} strokeWidth={18} strokeDasharray={`${clamp01(k) * 2 * Math.PI * (r - 20)} 1000`} transform="rotate(-90)" strokeLinecap="round" />
      <path d={`M 0 0 L ${hx} ${hy}`} stroke={INK2} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      <Txt x={0} y={64} size={190} fill={col} stroke={INK2} sw={11}>{n}</Txt>
    </g>
  );
};

/** the friend bond: two flip tiles (n, friend) that slide together under a "= 10" plate */
export const FriendTiles: React.FC<{ cx: number; cy: number; n: number; friend: number; k: number; flashN: number; flashF: number; friendReveal: number; frame: number; fps: number }> = ({ cx, cy, n, friend, k, flashN, flashF, friendReveal, frame, fps }) => {
  const t = frame / fps;
  const move = easeOut(clamp01(k * 1.6));
  const gap = 96 - 18 * move;
  const sN = 1 + 0.28 * flashN;
  const sF = (1 + 0.28 * flashF) * (0.6 + 0.4 * easeOut(friendReveal));
  const joined = clamp01((k - 0.55) / 0.2);
  const tw = 128;
  const th = 140;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g transform={`translate(${-gap} ${-40 + Math.sin(t * 5) * 3}) scale(${sN})`}>
        <rect x={-tw / 2} y={-th / 2} width={tw} height={th} rx={26} fill={ORANGE} stroke={INK2} strokeWidth={7} />
        <path d={`M ${-tw / 2} 0 H ${tw / 2}`} stroke={INK2} strokeWidth={4} opacity={0.4} />
        <Txt x={0} y={36} size={104} fill="#FFFFFF" stroke={INK2} sw={7}>{n}</Txt>
      </g>
      <g transform={`translate(${gap} ${-40 + Math.sin(t * 5 + 1) * 3}) scale(${sF})`}>
        <rect x={-tw / 2} y={-th / 2} width={tw} height={th} rx={26} fill={TEAL} stroke={INK2} strokeWidth={7} />
        <path d={`M ${-tw / 2} 0 H ${tw / 2}`} stroke={INK2} strokeWidth={4} opacity={0.4} />
        <Txt x={0} y={36} size={104} fill="#FFFFFF" stroke={INK2} sw={7}>{friendReveal > 0.02 ? friend : "?"}</Txt>
      </g>
      <path d={`M ${-gap - tw / 2 + 12} 46 q 0 26 28 26 H ${gap + tw / 2 - 40} q 28 0 28 -26`} stroke={AMBER} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.4 + 0.6 * joined} />
      {joined > 0.05 && (
        <g transform={`translate(0 102) scale(${0.4 + 0.6 * easeOut(joined)})`} opacity={joined}>
          <rect x={-86} y={-34} width={172} height={68} rx={34} fill={DEEP} stroke={INK2} strokeWidth={6} />
          <Txt x={0} y={20} size={56} fill={LIME} stroke={INK2} sw={0} spacing={2}>= 10</Txt>
        </g>
      )}
    </g>
  );
};

/** the friend-trick plate: "+n = −friend +10", numbers flash on their words. Natural height, never stretched. */
export const FormulaPlate: React.FC<{ x: number; y: number; w: number; h: number; n: number; friend: number; appear: number; friendReveal: number; flashOperand: number; flashFriend: number; flashTen: number; frame: number; fps: number }> = ({ x, y, w, h, n, friend, appear, friendReveal, flashOperand, flashFriend, flashTen, frame, fps }) => {
  const k = easeOut(appear);
  const t = frame / fps;
  const hot = (f: number) => (f > 0.05 ? AMBER : "#FFFFFF");
  const sc = (f: number) => 1 + 0.28 * f;
  const fsz = Math.round(Math.min(h * 0.4, w * 0.17));
  const cy = y + 60 + (h - 74) / 2 + fsz * 0.34 - 4;
  const rev = easeOut(friendReveal);
  const c = 26;
  return (
    <g transform={`translate(${(1 - k) * -90} 0) rotate(${(1 - k) * -4} ${x} ${y})`} opacity={Math.min(1, k * 2.4)}>
      <path d={`M ${x + c} ${y} H ${x + w - c} L ${x + w} ${y + c} V ${y + h - c} L ${x + w - c} ${y + h} H ${x + c} L ${x} ${y + h - c} V ${y + c} Z`} fill={TEAL} stroke={INK2} strokeWidth={7} strokeLinejoin="round" />
      <rect x={x + 14} y={y + 60} width={w - 28} height={h - 74} rx={16} fill={DEEP} />
      <Txt x={x + w / 2} y={y + 44} size={36} fill={INK2} stroke={INK2} sw={0} spacing={4}>FRIEND TRICK</Txt>
      <g transform={`translate(${x + w * 0.16} ${cy}) scale(${sc(flashOperand)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashOperand)} stroke={INK2} sw={7}>{`+${n}`}</Txt>
      </g>
      <Txt x={x + w * 0.31} y={cy - 4} size={64} fill={AQUA} stroke={INK2} sw={6}>=</Txt>
      <g transform={`translate(${x + w * 0.47} ${cy}) scale(${sc(flashFriend)})`}>
        {rev < 0.02 ? (
          <g transform={`rotate(${Math.sin(t * 6) * 4})`}>
            <Txt x={0} y={0} size={fsz} fill={AQUA} stroke={INK2} sw={7}>−?</Txt>
          </g>
        ) : (
          <g transform={`scale(${0.5 + 0.5 * rev})`}>
            <Txt x={0} y={0} size={fsz} fill={hot(flashFriend)} stroke={INK2} sw={7}>{`−${friend}`}</Txt>
          </g>
        )}
      </g>
      <g transform={`translate(${x + w * 0.76} ${cy}) scale(${sc(flashTen)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashTen)} stroke={INK2} sw={7}>+10</Txt>
      </g>
    </g>
  );
};

/** flip tiles that spell a short word, each tile flipping in turn: "NEXT!" */
export const FlipWord: React.FC<{ cx: number; cy: number; text: string; k: number; maxW: number }> = ({ cx, cy, text, k, maxW }) => {
  const chars = text.split("");
  const n = chars.length;
  const gap = 8;
  const tile = Math.min(78, (maxW - (n - 1) * gap) / n);
  const total = n * tile + (n - 1) * gap;
  return (
    <g transform={`translate(${cx - total / 2} ${cy})`}>
      {chars.map((ch, i) => {
        if (ch === " ") return null;
        const u = clamp01(k * (n + 2) - i);
        const flip = Math.abs(Math.cos(u * Math.PI));
        const shown = u > 0.5;
        return (
          <g key={i} transform={`translate(${i * (tile + gap) + tile / 2} 0) scale(1 ${u <= 0 ? 0 : u >= 1 ? 1 : Math.max(0.05, flip)})`}>
            <rect x={-tile / 2} y={-tile * 0.65} width={tile} height={tile * 1.3} rx={12} fill={DEEP} stroke={INK2} strokeWidth={5} />
            <path d={`M ${-tile / 2} 0 H ${tile / 2}`} stroke={ORANGE} strokeWidth={3} />
            {shown && <Txt x={0} y={tile * 0.28} size={tile * 0.9} fill={AMBER} stroke={INK2} sw={0}>{ch}</Txt>}
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the progress strip (top row)

export const ProgressStrip: React.FC<{ x: number; y: number; h: number; minute: number; done: number; pulses: number[]; bellRing: number; frame: number; fps: number }> = ({ x, y, h, minute, done, pulses, bellRing, frame, fps }) => {
  const r = h / 2 - 2;
  const cy = y + h / 2;
  const [mx, my] = polar(r * 0.72, (minute % 60) * 6);
  const [hx, hy] = polar(r * 0.45, (5 + minute / 60) * 30);
  return (
    <g>
      <g transform={`translate(${x + r + 4} ${cy})`}>
        <circle r={r} fill={CREAM} stroke={INK2} strokeWidth={4} />
        <path d={`M 0 0 L ${hx} ${hy}`} stroke={INK2} strokeWidth={4} strokeLinecap="round" />
        <path d={`M 0 0 L ${mx} ${my}`} stroke={CORAL} strokeWidth={3} strokeLinecap="round" />
        <circle r={3} fill={INK2} />
      </g>
      {[0, 1, 2, 3].map((i) => {
        const lit = i < done;
        const pop = lit ? 1 + 0.3 * (pulses[i] ?? 0) : 1;
        return (
          <g key={i} transform={`translate(${x + 92 + i * 52} ${cy}) scale(${pop})`}>
            <circle r={19} fill={lit ? AMBER : DEEP} stroke={INK2} strokeWidth={4} />
            {lit && <circle r={9} cx={-5} cy={-5} fill="#FFFFFF" opacity={0.6} />}
            {!lit && <Txt x={0} y={9} size={24} fill={AMBER} stroke={INK2} sw={0}>{i + 1}</Txt>}
          </g>
        );
      })}
      <g transform={`translate(${x + 92 + 4 * 52 + 12} ${cy}) rotate(${Math.sin((frame / fps) * 22) * 14 * bellRing})`}>
        <path d="M -17 12 Q -17 -8 -10 -14 Q -4 -20 0 -20 Q 4 -20 10 -14 Q 17 -8 17 12 H 21 V 19 H -21 V 12 Z" fill={AMBER} stroke={INK2} strokeWidth={4} strokeLinejoin="round" />
        <circle cy={24} r={5} fill={ORANGE} stroke={INK2} strokeWidth={3} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the caption

const BARE = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const NUMS = new Set("zero one two three four five six seven eight nine ten twenty twentysix thirtyfive sixtyfive seventy sixtyseven seventyfive seventynine eightyfive thirty".split(" "));
const KEYS = new Set("friend friends ten ones tens rod stuck room alert bell scoreboard add take away".split(" "));

export const BF2Caption: React.FC<{ phrase: TPhrase; wordIdx: number; top: number; height: number; width: number }> = ({ phrase, wordIdx, top, height, width }) => (
  <div style={{ position: "absolute", left: 0, top, width, height, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
    <div
      style={{
        background: DEEP,
        border: `7px solid ${AMBER}`,
        borderRadius: 30,
        padding: "8px 26px 12px",
        textAlign: "center",
        boxShadow: "0 10px 0 rgba(8,12,34,0.5)",
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: "inherit" as unknown as number,
        lineHeight: 1.16,
        color: "#FFFFFF",
        maxWidth: "100%",
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
              borderRadius: 14,
              background: active ? AMBER : "transparent",
              color: active ? INK2 : special ? (coming ? "#8C7E4A" : AMBER) : coming ? "#6F7BA6" : "#FFFFFF",
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
