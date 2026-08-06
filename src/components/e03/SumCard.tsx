// The sum, written the way a child writes it: in a column.
//
//        5
//      + 2
//      ────
//        7
//
// It was a horizontal pill ("5 + 2 = 7"), which is how an adult reads arithmetic. Column form
// is what a six-year-old meets on paper, and it also gives each number its own line to be
// highlighted on — the second number can light up at the moment it is being added, which a
// single inline string cannot do.
//
// FIXED SIZE, then scaled and placed by the caller. Its natural box is declared here (`SUM_NAT`)
// so one set of numbers governs both the artwork and the overlap guard's box, in either cut.
//
// TWO RULES ABOUT ITS ANIMATION, both from review:
//
//   1. The CARD animates once, when the sum first appears, and never again. It used to fade in
//      from zero on every phrase, so every line boundary in a five-line worked example re-popped
//      it — on screen that is a blink. Anything that stays visible across a run must not
//      re-animate at the run's beats (same law as `runSlotMap` and the card-side fix).
//   2. A step change animates the HIGHLIGHT, not the card. The plate cross-fades from the old
//      row to the new one and the digits' colour travels with it, so the eye follows a moving
//      highlight instead of being shown a new card.
//
// And `"none"` is a real step: on "Now, let's try five plus one" nothing is being worked yet, so
// nothing is highlighted. Highlighting the 5 while the rod still reads zero told the child the
// first number was already done.

import React from "react";
import { interpolate, interpolateColors } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export type SumStep = "none" | "first" | "second" | "answer";

/**
 * The card's unscaled box. Every dimension below adds up to this, on purpose.
 *
 * Narrowed from 268 to 200: in the right gutter the finger hand reaches ~330 px past the abacus,
 * and a 268-wide card left 2 px of clearance. The numbers are all single digits, so the width was
 * padding — and a narrow tall column is what column arithmetic looks like anyway.
 */
export const SUM_NAT = { w: 200, h: 300 };

const PAD = 16;
const ROW_H = 78;
const GAP = 4;
const RULE_H = 5;

export const SumCard: React.FC<{
  a: number;
  b: number;
  /** shown only once the answer beat arrives */
  total?: number;
  /** which row the narration is on right now */
  step: SumStep;
  /** the row it was on last line — the highlight travels between the two */
  prevStep: SumStep;
  /** true only on the phrase the sum first appears on; otherwise the card is already there */
  popIn: boolean;
  bg: string;
  progress: number;
  /** how much of `SUM_NAT` the caller has room for */
  scale: number;
}> = ({ a, b, total, step, prevStep, popIn, bg, progress, scale }) => {
  const pop = popIn
    ? interpolate(progress, [0, 0.18], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  // how far through the highlight's move we are
  const k =
    step === prevStep
      ? 1
      : interpolate(progress, [0, 0.22], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const OFF_INK = "rgba(255,255,255,0.94)";

  const row = (
    label: string,
    value: string,
    which: SumStep,
    dim = false
  ): React.ReactNode => {
    // 0 = not the highlighted row, 1 = fully highlighted; anything between is the crossfade
    const on = (which === prevStep ? 1 : 0) * (1 - k) + (which === step ? 1 : 0) * k;
    const ink = interpolateColors(on, [0, 1], [OFF_INK, bg]);
    return (
      <div
        style={{
          height: ROW_H,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 8,
          background: `rgba(255,255,255,${0.96 * on})`,
          borderRadius: 18,
          padding: "0 8px",
          boxShadow: on > 0.5 ? "0 3px 0 rgba(0,0,0,0.18)" : "none",
        }}
      >
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 44,
            lineHeight: 1,
            width: 34,
            textAlign: "center",
            color: ink,
            opacity: dim ? 0.5 : 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 68,
            lineHeight: 1,
            width: 72,
            textAlign: "center",
            color: on > 0.5 ? ink : "#FFFFFF",
            opacity: dim ? 0.5 : 1,
            textShadow: on > 0.5 ? "none" : "2px 2px 0 rgba(0,0,0,0.28)",
          }}
        >
          {value}
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        width: SUM_NAT.w,
        height: SUM_NAT.h,
        boxSizing: "border-box",
        background: bg,
        borderRadius: 30,
        padding: PAD,
        boxShadow: "0 10px 0 rgba(0,0,0,0.24)",
        border: "4px solid rgba(255,255,255,0.5)",
        transform: `scale(${scale * (popIn ? 0.92 + pop * 0.08 : 1)})`,
        transformOrigin: "top center",
        opacity: pop,
        display: "flex",
        flexDirection: "column",
        gap: GAP,
      }}
    >
      {row("", String(a), "first")}
      {row("+", String(b), "second")}
      <div
        style={{
          height: RULE_H,
          background: "rgba(255,255,255,0.9)",
          borderRadius: 3,
          margin: `${GAP}px 4px`,
        }}
      />
      {row("", total === undefined ? "?" : String(total), "answer", total === undefined)}
    </div>
  );
};
