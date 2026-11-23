// THE "NO ROOM" CALLOUT — a tutorial-style annotation instead of a dim/bright opacity trick:
// a marching-ants dashed box drawn around the lower-bead section (beam to bottom), plus a
// speech-bubble tag with a short line of text. Reads like something POINTING AT the beads and
// SAYING why, rather than just a subtle brightness difference a viewer could miss.

import React from "react";
import type { Rect } from "../../stage/geometry";
import { KID_FONT } from "../../lib/fonts";

export const NoRoomCallout: React.FC<{
  /** the lower section's own rect — sectionBand(box, "bottom") */
  box: Rect;
  frame: number;
  fps: number;
  text: string;
  /** which side of the abacus the bubble sits on, given how much room is open */
  side?: "left" | "right";
}> = ({ box, frame, fps, text, side = "right" }) => {
  const t = frame / fps;

  const pad = 16;
  const rx = box.x - pad;
  const ry = box.y - pad;
  const rw = box.w + pad * 2;
  const rh = box.h + pad * 2;

  const bubbleW = 280;
  const bubbleH = 108;
  const gap = 34;
  const bubbleX = side === "right" ? rx + rw + gap : rx - gap - bubbleW;
  const bubbleY = ry + rh / 2 - bubbleH / 2;
  const tailTipX = side === "right" ? rx + rw : rx;
  const tailMidY = bubbleY + bubbleH / 2;
  const tailHalf = 20;
  const shadowDy = 9;
  const r = 30; // corner radius — modest, not a full pill, so the tail notch is simple to place

  // ONE continuous outline — body and tail as a single path, not two overlapping shapes each
  // drawing their own stroke. Two shapes is why the border broke where they met: the rect's
  // own edge stroke was drawn right across the tail's base instead of opening into it.
  const bubblePath = (dy: number) => {
    const x = bubbleX, y = bubbleY + dy, w = bubbleW, h = bubbleH;
    if (side === "right") {
      // tail notch cut into the LEFT edge, pointing further left at the beads
      return [
        `M ${x + r} ${y}`,
        `L ${x + w - r} ${y}`,
        `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
        `L ${x + w} ${y + h - r}`,
        `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
        `L ${x + r} ${y + h}`,
        `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
        `L ${x} ${tailMidY + tailHalf + dy}`,
        `L ${tailTipX} ${tailMidY + dy}`,
        `L ${x} ${tailMidY - tailHalf + dy}`,
        `L ${x} ${y + r}`,
        `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
        "Z",
      ].join(" ");
    }
    // tail notch cut into the RIGHT edge, pointing further right at the beads
    return [
      `M ${x + r} ${y}`,
      `L ${x + w - r} ${y}`,
      `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
      `L ${x + w} ${tailMidY - tailHalf + dy}`,
      `L ${tailTipX} ${tailMidY + dy}`,
      `L ${x + w} ${tailMidY + tailHalf + dy}`,
      `L ${x + w} ${y + h - r}`,
      `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
      `L ${x + r} ${y + h}`,
      `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
      `L ${x} ${y + r}`,
      `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
      "Z",
    ].join(" ");
  };

  // a comic sticker, not a plain rounded rect: a chunky bottom-offset shadow (the same
  // language every card in this series uses), a bold outline, a bright solid fill, and a
  // little shine highlight — the pale thin-stroke bubble read as a plain tooltip.
  const bubble = (dy: number, fill: string, stroke: string | "none") => (
    <path
      d={bubblePath(dy)}
      fill={fill}
      stroke={stroke}
      strokeWidth={stroke === "none" ? 0 : 5}
      strokeLinejoin="round"
    />
  );

  return (
    <g>
      {/* the marching-ants box — a real "look here" selection marquee, not a static outline */}
      <rect
        x={rx}
        y={ry}
        width={rw}
        height={rh}
        rx={22}
        fill="none"
        stroke="#FFD23F"
        strokeWidth={5}
        strokeDasharray="14 10"
        strokeDashoffset={-t * 46}
      />

      {/* the callout bubble */}
      <g>
        {bubble(shadowDy, "#C7830A", "none")}
        {bubble(0, "#FFC93C", "#8A5A00")}
        {/* a little shine, so it reads as a glossy sticker rather than a flat tile */}
        <ellipse cx={bubbleX + bubbleW * 0.3} cy={bubbleY + bubbleH * 0.28} rx={bubbleW * 0.22} ry={bubbleH * 0.16} fill="#FFFFFF" opacity={0.35} />
        <text
          x={bubbleX + bubbleW / 2}
          y={bubbleY + bubbleH / 2 + 14}
          textAnchor="middle"
          fontFamily={KID_FONT}
          fontWeight={700}
          fontSize={40}
          fill="#5A3800"
        >
          {text}
        </text>
      </g>
    </g>
  );
};
