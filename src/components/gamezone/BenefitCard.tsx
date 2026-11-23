// THE PARENT BEAT — "Not just a game!" benefits card, the series signature. Identical layout
// in every game reel (parents learn to expect it), only the bullets and accent change. Shows
// over the spotlight-dim, rows staggering in, with the same continuous glow pulse the
// quick-math reels' cards use so it never sits dead on screen.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export interface Benefit {
  icon: string;
  text: string;
  /** frame this benefit reveals — set to when the narration actually says it; falls back to a fixed stagger if omitted */
  atFrame?: number;
}

export const BenefitCard: React.FC<{
  frame: number;
  fps: number;
  startFrame: number;
  benefits: Benefit[];
  accent: string;
  /** card block position/size */
  x: number;
  y: number;
  width: number;
}> = ({ frame, fps, startFrame, benefits, accent, x, y, width }) => {
  const cardIn = interpolate(frame, [startFrame, startFrame + 10, startFrame + 16], [0.4, 1.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardOpacity = interpolate(frame, [startFrame, startFrame + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const glow = 0.55 + Math.sin((frame / fps) * 3.2) * 0.35;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        opacity: cardOpacity,
        transform: `scale(${cardIn})`,
        background: "#FFF8E8",
        border: `7px solid ${accent}`,
        borderRadius: 38,
        padding: "30px 34px 34px",
        boxShadow: `0 12px 0 rgba(0,0,0,0.28), 0 0 0 12px ${accent}${Math.round(glow * 0.3 * 255).toString(16).padStart(2, "0")}`,
        fontFamily: KID_FONT,
      }}
    >
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 46, color: accent, marginBottom: 18 }}>
        NOT JUST A GAME!
      </div>
      {benefits.map((b, i) => {
        const rowAt = b.atFrame ?? startFrame + 14 + i * 14;
        const rowIn = interpolate(frame, [rowAt, rowAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        // the icon gets its own pop-in badge (elastic overshoot + settle) plus a continuous
        // gentle wiggle once revealed — a plain static emoji next to text read as "just a
        // picture", not an animated benefit.
        const iconPop = interpolate(frame, [rowAt, rowAt + 7, rowAt + 12], [0, 1.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const iconWiggle = rowIn > 0.98 ? Math.sin((frame / fps) * 2.6 + i * 1.3) * 8 : 0;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: i === 0 ? 0 : 16,
              opacity: rowIn,
              transform: `translateX(${(1 - rowIn) * 34}px)`,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 66,
                height: 66,
                borderRadius: "50%",
                background: `${accent}22`,
                border: `3px solid ${accent}`,
                fontSize: 40,
                transform: `scale(${iconPop}) rotate(${iconWiggle}deg)`,
                flexShrink: 0,
              }}
            >
              {b.icon}
            </span>
            <span style={{ fontWeight: 700, fontSize: 36, color: "#1B1440", lineHeight: 1.2 }}>{b.text}</span>
          </div>
        );
      })}
    </div>
  );
};
