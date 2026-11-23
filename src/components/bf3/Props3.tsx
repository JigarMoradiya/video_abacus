// The props of the Big Friend 3 short (the prize shop, the almost-empty prize wall, TAKING AWAY).
// Candy-shop shapes, none shared with bf1 or bf2: a price-tag banner, a scalloped header sign, jigsaw
// pieces for the big-friend pairs and the friend bond, a swinging NOT ENOUGH sign, a rotary phone, a
// lollipop countdown, a paper RECEIPT for the friend trick, starburst stickers, a gumball bonk and a
// balloon progress strip. Pure functions of their inputs; every spoken number gets its own flash input.
// Bare <g> (the caption is HTML).

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import type { TPhrase } from "../../lib/timing";
import { Txt, textW, clamp01, easeOut } from "../bf1/Props";

export const INK3 = "#3B1F4E";
export const CORAL = "#FF6F6F";
export const MINT = "#41D8B0";
export const LEMON = "#FFE45C";
export const VIOLET = "#8E6CFF";
export const SKY = "#6FB7FF";
export const ORANGE = "#FF9F43";
export const PINK = "#FF9BD2";
export const PAPER = "#FFFDF4";
export const CHALK = "#1E4E4A";
// deep inks for text on light plates (measured >= 4.5:1 on cream / lemon; the bright candy colours stay for fills)
export const CRIM = "#C2185B";
export const DVIOLET = "#5B3FD0";
export const DGREEN = "#0E7A5A";

const polar = (r: number, deg: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r] as const;

// ---------------------------------------------------------------- the story banner: a price tag

export const PrizeTag: React.FC<{ x: number; y: number; h: number; frame: number; fps: number }> = ({ x, y, h, frame, fps }) => {
  const size = 62;
  const w = Math.round(textW("PRIZE DAY!", size, 3)) + 150;
  const sw = Math.sin((frame / fps) * 2.4) * 1.5;
  return (
    <g transform={`translate(${x} ${y}) rotate(${sw} 0 ${h / 2})`}>
      <path d={`M 0 ${h / 2} L 44 0 H ${w} V ${h} H 44 Z`} fill={LEMON} stroke={INK3} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={34} cy={h / 2} r={9} fill={CHALK} stroke={INK3} strokeWidth={4} />
      <path d={`M 34 ${h / 2} q -30 -10 -34 -34`} stroke={INK3} strokeWidth={0} fill="none" />
      <path d={`M 62 10 H ${w - 14}`} stroke={CORAL} strokeWidth={5} strokeDasharray="4 10" strokeLinecap="round" />
      <path d={`M 62 ${h - 10} H ${w - 14}`} stroke={CORAL} strokeWidth={5} strokeDasharray="4 10" strokeLinecap="round" />
      <Txt x={(w + 44) / 2} y={h / 2 + 22} size={size} fill={INK3} stroke={PAPER} sw={7} spacing={3}>
        PRIZE DAY!
      </Txt>
    </g>
  );
};
export const prizeTagW = () => Math.round(textW("PRIZE DAY!", 62, 3)) + 150;

// ---------------------------------------------------------------- a scalloped sign (headers)

const Scallops: React.FC<{ x: number; y: number; w: number; n: number; r: number; fill: string; down: boolean }> = ({ x, y, w, n, r, fill, down }) => (
  <g>
    {Array.from({ length: n }, (_, i) => (
      <circle key={i} cx={x + (i + 0.5) * (w / n)} cy={y} r={r} fill={fill} stroke={INK3} strokeWidth={5} style={down ? undefined : undefined} />
    ))}
  </g>
);

const SignBase: React.FC<{ x: number; y: number; w: number; h: number; body: string; edge: string; tilt?: number }> = ({ x, y, w, h, body, edge }) => (
  <g>
    <Scallops x={x + 14} y={y + 6} w={w - 28} n={20} r={(w - 28) / 40} fill={edge} down />
    <Scallops x={x + 14} y={y + h - 6} w={w - 28} n={20} r={(w - 28) / 40} fill={edge} down={false} />
    <rect x={x} y={y + 6} width={w} height={h - 12} rx={26} fill={body} stroke={INK3} strokeWidth={7} />
    <rect x={x + 12} y={y + 18} width={w - 24} height={h - 36} rx={18} fill="none" stroke={edge} strokeWidth={4} strokeDasharray="3 12" strokeLinecap="round" />
  </g>
);

