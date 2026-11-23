// The props of the Big Friend 4 short (a storm, a stuck rescue chopper, TAKING AWAY). Safety yellow,
// sky blue and slate; shapes none of bf1-bf3 use: a hazard-stripe banner, a caution header plate, crate
// TOWERS for the big-friend pairs, a barrier sign, a signal FLARE for the call, a rotor countdown, a
// winch hook with two crates for the friend bond, a CLIPBOARD for the friend trick, a storm gauge, patches
// and a cloud-clearing progress strip. Pure functions of their inputs; every spoken number has its own
// flash input. Text contrast is measured (tools/contrast_audit.py): light text only on dark plates, dark
// text on yellow / sky / green plates. Bare <g> (the caption is HTML).

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import type { TPhrase } from "../../lib/timing";
import { Txt, textW, clamp01, easeOut } from "../bf1/Props";

export const INK4 = "#1B2533";
export const SLATE = "#3C4A5C";
export const PLATE = "#1F2A3A";
export const YEL = "#FFD400";
export const SKY = "#4FB3FF";
export const SKYL = "#7FD6FF";
export const DRED = "#C62828";
export const GREEN = "#5BE37A";
export const LIME = "#8CF05A";
export const BLUE = "#1F63C8";
export const PAPER4 = "#FFFFFF";

const polar = (r: number, deg: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r] as const;

// ---------------------------------------------------------------- the story banner: a hazard-stripe plate

export const bannerW = () => Math.round(textW("STORM ALERT!", 54, 3)) + 120;
export const HazardBanner: React.FC<{ x: number; y: number; h: number; frame: number; fps: number }> = ({ x, y, h, frame, fps }) => {
  const size = 54;
  const w = bannerW();
  const blink = Math.floor((frame / fps) * 3) % 2 === 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} rx={14} fill={YEL} stroke={INK4} strokeWidth={6} />
      {Array.from({ length: Math.ceil(w / 34) }, (_, i) => (
        <g key={i}>
          <path d={`M ${i * 34} ${h - 4} l 17 -14 h 17 l -17 14 Z`} fill={INK4} opacity={0.9} />
          <path d={`M ${i * 34} 4 l 17 14 h 17 l -17 -14 Z`} fill={INK4} opacity={0.9} />
        </g>
      ))}
      <circle cx={30} cy={h / 2} r={9} fill={blink ? "#FF3B3B" : "#7A1F1F"} stroke={INK4} strokeWidth={3} />
      <Txt x={w / 2 + 12} y={h / 2 + 19} size={size} fill={INK4} stroke={INK4} sw={0} spacing={3}>STORM ALERT!</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the question header: a caution plate

const Plate: React.FC<{ x: number; y: number; w: number; h: number; frame: number; fps: number; alarm?: number; tint?: string }> = ({ x, y, w, h, frame, fps, alarm = 0, tint = PLATE }) => {
  const t = frame / fps;
  const stripe = alarm > 0.05 && Math.floor(t * 4) % 2 === 0 ? DRED : YEL;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={22} fill={INK4} />
      {Array.from({ length: Math.ceil(w / 40) }, (_, i) => (
        <g key={i}>
          <path d={`M ${x + i * 40} ${y + 14} l 20 -14 h 20 l -20 14 Z`} fill={stripe} />
          <path d={`M ${x + i * 40} ${y + h - 14} l 20 14 h 20 l -20 -14 Z`} fill={stripe} />
        </g>
      ))}
      <rect x={x + 8} y={y + 14} width={w - 16} height={h - 28} rx={12} fill={tint} stroke={INK4} strokeWidth={4} />
      {[[x + 22, y + 28], [x + w - 22, y + 28], [x + 22, y + h - 28], [x + w - 22, y + h - 28]].map(([rx, ry], i) => (
        <circle key={i} cx={rx} cy={ry} r={5} fill="#6A7A90" stroke={INK4} strokeWidth={2} />
      ))}
    </g>
  );
};

