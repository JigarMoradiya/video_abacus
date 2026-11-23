// E06's sum, written the way a child writes it — in a column, with two places.
//
//        2 1
//     +    3
//     ───────
//        2 4
//
// Built on E03's SumCard rather than beside it: same travelling highlight, same "the card animates
// once and the HIGHLIGHT animates thereafter" rule, same `"none"` step meaning nothing is being
// worked yet. What is new is the second place — the digits sit in TENS and ONES columns, and the
// column being worked lights up as well as the row.
//
// That column highlight is the episode in one object. The lesson is "one rod at a time", so the card
// shows one COLUMN at a time: on "let's start with the tens rod" the tens column lifts, and on "now
// the ones rod" the highlight travels across. A child who looks away from the beads still sees which
// part of the sum is being done.
//
// FIXED SIZE, scaled and placed by the caller, so one set of numbers governs the artwork and the
// overlap guard's box in both cuts.

import React from "react";
import { interpolate, interpolateColors } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export type SumStep = "none" | "first" | "second" | "answer";

/** The card's unscaled box. Everything below adds up to this. */
export const COL_NAT = { w: 300, h: 322 };

const PAD = 18;
const ROW_H = 82;
const GAP = 4;
const RULE_H = 5;
const DIGIT_W = 62;

/** Split a number into [tens, ones] as strings; the tens cell is blank for a single digit. */
const cells = (n: number): [string, string] => {
  const t = Math.floor(n / 10);
  return [t ? String(t) : "", String(n % 10)];
};

export const ColumnSum: React.FC<{
  a: number;
  b: number;
  /** "+" or "−" */
  op: string;
  /** shown only once the answer beat arrives */
  total?: number;
  /** which row the narration is on right now */
  step: SumStep;
  /** the row it was on last line — the highlight travels between the two */
  prevStep: SumStep;
  /** which PLACE is being worked: 1 = tens, 0 = ones, undefined = neither */
  activeRod?: number;
  /** true only on the phrase the sum first appears on */
  popIn: boolean;
  bg: string;
  progress: number;
  scale: number;
  /** the ONE row whose number is being spoken right now — its digits scale up and flash gold on
   *  that word, independent of `step` (which lights a row for a whole line). `k` is 0..1, driven
   *  by the caller off the word's own start frame, so it lands on the word wherever it falls. */
  flash?: { row: SumStep; k: number };
  /** A plain white pill reads as "highlighted" on its own, but sits right next to the flash's
   *  bold solid-gold pill on plenty of frames (E13's worked examples in particular), and next to
   *  that much louder effect the row pill can read as barely-there. Opt-in per caller rather than
   *  a blanket change: E06-E12 already shipped with the plain pill and this keeps their look
   *  identical; only a caller that passes `strongHighlight` gets the gold ring + glow added below.
   *  A still with the row "on" and NO flash firing (e.g. most of a "second"-step phrase's own
   *  duration) must still read as obviously highlighted with this on. */
  strongHighlight?: boolean;
  /** Opacity of a dimmed "?" placeholder (default 0.5; E15 passes 0.9 so it passes the contrast audit). */
  placeholderOpacity?: number;
}> = ({ a, b, op, total, step, prevStep, activeRod, popIn, bg, progress, scale, flash, strongHighlight, placeholderOpacity = 0.5 }) => {
  const pop = popIn
    ? interpolate(progress, [0, 0.18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  // how far through the highlight's move we are
  const k =
    step === prevStep
      ? 1
      : interpolate(progress, [0, 0.22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const OFF_INK = "rgba(255,255,255,0.94)";

  const row = (label: string, value: [string, string], which: SumStep, dim = false) => {
    const on = (which === prevStep ? 1 : 0) * (1 - k) + (which === step ? 1 : 0) * k;
    const ink = interpolateColors(on, [0, 1], [OFF_INK, bg]);
    const fk = flash && flash.row === which ? flash.k : 0;
    return (
      <div
        style={{
          height: ROW_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 4,
          background: `rgba(255,255,255,${0.96 * on})`,
          borderRadius: 18,
          padding: "0 8px",
          border: strongHighlight ? `3px solid rgba(255,209,102,${on})` : undefined,
          boxShadow: strongHighlight
            ? `0 0 ${18 * on}px rgba(255,209,102,${0.6 * on}), 0 ${3 * on}px 0 rgba(0,0,0,${0.22 * on})`
            : on > 0.5
            ? "0 3px 0 rgba(0,0,0,0.18)"
            : "none",
        }}
      >
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1,
            width: 40,
            textAlign: "center",
            color: ink,
            opacity: dim ? placeholderOpacity : 1,
          }}
        >
          {label}
        </span>
        {/* TENS then ONES, each in its own fixed cell so the columns line up down the card — which
            is the entire point of writing a sum this way. */}
        {[1, 0].map((place, i) => {
          const lit = activeRod === place;
          return (
            <span
              key={place}
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 66,
                lineHeight: 1,
                width: DIGIT_W,
                textAlign: "center",
                // FLASH = a solid gold pill with DARK ink, not gold text. Gold text on this
                // card's orange ground had almost no contrast — the spoken digit looked washed
                // out, the opposite of "look here". A filled pill reads on the orange row AND on
                // the white lit row, and it is the same shape the caption's own karaoke pill uses.
                color:
                  fk > 0.01 && value[i]
                    ? interpolateColors(fk, [0, 1], [on > 0.5 ? ink : "#FFFFFF", "#3A2A1E"])
                    : on > 0.5
                    ? ink
                    : "#FFFFFF",
                opacity: dim && fk < 0.01 ? placeholderOpacity : 1,
                textShadow: fk > 0.01 && value[i] ? "none" : on > 0.5 ? "none" : "2px 2px 0 rgba(0,0,0,0.28)",
                transform: value[i] ? `scale(${1 + 0.28 * fk})` : undefined,
                // the worked column, marked on every row at once so the eye reads it as a column
                background:
                  fk > 0.01 && value[i]
                    ? `rgba(255,224,102,${fk})`
                    : lit
                    ? "rgba(255,255,255,0.22)"
                    : "transparent",
                borderRadius: 12,
                boxShadow:
                  fk > 0.01 && value[i]
                    ? `0 0 ${20 * fk}px rgba(255,224,102,${0.9 * fk}), 0 ${3 * fk}px 0 rgba(0,0,0,${0.25 * fk})`
                    : lit
                    ? "inset 0 0 0 3px rgba(255,255,255,0.55)"
                    : "none",
              }}
            >
              {value[i]}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        width: COL_NAT.w,
        height: COL_NAT.h,
        boxSizing: "border-box",
        background: bg,
        borderRadius: 30,
        padding: PAD,
        boxShadow: "0 10px 0 rgba(0,0,0,0.24)",
        border: "4px solid rgba(255,255,255,0.5)",
        transform: `scale(${scale * (popIn ? 0.92 + pop * 0.08 : 1)})`,
        transformOrigin: "top left",
        opacity: pop,
        display: "flex",
        flexDirection: "column",
        gap: GAP,
      }}
    >
      {row("", cells(a), "first")}
      {row(op, cells(b), "second")}
      <div
        style={{
          height: RULE_H,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 3,
          margin: `${GAP}px 4px`,
        }}
      />
      {row("", total === undefined ? ["", "?"] : cells(total), "answer", total === undefined)}
    </div>
  );
};
