// THE RESULT POPUP — the win moment every game reel pays off with, mirroring the app's own
// result screen (stars pop in one at a time, clap/confetti for 2+, big friendly title).
// Confetti itself is drawn by the reel layer with the existing Celebration bursts (it's an
// SVG <g>); this card is the HTML centerpiece they burst around.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export const ResultPopup: React.FC<{
  frame: number;
  startFrame: number;
  title: string;
  subtitle?: string;
  stars?: number;
  accent: string;
  x: number;
  y: number;
  width: number;
}> = ({ frame, startFrame, title, subtitle, stars = 3, accent, x, y, width }) => {
  const cardIn = interpolate(frame, [startFrame, startFrame + 8, startFrame + 14], [0.3, 1.12, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(frame, [startFrame, startFrame + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (cardOpacity <= 0.01) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        opacity: cardOpacity,
        transform: `scale(${cardIn})`,
        background: "#FFFFFF",
        border: `7px solid ${accent}`,
        borderRadius: 40,
        padding: "34px 30px 38px",
        textAlign: "center",
        boxShadow: "0 14px 0 rgba(0,0,0,0.25)",
        fontFamily: KID_FONT,
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        {Array.from({ length: 3 }, (_, i) => {
          const starAt = startFrame + 12 + i * 10;
          const sIn = interpolate(frame, [starAt, starAt + 6, starAt + 11], [0, 1.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const earned = i < stars;
          return (
            <span key={i} style={{ fontSize: 76, transform: `scale(${sIn})`, opacity: earned ? 1 : 0.25, filter: earned ? "none" : "grayscale(1)" }}>
              ⭐
            </span>
          );
        })}
      </div>
      <div style={{ fontWeight: 700, fontSize: 52, color: accent, marginTop: 12 }}>{title}</div>
      {subtitle && <div style={{ fontWeight: 700, fontSize: 32, color: "#1B1440", marginTop: 8 }}>{subtitle}</div>}
    </div>
  );
};
