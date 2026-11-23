// SPEED COMPARE SIM — a scripted, frame-driven recreation of the real game (iOS
// "SpeedComparePlayView" + "BalanceScaleView"), not a playable engine. This is a genuine
// tipping balance scale, not an invented mechanic — colors and shape copied straight from
// BalanceScaleView.swift: gradient fulcrum FFB74D→FF8400, gradient beam FFA726→F57C00, a
// blue-bordered left card (#0074D5) and a pink-bordered right card (#E91E63) hanging from the
// beam ends, idle-rocking while "thinking" and springing to tip toward the heavier side once
// answered — exactly like the real header comment describes it.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface CompareRound {
  left: number;
  right: number;
  /** frame the beam locks/tips toward the correct side (undefined = still idle-rocking) */
  lockAt?: number;
  /** frame a tap-ring lands on the correct comparison button */
  tapAt?: number;
}

export interface SpeedCompareStoryboard {
  targetPromptAt: number;
  rounds: CompareRound[];
  /** frame the buttons row fades in */
  buttonsInAt: number;
  /** each sign lights up as its own word is spoken ("greater than... less than... or equal!") */
  signHighlights: { at: number; sym: "<" | "=" | ">" }[];
  /** "...or two whole equations..." — swaps the card labels to real equations for a window,
      without touching the actual left/right values (so the tilt keeps matching). */
  equationDemo?: { from: number; to: number; left: string; right: string };
}

const BEAM_W = 430;
const CARD_W = 148;
const CARD_H = 112;

