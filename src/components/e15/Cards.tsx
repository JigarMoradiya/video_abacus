// E15's teaching cards. Every card is a FIXED-SIZE box (`*_NAT`) scaled and placed by the caller, so one
// set of numbers governs the artwork and the overlap guard's box in both cuts — the same rule every card
// in the series follows.
//
//   FamilyFormula  +6 = −4 +10 (big friend) · −4 = +1 −5 (small friend) · +6 = +1 −5 +10 (the family),
//                  built one chip at a time on the spoken words, each chip in its otter's colour, a tiny
//                  otter head over each chip, and a glowing link once the three are together.
//   WhyTen         "plus ten adds four too many, so we take four away" — a bar of ten blocks, six of them
//                  the +6 we wanted and four the "too many", then the −4 that puts it right.
//   PatternTable   +6 / +7 / +8 / +9 each = +(n−5) −5 +10, with the two never-changing columns pulsing.
//   FingerRule     "up is the thumb, down is the index finger" as two hands.
//   SmallFriendPair  four and one, make five.
//   TitleCard      the hook's FAMILY TRICK sticker.
//
// COLOUR DISCIPLINE (measured, tools/contrast_audit.py): every chip is a bright part colour carrying DARK ink
// (#0B3B4A, 4.5:1 or better on all three); light text only ever sits on the dark ocean accent. Nothing is
// white-on-bright.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";
import { INK, PART_COLOURS } from "../cast/Otter";
import { useOverflowGuard } from "../../lib/overflowGuard";

export const ACCENT = "#0B6B7D";
export const FRIEND = "#C9B8FF";
export const NEUTRAL = "#FFFFFF";
export const SHADOW = "rgba(8,60,80,0.32)";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** The card shell: white, a dark-teal rim, a shadow, and a title pill that overlaps the top edge. */
export const Shell: React.FC<{ w: number; h: number; scale: number; title: string; titleColour?: string; children: React.ReactNode }> = ({ w, h, scale, title, titleColour = ACCENT, children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  useOverflowGuard(ref, title, 7 * scale + 4);
  return (
  <div ref={ref} style={{ width: w * scale, height: h * scale, position: "relative", fontFamily: KID_FONT }}>
    <div
      data-guard-ignore
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 34 * scale,
        background: "rgba(255,255,255,0.97)",
        border: `${7 * scale}px solid ${titleColour}`,
        boxSizing: "border-box",
        boxShadow: `0 ${10 * scale}px 0 ${SHADOW}`,
      }}
    />
    <div
      data-guard-ignore
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: -22 * scale,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        data-guard-title
        style={{
          background: titleColour,
          color: "#FFFFFF",
          fontSize: 30 * scale,
          fontWeight: 700,
          letterSpacing: 2 * scale,
          padding: `${6 * scale}px ${26 * scale}px ${8 * scale}px`,
          borderRadius: 999,
          boxShadow: `0 ${5 * scale}px 0 ${SHADOW}`,
        }}
      >
        {title}
      </div>
    </div>
    <div style={{ position: "absolute", inset: 0 }}>{children}</div>
  </div>
  );
};

/** A chip: rounded, bright, with dark ink; `flash` (0..1) lifts it and rings it white. */
export const Chip: React.FC<{ text: string; fill: string; w: number; h: number; size: number; k?: number; flash?: number; dim?: number; scale: number }> = ({ text, fill, w, h, size, k = 1, flash = 0, dim = 0, scale }) => (
  <div
    style={{
      width: w * scale,
      height: h * scale,
      borderRadius: 24 * scale,
      background: fill,
      color: INK,
      fontWeight: 700,
      fontSize: size * scale,
      whiteSpace: "pre-line",
      textAlign: "center",
      lineHeight: 1.05,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxSizing: "border-box",
      border: `${5 * scale}px solid ${flash > 0.05 ? "#FFFFFF" : INK}`,
      boxShadow: flash > 0.05 ? `0 0 0 ${5 * scale}px ${INK}, 0 0 ${26 * scale}px ${10 * scale}px rgba(255,236,150,0.9)` : `0 ${5 * scale}px 0 ${SHADOW}`,
      opacity: clamp01(k * 2.5) * (1 - 0.5 * dim),
      transform: `scale(${(0.55 + 0.45 * k) * (1 + 0.2 * flash) * (1 + 0.06 * Math.sin(k * Math.PI))}) translateY(${(1 - k) * 14 * scale}px)`,
      transformOrigin: "center bottom",
      filter: dim ? `saturate(${1 - 0.5 * dim})` : undefined,
    }}
  >
    {text}
  </div>
);

