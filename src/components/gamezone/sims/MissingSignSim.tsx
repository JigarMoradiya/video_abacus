// MISSING SIGN SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own screenshots + gameplay recording): an equation with one operator replaced by a
// highlighted "?" box, and four big operator buttons below (+, −, ×, ÷). Not a playable engine —
// the equation builds token-by-token as its own words are spoken, and the "?" box flips to the
// real operator (with a green judge flash) once the narrator names it.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface SignToken {
  text: string;
  at: number;
}

export type Op = "+" | "−" | "×" | "÷";

export interface SignRound {
  /** tokens for the WHOLE equation, e.g. "12","?","3","=","4" */
  tokens: SignToken[];
  /** index into tokens[] that is the "?" slot */
  slotIndex: number;
  correctOp: Op;
  /** frame the "?" flips to the real operator and judges green */
  judgeAt?: number;
  tapAt?: number;
  activeUntil: number;
}

const OPS: Op[] = ["+", "−", "×", "÷"];

export const MissingSignSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  rounds: SignRound[];
  /** frame the "Which sign?" header pill appears — it shouldn't be on screen before the
      narrator has actually introduced the game ("This is Missing Sign!"), only from there on. */
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, rounds, headerAt, scale = 1 }) => {
  const round = rounds.find((r) => frame < r.activeUntil) ?? rounds[rounds.length - 1];
  const judged = round.judgeAt !== undefined && frame >= round.judgeAt;
  const judgeIn = judged
    ? interpolate(frame, [round.judgeAt!, round.judgeAt! + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const flipIn = judged
    ? interpolate(frame, [round.judgeAt!, round.judgeAt! + 6, round.judgeAt! + 10], [0.4, 1.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  // a resolved equation still needs to breathe — motion_check flagged the judged stretches as
  // frozen when this dropped straight to 0 (the tap-ring/press animations only last a few
  // frames). A tiny few-pixel bob on individual glyphs wasn't enough signal either — the
  // checker averages over a wide region, so a whole-row scale breathe (every glyph's pixels
  // shifting at once) reads far more reliably than a small positional wobble.
  const t = frame / fps;
  const idleBob = judged ? Math.sin(t * 1.2) * 5 : Math.sin(t * 1.6) * 8;
  const breathe = 1 + Math.sin(t * (judged ? 1.1 : 1.7)) * 0.055;
  const judgedGlow = judged ? 0.5 + Math.sin(t * 2.4) * 0.5 : 0;
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 620, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* header pill — matches the real "Which sign?" header. Held back until the narrator
          actually says the game's name, then stays up through the whole teaching section. */}
      <div style={{ textAlign: "center", marginBottom: 30, opacity: headerIn, transform: `scale(${0.7 + headerIn * 0.3})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 34,
            color: "#1565C0",
            background: "rgba(255,255,255,0.96)",
            border: "3px solid #1976D2",
            borderRadius: 999,
            padding: "10px 34px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          Which sign?
        </span>
      </div>

      {/* the equation row */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, transform: `translateY(${idleBob}px) scale(${breathe})` }}>
        {round.tokens.map((tok, i) => {
          const isSlot = i === round.slotIndex;
          const tIn = interpolate(frame, [tok.at, tok.at + 6, tok.at + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const tOpacity = interpolate(frame, [tok.at - 2, tok.at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const label = isSlot && judged ? round.correctOp : tok.text;
          return (
            <span
              key={i}
              style={
                isSlot
                  ? {
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 84,
                      height: 84,
                      borderRadius: 18,
                      background: judged ? "#E8F5E9" : "rgba(255,255,255,0.94)",
                      border: `5px solid ${judged ? "#2E7D32" : "#1976D2"}`,
                      boxShadow: judged ? `0 0 ${16 + 8 * judgedGlow}px ${5 + 3 * judgedGlow}px rgba(76,175,80,0.45)` : "none",
                      opacity: tOpacity,
                      transform: `scale(${tIn * flipIn})`,
                      fontFamily: KID_FONT,
                      fontWeight: 700,
                      fontSize: 48,
                      color: judged ? "#2E7D32" : "#1976D2",
                    }
                  : {
                      display: "inline-block",
                      opacity: tOpacity,
                      transform: `scale(${tIn})`,
                      fontFamily: KID_FONT,
                      fontWeight: 700,
                      fontSize: 64,
                      color: "#FFFFFF",
                      textShadow: "0 3px 0 rgba(0,0,0,0.35)",
                    }
              }
            >
              {label}
            </span>
          );
        })}
      </div>

      {/* the four operator buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 22, marginTop: 44 }}>
        {OPS.map((op, i) => {
          const isCorrect = op === round.correctOp;
          const tapAt = round.tapAt;
          const showTapRing = isCorrect && tapAt !== undefined && frame >= tapAt - 8 && frame <= tapAt + 4;
          const pressed = isCorrect && judged;
          const bg = pressed ? "#2E7D32" : "#1976D2";
          const bounce = pressed ? 1 + Math.max(0, 1 - judgeIn * 3) * 0.08 + judgedGlow * 0.02 : 1;
          const dim = judged && !isCorrect;
          return (
            <div key={i} style={{ position: "relative" }}>
              {showTapRing && (
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    border: "6px solid #FFFFFF",
                    borderRadius: 22,
                    opacity: interpolate(frame, [tapAt! - 8, tapAt!], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    transform: `scale(${interpolate(frame, [tapAt! - 8, tapAt!], [1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}
                />
              )}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 20,
                  background: bg,
                  opacity: dim ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 7px 0 rgba(0,0,0,0.22)",
                  transform: `scale(${bounce})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 44, color: "#FFF" }}>{op}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