export const CautionHeader: React.FC<{
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
  const hot = (f: number) => (f > 0.05 ? "#FFFFFF" : YEL);
  return (
    <g transform={`translate(${shake} ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <Plate x={x} y={y} w={w} h={h} frame={frame} fps={fps} alarm={alarm} />
      <g transform={`translate(${mid - 250} ${y + h / 2 + 34})`}>
        <g transform={`scale(${1 + 0.3 * flashA})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashA)} stroke={INK4} sw={7}>{a}</Txt>
        </g>
        <Txt x={140} y={0} size={96} fill={SKYL} stroke={INK4} sw={7}>−</Txt>
        <g transform={`translate(262 0) scale(${1 + 0.3 * flashB})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashB)} stroke={INK4} sw={7}>{b}</Txt>
        </g>
        <Txt x={372} y={0} size={96} fill={SKYL} stroke={INK4} sw={7}>=</Txt>
        {ansK < 0.02 ? (
          <Txt x={500} y={0} size={base} fill={SKYL} stroke={INK4} sw={7}>?</Txt>
        ) : (
          <g transform={`translate(500 0) scale(${0.4 + 0.75 * ansK})`} style={{ transformOrigin: "0 -34px" }}>
            <Txt x={0} y={0} size={base} fill={LIME} stroke={INK4} sw={7}>{answer}</Txt>
          </g>
        )}
      </g>
      {/* the warning pill: dark text on safety yellow, plate sized from its text */}
      {stuck > 0.02 && ansK < 0.02 && (() => {
        const size = 52;
        const bw = Math.round(textW("STUCK!", size, 2)) + 130;
        const bh = 84;
        return (
          <g transform={`translate(${x + w - 150} ${y + h - 6}) rotate(${-7 + (1 - easeOut(stuck)) * 16}) scale(${0.4 + 0.36 * easeOut(stuck)})`} opacity={clamp01(stuck * 3)}>
            <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={20} fill={YEL} stroke={INK4} strokeWidth={7} />
            <g transform={`translate(${-bw / 2 + 50} 2)`}>
              <path d="M 0 -30 L 30 24 L -30 24 Z" fill={INK4} stroke={INK4} strokeWidth={6} strokeLinejoin="round" />
              <rect x={-4} y={-12} width={8} height={20} rx={3} fill={YEL} />
              <circle cx={0} cy={16} r={4.5} fill={YEL} />
            </g>
            <Txt x={26} y={19} size={size} fill={INK4} stroke={INK4} sw={0} spacing={2}>STUCK!</Txt>
          </g>
        );
      })()}
    </g>
  );
};

export const TextHeader: React.FC<{ x: number; y: number; w: number; h: number; text: string; size: number; appear: number; frame: number; fps: number; tone?: "yellow" | "sky" }> = ({ x, y, w, h, text, size, appear, frame, fps, tone = "yellow" }) => {
  const k = easeOut(appear);
  return (
    <g transform={`translate(0 ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <Plate x={x} y={y} w={w} h={h} frame={frame} fps={fps} />
      <Txt x={x + w / 2} y={y + h / 2 + size * 0.34} size={size} fill={tone === "yellow" ? YEL : SKYL} stroke={INK4} sw={6} spacing={2}>{text}</Txt>
    </g>
  );
};

export const PairHeader: React.FC<{ x: number; y: number; w: number; h: number; l: number; r: number; flashL: number; flashR: number; appear: number; frame: number; fps: number }> = ({ x, y, w, h, l, r, flashL, flashR, appear, frame, fps }) => {
  const k = easeOut(appear);
  const mid = x + w / 2;
  const base = 112;
  const hot = (f: number) => (f > 0.05 ? "#FFFFFF" : YEL);
  return (
    <g transform={`translate(0 ${(1 - k) * -200})`} opacity={Math.min(1, k * 2)}>
      <Plate x={x} y={y} w={w} h={h} frame={frame} fps={fps} />
      <g transform={`translate(${mid - 235} ${y + h / 2 + 34})`}>
        <g transform={`scale(${1 + 0.3 * flashL})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashL)} stroke={INK4} sw={7}>{l}</Txt>
        </g>
        <Txt x={118} y={0} size={92} fill={SKYL} stroke={INK4} sw={7}>+</Txt>
        <g transform={`translate(236 0) scale(${1 + 0.3 * flashR})`} style={{ transformOrigin: "0 -34px" }}>
          <Txt x={0} y={0} size={base} fill={hot(flashR)} stroke={INK4} sw={7}>{r}</Txt>
        </g>
        <Txt x={352} y={0} size={92} fill={SKYL} stroke={INK4} sw={7}>=</Txt>
        <Txt x={470} y={0} size={base} fill={LIME} stroke={INK4} sw={7}>10</Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- crate towers: the big-friend pairs

export const PAIRS4: [number, number][] = [
  [6, 4],
  [7, 3],
  [8, 2],
  [9, 1],
  [5, 5],
];

/** Five towers of ten crates: the bottom n crates safety yellow, the top friend crates sky blue, each block
 *  carrying its number. `grow[i]` 0..1 stacks tower i crate by crate from the ground. */
export const CrateTowers: React.FC<{ x: number; y: number; w: number; h: number; grow: number[]; flashes: [number, number][]; frame: number; fps: number }> = ({ x, y, w, h, grow, flashes, frame }) => {
  const gap = 14;
  const tw = (w - 4 * gap) / 5;
  const ch = Math.min((h - 30) / 10, tw * 1.05);
  const base = y + h - 20;
  return (
    <g>
      <rect x={x} y={base} width={w} height={14} rx={7} fill={SLATE} stroke={INK4} strokeWidth={4} />
      {PAIRS4.map(([n, f], i) => {
        const g = grow[i] ?? 0;
        if (g <= 0.001) return null;
        const tx = x + i * (tw + gap);
        const shown = g * 10;
        const fl = flashes[i]?.[0] ?? 0;
        const fr = flashes[i]?.[1] ?? 0;
        return (
          <g key={i}>
            {Array.from({ length: 10 }, (_, j) => {
              const u = clamp01(shown - j);
              if (u <= 0) return null;
              const isN = j < n;
              const pop = 1 + 0.18 * Math.sin(u * Math.PI) * (1 - u) * 3;
              const cy = base - (j + 0.5) * ch;
              return (
                <g key={j} transform={`translate(${tx + tw / 2} ${cy}) scale(${pop * (0.6 + 0.4 * u)})`} opacity={clamp01(u * 3)}>
                  <rect x={-tw / 2} y={-ch / 2 + 2} width={tw} height={ch - 4} rx={8} fill={isN ? YEL : SKY} stroke={INK4} strokeWidth={4} />
                  <path d={`M ${-tw / 2 + 8} ${-ch / 2 + 10} L ${tw / 2 - 8} ${ch / 2 - 10} M ${tw / 2 - 8} ${-ch / 2 + 10} L ${-tw / 2 + 8} ${ch / 2 - 10}`} stroke={INK4} strokeWidth={3} opacity={0.22} />
                </g>
              );
            })}
            {shown >= n - 0.2 && (
              <g transform={`translate(${tx + tw / 2} ${base - (n / 2) * ch + 4}) scale(${1 + 0.4 * fl})`}>
                <circle r={Math.min(30, tw * 0.34)} fill={fl > 0.05 ? "#FFFFFF" : PLATE} stroke={INK4} strokeWidth={4} />
                <Txt x={0} y={Math.min(30, tw * 0.34) * 0.36} size={Math.min(30, tw * 0.34) * 1.25} fill={fl > 0.05 ? INK4 : YEL} stroke={INK4} sw={0}>{n}</Txt>
              </g>
            )}
            {shown >= 9.8 && (
              <g transform={`translate(${tx + tw / 2} ${base - (n + f / 2) * ch + 4}) scale(${1 + 0.4 * fr})`}>
                <circle r={Math.min(30, tw * 0.34)} fill={fr > 0.05 ? "#FFFFFF" : PLATE} stroke={INK4} strokeWidth={4} />
                <Txt x={0} y={Math.min(30, tw * 0.34) * 0.36} size={Math.min(30, tw * 0.34) * 1.25} fill={fr > 0.05 ? INK4 : SKYL} stroke={INK4} sw={0}>{f}</Txt>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the storm gauge

export const StormGauge: React.FC<{ cx: number; cy: number; level: number; k: number; frame: number; fps: number; r?: number; alarm?: number }> = ({ cx, cy, level, k, frame, fps, r = 150, alarm = 0 }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const shake = alarm * Math.sin(t * 36) * 3;
  const ang = -90 + 180 * clamp01(level) + shake;
  const [nx, ny] = polar(r * 0.78, ang + 90 - 90 + 0);
  const nxx = Math.cos(((ang - 90) * Math.PI) / 180) * r * 0.78;
  const nyy = Math.sin(((ang - 90) * Math.PI) / 180) * r * 0.78;
  void nx; void ny;
  const seg = (a0: number, a1: number, col: string) => {
    const p = (a: number) => [Math.cos(((a - 180) * Math.PI) / 180) * (r - 14), Math.sin(((a - 180) * Math.PI) / 180) * (r - 14)];
    const s = p(a0);
    const e = p(a1);
    return <path d={`M ${s[0]} ${s[1]} A ${r - 14} ${r - 14} 0 0 1 ${e[0]} ${e[1]}`} stroke={col} strokeWidth={26} fill="none" />;
  };
  const label = "STORM";
  const lw = Math.round(textW(label, 44, 4)) + 56;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.45 + 0.55 * pop})`} opacity={pop}>
      <path d={`M ${-r - 14} 30 A ${r + 14} ${r + 14} 0 0 1 ${r + 14} 30 Z`} fill={PAPER4} stroke={INK4} strokeWidth={9} strokeLinejoin="round" />
      {seg(0, 60, GREEN)}
      {seg(60, 120, YEL)}
      {seg(120, 180, DRED)}
      {Array.from({ length: 7 }, (_, i) => {
        const a = ((i * 30 - 180) * Math.PI) / 180;
        return <path key={i} d={`M ${Math.cos(a) * (r - 40)} ${Math.sin(a) * (r - 40)} L ${Math.cos(a) * (r - 58)} ${Math.sin(a) * (r - 58)}`} stroke={INK4} strokeWidth={5} strokeLinecap="round" />;
      })}
      <path d={`M 0 0 L ${nxx} ${nyy}`} stroke={INK4} strokeWidth={10} strokeLinecap="round" />
      <circle r={16} fill={DRED} stroke={INK4} strokeWidth={6} />
      <g transform="translate(0 92)">
        <rect x={-lw / 2} y={-34} width={lw} height={68} rx={16} fill={PLATE} stroke={INK4} strokeWidth={6} />
        <Txt x={0} y={15} size={44} fill={YEL} stroke={INK4} sw={0} spacing={4}>{label}</Txt>
      </g>
    </g>
  );
};

/** a stitched patch with a short label — plate width follows the text; dark text on yellow */
export const Patch: React.FC<{ cx: number; cy: number; text: string; size: number; maxW: number; k: number; tone?: "yellow" | "sky" | "green" }> = ({ cx, cy, text, size, maxW, k, tone = "yellow" }) => {
  const pad = 34;
  let sz = size;
  while (textW(text, sz, 1) + pad * 2 > maxW && sz > 20) sz -= 2;
  const w = Math.round(textW(text, sz, 1)) + pad * 2;
  const h = sz + 44;
  const fill = tone === "yellow" ? YEL : tone === "sky" ? SKY : GREEN;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * easeOut(k)})`} opacity={clamp01(k * 2)}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill={fill} stroke={INK4} strokeWidth={7} />
      <rect x={-w / 2 + 9} y={-h / 2 + 9} width={w - 18} height={h - 18} rx={10} fill="none" stroke={INK4} strokeWidth={3} strokeDasharray="3 9" strokeLinecap="round" opacity={0.7} />
      <Txt x={0} y={sz * 0.34} size={sz} fill={INK4} stroke={INK4} sw={0} spacing={1}>{text}</Txt>
    </g>
  );
};

// ---------------------------------------------------------------- the lesson-panel props

/** a life ring "−n" that rolls at the full ones rod and bounces off */
export const RingBonk: React.FC<{ x0: number; x1: number; cy: number; label: string; start: number; frame: number }> = ({ x0, x1, cy, label, start, frame }) => {
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
    <g transform={`translate(${x} ${cy}) scale(${(0.5 + 0.5 * appear) * (1 + 0.14 * squash)} ${(0.5 + 0.5 * appear) * (1 - 0.16 * squash)})`}>
      <g transform={`rotate(${spin})`}>
        <circle r={82} fill="#FFFFFF" stroke={INK4} strokeWidth={8} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M 0 0 L ${Math.cos((i * Math.PI) / 2) * 82} ${Math.sin((i * Math.PI) / 2) * 82} A 82 82 0 0 1 ${Math.cos(((i + 0.5) * Math.PI) / 2) * 82} ${Math.sin(((i + 0.5) * Math.PI) / 2) * 82} Z`} fill="#FF8A00" />
        ))}
      </g>
      <circle r={82} fill="none" stroke={INK4} strokeWidth={8} />
      <circle r={50} fill={PLATE} stroke={INK4} strokeWidth={6} />
      <Txt x={0} y={20} size={52} fill={YEL} stroke={INK4} sw={0}>{label}</Txt>
      {hit && (
        <g transform="translate(92 -70)" opacity={1 - (u - 0.5) * 3}>
          <path d="M 0 0 l -22 -14 l 2 22 l -24 -4 l 18 16 l -18 18 l 26 -6 l 0 20 l 18 -18 l 16 14 l -4 -22 l 22 -4 l -18 -12 Z" fill={YEL} stroke={INK4} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
    </g>
  );
};