export const SumSign: React.FC<{
  x: number; y: number; w: number; h: number;
  a: number; b: number; answer: number;
  showAnswer: number; flashA: number; flashB: number;
  stuck: number; appear: number; frame: number; fps: number; alarm: number;
}> = ({ x, y, w, h, a, b, answer, showAnswer, flashA, flashB, stuck, appear, frame, fps, alarm }) => {
  const t = frame / fps;
  const k = easeOut(appear);
  const shake = alarm > 0.05 ? Math.sin(t * 40) * 2.6 * alarm : 0;
  const mid = x + w / 2;
  const base = 112;
  const ansK = easeOut(showAnswer);
  const hot = (f: number) => (f > 0.05 ? CRIM : INK3);
  return (
    <g transform={`translate(${shake} ${(1 - k) * -200}) rotate(${(1 - k) * -3} ${mid} ${y})`} opacity={Math.min(1, k * 2)}>
      <SignBase x={x} y={y} w={w} h={h} body={alarm > 0.05 ? "#FFD3D0" : LEMON} edge={alarm > 0.05 ? CORAL : MINT} />
      <g transform={`translate(${mid - 250} ${y + h / 2 + 34})`}>
        <g transform={`scale(${1 + 0.3 * flashA})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashA)} stroke={PAPER} sw={9}>{a}</Txt>
        </g>
        <Txt x={140} y={0} size={96} fill={DVIOLET} stroke={PAPER} sw={8}>−</Txt>
        <g transform={`translate(262 0) scale(${1 + 0.3 * flashB})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashB)} stroke={PAPER} sw={9}>{b}</Txt>
        </g>
        <Txt x={372} y={0} size={96} fill={DVIOLET} stroke={PAPER} sw={8}>=</Txt>
        {ansK < 0.02 ? (
          <Txt x={500} y={0} size={base} fill={DVIOLET} stroke={PAPER} sw={9}>?</Txt>
        ) : (
          <g transform={`translate(500 0) scale(${0.4 + 0.75 * ansK})`} style={{ transformOrigin: "0 -34px" }}>
            <Txt x={0} y={0} size={base} fill={DGREEN} stroke={PAPER} sw={9}>{answer}</Txt>
          </g>
        )}
      </g>
      {/* the padlock tag: a coral tag on a string, plate sized from its text */}
      {stuck > 0.02 && ansK < 0.02 && (() => {
        const size = 56;
        const bw = Math.round(textW("STUCK!", size, 2)) + 124;
        const bh = 84;
        return (
          <g transform={`translate(${x + w - 150} ${y + h - 10}) rotate(${-7 + (1 - easeOut(stuck)) * 16}) scale(${0.4 + 0.36 * easeOut(stuck)})`} opacity={clamp01(stuck * 3)}>
            <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={22} fill={CORAL} stroke={PAPER} strokeWidth={6} />
            <g transform={`translate(${-bw / 2 + 36} 0)`}>
              <path d="M -11 -4 v -12 a 11 11 0 0 1 22 0 v 12" stroke={PAPER} strokeWidth={6} fill="none" />
              <rect x={-17} y={-6} width={34} height={26} rx={6} fill={LEMON} stroke={PAPER} strokeWidth={4} />
              <circle cy={8} r={4} fill={INK3} />
            </g>
            <Txt x={28} y={20} size={size} fill="#FFFFFF" stroke={INK3} sw={8} spacing={2}>STUCK!</Txt>
          </g>
        );
      })()}
    </g>
  );
};

