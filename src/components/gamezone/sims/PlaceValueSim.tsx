// PLACE VALUE SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own gameplay recording: purple expanded-form chips at top ("70" / "+2"), two blank
// place-value slots below labeled T/O with an orange cursor ring on the active one, and a
// numeric keypad the player taps to fill each slot — correct fills turn the slot green). Not a
// playable engine — one fixed example plays out: 70 + 2, typed as 7 then 2, building 72.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface ExpandedChip {
  label: string; // "70", "+2"
  revealAt: number;
  emphasizeAt?: number;
}

export interface PlaceSlot {
  label: string; // "T", "O"
  digit: number;
  /** frame this slot's digit pops in and turns green */
  fillAt: number;
  /** frame the keypad's matching key glows, just before the fill */
  keyPressAt: number;
  /** optional later re-highlight ("tens," "ones,") */
  reEmphasizeAt?: number;
}

export const PlaceValueSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  chips: ExpandedChip[];
  slots: PlaceSlot[];
  result: number;
  bannerAt: number;
  resultAt: number;
  togetherAt: number;
  headerAt: number;
  scale?: number;
}> = ({ frame, fps, x, y, chips, slots, result, bannerAt, resultAt, togetherAt, headerAt, scale = 1 }) => {
  const t = frame / fps;
  const pressAmt = (at: number | undefined, span = 9) => (at === undefined ? 0 : Math.max(0, 1 - Math.abs(frame - at) / span));
  const headerIn = interpolate(frame, [headerAt - 6, headerAt, headerAt + 8], [0, 0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const solved = frame >= resultAt;
  const idleBob = Math.sin(t * 1.4) * 4;

  // the active (next-to-fill) slot gets the orange cursor ring, matching the real UI exactly
  const nextSlotIdx = slots.findIndex((s) => frame < s.fillAt);
  const activeIdx = nextSlotIdx === -1 ? slots.length - 1 : nextSlotIdx;

  // a chase-glow sweeping key to key across the whole keypad, active for the entire stretch
  // before the first slot actually gets typed — the hook, the title, and the chip reveal all
  // happen before that, several seconds where nothing else in the sim's own content area is
  // changing, which motion_check correctly flags as frozen without this.
  const chaseActive = frame < slots[0].fillAt;
  const chasePhase = (t * 2.2) % 11;
  const keyGlow = (i: number) => {
    if (!chaseActive) return 0;
    const d = Math.abs(chasePhase - i);
    const dist = Math.min(d, 11 - d);
    return Math.max(0, 1 - dist);
  };

  const SLOT = 108;
  const SLOT_GAP = 20;
  const slotsW = slots.length * SLOT + (slots.length - 1) * SLOT_GAP;

  const KEY = 62;
  const KEY_GAP = 12;
  const keyRows = [
    ["1", "2", "3", "4", "5"],
    ["6", "7", "8", "9", "0", "⌫"],
  ];
  const keyRowW = (n: number) => n * KEY + (n - 1) * KEY_GAP;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: 620, transform: `scale(${scale})`, transformOrigin: "top center" }}>
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
          🐿️ Place Value
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
          Build the number from its pieces!
        </span>
      </div>

      {/* the expanded-form chips — "70" + "2" */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, marginBottom: 34, transform: `translateY(${idleBob}px)` }}>
        {chips.map((chip, i) => {
          const revealed = frame >= chip.revealAt;
          const popIn = interpolate(frame, [chip.revealAt, chip.revealAt + 6, chip.revealAt + 10], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const pulse = pressAmt(chip.emphasizeAt);
          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#8B5FBF", opacity: revealed ? 1 : 0 }}>+</span>
              )}
              <div
                style={{
                  minWidth: 96,
                  height: 62,
                  padding: "0 22px",
                  borderRadius: 18,
                  background: "#8E4FD0",
                  border: `4px solid ${pulse > 0.15 ? "#F57C00" : "#6A34A8"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: revealed ? 1 : 0,
                  boxShadow: pulse > 0.15 ? `0 0 ${10 + 12 * pulse}px ${4 + 4 * pulse}px rgba(245,124,0,0.5)` : "0 5px 0 rgba(0,0,0,0.16)",
                  transform: `scale(${popIn * (1 + pulse * 0.12)})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: "#FFFFFF" }}>{chip.label.replace("+", "")}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* the place-value slots — T / O, filling green as each digit lands */}
      <div style={{ display: "flex", justifyContent: "center", gap: SLOT_GAP, marginBottom: 10, transform: `translateY(${idleBob}px)` }}>
        {slots.map((slot, i) => {
          const filled = frame >= slot.fillAt;
          const isActive = i === activeIdx && !filled;
          const popIn = interpolate(frame, [slot.fillAt, slot.fillAt + 6, slot.fillAt + 10], [0.4, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rePulse = pressAmt(slot.reEmphasizeAt, 10);
          const finalGlow = solved ? 0.5 + Math.sin(t * 2.3 + i) * 0.5 : 0;
          const bg = filled ? (rePulse > 0.15 ? "#FFF3D0" : "#DDF5E3") : "#EAF2FB";
          const border = filled ? (rePulse > 0.15 ? "#F57C00" : "#2E9E62") : isActive ? "#F5A623" : "#B9D4F2";
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: SLOT,
                  height: SLOT,
                  borderRadius: 22,
                  background: bg,
                  border: `5px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: solved
                    ? `0 0 ${14 + 8 * finalGlow}px ${4 + 3 * finalGlow}px rgba(46,158,98,0.45)`
                    : isActive
                    ? `0 0 ${10 + 8 * (0.5 + Math.sin(t * 3) * 0.5)}px 4px rgba(245,166,35,0.5)`
                    : "0 6px 0 rgba(0,0,0,0.12)",
                  transform: `scale(${filled ? popIn * (1 + rePulse * 0.12) : 1})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 44, color: filled ? "#2E7D32" : "transparent" }}>{slot.digit}</span>
              </div>
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 22, color: "#5B5468", marginTop: 6 }}>{slot.label}</span>
            </div>
          );
        })}
      </div>

      {/* the assembled result, once both slots are correct */}
      <div
        style={{
          textAlign: "center",
          height: 70,
          marginTop: 8,
          opacity: interpolate(frame, [resultAt - 4, resultAt + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(frame, [resultAt - 4, resultAt + 4, resultAt + 12], [0.3, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}) translateY(${idleBob}px)`,
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 40,
            color: "#FFFFFF",
            background: "#2E9E62",
            border: "4px solid #1B5E20",
            borderRadius: 999,
            padding: "10px 34px",
            boxShadow: `0 0 ${14 + 8 * (0.5 + Math.sin(t * 2.3) * 0.5)}px 4px rgba(46,158,98,0.5), 0 6px 0 rgba(0,0,0,0.16)`,
            transform: `scale(${1 + pressAmt(togetherAt, 12) * 0.08})`,
          }}
        >
          = {result}
        </span>
      </div>

      {/* the numeric keypad, matching the real UI exactly — the matching key glows right
          before its slot fills, so it reads as "that's the key that was just tapped" */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: KEY_GAP, marginTop: 18 }}>
        {keyRows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: KEY_GAP, width: keyRowW(row.length) }}>
            {row.map((k, ki) => {
              const flatIdx = ri === 0 ? ki : keyRows[0].length + ki;
              const isBackspace = k === "⌫";
              const pressedSlot = slots.find((s) => s.digit.toString() === k && Math.abs(frame - s.keyPressAt) < 10 && frame >= s.keyPressAt - 4);
              const pressGlow = pressedSlot ? pressAmt(pressedSlot.keyPressAt, 10) : 0;
              const glow = keyGlow(flatIdx);
              return (
                <div
                  key={ki}
                  style={{
                    width: KEY,
                    height: KEY,
                    borderRadius: 14,
                    background: isBackspace ? "#C9C4D6" : "#1E63D6",
                    border: pressGlow > 0.1 ? "4px solid #F57C00" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      pressGlow > 0.1
                        ? `0 0 ${8 + 10 * pressGlow}px ${3 + 3 * pressGlow}px rgba(245,124,0,0.55)`
                        : glow > 0.05
                        ? `0 0 ${6 + 8 * glow}px ${2 + 3 * glow}px rgba(255,255,255,0.8)`
                        : "0 4px 0 rgba(0,0,0,0.16)",
                    transform: `scale(${1 + pressGlow * 0.12 + glow * 0.06})`,
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 26, color: "#FFFFFF" }}>{k}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
