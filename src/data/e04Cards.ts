// E04's teaching cards, keyed by PHRASE index.
//
// There are only two, and that is the point. This episode's teaching runs through the app's own
// place-value chips — `1` / `10` / `100` under each rod, `5` / `50` / `500` above — and through the
// read-out in the headline band. A card that restated either would be a third statement of one idea,
// which is what got E02's finger cards and E03's "1st ROD" card dropped.
//
// So a card appears only where the beads genuinely cannot say the thing:
//
//   · p3 — WHICH rod is the ones rod is a fact about the instrument, not about a bead position, and
//     it is the one claim in the series that is false if left unqualified (VIDEO_SERIES_PLAN §6b:
//     "far right" is true of the abacus in the video and false of the 13-rod Free Mode the child
//     opens in the app). The qualification has to be in words.
//   · p46 — naming the hundreds rod. The chip under it reads "100", which is its worth, not its
//     name; a child needs to hear both to connect them.

import type { CardSpec } from "../stage/types";
import { PLACE_COLORS } from "./tokens";

export const E04_CARDS: Record<number, CardSpec> = {
  3: {
    key: 400,
    color: PLACE_COLORS[0],
    segs: [
      { kind: "strong", text: "ones rod" },
      { kind: "plain", text: "\non this abacus,\nthe far right one" },
    ],
  },
  46: {
    key: 401,
    color: PLACE_COLORS[2],
    segs: [
      { kind: "strong", text: "hundreds rod" },
      { kind: "plain", text: "\none more step\nto the left" },
    ],
  },
};

/**
 * A card must contain a word the line actually says, or it is a card about a different sentence.
 * Throwing at render makes E01's worst shipped bug impossible.
 */
export const assertCards = (textOf: (p: number) => string): void => {
  const MUST: Record<number, string> = {
    3: "ones rod",
    46: "hundreds rod",
  };
  for (const [k, needle] of Object.entries(MUST)) {
    const p = Number(k);
    const text = (textOf(p) ?? "").toLowerCase();
    if (!text.includes(needle)) {
      throw new Error(
        `E04 card ${p} expects the line to mention "${needle}" but it reads "${text}" — ` +
          `the card table is out of step with the phrases`
      );
    }
  }
};
