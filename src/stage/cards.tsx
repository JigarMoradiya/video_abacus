// The two panel looks that are not the teaching card itself.
//
// Labels used to be a solid coloured Card with white sticker text while tooltips were a
// white sheet, so two panels doing the same job looked like two different systems on
// adjacent lines. They share a shell now.

import React from "react";
import { BAND, FPS, W } from "../data/tokens";
import { bob } from "../lib/motion";
import { TYPE } from "../lib/fonts";
import { Card, StickerText } from "../components/Sticker";

/** The one plain panel look: white card, dark text in the part's colour. */
export const InfoCard: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <div
    style={{
      display: "block",
      background: "#FFFFFF",
      borderRadius: 34,
      padding: "22px 30px",
      boxShadow: "0 10px 0 rgba(0,0,0,0.22)",
      fontFamily: TYPE.family,
      fontSize: TYPE.tooltip.size,
      fontWeight: TYPE.tooltip.strong,
      lineHeight: 1.32,
      color,
      whiteSpace: "pre-wrap",
      textAlign: "center",
      boxSizing: "border-box",
    }}
  >
    {text}
  </div>
);

/**
 * A short label for the thing on stage.
 *
 * `x`/`y`/`w` are the SAME panel coordinates the arrow starts from. The label used to
 * compute its own top while the arrow used the panel slot, so the arrow's origin floated
 * off the card — one source of truth for the box is the fix.
 */
export const StageLabel: React.FC<{
  text: string;
  color: string;
  frame: number;
  /** left edge of the abacus, so the label can never sit on top of it */
  limit: number;
  pos: "side" | "above" | "aboveRod";
  x: number;
  y: number;
  w: number;
}> = ({ text, color, frame, limit, pos, x, y, w }) => {
  const gap = limit - 56 - 36;
  // "aboveRod" always uses the supplied panel coordinates — that is the whole point of it
  const beside = pos === "aboveRod" || (pos === "side" && gap >= 330);
  if (pos === "above") {
    // Answers and prompts read better over the abacus than off to one side — but in the
    // HEADLINE band (0-200), not just above the frame. At PUSH scale the abacus top is at
    // ~216, so a 170 px answer card at stageTop-120 overlapped it by 55 px.
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: 24 + bob(frame, FPS, 5, 3.6),
          textAlign: "center",
        }}
      >
        <Card bg={color} radius={40}>
          <StickerText
            size={/\d/.test(text) && text.replace(/\s/g, "").length <= 7 ? 104 : 46}
            style={{ display: "block", textAlign: "center" }}
          >
            {text}
          </StickerText>
        </Card>
      </div>
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        // the panel coordinates the arrow also uses — never a second set of its own
        left: beside ? x : 0,
        width: beside ? w : W,
        textAlign: "center",
        top: beside ? y : BAND.stageTop - 96 + bob(frame, FPS, 6, 3.4),
      }}
    >
      <InfoCard text={text} color={color} />
    </div>
  );
};
