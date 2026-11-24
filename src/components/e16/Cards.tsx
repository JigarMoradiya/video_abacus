// E16's own cards (taking away with the family). Shell/Chip/colours come from E15's card kit so the two episodes read as
// one set; every card is a FIXED-SIZE box (`*_NAT`) scaled and placed by the caller.
//
//   RoutineCard   LOOK · CALL · MOVE, three rows, each lit on its spoken word.
//   MirrorCard    two formula rows with a mirror line between them: LAST TIME (+6 = +1 −5 +10) over TODAY (−6 = −1 +5 −10),
//                 or, generic, PLUS FAMILY over MINUS FAMILY. The signs flip on "Every sign flipped!".
//   WhyMinus      "minus ten takes four too many" — a bar of ten blocks, six we wanted gone, four too many, then +4 back.
//   PuzzleCard    the hook's "11 − 6 = ?".
//   E16Title      the hook's FAMILY TRICK sticker, with a single − TAKING AWAY chip.

import React from "react";
import { KID_FONT } from "../../lib/fonts";
import { INK, PART_COLOURS } from "../cast/Otter";
import { ACCENT, Chip, NEUTRAL, SHADOW, Shell } from "../e15/Cards";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------------------------------------------------------------------------------------------------
export const ROUTINE_NAT = { w: 560, h: 330 };

const ROUTINE_ROWS: { word: string; text: string; fill: string }[] = [
  { word: "LOOK", text: "room on the ones rod?", fill: "#FFE08A" },
  { word: "CALL", text: "no room? call the family", fill: PART_COLOURS.big },
  { word: "MOVE", text: "ones rod first", fill: PART_COLOURS.middle },
];

export const RoutineCard: React.FC<{
  /** per row 0..1 pop-in */
  rowK: number[];
  /** the row being spoken right now */
  flash?: { row: number; k: number };
  scale?: number;
  frame: number;
}> = ({ rowK, flash, scale = 1 }) => (
  <Shell w={ROUTINE_NAT.w} h={ROUTINE_NAT.h} scale={scale} title="LOOK · CALL · MOVE">
    <div style={{ position: "absolute", left: 0, right: 0, top: 64 * scale, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * scale }}>
      {ROUTINE_ROWS.map((r, i) => {
        const k = rowK[i] ?? 0;
        const f = flash && flash.row === i ? flash.k : 0;
        return (
          <div key={r.word} style={{ display: "flex", alignItems: "center", gap: 12 * scale, width: 500 * scale, opacity: clamp01(k * 3), transform: `translateX(${(1 - k) * -30 * scale}px)` }}>
            <Chip text={r.word} fill={r.fill} w={150} h={74} size={38} scale={scale} k={1} flash={f} />
            <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 27 * scale, color: INK, lineHeight: 1.05, whiteSpace: "nowrap" }}>{r.text}</div>
          </div>
        );
      })}
    </div>
  </Shell>
);

// ---------------------------------------------------------------------------------------------------
export const MIRROR_NAT = { w: 560, h: 340 };

export interface MirrorRow {
  label: string;
  cells: { text: string; fill: string }[]; // 5: lhs, then four… (lhs, little, middle, big) = 4 cells
}

