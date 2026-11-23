// CLOCK MASTER SIM — a scripted, frame-driven recreation of the real game (confirmed from the
// user's own screenshots + gameplay recording): a real analog clock (white face, orange rim,
// black hour hand, blue minute hand) and four multiple-choice time options in a 2x2 grid —
// this is a MULTIPLE-CHOICE game, not a drag-the-hands game. Not a playable engine — each
// round's hands sweep into place as their own words are spoken, then the correct option
// flashes green.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../../lib/fonts";

export interface ClockRound {
  hour: number; // 1-12
  minute: number; // 0-59
  /** frame the hour hand starts sweeping to its position */
  hourAt: number;
  /** frame the minute hand starts sweeping to its position */
  minuteAt: number;
  /** the 4 choices shown, in reading order (top-left, top-right, bottom-left, bottom-right) */
  options: string[];
  correctIndex: number;
  /** frame the correct option flashes green */
  judgeAt: number;
  tapAt?: number;
  activeUntil: number;
}

const FACE_R = 130;

const handAngle = (hour: number, minute: number) => ({
  hourDeg: (hour % 12) * 30 + minute * 0.5,
  minuteDeg: minute * 6,
});

export const ClockMasterSim: React.FC<{
  frame: number;
  fps: number;
  x: number;
  y: number;
  rounds: ClockRound[];
  scale?: number;
}> = ({ frame, fps, x, y, rounds, scale = 1 }) => {
  const round = rounds.find((r) => frame < r.activeUntil) ?? rounds[rounds.length - 1];
  const t = frame / fps;
  const target = handAngle(round.hour, round.minute);

  const hourP = interpolate(frame, [round.hourAt, round.hourAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const minuteP = interpolate(frame, [round.minuteAt, round.minuteAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hourDeg = target.hourDeg * hourP;
  const minuteDeg = target.minuteDeg * minuteP;

  const judged = frame >= round.judgeAt;
  const judgeIn = judged ? interpolate(frame, [round.judgeAt, round.judgeAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const breathe = 1 + Math.sin(t * 1.3) * 0.02;

  return (
    <div style={{ position: "absolute", left: x, top: y, width: FACE_R * 2 + 40, transform: `scale(${scale})`, transformOrigin: "top center" }}>
      {/* header pill — matches the real "What time is it?" header */}
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 32,
            color: "#E65100",
            background: "rgba(255,255,255,0.96)",
            border: "3px solid #FF8400",
            borderRadius: 999,
            padding: "10px 30px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.16)",
          }}
        >
          What time is it?
        </span>
      </div>

      {/* the clock face */}
      <div style={{ display: "flex", justifyContent: "center", transform: `scale(${breathe})` }}>
        <svg width={FACE_R * 2 + 20} height={FACE_R * 2 + 20} viewBox={`0 0 ${FACE_R * 2 + 20} ${FACE_R * 2 + 20}`} style={{ overflow: "visible" }}>
          <g transform={`translate(${FACE_R + 10},${FACE_R + 10})`}>
            <circle cx={0} cy={0} r={FACE_R} fill="#FFFFFF" stroke="#FF8400" strokeWidth={10} />
            {Array.from({ length: 12 }, (_, i) => {
              const a = ((i * 30 - 90) * Math.PI) / 180;
              const isMajor = i % 3 === 0;
              const r1 = FACE_R - (isMajor ? 20 : 14);
              const numR = FACE_R - 34;
              return (
                <g key={i}>
                  <line
                    x1={Math.cos(a) * r1}
                    y1={Math.sin(a) * r1}
                    x2={Math.cos(a) * (FACE_R - 6)}
                    y2={Math.sin(a) * (FACE_R - 6)}
                    stroke="#2A1F1A"
                    strokeWidth={isMajor ? 4 : 2.5}
                    strokeLinecap="round"
                  />
                  <text
                    x={Math.cos(a) * numR}
                    y={Math.sin(a) * numR + 9}
                    textAnchor="middle"
                    fontFamily={KID_FONT}
                    fontWeight={700}
                    fontSize={22}
                    fill="#2A1F1A"
                  >
                    {i === 0 ? 12 : i}
                  </text>
                </g>
              );
            })}
            {/* hour hand — short, black */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={-FACE_R * 0.52}
              stroke="#2A1F1A"
              strokeWidth={9}
              strokeLinecap="round"
              transform={`rotate(${hourDeg})`}
            />
            {/* minute hand — long, blue */}
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={-FACE_R * 0.78}
              stroke="#1976D2"
              strokeWidth={6}
              strokeLinecap="round"
              transform={`rotate(${minuteDeg})`}
            />
            <circle cx={0} cy={0} r={9} fill="#FF8400" />
          </g>
        </svg>
      </div>

      {/* the 2x2 multiple-choice grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
        {round.options.map((opt, i) => {
          const isCorrect = i === round.correctIndex;
          const tapAt = round.tapAt;
          const showTapRing = isCorrect && tapAt !== undefined && frame >= tapAt - 8 && frame <= tapAt + 4;
          const pressed = isCorrect && judged;
          const bg = pressed ? "#2E7D32" : "#FFFFFF";
          const border = pressed ? "#1B5E20" : "#FF8400";
          const ink = pressed ? "#FFFFFF" : "#5D4037";
          const bounce = pressed ? 1 + Math.max(0, 1 - judgeIn * 3) * 0.07 : 1;
          return (
            <div key={i} style={{ position: "relative" }}>
              {showTapRing && (
                <div
                  style={{
                    position: "absolute",
                    inset: -8,
                    border: "5px solid #FFFFFF",
                    borderRadius: 20,
                    opacity: interpolate(frame, [tapAt! - 8, tapAt!], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                    transform: `scale(${interpolate(frame, [tapAt! - 8, tapAt!], [1.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
                  }}
                />
              )}
              <div
                style={{
                  height: 66,
                  borderRadius: 16,
                  background: bg,
                  border: `4px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 5px 0 rgba(0,0,0,0.18)",
                  transform: `scale(${bounce})`,
                }}
              >
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 30, color: ink }}>{opt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