export const SpeedCompareSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  story: SpeedCompareStoryboard;
  scale?: number;
  round: CompareRound;
}> = ({ frame, fps, x, y, story, scale = 1, round }) => {
  const t = frame / fps;

  const cmp = round.left === round.right ? 0 : round.left > round.right ? 1 : -1;
  const eq = story.equationDemo;
  const eqShow = eq
    ? interpolate(frame, [eq.from, eq.from + 6, eq.to - 6, eq.to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;
  const locked = round.lockAt !== undefined && frame >= round.lockAt;
  const lockIn = locked ? interpolate(frame, [round.lockAt!, round.lockAt! + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  // idle: the beam rocks gently both ways while "thinking" — never dead still.
  const idleAngle = Math.sin(t * 1.8) * 6;
  // locked: springs toward the heavier side (a simple damped-cosine settle, matching the
  // real view's "springs/bounces toward the heavier side" behavior)
  const settle = locked ? Math.exp(-lockIn * 4) * Math.cos(lockIn * 14) : 1;
  // negative because a positive SVG rotation lifts the LEFT hanger and drops the right one —
  // to make the heavier/bigger side dip down (a real balance scale), the sign flips.
  const tiltTarget = -cmp * 11;
  const angle = locked ? tiltTarget + (idleAngle - tiltTarget) * Math.max(0, settle) : idleAngle;

  // hidden (not just tiny) before the pop-in — a shrunken-but-visible bubble sitting on
  // screen from frame 0 read as a stray empty-feeling artifact, not a real entrance.
  const promptScale = interpolate(frame, [story.targetPromptAt, story.targetPromptAt + 8, story.targetPromptAt + 14], [0.3, 1.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const promptOpacity = interpolate(frame, [story.targetPromptAt - 6, story.targetPromptAt], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const beamY = -30;
  const leftAngle = -Math.PI / 2 - (angle * Math.PI) / 180 * 0.55;
  const rightAngle = Math.PI / 2 - (angle * Math.PI) / 180 * 0.55;
  const hangDist = BEAM_W / 2;
  const leftX = Math.cos(leftAngle) * hangDist;
  const leftDrop = 70 + Math.sin(leftAngle) * hangDist * 0.15;
  const rightX = Math.cos(rightAngle) * hangDist;
  const rightDrop = 70 - Math.sin(rightAngle) * hangDist * 0.15;

  const feedbackShow = locked && frame <= round.lockAt! + 26;
  const feedbackIn = feedbackShow
    ? interpolate(frame, [round.lockAt!, round.lockAt! + 6, round.lockAt! + 10], [0.4, 1.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* prompt capsule — white, orange stroke, exactly like the real header prompt */}
      <div style={{ textAlign: "center", opacity: promptOpacity, transform: `scale(${promptScale})`, marginBottom: 34 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 40,
            color: "#E65100",
            background: "rgba(255,255,255,0.96)",
            border: "4px solid #FF8400",
            borderRadius: 999,
            padding: "14px 36px",
            boxShadow: "0 6px 0 rgba(0,0,0,0.16)",
          }}
        >
          Which side is bigger?
        </span>
      </div>

      <svg width={600} height={330} viewBox="0 0 600 330" style={{ overflow: "visible" }}>
        <g transform="translate(300,60)">
          {/* fulcrum post + base */}
          <path d="M -14 210 L 14 210 L 34 240 L -34 240 Z" fill="#8D6E63" />
          <path d="M 0 30 L -20 90 L 20 90 Z" fill="url(#scaleFulcrum)" />
          <ellipse cx={0} cy={210} rx={70} ry={14} fill="#000" opacity={0.18} />

          <defs>
            <linearGradient id="scaleFulcrum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFB74D" />
              <stop offset="100%" stopColor="#FF8400" />
            </linearGradient>
            <linearGradient id="scaleBeam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFA726" />
              <stop offset="100%" stopColor="#F57C00" />
            </linearGradient>
          </defs>

          {/* the beam — pivots at the apex, tips toward the heavier side */}
          <g transform={`translate(0,30) rotate(${angle})`}>
            <rect x={-BEAM_W / 2} y={-9} width={BEAM_W} height={18} rx={9} fill="url(#scaleBeam)" />
            <circle cx={0} cy={0} r={12} fill="#F57C00" stroke="#FFB74D" strokeWidth={3} />

            {/* left hanger: string + card */}
            <line x1={-BEAM_W / 2} y1={0} x2={-BEAM_W / 2} y2={70} stroke="#8D6E63" strokeWidth={3} />
            <g transform={`translate(${-BEAM_W / 2},${70})`}>
              <rect x={-CARD_W / 2} y={0} width={CARD_W} height={CARD_H} rx={14} fill="#FFFFFF" stroke="#0074D5" strokeWidth={5} />
              <text x={0} y={CARD_H / 2 + 14} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={40} fill="#111" opacity={1 - eqShow} transform={`scale(${1 - eqShow * 0.25})`}>
                {round.left}
              </text>
              {eq && (
                <text x={0} y={CARD_H / 2 + 10} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={30} fill="#111" opacity={eqShow} transform={`scale(${0.75 + eqShow * 0.25})`}>
                  {eq.left}
                </text>
              )}
            </g>

            {/* right hanger */}
            <line x1={BEAM_W / 2} y1={0} x2={BEAM_W / 2} y2={70} stroke="#8D6E63" strokeWidth={3} />
            <g transform={`translate(${BEAM_W / 2},${70})`}>
              <rect x={-CARD_W / 2} y={0} width={CARD_W} height={CARD_H} rx={14} fill="#FFFFFF" stroke="#E91E63" strokeWidth={5} />
              <text x={0} y={CARD_H / 2 + 14} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={40} fill="#111" opacity={1 - eqShow} transform={`scale(${1 - eqShow * 0.25})`}>
                {round.right}
              </text>
              {eq && (
                <text x={0} y={CARD_H / 2 + 10} textAnchor="middle" fontFamily={KID_FONT} fontWeight={700} fontSize={30} fill="#111" opacity={eqShow} transform={`scale(${0.75 + eqShow * 0.25})`}>
                  {eq.right}
                </text>
              )}
            </g>
          </g>
        </g>
      </svg>

      {/* correct feedback emoji, popping below the scale, like the real view */}
      {feedbackShow && (
        <div style={{ textAlign: "center", marginTop: 6, marginBottom: -6, transform: `scale(${feedbackIn})`, opacity: feedbackIn > 0.05 ? 1 : 0 }}>
          <span style={{ fontSize: 62 }}>✅</span>
        </div>
      )}

      {/* the three compare buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 44 }}>
        {(["<", "=", ">"] as const).map((sym, i) => {
          const isCorrect = (sym === ">" && cmp === 1) || (sym === "<" && cmp === -1) || (sym === "=" && cmp === 0);
          const tapAt = round.tapAt;
          const showTapRing = isCorrect && tapAt !== undefined && frame >= tapAt - 8 && frame <= tapAt + 4;
          const pressed = isCorrect && locked;

          // sequential "here's your 3 choices" glow — each sign lights up as its own word
          // ("greater than... less than... or equal!") is spoken, on top of any pressed state.
          const hl = story.signHighlights.find((h) => h.sym === sym);
          const hlWindow = 16;
          const hlIn = hl ? interpolate(frame, [hl.at - 4, hl.at, hl.at + hlWindow - 4, hl.at + hlWindow], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

          const bg = pressed ? "#2E7D32" : "#0074D5";
          const bounce = (pressed ? 1 + Math.max(0, 1 - lockIn * 3) * 0.08 : 1) * (1 + hlIn * 0.16);
          return (
            <div key={i} style={{ position: "relative" }}>
              {showTapRing && (
                <div
                  style={{
                    position: "absolute",
                    inset: -10,
                    border: "6px solid #FFFFFF",
                    borderRadius: 20,
                    opacity: interpolate(frame, [tapAt! - 8, tapAt!], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    transform: `scale(${interpolate(frame, [tapAt! - 8, tapAt!], [1.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}
                />
              )}
              {hlIn > 0.05 && (
                <div
                  style={{
                    position: "absolute",
                    inset: -14,
                    borderRadius: 24,
                    border: "6px solid #FFD54F",
                    opacity: hlIn,
                    boxShadow: `0 0 ${18 * hlIn}px 6px rgba(255,213,79,${0.7 * hlIn})`,
                  }}
                />
              )}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 22,
                  background: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 7px 0 rgba(0,0,0,0.22)",
                  transform: `scale(${bounce})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 46, color: "#FFF" }}>{sym}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