export const MirrorCard: React.FC<{
  title: string;
  rows: [MirrorRow, MirrorRow];
  /** per row, per cell 0..1 */
  kA: number[];
  kB: number[];
  /** 0..1: the signs flip (arrows between the rows glow, the mirror line pulses) */
  flip: number;
  flash?: { row: number; cell: number; k: number };
  scale?: number;
  frame: number;
}> = ({ title, rows, kA, kB, flip, flash, scale = 1, frame }) => {
  const CW = 96;
  const CH = 62;
  const pulse = flip * (0.5 + 0.5 * Math.sin(frame * 0.3));
  const line = (row: MirrorRow, ks: number[], ri: number) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 * scale }}>
      <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 26 * scale, color: ACCENT, letterSpacing: 1 * scale, opacity: clamp01((ks[0] ?? 0) * 3) }}>{row.label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 * scale }}>
        {row.cells.map((c, i) => (
          <React.Fragment key={i}>
            {i === 1 && <div style={{ fontFamily: KID_FONT, fontSize: 38 * scale, fontWeight: 700, color: ACCENT, width: 28 * scale, textAlign: "center", opacity: clamp01((ks[0] ?? 0) * 3) }}>=</div>}
            <Chip text={c.text} fill={c.fill} w={CW} h={CH} size={42} scale={scale} k={ks[i] ?? 0} flash={flash && flash.row === ri && flash.cell === i ? flash.k : 0} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
  return (
    <Shell w={MIRROR_NAT.w} h={MIRROR_NAT.h} scale={scale} title={title}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 58 * scale, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        {line(rows[0], kA, 0)}
        {/* the mirror line, with one flip arrow under each sign */}
        <div style={{ position: "relative", width: 480 * scale, height: 44 * scale }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 21 * scale, height: 0, borderTop: `${4 * scale}px dashed ${ACCENT}`, opacity: 0.45 + 0.5 * flip }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, display: "flex", justifyContent: "center", gap: 8 * scale, paddingLeft: 0 }}>
            {[0, 1, 2, 3].map((i) => (
              <React.Fragment key={i}>
                {i === 1 && <div style={{ width: 28 * scale }} />}
                <div style={{ width: CW * scale, textAlign: "center", fontFamily: KID_FONT, fontWeight: 700, fontSize: 38 * scale, color: "#C2410C", opacity: flip > 0.02 ? clamp01(flip * 2 - i * 0.12) : 0, transform: `scale(${1 + 0.2 * pulse})` }}>⇅</div>
              </React.Fragment>
            ))}
          </div>
        </div>
        {line(rows[1], kB, 1)}
      </div>
    </Shell>
  );
};

/** the two real rows, last time and today, for one n (6..9) */
export const mirrorRowsFor = (n: number): [MirrorRow, MirrorRow] => {
  const s = n - 5;
  return [
    {
      label: "LAST TIME · ADDING",
      cells: [{ text: `+${n}`, fill: NEUTRAL }, { text: `+${s}`, fill: PART_COLOURS.little }, { text: "−5", fill: PART_COLOURS.middle }, { text: "+10", fill: PART_COLOURS.big }],
    },
    {
      label: "TODAY · TAKING AWAY",
      cells: [{ text: `−${n}`, fill: NEUTRAL }, { text: `−${s}`, fill: PART_COLOURS.little }, { text: "+5", fill: PART_COLOURS.middle }, { text: "−10", fill: PART_COLOURS.big }],
    },
  ];
};

/** the generic recap rows: plus family over minus family */
export const flipRows = (): [MirrorRow, MirrorRow] => [
  {
    label: "PLUS FAMILY · UP",
    cells: [{ text: "+n", fill: NEUTRAL }, { text: "+ ?", fill: PART_COLOURS.little }, { text: "−5", fill: PART_COLOURS.middle }, { text: "+10", fill: PART_COLOURS.big }],
  },
  {
    label: "MINUS FAMILY · DOWN",
    cells: [{ text: "−n", fill: NEUTRAL }, { text: "− ?", fill: PART_COLOURS.little }, { text: "+5", fill: PART_COLOURS.middle }, { text: "−10", fill: PART_COLOURS.big }],
  },
];

// ---------------------------------------------------------------------------------------------------
export const WHYM_NAT = { w: 560, h: 330 };

