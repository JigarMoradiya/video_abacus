// KAKURO SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording: a crossword-style grid of dark "wall" cells — some carrying a
// diagonal-split clue number — and white blank cells that fill in as a run is solved, the run
// highlighting green while active and flashing brighter when its sum is confirmed). Not a
// playable engine — one fixed minimal cross plays out: a DOWN run (3+6=9) and an ACROSS run
// (3+9=12) sharing one cell, each walked through by name.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface KakuroCell {
  row: number;
  col: number;
  kind: "wall" | "clue" | "entry";
  downClue?: number;
  acrossClue?: number;
}

export interface EntryFill {
  row: number;
  col: number;
  value: number;
  /** frame this cell's number pops in */
  fillAt: number;
  /** frame this ALREADY-filled cell gets re-pulsed as it's cited by a second run */
  reEmphasizeAt?: number;
}

export interface KakuroRun {
  id: number;
  cells: { row: number; col: number }[];
  /** frame the run's cells first glow, when the narrator names it (before any fill) */
  introAt: number;
  /** frame the run flashes green as solved */
  solvedAt: number;
}

export const KakuroSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  cells: KakuroCell[];
  fills: EntryFill[];
  runs: KakuroRun[];
  gridRevealAt: number;
  sweepAt: number; // "no repeats in a run" — brief re-glow across every solved run
  blanksAt: number; // "Fill the blanks..." — every still-empty cell highlights together
  bannerAt: number;
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, cells, fills, runs, gridRevealAt, sweepAt, blanksAt, bannerAt, headerAt, scale = 1 }) => {
  const t = frame / fps;
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const TILE = 124;
  const GAP = 6;
  const gridW = TILE * 3 + GAP * 2;
  const gridH = gridW;
  const cellXY = (row: number, col: number) => ({ x: col * (TILE + GAP), y: row * (TILE + GAP) });

  const cellAt = (row: number, col: number) => cells.find((c) => c.row === row && c.col === col)!;
  const runsOf = (row: number, col: number) => runs.filter((r) => r.cells.some((p) => p.row === row && p.col === col));
  const isSolved = (row: number, col: number) => runsOf(row, col).some((r) => frame >= r.solvedAt);
  const introGlow = (row: number, col: number) => Math.max(0, ...runsOf(row, col).map((r) => pressAmt(r.introAt, 12)));
  const sweepGlow = (row: number, col: number) => (runsOf(row, col).length > 0 ? pressAmt(sweepAt, 14) : 0);

  const KEY_ROWS = [
    ["1", "2", "3", "4", "5"],
    ["6", "7", "8", "9", "⌫"],
  ];
  const KEY = 62;
  const KEY_GAP = 12;
  // which key glows as "just tapped" — the moment a matching digit fills a cell
  const keyPressAmt = (digit: string) => {
    const match = fills.find((f) => String(f.value) === digit && frame >= f.fillAt);
    return match ? pressAmt(match.fillAt, 10) : 0;
  };

  const idleBob = Math.sin(t * 1.4) * 4;
  const chaseActive = frame < gridRevealAt + 40;
  const chasePhase = ((frame - gridRevealAt) / 16) % 9;
  const previewGlow = (row: number, col: number) => {
    if (!chaseActive) return 0;
    const idx = row * 3 + col;
    const d = Math.abs(chasePhase - idx);
    const dist = Math.min(d, 9 - d);
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
            border: "3px solid #8E4FD0",
            borderRadius: 999,
            padding: "9px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          🐜 Kakuro
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
            fontSize: 26,
            color: "#D9534F",
            background: "#FFFFFF",
            border: "3px solid #FF9E6D",
            borderRadius: 999,
            padding: "8px 24px",
            boxShadow: "0 4px 0 rgba(0,0,0,0.12)",
          }}
        >
          Make every run add up to its clue!
        </span>
      </div>

      <div style={{ position: "relative", width: gridW, height: gridH, margin: "0 auto", transform: `translateY(${idleBob}px)` }}>
        {[0, 1, 2].flatMap((row) =>
          [0, 1, 2].map((col) => {
            const cell = cellAt(row, col);
            const revealed = frame >= gridRevealAt;
            const pos = cellXY(row, col);

            if (cell.kind === "wall") {
              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: TILE,
                    height: TILE,
                    borderRadius: 14,
                    background: "#2E3A44",
                    opacity: revealed ? 1 : 0,
                  }}
                />
              );
            }

            if (cell.kind === "clue") {
              const glow = previewGlow(row, col);
              return (
                <div
                  key={`${row}-${col}`}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: TILE,
                    height: TILE,
                    borderRadius: 14,
                    background: "#2E3A44",
                    opacity: revealed ? 1 : 0,
                    boxShadow: glow > 0.05 ? `inset 0 0 ${8 + 8 * glow}px rgba(255,255,255,${0.3 * glow})` : "none",
                  }}
                >
                  <svg width={TILE} height={TILE} style={{ position: "absolute", inset: 0 }}>
                    <line x1={0} y1={0} x2={TILE} y2={TILE} stroke="#5A6A76" strokeWidth={2} />
                  </svg>
                  {cell.downClue !== undefined && (
                    <span style={{ position: "absolute", left: 8, bottom: 6, fontFamily: KID_FONT, fontWeight: 700, fontSize: 26, color: "#FFD54F" }}>
                      {cell.downClue}
                    </span>
                  )}
                  {cell.acrossClue !== undefined && (
                    <span style={{ position: "absolute", right: 8, top: 4, fontFamily: KID_FONT, fontWeight: 700, fontSize: 26, color: "#7FE0D6" }}>
                      {cell.acrossClue}
                    </span>
                  )}
                </div>
              );
            }

            // entry cell
            const fill = fills.find((f) => f.row === row && f.col === col);
            const filled = fill && frame >= fill.fillAt;
            const solved = isSolved(row, col);
            const sweep = sweepGlow(row, col);
            const intro = introGlow(row, col);
            const rePulse = pressAmt(fill?.reEmphasizeAt, 10);
            // "Fill the blanks..." — every cell that is STILL blank right now highlights
            // together, so the word "blanks" points at the actual blanks, not the whole board.
            const blanksGlow = !filled ? pressAmt(blanksAt, 16) : 0;
            const pop = fill ? interpolate(frame, [fill.fillAt, fill.fillAt + 6, fill.fillAt + 10], [0.4, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

            const bg = solved
              ? sweep > 0.15
                ? "#FFF3D0"
                : "#DDF5E3"
              : intro > 0.15 || rePulse > 0.15
              ? "#D8F0E8"
              : blanksGlow > 0.15
              ? "#FFF3D0"
              : filled
              ? "#EAF6F1"
              : "#FFFFFF";
            const border = solved
              ? "#2E9E62"
              : intro > 0.15 || rePulse > 0.15
              ? "#2E9E62"
              : blanksGlow > 0.15
              ? "#F57C00"
              : filled
              ? "#7FC9AE"
              : "#D8D8D8";
            const textColor = solved ? "#2E7D32" : filled ? "#1B6B4A" : "#1B1440";

            return (
              <div
                key={`${row}-${col}`}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: TILE,
                  height: TILE,
                  borderRadius: 18,
                  background: revealed ? bg : "#FFFFFF",
                  border: `4px solid ${revealed ? border : "#E4E0EE"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: revealed ? 1 : 0,
                  boxShadow: solved
                    ? `0 0 ${12 + 8 * (0.5 + Math.sin(t * 2.3) * 0.5)}px 4px rgba(46,158,98,0.4)`
                    : intro > 0.15 || rePulse > 0.15
                    ? `0 0 ${10 + 10 * Math.max(intro, rePulse)}px 4px rgba(46,158,98,0.35)`
                    : blanksGlow > 0.15
                    ? `0 0 ${10 + 10 * blanksGlow}px 4px rgba(245,124,0,0.4)`
                    : "0 6px 0 rgba(0,0,0,0.1)",
                  transform: `scale(${filled ? pop * (1 + rePulse * 0.08) : 1 + blanksGlow * 0.08})`,
                }}
              >
                {filled && <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 44, color: textColor }}>{fill!.value}</span>}
              </div>
            );
          })
        )}
      </div>

      {/* the numeric keypad + eraser — 2 rows of 5, matching the real UI's own layout — the
          matching key glows the instant its digit fills a cell, so it reads as "that's the key
          that was just tapped" */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: KEY_GAP, marginTop: 26 }}>
        {KEY_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: KEY_GAP }}>
            {row.map((k) => {
              const isErase = k === "⌫";
              const press = isErase ? 0 : keyPressAmt(k);
              return (
                <div
                  key={k}
                  style={{
                    width: KEY,
                    height: KEY,
                    borderRadius: 14,
                    background: isErase ? "#C9C4D6" : "#1E63D6",
                    border: press > 0.1 ? "4px solid #F57C00" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: press > 0.1 ? `0 0 ${8 + 10 * press}px ${3 + 3 * press}px rgba(245,124,0,0.55)` : "0 4px 0 rgba(0,0,0,0.16)",
                    transform: `scale(${1 + press * 0.14})`,
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 26, color: isErase ? "#5B5468" : "#FFFFFF" }}>{k}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