/** A dashed "?" placeholder under a chip that has not arrived yet, so a card is never an empty white box. */
const Ghosted: React.FC<{ k: number; scale: number; children: React.ReactNode }> = ({ k, scale, children }) => (
  <div style={{ position: "relative" }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 24 * scale,
        border: `${5 * scale}px dashed ${ACCENT}`,
        boxSizing: "border-box",
        opacity: 0.5 * (1 - clamp01(k * 2)),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 56 * scale,
        fontWeight: 700,
        color: ACCENT,
      }}
    >
      ?
    </div>
    {children}
  </div>
);

/** A tiny otter head: the visual tie between a chip and its otter. */
export const MiniHead: React.FC<{ role: "little" | "middle" | "big"; size: number }> = ({ role, size }) => {
  const f = { little: ["#C98F5A", "#FBEBD2"], middle: ["#A8703F", "#F8E2C4"], big: ["#7E4D2B", "#F2D9B8"] }[role];
  const col = PART_COLOURS[role];
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100">
      <circle cx={-32} cy={-30} r={13} fill={f[0]} />
      <circle cx={32} cy={-30} r={13} fill={f[0]} />
      <circle cx={0} cy={0} r={42} fill={f[0]} />
      <path d="M -34 -4 Q -32 -34 0 -34 Q 32 -34 34 -4 Q 34 26 0 30 Q -34 26 -34 -4 Z" fill={f[1]} />
      <circle cx={-15} cy={-6} r={6.5} fill={INK} />
      <circle cx={15} cy={-6} r={6.5} fill={INK} />
      <circle cx={-13} cy={-8.5} r={2.2} fill="#FFFFFF" />
      <circle cx={17} cy={-8.5} r={2.2} fill="#FFFFFF" />
      <ellipse cx={0} cy={9} rx={7} ry={5} fill={INK} />
      <path d="M -9 18 Q 0 25 9 18" stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d="M -40 34 Q 0 52 40 34 L 34 46 Q 0 58 -34 46 Z" fill={col} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------
// FamilyFormula
// ---------------------------------------------------------------------------------------------------

export const FAMILY_NAT = { w: 560, h: 310 };

export type FamilyMode = "big" | "small" | "family";

interface CellDef {
  text: string;
  fill: string;
  role?: "little" | "middle" | "big";
}

/** n = the number being added (6..9); the friend is 10−n and the small friend is n−5. */
export type FamilyDir = "plus" | "minus";

export const familyCells = (mode: FamilyMode, n: number, dir: FamilyDir = "plus"): CellDef[] => {
  const f = 10 - n;
  const s = n - 5;
  // E16, taking away: the mirror image. −n = +friend −10 · +friend = −small +5 · −n = −small +5 −10.
  if (dir === "minus") {
    if (mode === "big") return [{ text: `−${n}`, fill: NEUTRAL }, { text: `+${f}`, fill: FRIEND }, { text: "−10", fill: PART_COLOURS.big, role: "big" }];
    if (mode === "small") return [{ text: `+${f}`, fill: NEUTRAL }, { text: `−${s}`, fill: PART_COLOURS.little, role: "little" }, { text: "+5", fill: PART_COLOURS.middle, role: "middle" }];
    return [
      { text: `−${n}`, fill: NEUTRAL },
      { text: `−${s}`, fill: PART_COLOURS.little, role: "little" },
      { text: "+5", fill: PART_COLOURS.middle, role: "middle" },
      { text: "−10", fill: PART_COLOURS.big, role: "big" },
    ];
  }
  if (mode === "big") return [{ text: `+${n}`, fill: NEUTRAL }, { text: `−${f}`, fill: FRIEND }, { text: "+10", fill: PART_COLOURS.big, role: "big" }];
  if (mode === "small") return [{ text: `−${f}`, fill: NEUTRAL }, { text: `+${s}`, fill: PART_COLOURS.little, role: "little" }, { text: "−5", fill: PART_COLOURS.middle, role: "middle" }];
  return [
    { text: `+${n}`, fill: NEUTRAL },
    { text: `+${s}`, fill: PART_COLOURS.little, role: "little" },
    { text: "−5", fill: PART_COLOURS.middle, role: "middle" },
    { text: "+10", fill: PART_COLOURS.big, role: "big" },
  ];
};

const FAMILY_TITLE: Record<FamilyMode, string> = { big: "BIG FRIEND", small: "SMALL FRIEND", family: "THE FAMILY TRICK" };

export const FamilyFormula: React.FC<{
  mode: FamilyMode;
  n: number;
  /** per cell (0 = the left-hand side, then the parts), 0..1: how far each chip has popped in */
  cellK: number[];
  /** the cell being SPOKEN right now, 0..1 */
  flash?: { cell: number; k: number };
  /** which part is being WORKED (cell index) — the others dim */
  lit?: number;
  /** 0..1: the three parts are now joined by paws */
  link?: number;
  scale?: number;
  frame: number;
  /** "minus" = the taking-away family (E16); default is the adding family */
  dir?: FamilyDir;
  /** override the card's title pill */
  title?: string;
}> = ({ mode, n, cellK, flash, lit, link = 0, scale = 1, frame, dir = "plus", title }) => {
  const cells = familyCells(mode, n, dir);
  const CW = mode === "family" ? 104 : 124;
  const CH = 96;
  const eqW = 40;
  return (
    <Shell w={FAMILY_NAT.w} h={FAMILY_NAT.h} scale={scale} title={title ?? FAMILY_TITLE[mode]}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 66 * scale,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 10 * scale,
        }}
      >
        {cells.map((c, i) => {
          const k = cellK[i] ?? 0;
          const isLit = lit === undefined ? 0 : lit === i ? 1 : 0;
          const dim = lit !== undefined && lit !== i && i > 0 ? 1 : 0;
          return (
            <React.Fragment key={i}>
              {i === 1 && (
                <div style={{ width: eqW * scale, height: CH * scale, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 * scale, fontWeight: 700, color: ACCENT, opacity: 1 }}>
                  =
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * scale }}>
                <div style={{ height: 56 * scale, opacity: c.role ? clamp01(k * 2.5) : 0, transform: `translateY(${-6 * Math.abs(Math.sin(frame * 0.18 + i)) * (isLit ? 1 : 0.0) * scale}px)` }}>
                  {c.role && <MiniHead role={c.role} size={56 * scale} />}
                </div>
                <div style={{ position: "relative" }}>
                  {/* the ghost of the chip still to come, so the card is never an empty white box */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 24 * scale,
                      border: `${5 * scale}px dashed ${ACCENT}`,
                      boxSizing: "border-box",
                      opacity: 0.5 * (1 - clamp01(k * 2)),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 56 * scale,
                      fontWeight: 700,
                      color: ACCENT,
                    }}
                  >
                    ?
                  </div>
                  <Chip text={c.text} fill={c.fill} w={CW} h={CH} size={mode === "family" ? 58 : 64} k={k} flash={flash && flash.cell === i ? flash.k : 0} dim={dim} scale={scale} />
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {/* the paws that join the three parts of the family */}
      {mode === "family" && link > 0.02 && (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={FAMILY_NAT.w * scale} height={FAMILY_NAT.h * scale} viewBox={`0 0 ${FAMILY_NAT.w} ${FAMILY_NAT.h}`}>
          {[0, 1].map((i) => {
            const x = 262 + i * 114 + 10;
            return (
              <g key={i} transform={`translate(${x + 40} 200)`} opacity={link}>
                <circle r={20 + 3 * Math.sin(frame * 0.3 + i)} fill="#FFE27A" opacity={0.5} />
                <circle r={12} fill="#FFE27A" stroke={INK} strokeWidth={3} />
              </g>
            );
          })}
          <path d="M 270 250 q 60 34 120 0 q 60 34 120 0" stroke={ACCENT} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 14" opacity={link} />
        </svg>
      )}
    </Shell>
  );
};

// ---------------------------------------------------------------------------------------------------
// WhyTen
// ---------------------------------------------------------------------------------------------------

export const WHY_NAT = { w: 560, h: 330 };

export const WhyTen: React.FC<{
  n: number;
  /** 0 = the title only, 1 = the bar of ten, 2 = the "too many" blocks light, 3 = the minus chip arrives */
  step: number;
  /** per step, 0..1 — how far the newest step has animated */
  k: number;
  scale?: number;
  frame: number;
}> = ({ n, step, k, scale = 1, frame }) => {
  const extra = 10 - n;
  const e1 = step >= 1 ? (step === 1 ? k : 1) : 0;
  const e2 = step >= 2 ? (step === 2 ? k : 1) : 0;
  const e3 = step >= 3 ? (step === 3 ? k : 1) : 0;
  const BW = 44;
  const BH = 46;
  return (
    <Shell w={WHY_NAT.w} h={WHY_NAT.h} scale={scale} title="WHY DOES IT WORK?">
      <div style={{ position: "absolute", left: 28 * scale, right: 28 * scale, top: 62 * scale, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * scale }}>
        {/* +10 label */}
        <div style={{ opacity: e1, transform: `translateY(${(1 - e1) * 10}px)` }}>
          <Chip text="+10" fill={PART_COLOURS.big} w={110} h={64} size={42} scale={scale} k={e1} />
        </div>
        {/* the bar of ten blocks */}
        <div style={{ display: "flex", gap: 4 * scale, opacity: e1 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const tooMany = i >= n;
            const lift = tooMany ? e2 * 14 : 0;
            const gone = tooMany ? e3 : 0;
            return (
              <div
                key={i}
                style={{
                  width: BW * scale,
                  height: BH * scale,
                  borderRadius: 10 * scale,
                  background: tooMany ? (e2 > 0.05 ? PART_COLOURS.middle : "#9ADCE6") : "#9ADCE6",
                  border: `${4 * scale}px solid ${INK}`,
                  boxSizing: "border-box",
                  transform: `translateY(${-lift * scale + gone * 18 * scale}px) scale(${1 - gone * 0.6})`,
                  opacity: 1 - gone * 0.75,
                  boxShadow: tooMany && e2 > 0.05 ? `0 0 ${14 * scale}px ${3 * scale}px rgba(255,122,102,0.8)` : undefined,
                }}
              />
            );
          })}
        </div>
        {/* the labels under the two groups */}
        <div style={{ display: "flex", width: (BW * 10 + 4 * 9) * scale, justifyContent: "flex-start", opacity: e1 }}>
          <div style={{ width: (BW + 4) * n * scale - 4 * scale, textAlign: "center", fontWeight: 700, fontSize: 28 * scale, color: INK }}>{`+${n} we wanted`}</div>
          <div style={{ width: (BW + 4) * extra * scale, textAlign: "center", fontWeight: 700, fontSize: 28 * scale, color: "#B6402F", opacity: e2 }}>{`${extra} too many`}</div>
        </div>
        {/* the fix */}
        <div style={{ opacity: e3, transform: `scale(${0.7 + 0.3 * e3})`, display: "flex", alignItems: "center", gap: 14 * scale, marginTop: 6 * scale }}>
          <div style={{ fontWeight: 700, fontSize: 30 * scale, color: INK }}>so take</div>
          <Chip text={`−${extra}`} fill={PART_COLOURS.middle} w={110} h={64} size={42} scale={scale} k={e3} flash={0} />
          <div style={{ fontWeight: 700, fontSize: 30 * scale, color: INK }}>away</div>
        </div>
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------------------------------
// PatternTable
// ---------------------------------------------------------------------------------------------------

export const PATTERN_NAT = { w: 560, h: 410 };

export const PatternTable: React.FC<{
  /** rows shown, 0..4 (the +6, +7, +8, +9 rows, in that order) */
  rows: number;
  /** the row being spoken, if any */
  active?: number;
  /** which cell of the active row is being spoken: 0 lhs, 1 lower beads */
  flash?: { row: number; cell: number; k: number };
  /** 0..1: the two never-changing columns (−5, +10) glow */
  constants?: number;
  /** show the generic row "+n = +? −5 +10" on the title line */
  generic?: boolean;
  arriving?: number;
  scale?: number;
  frame: number;
  dir?: FamilyDir;
}> = ({ rows, active, flash, constants = 0, generic = false, arriving = 1, scale = 1, frame, dir = "plus" }) => {
  const sg = dir === "minus" ? "−" : "+";
  const fiveT = dir === "minus" ? "+5" : "−5";
  const tenT = dir === "minus" ? "−10" : "+10";
  const ns = [6, 7, 8, 9];
  const CW = 104;
  const CH = 58;
  const pulse = constants * (0.5 + 0.5 * Math.sin(frame * 0.3));
  return (
    <Shell w={PATTERN_NAT.w} h={PATTERN_NAT.h} scale={scale} title="FAMILY FORMULAS">
      <div style={{ position: "absolute", left: 0, right: 0, top: 62 * scale, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 * scale }}>
        {generic && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 * scale }}>
            <Chip text={`${sg}n`} fill={NEUTRAL} w={CW} h={CH} size={40} scale={scale} k={arriving} />
            <div style={{ fontSize: 40 * scale, fontWeight: 700, color: ACCENT }}>=</div>
            <Chip text={`${sg} ?`} fill={PART_COLOURS.little} w={CW} h={CH} size={40} scale={scale} k={arriving} />
            <Chip text={fiveT} fill={PART_COLOURS.middle} w={CW} h={CH} size={40} scale={scale} k={arriving} flash={pulse} />
            <Chip text={tenT} fill={PART_COLOURS.big} w={CW} h={CH} size={40} scale={scale} k={arriving} flash={pulse} />
          </div>
        )}
        {ns.map((n, i) => {
          const k = clamp01(rows - i);
          const isActive = active === i;
          const dim = active !== undefined && !isActive ? 1 : 0;
          return (
            <div key={n} style={{ position: "relative" }}>
              {/* the ghost of a row still to come */}
              <div style={{ position: "absolute", left: 4 * scale, right: 4 * scale, top: 0, bottom: 0, borderRadius: 24 * scale, border: `${4 * scale}px dashed ${ACCENT}`, opacity: 0.35 * (1 - clamp01(k * 3)), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 * scale, fontWeight: 700, color: ACCENT }}>
                {`${sg}${n} = ?`}
              </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 * scale, opacity: clamp01(k * 3), transform: `translateX(${(1 - k) * -40 * scale}px)` }}>
              <Chip text={`${sg}${n}`} fill={NEUTRAL} w={CW} h={CH} size={44} scale={scale} k={1} flash={flash && flash.row === i && flash.cell === 0 ? flash.k : 0} dim={dim * 0.7} />
              <div style={{ fontSize: 40 * scale, fontWeight: 700, color: ACCENT, opacity: 1 - dim * 0.5 }}>=</div>
              <Chip text={`${sg}${n - 5}`} fill={PART_COLOURS.little} w={CW} h={CH} size={44} scale={scale} k={1} flash={flash && flash.row === i && flash.cell === 1 ? flash.k : 0} dim={dim * 0.7} />
              <Chip text={fiveT} fill={PART_COLOURS.middle} w={CW} h={CH} size={44} scale={scale} k={1} flash={pulse} dim={dim * 0.7} />
              <Chip text={tenT} fill={PART_COLOURS.big} w={CW} h={CH} size={44} scale={scale} k={1} flash={pulse} dim={dim * 0.7} />
            </div>
            </div>
          );
        })}
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------------------------------
// FingerRule
// ---------------------------------------------------------------------------------------------------

