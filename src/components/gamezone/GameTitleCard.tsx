// THE HOOK TITLE — game name + its section chip, popping in on frame 0 of every game reel.
// One shared component so all 18 reels open identically (series identity), with the section's
// accent color doing the differentiation.

import React from "react";
import { interpolate } from "remotion";
import { KID_FONT } from "../../lib/fonts";
import { SECTION_META, type GameSection } from "./GameZoneWorld";

export const GameTitleCard: React.FC<{
  frame: number;
  startFrame?: number;
  title: string;
  section: GameSection;
  /** vertical center of the card block */
  y: number;
  width: number;
}> = ({ frame, startFrame = 0, title, section, y, width }) => {
  const meta = SECTION_META[section];
  const pop = interpolate(frame, [startFrame, startFrame + 8, startFrame + 14], [0.3, 1.14, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const chipIn = interpolate(frame, [startFrame + 8, startFrame + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // the `pop` scale clamps to 0.3 (not 0) before startFrame, which left a small, pale,
  // legible "ghost" of the title visible from frame 0 whenever this card was mounted early
  // for a blurred hook backdrop — actual opacity is needed to make it truly invisible.
  const opacity = interpolate(frame, [startFrame - 4, startFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", top: y, left: 0, width, textAlign: "center", opacity }}>
      <div style={{ transform: `scale(${pop})` }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 78,
            color: "#FFFFFF",
            textShadow: `0 7px 0 rgba(0,0,0,0.25), 0 0 26px ${meta.accent}88`,
            WebkitTextStroke: `3px ${meta.accent}`,
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ opacity: chipIn, transform: `translateY(${(1 - chipIn) * 14}px)` }}>
        <span
          style={{
            display: "inline-block",
            marginTop: 6,
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 30,
            color: "#FFF",
            background: meta.accent,
            borderRadius: 999,
            padding: "8px 26px",
            boxShadow: "0 5px 0 rgba(0,0,0,0.2)",
          }}
        >
          {meta.label}
        </span>
      </div>
    </div>
  );
};
