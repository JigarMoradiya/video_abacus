// MATH BINGO SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own screenshots + gameplay recording): a 4x4 grid of numbers, a "🚩 call" flag at top
// showing the equation to solve, and cells that stamp green with a star once solved. Four in a
// row/column/diagonal is a BINGO. Not a playable engine — the call builds token-by-token as
// its own words are spoken, and cells stamp on cue rather than from real taps.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface BBToken {
  text: string;
  at: number;
}

export interface BBStamp {
  row: number;
  col: number;
  at: number;
}

export interface CallRound {
  /** the call flag's tokens, e.g. "4","+","5","=","9" appearing one after another */
  tokens: BBToken[];
  /** frame the call flag turns green (the answer is confirmed) */
  judgeAt: number;
  /** this call is on screen until this frame (exclusive) — the True/False reel taught us that
      leaving ONE call sitting for the whole hook reads as a dead, empty flag; several quick
      calls cycling through keeps the flag from ever sitting blank. */
  activeUntil: number;
}

export interface MathBingoStoryboard {
  /** the 4x4 card, real numbers from the actual game */
  grid: number[][];
  callRounds: CallRound[];
  stamps: BBStamp[];
  /** frame a tap-ring lands on the cell being stamped live (the taught round) */
  tapAt?: number;
  tapRow?: number;
  tapCol?: number;
  /** frame the BINGO banner pops */
  bingoAt: number;
}

const CELL = 78;
const GAP = 8;

export const MathBingoSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  story: MathBingoStoryboard;
  scale?: number;
}> = ({ frame, fps, x, y, story, scale = 1 }) => {
  const call = story.callRounds.find((r) => frame < r.activeUntil) ?? story.callRounds[story.callRounds.length - 1];
  const callJudged = frame >= call.judgeAt;
  const callPulse = Math.sin((frame / fps) * 2.2) * 0.03;

  const bingoOn = frame >= story.bingoAt;
  const bingoIn = bingoOn
    ? interpolate(frame, [story.bingoAt, story.bingoAt + 8, story.bingoAt + 14], [0.3, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const gridW = 4 * CELL + 3 * GAP;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: gridW, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* the call flag */}
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 40,
            color: callJudged ? "#2E7D32" : "#E65100",
            background: "rgba(255,255,255,0.96)",
            border: `4px solid ${callJudged ? "#2E7D32" : "#FF8400"}`,
            borderRadius: 999,
            padding: "12px 34px",
            boxShadow: "0 6px 0 rgba(0,0,0,0.16)",
            transform: `scale(${1 + (callJudged ? callPulse : 0)})`,
          }}
        >
          <span style={{ fontSize: 32 }}>🚩</span>
          {call.tokens.map((tok, i) => {
            const tIn = interpolate(frame, [tok.at, tok.at + 6, tok.at + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tOp = interpolate(frame, [tok.at - 2, tok.at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span key={i} style={{ display: "inline-block", opacity: tOp, transform: `scale(${tIn})` }}>
                {tok.text}
              </span>
            );
          })}
        </span>
      </div>

      {/* the 4x4 card */}
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: `repeat(4, ${CELL}px)`, gap: GAP }}>
        {story.grid.map((rowVals, r) =>
          rowVals.map((val, c) => {
            const stamp = story.stamps.find((s) => s.row === r && s.col === c);
            const stamped = stamp !== undefined && frame >= stamp.at;
            const stampIn = stamped
              ? interpolate(frame, [stamp!.at, stamp!.at + 6, stamp!.at + 10], [0.3, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
              : 1;
            const isTapCell = story.tapRow === r && story.tapCol === c;
            const showTapRing = isTapCell && story.tapAt !== undefined && frame >= story.tapAt - 8 && frame <= story.tapAt + 4;
            const inBingoLine = bingoOn && r === c; // the taught example uses the main diagonal
            return (
              <div key={`${r}-${c}`} style={{ position: "relative" }}>
                {showTapRing && (
                  <div
                    style={{
                      position: "absolute",
                      inset: -8,
                      border: "5px solid #FFFFFF",
                      borderRadius: 18,
                      opacity: interpolate(frame, [story.tapAt! - 8, story.tapAt!], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      transform: `scale(${interpolate(frame, [story.tapAt! - 8, story.tapAt!], [1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                    }}
                  />
                )}
                <div
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 14,
                    background: stamped ? "#4CAF50" : "#FFFFFF",
                    border: `3px solid ${stamped ? "#2E7D32" : "#E0D8F0"}`,
                    boxShadow: inBingoLine
                      ? `0 4px 0 rgba(0,0,0,0.18), 0 0 ${16 * bingoIn}px ${5 * bingoIn}px #FFD54F`
                      : "0 4px 0 rgba(0,0,0,0.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: `scale(${stampIn})`,
                  }}
                >
                  {stamped ? (
                    <span style={{ fontSize: 34 }}>⭐</span>
                  ) : (
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 32, color: "#1B1440" }}>{val}</span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* the BINGO banner — nested INSIDE the grid's own relatively-positioned box, so it
            centers on the grid itself, not the whole block (which also includes the call
            flag above it — centering against that pushed the banner up over the top row). */}
        {bingoOn && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: `translate(-50%,-50%) scale(${bingoIn})`,
              opacity: interpolate(frame, [story.bingoAt, story.bingoAt + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
          <span
            style={{
              display: "inline-block",
              fontFamily: KID_FONT,
              fontWeight: 800,
              fontSize: 54,
              color: "#FFFFFF",
              background: "#FF8400",
              border: "5px solid #FFF3D0",
              borderRadius: 20,
              padding: "14px 34px",
              boxShadow: "0 8px 0 rgba(0,0,0,0.3)",
              transform: `rotate(-6deg)`,
            }}
          >
            BINGO!
          </span>
        </div>
        )}
      </div>
    </div>
  );
};
