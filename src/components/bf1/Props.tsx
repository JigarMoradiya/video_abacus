// The props of the Big Friend 1 short: the sum board, the friend-first formula ticket, the ten-bars
// that introduce the big friends, the countdown, the friend bond, the "no room" sign, the next-ticket
// sign, the ribbon-and-doors finale and the caption. All of them are pure functions of their inputs
// (callers derive every number from the frame), and every number that is SPOKEN gets its own `flash`
// input (0..1) so it can light up exactly on the word.
//
// SVG props are bare <g> — render them inside an <svg>. Caption is HTML.

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import type { TPhrase } from "../../lib/timing";

const INK = "#2A1430";

/** a safe text width: Fredoka bold caps/digits average ~0.62 em; used so every tag's background follows its text */
export const textW = (s: string, size: number, spacing = 0) => s.length * (size * 0.62 + spacing);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
/** a springy overshoot: 0 -> 1.25 -> 1 */
export const popK = (x: number, o = 0.25) => {
  const k = clamp01(x);
  return 1 + o * Math.sin(k * Math.PI) * (1 - k) * 2 - (1 - k) * (1 - k) * (1 - k);
};
/** 0 -> 1 -> 0 flash curve over a word: peaks at the start, decays */
export const flashK = (frame: number, startFrame: number, span = 14) => {
  const d = frame - startFrame;
  if (d < 0 || d > span) return 0;
  return d < 3 ? d / 3 : 1 - (d - 3) / (span - 3);
};

export const Txt: React.FC<{
  x: number;
  y: number;
  size: number;
  fill: string;
  stroke?: string;
  sw?: number;
  anchor?: "start" | "middle" | "end";
  weight?: number;
  children: React.ReactNode;
  spacing?: number;
  opacity?: number;
}> = ({ x, y, size, fill, stroke = INK, sw = 0, anchor = "middle", weight = 700, children, spacing = 0, opacity = 1 }) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={KID_FONT}
    fontWeight={weight}
    fontSize={size}
    fill={fill}
    stroke={sw ? stroke : "none"}
    strokeWidth={sw}
    paintOrder="stroke"
    strokeLinejoin="round"
    letterSpacing={spacing}
    opacity={opacity}
  >
    {children}
  </text>
);

// ---------------------------------------------------------------- the sign at the top

