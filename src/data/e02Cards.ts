// E02's teaching cards, keyed by PHRASE index.
//
// Keyed by phrase, never by line: the aligner splits every line on sentence boundaries, so
// E02's 44 spoken lines are 53 phrases and a table numbered by line would be out of step
// from the first split onward. That mistake shipped twice in E01 (DESIGN_SYSTEM §8a).
//
// Phrases 8 and 28 have NO card on purpose. Both are finger instructions, and the hand
// already carries a "thumb" / "index" chip saying the same thing as the tour card would —
// three statements of one idea, and the card physically collided with the hand every time.
//
// Four of these come from the app's own Free Mode tour BY REFERENCE, so where the app has
// wording for something, the app's wording governs — "One rod · 0 to 9", "Unit's Place",
// "Lower Beads", "Upper Beads". The rest are ours, because the tour has no step for "one
// little bead is worth five all by itself", which is the whole point of this episode.
//
// `key` groups consecutive phrases into one card RUN so the card sits still while it is on
// screen instead of re-popping at a new slot on every sentence. Tour cards use the step
// number as their key; ours start at 100 so the two can never collide.

import { TOUR_SHORT, TOUR_INK } from "./tour";
import { tooltipColor } from "../components/Tooltip";
import type { CardSpec } from "../stage/types";
import type { Seg } from "./tour";

/** A card whose wording comes from the app. */
const fromTour = (step: number): CardSpec => ({
  key: step,
  segs: TOUR_SHORT[step],
  color: tooltipColor(step),
});

/** A card of our own. Colours stay inside the app's vocabulary (TOUR_INK / place values). */
const ours = (key: number, color: string, segs: Seg[]): CardSpec => ({ key, segs, color });

const OWN = {
  zero: ours(100, TOUR_INK.beam, [
    { kind: "strong", text: "Zero" },
    { kind: "plain", text: "\nno beads on the beam" },
  ]),
  worthFive: ours(101, TOUR_INK.topSection, [
    { kind: "plain", text: "one upper bead\n= " },
    { kind: "strong", text: "five" },
  ]),
  noneLeft: ours(102, "#C62828", [
    { kind: "plain", text: "only " },
    { kind: "strong", text: "four" },
    { kind: "plain", text: "\nlower beads per rod" },
  ]),
  buildOn: ours(103, TOUR_INK.topSection, [
    { kind: "strong", text: "five" },
    { kind: "plain", text: " first,\nthen count on" },
  ]),
} as const;

/**
 * phrase index -> card. Anything absent gets a plain label or no panel at all; a card on
 * every line would leave nothing for the beads to say.
 */
export const E02_CARDS: Record<number, CardSpec> = {
  2: fromTour(11), //  "One rod · 0 to 9"    — every number from zero to nine
  3: fromTour(7), //   "Unit's Place"        — and we only need one rod
  6: OWN.zero, //                              zero means no beads touching the beam
  22: OWN.noneLeft, //                         four is as high as the lower beads can go
  25: fromTour(5), //  "Upper Beads"          — the upper bead
  30: OWN.worthFive, //                        worth five all by itself
  31: OWN.buildOn, //                          five is easy to build on
  36: fromTour(11), // "One rod · 0 to 9"     — nine is the biggest one rod can show
};

/**
 * Guard, not a comment: a card must contain a word the line actually says, or it is a card
 * about a different sentence. This is the failure E01 shipped — a tooltip a full line out of
 * step for an entire section, which survived several contact sheets because layout was
 * checked and agreement with the words never was. Throwing at render makes it impossible.
 */
export const assertCards = (textOf: (p: number) => string): void => {
  const MUST: Record<number, string> = {
    2: "nine",
    3: "rod",
    6: "beam",
    22: "lower",
    25: "upper",
    30: "five",
    31: "five",
    36: "rod",
  };
  for (const [k, needle] of Object.entries(MUST)) {
    const p = Number(k);
    const text = (textOf(p) ?? "").toLowerCase();
    if (!text.includes(needle)) {
      throw new Error(
        `E02 card ${p} expects the line to mention "${needle}" but it reads "${text}" — ` +
          `the card table is out of step with the phrases`
      );
    }
  }
};
