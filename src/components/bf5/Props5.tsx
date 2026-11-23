// The props of the Big Friend 5 short (a calm check-up / speed drill in the bead gym; MIXED adding and
// taking away). Notepad headers with spiral rings, a drill badge, a sticky "no room / not enough" note, a
// lightbulb for the friend call, ready-steady lights for the countdown, a lab FLASK that two beakers pour
// into for the friend bond, an index FLASH CARD for the friend trick (it shows either +n = -friend +10 or
// -n = +friend -10), a big green CHECK stamp, a check-box progress strip with a medal, and a gold medal for
// the finale. Pure functions of their inputs; every spoken number gets its own flash input. Text contrast
// is measured (tools/contrast_audit.py): dark ink on cream / yellow / leaf-green, white only on dark fills.
// Bare <g> (the caption is HTML).

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import type { TPhrase } from "../../lib/timing";
import { Txt, textW, clamp01, easeOut } from "../bf1/Props";

export const INK5 = "#1D3B53";
export const CREAM = "#FFFBF0";
export const SKY5 = "#BFE6FF";
export const BLUE5 = "#1F5FA0";
export const GREEN5 = "#1B6B33";
export const LEAF = "#6CC24A";
export const LEAFD = "#2F8F46";
export const PEACH = "#FFB48A";
export const SUN = "#FFD84D";
export const CORAL5 = "#B63A22";
export const HOT = "#C2452D";

// ---------------------------------------------------------------- the story banner

