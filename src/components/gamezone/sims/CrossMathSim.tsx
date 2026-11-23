// CROSS MATH SIM — a scripted, frame-driven recreation of the real game (iOS "Cross Math"),
// not a playable engine. Cell colors copied from CrossMathPlayView.swift: golden F2CE5A for
// given/operator cells, cream FAF3D3 for fillable boxes, green C8E6C9/81C784 for a solved
// run, blue 0074D5 selection stroke, dark-brown 3E2723 digits, purple 7E57C2/512DA8 tray
// tiles, and the real toolbar row (undo/erase/restart/hint) in its real colors. The demo
// level uses two-digit numbers and one multiplication run, on purpose, so it reads as a
// real puzzle rather than a toy example:
//
//        14  +  7  =  21        across:  14 + 7  = 21
//        x      -               down A:  14 x 4  = 56   (col 0)
//        4      3                down B:  7  - 3  = 4    (col 2)
//        =      =
//        56     4
//
// Fillable boxes: the 4 (r2c0), the 7 (r0c2, shared with down B), the 3 (r2c2). Tray carries
// 2 decoys alongside the 3 correct tiles, same as the real tray's shuffled options. The
// reel's storyboard drives select/place/glow timing, an across/down highlight sweep for the
// "goes across... and down... and cross each other" line, a denied-retap demo for the
// "every tile can be used only once" rule, and a hint-button pulse for "three hints" — so
// every long narration line gets its own visual change instead of the board just sitting.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

/** the given/op cells carry a slow shimmer sweep — a puzzle sitting there between events
 *  (setup, hints, "200 levels") is otherwise dead still for seconds at a time, which the
 *  guard sweep's FROZEN check (rightly) flags. A per-cell brightness pulse, phase-offset by
 *  position so it reads as a wave rather than a flat blink, keeps real motion in frame
 *  continuously without implying anything about the puzzle state. */
const shimmer = (t: number, phase: number): number => 0.5 + Math.sin(t * 2.2 + phase) * 0.5;

type CellKind = "given" | "op" | "empty" | "absent";
interface Cell {
  kind: CellKind;
  label: string;
  /** which runs this cell belongs to, for the green glow */
  runs: number[]; // 0 = across row0, 1 = down col0, 2 = down col2
}

const A = (label: string, runs: number[]): Cell => ({ kind: "given", label, runs });
const O = (label: string, runs: number[]): Cell => ({ kind: "op", label, runs });
const E = (label: string, runs: number[]): Cell => ({ kind: "empty", label, runs });
const X: Cell = { kind: "absent", label: "", runs: [] };

// prettier-ignore
const BOARD: Cell[][] = [
  [A("14", [0, 1]), O("+", [0]), E("7", [0, 2]), O("=", [0]), A("21", [0])],
  [O("x", [1]),     X,           O("-", [2]),    X,           X],
  [E("4", [1]),     X,           E("3", [2]),    X,           X],
  [O("=", [1]),     X,           O("=", [2]),    X,           X],
  [A("56", [1]),    X,           A("4", [2]),    X,           X],
];

/** tray tiles as the real tray shows them: the 3 correct answers shuffled in among 2 decoys.
 *  FILL_TRAY_INDEX maps each of the 3 storyboard fills to which tray slot supplies it. */
const TRAY = ["9", "4", "7", "5", "3"];
const FILL_TRAY_INDEX = [1, 2, 4];

export interface CrossMathStoryboard {
  /** blue selection ring + tap ring on the first empty cell */
  select1At: number;
  /** tray tile "4" placed into r2c0 */
  place1At: number;
  /** down-run col0 (14x4=56) glows green */
  glow1At: number;
  /** "7" into r0c2 */
  place2At: number;
  /** a used tray tile gets tapped again and is denied — demonstrates "used once" */
  deniedTapAt: number;
  /** across-run row0 glows */
  glow2At: number;
  /** "3" into r2c2 */
  place3At: number;
  /** down-run col2 glows — whole board complete */
  glow3At: number;
  /** the across row (row 0) highlights, for "equations go across..." */
  acrossHintFrom: number;
  acrossHintTo: number;
  /** the down column (col 0) highlights, for "...and down..." */
  downHintFrom: number;
  downHintTo: number;
  /** the toolbar's hint button pulses, for "you get three hints" */
  hintPulseAt: number;
}