export const FINGER_NAT = { w: 560, h: 300 };

const HandIcon: React.FC<{ digit: "thumb" | "index"; size: number }> = ({ digit, size }) => (
  <svg width={size} height={size} viewBox="-60 -70 120 140">
    {/* a fist with ONE digit out: the thumb straight up, or the index finger straight down */}
    <rect x={-34} y={digit === "thumb" ? -10 : -36} width={68} height={62} rx={22} fill="#F6C39B" stroke="#B87A50" strokeWidth={4} />
    <path d="M -34 6 H 34 M -34 22 H 34" stroke="#E0A176" strokeWidth={3} strokeLinecap="round" opacity={0.7} />
    {digit === "thumb" ? (
      <g>
        <rect x={-10} y={-62} width={24} height={64} rx={12} fill="#F6C39B" stroke="#B87A50" strokeWidth={4} />
        <path d="M -3 -52 q 4 -4 8 0" stroke="#E0A176" strokeWidth={3} fill="none" />
      </g>
    ) : (
      <g>
        <rect x={-12} y={26} width={22} height={50} rx={11} fill="#F6C39B" stroke="#B87A50" strokeWidth={4} transform="translate(0 -6)" />
      </g>
    )}
  </svg>
);

export const FingerRule: React.FC<{ flash?: { which: "thumb" | "index"; k: number }; k1?: number; k2?: number; scale?: number; frame: number }> = ({ flash, scale = 1, frame }) => {
  // TWO CLEAN ROWS, content from the first frame: [arrow][hand] UP = THUMB / [arrow][hand] DOWN = INDEX FINGER
  const row = (digit: "thumb" | "index", head: string, tail: string, fill: string) => {
    const f = flash && flash.which === digit ? flash.k : 0;
    const up = digit === "thumb";
    return (
      <div
        style={{
          width: 500 * scale,
          height: 96 * scale,
          boxSizing: "border-box",
          borderRadius: 26 * scale,
          background: fill,
          border: `${5 * scale}px solid ${f > 0.05 ? "#FFFFFF" : INK}`,
          boxShadow: f > 0.05 ? `0 0 0 ${5 * scale}px ${INK}, 0 0 ${24 * scale}px ${8 * scale}px rgba(255,236,150,0.9)` : `0 ${5 * scale}px 0 ${SHADOW}`,
          display: "flex",
          alignItems: "center",
          padding: `0 ${16 * scale}px`,
          gap: 12 * scale,
          fontWeight: 700,
          color: INK,
          transform: `scale(${1 + 0.04 * f})`,
        }}
      >
        <div style={{ width: 44 * scale, display: "flex", justifyContent: "center", fontSize: 54 * scale, lineHeight: 1, transform: `translateY(${(up ? -1 : 1) * 5 * Math.abs(Math.sin(frame * 0.2)) * scale}px)` }}>{up ? "↑" : "↓"}</div>
        <HandIcon digit={digit} size={68 * scale} />
        <div style={{ fontSize: 34 * scale, lineHeight: 1, whiteSpace: "nowrap" }}>
          {head} <span style={{ opacity: 0.8 }}>=</span> {tail}
        </div>
      </div>
    );
  };
  return (
    <Shell w={FINGER_NAT.w} h={FINGER_NAT.h} scale={scale} title="UP AND DOWN">
      <div style={{ position: "absolute", left: 0, right: 0, top: 62 * scale, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 * scale }}>
        {row("thumb", "UP", "THUMB", "#FFE08A")}
        {row("index", "DOWN", "INDEX FINGER", "#BFEFFF")}
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------------------------------
// SmallFriendPair
// ---------------------------------------------------------------------------------------------------

export const SMALL_NAT = { w: 560, h: 260 };

export const SmallFriendPair: React.FC<{
  a: number;
  b: number;
  /** per cell [a, b, sum], 0..1 */
  cellK: number[];
  flash?: { cell: number; k: number };
  scale?: number;
}> = ({ a, b, cellK, flash, scale = 1 }) => (
  <Shell w={SMALL_NAT.w} h={SMALL_NAT.h} scale={scale} title="SMALL FRIENDS">
    <div style={{ position: "absolute", left: 0, right: 0, top: 78 * scale, display: "flex", justifyContent: "center", alignItems: "center", gap: 14 * scale }}>
      <Ghosted k={cellK[0] ?? 0} scale={scale}><Chip text={`${a}`} fill={PART_COLOURS.little} w={120} h={110} size={76} scale={scale} k={cellK[0] ?? 0} flash={flash?.cell === 0 ? flash.k : 0} /></Ghosted>
      <div style={{ fontSize: 56 * scale, fontWeight: 700, color: ACCENT, opacity: clamp01((cellK[1] ?? 0) * 3) }}>+</div>
      <Ghosted k={cellK[1] ?? 0} scale={scale}><Chip text={`${b}`} fill={PART_COLOURS.middle} w={120} h={110} size={76} scale={scale} k={cellK[1] ?? 0} flash={flash?.cell === 1 ? flash.k : 0} /></Ghosted>
      <div style={{ fontSize: 56 * scale, fontWeight: 700, color: ACCENT, opacity: clamp01((cellK[2] ?? 0) * 3) }}>=</div>
      <Ghosted k={cellK[2] ?? 0} scale={scale}><Chip text={`${a + b}`} fill="#FFFFFF" w={120} h={110} size={76} scale={scale} k={cellK[2] ?? 0} flash={flash?.cell === 2 ? flash.k : 0} /></Ghosted>
    </div>
  </Shell>
);

// ---------------------------------------------------------------------------------------------------
// TitleCard — the hook's sticker
// ---------------------------------------------------------------------------------------------------

export const TITLE_NAT = { w: 900, h: 300 };

export const TitleCard: React.FC<{ k: number; plusMinus: number; frame: number; scale?: number }> = ({ k, plusMinus, frame, scale = 1 }) => (
  <div
    style={{
      width: TITLE_NAT.w * scale,
      height: TITLE_NAT.h * scale,
      position: "relative",
      fontFamily: KID_FONT,
      transform: `scale(${0.5 + 0.5 * k}) rotate(${(1 - k) * -6}deg)`,
      opacity: clamp01(k * 3),
    }}
  >
    <div style={{ position: "absolute", inset: 0, borderRadius: 60 * scale, background: "#FFF6D6", border: `${9 * scale}px solid ${ACCENT}`, boxSizing: "border-box", boxShadow: `0 ${14 * scale}px 0 ${SHADOW}` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 28 * scale, textAlign: "center", fontSize: 108 * scale, fontWeight: 700, color: INK, letterSpacing: 2 * scale, lineHeight: 1 }}>
      FAMILY TRICK
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 28 * scale, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 * scale }}>
      <Chip text="+ ADD" fill={PART_COLOURS.little} w={230} h={86} size={46} scale={scale} k={clamp01(plusMinus * 2)} />
      <div style={{ fontSize: 46 * scale, fontWeight: 700, color: ACCENT, opacity: clamp01(plusMinus * 3) }}>and</div>
      <Chip text="− TAKE" fill={PART_COLOURS.middle} w={230} h={86} size={46} scale={scale} k={clamp01(plusMinus * 2 - 0.4)} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------------------------------
// TeamCard — "the big friend and the small friend, working together" -> "the family"; and the WHEN card
// ---------------------------------------------------------------------------------------------------

export const TEAM_NAT = { w: 560, h: 300 };

/** mode "team": two chips that slide together into THE FAMILY. mode "when": "BIG FRIEND STUCK -> CALL THE FAMILY". */
export const TeamCard: React.FC<{
  mode: "team" | "when";
  /** per chip 0..1 pop-in [first, second] */
  chipK: [number, number];
  /** 0..1 team: the two chips have slid together and the banner reads THE FAMILY. when: the arrow has fired */
  merge: number;
  flash?: { cell: 0 | 1; k: number };
  scale?: number;
  frame: number;
}> = ({ mode, chipK, merge, flash, scale = 1, frame }) => {
  const when = mode === "when";
  const g = when ? 84 : 60 * (1 - merge) + 8; // the gap between the two chips: holds the "+" or the arrow, closes when they merge
  const a = when ? "BIG FRIEND\nSTUCK" : "BIG\nFRIEND";
  const b = when ? "CALL THE\nFAMILY" : "SMALL\nFRIEND";
  const fillA = when ? "#FFD9D2" : PART_COLOURS.big;
  const fillB = PART_COLOURS.little;
  const title = when ? "WHEN?" : merge > 0.6 ? "THE FAMILY" : "WORKING TOGETHER";
  const W2 = 200;
  return (
    <Shell w={TEAM_NAT.w} h={TEAM_NAT.h} scale={scale} title={title}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 70 * scale, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Ghosted k={chipK[0]} scale={scale}><Chip text={a} fill={fillA} w={W2} h={150} size={when ? 34 : 40} k={chipK[0]} flash={flash?.cell === 0 ? flash.k : 0} scale={scale} /></Ghosted>
        <div style={{ position: "relative", width: g * scale, height: 150 * scale }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: (when ? 64 : 62) * scale, fontWeight: 700, color: ACCENT, opacity: clamp01(chipK[1] * 3) * (when ? 1 : 1 - merge), transform: when ? `translateX(${Math.sin(frame * 0.3) * 3 * scale}px)` : undefined }}>
            {when ? "→" : "+"}
          </div>
        </div>
        <Ghosted k={chipK[1]} scale={scale}><Chip text={b} fill={fillB} w={W2} h={150} size={when ? 34 : 40} k={chipK[1]} flash={flash?.cell === 1 ? flash.k : 0} scale={scale} /></Ghosted>
      </div>
      {!when && merge > 0.05 && (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={TEAM_NAT.w * scale} height={TEAM_NAT.h * scale} viewBox={`0 0 ${TEAM_NAT.w} ${TEAM_NAT.h}`} opacity={merge}>
          <circle cx={280} cy={146} r={24 + 4 * Math.sin(frame * 0.3)} fill="#FFE27A" opacity={0.55} />
          <circle cx={280} cy={146} r={15} fill="#FFE27A" stroke={INK} strokeWidth={3.5} />
        </svg>
      )}
    </Shell>
  );
};