export const drillBannerW = () => Math.round(textW("SPEED DRILL", 54, 3)) + 120;
export const DrillBanner: React.FC<{ x: number; y: number; h: number; frame: number; fps: number }> = ({ x, y, h, frame, fps }) => {
  const w = drillBannerW();
  const wob = Math.sin((frame / fps) * 2) * 1.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${wob} ${w / 2} ${h / 2})`}>
      <rect width={w} height={h} rx={16} fill={CREAM} stroke={INK5} strokeWidth={6} />
      {[0, 1].map((i) => (
        <rect key={i} x={i === 0 ? -14 : w - 40} y={-8} width={54} height={22} rx={4} fill={SUN} stroke={INK5} strokeWidth={4} opacity={0.95} transform={`rotate(${i === 0 ? -28 : 28} ${i === 0 ? 14 : w - 13} 3)`} />
      ))}
      <path d={`M 22 ${h - 16} H ${w - 22}`} stroke="#9CC4E0" strokeWidth={4} strokeLinecap="round" />
      <Txt x={w / 2} y={h / 2 + 15} size={54} fill={INK5} stroke={INK5} sw={0} spacing={3}>SPEED DRILL</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- notepad headers

const Notepad: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    <rect x={x} y={y + 14} width={w} height={h - 14} rx={22} fill={CREAM} stroke={INK5} strokeWidth={7} />
    {[0.28, 0.5, 0.72].map((f) => (
      <path key={f} d={`M ${x + 24} ${y + h * f + 6} H ${x + w - 24}`} stroke="#B9D4EA" strokeWidth={3} opacity={0.7} />
    ))}
    <path d={`M ${x + 70} ${y + 22} V ${y + h - 10}`} stroke="#F2A79A" strokeWidth={3} opacity={0.8} />
    {Array.from({ length: 12 }, (_, i) => {
      const rx = x + 50 + i * ((w - 100) / 11);
      return (
        <g key={i}>
          <rect x={rx - 7} y={y + 2} width={14} height={30} rx={7} fill="#DDE6EE" stroke={INK5} strokeWidth={3.5} />
          <circle cx={rx} cy={y + 24} r={5.5} fill={INK5} />
        </g>
      );
    })}
  </g>
);

export const DrillHeader: React.FC<{
  x: number; y: number; w: number; h: number;
  a: number; b: number; op: "add" | "take"; answer: number;
  showAnswer: number; flashA: number; flashB: number; appear: number;
}> = ({ x, y, w, h, a, b, op, answer, showAnswer, flashA, flashB, appear }) => {
  const k = easeOut(appear);
  const mid = x + w / 2;
  const base = 108;
  const ansK = easeOut(showAnswer);
  const hot = (f: number) => (f > 0.05 ? HOT : INK5);
  return (
    <g transform={`translate(0 ${(1 - k) * -200}) rotate(${(1 - k) * -2} ${mid} ${y})`} opacity={Math.min(1, k * 2)}>
      <Notepad x={x} y={y} w={w} h={h} />
      <g transform={`translate(${mid - 245} ${y + h / 2 + 40})`}>
        <g transform={`scale(${1 + 0.3 * flashA})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashA)} stroke={CREAM} sw={8}>{a}</Txt>
        </g>
        <Txt x={140} y={0} size={96} fill={op === "add" ? GREEN5 : BLUE5} stroke={CREAM} sw={8}>{op === "add" ? "+" : "−"}</Txt>
        <g transform={`translate(262 0) scale(${1 + 0.3 * flashB})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashB)} stroke={CREAM} sw={8}>{b}</Txt>
        </g>
        <Txt x={372} y={0} size={96} fill={BLUE5} stroke={CREAM} sw={8}>=</Txt>
        {ansK < 0.02 ? (
          <Txt x={500} y={0} size={base} fill={BLUE5} stroke={CREAM} sw={8}>?</Txt>
        ) : (
          <g transform={`translate(500 0) scale(${0.4 + 0.75 * ansK})`} style={{ transformOrigin: "0 -34px" }}>
            <Txt x={0} y={0} size={base} fill={GREEN5} stroke={CREAM} sw={8}>{answer}</Txt>
          </g>
        )}
      </g>
    </g>
  );
};

export const NoteHeader: React.FC<{ x: number; y: number; w: number; h: number; text: string; size: number; appear: number }> = ({ x, y, w, h, text, size, appear }) => {
  const k = easeOut(appear);
  return (
    <g transform={`translate(0 ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <Notepad x={x} y={y} w={w} h={h} />
      <Txt x={x + w / 2 + 14} y={y + h / 2 + size * 0.4 + 6} size={size} fill={INK5} stroke={CREAM} sw={7} spacing={2}>{text}</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the lesson-panel props

/** the drill badge: a round badge with a small top word, a big word or number and an optional chip */
export const DrillBadge: React.FC<{ cx: number; cy: number; top: string; big: string; bigSize: number; chip?: string; chipTone?: "add" | "take"; k: number; flash: number; frame: number; fps: number }> = ({ cx, cy, top, big, bigSize, chip, chipTone = "add", k, flash, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const r = 150;
  const cw = chip ? Math.round(textW(chip, 38, 2)) + 56 : 0;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${(0.4 + 0.6 * pop) * (1 + 0.1 * flash)}) rotate(${Math.sin(t * 2) * 1.5})`} opacity={pop}>
      <circle r={r + 14} fill={LEAFD} stroke={INK5} strokeWidth={9} />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * (r - 4)} cy={Math.sin(a) * (r - 4)} r={4.5} fill="#FFFFFF" opacity={0.85} />;
      })}
      <circle r={r - 22} fill={CREAM} stroke={INK5} strokeWidth={6} />
      <Txt x={0} y={-52} size={44} fill={INK5} stroke={INK5} sw={0} spacing={5}>{top}</Txt>
      <Txt x={0} y={bigSize * 0.36 + 10} size={bigSize} fill={INK5} stroke={CREAM} sw={9}>{big}</Txt>
      {chip && (
        <g transform={`translate(0 ${r + 62})`}>
          <rect x={-cw / 2} y={-30} width={cw} height={60} rx={30} fill={chipTone === "add" ? GREEN5 : CORAL5} stroke={INK5} strokeWidth={6} />
          <Txt x={0} y={13} size={38} fill="#FFFFFF" stroke={INK5} sw={0} spacing={2}>{chip}</Txt>
        </g>
      )}
    </g>
  );
};

/** a sticky note: tape, a folded corner and two short lines — plate sized from the longest line */
export const StickyNote: React.FC<{ cx: number; cy: number; lines: [string, string]; k: number; frame: number; fps: number; size?: number }> = ({ cx, cy, lines, k, frame, fps, size = 52 }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const pad = 46;
  const w = Math.round(Math.max(...lines.map((ln) => textW(ln, size, 1)))) + pad * 2;
  const h = size * 2.4 + 50;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${-4 + Math.sin(t * 3) * 1.6}) scale(${0.5 + 0.5 * pop})`} opacity={pop}>
      <rect x={-w / 2 + 6} y={-h / 2 + 10} width={w} height={h} rx={10} fill="#000" opacity={0.18} />
      <path d={`M ${-w / 2} ${-h / 2} H ${w / 2} V ${h / 2 - 40} L ${w / 2 - 40} ${h / 2} H ${-w / 2} Z`} fill="#FFE66D" stroke={INK5} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M ${w / 2 - 40} ${h / 2} V ${h / 2 - 40} H ${w / 2} Z`} fill="#E8C94E" stroke={INK5} strokeWidth={5} strokeLinejoin="round" />
      <rect x={-52} y={-h / 2 - 16} width={104} height={32} rx={5} fill="#FFFFFF" opacity={0.75} stroke={INK5} strokeWidth={3} />
      {lines.map((ln, i) => (
        <Txt key={i} x={0} y={-h / 2 + 44 + (i === 0 ? size : size * 2 + 14)} size={size} fill={INK5} stroke={INK5} sw={0} spacing={1}>{ln}</Txt>
      ))}
    </g>
  );
};
export const stickyH = (size = 52) => size * 2.4 + 50;

/** a glowing lightbulb with a plate: "CALL A FRIEND!" */
export const BulbCall: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const glow = 0.7 + 0.3 * Math.sin(t * 10);
  const size = 42;
  const lw = Math.round(textW("CALL A FRIEND!", size, 1)) + 56;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.45 + 0.55 * pop})`} opacity={pop}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 + t * 0.6;
        return <path key={i} d={`M ${Math.cos(a) * 118} ${Math.sin(a) * 118 - 40} L ${Math.cos(a) * (150 + 14 * glow)} ${Math.sin(a) * (150 + 14 * glow) - 40}`} stroke={SUN} strokeWidth={11} strokeLinecap="round" />;
      })}
      <circle cy={-40} r={104} fill="#FFF3A0" stroke={INK5} strokeWidth={9} opacity={0.5 + 0.5 * glow} />
      <circle cy={-40} r={84} fill="#FFF8C9" stroke={INK5} strokeWidth={8} />
      <path d="M -30 -10 Q -10 -60 0 -30 Q 10 -60 30 -10" stroke="#F2A93C" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M -40 -70 q 16 -26 46 -22" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} />
      <rect x={-34} y={42} width={68} height={22} rx={7} fill="#C9D3DF" stroke={INK5} strokeWidth={6} />
      <rect x={-26} y={64} width={52} height={18} rx={7} fill="#9AA8B8" stroke={INK5} strokeWidth={6} />
      <g transform="translate(0 168)">
        <rect x={-lw / 2} y={-36} width={lw} height={72} rx={36} fill={CREAM} stroke={INK5} strokeWidth={6} />
        <Txt x={0} y={15} size={size} fill={INK5} stroke={INK5} sw={0} spacing={1}>CALL A FRIEND!</Txt>
      </g>
    </g>
  );
};

