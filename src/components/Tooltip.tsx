// The teaching label.
//
// Design note — this is deliberately NOT the app's tooltip. The app draws dark text on a
// plain white sheet, which is right for a UI a child can dwell on and wrong here: every
// other card in this video is a solid colour with white bold text and a depth shadow
// (headline pill, value chips, answer cards), so a white sheet read as a foreign element
// dropped into the frame.
//
// So the app supplies the WORDING and the colour VOCABULARY; the card is ours —
//   · solid fill in the colour the app uses for that part
//   · white text with the sticker double-draw, so it reads on any world
//   · emphasised terms in a light inset pill rather than a colour change
//
// No speech-bubble tail: the drawn arrow already says which thing the card is about, and
// the two together read as two pointers competing.
//
// One useful consequence: because the fill carries the part's colour, the card, the arrow
// and that rod's value chips are all the same hue — a stronger cue than colouring three
// words inside a white box.

import React from "react";
import { interpolate } from "remotion";
import { TYPE } from "../lib/fonts";
import { TOUR_SHORT, TOUR_INK, type Seg } from "../data/tour";

/** Card colour per tour step — the app's own accent for that part. */
const STEP_COLOR: string[] = [
  TOUR_INK.frame, // 0 frame
  TOUR_INK.rods, // 1 rods
  TOUR_INK.beam, // 2 beam
  TOUR_INK.topSection, // 3 top section
  TOUR_INK.bottomSection, // 4 bottom section
  TOUR_INK.topSection, // 5 upper beads
  TOUR_INK.bottomSection, // 6 lower beads
  TOUR_INK.rods, // 7 unit's place
  "#B4245A", // 8  1st rod values
  "#B4245A", // 9  2nd rod values
  "#B4245A", // 10 3rd rod values
  TOUR_INK.range, // 11 one column
  TOUR_INK.range, // 12 two columns
  TOUR_INK.range, // 13 three columns
  "#1B4FD8", // 14 add lower
  "#1B4FD8", // 15 add upper
  "#8A1BD8", // 16 take lower
  "#8A1BD8", // 17 take upper
];

export const tooltipColor = (step: number): string => STEP_COLOR[step] ?? "#334155";

/** Width the card needs for its own text, so a two-word label is a two-word card. */
export const tooltipWidth = (step: number): number => {
  const segs = TOUR_SHORT[step];
  if (!segs) return 300;
  const longest = Math.max(
    ...segs
      .map((s) => s.text)
      .join("")
      .split("\n")
      .map((l) => l.length)
  );
  // Each emphasised term is an inset pill with its own padding and margin, so a line with
  // two pills needs noticeably more room than its character count suggests. Without this,
  // "Bar or Beam" wrapped to two lines inside a card that had room for one.
  const pills = segs.filter((s) => s.kind === "strong").length;
  return Math.round(
    Math.min(560, Math.max(260, longest * TYPE.tooltip.size * 0.58 + 84 + pills * 30))
  );
};

const textShadow = `${TYPE.tooltip.size * 0.035}px ${TYPE.tooltip.size * 0.035}px 0 rgba(0,0,0,0.35)`;

/** Height the card will occupy, so callers can anchor an arrow to its real edge. */
export const cardHeight = (lines: number): number =>
  Math.round(48 + lines * TYPE.tooltip.size * 1.75);

/** Lines of text a tooltip renders on. */
export const tooltipLines = (step: number): number => {
  const segs = TOUR_SHORT[step];
  if (!segs) return 1;
  return segs
    .map((s) => s.text)
    .join("")
    .split("\n").length;
};

/** Shared card shell, so labels and tooltips are one component and cannot diverge again. */
export const TeachCard: React.FC<{
  color: string;
  progress: number;
  width?: number;
  children: React.ReactNode;
}> = ({ color, progress, width, children }) => {
  const pop = interpolate(progress, [0, 0.16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "relative",
        width,
        // block, not inline-block: as an inline-block inside a centred container the card
        // was narrower than its panel and centred within it, so the arrow's origin —
        // computed from the panel — sat outside the card's actual edge
        display: "block",
        transform: `scale(${0.9 + pop * 0.1})`,
        opacity: pop,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          top: 9,
          borderRadius: 34,
          background: "rgba(0,0,0,0.26)",
        }}
      />
      <div
        style={{
          position: "relative",
          borderRadius: 34,
          background: color,
          padding: "22px 30px",
          fontFamily: TYPE.family,
          fontSize: TYPE.tooltip.size,
          // roomy: the inset pills are taller than a text line, so at 1.34 two pill rows
          // sat directly against each other
          lineHeight: 1.75,
          color: "#FFFFFF",
          textAlign: "center",
          whiteSpace: "pre-wrap",
          border: "4px solid rgba(255,255,255,0.55)",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Tooltip: React.FC<{
  step: number;
  progress: number;
  width?: number;
}> = ({ step, progress, width }) => {
  const segs: Seg[] | undefined = TOUR_SHORT[step];
  if (!segs) return null;
  const color = tooltipColor(step);

  return (
    <TeachCard color={color} progress={progress} width={width ?? tooltipWidth(step)}>
      {segs.map((s, i) =>
        s.kind === "strong" ? (
          // emphasis survives on a saturated card as an inset pill, not a hue change
          <span
            key={i}
            style={{
              display: "inline-block",
              background: "rgba(255,255,255,0.95)",
              color,
              fontWeight: 700,
              borderRadius: 12,
              padding: "2px 13px",
              margin: "3px 4px",
            }}
          >
            {s.text}
          </span>
        ) : (
          <span
            key={i}
            style={{
              fontWeight: s.kind === "bold" ? 800 : TYPE.tooltip.weight,
              textShadow,
            }}
          >
            {s.text}
          </span>
        )
      )}
    </TeachCard>
  );
};
