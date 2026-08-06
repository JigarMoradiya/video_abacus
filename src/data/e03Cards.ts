// E03's teaching cards, keyed by PHRASE index.
//
// Keyed by phrase, never by line — the aligner splits on sentence boundaries, so E03's 70
// spoken lines are 71 phrases. Numbering by line is the trap DESIGN_SYSTEM §8a records.
//
// FITTING A CARD MUST NEVER CHANGE WHAT IT SAYS: if it is too wide, add a line break, never
// drop words. E02 shipped "no beads on the beam" that way, which is false.
//
// The two finger lines carry NO card. Both have a hand on screen whose own chip already says
// "thumb" or "index finger", so a tour card saying the same thing is a third statement of one
// idea — and it physically collided with the hand, exactly as it did twice in E02.
//
// One card comes from the app's own Free Mode tour by reference. The rest are ours — the tour
// has no step for "each lower bead adds one more".

import { TOUR_SHORT, TOUR_INK } from "./tour";
import { tooltipColor } from "../components/Tooltip";
import type { CardSpec } from "../stage/types";
import type { Seg } from "./tour";

const fromTour = (step: number): CardSpec => ({
  key: step,
  segs: TOUR_SHORT[step],
  color: tooltipColor(step),
});

const ours = (key: number, color: string, segs: Seg[]): CardSpec => ({ key, segs, color });

const OWN = {
  addMeans: ours(200, "#0E7C86", [
    { kind: "strong", text: "Adding" },
    { kind: "plain", text: "\nmove more beads\nto the beam" },
  ]),
  eachAddsOne: ours(201, TOUR_INK.bottomSection, [
    { kind: "plain", text: "each lower bead\nadds " },
    { kind: "strong", text: "one" },
  ]),
  onlyFour: ours(202, "#C62828", [
    { kind: "plain", text: "only " },
    { kind: "strong", text: "four" },
    { kind: "plain", text: "\nlower beads per rod" },
  ]),
  upperIsFive: ours(203, TOUR_INK.topSection, [
    { kind: "plain", text: "upper bead\nadds " },
    { kind: "strong", text: "five" },
  ]),
  anyNumber: ours(204, "#0E7C86", [
    { kind: "plain", text: "start from\n" },
    { kind: "strong", text: "any" },
    { kind: "plain", text: " number" },
  ]),
  noRoom: ours(205, "#C62828", [
    { kind: "plain", text: "no room for\n" },
    { kind: "strong", text: "four" },
    { kind: "plain", text: " more" },
  ]),
} as const;

/**
 * phrase index -> card. Most lines carry their teaching in the beads, the big number and the
 * bucket; a card on every line would leave nothing for those to say.
 */
export const E03_CARDS: Record<number, CardSpec> = {
  4: OWN.addMeans, //                        adding means moving more beads to the beam
  21: OWN.eachAddsOne, //                    every lower bead adds one more
  22: OWN.onlyFour, //                       but each rod only has four lower beads
  24: OWN.upperIsFive, //                    when we want to add five, we use the upper bead
  // NO card on 33. "The upper bead is worth five and the lower bead is worth one" already puts
  // a 5 on the upper bead and a 1 on the lower one — the card (the app's "1st ROD · lower 1 ·
  // upper 5") said the same thing a second time, in words, about a rod the line is not about.
  // It also had nowhere left to sit: the sum takes the right gutter and the bucket the left, and
  // a 560 px card fits in neither. Same call as E02's finger cards, for the same reason.
  39: OWN.anyNumber, //                      this works from any number, not only five
  62: OWN.noRoom, //                         there are only three lower beads left
};

/**
 * A card must contain a word the line actually says, or it is a card about a different
 * sentence. Throwing at render makes E01's worst shipped bug impossible.
 */
export const assertCards = (textOf: (p: number) => string): void => {
  const MUST: Record<number, string> = {
    4: "beam",
    21: "lower",
    22: "four",
    24: "upper",
    39: "any",
    62: "lower",
  };
  for (const [k, needle] of Object.entries(MUST)) {
    const p = Number(k);
    const text = (textOf(p) ?? "").toLowerCase();
    if (!text.includes(needle)) {
      throw new Error(
        `E03 card ${p} expects the line to mention "${needle}" but it reads "${text}" — ` +
          `the card table is out of step with the phrases`
      );
    }
  }
};