export const TextSign: React.FC<{ x: number; y: number; w: number; h: number; text: string; size: number; appear: number; frame: number; fps: number }> = ({ x, y, w, h, text, size, appear }) => {
  const k = easeOut(appear);
  return (
    <g transform={`translate(0 ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <SignBase x={x} y={y} w={w} h={h} body={MINT} edge={LEMON} />
      <Txt x={x + w / 2} y={y + h / 2 + size * 0.34} size={size} fill="#FFFFFF" stroke={INK3} sw={9} spacing={2}>{text}</Txt>
    </g>
  );
};

export const PairSign: React.FC<{ x: number; y: number; w: number; h: number; l: number; r: number; flashL: number; flashR: number; appear: number }> = ({ x, y, w, h, l, r, flashL, flashR, appear }) => {
  const k = easeOut(appear);
  const mid = x + w / 2;
  const base = 112;
  const hot = (f: number) => (f > 0.05 ? CRIM : INK3);
  return (
    <g transform={`translate(0 ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <SignBase x={x} y={y} w={w} h={h} body={LEMON} edge={MINT} />
      <g transform={`translate(${mid - 235} ${y + h / 2 + 34})`}>
        <g transform={`scale(${1 + 0.3 * flashL})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashL)} stroke={PAPER} sw={9}>{l}</Txt>
        </g>
        <Txt x={118} y={0} size={92} fill={DVIOLET} stroke={PAPER} sw={8}>+</Txt>
        <g transform={`translate(236 0) scale(${1 + 0.3 * flashR})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashR)} stroke={PAPER} sw={9}>{r}</Txt>
        </g>
        <Txt x={352} y={0} size={92} fill={DVIOLET} stroke={PAPER} sw={8}>=</Txt>
        <Txt x={470} y={0} size={base} fill={DGREEN} stroke={PAPER} sw={9}>10</Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- jigsaw pieces: the big-friend pairs

/** two jigsaw pieces that slide together: the left has a round tab, the right a socket. */
export const JigsawPair: React.FC<{
  cx: number; cy: number; pw: number; ph: number; l: number; r: number;
  cL: string; cR: string; join: number; flashL: number; flashR: number; bg: string; star?: number; frame: number; fps: number;
}> = ({ cx, cy, pw, ph, l, r, cL, cR, join, flashL, flashR, bg, star = 0, frame, fps }) => {
  const j = easeOut(join);
  const gap = 46 * (1 - j);
  const tabR = ph * 0.17;
  const lx = cx - pw - gap / 2 + 0; // right edge of the left piece = cx - gap/2
  const leftRight = cx - gap / 2;
  const rightLeft = cx + gap / 2;
  const top = cy - ph / 2;
  const bob = Math.sin((frame / fps) * 4) * 2;
  return (
    <g transform={`translate(0 ${bob})`}>
      {/* right piece with the socket */}
      <g>
        <rect x={rightLeft} y={top} width={pw} height={ph} rx={ph * 0.2} fill={cR} stroke={INK3} strokeWidth={6} />
        <circle cx={rightLeft} cy={cy} r={tabR + 3} fill={bg} stroke={INK3} strokeWidth={5} />
        <rect x={rightLeft - tabR - 6} y={cy - tabR - 6} width={tabR + 6} height={2 * tabR + 12} fill={bg} />
        <path d={`M ${rightLeft} ${cy - tabR - 3} V ${cy + tabR + 3}`} stroke={bg} strokeWidth={8} />
        <g transform={`translate(${rightLeft + pw / 2 + tabR * 0.4} ${cy + ph * 0.18}) scale(${1 + 0.35 * flashR})`}>
          <Txt x={0} y={0} size={ph * 0.62} fill="#FFFFFF" stroke={INK3} sw={7}>{r}</Txt>
        </g>
      </g>
      {/* left piece with the tab */}
      <g>
        <circle cx={leftRight + tabR * 0.2} cy={cy} r={tabR} fill={cL} stroke={INK3} strokeWidth={5} />
        <rect x={leftRight - pw} y={top} width={pw} height={ph} rx={ph * 0.2} fill={cL} stroke={INK3} strokeWidth={6} />
        <rect x={leftRight - 8} y={cy - tabR * 0.7} width={12} height={tabR * 1.4} fill={cL} />
        <g transform={`translate(${leftRight - pw / 2 - tabR * 0.4} ${cy + ph * 0.18}) scale(${1 + 0.35 * flashL})`}>
          <Txt x={0} y={0} size={ph * 0.62} fill="#FFFFFF" stroke={INK3} sw={7}>{l}</Txt>
        </g>
      </g>
      <rect x={leftRight - pw + 10} y={top + 10} width={pw * 0.5} height={ph * 0.14} rx={ph * 0.07} fill="#FFFFFF" opacity={0.3} />
      {star > 0.02 && (
        <g transform={`translate(${cx} ${top - 4}) scale(${0.4 + 0.6 * easeOut(star)})`} opacity={star}>
          <path d="M 0 -34 l 10 22 l 24 3 l -18 16 l 5 24 l -21 -12 l -21 12 l 5 -24 l -18 -16 l 24 -3 Z" fill={LEMON} stroke={INK3} strokeWidth={5} strokeLinejoin="round" transform="scale(1.15)" />
          <Txt x={0} y={14} size={32} fill={INK3} stroke={INK3} sw={0}>10</Txt>
        </g>
      )}
    </g>
  );
};

export const PAIRS3: [number, number][] = [
  [1, 9],
  [2, 8],
  [3, 7],
  [4, 6],
  [5, 5],
];
const PAIR_COLS: [string, string][] = [
  [CORAL, MINT],
  [VIOLET, ORANGE],
  [SKY, PINK],
  [ORANGE, VIOLET],
  [MINT, CORAL],
];

export const JigsawRows: React.FC<{
  x: number; y: number; w: number; rowH: number;
  rows: number[]; joins: number[]; flashes: [number, number][]; frame: number; fps: number;
}> = ({ x, y, w, rowH, rows, joins, flashes, frame, fps }) => {
  const ph = Math.min(rowH - 34, 150);
  const pw = (w - 40) / 2 - 8;
  return (
    <g>
      {PAIRS3.map(([l, r], i) => {
        const k = rows[i] ?? 0;
        if (k < 0.01) return null;
        const pop = easeOut(k);
        const cy = y + i * rowH + rowH / 2;
        return (
          <g key={i} transform={`translate(${(1 - pop) * 90} 0)`} opacity={pop}>
            <JigsawPair
              cx={x + w / 2}
              cy={cy}
              pw={pw}
              ph={ph}
              l={l}
              r={r}
              cL={PAIR_COLS[i][0]}
              cR={PAIR_COLS[i][1]}
              join={joins[i] ?? 0}
              flashL={flashes[i]?.[0] ?? 0}
              flashR={flashes[i]?.[1] ?? 0}
              bg={CHALK}
              star={clamp01(((joins[i] ?? 0) - 0.7) / 0.3)}
              frame={frame}
              fps={fps}
            />
          </g>
        );
      })}
    </g>
  );
};

/** a small cream tag that tops a panel — plate width follows the text */
export const CreamTag: React.FC<{ cx: number; cy: number; text: string; size: number; maxW: number; k: number }> = ({ cx, cy, text, size, maxW, k }) => {
  const pad = 30;
  let sz = size;
  while (textW(text, sz, 1) + pad * 2 > maxW && sz > 20) sz -= 2;
  const w = Math.round(textW(text, sz, 1)) + pad * 2;
  const h = sz + 36;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * easeOut(k)})`} opacity={clamp01(k * 2)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={PAPER} stroke={INK3} strokeWidth={6} />
      <Txt x={0} y={sz * 0.34} size={sz} fill={CRIM} stroke={INK3} sw={0} spacing={1}>{text}</Txt>
    </g>
  );
};

/** the friend bond: two big jigsaw pieces (n, friend) that snap together into ten */
export const FriendJigsaw: React.FC<{ cx: number; cy: number; n: number; friend: number; k: number; flashN: number; flashF: number; friendReveal: number; frame: number; fps: number }> = ({ cx, cy, n, friend, k, flashN, flashF, friendReveal, frame, fps }) => {
  const join = clamp01((k - 0.45) / 0.35);
  const pw = 150;
  const ph = 150;
  return (
    <g>
      <JigsawPair
        cx={cx}
        cy={cy}
        pw={pw}
        ph={ph}
        l={n}
        r={friendReveal > 0.02 ? friend : (("?" as unknown) as number)}
        cL={CORAL}
        cR={MINT}
        join={join}
        flashL={flashN}
        flashR={flashF}
        bg={CHALK}
        star={clamp01((k - 0.8) / 0.2)}
        frame={frame}
        fps={fps}
      />
    </g>
  );
};

// ---------------------------------------------------------------- the lesson-panel props

/** a gumball "−n" that rolls at the full ones rod and bounces off */
export const GumballBonk: React.FC<{ x0: number; x1: number; cy: number; label: string; start: number; frame: number }> = ({ x0, x1, cy, label, start, frame }) => {
  const cyc = 36;
  const d = frame - start;
  if (d < 0) return null;
  const u = (d % cyc) / cyc;
  const fwd = u < 0.5;
  const x = fwd ? x0 - (x0 - x1) * (u * 2) * (u * 2) : x1 + (x0 - x1) * (1 - Math.pow(1 - (u - 0.5) * 2, 2));
  const hit = u >= 0.5 && u < 0.72;
  const squash = hit ? 1 - (u - 0.5) * 2.2 : 0;
  const spin = fwd ? u * 360 : 180 + (u - 0.5) * 360;
  const appear = clamp01(d / 8);
  return (
    <g transform={`translate(${x} ${cy}) scale(${(0.5 + 0.5 * appear) * (1 + 0.16 * squash)} ${(0.5 + 0.5 * appear) * (1 - 0.18 * squash)})`}>
      <circle r={76} fill={PINK} stroke={INK3} strokeWidth={8} />
      <path d="M -50 -20 a 54 54 0 0 1 60 -38" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.65} />
      <path d={`M 0 0 m -30 0 a 30 30 0 1 1 30 30`} stroke={CORAL} strokeWidth={0} fill="none" transform={`rotate(${spin})`} />
      <Txt x={0} y={26} size={78} fill="#FFFFFF" stroke={INK3} sw={8}>{label}</Txt>
      {hit && (
        <g transform="translate(86 -64)" opacity={1 - (u - 0.5) * 3}>
          <path d="M 0 0 l -22 -14 l 2 22 l -24 -4 l 18 16 l -18 18 l 26 -6 l 0 20 l 18 -18 l 16 14 l -4 -22 l 22 -4 l -18 -12 Z" fill={LEMON} stroke={INK3} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

/** a swinging hanging sign: "NOT ENOUGH / TO TAKE n!" — plate sized from the longest line */
export const HangingSign: React.FC<{ cx: number; cy: number; text: string; k: number; frame: number; fps: number }> = ({ cx, cy, text, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const swing = Math.sin(t * 7) * 5 * (1 - 0.5 * clamp01(k));
  const lines = ["NOT ENOUGH", text];
  const size = 54;
  const pad = 40;
  const w = Math.round(Math.max(...lines.map((ln) => textW(ln, size, 1)))) + pad * 2;
  const h = size * 2.2 + 50;
  return (
    <g transform={`translate(${cx} ${cy - h / 2 - 70}) scale(${0.5 + 0.5 * pop})`} opacity={pop}>
      <g transform={`rotate(${swing})`}>
        <path d={`M ${-w / 2 + 30} 70 L -10 -34 M ${w / 2 - 30} 70 L 10 -34`} stroke={INK3} strokeWidth={6} />
        <circle cx={0} cy={-38} r={12} fill={LEMON} stroke={INK3} strokeWidth={5} />
        <rect x={-w / 2} y={70} width={w} height={h} rx={24} fill={CORAL} stroke={PAPER} strokeWidth={8} />
        <rect x={-w / 2 + 10} y={80} width={w - 20} height={h - 20} rx={16} fill="none" stroke={PAPER} strokeWidth={3} strokeDasharray="3 10" strokeLinecap="round" />
        {lines.map((ln, i) => (
          <Txt key={i} x={0} y={70 + (i === 0 ? size + 18 : size * 2 + 22)} size={size} fill="#FFFFFF" stroke={INK3} sw={7} spacing={1}>{ln}</Txt>
        ))}
        <circle cx={-w / 2 + 30} cy={70} r={7} fill={LEMON} stroke={INK3} strokeWidth={3} />
        <circle cx={w / 2 - 30} cy={70} r={7} fill={LEMON} stroke={INK3} strokeWidth={3} />
      </g>
    </g>
  );
};
export const hangingSignH = () => 54 * 2.2 + 50 + 70 + 70;

/** an old rotary phone handset ringing, "CALL A FRIEND!" under it */
export const PhoneCall: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const wig = Math.sin(t * 36) * 5 * (k < 0.9 ? 1 : 0.4);
  const size = 44;
  const lw = Math.round(textW("CALL A FRIEND!", size, 1)) + 56;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * pop})`} opacity={pop}>
      {[0, 1, 2].map((i) => {
        const ph = (t * 1.5 + i / 3) % 1;
        return <circle key={i} r={110 + ph * 100} fill="none" stroke="#FFFFFF" strokeWidth={9} strokeDasharray="14 14" opacity={(1 - ph) * 0.85} />;
      })}
      <g transform={`rotate(${wig})`}>
        {/* the base with a dial */}
        <rect x={-110} y={30} width={220} height={96} rx={30} fill={VIOLET} stroke={INK3} strokeWidth={8} />
        <circle cx={0} cy={78} r={34} fill={PAPER} stroke={INK3} strokeWidth={5} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const [dx, dy] = polar(22, i * 60);
          return <circle key={i} cx={dx} cy={78 + dy} r={5} fill={INK3} />;
        })}
        {/* the handset */}
        <path d="M -112 22 q -4 -50 28 -54 h 168 q 32 4 28 54 q -2 18 -20 12 q -12 -4 -8 -22 h -168 q 4 18 -8 22 q -18 6 -20 -12 Z" fill={CORAL} stroke={INK3} strokeWidth={7} strokeLinejoin="round" transform="translate(0 -10)" />
        <path d="M -70 -42 H 70" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.5} />
      </g>
      <g transform="translate(0 190)">
        <rect x={-lw / 2} y={-34} width={lw} height={68} rx={34} fill={PAPER} stroke={INK3} strokeWidth={6} />
        <Txt x={0} y={15} size={size} fill={CRIM} stroke={INK3} sw={0} spacing={1}>CALL A FRIEND!</Txt>
      </g>
    </g>
  );
};

