// The sticker idiom from KidsActionButton.swift: a darker base offset downward, a
// gradient face on top, and text drawn TWICE (black @0.35 offset, then white). The
// double-draw is what lets white text sit on a colourful surface without a scrim.

import React from "react";
import { KID_FONT } from "../lib/fonts";
import { DEPTH_OFFSET, TEXT_SHADOW, TEXT_SHADOW_EM } from "../data/tokens";

export const StickerText: React.FC<{
  children: React.ReactNode;
  size: number;
  color?: string;
  weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size, color = "#FFFFFF", weight = 700, style }) => {
  const off = size * TEXT_SHADOW_EM;
  return (
    <span
      style={{
        fontFamily: KID_FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.1,
        // Both draw layers in one paint — same result as the app's two Text views,
        // without the layout cost of stacking them.
        textShadow: `${off}px ${off}px 0 ${TEXT_SHADOW}`,
        whiteSpace: "pre-wrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** A value label: bold white on a solid colour, as Free Mode draws its value strips. */
export const Chip: React.FC<{
  label: string;
  color: string;
  size?: number;
  opacity?: number;
  style?: React.CSSProperties;
}> = ({ label, color, size = 40, opacity = 1, style }) => (
  <div
    style={{
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `${size * 0.18}px ${size * 0.42}px`,
      borderRadius: 999,
      background: color,
      boxShadow: `0 ${DEPTH_OFFSET}px 0 rgba(0,0,0,0.22)`,
      opacity,
      ...style,
    }}
  >
    <StickerText size={size}>{label}</StickerText>
  </div>
);

/** A rounded panel for headlines and labels — pill or radius 40, never a small radius. */
export const Card: React.FC<{
  children: React.ReactNode;
  bg: string;
  base?: string;
  radius?: number;
  style?: React.CSSProperties;
}> = ({ children, bg, base = "rgba(0,0,0,0.25)", radius = 40, style }) => (
  <div style={{ position: "relative", display: "inline-block", ...style }}>
    <div
      style={{
        position: "absolute",
        inset: 0,
        top: DEPTH_OFFSET,
        borderRadius: radius,
        background: base,
      }}
    />
    <div
      style={{
        position: "relative",
        borderRadius: radius,
        background: bg,
        padding: "18px 40px",
      }}
    >
      {children}
    </div>
  </div>
);
