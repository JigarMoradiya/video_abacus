// SUDOKU SIM — a scripted, frame-driven recreation of the real game. The grid's visual
// structure is ported from the actual SwiftUI source (SudokuBoardView / SudokuCellView in
// iOS/Abacus/Main/Games/Sudoku/SudokuPlayView.swift), not guessed from screenshots: cells sit
// EDGE TO EDGE with square corners (no gaps, no per-cell rounding) — a thin gray hairline
// (0.5pt, gray @40%) separates every cell, and the 2×2 BOX boundaries are a separate overlay
// of bold black strokes (1pt in-app), not background shading. Given cells are white;
// blank/editable cells are light gray (systemGray5); the selected-not-yet-filled cell is
// colorPrimary (#303F9F) at 15% fill with a 2pt colorPrimary border. Not a playable engine —
// a fixed 4×4 grid where a handful of cells are blanks that get tapped-and-filled in script
// order, with the constraint RULES (row / column / box) demonstrated as a highlight sweep
// timed to the words that name them.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface SudokuCell {
  value: number;
  given: boolean;
  /** frames the narrator names THIS exact value — pulses it gold, given or blank alike */
  emphasizeAt?: number[];
}

export interface SudokuBlank {
  row: number;
  col: number;
  /** frame the empty cell gets tapped/selected (gold outline, no number yet) */
  cellTapAt: number;
  /** frame the matching number pad button gets tapped */
  padTapAt: number;
  /** frame the cell fills in and locks */
  lockAt: number;
}

export interface RuleSweep {
  kind: "row" | "col" | "box";
  index: number; // row/col index, or box index (0..N/2-1 per axis for a 2x2 box grid)
  at: number;
}

const N = 4;
const CELL = 96;
const GAP = 0; // cells sit edge-to-edge, per the real app
const COLOR_PRIMARY = "#303F9F"; // the app's own `colorPrimary`
const BOX_LINE = 5; // bold box-boundary stroke (the real app's 1pt, scaled up for video)
const CELL_LINE = 2; // thin hairline between ordinary cells (the real app's 0.5pt gray@40%, scaled up)

