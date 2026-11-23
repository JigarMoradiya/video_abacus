// TRUE OR FALSE SIM — a scripted, frame-driven recreation of the real game (confirmed from
// the user's own screenshots + gameplay recording): a white, orange-bordered equation card,
// a ticking countdown chip top-right, and two big buttons below — green "TRUE" (check) and
// red "FALSE" (X). Not a playable engine — each round's equation builds token-by-token as
// its own words are spoken, then the card flashes green/red as the narrator judges it.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface TFToken {
  text: string;
  at: number; // frame this token appears
}

export interface TFRound {
  tokens: TFToken[];
  isTrue: boolean;
  /** frame the card flashes green/red and the check/X stamp pops */
  judgeAt?: number;
  /** frame a tap-ring lands on the correct (TRUE/FALSE) button */
  tapAt?: number;
  /** this round is active until this frame (exclusive) */
  activeUntil: number;
}

export interface TrueOrFalseStoryboard {
  rounds: TFRound[];
}

const CARD_W = 420;
const CARD_H = 160;

export const TrueOrFalseSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  story: TrueOrFalseStoryboard;
  scale?: number;
}> = ({ frame, fps, x, y, story, scale = 1 }) => {
  const round = story.rounds.find((r) => frame < r.activeUntil) ?? story.rounds[story.rounds.length - 1];

  const judged = round.judgeAt !== undefined && frame >= round.judgeAt;
  const judgeIn = judged
    ? interpolate(frame, [round.judgeAt!, round.judgeAt! + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const stampIn = judged
    ? interpolate(frame, [round.judgeAt!, round.judgeAt! + 6, round.judgeAt! + 10], [0.3, 1.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const judgeColor = round.isTrue ? "#2E7D32" : "#C62828";

  // the card gives a tiny idle bob while waiting to be judged — never dead still
  const idleBob = judged ? 0 : Math.sin((frame / fps) * 1.6) * 4;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 600, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* header pill, like the real "True or false?" header */}
      <div style={{ textAlign: "center", marginBottom: 30 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 34,
            color: "#E65100",
            background: "rgba(255,255,255,0.96)",
            border: "3px solid #FF8400",
            borderRadius: 999,
            padding: "10px 34px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          True or false?
        </span>
      </div>

      {/* the equation card — builds token-by-token, then flashes green/red once judged */}
      <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            width: CARD_W,
            height: CARD_H,
            background: "#FFFFFF",
            border: `6px solid ${judged ? judgeColor : "#FF8400"}`,
            borderRadius: 26,
            boxShadow: judged
              ? `0 8px 0 rgba(0,0,0,0.2), 0 0 ${24 * judgeIn}px ${8 * judgeIn}px ${judgeColor}55`
              : "0 8px 0 rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            transform: `translateY(${idleBob}px)`,
          }}
        >
          {round.tokens.map((tok, i) => {
            const tIn = interpolate(frame, [tok.at, tok.at + 6, tok.at + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tOpacity = interpolate(frame, [tok.at - 2, tok.at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span
                key={i}
                style={{
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 56,
                  color: "#1B1440",
                  opacity: tOpacity,
                  display: "inline-block",
                  transform: `scale(${tIn})`,
                }}
              >
                {tok.text}
              </span>
            );
          })}
        </div>

        {/* the judge stamp — a big check or X, popping over the card's corner */}
        {judged && (
          <div
            style={{
              position: "absolute",
              right: -22,
              top: -22,
              width: 76,
              height: 76,
              borderRadius: "50%",
              background: judgeColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
              opacity: judgeIn,
              transform: `scale(${stampIn})`,
            }}
          >
            <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 44, color: "#FFF" }}>{round.isTrue ? "✓" : "✕"}</span>
          </div>
        )}
      </div>


      {/* the two judge buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 40 }}>
        {(["TRUE", "FALSE"] as const).map((label, i) => {
          const isTrueBtn = label === "TRUE";
          const isCorrectBtn = isTrueBtn === round.isTrue;
          const tapAt = round.tapAt;
          const showTapRing = isCorrectBtn && tapAt !== undefined && frame >= tapAt - 8 && frame <= tapAt + 4;
          const pressed = isCorrectBtn && judged;
          const baseColor = isTrueBtn ? "#2E7D32" : "#C62828";
          const bg = pressed ? baseColor : isTrueBtn ? "#43A047" : "#E53935";
          const bounce = pressed ? 1 + Math.max(0, 1 - judgeIn * 3) * 0.08 : 1;
          return (
            <div key={i} style={{ position: "relative" }}>
              {showTapRing && (
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    border: "6px solid #FFFFFF",
                    borderRadius: 24,
                    opacity: interpolate(frame, [tapAt! - 8, tapAt!], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    transform: `scale(${interpolate(frame, [tapAt! - 8, tapAt!], [1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}
                />
              )}
              <div
                style={{
                  width: 168,
                  height: 84,
                  borderRadius: 20,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  boxShadow: "0 7px 0 rgba(0,0,0,0.22)",
                  transform: `scale(${bounce})`,
                }}
              >
                <span style={{ fontSize: 34 }}>{isTrueBtn ? "✓" : "✕"}</span>
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 32, color: "#FFF" }}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