/** a road barrier: legs, a hazard-striped frame and a slate board, "NOT ENOUGH / TO TAKE n!" in safety yellow */
export const BarrierSign: React.FC<{ cx: number; cy: number; text: string; k: number; frame: number; fps: number }> = ({ cx, cy, text, k, frame, fps }) => {
  const t = frame / fps;
  const pop = easeOut(Math.min(1, k * 3));
  const wob = Math.sin(t * 16) * 1.6 * (1 - 0.6 * clamp01(k));
  const lines = ["NOT ENOUGH", text];
  const size = 52;
  const pad = 46;
  const w = Math.round(Math.max(...lines.map((ln) => textW(ln, size, 1)))) + pad * 2;
  const h = size * 2.3 + 52;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${wob}) scale(${0.5 + 0.5 * pop})`} opacity={pop}>
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M ${s * (w / 2 - 36)} ${h / 2} L ${s * (w / 2 - 6)} ${h / 2 + 90}`} stroke={INK4} strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${s * (w / 2 - 36)} ${h / 2} L ${s * (w / 2 - 6)} ${h / 2 + 90}`} stroke="#E9EEF4" strokeWidth={5} strokeLinecap="round" />
        </g>
      ))}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={16} fill={YEL} stroke={INK4} strokeWidth={8} />
      {Array.from({ length: Math.ceil(w / 36) }, (_, i) => (
        <g key={i}>
          <path d={`M ${-w / 2 + i * 36} ${-h / 2 + 12} l 18 -12 h 18 l -18 12 Z`} fill={INK4} />
          <path d={`M ${-w / 2 + i * 36} ${h / 2 - 12} l 18 12 h 18 l -18 -12 Z`} fill={INK4} />
        </g>
      ))}
      <rect x={-w / 2 + 12} y={-h / 2 + 18} width={w - 24} height={h - 36} rx={8} fill={PLATE} />
      {lines.map((ln, i) => (
        <Txt key={i} x={0} y={-h / 2 + 18 + (i === 0 ? size + 12 : size * 2 + 22)} size={size} fill={YEL} stroke={INK4} sw={0} spacing={1}>{ln}</Txt>
      ))}
    </g>
  );
};
export const barrierH = () => 52 * 2.3 + 52 + 90;

/** a signal FLARE: it shoots up, bursts into a red-orange star, "CALL A FRIEND!" on a slate plate */
export const FlareCall: React.FC<{ cx: number; cy: number; k: number; frame: number; fps: number }> = ({ cx, cy, k, frame, fps }) => {
  const t = frame / fps;
  const up = clamp01(k / 0.55);
  const burst = clamp01((k - 0.5) / 0.4);
  const size = 40;
  const lw = Math.round(textW("CALL A FRIEND!", size, 1)) + 60;
  const fy = cy + 180 - 300 * easeOut(up);
  return (
    <g>
      {up < 1 && (
        <g>
          <path d={`M ${cx} ${cy + 180} L ${cx + Math.sin(t * 30) * 4} ${fy}`} stroke="#FFB347" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
          <circle cx={cx} cy={fy} r={14} fill="#FFFFFF" stroke="#FF8A00" strokeWidth={6} />
        </g>
      )}
      {burst > 0.01 && (
        <g transform={`translate(${cx} ${cy - 120}) scale(${0.3 + 0.9 * easeOut(burst)}) rotate(${t * 20})`} opacity={1 - 0.25 * Math.sin(t * 10)}>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const len = i % 2 === 0 ? 150 : 96;
            return <path key={i} d={`M ${Math.cos(a) * 44} ${Math.sin(a) * 44} L ${Math.cos(a) * len} ${Math.sin(a) * len}`} stroke={i % 2 ? "#FF8A00" : DRED} strokeWidth={18} strokeLinecap="round" />;
          })}
          <circle r={56} fill="#FFFFFF" stroke={DRED} strokeWidth={10} />
          <circle r={28} fill="#FFD400" />
        </g>
      )}
      <g transform={`translate(${cx} ${cy + 120})`} opacity={clamp01(k * 4)}>
        <rect x={-lw / 2} y={-34} width={lw} height={68} rx={16} fill={PLATE} stroke={INK4} strokeWidth={6} />
        <Txt x={0} y={15} size={size} fill={YEL} stroke={INK4} sw={0} spacing={1}>CALL A FRIEND!</Txt>
      </g>
    </g>
  );
};

/** the rotor countdown: a dial with spinning blades behind 3, 2, 1 */
export const RotorCount: React.FC<{ cx: number; cy: number; n: number; k: number; frame: number; fps: number }> = ({ cx, cy, n, k, frame, fps }) => {
  const pop = 0.35 + 0.65 * easeOut(Math.min(1, k * 2.4)) + 0.1 * Math.max(0, 1 - k * 3);
  const r = 140;
  const fill = n === 3 ? DRED : n === 2 ? YEL : GREEN;
  const spin = (frame / fps) * (200 + (3 - n) * 260);
  return (
    <g transform={`translate(${cx} ${cy}) scale(${pop})`}>
      <circle r={r + 16} fill={SLATE} stroke={INK4} strokeWidth={9} />
      <circle r={r} fill="#E9EEF4" stroke={INK4} strokeWidth={5} />
      <g transform={`rotate(${spin})`} opacity={0.9}>
        {[0, 90, 180, 270].map((a) => (
          <path key={a} d={`M 0 0 L -14 -${r - 18} L 14 -${r - 18} Z`} fill={SLATE} transform={`rotate(${a})`} />
        ))}
      </g>
      <circle r={r - 14} fill="none" stroke={fill} strokeWidth={16} strokeDasharray={`${clamp01(k) * 2 * Math.PI * (r - 14)} 1000`} transform="rotate(-90)" strokeLinecap="round" />
      <circle r={78} fill={fill} stroke={INK4} strokeWidth={8} />
      <Txt x={0} y={52} size={150} fill={n === 3 ? "#FFFFFF" : INK4} stroke={INK4} sw={n === 3 ? 9 : 0}>{n}</Txt>
    </g>
  );
};

/** the friend bond: two crates (n and friend) on a winch hook that swing together under an "= 10" plate */
export const WinchCrates: React.FC<{ cx: number; cy: number; n: number; friend: number; k: number; flashN: number; flashF: number; friendReveal: number; frame: number; fps: number }> = ({ cx, cy, n, friend, k, flashN, flashF, friendReveal, frame, fps }) => {
  const t = frame / fps;
  const move = easeOut(clamp01(k * 1.5));
  const gap = 170 - 62 * move;
  const sway = Math.sin(t * 3) * 2 * (1 - clamp01((k - 0.6) / 0.3));
  const sN = 1 + 0.26 * flashN;
  const sF = (1 + 0.26 * flashF) * (0.6 + 0.4 * easeOut(friendReveal));
  const joined = clamp01((k - 0.55) / 0.2);
  const cs = 128;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${sway} 0 -160)`}>
      <path d="M 0 -170 V -128" stroke={INK4} strokeWidth={10} />
      <circle cy={-118} r={18} fill="none" stroke={INK4} strokeWidth={9} />
      <rect x={-gap - 20} y={-98} width={2 * gap + 40} height={20} rx={8} fill={SLATE} stroke={INK4} strokeWidth={5} />
      {[-gap, gap].map((sx) => (
        <path key={sx} d={`M ${sx} -78 V -44`} stroke={INK4} strokeWidth={6} />
      ))}
      <g transform={`translate(${-gap} 20) scale(${sN})`}>
        <rect x={-cs / 2} y={-cs / 2 - 20} width={cs} height={cs} rx={12} fill={YEL} stroke={INK4} strokeWidth={7} />
        <path d={`M ${-cs / 2 + 14} ${-cs / 2 - 6} L ${cs / 2 - 14} ${cs / 2 - 34} M ${cs / 2 - 14} ${-cs / 2 - 6} L ${-cs / 2 + 14} ${cs / 2 - 34}`} stroke={INK4} strokeWidth={4} opacity={0.2} />
        <Txt x={0} y={28} size={92} fill={INK4} stroke={YEL} sw={7}>{n}</Txt>
      </g>
      <g transform={`translate(${gap} 20) scale(${sF})`}>
        <rect x={-cs / 2} y={-cs / 2 - 20} width={cs} height={cs} rx={12} fill={SKY} stroke={INK4} strokeWidth={7} />
        <path d={`M ${-cs / 2 + 14} ${-cs / 2 - 6} L ${cs / 2 - 14} ${cs / 2 - 34} M ${cs / 2 - 14} ${-cs / 2 - 6} L ${-cs / 2 + 14} ${cs / 2 - 34}`} stroke={INK4} strokeWidth={4} opacity={0.2} />
        <Txt x={0} y={28} size={92} fill={INK4} stroke={SKY} sw={7}>{friendReveal > 0.02 ? friend : "?"}</Txt>
      </g>
      {joined > 0.05 && (
        <g transform={`translate(0 140) scale(${0.4 + 0.6 * easeOut(joined)})`} opacity={joined}>
          <rect x={-90} y={-34} width={180} height={68} rx={16} fill={PLATE} stroke={INK4} strokeWidth={6} />
          <Txt x={0} y={18} size={54} fill={LIME} stroke={INK4} sw={0} spacing={2}>= 10</Txt>
        </g>
      )}
    </g>
  );
};

