// NUMBER MERGE SIM — a generic tile-keyframe renderer. Unlike the earlier version (which
// scripted each "round" as its own isolated 2-tile vignette that reset every time), this one
// just draws whatever a real persistent 4x4 board timeline says: one evolving grid, spawns and
// swipes computed by the ACTUAL merge algorithm (src/lib/merge2048.ts, ported from
// Merge2048ViewModel.swift), not hand-authored per beat. The reel builds the full tile-by-tile
// timeline once (see short_game_number_merge.tsx) and this component only interpolates it.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

// Merge2048Palette.bg, verified against Merge2048Models.swift.
export const TILE_COLORS: Record<number, string> = {
  2: "#FFE0B2",
  4: "#FFCC80",
  8: "#FFB74D",
  16: "#FF8A65",
  32: "#FF7043",
  64: "#EF5350",
  128: "#AB47BC",
  256: "#7E57C2",
};
export const tileInk = (v: number) => (v <= 4 ? "#5D4037" : "#FFFFFF");

export interface TileKeyframe {
  frame: number;
  row: number;
  col: number;
  value: number;
  opacity?: number;
  scale?: number;
}

export interface TileTrack {
  id: number;
  keyframes: TileKeyframe[]; // sorted ascending by frame
}

export interface SwipeCue {
  dir: "left" | "right" | "up" | "down";
  /** the row (for left/right) or column (for up/down) the chevrons sweep along */
  lane: number;
  atFrame: number;
  toFrame: number;
}

const CELL = 88;
const GAP = 10;
const GRID = 4;

const sampleTrack = (track: TileTrack, frame: number) => {
  const kfs = track.keyframes;
  if (frame < kfs[0].frame) return null;
  let a = kfs[0];
  let b = kfs[kfs.length - 1];
  for (let i = 0; i < kfs.length - 1; i++) {
    if (frame >= kfs[i].frame && frame <= kfs[i + 1].frame) {
      a = kfs[i];
      b = kfs[i + 1];
      break;
    }
    if (frame > kfs[i + 1].frame) {
      a = kfs[i + 1];
      b = kfs[i + 1];
    }
  }
  const span = b.frame - a.frame;
  const p = span > 0 ? Math.max(0, Math.min(1, (frame - a.frame) / span)) : 1;
  const row = a.row + (b.row - a.row) * p;
  const col = a.col + (b.col - a.col) * p;
  const opacity = (a.opacity ?? 1) + ((b.opacity ?? 1) - (a.opacity ?? 1)) * p;
  const scale = (a.scale ?? 1) + ((b.scale ?? 1) - (a.scale ?? 1)) * p;
  const value = p < 1 ? a.value : b.value;
  return { row, col, opacity, scale, value };
};

export const NumberMergeSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  tracks: TileTrack[];
  swipeCues: SwipeCue[];
  targetLabel: string;
  scale?: number;
}> = ({ frame, fps, x, y, tracks, swipeCues, targetLabel, scale = 1 }) => {
  const t = frame / fps;
  const boardW = GRID * CELL + (GRID - 1) * GAP;
  const cellPos = (r: number, c: number) => ({ left: c * (CELL + GAP), top: r * (CELL + GAP) });
  const breathe = 1 + Math.sin(t * 1.4) * 0.02;

  const cue = swipeCues.find((c) => frame >= c.atFrame - 4 && frame < c.toFrame + 4);

  return (
    <div style={{ position: "absolute", left: x, top: y, width: boardW, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* target pill — matches the real "Reach N!" header */}
      <div style={{ textAlign: "center", marginBottom: 26 }}>
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
            padding: "10px 32px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          {targetLabel}
        </span>
      </div>

      <div style={{ position: "relative", width: boardW, height: boardW, background: "rgba(255,255,255,0.22)", borderRadius: 20, transform: `scale(${breathe})` }}>
        {/* empty cell grid */}
        {Array.from({ length: GRID }, (_, r) =>
          Array.from({ length: GRID }, (_, c) => {
            const p = cellPos(r, c);
            return (
              <div
                key={`${r}-${c}`}
                style={{ position: "absolute", left: p.left, top: p.top, width: CELL, height: CELL, borderRadius: 14, background: "rgba(255,255,255,0.4)" }}
              />
            );
          })
        )}

        {/* the swipe-direction cue: three chevrons sweeping along the active row/column, one
            per direction — a rotated '›' rather than four different glyphs, so it stays
            visually consistent across every direction */}
        {cue &&
          (() => {
            const horizontal = cue.dir === "left" || cue.dir === "right";
            const reversed = cue.dir === "left" || cue.dir === "up";
            const rotation = { right: 0, down: 90, left: 180, up: -90 }[cue.dir];
            const laneStart = cue.lane * (CELL + GAP) + CELL / 2;
            return [0, 1, 2].map((i) => {
              const p = interpolate(frame, [cue.atFrame, cue.toFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const travel = reversed ? boardW - CELL - p * (boardW - CELL) : p * (boardW - CELL);
              const lead = travel + (reversed ? i * 30 : -i * 30);
              const op = interpolate(lead, [-20, 0, boardW - CELL], [0, 0.9, 0]);
              const along = Math.max(0, Math.min(boardW - 30, lead));
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: horizontal ? along : laneStart - 16,
                    top: horizontal ? laneStart - 16 : along,
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    textShadow: "0 2px 4px rgba(0,0,0,0.35)",
                    opacity: op,
                    zIndex: 3,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  ›
                </span>
              );
            });
          })()}

        {/* every tile on the board, driven purely by its own precomputed keyframe track */}
        {tracks.map((track) => {
          const s = sampleTrack(track, frame);
          if (!s || s.opacity <= 0.01) return null;
          const left = s.col * (CELL + GAP);
          const top = s.row * (CELL + GAP);
          return (
            <div
              key={track.id}
              style={{
                position: "absolute",
                left,
                top,
                width: CELL,
                height: CELL,
                borderRadius: 14,
                background: TILE_COLORS[s.value] ?? "#FFB74D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: s.opacity,
                boxShadow: "0 4px 0 rgba(0,0,0,0.18)",
                transform: `scale(${s.scale})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: s.value >= 100 ? 30 : 36, color: tileInk(s.value) }}>{s.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