/** the lollipop countdown: a big swirl with 3, 2, 1 */
export const LollipopCount: React.FC<{ cx: number; cy: number; n: number; k: number; frame: number; fps: number }> = ({ cx, cy, n, k, frame, fps }) => {
  const pop = 0.35 + 0.65 * easeOut(Math.min(1, k * 2.4)) + 0.1 * Math.max(0, 1 - k * 3);
  const col = n === 3 ? CORAL : n === 2 ? ORANGE : MINT;
  const r = 138;
  const spin = (frame / fps) * 60;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pop})`}>
      <rect x={-12} y={r - 10} width={24} height={150} rx={10} fill={PAPER} stroke={INK3} strokeWidth={7} />
      <circle r={r + 12} fill={PAPER} stroke={INK3} strokeWidth={9} />
      <g transform={`rotate(${spin})`}>
        <circle r={r - 8} fill={col} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a0 = (i / 6) * Math.PI * 2;
          const a1 = a0 + Math.PI / 6;
          const R = r - 8;
          return <path key={i} d={`M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill="#FFFFFF" opacity={0.55} />;
        })}
      </g>
      <circle r={r - 8} fill="none" stroke={INK3} strokeWidth={5} />
      <circle r={r - 14} fill="none" stroke="#FFFFFF" strokeWidth={14} strokeDasharray={`${clamp01(k) * 2 * Math.PI * (r - 14)} 1000`} transform="rotate(-90)" strokeLinecap="round" />
      <circle r={72} fill={PAPER} stroke={INK3} strokeWidth={6} />
      <Txt x={0} y={52} size={156} fill={col} stroke={INK3} sw={9}>{n}</Txt>
    </g>
  );
};

