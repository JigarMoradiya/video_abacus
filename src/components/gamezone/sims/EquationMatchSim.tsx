// EQUATION MATCH SIM — a scripted, frame-driven recreation of the real game (confirmed from
// the user's own gameplay recording: a grid of face-down colorful cards, tapping two flips
// them face-up, a matching equation-and-answer pair stays revealed and glows, a mismatch would
// flip back down). Not a playable engine — one fixed 4x3/6-pair board plays out: the narrated
// pair (3+4 / 7) flips, matches, and fades away, then every remaining pair reveals solved
// together.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface MatchCard {
  row: number;
  col: number;
  value: string; // "3+4" or "7"
  pairId: number;
  color: string;
  /** frame this card flips face-up */
  flipAt: number;
}

export const EquationMatchSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  cards: MatchCard[]; // 12
  gridRevealAt: number;
  narratedPairId: number;
  matchAt: number; // narrated pair confirmed matching
  disappearAt: number; // narrated pair fades away
  /** an earlier, non-narrated pair that also flips live (e.g. demonstrating "flip two cards")
   * and should fade away after its own match, same as any found pair does in the real game */
  demoPairId?: number;
  demoDisappearAt?: number;
  bannerAt: number;
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, cards, gridRevealAt, narratedPairId, matchAt, disappearAt, demoPairId, demoDisappearAt, bannerAt, headerAt, scale = 1 }) => {
  const t = frame / fps;
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const TILE = 124;
  const GAP = 12;
  const COLS = 3;
  const gridW = TILE * COLS + GAP * (COLS - 1);
  const gridH = TILE * 4 + GAP * 3;
  const cellXY = (row: number, col: number) => ({ x: col * (TILE + GAP), y: row * (TILE + GAP) });

  const idleBob = Math.sin(t * 1.4) * 4;
  const chaseActive = frame < gridRevealAt + 40;
  const chasePhase = ((frame - gridRevealAt) / 16) % 12;
  const previewGlow = (i: number) => {
    if (!chaseActive) return 0;
    const d = Math.abs(chasePhase - i);
    const dist = Math.min(d, 12 - d);
    return Math.max(0, 1 - dist);
  };

  return (
    <div style={{ position: "absolute", left: x, top: y, width: gridW + 220, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      <div style={{ textAlign: "center", marginBottom: 46, opacity: headerIn, transform: `scale(${0.7 + headerIn * 0.3})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 32,
            color: "#1B1440",
            background: "rgba(255,255,255,0.96)",
            border: "3px solid #7E57C2",
            borderRadius: 999,
            padding: "9px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          🐘 Equation Match
        </span>
      </div>

      <div
        style={{
          textAlign: "center",
          marginBottom: 30,
          opacity: interpolate(frame, [bannerAt - 6, bannerAt + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(frame, [bannerAt - 6, bannerAt + 2, bannerAt + 10], [0.4, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 24,
            color: "#D9534F",
            background: "#FFFFFF",
            border: "3px solid #FF9E6D",
            borderRadius: 999,
            padding: "8px 22px",
            boxShadow: "0 4px 0 rgba(0,0,0,0.12)",
          }}
        >
          Find the equation and its answer!
        </span>
      </div>

      <div style={{ position: "relative", width: gridW, height: gridH, margin: "0 auto", transform: `translateY(${idleBob}px)` }}>
        {cards.map((card, i) => {
          const pos = cellXY(card.row, card.col);
          const revealed = frame >= gridRevealAt;
          const flipped = frame >= card.flipAt;
          const isNarrated = card.pairId === narratedPairId;
          const isDemo = demoPairId !== undefined && card.pairId === demoPairId;
          const matched = isNarrated ? frame >= matchAt : flipped; // non-narrated cards reveal already-matched
          const ownDisappearAt = isNarrated ? disappearAt : isDemo ? demoDisappearAt : undefined;
          const fading = pressAmt(ownDisappearAt, 10);
          const disappearOpacity = ownDisappearAt !== undefined && frame >= ownDisappearAt ? Math.max(0.2, 1 - (frame - ownDisappearAt) / 14) : 1;
          const pop = interpolate(frame, [card.flipAt, card.flipAt + 6, card.flipAt + 10], [0.4, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const glow = previewGlow(i);

          const bg = flipped ? (matched ? "#DDF5E3" : card.color) : "#4A5AA8";
          const border = flipped ? (matched ? "#2E9E62" : "#FFFFFF") : "#33408A";
          const textColor = flipped ? (matched ? "#2E7D32" : "#FFFFFF") : "#FFFFFF";

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: TILE,
                height: TILE,
                borderRadius: 20,
                background: bg,
                border: `4px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: revealed ? disappearOpacity : 0,
                boxShadow: matched
                  ? `0 0 ${10 + 8 * (0.5 + Math.sin(t * 2.3 + i) * 0.5)}px 4px rgba(46,158,98,0.4)`
                  : fading > 0.15
                  ? `0 0 ${10 + 10 * fading}px 4px rgba(245,124,0,0.4)`
                  : glow > 0.05
                  ? `0 0 ${8 + 8 * glow}px 3px rgba(255,255,255,0.5)`
                  : "0 6px 0 rgba(0,0,0,0.14)",
                transform: `scale(${flipped ? pop : 1})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: flipped ? (card.value.length > 2 ? 28 : 36) : 40, color: textColor }}>
                {flipped ? card.value : "?"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