// ---------------------------------------------------------------------------------------------------
// EighteenBadge (p1) and PlusMinusPair (p3) — the hook's two small cards
// ---------------------------------------------------------------------------------------------------

export const EighteenBadge: React.FC<{ k: number; frame: number; scale?: number }> = ({ k, frame, scale = 1 }) => (
  <div style={{ width: 420 * scale, height: 330 * scale, position: "relative", fontFamily: KID_FONT, opacity: clamp01(k * 3), transform: `scale(${0.4 + 0.6 * Math.min(1, k * 1.2)}) rotate(${(1 - k) * 12}deg)` }}>
    <svg width={420 * scale} height={330 * scale} viewBox="0 0 420 330" style={{ position: "absolute" }}>
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2 + frame * 0.01;
        return <circle key={i} cx={210 + Math.cos(a) * 176} cy={165 + Math.sin(a) * 136} r={9} fill={i % 3 === 0 ? PART_COLOURS.little : i % 3 === 1 ? PART_COLOURS.middle : PART_COLOURS.big} stroke={INK} strokeWidth={3} />;
      })}
      <ellipse cx={210} cy={165} rx={158} ry={118} fill="#FFFFFF" stroke={ACCENT} strokeWidth={9} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 36 * scale, textAlign: "center", fontSize: 150 * scale, fontWeight: 700, color: INK, lineHeight: 1 }}>18</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 200 * scale, textAlign: "center", fontSize: 44 * scale, fontWeight: 700, color: ACCENT, letterSpacing: 2 * scale }}>FORMULAS</div>
  </div>
);

export const PlusMinusPair: React.FC<{ k1: number; k2: number; join: number; scale?: number; frame: number }> = ({ k1, k2, join, scale = 1, frame }) => (
  <div style={{ display: "flex", alignItems: "center", gap: (28 - 14 * join) * scale, fontFamily: KID_FONT, transform: `scale(${1 + 0.05 * join * Math.sin(frame * 0.3)})` }}>
    <Chip text="+ ADD" fill={PART_COLOURS.little} w={250} h={104} size={54} scale={scale} k={k1} />
    <div style={{ fontSize: 54 * scale, fontWeight: 700, color: "#FFFFFF", textShadow: `0 ${4 * scale}px 0 ${INK}`, opacity: clamp01(k2 * 3) }}>and</div>
    <Chip text="− TAKE" fill={PART_COLOURS.middle} w={250} h={104} size={54} scale={scale} k={k2} />
  </div>
);