export const WhyMinus: React.FC<{
  n: number;
  /** 0 = title only, 1 = the bar of ten + "−10", 2 = the "too many" blocks light, 3 = "+4 back" arrives */
  step: number;
  k: number;
  scale?: number;
  frame: number;
}> = ({ n, step, k, scale = 1 }) => {
  const extra = 10 - n;
  const e1 = step >= 1 ? (step === 1 ? k : 1) : 0;
  const e2 = step >= 2 ? (step === 2 ? k : 1) : 0;
  const e3 = step >= 3 ? (step === 3 ? k : 1) : 0;
  const BW = 44;
  const BH = 46;
  return (
    <Shell w={WHYM_NAT.w} h={WHYM_NAT.h} scale={scale} title="WHY DOES IT WORK?">
      <div style={{ position: "absolute", left: 28 * scale, right: 28 * scale, top: 62 * scale, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * scale }}>
        <div style={{ opacity: e1, transform: `translateY(${(1 - e1) * 10}px)` }}>
          <Chip text="−10" fill={PART_COLOURS.big} w={110} h={64} size={42} scale={scale} k={e1} />
        </div>
        <div style={{ display: "flex", gap: 4 * scale, opacity: e1 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const tooMany = i >= n;
            return (
              <div
                key={i}
                style={{
                  width: BW * scale,
                  height: BH * scale,
                  borderRadius: 10 * scale,
                  background: tooMany && e2 > 0.05 ? PART_COLOURS.middle : "#9ADCE6",
                  border: `${4 * scale}px solid ${INK}`,
                  boxSizing: "border-box",
                  transform: `translateY(${tooMany ? -e2 * 14 * scale + e3 * 14 * scale : 0}px)`,
                  boxShadow: tooMany && e2 > 0.05 && e3 < 0.5 ? `0 0 ${14 * scale}px ${3 * scale}px rgba(255,122,102,0.8)` : undefined,
                }}
              />
            );
          })}
        </div>
        <div style={{ display: "flex", width: (BW * 10 + 4 * 9) * scale, justifyContent: "flex-start", opacity: e1 }}>
          <div style={{ width: (BW + 4) * n * scale - 4 * scale, textAlign: "center", fontWeight: 700, fontSize: 28 * scale, color: INK }}>{`−${n} we wanted`}</div>
          <div style={{ width: (BW + 4) * extra * scale, textAlign: "center", fontWeight: 700, fontSize: 28 * scale, color: "#B6402F", opacity: e2 }}>{`${extra} too many`}</div>
        </div>
        <div style={{ opacity: e3, transform: `scale(${0.7 + 0.3 * e3})`, display: "flex", alignItems: "center", gap: 14 * scale, marginTop: 6 * scale }}>
          <div style={{ fontWeight: 700, fontSize: 30 * scale, color: INK }}>so add</div>
          <Chip text={`+${extra}`} fill={PART_COLOURS.little} w={110} h={64} size={42} scale={scale} k={e3} />
          <div style={{ fontWeight: 700, fontSize: 30 * scale, color: INK }}>back first</div>
        </div>
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------------------------------
export const PUZZLE_NAT = { w: 640, h: 270 };

export const PuzzleCard: React.FC<{ k: number; frame: number; scale?: number }> = ({ k, frame, scale = 1 }) => (
  <div
    style={{
      width: PUZZLE_NAT.w * scale,
      height: PUZZLE_NAT.h * scale,
      position: "relative",
      fontFamily: KID_FONT,
      transform: `scale(${0.5 + 0.5 * k}) rotate(${(1 - k) * 6}deg)`,
      opacity: clamp01(k * 3),
    }}
  >
    <div style={{ position: "absolute", inset: 0, borderRadius: 56 * scale, background: "#FFF6D6", border: `${9 * scale}px solid ${ACCENT}`, boxSizing: "border-box", boxShadow: `0 ${14 * scale}px 0 ${SHADOW}` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 22 * scale, textAlign: "center", fontSize: 38 * scale, fontWeight: 700, color: ACCENT, letterSpacing: 4 * scale }}>PUZZLE</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 70 * scale, textAlign: "center", fontSize: 130 * scale, fontWeight: 700, color: INK, lineHeight: 1, transform: `translateY(${Math.sin(frame * 0.12) * 3 * scale}px)` }}>
      11 − 6 = ?
    </div>
  </div>
);

// ---------------------------------------------------------------------------------------------------
export const E16TITLE_NAT = { w: 900, h: 300 };

export const E16Title: React.FC<{ k: number; chipK: number; frame: number; scale?: number }> = ({ k, chipK, scale = 1 }) => (
  <div
    style={{
      width: E16TITLE_NAT.w * scale,
      height: E16TITLE_NAT.h * scale,
      position: "relative",
      fontFamily: KID_FONT,
      transform: `scale(${0.5 + 0.5 * k}) rotate(${(1 - k) * -6}deg)`,
      opacity: clamp01(k * 3),
    }}
  >
    <div style={{ position: "absolute", inset: 0, borderRadius: 60 * scale, background: "#FFF6D6", border: `${9 * scale}px solid ${ACCENT}`, boxSizing: "border-box", boxShadow: `0 ${14 * scale}px 0 ${SHADOW}` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 28 * scale, textAlign: "center", fontSize: 108 * scale, fontWeight: 700, color: INK, letterSpacing: 2 * scale, lineHeight: 1 }}>FAMILY TRICK</div>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 28 * scale, display: "flex", justifyContent: "center" }}>
      <Chip text="− TAKING AWAY" fill={PART_COLOURS.middle} w={440} h={86} size={46} scale={scale} k={clamp01(chipK * 2)} />
    </div>
  </div>
);