export const GrandSign: React.FC<{ x: number; y: number; w: number; h: number; frame: number; fps: number }> = ({ x, y, w, h, frame, fps }) => {
  const t = frame / fps;
  const n = 18;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={26} fill="#FFE156" stroke={INK} strokeWidth={6} />
      <rect x={10} y={10} width={w - 20} height={h - 20} rx={18} fill="#D91E45" stroke={INK} strokeWidth={4} />
      {Array.from({ length: n }, (_, i) => {
        const u = i / n;
        const on = (Math.floor(t * 7) + i) % 3 === 0;
        const px = 22 + u * (w - 44);
        return (
          <g key={i} opacity={on ? 1 : 0.55}>
            <circle cx={px} cy={9} r={5} fill="#FFFFFF" />
            <circle cx={w - px} cy={h - 9} r={5} fill="#FFFFFF" />
          </g>
        );
      })}
      <Txt x={w / 2} y={h / 2 + 22} size={64} fill="#FFFFFF" stroke={INK} sw={8} spacing={4}>
        GRAND OPENING!
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the sum board

/** A ticket-shaped board: the sum, with every spoken number lighting up on its own word. */
export const SumBoard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  a: number;
  b: number;
  answer: number;
  showAnswer: number; // 0..1 pop-in of the answer
  flashA: number;
  flashB: number;
  stuck: number; // 0..1 the STUCK! stamp
  appear: number; // 0..1 slide/pop in
  frame: number;
  fps: number;
  /** the red alert glow while the problem is live */
  alarm: number;
}> = ({ x, y, w, h, a, b, answer, showAnswer, flashA, flashB, stuck, appear, frame, fps, alarm }) => {
  const t = frame / fps;
  const k = easeOut(appear);
  const shake = alarm > 0.05 ? Math.sin(t * 40) * 3 * alarm : 0;
  const base = 120;
  const mid = x + w / 2;
  const sA = 1 + 0.32 * flashA;
  const sB = 1 + 0.32 * flashB;
  const colA = flashA > 0.05 ? "#FFE156" : "#FFFFFF";
  const colB = flashB > 0.05 ? "#FFE156" : "#FFFFFF";
  const ansK = easeOut(showAnswer);
  return (
    <g transform={`translate(${shake} ${(1 - k) * -220})`} opacity={Math.min(1, k * 2)}>
      <rect x={x} y={y} width={w} height={h} rx={34} fill={alarm > 0.05 ? "#FF4D6D" : "#27C46B"} stroke={INK} strokeWidth={7} />
      <rect x={x + 12} y={y + 12} width={w - 24} height={h - 24} rx={26} fill="#1B1F4B" />
      {/* ticket notches */}
      <circle cx={x} cy={y + h / 2} r={20} fill="#B04DFF" stroke={INK} strokeWidth={6} />
      <circle cx={x + w} cy={y + h / 2} r={20} fill="#B04DFF" stroke={INK} strokeWidth={6} />
      {/* the sum */}
      <g transform={`translate(${mid - 250} ${y + h / 2 + 34})`}>
        <g transform={`translate(0 0) scale(${sA})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={colA} stroke={INK} sw={8}>
            {a}
          </Txt>
        </g>
        <Txt x={140} y={0} size={96} fill="#FFB400" stroke={INK} sw={7}>
          +
        </Txt>
        <g transform={`translate(262 0) scale(${sB})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={colB} stroke={INK} sw={8}>
            {b}
          </Txt>
        </g>
        <Txt x={372} y={0} size={96} fill="#FFB400" stroke={INK} sw={7}>
          =
        </Txt>
        {ansK < 0.02 ? (
          <Txt x={500} y={0} size={base} fill="#7DF9FF" stroke={INK} sw={8}>
            ?
          </Txt>
        ) : (
          <g transform={`translate(500 0) scale(${0.4 + 0.75 * ansK})`} style={{ transformOrigin: "0 -34px" }}>
            <Txt x={0} y={0} size={base} fill="#7DFFB0" stroke={INK} sw={8}>
              {answer}
            </Txt>
          </g>
        )}
      </g>
      {/* STUCK! stamp — its plate is sized from the text (62 px, 2 px tracking) plus 34 px each side */}
      {stuck > 0.02 && ansK < 0.02 && (() => {
        const sw = Math.round(textW("STUCK!", 62, 2)) + 68;
        return (
          <g transform={`translate(${x + w - 140} ${y + h - 16}) rotate(${-10 + (1 - easeOut(stuck)) * 18}) scale(${0.4 + 0.36 * easeOut(stuck)})`} opacity={clamp01(stuck * 3)}>
            <rect x={-sw / 2} y={-46} width={sw} height={88} rx={16} fill="#D91E45" stroke="#FFFFFF" strokeWidth={6} />
            <Txt x={0} y={20} size={62} fill="#FFFFFF" stroke={INK} sw={5} spacing={2}>
              STUCK!
            </Txt>
          </g>
        );
      })()}
    </g>
  );
};

// ---------------------------------------------------------------- the ten-bars (the big friends)

const PAIRS: [number, number][] = [
  [9, 1],
  [8, 2],
  [7, 3],
  [6, 4],
];
const PAIR_COLORS: [string, string][] = [
  ["#FF5A36", "#FFE156"],
  ["#2F7BFF", "#3DE0B5"],
  ["#B04DFF", "#FF9BD2"],
  ["#FF8A00", "#7DF9FF"],
];

/** The four big-friend pairs, each as a bar of ten blocks split into the two friends. Every size follows
 *  `rowH`, so the same component fills a short panel and a tall one. */
export const PairBars: React.FC<{
  x: number;
  y: number;
  w: number;
  rowH: number;
  /** per-row 0..1 pop-in */
  rows: number[];
  /** per-row [leftFlash, rightFlash] */
  flashes: [number, number][];
  frame: number;
  fps: number;
}> = ({ x, y, w, rowH, rows, flashes, frame, fps }) => {
  const blockW = (w - 60) / 10;
  const blockH = Math.min(rowH * 0.4, 86);
  const numSize = Math.min(rowH * 0.38, 78);
  return (
    <g>
      {PAIRS.map(([l, r], i) => {
        const k = rows[i] ?? 0;
        if (k < 0.01) return null;
        const pop = easeOut(k);
        const ry = y + i * rowH;
        const [cL, cR] = PAIR_COLORS[i];
        const fl = flashes[i]?.[0] ?? 0;
        const fr = flashes[i]?.[1] ?? 0;
        const barY = ry + (rowH - 14) * 0.44;
        return (
          <g key={i} transform={`translate(${(1 - pop) * 70} 0)`} opacity={pop}>
            <rect x={x} y={ry} width={w} height={rowH - 14} rx={26} fill="#FFFFFF" stroke={INK} strokeWidth={5} opacity={0.97} />
            {Array.from({ length: 10 }, (_, b) => {
              const isL = b < l;
              const bx = x + 30 + b * blockW;
              const wob = Math.sin((frame / fps) * 4 + b + i) * 1.5;
              return <rect key={b} x={bx + 2} y={barY + wob} width={blockW - 4} height={blockH} rx={10} fill={isL ? cL : cR} stroke={INK} strokeWidth={3} />;
            })}
            <g transform={`translate(${x + 30 + (l * blockW) / 2} ${barY - 12}) scale(${1 + 0.45 * fl})`}>
              <Txt x={0} y={0} size={numSize} fill={fl > 0.05 ? "#FF2D4F" : INK} stroke="#FFFFFF" sw={0}>
                {l}
              </Txt>
            </g>
            <g transform={`translate(${x + 30 + l * blockW + ((10 - l) * blockW) / 2} ${barY - 12}) scale(${1 + 0.45 * fr})`}>
              <Txt x={0} y={0} size={numSize} fill={fr > 0.05 ? "#FF2D4F" : INK} stroke="#FFFFFF" sw={0}>
                {r}
              </Txt>
            </g>
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the countdown

export const CountdownBadge: React.FC<{ cx: number; cy: number; n: number; k: number; frame: number; fps: number }> = ({ cx, cy, n, k, frame, fps }) => {
  const pop = 0.35 + 0.65 * easeOut(Math.min(1, k * 2.4)) + 0.12 * Math.max(0, 1 - k * 3);
  const ring = clamp01(k);
  const col = n === 3 ? "#FF5A36" : n === 2 ? "#FFB400" : "#2FD27A";
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pop})`}>
      <circle r={190} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
      <circle r={190} fill="none" stroke={col} strokeWidth={22} strokeDasharray={`${ring * 1190} 1190`} transform="rotate(-90)" strokeLinecap="round" />
      <circle r={146} fill={col} stroke={INK} strokeWidth={6} />
      <Txt x={0} y={64} size={200} fill="#FFFFFF" stroke={INK} sw={11}>
        {n}
      </Txt>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2 + frame / fps * 0.6;
        return <circle key={i} cx={Math.cos(a) * 222} cy={Math.sin(a) * 222} r={9} fill="#FFE156" stroke={INK} strokeWidth={3} opacity={0.9} />;
      })}
    </g>
  );
};

/** the communicator, ringing, with "CALL A FRIEND!" */
export const CallBubble: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const wiggle = Math.sin(t * 38) * 6 * (k < 0.9 ? 1 : 0.4);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * pop})`} opacity={pop}>
      {[0, 1, 2].map((i) => {
        const ph = (t * 1.6 + i / 3) % 1;
        return <circle key={i} r={120 + ph * 90} fill="none" stroke="#7DF9FF" strokeWidth={10} opacity={(1 - ph) * 0.9} />;
      })}
      <g transform={`rotate(${wiggle})`}>
        <rect x={-92} y={-150} width={184} height={300} rx={40} fill="#2A3180" stroke={INK} strokeWidth={9} />
        <rect x={-70} y={-122} width={140} height={190} rx={22} fill="#7DF9FF" stroke={INK} strokeWidth={5} />
        <circle cx={0} cy={108} r={20} fill="#FF4D6D" stroke={INK} strokeWidth={5} />
        <Txt x={0} y={-22} size={64} fill="#1B1F4B" stroke="#1B1F4B" sw={0}>
          ?
        </Txt>
        <path d="M -40 -70 q 40 -22 80 0" stroke="#1B1F4B" strokeWidth={8} fill="none" strokeLinecap="round" />
      </g>
      <Txt x={0} y={218} size={46} fill="#FFFFFF" stroke={INK} sw={8} spacing={1}>
        CALL A FRIEND!
      </Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the friend bond: n + friend = ten

export const FriendBond: React.FC<{
  cx: number;
  cy: number;
  n: number;
  friend: number;
  k: number; // 0..1 across the whole reveal
  flashN: number;
  flashF: number;
  /** the friend's number stays hidden (a ?) until this is > 0 */
  friendReveal: number;
  frame: number;
  fps: number;
}> = ({ cx, cy, n, friend, k, flashN, flashF, friendReveal, frame, fps }) => {
  const t = frame / fps;
  const move = easeOut(clamp01(k * 1.6));
  const gap = 190 - 78 * move;
  const sN = 1 + 0.3 * flashN;
  const sF = (1 + 0.3 * flashF) * (0.6 + 0.4 * easeOut(friendReveal));
  const joined = clamp01((k - 0.55) / 0.2);
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {/* the two friends */}
      <g transform={`translate(${-gap} ${Math.sin(t * 5) * 4}) scale(${sN})`}>
        <circle r={96} fill="#FF8A00" stroke={INK} strokeWidth={8} />
        <circle cx={-26} cy={-30} r={18} fill="#FFFFFF" opacity={0.35} />
        <Txt x={0} y={42} size={120} fill="#FFFFFF" stroke={INK} sw={8}>
          {n}
        </Txt>
      </g>
      <g transform={`translate(${gap} ${Math.sin(t * 5 + 1) * 4}) scale(${sF})`}>
        <circle r={96} fill="#2563EB" stroke={INK} strokeWidth={8} />
        <circle cx={-26} cy={-30} r={18} fill="#FFFFFF" opacity={0.35} />
        <Txt x={0} y={42} size={120} fill="#FFFFFF" stroke={INK} sw={8}>
          {friendReveal > 0.02 ? friend : "?"}
        </Txt>
      </g>
      {/* the bond */}
      <path d={`M ${-gap + 96} 0 Q 0 ${-24 + joined * 24} ${gap - 96} 0`} stroke="#FFE156" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.4 + 0.6 * joined} />
      {joined > 0.05 && (
        <g transform={`translate(0 -140) scale(${0.4 + 0.45 * easeOut(joined)})`} opacity={joined}>
          <path d="M 0 -64 l 18 40 l 44 4 l -34 30 l 12 44 l -40 -24 l -40 24 l 12 -44 l -34 -30 l 44 -4 Z" fill="#FFE156" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <Txt x={0} y={22} size={64} fill={INK} stroke={INK} sw={0}>
            10
          </Txt>
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- alert + bonk

/** the alarm siren on the "Alert!" line: a big flashing light with rays and ALERT! */
export const AlertSiren: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const flash = 0.5 + 0.5 * Math.sin(t * 16);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * pop})`} opacity={pop}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + t * 3;
        return <path key={i} d={`M ${Math.cos(a) * 130} ${Math.sin(a) * 130} L ${Math.cos(a) * (190 + 40 * flash)} ${Math.sin(a) * (190 + 40 * flash)}`} stroke="#FFE156" strokeWidth={14} strokeLinecap="round" opacity={0.9} />;
      })}
      <circle r={118} fill={flash > 0.5 ? "#FF2D4F" : "#FF6B81"} stroke={INK} strokeWidth={9} />
      <path d="M -62 -22 q 6 -62 62 -66" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
      <rect x={-96} y={80} width={192} height={44} rx={16} fill="#7A1030" stroke={INK} strokeWidth={8} />
      <Txt x={0} y={280} size={78} fill="#FFFFFF" stroke={INK} sw={11} spacing={2}>
        ALERT!
      </Txt>
    </g>
  );
};

/** the "+b" token trying to squeeze onto a full ones rod and bonking back */
export const BonkToken: React.FC<{ x0: number; x1: number; cy: number; label: string; start: number; frame: number }> = ({ x0, x1, cy, label, start, frame }) => {
  const cyc = 34;
  const d = frame - start;
  if (d < 0) return null;
  const u = (d % cyc) / cyc;
  const fwd = u < 0.5;
  const ease = (v: number) => v * v;
  const x = fwd ? x0 - (x0 - x1) * ease(u * 2) : x1 + (x0 - x1) * (1 - Math.pow(1 - (u - 0.5) * 2, 2));
  const hit = u >= 0.5 && u < 0.72;
  const squash = hit ? 1 - (u - 0.5) * 2.2 : 0;
  const spin = fwd ? 0 : (u - 0.5) * 360;
  const appear = clamp01(d / 8);
  return (
    <g transform={`translate(${x} ${cy}) scale(${(0.5 + 0.5 * appear) * (1 - 0.18 * squash)} ${(0.5 + 0.5 * appear) * (1 + 0.1 * squash)}) rotate(${spin})`}>
      <circle r={74} fill="#FF4FA3" stroke={INK} strokeWidth={8} />
      <circle cx={-22} cy={-26} r={14} fill="#FFFFFF" opacity={0.4} />
      <g transform={`rotate(${-spin})`}>
        <Txt x={0} y={26} size={78} fill="#FFFFFF" stroke={INK} sw={7}>
          {label}
        </Txt>
      </g>
      {hit && (
        <g transform={`rotate(${-spin}) translate(-110 -70)`} opacity={1 - (u - 0.5) * 3}>
          <path d="M 0 0 l 22 -14 l -2 22 l 24 -4 l -18 16 l 18 18 l -26 -6 l 0 20 l -18 -18 l -16 14 l 4 -22 l -22 -4 l 18 -12 Z" fill="#FFE156" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- the formula ticket

export const FormulaTicket: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  n: number;
  friend: number;
  appear: number; // 0..1
  friendReveal: number; // 0..1 flips ? -> friend
  flashOperand: number;
  flashFriend: number;
  flashTen: number;
  frame: number;
  fps: number;
}> = ({ x, y, w, h, n, friend, appear, friendReveal, flashOperand, flashFriend, flashTen, frame, fps }) => {
  const k = easeOut(appear);
  const t = frame / fps;
  const hot = (f: number) => (f > 0.05 ? "#FFE156" : "#FFFFFF");
  const sc = (f: number) => 1 + 0.28 * f;
  const fs = Math.round(Math.min(h * 0.39, w * 0.17));
  const cy = y + h / 2 + fs * 0.53;
  const col1 = x + w * 0.16;
  const col2 = x + w * 0.47;
  const col3 = x + w * 0.76;
  const rev = easeOut(friendReveal);
  return (
    <g transform={`translate(${(1 - k) * 90} 0) rotate(${(1 - k) * 4} ${x} ${y})`} opacity={Math.min(1, k * 2.4)}>
      <rect x={x} y={y} width={w} height={h} rx={34} fill="#FFB400" stroke={INK} strokeWidth={7} />
      <rect x={x + 14} y={y + 62} width={w - 28} height={h - 76} rx={24} fill="#1B1F4B" />
      <circle cx={x} cy={y + h * 0.58} r={20} fill="#B04DFF" stroke={INK} strokeWidth={6} />
      <circle cx={x + w} cy={y + h * 0.58} r={20} fill="#B04DFF" stroke={INK} strokeWidth={6} />
      <Txt x={x + w / 2} y={y + 46} size={40} fill={INK} spacing={4}>
        BIG FRIEND TRICK
      </Txt>
      {/* +n */}
      <g transform={`translate(${col1} ${cy}) scale(${sc(flashOperand)})`}>
        <Txt x={0} y={0} size={fs} fill={hot(flashOperand)} stroke={INK} sw={7}>
          {`+${n}`}
        </Txt>
      </g>
      <Txt x={x + w * 0.31} y={cy - 4} size={70} fill="#FFB400" stroke={INK} sw={6}>
        =
      </Txt>
      {/* friend: a "?" chip that flips to -friend */}
      <g transform={`translate(${col2} ${cy}) scale(${sc(flashFriend)})`}>
        {rev < 0.02 ? (
          <g transform={`rotate(${Math.sin(t * 6) * 4})`}>
            <Txt x={0} y={0} size={fs} fill="#7DF9FF" stroke={INK} sw={7}>
              −?
            </Txt>
          </g>
        ) : (
          <g transform={`scale(${0.5 + 0.5 * rev})`}>
            <Txt x={0} y={0} size={fs} fill={hot(flashFriend)} stroke={INK} sw={7}>
              {`−${friend}`}
            </Txt>
          </g>
        )}
      </g>
      {/* + 10 */}
      <g transform={`translate(${col3} ${cy}) scale(${sc(flashTen)})`}>
        <Txt x={0} y={0} size={fs} fill={hot(flashTen)} stroke={INK} sw={7}>
          +10
        </Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- "no room" and "next"

export const NoRoomSign: React.FC<{ x: number; y: number; w?: number; text: string; k: number; frame: number; fps: number; side: "left" | "right" }> = ({ x, y, text, k, frame, fps, side }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const wob = Math.sin(t * 18) * 3;
  const [l1, rest] = text.split(" FOR ");
  const lines = [l1, `FOR ${rest}`]; // two stacked lines keep the sign inside the panel column
  const h = 190;
  const size = 62;
  const tip = 40; // the arrow notch
  const pad = 40; // even padding either side of the text
  const w = Math.round(Math.max(...lines.map((ln) => textW(ln, size, 1)))) + pad * 2 + tip;
  const bodyCx = side === "left" ? tip + (w - tip) / 2 : (w - tip) / 2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${wob * 0.4}) scale(${0.5 + 0.5 * pop})`} opacity={pop} style={{ transformOrigin: `${w / 2}px ${h / 2}px` }}>
      <path
        d={
          side === "left"
            ? `M 0 ${h / 2} L ${tip} ${h / 2 - 34} V 22 q 0 -22 22 -22 H ${w - 22} q 22 0 22 22 V ${h - 22} q 0 22 -22 22 H ${tip + 22} q -22 0 -22 -22 V ${h / 2 + 34} Z`
            : `M ${w} ${h / 2} L ${w - tip} ${h / 2 - 34} V 22 q 0 -22 -22 -22 H 22 q -22 0 -22 22 V ${h - 22} q 0 22 22 22 H ${w - tip - 22} q 22 0 22 -22 V ${h / 2 + 34} Z`
        }
        fill="#D91E45"
        stroke="#FFFFFF"
        strokeWidth={8}
        strokeLinejoin="round"
      />
      {lines.map((ln, i) => (
        <Txt key={i} x={bodyCx} y={h / 2 + (i === 0 ? -8 : 56)} size={size} fill="#FFFFFF" stroke={INK} sw={7} spacing={1}>
          {ln}
        </Txt>
      ))}
    </g>
  );
};

export const NextSign: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number; label: string }> = ({ cx, cy, k, frame, fps, label }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const on = Math.floor(t * 5) % 2 === 0;
  const size = label.length > 6 ? 66 : 92;
  const tw = Math.round(textW(label, size, 2));
  const arrowZone = 70; // an arrow at each end, clear of the text
  const pad = 44;
  const W = tw + pad * 2 + arrowZone * 2;
  const H = 180;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * pop})`} opacity={pop}>
      <rect x={-W / 2 - 18} y={-H / 2} width={W + 36} height={H} rx={36} fill="#1B1F4B" stroke={INK} strokeWidth={8} />
      <rect x={-W / 2} y={-H / 2 + 18} width={W} height={H - 36} rx={26} fill={on ? "#FFE156" : "#FFB400"} stroke={INK} strokeWidth={5} />
      <Txt x={0} y={label.length > 6 ? 22 : 30} size={size} fill={INK} stroke={INK} sw={0} spacing={2}>
        {label}
      </Txt>
      {[-1, 1].map((s) => (
        <path key={s} d={`M ${s * (W / 2 - 74)} -30 l ${s * 26} 30 l ${-s * 26} 30 Z`} fill="#FF2D4F" stroke={INK} strokeWidth={4} opacity={on ? 1 : 0.5} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- the finale: ribbon, scissors, doors

export const GrandDoors: React.FC<{ x: number; y: number; w: number; h: number; open: number; ribbon: number; frame: number; fps: number }> = ({ x, y, w, h, open, ribbon, frame, fps }) => {
  const t = frame / fps;
  const o = easeOut(open);
  const half = w / 2;
  const light = o;
  return (
    <g>
      {/* the bright room behind */}
      <rect x={x} y={y} width={w} height={h} rx={40} fill="#FFF3A8" stroke={INK} strokeWidth={8} />
      {light > 0.05 &&
        Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + t;
          return <path key={i} d={`M ${x + half} ${y + h * 0.55} L ${x + half + Math.cos(a) * w} ${y + h * 0.55 + Math.sin(a) * w} L ${x + half + Math.cos(a + 0.14) * w} ${y + h * 0.55 + Math.sin(a + 0.14) * w} Z`} fill="#FFFFFF" opacity={0.35 * light} />;
        })}
      {/* the two door leaves swinging */}
      {[-1, 1].map((s) => {
        const leafW = half * (1 - 0.82 * o);
        const lx = s === -1 ? x : x + w - leafW;
        return (
          <g key={s}>
            <rect x={lx} y={y} width={leafW} height={h} rx={26} fill="#7A4DD8" stroke={INK} strokeWidth={8} />
            {leafW > 40 && (
              <>
                <rect x={lx + 18} y={y + 24} width={leafW - 36} height={h * 0.38} rx={18} fill="#B04DFF" stroke={INK} strokeWidth={5} />
                <rect x={lx + 18} y={y + h * 0.48} width={leafW - 36} height={h * 0.44} rx={18} fill="#B04DFF" stroke={INK} strokeWidth={5} />
                <circle cx={s === -1 ? lx + leafW - 26 : lx + 26} cy={y + h * 0.52} r={14} fill="#FFE156" stroke={INK} strokeWidth={4} />
              </>
            )}
          </g>
        );
      })}
      {/* the ribbon across the doors: whole until cut, then two halves dropping */}
      {ribbon < 0.02 ? (
        <g>
          <path d={`M ${x - 40} ${y + h * 0.5} h ${w + 80}`} stroke="#FF2D4F" strokeWidth={34} strokeLinecap="round" />
          <path d={`M ${x - 40} ${y + h * 0.5 - 6} h ${w + 80}`} stroke="#FF7A8A" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
          <g transform={`translate(${x + half} ${y + h * 0.5})`}>
            <path d="M 0 0 q -70 -60 -64 8 q 12 28 64 -8 Z M 0 0 q 70 -60 64 8 q -12 28 -64 -8 Z" fill="#FF2D4F" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <circle r={16} fill="#FF2D4F" stroke={INK} strokeWidth={5} />
          </g>
        </g>
      ) : (
        <g>
          {[-1, 1].map((s) => {
            const fall = easeOut(ribbon);
            const y0 = y + h * 0.5;
            const xL = x - 40;
            const xR = x + w + 40;
            const hinge = s === -1 ? xL : xR;
            const tip = s === -1 ? x + half - 8 : x + half + 8;
            return (
              <g key={s} transform={`rotate(${s * -78 * fall} ${hinge} ${y0})`}>
                <path d={`M ${hinge} ${y0} L ${tip} ${y0}`} stroke="#FF2D4F" strokeWidth={34} strokeLinecap="round" />
                <path d={`M ${hinge} ${y0 - 6} L ${tip} ${y0 - 6}`} stroke="#FF7A8A" strokeWidth={8} strokeLinecap="round" opacity={0.6} />
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
};

export const Scissors: React.FC<{ x: number; y: number; k: number; scale?: number }> = ({ x, y, k, scale = 1 }) => {
  const open = 18 - 20 * Math.abs(Math.sin(k * Math.PI * 2.5));
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g transform={`rotate(${open})`}>
        <path d="M 0 0 L 110 -14 L 106 0 Z" fill="#E0E0F0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={-34} cy={22} rx={26} ry={18} fill="none" stroke="#FF2D4F" strokeWidth={10} transform="rotate(30 -34 22)" />
      </g>
      <g transform={`rotate(${-open})`}>
        <path d="M 0 0 L 110 14 L 106 0 Z" fill="#C8C8E0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={-34} cy={-22} rx={26} ry={18} fill="none" stroke="#FF2D4F" strokeWidth={10} transform="rotate(-30 -34 -22)" />
      </g>
      <circle r={8} fill="#7A4DD8" stroke={INK} strokeWidth={3} />
    </g>
  );
};

// ---------------------------------------------------------------- the caption (big, playful)

const BARE = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const NUM = new Set("zero one two three four five six seven eight nine ten thirty twenty-nine thirty-nine forty forty-one sixty-eight seventy seventy-one fifty-seven sixty sixty-one twentynine thirtynine fortyone sixtyeight seventyone fiftyseven sixtyone".split(" "));
const KEY = new Set("friend friends ten ones tens rod carry stuck room alert ticket tickets add take away".split(" "));

export const BFCaption: React.FC<{ phrase: TPhrase; wordIdx: number; top: number; height: number; width: number }> = ({ phrase, wordIdx, top, height, width }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top,
      width,
      height,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        background: "#FFFFFF",
        border: `7px solid ${INK}`,
        borderRadius: 44,
        padding: "8px 26px 12px",
        textAlign: "center",
        boxShadow: "0 10px 0 rgba(42,20,48,0.35)",
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: "inherit" as unknown as number,
        lineHeight: 1.16,
        color: INK,
        maxWidth: "100%",
      }}
    >
      {phrase.words.map((w, i) => {
        const active = i === wordIdx;
        const coming = i > wordIdx;
        const b = BARE(w.word);
        const special = NUM.has(b) || KEY.has(b);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              margin: "0 5px",
              padding: active ? "0 10px" : "0",
              borderRadius: 16,
              background: active ? "#FFE156" : "transparent",
              color: active ? INK : special ? (coming ? "#C95C86" : "#B3123F") : coming ? "#8A769B" : INK,
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

