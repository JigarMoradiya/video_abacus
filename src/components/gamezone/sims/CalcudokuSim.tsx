// CALCUDOKU SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording: an irregular grid of "cages" — groups of cells outlined
// together, each with a small target clue in its first cell — filled one cage at a time, with
// a completed cage flashing green). Not a playable engine — one fixed, pre-chosen 3x3
// Calcudoku plays out: the grid reveals with just its cage outlines and clues, the "3+" cage
// (1+2=3) and "6×" cage (2×3=6) are each walked through by name, then every remaining cage
// completes together while a row/column sweep reinforces "no repeats."

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface CalcCage {
  id: number;
  /** reading-order cells; the FIRST one carries the clue label */
  cells: { row: number; col: number }[];
  label: string; // "3+", "3", "6×", "2-", "2×"
  color: string; // this cage's identifying border/accent color
}

export interface CellFill {
  row: number;
  col: number;
  value: number;
  cageId: number;
  /** frame this cell's number pops in */
  fillAt: number;
}

export interface CageBeat {
  cageId: number;
  /** frame the cage's OUTLINE glows, when the narrator first names it (before any fill) */
  introAt?: number;
  /** frame this cage flashes green as solved */
  solvedAt: number;
}

export const CalcudokuSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  cages: CalcCage[];
  fills: CellFill[];
  cageRevealAt: number; // when the blank cage outlines + clue labels appear
  cageBeats: CageBeat[]; // the 1-2 narrated cages
  allSolvedAt: number; // every remaining cage flashes together
  sweepRowAt: number;
  sweepColAt: number;
  bannerAt: number;
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, cages, fills, cageRevealAt, cageBeats, allSolvedAt, sweepRowAt, sweepColAt, bannerAt, headerAt, scale = 1 }) => {
  const t = frame / fps;
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // an OPAQUE pastel of the cage's own color — a translucent wash would blend with whatever
  // sits behind the sim (this reel's dark deep-sea background), turning the tint muddy gray
  // instead of a soft pastel, so mix toward white explicitly rather than relying on alpha.
  const lighten = (hex: string, amt: number) => {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    const mix = (c: number) => Math.round(c + (255 - c) * amt);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
  };

  const TILE = 124;
  const GAP = 6; // cage cells sit close together, almost touching, matching the real app
  const gridW = TILE * 3 + GAP * 2;
  const gridH = gridW;
  const cellXY = (row: number, col: number) => ({ x: col * (TILE + GAP), y: row * (TILE + GAP) });

  const cageAt = (row: number, col: number) => cages.find((c) => c.cells.some((p) => p.row === row && p.col === col));
  const cageSolvedAt = (cageId: number) => cageBeats.find((b) => b.cageId === cageId)?.solvedAt;
  const cageIntroAt = (cageId: number) => cageBeats.find((b) => b.cageId === cageId)?.introAt;
  const isCageSolved = (cageId: number) => {
    const at = cageSolvedAt(cageId);
    if (at !== undefined) return frame >= at;
    return frame >= allSolvedAt;
  };

  const idleBob = Math.sin(t * 1.4) * 4;
  const firstReveal = cageRevealAt;
  const chaseActive = frame < firstReveal + 40;
  const chasePhase = ((frame - firstReveal) / 16) % 9;
  const previewGlow = (row: number, col: number) => {
    if (!chaseActive) return 0;
    const idx = row * 3 + col;
    const d = Math.abs(chasePhase - idx);
    const dist = Math.min(d, 9 - d);
    return Math.max(0, 1 - dist);
  };

  const rowSweepPulse = (r: number) => pressAmt(sweepRowAt + r * 6, 9);
  const colSweepPulse = (c: number) => pressAmt(sweepColAt + c * 6, 9);

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
          🐙 Calcudoku
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
          Fill every cage to match its clue!
        </span>
      </div>

      <div style={{ position: "relative", width: gridW, height: gridH, margin: "0 auto", transform: `translateY(${idleBob}px)` }}>
        {/* row/column sweep outlines, for "no repeats in any row or column" */}
        {[0, 1, 2].map((r) => {
          const op = rowSweepPulse(r);
          if (op <= 0.02) return null;
          return (
            <div
              key={`rs${r}`}
              style={{
                position: "absolute",
                left: -10,
                top: cellXY(r, 0).y - 10,
                width: gridW + 20,
                height: TILE + 20,
                borderRadius: 20,
                border: `6px solid rgba(46,158,98,${op})`,
              }}
            />
          );
        })}
        {[0, 1, 2].map((c) => {
          const op = colSweepPulse(c);
          if (op <= 0.02) return null;
          return (
            <div
              key={`cs${c}`}
              style={{
                position: "absolute",
                left: cellXY(0, c).x - 10,
                top: -10,
                width: TILE + 20,
                height: gridH + 20,
                borderRadius: 20,
                border: `6px solid rgba(94,90,214,${op})`,
              }}
            />
          );
        })}

        {[0, 1, 2].flatMap((row) =>
          [0, 1, 2].map((col) => {
            const cage = cageAt(row, col)!;
            const isFirst = cage.cells[0].row === row && cage.cells[0].col === col;
            const fill = fills.find((f) => f.row === row && f.col === col);
            const revealed = frame >= cageRevealAt;
            const filled = fill && frame >= fill.fillAt;
            const solved = isCageSolved(cage.id);
            const pop = fill ? interpolate(frame, [fill.fillAt, fill.fillAt + 6, fill.fillAt + 10], [0.4, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
            const cageGlow = pressAmt(cageSolvedAt(cage.id), 14);
            const introGlow = pressAmt(cageIntroAt(cage.id), 12);
            const glow = previewGlow(row, col);

            // cage-boundary borders: thick + colored where the neighbor is a DIFFERENT cage
            // (or off-grid), a slim neutral divider where it's the SAME cage.
            const nb = (dr: number, dc: number) => (row + dr >= 0 && row + dr < 3 && col + dc >= 0 && col + dc < 3 ? cageAt(row + dr, col + dc) : undefined);
            const edge = (dr: number, dc: number) => {
              const n = nb(dr, dc);
              return n && n.id === cage.id ? `1px solid rgba(0,0,0,0.06)` : `4px solid ${cage.color}`;
            };

            const bg = solved ? "#DDF5E3" : introGlow > 0.15 ? "#FFF3D0" : filled ? lighten(cage.color, 0.82) : "#FFFFFF";
            const textColor = solved ? "#2E7D32" : filled ? cage.color : "#1B1440";

            return (
              <div
                key={`${row}-${col}`}
                style={{
                  position: "absolute",
                  left: cellXY(row, col).x,
                  top: cellXY(row, col).y,
                  width: TILE,
                  height: TILE,
                  borderTop: edge(-1, 0),
                  borderBottom: edge(1, 0),
                  borderLeft: edge(0, -1),
                  borderRight: edge(0, 1),
                  background: revealed ? bg : "#FFFFFF",
                  opacity: revealed ? 1 : 0,
                  boxShadow: solved
                    ? `inset 0 0 ${10 + 8 * cageGlow}px rgba(46,158,98,${0.3 + 0.3 * cageGlow})`
                    : introGlow > 0.15
                    ? `inset 0 0 ${10 + 10 * introGlow}px rgba(245,124,0,${0.3 * introGlow})`
                    : glow > 0.05
                    ? `inset 0 0 ${8 + 8 * glow}px rgba(142,79,208,${0.25 * glow})`
                    : "none",
                  transform: `scale(${filled ? pop : introGlow > 0.15 ? 1 + introGlow * 0.05 : 1})`,
                }}
              >
                {isFirst && (
                  <span
                    style={{
                      position: "absolute",
                      left: 8,
                      top: 4,
                      fontFamily: KID_FONT,
                      fontWeight: 700,
                      fontSize: 18,
                      color: solved ? "#2E7D32" : cage.color,
                      opacity: revealed ? 1 : 0,
                    }}
                  >
                    {cage.label}
                  </span>
                )}
                {filled && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 44, color: textColor }}>{fill!.value}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
