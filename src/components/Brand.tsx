// Locked brand furniture: the headline pill and the corner badge.
// Exactly ONE badge on screen at a time, at one shared size, in every episode.

import React from "react";
import { Img, staticFile } from "remotion";
import { KID_FONT } from "../lib/fonts";
import { RIG, BEAD } from "../data/theme";

/** Headline pill — sits in the headline band, coloured by the current world. */
export const HeadlinePill: React.FC<{
  text: string;
  fill: string;
  ink: string;
  size?: number;
}> = ({ text, fill, ink, size = 62 }) => (
  <div
    style={{
      display: "inline-block",
      background: fill,
      borderRadius: 999,
      padding: "16px 54px",
      boxShadow: "0 9px 0 rgba(0,0,0,0.20)",
      maxWidth: 1500,
    }}
  >
    <span
      style={{
        fontFamily: KID_FONT,
        fontSize: size,
        fontWeight: 700,
        color: ink,
        whiteSpace: "pre-wrap",
        lineHeight: 1.14,
        display: "block",
        textAlign: "center",
      }}
    >
      {text}
    </span>
  </div>
);

/**
 * Corner badge — the app's REAL icon plus its name. It was a hand-drawn abacus glyph,
 * which did not match the product the video is advertising.
 */
export const BrandBadge: React.FC<{ x?: number; y?: number }> = ({ x = 1560, y = 30 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: "rgba(255,255,255,0.94)",
      borderRadius: 999,
      // more room at both ends so the icon and the wordmark are not against the edges
      padding: "10px 34px 10px 20px",
      boxShadow: "0 6px 0 rgba(0,0,0,0.15)",
    }}
  >
    <Img
      src={staticFile("brand/app_icon.png")}
      style={{ width: 54, height: 54, borderRadius: 13 }}
    />
    <span
      style={{
        fontFamily: KID_FONT,
        fontSize: 27,
        fontWeight: 700,
        color: "#123A5C",
        // tight leading: ABACUS and FOR KIDS are one lockup, not two lines of text
        lineHeight: 0.92,
      }}
    >
      ABACUS
      <br />
      <span style={{ fontSize: 15, letterSpacing: 1.6, color: "#5A7183" }}>FOR KIDS</span>
    </span>
  </div>
);

/** Publisher credit. Bottom-left at 16:9; TOP-left in portrait, where the caption band reaches
 *  to 1340 and a bottom-pinned credit sat inside it. */
export const PoweredBy: React.FC<{ portrait?: boolean }> = ({ portrait }) => (
  <div
    style={{
      position: "absolute",
      left: portrait ? 30 : 44,
      ...(portrait ? { top: 26 } : { bottom: 26 }),
      display: "flex",
      alignItems: "center",
      gap: 9,
      background: "rgba(255,255,255,0.72)",
      borderRadius: 999,
      padding: "7px 18px",
      fontFamily: KID_FONT,
      fontWeight: 700,
      fontSize: 20,
      color: "#43596B",
      letterSpacing: 0.6,
    }}
  >
    powered by <span style={{ color: "#123A5C", fontSize: 23 }}>VEDAAVI</span>
  </div>
);