/** the friend trick on a paper RECEIPT: "−n = +friend −10", zigzag edges, natural height */
export const Receipt: React.FC<{ x: number; y: number; w: number; h: number; n: number; friend: number; appear: number; friendReveal: number; flashOperand: number; flashFriend: number; flashTen: number; frame: number; fps: number }> = ({ x, y, w, h, n, friend, appear, friendReveal, flashOperand, flashFriend, flashTen, frame, fps }) => {
  const k = easeOut(appear);
  const t = frame / fps;
  const hot = (f: number) => (f > 0.05 ? CRIM : INK3);
  const sc = (f: number) => 1 + 0.28 * f;
  const fsz = Math.round(Math.min((h - 76) * 0.66, w * 0.17));
  const teeth = 14;
  const tw = w / teeth;
  let d = `M ${x} ${y + 8}`;
  for (let i = 0; i < teeth; i++) d += ` l ${tw / 2} ${-8} l ${tw / 2} 8`;
  d += ` V ${y + h - 8}`;
  for (let i = 0; i < teeth; i++) d += ` l ${-tw / 2} 8 l ${-tw / 2} -8`;
  d += " Z";
  const cy = y + 66 + (h - 66 - 20) / 2 + fsz * 0.34;
  const rev = easeOut(friendReveal);
  return (
    <g transform={`translate(${(1 - k) * 90} 0) rotate(${(1 - k) * 4} ${x} ${y})`} opacity={Math.min(1, k * 2.4)}>
      <path d={d} fill={PAPER} stroke={INK3} strokeWidth={6} strokeLinejoin="round" />
      <rect x={x + 12} y={y + 14} width={w - 24} height={42} rx={21} fill={INK3} />
      <Txt x={x + w / 2} y={y + 46} size={32} fill={LEMON} stroke={INK3} sw={0} spacing={4}>FRIEND TRICK</Txt>
      <path d={`M ${x + 20} ${y + 62} H ${x + w - 20}`} stroke={INK3} strokeWidth={3} strokeDasharray="4 8" opacity={0.45} />
      <g transform={`translate(${x + w * 0.17} ${cy}) scale(${sc(flashOperand)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashOperand)} stroke={PAPER} sw={7}>{`−${n}`}</Txt>
      </g>
      <Txt x={x + w * 0.34} y={cy - 4} size={60} fill={DVIOLET} stroke={PAPER} sw={6}>=</Txt>
      <g transform={`translate(${x + w * 0.52} ${cy}) scale(${sc(flashFriend)})`}>
        {rev < 0.02 ? (
          <g transform={`rotate(${Math.sin(t * 6) * 4})`}>
            <Txt x={0} y={0} size={fsz} fill={DVIOLET} stroke={PAPER} sw={7}>+?</Txt>
          </g>
        ) : (
          <g transform={`scale(${0.5 + 0.5 * rev})`}>
            <Txt x={0} y={0} size={fsz} fill={hot(flashFriend)} stroke={PAPER} sw={7}>{`+${friend}`}</Txt>
          </g>
        )}
      </g>
      <g transform={`translate(${x + w * 0.8} ${cy}) scale(${sc(flashTen)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashTen)} stroke={PAPER} sw={7}>−10</Txt>
      </g>
    </g>
  );
};

/** a spiky starburst sticker with text (ALERT!, GOOD!, LAST ONE!) — plate sized from its text */
export const Sticker: React.FC<{ cx: number; cy: number; text: string; size: number; k: number; frame: number; fps: number; fill?: string; ink?: string; outline?: string; spin?: boolean }> = ({ cx, cy, text, size, k, frame, fps, fill = LEMON, ink = INK3, outline = PAPER, spin = true }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const R = Math.round(textW(text, size, 1) / 2) + 56;
  const n = 18;
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rr = i % 2 === 0 ? R * 1.18 : R * 0.98;
    return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
  }).join(" ");
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.4 + 0.6 * pop}) rotate(${spin ? Math.sin(t * 5) * 4 : 0})`} opacity={pop}>
      <polygon points={pts} fill={fill} stroke={INK3} strokeWidth={8} strokeLinejoin="round" />
      <Txt x={2} y={size * 0.34 + 4} size={size} fill={INK3} stroke={INK3} sw={0} spacing={1} opacity={0.22}>{text}</Txt>
      <Txt x={0} y={size * 0.34} size={size} fill={ink} stroke={outline} sw={8} spacing={1}>{text}</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the progress strip: balloons

const BAL = [CORAL, LEMON, MINT, VIOLET];
export const BalloonStrip: React.FC<{ x: number; y: number; h: number; done: number; pulses: number[]; giftShake: number; frame: number; fps: number }> = ({ x, y, h, done, pulses, giftShake, frame, fps }) => {
  const t = frame / fps;
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const lit = i < done;
        const pop = lit ? 1 + 0.3 * (pulses[i] ?? 0) : 1;
        const bob = lit ? Math.sin(t * 2.2 + i) * 2.5 : 0;
        return (
          <g key={i} transform={`translate(${x + 26 + i * 60} ${y + h / 2 - 4 + bob}) scale(${pop})`}>
            <path d="M 0 18 q -6 12 0 24" stroke={INK3} strokeWidth={3} fill="none" opacity={0.7} />
            <ellipse rx={19} ry={22} fill={lit ? BAL[i] : "#D6E8E4"} stroke={INK3} strokeWidth={4} />
            {lit && <ellipse cx={-6} cy={-8} rx={5} ry={7} fill="#FFFFFF" opacity={0.6} />}
            {!lit && <Txt x={0} y={10} size={26} fill={INK3} stroke={INK3} sw={0}>{i + 1}</Txt>}
          </g>
        );
      })}
      <g transform={`translate(${x + 26 + 4 * 60 + 18} ${y + h / 2 + 4}) rotate(${Math.sin(t * 20) * 10 * giftShake})`}>
        <rect x={-19} y={-14} width={38} height={30} rx={5} fill={VIOLET} stroke={INK3} strokeWidth={4} />
        <rect x={-4} y={-14} width={8} height={30} fill={LEMON} />
        <path d="M 0 -14 q -14 -14 -16 -2 q 8 6 16 2 q 8 4 16 -2 q -2 -12 -16 2 Z" fill={CORAL} stroke={INK3} strokeWidth={3} strokeLinejoin="round" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- finale: a coin shower

export const CoinRain: React.FC<{ start: number; frame: number; fps: number }> = ({ start, frame, fps }) => {
  const d = frame - start;
  if (d < 0 || d > 150) return null;
  return (
    <g>
      {Array.from({ length: 34 }, (_, i) => {
        const x = 70 + ((i * 197) % 940);
        const delay = (i % 9) * 4;
        const u = (d - delay) / fps;
        if (u < 0) return null;
        const y = -60 + u * (520 + (i % 5) * 70);
        if (y > 1700) return null;
        const flip = Math.abs(Math.cos(u * 8 + i));
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${flip} 1)`}>
            <circle r={22} fill={LEMON} stroke={INK3} strokeWidth={4} />
            <circle r={13} fill="none" stroke="#E0A81C" strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the caption