export const SudokuSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  grid: SudokuCell[][]; // N x N, [row][col]
  blanks: SudokuBlank[];
  ruleSweeps: RuleSweep[];
  headerAt: number;
  growFrom?: number;
  growTo?: number;
  scale?: number;
}> = ({ frame, fps, x, y, grid, blanks, ruleSweeps, headerAt, growFrom = 0, growTo = 0, scale = 1 }) => {
  const t = frame / fps;
  const idleBob = Math.sin(t * 1.5) * 4;
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const growIn = growTo > growFrom
    ? interpolate(frame, [growFrom, (growFrom + growTo) / 2, growTo], [0.4, 1.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const blankAt = (r: number, c: number) => blanks.find((b) => b.row === r && b.col === c);
  const pressAmt = (atFrame: number, span = 8) => Math.max(0, 1 - Math.abs(frame - atFrame) / span);

  // a row "locks into place" the instant its own last blank fills
  const rowJustLocked = (r: number): number => {
    const rowBlanks = blanks.filter((b) => b.row === r);
    if (!rowBlanks.length) return 0;
    const last = Math.max(...rowBlanks.map((b) => b.lockAt));
    return pressAmt(last, 14);
  };

  const gridW = N * CELL + (N - 1) * GAP;
  const gridH = gridW;

  // the active rule-sweep highlight, if any is in its window right now
  const activeSweep = ruleSweeps.find((s) => pressAmt(s.at, 16) > 0.05);
  const sweepAmt = activeSweep ? pressAmt(activeSweep.at, 16) : 0;

  const values = Array.from(new Set(grid.flat().map((c) => c.value))).sort((a, b) => a - b);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: gridW + 40, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      <div style={{ textAlign: "center", marginBottom: 26, opacity: headerIn, transform: `scale(${0.7 + headerIn * 0.3})` }}>
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
          🧩 Sudoku 4×4
        </span>
      </div>

      <div
        style={{
          position: "relative",
          width: gridW,
          margin: "0 auto 40px",
          transform: `translateY(${idleBob}px) scale(${growIn})`,
          transformOrigin: "bottom center",
          boxShadow: "0 6px 0 rgba(0,0,0,0.14)",
        }}
      >
        {grid.map((row, r) => (
          <div key={r} style={{ display: "flex" }}>
            {row.map((cell, c) => {
              const blank = blankAt(r, c);
              const isBlank = !!blank;
              const tapped = isBlank && frame >= blank!.cellTapAt && frame < blank!.lockAt;
              const locked = isBlank && frame >= blank!.lockAt;
              const shown = !isBlank ? cell.value : locked ? cell.value : "";
              const popIn = isBlank && locked
                ? interpolate(frame, [blank!.lockAt, blank!.lockAt + 5, blank!.lockAt + 9], [0.4, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                : 1;
              const pulse = pressAmt((cell.emphasizeAt ?? []).reduce((closest, at) => (Math.abs(frame - at) < Math.abs(frame - closest) ? at : closest), -9999));
              // a brief green "just solved" flash, matching the rest of the series'
              // correct=green language — but it DECAYS, settling to the real app's actual
              // resting look (white background, colorPrimary digit), not staying green.
              const justLocked = isBlank ? pressAmt(blank!.lockAt, 22) : 0;
              const rowGlow = rowJustLocked(r);

              // colors ported from SudokuCellView: given = white bg; blank/editable =
              // systemGray5; selected-not-filled = colorPrimary @15% fill; filled = white bg
              // with colorPrimary text (a plain given-style cell once solved).
              const bg = pulse > 0.15
                ? "#FFF3D0"
                : justLocked > 0.1
                ? `rgba(46,125,50,${0.16 * justLocked})`
                : tapped
                ? "rgba(48,63,159,0.15)"
                : isBlank && !locked
                ? "#E9E9EF"
                : "#FFFFFF";
              const textColor = pulse > 0.15 ? "#B4460B" : isBlank ? COLOR_PRIMARY : "#1B1440";

              // thin hairlines on every edge, collapsed so shared edges aren't doubled —
              // only the first row/col also draw their outer top/left edge.
              const hairline = `${CELL_LINE}px solid rgba(90,90,100,0.35)`;
              return (
                <div
                  key={c}
                  style={{
                    position: "relative",
                    width: CELL,
                    height: CELL,
                    background: bg,
                    borderRight: hairline,
                    borderBottom: hairline,
                    borderLeft: c === 0 ? hairline : "none",
                    borderTop: r === 0 ? hairline : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: rowGlow > 0.05 ? `inset 0 0 ${10 + 8 * rowGlow}px rgba(46,125,50,${0.35 * rowGlow})` : "none",
                  }}
                >
                  {tapped && (
                    <div style={{ position: "absolute", inset: 3, boxShadow: `inset 0 0 0 4px ${COLOR_PRIMARY}`, pointerEvents: "none" }} />
                  )}
                  <span
                    style={{
                      fontFamily: KID_FONT,
                      fontWeight: 700,
                      fontSize: 42,
                      color: textColor,
                      transform: `scale(${popIn * (1 + pulse * 0.22)})`,
                    }}
                  >
                    {shown}
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        {/* rule-sweep highlight — the app's own row/col/box "related cell" wash (yellow @
            ~25%), just applied to the whole line/box at once for the teaching beat instead of
            only cells sharing a selection. Rendered AFTER the cells (not before) so it
            actually paints on top of their now-opaque, edge-to-edge backgrounds — sitting
            behind them, as it did before the grid rewrite, made it invisible. */}
        {activeSweep && activeSweep.kind === "row" && (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: activeSweep.index * CELL,
              width: gridW,
              height: CELL,
              background: "#FFEB3B",
              opacity: sweepAmt * 0.4,
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />
        )}
        {activeSweep && activeSweep.kind === "col" && (
          <div
            style={{
              position: "absolute",
              left: activeSweep.index * CELL,
              top: 0,
              width: CELL,
              height: gridH,
              background: "#FFEB3B",
              opacity: sweepAmt * 0.4,
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />
        )}
        {activeSweep && activeSweep.kind === "box" && (
          <div
            style={{
              position: "absolute",
              left: (activeSweep.index % 2) * 2 * CELL,
              top: Math.floor(activeSweep.index / 2) * 2 * CELL,
              width: 2 * CELL,
              height: 2 * CELL,
              background: "#FFEB3B",
              opacity: sweepAmt * 0.4,
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />
        )}

        {/* the box-boundary lines — a separate bold overlay (matching the real app's own
            separate box-stroke layer), not per-cell borders */}
        <svg width={gridW} height={gridH} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <rect x={BOX_LINE / 2} y={BOX_LINE / 2} width={gridW - BOX_LINE} height={gridH - BOX_LINE} fill="none" stroke="#1B1440" strokeWidth={BOX_LINE} />
          <line x1={gridW / 2} y1={0} x2={gridW / 2} y2={gridH} stroke="#1B1440" strokeWidth={BOX_LINE} />
          <line x1={0} y1={gridH / 2} x2={gridW} y2={gridH / 2} stroke="#1B1440" strokeWidth={BOX_LINE} />
        </svg>
      </div>

      {/* the number pad — only the grid's own digits, matching the real reduced pad */}
      <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
        {values.map((v) => {
          let press = 0;
          for (const b of blanks) {
            if (grid[b.row][b.col].value !== v) continue;
            press = Math.max(press, pressAmt(b.padTapAt, 7));
          }
          return (
            <div
              key={v}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: press > 0.05 ? "#4FBF74" : "#38A169",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 5px 0 rgba(0,0,0,0.2)",
                transform: `scale(${1 - press * 0.12})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 32, color: "#FFFFFF" }}>{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
