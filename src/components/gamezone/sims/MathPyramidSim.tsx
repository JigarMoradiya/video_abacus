// MATH PYRAMID SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording: white/cream rounded-rect blocks, blanks shown as "?" until
// typed, the active cell gets a gold border, a numeric keypad (green 1-9, red C/0/⌫) fills
// them in). Not a playable engine — a fixed pyramid of GIVEN and BLANK cells; each blank
// types its digits onto the keypad in turn, the same way NumberDetectiveSim's guesses do.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface PyramidCell {
  value: number;
  given: boolean;
  /** only set on blanks: the frame each digit of `value` gets pressed on the keypad, and the
   *  frame the cell locks in showing the full number */
  digitAt?: number[];
  lockAt?: number;
  /** frames the narrator actually SAYS this cell's number out loud — the cell scales up and
   *  flashes gold right on that word, given or blank, locked or not. This is the general,
   *  reusable rule: whenever a spoken number matches a number on screen, that number reacts
   *  to the word, not just to being tapped/typed. */
  emphasizeAt?: number[];
}

export interface PyramidSpec {
  /** bottom row first */
  rows: PyramidCell[][];
  /** frame this pyramid becomes the one shown (switches over from any earlier spec) */
  start: number;
}

const DIGIT_PAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];
const CELL_W = 108;
const CELL_H = 76;
const GAP = 16; // horizontal — between cells in the same row
const ROW_GAP = 34; // vertical — between rows, kept generous so each row of the pyramid reads as its own step rather than a packed grid

/** 0..1, peaking exactly on a spoken frame and decaying either side. */
const pulseAt = (frame: number, ats: number[] | undefined, span = 10): number => {
  if (!ats || !ats.length) return 0;
  let amt = 0;
  for (const at of ats) amt = Math.max(amt, Math.max(0, 1 - Math.abs(frame - at) / span));
  return amt;
};

