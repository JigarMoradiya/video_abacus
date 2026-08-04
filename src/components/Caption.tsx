// Caption band. Karaoke highlighting on the word currently being spoken — taken as a
// reference from the phonics series, where it is what keeps a muted viewer following
// along. Captions are a label track, not the teaching: a changing caption alone does not
// count as a changing screen.

import React from "react";
import { BAND, W } from "../data/tokens";
import { TYPE } from "../lib/fonts";
import type { Track } from "../lib/timing";

export const Caption: React.FC<{
  track: Track;
  frame: number;
  ink: string;
  accent: string;
}> = ({ track, frame, ink, accent }) => {
  const active = track.activeAt(frame);
  if (!active) return null;
  const { phrase, wordIdx } = active;

  return (
    <div
      style={{
        position: "absolute",
        top: BAND.captionTop,
        left: 0,
        width: W,
        height: BAND.captionBottom - BAND.captionTop,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 130px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.94)",
          borderRadius: 999,
          padding: "16px 48px",
          maxWidth: "100%",
          textAlign: "center",
          boxShadow: "0 8px 0 rgba(0,0,0,0.16)",
          fontFamily: TYPE.family,
          fontSize: TYPE.caption.size,
          fontWeight: TYPE.caption.weight,
          lineHeight: 1.25,
          color: "#243B53",
        }}
      >
        {phrase.words.map((w, i) => (
          <span
            key={i}
            style={{
              color: i === wordIdx ? "#FFF" : "#243B53",
              background: i === wordIdx ? accent : "transparent",
              borderRadius: 10,
              padding: i === wordIdx ? "2px 8px" : "2px 0",
              margin: "0 3px",
              display: "inline-block",
            }}
          >
            {w.word}
          </span>
        ))}
      </div>
    </div>
  );
};
