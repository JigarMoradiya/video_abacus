// NUMBER SNAKE SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording AND the actual Swift/Kotlin source: a 4x4 grid where some
// cells are given clues, the rest start blank; the player taps a blank cell then taps a number
// from a tray to place it; a thin connector line joins any two grid-adjacent cells whose
// values are consecutive — this is a Hidato-style puzzle, NOT a drag/swipe game, despite the
// name). Not a playable engine — one fixed, fully-verified 1-16 solution plays out: 6 is
// already given, 7 and 8 are placed one at a time from the tray, then the remaining blanks
// complete together.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface SnakeCell {
  row: number;
  col: number;
  value: number;
  given: boolean;
  /** frame this cell's number appears — only meaningful for non-given cells */
  fillAt?: number;
}

export const NumberSnakeSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  cells: SnakeCell[]; // 16
  gridRevealAt: number;
  missingAt: number;
  place7At: number;
  place8At: number;
  bannerAt: number;
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, cells, gridRevealAt, missingAt, place7At, place8At, bannerAt, headerAt, scale = 1 }) => {
  const t = frame / fps;
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const TILE = 112;
  const GAP = 8;
  const gridW = TILE * 4 + GAP * 3;
  const gridH = gridW;
  const cellXY = (row: number, col: number) => ({ x: col * (TILE + GAP), y: row * (TILE + GAP) });
  const cellAt = (row: number, col: number) => cells.find((c) => c.row === row && c.col === col);

  const filledAt = (c: SnakeCell) => (c.given ? gridRevealAt : c.fillAt ?? Infinity);
  const isFilled = (c: SnakeCell) => frame >= filledAt(c);

  const idleBob = Math.sin(t * 1.4) * 4;
  const chaseActive = frame < gridRevealAt + 40;
  const chasePhase = ((frame - gridRevealAt) / 16) % 16;
  const previewGlow = (i: number) => {
    if (!chaseActive) return 0;
    const d = Math.abs(chasePhase - i);
    const dist = Math.min(d, 16 - d);
    return Math.max(0, 1 - dist);
  };

  // "...but most of them are missing!" — every still-blank box pulses a warm red ring + a
  // little bounce right on that line, so the "missing" numbers actually read as missing
  // instead of just sitting there pale blue.
  const missingEnvelope = interpolate(frame, [missingAt - 4, missingAt + 8, missingAt + 55, missingAt + 78], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const missingPulse = missingEnvelope > 0.01 ? (0.55 + 0.45 * Math.sin((frame - missingAt) * 0.4)) * missingEnvelope : 0;

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
            border: "3px solid #8E4FD0",
            borderRadius: 999,
            padding: "9px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          🐍 Number Snake
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
            fontSize: 22,
            color: "#D9534F",
            background: "#FFFFFF",
            border: "3px solid #FF9E6D",
            borderRadius: 999,
            padding: "8px 20px",
            boxShadow: "0 4px 0 rgba(0,0,0,0.12)",
          }}
        >
          Place each number next to the one before it!
        </span>
      </div>

      <div style={{ position: "relative", width: gridW, height: gridH, margin: "0 auto", transform: `translateY(${idleBob}px)` }}>
        {/* connector lines between any two grid-adjacent cells whose values are consecutive,
            matching the real app's own local rule. A line only appears once BOTH cells are
            filled (no spoiler preview for still-empty boxes). A pair that was ALREADY given
            from the start (never animated in) stays the original orange throughout. A pair
            where a number was actually placed by the player stays a distinct teal permanently
            — not just a brief flash that fades back to the same orange as the given ones — with
            an extra-bright flash for the first ~16 frames so the moment it connects still pops. */}
        <svg width={gridW} height={gridH} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {cells.map((c) => {
            const neighbors = [
              { r: c.row, col: c.col + 1 },
              { r: c.row + 1, col: c.col },
            ];
            return neighbors.map((n, ni) => {
              const nb = cellAt(n.r, n.col);
              if (!nb) return null;
              if (Math.abs(nb.value - c.value) !== 1) return null;
              if (!(isFilled(c) && isFilled(nb))) return null;
              const connectedAt = Math.max(filledAt(c), filledAt(nb));
              const justConnected = frame - connectedAt < 16;
              const wasPlaced = !c.given || !nb.given;
              const baseColor = wasPlaced ? "#00BFA5" : "#F57C00";
              const p1 = cellXY(c.row, c.col);
              const p2 = cellXY(n.r, n.col);
              return (
                <line
                  key={`${c.row}-${c.col}-${ni}`}
                  x1={p1.x + TILE / 2}
                  y1={p1.y + TILE / 2}
                  x2={p2.x + TILE / 2}
                  y2={p2.y + TILE / 2}
                  stroke={justConnected ? "#5CFFE0" : baseColor}
                  strokeWidth={justConnected ? 8 : 6}
                  strokeLinecap="round"
                  opacity={0.7}
                />
              );
            });
          })}
        </svg>

        {cells.map((cell, i) => {
          const pos = cellXY(cell.row, cell.col);
          const revealed = frame >= gridRevealAt;
          const filled = isFilled(cell);
          const pop = cell.fillAt ? interpolate(frame, [cell.fillAt, cell.fillAt + 6, cell.fillAt + 10], [0.4, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
          const isPlaceHighlight = (cell.value === 6 && frame < place7At) || (cell.value === 7 && Math.abs(frame - place7At) < 12) || (cell.value === 8 && Math.abs(frame - place8At) < 12);
          const glow = previewGlow(i);

          const missingHere = !filled ? missingPulse : 0;
          const bg = !filled ? "#EAF2FB" : cell.given ? "#FFF3D0" : "#DDF5E3";
          const border = !filled ? (missingHere > 0.05 ? "#FF6B6B" : "#B9D4F2") : cell.given ? "#F5A623" : "#2E9E62";
          const textColor = !filled ? "transparent" : cell.given ? "#B4460B" : "#2E7D32";

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: TILE,
                height: TILE,
                borderRadius: 16,
                overflow: "visible",
                background: revealed ? bg : "#FFFFFF",
                border: `4px solid ${revealed ? border : "#E4E0EE"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: revealed ? 1 : 0,
                boxShadow: isPlaceHighlight
                  ? `0 0 ${10 + 10 * pressAmt(cell.value === 6 ? place7At : cell.value === 7 ? place7At : place8At, 12)}px 4px rgba(245,124,0,0.5)`
                  : missingHere > 0.05
                  ? `0 0 ${10 + 12 * missingHere}px 4px rgba(255,107,107,${0.35 + 0.35 * missingHere})`
                  : glow > 0.05
                  ? `0 0 ${8 + 8 * glow}px 3px rgba(255,255,255,0.5)`
                  : "0 6px 0 rgba(0,0,0,0.12)",
                transform: `scale(${filled ? pop : 1 + 0.06 * missingHere})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 34, color: textColor }}>{cell.value}</span>
              {missingHere > 0.15 && (
                <span
                  style={{
                    position: "absolute",
                    top: -14,
                    right: -10,
                    fontSize: 22,
                    opacity: missingHere,
                    transform: `scale(${0.8 + 0.3 * missingHere})`,
                  }}
                >
                  ❓
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
