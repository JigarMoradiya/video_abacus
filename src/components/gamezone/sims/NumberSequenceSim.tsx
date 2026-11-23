// NUMBER SEQUENCE PUZZLE SIM — a scripted, frame-driven recreation of the real game (confirmed
// from the user's own gameplay recording: a 3x3 grid of pink numbered tiles with one blank
// cell, tapped-adjacent tiles slide into the blank, and completing 1-8 in reading order pops a
// "You Did It!" celebration). Not a playable engine — a shuffled board plays out several real
// slides (not just one): two quick early slides settle most of the board during the hook, then
// the narrated final slide (tile 6, one move from the blank) completes it, and the board reads
// 1-8 in order.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface PuzzleTile {
  value: number;
  /** FINAL (solved) position */
  row: number;
  col: number;
  /** starting position, only set for tiles that slide */
  preRow?: number;
  preCol?: number;
  /** this tile's own slide window — only set for tiles that slide */
  slideStart?: number;
  slideEnd?: number;
  /** frame this tile pops into the board initially (at its STARTING position) */
  revealAt: number;
  /** frame during the "one, two, three..." readout when this tile's own number is named */
  emphasizeAt?: number;
}

export const NumberSequenceSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  tiles: PuzzleTile[]; // 8, some of which slide into place over the course of the reel
  /** which tile's slide gets the "next to the empty space" pulse (the narrated final move) */
  adjacentTileValue: number;
  adjacentAt: number;
  solvedAt: number;
  bannerAt: number;
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, tiles, adjacentTileValue, adjacentAt, solvedAt, bannerAt, headerAt, scale = 1 }) => {
  const t = frame / fps;
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const TILE = 124;
  const GAP = 14;
  const gridW = TILE * 3 + GAP * 2;
  const gridH = gridW;
  const cellXY = (row: number, col: number) => ({ x: col * (TILE + GAP), y: row * (TILE + GAP) });

  const solved = frame >= solvedAt;

  // every tile that actually slides, in the order its own slide happens — used both to move
  // each tile and to figure out where the blank cell currently sits (it's always wherever the
  // NEXT tile-to-slide's target square is, until that tile arrives, then it flips to the
  // square that tile just vacated).
  const moves = tiles.filter((tl) => tl.slideStart !== undefined).sort((a, b) => a.slideStart! - b.slideStart!);
  let blankPos = moves.length > 0 ? { row: moves[0].row, col: moves[0].col } : { row: 0, col: 0 };
  for (const mv of moves) {
    const mid = (mv.slideStart! + mv.slideEnd!) / 2;
    if (frame >= mid) blankPos = { row: mv.preRow!, col: mv.preCol! };
  }
  const adjacentTile = tiles.find((tl) => tl.value === adjacentTileValue);

  const idleBob = Math.sin(t * 1.4) * 4;
  // a chase-glow sweeping cell to cell in reading order, active only before the board finishes
  // popping in — the several seconds of narration before the slides otherwise sit still.
  const firstFillAt = Math.min(...tiles.map((tl) => tl.revealAt));
  const lastFillAt = Math.max(...tiles.map((tl) => tl.revealAt));
  const chaseActive = frame < lastFillAt + 20;
  const chasePhase = ((frame - firstFillAt) / 14) % 9;
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
            border: "3px solid #0288D1",
            borderRadius: 999,
            padding: "9px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          🐧 Number Sequence
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
          Slide until 1 to 8 is in order!
        </span>
      </div>

      <div style={{ position: "relative", width: gridW, height: gridH, margin: "0 auto", transform: `translateY(${idleBob}px)` }}>
        {/* the board's own frame */}
        <div style={{ position: "absolute", left: -10, top: -10, width: gridW + 20, height: gridH + 20, borderRadius: 26, background: "#FBEAF0" }} />

        {/* the blank cell — always exactly one square, wherever it currently sits */}
        <div
          style={{
            position: "absolute",
            left: cellXY(blankPos.row, blankPos.col).x,
            top: cellXY(blankPos.row, blankPos.col).y,
            width: TILE,
            height: TILE,
            borderRadius: 22,
            border: "3px dashed #C9A0AE",
            opacity: pressAmt(adjacentAt, 12) > 0.15 ? 0.5 + 0.5 * Math.sin(t * 6) : 1,
            boxShadow: pressAmt(adjacentAt, 12) > 0.15 ? "0 0 14px 4px rgba(245,124,0,0.4)" : "none",
          }}
        />

        {tiles.map((tile, i) => {
          const isSliding = tile.slideStart !== undefined;
          const slideProgress = isSliding
            ? interpolate(frame, [tile.slideStart!, tile.slideEnd!], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 1;
          const pos = isSliding
            ? {
                x: interpolate(slideProgress, [0, 1], [cellXY(tile.preRow!, tile.preCol!).x, cellXY(tile.row, tile.col).x]),
                y: interpolate(slideProgress, [0, 1], [cellXY(tile.preRow!, tile.preCol!).y, cellXY(tile.row, tile.col).y]),
              }
            : cellXY(tile.row, tile.col);
          const isRevealed = frame >= tile.revealAt;
          const popIn = interpolate(frame, [tile.revealAt, tile.revealAt + 6, tile.revealAt + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pulse = pressAmt(tile.emphasizeAt);
          const adjacentPulse = tile === adjacentTile ? pressAmt(adjacentAt, 12) : 0;
          const lift = isSliding ? Math.sin(slideProgress * Math.PI) * 14 : 0;
          const glow = previewGlow(tile.row, tile.col);
          const bg = pulse > 0.15 || adjacentPulse > 0.15 ? "#FFF3D0" : solved ? "#DDF5E3" : "#F98CAE";
          const border = pulse > 0.15 || adjacentPulse > 0.15 ? "#F57C00" : solved ? "#2E9E62" : "#D9497A";
          const textColor = pulse > 0.15 || adjacentPulse > 0.15 ? "#B4460B" : solved ? "#2E7D32" : "#FFFFFF";
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y - lift,
                width: TILE,
                height: TILE,
                borderRadius: 22,
                background: isRevealed ? bg : "#FFFFFF",
                border: `5px solid ${isRevealed ? border : "#E4E0EE"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isRevealed ? 1 : 0,
                boxShadow: solved
                  ? `0 0 ${14 + 8 * (0.5 + Math.sin(t * 2.3 + i) * 0.5)}px ${4 + 3 * (0.5 + Math.sin(t * 2.3 + i) * 0.5)}px rgba(46,158,98,0.45)`
                  : pulse > 0.15 || adjacentPulse > 0.15
                  ? `0 0 ${10 + 12 * Math.max(pulse, adjacentPulse)}px ${4 + 4 * Math.max(pulse, adjacentPulse)}px rgba(245,124,0,0.5)`
                  : glow > 0.05
                  ? `0 0 ${8 + 10 * glow}px ${3 + 3 * glow}px rgba(255,255,255,0.7)`
                  : "0 6px 0 rgba(0,0,0,0.14)",
                transform: `scale(${popIn * (1 + pulse * 0.12 + adjacentPulse * 0.1)})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 40, color: isRevealed ? textColor : "#FFFFFF" }}>{tile.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