const CELL = 130;
const GAP = 0;

export const CrossMathSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  story: CrossMathStoryboard;
  scale?: number;
  /** frame the HUD row (back button, level, timer) fades in — keep this after the hook
   *  title has landed, otherwise the in-game "back" button reads as showing up before the
   *  viewer even knows what the game is. */
  hudFrom?: number;
}> = ({ frame, fps, x, y, story, scale = 1, hudFrom = 0 }) => {
  const cell = CELL * scale;
  const boardW = 5 * cell;
  const t = frame / fps;

  const fills: { r: number; c: number; at: number; trayIndex: number }[] = [
    { r: 2, c: 0, at: story.place1At, trayIndex: FILL_TRAY_INDEX[0] },
    { r: 0, c: 2, at: story.place2At, trayIndex: FILL_TRAY_INDEX[1] },
    { r: 2, c: 2, at: story.place3At, trayIndex: FILL_TRAY_INDEX[2] },
  ];
  const glows: { run: number; at: number }[] = [
    { run: 1, at: story.glow1At },
    { run: 0, at: story.glow2At },
    { run: 2, at: story.glow3At },
  ];

  const filledAt = (r: number, c: number): number | undefined => fills.find((f) => f.r === r && f.c === c)?.at;
  const glowAt = (runs: number[]): number | undefined => {
    const active = glows.filter((g) => runs.includes(g.run) && frame >= g.at);
    if (active.length === 0) return undefined;
    return Math.min(...active.map((g) => g.at));
  };

  const selected = frame >= story.select1At && frame < story.place1At ? { r: 2, c: 0 } : null;

  // across (row0) / down (col0) rule-demo highlight, driven by the narration windows
  const acrossOn = frame >= story.acrossHintFrom && frame <= story.acrossHintTo;
  const downOn = frame >= story.downHintFrom && frame <= story.downHintTo;

  // the whole board breathes gently — continuous motion for the long stretches (setup,
  // hints, "200 levels") where no cell is actively changing.
  const bob = Math.sin(t * 1.3) * 6;
  const breathe = 1 + Math.sin(t * 1.3) * 0.012;

  const elapsedSec = Math.max(0, Math.floor(t));
  const timeLabel = `${Math.floor(elapsedSec / 60)}:${String(elapsedSec % 60).padStart(2, "0")}`;

  const hudIn = interpolate(frame, [hudFrom, hudFrom + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: x, top: y, width: boardW }}>
      {/* the HUD — difficulty/level + running timer, like the real app's own toolbar. No
          "Cross Math" label here: the hook title at the very top of the reel already says
          the game's name — repeating it right below would just be two titles stacked. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 * scale, marginBottom: 22 * scale, opacity: hudIn, transform: `translateY(${(1 - hudIn) * 10}px)` }}>
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 26 * scale,
            color: "#E8432C",
            background: "#FFF",
            border: `3px solid #E8432C`,
            borderRadius: 999,
            padding: `${10 * scale}px ${26 * scale}px`,
            boxShadow: "0 4px 0 rgba(0,0,0,0.12)",
          }}
        >
          Medium · Level 1
        </span>
        <span
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 26 * scale,
            color: "#333",
            background: "#FFF",
            borderRadius: 999,
            padding: `${10 * scale}px ${26 * scale}px`,
            boxShadow: "0 4px 0 rgba(0,0,0,0.12)",
          }}
        >
          ⏱ {timeLabel}
        </span>
      </div>

      <div style={{ transform: `translateY(${bob}px) scale(${breathe})` }}>
      {/* the grid */}
      <div style={{ position: "relative" }}>
        {BOARD.map((row, r) => (
          <div key={r} style={{ display: "flex" }}>
            {row.map((c, ci) => {
              if (c.kind === "absent") return <div key={ci} style={{ width: cell, height: cell }} />;

              const fAt = filledAt(r, ci);
              const isFilled = c.kind !== "empty" || (fAt !== undefined && frame >= fAt);
              const gAt = glowAt(c.runs);
              const glowing = gAt !== undefined;
              const glowIn = glowing ? interpolate(frame, [gAt!, gAt! + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
              const isSel = selected !== null && selected.r === r && selected.c === ci;
              const fillPop = fAt !== undefined ? interpolate(frame, [fAt, fAt + 5, fAt + 10], [0.4, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

              const golden = c.kind === "given" || c.kind === "op";
              // colors + solved split match CrossMathPlayView.swift exactly: prefilled
              // (given/op) cells solve into the lighter C8E6C9, the kid's own blank cells
              // into the deeper 81C784 — the grid itself is always a flush 1px #6D6D6D
              // line on square corners (no rounding), never a thickened/colored border.
              const solvedBg = golden ? `rgba(200,230,201,${glowIn})` : `rgba(129,199,132,${glowIn})`;
              const bg = glowing ? solvedBg : golden ? "#F2CE5A" : "#FAF3D3";

              return (
                <div
                  key={ci}
                  style={{
                    width: cell,
                    height: cell,
                    boxSizing: "border-box",
                    background: golden ? "#F2CE5A" : "#FAF3D3",
                    border: "1px solid #6D6D6D",
                    borderRadius: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: GAP,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {glowing && <div style={{ position: "absolute", inset: 0, background: bg }} />}
                  {isSel && (
                    <div
                      style={{
                        position: "absolute",
                        inset: -4,
                        border: "7px solid #0074D5",
                        borderRadius: 6,
                        boxShadow: "0 0 0 3px rgba(0,116,213,0.35), 0 0 18px rgba(0,116,213,0.6)",
                      }}
                    />
                  )}
                  {golden && !glowing && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "#FFFFFF",
                        opacity: shimmer(t, (r * 5 + ci) * 0.6) * 0.14,
                      }}
                    />
                  )}
                  {(c.kind !== "empty" || isFilled) && (
                    <span
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: cell * (c.label.length > 1 ? 0.36 : 0.44),
                        color: c.kind === "op" ? "#0074D5" : "#3E2723",
                        transform: `scale(${c.kind === "empty" ? fillPop : 1})`,
                      }}
                    >
                      {c.label}
                    </span>
                  )}
                  {/* tap ring on the selected cell */}
                  {isSel && frame <= story.select1At + 10 && (
                    <div
                      style={{
                        position: "absolute",
                        width: cell * interpolate(frame, [story.select1At - 6, story.select1At + 2], [1.6, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                        height: cell * interpolate(frame, [story.select1At - 6, story.select1At + 2], [1.6, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                        border: "6px solid #FFFFFF",
                        borderRadius: 16,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* row/column rule-demo highlight — a bold bracket around the WHOLE row or column,
            not a faint per-cell tint, so it actually reads clearly in a moving video. */}
        {acrossOn && (
          <div
            style={{
              position: "absolute",
              left: -6,
              top: -6,
              width: 5 * cell + 12,
              height: cell + 12,
              border: "7px solid #FF8A00",
              borderRadius: 14,
              boxShadow: "0 0 0 3px rgba(255,138,0,0.3), 0 0 20px rgba(255,138,0,0.7)",
              opacity: 0.75 + Math.sin(t * 5) * 0.25,
              pointerEvents: "none",
            }}
          />
        )}
        {downOn && (
          <div
            style={{
              position: "absolute",
              left: -6,
              top: -6,
              width: cell + 12,
              height: 5 * cell + 12,
              border: "7px solid #0074D5",
              borderRadius: 14,
              boxShadow: "0 0 0 3px rgba(0,116,213,0.3), 0 0 20px rgba(0,116,213,0.7)",
              opacity: 0.75 + Math.sin(t * 5 + 1) * 0.25,
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {/* the tray — purple tiles like the app's, graying out once used; decoys stay live */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 * scale, marginTop: 26 * scale }}>
        {[TRAY.slice(0, 3), TRAY.slice(3)].map((row, rowIdx) => (
          <div key={rowIdx} style={{ display: "flex", justifyContent: "center", gap: 18 * scale }}>
            {row.map((val, colIdx) => {
              const i = rowIdx === 0 ? colIdx : colIdx + 3;
              const fill = fills.find((f) => f.trayIndex === i);
              const usedAt = fill?.at;
              const used = usedAt !== undefined && frame >= usedAt;
              const isDenied = i === FILL_TRAY_INDEX[0] && frame >= story.deniedTapAt && frame <= story.deniedTapAt + 16;
              const deniedShake = isDenied ? Math.sin((frame - story.deniedTapAt) * 2.4) * 6 * (1 - (frame - story.deniedTapAt) / 16) : 0;
              const tapIn = usedAt !== undefined ? interpolate(frame, [usedAt - 8, usedAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
              return (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    width: cell * 0.72,
                    height: cell * 0.72,
                    background: used ? "#CFC8DC" : "#66BB6A",
                    border: `3px solid ${used ? "#A79DBB" : "#388E3C"}`,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: used ? "none" : "0 6px 0 rgba(56,142,60,0.4)",
                    opacity: used ? 0.35 : 1,
                    transform: `translateX(${deniedShake}px)`,
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: cell * 0.34, color: "#FFF" }}>{val}</span>
                  {!used && usedAt !== undefined && tapIn > 0.01 && frame <= usedAt && (
                    <div style={{ position: "absolute", inset: -10 + tapIn * 6, border: "6px solid #FFFFFF", borderRadius: 20, opacity: tapIn }} />
                  )}
                  {isDenied && (
                    <div
                      style={{
                        position: "absolute",
                        inset: -8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: interpolate(frame, [story.deniedTapAt, story.deniedTapAt + 3, story.deniedTapAt + 13, story.deniedTapAt + 16], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                      }}
                    >
                      <span style={{ fontSize: cell * 0.5, color: "#EF5350", fontWeight: 900 }}>✕</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* the toolbar — undo / erase / restart / hint, same colors + order as the real app.
          Bigger than a first pass, and the hint button gets an unmissable callout (glow
          ring + a bouncing arrow pointing straight at it) exactly on "you get three hints",
          not just a subtle scale pulse that's easy to miss in a moving video. */}
      <div style={{ display: "flex", justifyContent: "center", gap: 18 * scale, marginTop: 26 * scale }}>
        {[
          { bg: "#90A4AE", border: "#78909C", label: "↺", small: true },
          { bg: "#EF5350", border: "#C62828", label: "⌫", small: true },
          { bg: "#FFB74D", border: "#F57C00", label: "↻", small: true },
          { bg: "#FFCA28", border: "#F57F17", label: "💡3", small: false },
        ].map((btn, i) => {
          const isHint = i === 3;
          const hintWin = frame >= story.hintPulseAt && frame <= story.hintPulseAt + 46;
          const callOn = isHint && hintWin;
          const pulse = callOn ? 1 + Math.sin(((frame - story.hintPulseAt) / 14) * Math.PI) * 0.14 : 1;
          const arrowBob = callOn ? Math.sin(((frame - story.hintPulseAt) / 8) * Math.PI) * 8 : 0;
          return (
            <div key={i} style={{ position: "relative" }}>
              {callOn && (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: -10,
                      borderRadius: 20,
                      boxShadow: `0 0 0 ${5 + Math.sin(t * 6) * 2}px rgba(255,202,40,0.55)`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: "100%",
                      transform: `translate(-50%, ${-14 + arrowBob}px)`,
                      fontSize: cell * 0.4,
                      color: "#FFCA28",
                      textShadow: "0 2px 0 rgba(0,0,0,0.3)",
                    }}
                  >
                    ⬇
                  </div>
                </>
              )}
              <div
                style={{
                  width: cell * 0.78,
                  height: cell * 0.78,
                  borderRadius: 16,
                  background: btn.bg,
                  border: `3px solid ${btn.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 5px 0 rgba(0,0,0,0.2)",
                  transform: `scale(${pulse})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: cell * (btn.small ? 0.32 : 0.28), color: "#FFF" }}>{btn.label}</span>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