/** the friend trick on a CLIPBOARD: "−n = +friend −10", natural height */
export const Clipboard: React.FC<{ x: number; y: number; w: number; h: number; n: number; friend: number; appear: number; friendReveal: number; flashOperand: number; flashFriend: number; flashTen: number; frame: number; fps: number }> = ({ x, y, w, h, n, friend, appear, friendReveal, flashOperand, flashFriend, flashTen, frame, fps }) => {
  const k = easeOut(appear);
  const t = frame / fps;
  const hot = (f: number) => (f > 0.05 ? DRED : INK4);
  const sc = (f: number) => 1 + 0.28 * f;
  const fsz = Math.round(Math.min((h - 84) * 0.7, w * 0.17));
  const cy = y + 78 + (h - 78 - 18) / 2 + fsz * 0.34 - 4;
  const rev = easeOut(friendReveal);
  return (
    <g transform={`translate(${(1 - k) * 90} 0) rotate(${(1 - k) * 4} ${x} ${y})`} opacity={Math.min(1, k * 2.4)}>
      <rect x={x} y={y + 12} width={w} height={h - 12} rx={18} fill={SLATE} stroke={INK4} strokeWidth={7} />
      <rect x={x + 14} y={y + 34} width={w - 28} height={h - 54} rx={8} fill={PAPER4} stroke={INK4} strokeWidth={3} />
      <rect x={x + w / 2 - 54} y={y - 4} width={108} height={44} rx={10} fill="#C9D3DF" stroke={INK4} strokeWidth={6} />
      <rect x={x + w / 2 - 30} y={y + 6} width={60} height={14} rx={6} fill="#6A7A90" />
      <Txt x={x + w / 2} y={y + 72} size={28} fill={BLUE} stroke={INK4} sw={0} spacing={4}>FRIEND TRICK</Txt>
      <path d={`M ${x + 26} ${y + 82} H ${x + w - 26}`} stroke={INK4} strokeWidth={2.5} strokeDasharray="4 8" opacity={0.45} />
      <g transform={`translate(${x + w * 0.17} ${cy + 6}) scale(${sc(flashOperand)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashOperand)} stroke={PAPER4} sw={6}>{`−${n}`}</Txt>
      </g>
      <Txt x={x + w * 0.34} y={cy + 2} size={58} fill={BLUE} stroke={PAPER4} sw={5}>=</Txt>
      <g transform={`translate(${x + w * 0.52} ${cy + 6}) scale(${sc(flashFriend)})`}>
        {rev < 0.02 ? (
          <g transform={`rotate(${Math.sin(t * 6) * 4})`}>
            <Txt x={0} y={0} size={fsz} fill={BLUE} stroke={PAPER4} sw={6}>+?</Txt>
          </g>
        ) : (
          <g transform={`scale(${0.5 + 0.5 * rev})`}>
            <Txt x={0} y={0} size={fsz} fill={hot(flashFriend)} stroke={PAPER4} sw={6}>{`+${friend}`}</Txt>
          </g>
        )}
      </g>
      <g transform={`translate(${x + w * 0.8} ${cy + 6}) scale(${sc(flashTen)})`}>
        <Txt x={0} y={0} size={fsz} fill={hot(flashTen)} stroke={PAPER4} sw={6}>−10</Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- the progress strip: clouds clearing

export const CloudStrip: React.FC<{ x: number; y: number; h: number; done: number; pulses: number[]; padOn: number; frame: number; fps: number }> = ({ x, y, h, done, pulses, padOn, frame, fps }) => {
  const t = frame / fps;
  const cy = y + h / 2;
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const lit = i < done;
        const pop = lit ? 1 + 0.3 * (pulses[i] ?? 0) : 1;
        return (
          <g key={i} transform={`translate(${x + 32 + i * 62} ${cy + 2}) scale(${pop})`}>
            {lit && (
              <g transform="translate(14 -14)">
                <circle r={13} fill="#FFE066" stroke={INK4} strokeWidth={3} />
              </g>
            )}
            <g transform="scale(0.34)">
              <ellipse cx={0} cy={0} rx={70} ry={30} fill={lit ? "#FFFFFF" : "#46546A"} stroke={INK4} strokeWidth={9} />
              <circle cx={-34} cy={-16} r={30} fill={lit ? "#FFFFFF" : "#46546A"} stroke={INK4} strokeWidth={9} />
              <circle cx={10} cy={-30} r={38} fill={lit ? "#FFFFFF" : "#46546A"} stroke={INK4} strokeWidth={9} />
              <circle cx={42} cy={-12} r={28} fill={lit ? "#FFFFFF" : "#46546A"} stroke={INK4} strokeWidth={9} />
              <ellipse cx={0} cy={0} rx={68} ry={28} fill={lit ? "#FFFFFF" : "#46546A"} />
              {!lit && <path d="M 4 -12 l -14 24 h 14 l -8 22 l 26 -32 h -16 l 10 -14 Z" fill="#FFD400" stroke={INK4} strokeWidth={5} strokeLinejoin="round" />}
            </g>
          </g>
        );
      })}
      <g transform={`translate(${x + 32 + 4 * 62 + 8} ${cy}) scale(${1 + 0.1 * Math.sin(t * 8) * padOn})`}>
        <rect x={-21} y={-21} width={42} height={42} rx={9} fill={padOn > 0.5 ? YEL : "#46546A"} stroke={INK4} strokeWidth={5} />
        <Txt x={0} y={9} size={26} fill={padOn > 0.5 ? INK4 : "#FFFFFF"} stroke={INK4} sw={0}>H</Txt>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- finale: a ring of bursting stars (the rescue is safe)

export const SafeBurst: React.FC<{ start: number; frame: number; fps: number }> = ({ start, frame, fps }) => {
  const d = frame - start;
  if (d < 0 || d > 120) return null;
  return (
    <g>
      {Array.from({ length: 26 }, (_, i) => {
        const x = 70 + ((i * 197) % 940);
        const u = d / fps - (i % 8) * 0.06;
        if (u < 0) return null;
        const y = 1080 - u * (380 + (i % 5) * 80) + u * u * 260;
        const col = ["#FFD400", "#4FB3FF", "#FFFFFF", "#5BE37A", "#FF8A00"][i % 5];
        return <circle key={i} cx={x} cy={y} r={10 + (i % 3) * 4} fill={col} stroke={INK4} strokeWidth={3} opacity={clamp01(1.4 - u)} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- the caption

const BARE = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const NUMS = new Set("zero one two three four five six seven eight nine ten twenty thirty forty thirtyseven twentyeight twentythree nineteen thirtysix twentynine fortyone thirtynine".split(" "));
const KEYS = new Set("friend friends ten ones tens rod stuck enough take away add alert storm chopper".split(" "));

export const BF4Caption: React.FC<{ phrase: TPhrase; wordIdx: number; top: number; height: number; width: number }> = ({ phrase, wordIdx, top, height, width }) => (
  <div style={{ position: "absolute", left: 0, top, width, height, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box" }}>
    <div
      style={{
        background: YEL,
        border: `7px solid ${INK4}`,
        borderRadius: 22,
        padding: "8px 28px 12px",
        textAlign: "center",
        boxShadow: `0 10px 0 ${INK4}`,
        fontFamily: KID_FONT,
        fontWeight: 700,
        fontSize: "inherit" as unknown as number,
        lineHeight: 1.16,
        color: INK4,
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
              borderRadius: 12,
              background: active ? INK4 : "transparent",
              color: active ? "#FFFFFF" : special ? (coming ? "#3F63C0" : "#0B3D91") : coming ? "#7A6200" : INK4,
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