/** ready-steady lights: three lamps that light one by one, and the number in a bubble */
export const ReadyLights: React.FC<{ cx: number; cy: number; n: number; k: number; frame: number; fps: number }> = ({ cx, cy, n, k, frame }) => {
  const pop = 0.4 + 0.6 * easeOut(Math.min(1, k * 2.4)) + 0.1 * Math.max(0, 1 - k * 3);
  const lamps = [
    { on: n === 3, c: "#FF8A5B" },
    { on: n === 2, c: "#FFD84D" },
    { on: n === 1, c: "#6CC24A" },
  ];
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pop})`}>
      <rect x={-190} y={-150} width={110} height={300} rx={40} fill={INK5} stroke="#0F2233" strokeWidth={8} />
      {lamps.map((l, i) => (
        <g key={i} transform={`translate(-135 ${-90 + i * 90})`}>
          <circle r={36} fill={l.on ? l.c : "#3A5670"} stroke="#0F2233" strokeWidth={5} />
          {l.on && <circle r={52} fill={l.c} opacity={0.3 + 0.1 * Math.sin(frame * 0.4)} />}
        </g>
      ))}
      <circle cx={60} cy={0} r={118} fill={CREAM} stroke={INK5} strokeWidth={9} />
      <circle cx={60} cy={0} r={96} fill="none" stroke={n === 3 ? "#FF8A5B" : n === 2 ? "#FFD84D" : "#6CC24A"} strokeWidth={14} strokeDasharray={`${clamp01(k) * 2 * Math.PI * 96} 1000`} transform="rotate(-90 60 0)" strokeLinecap="round" />
      <Txt x={60} y={56} size={150} fill={INK5} stroke={CREAM} sw={9}>{n}</Txt>
    </g>
  );
};

/** the friend bond: two beakers pour into a flask marked 0..10 — n in blue, the friend in green */
export const FlaskBond: React.FC<{ cx: number; cy: number; n: number; friend: number; k: number; flashN: number; flashF: number; friendReveal: number; frame: number; fps: number }> = ({ cx, cy, n, friend, k, flashN, flashF, friendReveal, frame, fps }) => {
  const t = frame / fps;
  const fw = 130;
  const fh = 250;
  const top = cy - 10;
  const levelN = clamp01((k - 0.15) / 0.3) * n;
  const levelF = clamp01((k - 0.5) / 0.3) * friend;
  const unit = fh / 10;
  const yBase = top + fh;
  const sN = 1 + 0.25 * flashN;
  const sF = (1 + 0.25 * flashF) * (0.6 + 0.4 * easeOut(friendReveal));
  const pourN = k > 0.1 && k < 0.5;
  const pourF = k > 0.45 && k < 0.82;
  return (
    <g>
      {/* the beakers, tipped toward the flask */}
      {[-1, 1].map((s) => {
        const isN = s === -1;
        const sc = isN ? sN : sF;
        const pouring = isN ? pourN : pourF;
        const col = isN ? "#58B4F0" : "#6CE08A";
        return (
          <g key={s} transform={`translate(${cx + s * 170} ${cy - 150}) rotate(${s * -(pouring ? 38 : 8)}) scale(${sc})`}>
            <path d="M -42 -50 H 42 L 52 40 Q 54 62 36 62 H -36 Q -54 62 -52 40 Z" fill="#EAF6FF" stroke={INK5} strokeWidth={6} strokeLinejoin="round" />
            <path d={`M -48 0 H 48 L 52 40 Q 54 62 36 62 H -36 Q -54 62 -52 40 Z`} fill={col} />
            <path d="M -46 -50 H 46" stroke={INK5} strokeWidth={8} strokeLinecap="round" />
            <circle cy={6} r={30} fill={CREAM} stroke={INK5} strokeWidth={5} />
            <Txt x={0} y={20} size={42} fill={INK5} stroke={INK5} sw={0}>{isN ? n : friendReveal > 0.02 ? friend : "?"}</Txt>
          </g>
        );
      })}
      {pourN && <path d={`M ${cx - 118} ${cy - 120} Q ${cx - 70} ${cy - 60} ${cx - 12} ${top + 6}`} stroke="#58B4F0" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} />}
      {pourF && <path d={`M ${cx + 118} ${cy - 120} Q ${cx + 70} ${cy - 60} ${cx + 12} ${top + 6}`} stroke="#6CE08A" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} />}
      {/* the flask */}
      <path d={`M ${cx - fw / 2} ${top} V ${yBase - 10} Q ${cx - fw / 2} ${yBase + 8} ${cx - fw / 2 + 18} ${yBase + 8} H ${cx + fw / 2 - 18} Q ${cx + fw / 2} ${yBase + 8} ${cx + fw / 2} ${yBase - 10} V ${top}`} fill="#F2FAFF" fillOpacity={0.9} stroke={INK5} strokeWidth={7} strokeLinecap="round" />
      <rect x={cx - fw / 2 + 4} y={yBase - unit * levelN} width={fw - 8} height={unit * levelN} fill="#58B4F0" />
      <rect x={cx - fw / 2 + 4} y={yBase - unit * (levelN + levelF)} width={fw - 8} height={unit * levelF} fill="#6CE08A" />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M ${cx + fw / 2 - 28} ${yBase - unit * (i + 1)} h ${i === 9 ? 28 : 16}`} stroke={INK5} strokeWidth={4} strokeLinecap="round" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={cx - 30 + ((i * 17) % 60)} cy={yBase - ((t * 30 + i * 37) % (unit * (levelN + levelF) + 1))} r={4} fill="#FFFFFF" opacity={0.8} />
      ))}
      <rect x={cx - fw / 2 - 10} y={top - 10} width={fw + 20} height={16} rx={7} fill="#C9D3DF" stroke={INK5} strokeWidth={5} />
      {levelN + levelF > 9.5 && (
        <g transform={`translate(${cx} ${yBase - unit * 10 - 36}) scale(${0.5 + 0.5 * easeOut((levelN + levelF - 9.5) / 0.5)})`}>
          <rect x={-58} y={-28} width={116} height={56} rx={28} fill={SUN} stroke={INK5} strokeWidth={6} />
          <Txt x={0} y={14} size={44} fill={INK5} stroke={INK5} sw={0}>= 10</Txt>
        </g>
      )}
    </g>
  );
};
export const FLASK_H = 400;

