// Caption band. Karaoke highlighting on the word currently being spoken — taken as a
// reference from the phonics series, where it is what keeps a muted viewer following
// along. Captions are a label track, not the teaching: a changing caption alone does not
// count as a changing screen.
//
// Three states, not two. The first version drew every unspoken word in the same full-
// strength ink as the spoken ones, so the whole sentence competed for attention and a single
// pill was all that said where the voice had got to. Now:
//
//   already said   full ink
//   being said     the world's accent as a filled pill — the karaoke beat
//   not yet said   faded, so the eye reads only as far as the voice
//
// On top of that the words carrying the LESSON get their own colour in every state. A child
// who cannot yet read the whole sentence can still see that it is about "beam" or "five".

import React from "react";
import { TYPE } from "../lib/fonts";
import type { Track } from "../lib/timing";
import type { Layout } from "../stage/layout";

const SAID = "#243B53";
const COMING = "#AFBECB"; // same hue, dropped in contrast — it reads as "not yet"
const KEY = "#C2410C"; // the bead orange, so a keyword ties to the thing on screen
const KEY_COMING = "#E7B79F";

/**
 * The words worth colouring: the instrument's own vocabulary, and the numbers. Deliberately
 * short — highlight half a sentence and nothing is highlighted. These are the app's terms
 * (rod, beam, upper, lower), because they are what the series is teaching.
 */
const KEYWORDS = new Set(
  (
    "zero one two three four five six seven eight nine ten " +
    "abacus rod rods beam bead beads upper lower frame " +
    "thumb index finger fingers"
  ).split(" ")
);

const bare = (w: string): string => w.toLowerCase().replace(/[^a-z0-9]/g, "");

export const Caption: React.FC<{
  track: Track;
  frame: number;
  ink: string;
  accent: string;
  /** Extra words this episode wants coloured, beyond the shared vocabulary. */
  keywords?: string[];
  layout: Layout;
}> = ({ track, frame, accent, keywords, layout }) => {
  const active = track.activeAt(frame);
  if (!active) return null;
  const { phrase, wordIdx } = active;
  const keys = keywords ? new Set([...KEYWORDS, ...keywords.map(bare)]) : KEYWORDS;

  return (
    <div
      style={{
        position: "absolute",
        top: layout.band.captionTop,
        left: 0,
        width: layout.W,
        height: layout.band.captionBottom - layout.band.captionTop,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // a 1360 px caption has no side margin at all in a 1080 frame
        padding: layout.portrait ? "0 34px" : "0 130px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.94)",
          borderRadius: 999,
          padding: layout.portrait ? "14px 30px" : "16px 48px",
          maxWidth: "100%",
          textAlign: "center",
          boxShadow: "0 8px 0 rgba(0,0,0,0.16)",
          fontFamily: TYPE.family,
          fontSize: layout.captionSize || TYPE.caption.size,
          fontWeight: TYPE.caption.weight,
          lineHeight: 1.25,
          color: SAID,
        }}
      >
        {phrase.words.map((w, i) => {
          const isActive = i === wordIdx;
          const coming = i > wordIdx;
          const isKey = keys.has(bare(w.word));
          const color = isActive
            ? "#FFF"
            : isKey
            ? coming
              ? KEY_COMING
              : KEY
            : coming
            ? COMING
            : SAID;
          return (
            <span
              key={i}
              style={{
                color,
                background: isActive ? accent : "transparent",
                // a keyword carries a little more weight, so it reads before the eye has
                // finished the sentence
                fontWeight: isKey && !isActive ? 700 : TYPE.caption.weight,
                borderRadius: 10,
                padding: isActive ? "2px 8px" : "2px 0",
                margin: "0 3px",
                display: "inline-block",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
