// THE WORKED SUM — a vertical arithmetic card (operand / operator+operand / rule / answer),
// shared by the quick-add and quick-subtract reels. The answer digit is driven by its OWN
// reveal progress, not just presence, because the whole point is that it pops in at the
// exact instant the narration says the word — not whenever the card itself appears.

import React from "react";
import { KID_FONT } from "../../lib/fonts";

export const SumCard: React.FC<{
  x: number;
  y: number;
  a: number;
  b?: number;
  operator: "+" | "-";
  answer: number;
  /** 0 = operand A not shown yet, 1 = fully in */
  showA: number;
  /** 0 = operand B not shown yet, 1 = fully in */
  showB: number;
  /** 0..1 — the answer's own pop-in progress, timed to the spoken word */
  revealAnswer: number;
  accent: string;
  /** seconds elapsed, for the continuous focus-glow pulse — the card never goes fully still */
  t?: number;
}> = ({ x, y, a, b, operator, answer, showA, showB, revealAnswer, accent, t = 0 }) => {
  const answerScale = 0.6 + revealAnswer * 0.4;
  const glow = 0.55 + Math.sin(t * 3.2) * 0.35;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 240,
        background: "#FFF8E8",
        border: `6px solid ${accent}`,
        borderRadius: 32,
        padding: "22px 28px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        fontFamily: KID_FONT,
        fontWeight: 700,
        boxShadow: `0 10px 0 rgba(0,0,0,0.28), 0 0 0 10px rgba(214,49,107,${glow * 0.28})`,
      }}
    >
      <span style={{ fontSize: 58, color: "#1B1440", opacity: showA, transform: `scale(${0.7 + showA * 0.3})`, transformOrigin: "right center" }}>
        {a}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: showB, transform: `scale(${0.7 + showB * 0.3})`, transformOrigin: "right center" }}>
        <span style={{ fontSize: 42, color: accent }}>{operator}</span>
        <span style={{ fontSize: 58, color: "#1B1440" }}>{b}</span>
      </div>
      <div style={{ width: "100%", height: 6, background: "#1B1440", margin: "10px 0", opacity: showB }} />
      <span
        style={{
          fontSize: 68,
          color: revealAnswer > 0.05 ? "#1B7A4A" : "transparent",
          opacity: revealAnswer,
          transform: `scale(${answerScale})`,
          transformOrigin: "right center",
        }}
      >
        {answer}
      </span>
    </div>
  );
};
