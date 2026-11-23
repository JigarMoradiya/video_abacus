// MAGIC SQUARE SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording: a 3x3 grid of colorful number tiles, live row/column sum
// badges beside and below the grid that turn green the moment a line hits the target, and a
// mascot cheering "Awesome!" once the whole board is solved). Not a playable engine — one
// fixed, pre-chosen 3x3 magic square plays out: the grid fills in reading order, then the
// narrated walkthrough re-visits row 1 (2+7+6) and row 3 (4+3+8) specifically, before every
// remaining line celebrates together.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface SquareCell {
  value: number;
  color: string;
  /** frame this cell's number pops into its blank box */
  revealAt: number;
  /** only set for cells that get individually re-highlighted during the narrated walkthrough */
  emphasizeAt?: number;
}

export interface LineBeat {
  /** the 3 cell indices that make up this line, in reading order */
  cells: number[];
  /** frame each of those 3 cells gets its walkthrough pulse (same order as `cells`) */
  emphasizeAt: number[];
  /** frame this line's sum badge flashes green, celebrating the line */
  badgeAt: number;
}

export const MagicSquareSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  cells: SquareCell[]; // 9, row-major
  target: number;
  gridRevealAt: number;
  bannerAt: number;
  rowBeats: LineBeat[]; // the narrated rows (row 0 and row 2)
  /** frame every remaining line (middle row + all 3 columns) celebrates together */
  solvedAt: number;
  sweepRowsAt: number;
  sweepColsAt: number;
  sweepAllAt: number;
  magicAt: number;
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, cells, target, gridRevealAt, bannerAt, rowBeats, solvedAt, sweepRowsAt, sweepColsAt, sweepAllAt, magicAt, headerAt, scale = 1 }) => {
  const t = frame / fps;
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const TILE = 124;
  const GAP = 14;
  const gridW = TILE * 3 + GAP * 2;
  const gridH = gridW;
  const cellPos = (i: number) => ({ x: (i % 3) * (TILE + GAP), y: Math.floor(i / 3) * (TILE + GAP) });

  const filled = (i: number) => frame >= cells[i].revealAt;
  const rowSum = (r: number) => [0, 1, 2].reduce((s, c) => s + (filled(r * 3 + c) ? cells[r * 3 + c].value : 0), 0);
  const colSum = (c: number) => [0, 1, 2].reduce((s, r) => s + (filled(r * 3 + c) ? cells[r * 3 + c].value : 0), 0);
  const rowFilledCount = (r: number) => [0, 1, 2].filter((c) => filled(r * 3 + c)).length;
  const colFilledCount = (c: number) => [0, 1, 2].filter((r) => filled(r * 3 + c)).length;

  const row0Beat = rowBeats.find((b) => b.cells[0] < 3);
  const row2Beat = rowBeats.find((b) => b.cells[0] >= 6);
  const rowCelebrated = (r: number) => {
    if (frame >= solvedAt) return true;
    if (r === 0 && row0Beat) return frame >= row0Beat.badgeAt;
    if (r === 2 && row2Beat) return frame >= row2Beat.badgeAt;
    return false;
  };
  const colCelebrated = () => frame >= solvedAt;

  // a continuous idle bob — several seconds pass between the grid finishing its reveal and
  // the narrated walkthrough starting, and every sim in this series carries the same idle
  // motion so that gap never reads as frozen.
  const idleBob = Math.sin(t * 1.4) * 4;
  // a chase-glow sweeping cell to cell in reading order, active for the whole blank-grid
  // stretch before the first number fills in — otherwise the blank boxes just sit still for
  // the back half of "a grid of boxes...", which motion_check correctly flags as frozen.
  const firstFillAt = Math.min(...cells.map((c) => c.revealAt));
  const chaseActive = frame < firstFillAt;
  const chasePhase = (t * 2.6) % 9;
  const previewGlow = (i: number) => {
    if (!chaseActive) return 0;
    const d = Math.abs(chasePhase - i);
    const dist = Math.min(d, 9 - d);
    return Math.max(0, 1 - dist);
  };

  // sequential row/column sweep pulses for "every row, every column" — cosmetic re-highlight
  // passes over an already-solved board, not a state change.
  const rowSweepPulse = (r: number) => pressAmt(sweepRowsAt + r * 7, 10);
  const colSweepPulse = (c: number) => pressAmt(sweepColsAt + c * 7, 10);
  const allSweepPulse = pressAmt(sweepAllAt, 14);
  // a highlight OUTLINE framing the whole row/column — not just each cell's own border — so
  // "every row, every column" reads as one connected line lighting up, not three separate
  // tiles. An outline (not a filled band) stays visible even though the cells themselves are
  // opaque and would otherwise hide a fill sitting behind them. Rows glow green (matching the
  // row badge), columns glow purple (matching the banner/sim accent). This is a TRANSIENT
  // flash-and-fade at the moment each line is actually celebrated, plus the sweep pulse during
  // the dedicated "every row, every column" beat — not a permanent outline, which would leave
  // every line boxed forever and bury the sweep's own traveling highlight in clutter.
  const rowFlash = (r: number) => {
    if (r === 0 && row0Beat) return Math.max(pressAmt(row0Beat.badgeAt, 20), pressAmt(solvedAt, 20));
    if (r === 2 && row2Beat) return Math.max(pressAmt(row2Beat.badgeAt, 20), pressAmt(solvedAt, 20));
    return pressAmt(solvedAt, 20);
  };
  const rowBandOpacity = (r: number) => Math.max(rowFlash(r), rowSweepPulse(r));
  const colBandOpacity = (c: number) => Math.max(pressAmt(solvedAt + c * 4, 20), colSweepPulse(c));

  const lineBadge = (label: string, sum: number, complete: boolean, celebrate: boolean, keyBase: string) => {
    const bump = celebrate ? 0.5 + Math.sin(t * 2.2 + keyBase.length) * 0.5 : 0;
    return (
      <div
        style={{
          minWidth: 52,
          height: 44,
          padding: "0 10px",
          borderRadius: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: celebrate ? "#DDF5E3" : "#F2F0F5",
          border: `4px solid ${celebrate ? "#2E9E62" : "#C9C4D6"}`,
          boxShadow: celebrate ? `0 0 ${8 + 6 * bump}px ${3 + 2 * bump}px rgba(46,158,98,0.4)` : "0 3px 0 rgba(0,0,0,0.1)",
          transform: `scale(${sum > 0 ? 1 : 0.5})`,
          opacity: sum > 0 ? 1 : 0,
          transition: "none",
        }}
      >
        <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 24, color: celebrate ? "#2E7D32" : "#5B5468" }}>{sum > 0 ? sum : ""}</span>
      </div>
    );
  };

  return (
    <div style={{ position: "absolute", left: x, top: y, width: gridW + 260, transform: `scale(${scale})`, transformOrigin: "top center" }}>
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
          🐢 Magic Square
        </span>
      </div>

      {/* "Make every line = 15!" banner, matching the real game's own callout */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 18,
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
          Make every line = {target}!
        </span>
      </div>

      <div
        style={{
          opacity: interpolate(frame, [gridRevealAt - 4, gridRevealAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(frame, [gridRevealAt, gridRevealAt + 8, gridRevealAt + 14], [0.3, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
        }}
      >
      <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
        {/* fixed-width column: the grid and its column badges share EXACTLY this width, so
            the "15" boxes below always land centered under their own column regardless of
            how wide the row-badge gutter next to it is. */}
        <div style={{ width: gridW }}>
        <div style={{ position: "relative", width: gridW, height: gridH, transform: `translateY(${idleBob}px)` }}>
          {/* row/column highlight OUTLINES, framing the whole line (visible even though the
              opaque cells sit on top of anything filled behind them) */}
          {[0, 1, 2].map((r) => {
            const op = rowBandOpacity(r);
            if (op <= 0.02) return null;
            return (
              <div
                key={`rb${r}`}
                style={{
                  position: "absolute",
                  left: -10,
                  top: cellPos(r * 3).y - 10,
                  width: gridW + 20,
                  height: TILE + 20,
                  borderRadius: 30,
                  border: `7px solid rgba(46,158,98,${op})`,
                  boxShadow: `0 0 ${10 + 14 * op}px ${3 + 5 * op}px rgba(46,158,98,${op * 0.55})`,
                }}
              />
            );
          })}
          {[0, 1, 2].map((c) => {
            const op = colBandOpacity(c);
            if (op <= 0.02) return null;
            return (
              <div
                key={`cb${c}`}
                style={{
                  position: "absolute",
                  left: cellPos(c).x - 10,
                  top: -10,
                  width: TILE + 20,
                  height: gridH + 20,
                  borderRadius: 30,
                  border: `7px solid rgba(142,79,208,${op})`,
                  boxShadow: `0 0 ${10 + 14 * op}px ${3 + 5 * op}px rgba(142,79,208,${op * 0.55})`,
                }}
              />
            );
          })}

          {cells.map((cell, i) => {
            const pos = cellPos(i);
            const isRevealed = frame >= cell.revealAt;
            const popIn = interpolate(frame, [cell.revealAt, cell.revealAt + 6, cell.revealAt + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const pulse = pressAmt(cell.emphasizeAt);
            const r = Math.floor(i / 3);
            const c = i % 3;
            const celebrate = rowCelebrated(r) || colCelebrated();
            const sweepPulse = Math.max(rowSweepPulse(r), colSweepPulse(c), allSweepPulse);
            const glow = previewGlow(i);
            const bg = pulse > 0.15 ? "#FFF3D0" : celebrate ? "#DDF5E3" : "#F2F0F5";
            const border = pulse > 0.15 ? "#F57C00" : celebrate ? "#2E9E62" : cell.color;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: pos.x,
                  top: pos.y,
                  width: TILE,
                  height: TILE,
                  borderRadius: 22,
                  background: isRevealed ? (celebrate ? bg : cell.color) : "#FFFFFF",
                  border: `5px solid ${isRevealed ? border : "#E4E0EE"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: celebrate
                    ? `0 0 ${14 + 8 * (0.5 + Math.sin(t * 2.3 + i) * 0.5)}px ${4 + 3 * (0.5 + Math.sin(t * 2.3 + i) * 0.5)}px rgba(46,158,98,0.45)`
                    : pulse > 0.15
                    ? `0 0 ${10 + 12 * pulse}px ${4 + 4 * pulse}px rgba(245,124,0,0.5)`
                    : glow > 0.05
                    ? `0 0 ${8 + 10 * glow}px ${3 + 3 * glow}px rgba(255,255,255,0.7)`
                    : "0 6px 0 rgba(0,0,0,0.12)",
                  transform: `scale(${popIn * (1 + pulse * 0.15 + sweepPulse * 0.1)})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 40, color: isRevealed ? (celebrate ? "#2E7D32" : "#FFFFFF") : "#FFFFFF", opacity: isRevealed ? 1 : 0 }}>
                  {cell.value}
                </span>
              </div>
            );
          })}

          {/* running-sum bubble over a row mid-walkthrough (2 -> 9 -> 15, or 4 -> 7 -> 15) */}
          {rowBeats.map((beat, bi) => {
            const r = Math.floor(beat.cells[0] / 3);
            const emphasizedCount = beat.emphasizeAt.filter((a) => frame >= a).length;
            const visible = frame >= beat.emphasizeAt[0] - 4 && frame < beat.badgeAt + 16;
            if (!visible || emphasizedCount === 0) return null;
            const partial = beat.cells.slice(0, emphasizedCount).reduce((s, ci) => s + cells[ci].value, 0);
            const rowY = cellPos(beat.cells[0]).y;
            return (
              <div
                key={bi}
                style={{
                  position: "absolute",
                  left: -76,
                  top: rowY + TILE / 2 - 22,
                  width: 60,
                  textAlign: "center",
                  transform: `scale(${interpolate(frame, [beat.emphasizeAt[0] - 4, beat.emphasizeAt[0] + 4], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    fontFamily: KID_FONT,
                    fontWeight: 700,
                    fontSize: 26,
                    color: "#FFFFFF",
                    background: partial === target ? "#2E9E62" : "#8E4FD0",
                    borderRadius: 999,
                    padding: "5px 16px",
                    boxShadow: "0 3px 0 rgba(0,0,0,0.2)",
                  }}
                >
                  {partial}
                </div>
              </div>
            );
          })}
        </div>

        {/* column sum badges, below the grid — same gridW-wide container as the grid itself,
            so these always land centered under their own column. */}
        <div style={{ display: "flex", justifyContent: "center", gap: GAP, marginTop: 12 }}>
          {[0, 1, 2].map((c) => (
            <div key={c} style={{ width: TILE, display: "flex", justifyContent: "center" }}>
              {lineBadge(`col${c}`, colSum(c), colFilledCount(c) === 3, colCelebrated(), `col${c}`)}
            </div>
          ))}
        </div>
        </div>

        {/* row sum badges, to the right of the grid — matching the real UI exactly */}
        <div style={{ display: "flex", flexDirection: "column", gap: GAP, justifyContent: "flex-start" }}>
          {[0, 1, 2].map((r) => (
            <div key={r} style={{ height: TILE, display: "flex", alignItems: "center" }}>
              {lineBadge(`row${r}`, rowSum(r), rowFilledCount(r) === 3, rowCelebrated(r), `row${r}`)}
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* sparkle glints over the solved grid, "That's the magic!" */}
      {frame >= magicAt - 6 &&
        [
          { cx: 40, cy: 30 },
          { cx: gridW - 30, cy: 60 },
          { cx: gridW / 2, cy: gridH - 20 },
          { cx: 20, cy: gridH - 40 },
        ].map((s, i) => {
          const p = pressAmt(magicAt + i * 5, 12);
          if (p <= 0.02) return null;
          return (
            <div key={i} style={{ position: "absolute", left: s.cx, top: s.cy, fontSize: 30 * (0.6 + p * 0.6), opacity: p }}>
              ✨
            </div>
          );
        })}
    </div>
  );
};