/** the friend trick on an index FLASH CARD: add: +n = −friend +10, take away: −n = +friend −10 */
export const FlashCard: React.FC<{ x: number; y: number; w: number; h: number; op: "add" | "take"; n: number; friend: number; appear: number; friendReveal: number; flashOperand: number; flashFriend: number; flashTen: number; frame: number; fps: number }> = ({ x, y, w, h, op, n, friend, appear, friendReveal, flashOperand, flashFriend, flashTen, frame, fps }) => {
  const k = easeOut(appear);
  const t = frame / fps;
  const hot = (f: number) => (f > 0.05 ? HOT : INK5);
  const sc = (f: number) => 1 + 0.28 * f;
  const fsz = Math.round(Math.min((h - 80) * 0.7, w * 0.17));
  const cy = y + 70 + (h - 70 - 16) / 2 + fsz * 0.34;
  const rev = easeOut(friendReveal);
  const sgnN = op === "add" ? "+" : "−";
  const sgnF = op === "add" ? "−" : "+";
  const ten = op === "add" ? "+10" : "−10";
  return (
    <g transform={`translate(${(1 - k) * -90} 0) rotate(${(1 - k) * -4} ${x} ${y})`} opacity={Math.min(1, k * 2.4)}>
      <rect x={x + 6} y={y + 10} width={w} height={h} rx={14} fill="#000" opacity={0.16} />
      <rect x={x} y={y} width={w} height={h} rx={14} fill={CREAM} stroke={INK5} strokeWidth={7} />
      <path d={`M ${x + 8} ${y + 52} H ${x + w - 8}`} stroke="#F2A79A" strokeWidth={5} />
      {[0.55, 0.78].map((f) => (
        <path key={f} d={`M ${x + 12} ${y + h * f + 14} H ${x + w - 12}`} stroke="#B9D4EA" strokeWidth={3} opacity={0.7} />
      ))}
      <Txt x={x + w / 2} y={y + 38} size={30} fill={BLUE5} stroke={BLUE5} sw={0} spacing={4}>FRIEND TRICK</Txt>
      <g transform={`translate(${x + w * 0.17} ${cy}) scale(${sc(flashOperand)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashOperand)} stroke={CREAM} sw={6}>{`${sgnN}${n}`}</Txt>
      </g>
      <Txt x={x + w * 0.34} y={cy - 4} size={58} fill={BLUE5} stroke={CREAM} sw={5}>=</Txt>
      <g transform={`translate(${x + w * 0.52} ${cy}) scale(${sc(flashFriend)})`}>
        {rev < 0.02 ? (
          <g transform={`rotate(${Math.sin(t * 6) * 4})`}>
            <Txt x={0} y={0} size={fsz} fill={BLUE5} stroke={CREAM} sw={6}>{`${sgnF}?`}</Txt>
          </g>
        ) : (
          <g transform={`scale(${0.5 + 0.5 * rev})`}>
            <Txt x={0} y={0} size={fsz} fill={hot(flashFriend)} stroke={CREAM} sw={6}>{`${sgnF}${friend}`}</Txt>
          </g>
        )}
      </g>
      <g transform={`translate(${x + w * 0.8} ${cy}) scale(${sc(flashTen)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashTen)} stroke={CREAM} sw={6}>{ten}</Txt>
      </g>
    </g>
  );
};

/** the big green CHECK stamp slammed onto the page */
export const CheckStamp: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number; label?: string }> = ({ cx, cy, k, frame, label = "CHECK!" }) => {
  const e = easeOut(Math.min(1, k * 2.2));
  const slam = k < 0.35 ? 1 + 0.9 * (1 - k / 0.35) : 1 + 0.05 * Math.sin(k * 14) * (1 - k);
  const size = 56;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(-9) scale(${(0.3 + 0.7 * e) * slam})`} opacity={clamp01(k * 4)}>
      <circle r={146} fill="none" stroke={GREEN5} strokeWidth={14} />
      <circle r={124} fill="none" stroke={GREEN5} strokeWidth={5} strokeDasharray="6 10" />
      <circle r={112} fill={CREAM} fillOpacity={0.92} />
      <path d="M -62 -22 L -22 26 L 66 -72" stroke={GREEN5} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Txt x={0} y={86} size={size} fill={GREEN5} stroke={GREEN5} sw={0} spacing={3}>{label}</Txt>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        return <circle key={i} cx={Math.cos(a) * 168} cy={Math.sin(a) * 168} r={7 - (i % 3) * 1.5} fill={GREEN5} opacity={0.8} />;
      })}
    </g>
  );
};

/** a small cream tag that tops a panel — plate width follows the text */
export const NoteTag: React.FC<{ cx: number; cy: number; text: string; size: number; maxW: number; k: number }> = ({ cx, cy, text, size, maxW, k }) => {
  const pad = 30;
  let sz = size;
  while (textW(text, sz, 1) + pad * 2 > maxW && sz > 20) sz -= 2;
  const w = Math.round(textW(text, sz, 1)) + pad * 2;
  const h = sz + 36;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * easeOut(k)})`} opacity={clamp01(k * 2)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={CREAM} stroke={INK5} strokeWidth={6} />
      <Txt x={0} y={sz * 0.34} size={sz} fill={INK5} stroke={INK5} sw={0} spacing={1}>{text}</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the progress strip: four check-boxes and a medal

export const CheckStrip: React.FC<{ x: number; y: number; h: number; done: number; pulses: number[]; medal: number; frame: number; fps: number }> = ({ x, y, h, done, pulses, medal, frame, fps }) => {
  const t = frame / fps;
  const cy = y + h / 2;
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const lit = i < done;
        const pop = lit ? 1 + 0.3 * (pulses[i] ?? 0) : 1;
        return (
          <g key={i} transform={`translate(${x + 28 + i * 58} ${cy}) scale(${pop})`}>
            <rect x={-21} y={-21} width={42} height={42} rx={10} fill={lit ? LEAF : CREAM} stroke={INK5} strokeWidth={5} />
            {lit ? <path d="M -11 1 L -3 10 L 12 -10" stroke={INK5} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : <Txt x={0} y={9} size={26} fill={INK5} stroke={INK5} sw={0}>{i + 1}</Txt>}
          </g>
        );
      })}
      <g transform={`translate(${x + 28 + 4 * 58 + 14} ${cy + 2}) rotate(${Math.sin(t * 6) * 6 * medal})`}>
        <path d="M -12 -22 L -6 -4 L 6 -4 L 12 -22" fill="#E8644A" stroke={INK5} strokeWidth={4} strokeLinejoin="round" />
        <circle cy={8} r={17} fill={medal > 0.5 ? "#FFC93C" : "#C9D3DF"} stroke={INK5} strokeWidth={5} />
        <path d="M 0 -2 l 4 8 l 9 1 l -7 6 l 2 9 l -8 -4 l -8 4 l 2 -9 l -7 -6 l 9 -1 Z" fill={medal > 0.5 ? "#FFFFFF" : "#8A99AA"} transform="scale(0.5) translate(0 12)" />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- finale: the gold medal