export const MathPyramidSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  specs: PyramidSpec[];
  /** frame the "Math Pyramid" header pill appears */
  headerAt: number;
  /** the pyramid GROWS UP into place across this window — driven by the hook line itself
   *  ("A number pyramid stands TALL...") rather than just fading in inert. Defaults keep it
   *  harmless if a caller doesn't pass real word timing. */
  growFrom?: number;
  growTo?: number;
  scale?: number;
}> = ({ frame, fps, x, y, specs, headerAt, growFrom = 0, growTo = 0, scale = 1 }) => {
  let specIdx = 0;
  for (let i = 0; i < specs.length; i++) if (frame >= specs[i].start) specIdx = i;
  const spec = specs[specIdx];

  const t = frame / fps;
  const idleBob = Math.sin(t * 1.5) * 4;
  // "stands tall" — the whole pyramid grows up from squat to full height with a small
  // overshoot landing right on "tall...", instead of just sitting there fully formed while
  // the narrator describes it growing.
  const growIn = growTo > growFrom
    ? interpolate(frame, [growFrom, (growFrom + growTo) / 2, growTo], [0.35, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // every blank still open right now, across the whole pyramid
  const blanks = spec.rows.flat().filter((c) => !c.given);
  const allLocked = blanks.every((c) => frame >= (c.lockAt ?? 0));
  const solvedGlow = allLocked ? 0.5 + Math.sin(t * 2.4) * 0.5 : 0;

  const nRows = spec.rows.length;
  const pyramidW = nRows * CELL_W + (nRows - 1) * GAP;
  const pyramidH = nRows * CELL_H + (nRows - 1) * ROW_GAP;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 640, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      <div style={{ textAlign: "center", marginBottom: 22, opacity: headerIn, transform: `scale(${0.7 + headerIn * 0.3})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 34,
            color: "#1B1440",
            background: "rgba(255,255,255,0.96)",
            border: "3px solid #E8792C",
            borderRadius: 999,
            padding: "9px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          🧱 Math Pyramid
        </span>
      </div>

      {/* the pyramid itself, bottom row widest, tapering up — rows[] is bottom-first, so
          render it reversed for a top-down stack. A soft triangle silhouette sits behind the
          blocks so the shape reads as a PYRAMID immediately, not just a column of centered
          rows — the blocks are furniture inside a triangle, not the only thing implying one. */}
      <div
        style={{
          position: "relative",
          width: pyramidW,
          margin: "34px auto 46px",
          transform: `translateY(${idleBob}px) scale(${growIn})`,
          transformOrigin: "bottom center",
        }}
      >
        <svg
          width={pyramidW + 60}
          height={pyramidH + 30}
          viewBox={`0 0 ${pyramidW + 60} ${pyramidH + 30}`}
          style={{ position: "absolute", left: -30, top: -15, overflow: "visible" }}
        >
          <polygon
            points={`${(pyramidW + 60) / 2},0 ${pyramidW + 60},${pyramidH + 30} 0,${pyramidH + 30}`}
            fill="rgba(232,121,44,0.10)"
            stroke="#E8792C"
            strokeWidth={4}
            strokeDasharray="2 14"
            strokeLinejoin="round"
          />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ROW_GAP, position: "relative" }}>
          {[...spec.rows].reverse().map((row, ri) => (
            <div key={ri} style={{ display: "flex", gap: GAP, justifyContent: "center", width: pyramidW }}>
              {row.map((cell, ci) => {
                const isBlank = !cell.given;
                const digitAt = cell.digitAt ?? [];
                const lockAt = cell.lockAt ?? 0;
                const typedCount = isBlank ? digitAt.filter((f) => frame >= f).length : 0;
                const digits = String(cell.value).split("");
                const shown = !isBlank ? String(cell.value) : typedCount > 0 ? digits.slice(0, typedCount).join("") : "?";
                const locked = isBlank && frame >= lockAt;
                const active = isBlank && !locked && frame >= (digitAt[0] ?? Infinity) - 20;
                const popIn = isBlank && locked
                  ? interpolate(frame, [lockAt, lockAt + 6, lockAt + 10], [0.4, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                  : 1;
                // the apex row (ri===0 after the reverse) celebrates once every blank anywhere
                // in the pyramid has locked in — whether the apex cell itself was given (the
                // 3-row recap) or was the one blank being solved (the 2-block teaching round).
                const isTopSolved = allLocked && ri === 0;
                // spoken-word emphasis: scales up and flashes gold exactly when the narrator
                // says THIS cell's number, independent of given/blank/locked state.
                const pulse = pulseAt(frame, cell.emphasizeAt);
                return (
                  <div
                    key={ci}
                    style={{
                      width: CELL_W,
                      height: CELL_H,
                      borderRadius: 16,
                      background: pulse > 0.15 ? "#FFF3D0" : isTopSolved ? "#E8F5E9" : "#FFFDF7",
                      border: `4px solid ${
                        pulse > 0.15 ? "#F57C00" : isTopSolved ? "#2E7D32" : active ? "#D9A62E" : isBlank && !locked ? "#D9C9A8" : "#E0D6C0"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        pulse > 0.15
                          ? `0 0 ${14 + 10 * pulse}px ${4 + 4 * pulse}px rgba(245,124,0,0.5)`
                          : isTopSolved
                          ? `0 0 ${16 + 8 * solvedGlow}px ${5 + 3 * solvedGlow}px rgba(46,125,50,0.45)`
                          : "0 5px 0 rgba(0,0,0,0.14)",
                      transform: `scale(${popIn * (1 + pulse * 0.3)})`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: KID_FONT,
                        fontWeight: 700,
                        fontSize: 36,
                        color: pulse > 0.15 ? "#B4460B" : isTopSolved ? "#2E7D32" : shown === "?" ? "#B7A67C" : "#1B1440",
                      }}
                    >
                      {shown}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* the numeric keypad — every open blank's digits flash the matching key as they type */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 10, width: 340, marginLeft: "auto", marginRight: "auto" }}>
        {DIGIT_PAD.map((key, i) => {
          const isSpecial = key === "C" || key === "⌫";
          let press = 0;
          for (const cell of blanks) {
            const digits = String(cell.value).split("");
            (cell.digitAt ?? []).forEach((at, di) => {
              if (digits[di] === key) press = Math.max(press, Math.max(0, 1 - Math.abs(frame - at) / 5));
            });
          }
          return (
            <div
              key={i}
              style={{
                height: 54,
                borderRadius: 999,
                background: isSpecial ? "#D9534F" : press > 0.05 ? "#4FBF74" : "#38A169",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 0 rgba(0,0,0,0.18)",
                transform: `scale(${1 - press * 0.1})`,
              }}
            >
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 24, color: "#FFFFFF" }}>{key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