const BARE = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const NUMS = new Set("zero one two three four five six seven eight nine ten sixty fifty eighty seventy ninety eightyfive seventynine fiftynine ninetysix eightyeight seventytwo sixtynine".split(" "));
const KEYS = new Set("friend friends ten ones tens rod stuck enough take away add prize wall alert".split(" "));

export const BF3Caption: React.FC<{ phrase: TPhrase; wordIdx: number; top: number; height: number; width: number }> = ({ phrase, wordIdx, top, height, width }) => (
  <div style={{ position: "absolute", left: 0, top, width, height, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
    <div
      style={{
        background: PAPER,
        border: `7px solid ${INK3}`,
        borderRadius: 60,
        padding: "8px 30px 12px",
        textAlign: "center",
        boxShadow: `0 10px 0 ${CORAL}`,
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: "inherit" as unknown as number,
        lineHeight: 1.16,
        color: INK3,
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
              borderRadius: 20,
              background: active ? LEMON : "transparent",
              color: active ? INK3 : special ? (coming ? "#C95C86" : CRIM) : coming ? "#8A769B" : INK3,
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

// ---------------------------------------------------------------- finale: the jackpot trophy bursts out of the prize wall

export const JackpotTrophy: React.FC<{ cx: number; baseY: number; k: number; frame: number; fps: number }> = ({ cx, baseY, k, frame, fps }) => {
  const t = frame / fps;
  const e = easeOut(k);
  if (k <= 0.01) return null;
  const rise = 300 * e;
  const sc = 0.4 + 0.7 * e;
  return (
    <g transform={`translate(${cx} ${baseY - rise})`} opacity={clamp01(k * 3)}>
      <g opacity={0.55 * e} transform={`rotate(${t * 22})`}>
        {Array.from({ length: 14 }, (_, i) => {
          const a0 = (i / 14) * Math.PI * 2;
          const a1 = a0 + Math.PI / 14;
          return <path key={i} d={`M 0 -120 L ${Math.cos(a0) * 520} ${Math.sin(a0) * 520 - 120} L ${Math.cos(a1) * 520} ${Math.sin(a1) * 520 - 120} Z`} fill={i % 2 ? "#FFFFFF" : LEMON} />;
        })}
      </g>
      <g transform={`scale(${sc}) translate(0 ${Math.sin(t * 6) * -4})`}>
        <path d="M -70 -190 Q -128 -190 -122 -130 Q -112 -80 -62 -72" stroke={INK3} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d="M -70 -190 Q -128 -190 -122 -130 Q -112 -80 -62 -72" stroke="#FFC93C" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M 70 -190 Q 128 -190 122 -130 Q 112 -80 62 -72" stroke={INK3} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d="M 70 -190 Q 128 -190 122 -130 Q 112 -80 62 -72" stroke="#FFC93C" strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d="M -84 -214 H 84 Q 90 -120 40 -76 Q 20 -62 20 -44 H -20 Q -20 -62 -40 -76 Q -90 -120 -84 -214 Z" fill="#FFC93C" stroke={INK3} strokeWidth={8} strokeLinejoin="round" />
        <path d="M -58 -196 Q -62 -130 -34 -96" stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.7} />
        <rect x={-62} y={-44} width={124} height={34} rx={8} fill="#FF9F43" stroke={INK3} strokeWidth={7} />
        <rect x={-84} y={-12} width={168} height={28} rx={10} fill="#FFC93C" stroke={INK3} strokeWidth={7} />
        <path d="M 0 -190 l 12 26 l 28 4 l -20 20 l 5 28 l -25 -14 l -25 14 l 5 -28 l -20 -20 l 28 -4 Z" fill="#FFFFFF" stroke={INK3} strokeWidth={4} strokeLinejoin="round" transform="translate(0 -4) scale(0.85)" />
      </g>
    </g>
  );
};