export const BigMedal: React.FC<{ cx: number; k: number; frame: number; fps: number }> = ({ cx, k, frame, fps }) => {
  const t = frame / fps;
  const e = easeOut(k);
  const drop = (1 - e) * -520;
  const sway = Math.sin(t * 2.4) * 3 * e;
  const cyM = 430;
  return (
    <g transform={`translate(${cx} ${drop})`} opacity={clamp01(k * 3)}>
      <g transform={`rotate(${sway} 0 120)`}>
        <polygon points={`-74,130 -30,130 36,${cyM - 100} -8,${cyM - 100}`} fill="#E8644A" stroke={INK5} strokeWidth={7} strokeLinejoin="round" />
        <polygon points={`74,130 30,130 -36,${cyM - 100} 8,${cyM - 100}`} fill="#2F7FBF" stroke={INK5} strokeWidth={7} strokeLinejoin="round" />
        <circle cy={cyM} r={130} fill="#FFC93C" stroke={INK5} strokeWidth={10} />
        <circle cy={cyM} r={104} fill="#FFE27A" stroke="#C9971C" strokeWidth={6} />
        <path d={`M 0 ${cyM - 74} l 22 48 l 52 6 l -38 36 l 10 52 l -46 -26 l -46 26 l 10 -52 l -38 -36 l 52 -6 Z`} fill="#FFFFFF" stroke={INK5} strokeWidth={7} strokeLinejoin="round" transform={`translate(0 ${-8}) scale(0.95)`} />
        <path d={`M -90 ${cyM - 40} q 20 -50 70 -66`} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the caption

const BARE = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const NUMS = new Set("zero one two three four five six seven eight nine ten twenty thirty forty fifty sixty seventy eighty ninety eighteen twentyfive eightytwo seventyeight seventyfive sixtyseven eightyeight".split(" "));
const KEYS = new Set("friend friends ten ones rod room enough add take away drill check misses".split(" "));

export const BF5Caption: React.FC<{ phrase: TPhrase; wordIdx: number; top: number; height: number; width: number }> = ({ phrase, wordIdx, top, height, width }) => (
  <div style={{ position: "absolute", left: 0, top, width, height, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
    <div
      style={{
        background: CREAM,
        border: `7px solid ${LEAFD}`,
        borderRadius: 44,
        padding: "8px 30px 12px",
        textAlign: "center",
        boxShadow: `0 10px 0 ${INK5}`,
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: "inherit" as unknown as number,
        lineHeight: 1.16,
        color: INK5,
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
              borderRadius: 18,
              background: active ? LEAF : "transparent",
              color: active ? INK5 : special ? (coming ? "#4A7FB5" : BLUE5) : coming ? "#5F7389" : INK5,
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
