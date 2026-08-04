// What a frame of an abacus lesson consists of, independent of which lesson it is.
//
// An episode writes one function, `sceneFor(phrase) => Scene`, and SceneStage turns that
// into pixels. Episode-specific content — which props stand in for the abacus, what the
// close beats look like, quiz cards — arrives through the render slots on SceneStageProps
// rather than as more fields here, so this type stays the vocabulary of the *instrument*.

import type { RodState } from "../components/Abacus";
import type { WorldKind } from "../data/theme";
import type { Seg } from "../data/tour";

export type Highlight = "frame" | "rods" | "beam" | "top" | "bottom" | null;

/** A teaching card's content: the app's own tour segments where it has wording, ours where
 *  it does not. `key` groups consecutive lines into one RUN so the card sits still. */
export interface CardSpec {
  key: number;
  segs: Seg[];
  color: string;
}

export interface Scene {
  world: WorldKind;
  /** What is actually on stage. "abacus" draws the instrument; any other value is passed
   *  to the episode's prop slot. The abacus is a prop, not furniture — it must not be on
   *  screen before the script names it. */
  stage: string;
  rods: RodState[];
  highlight: Highlight;
  scale: number;

  /** headline band */
  headline?: string;
  /** a counter chip under the headline */
  counter?: string;

  /** short label beside or above the stage, for lines with no teaching card */
  sideLabel?: { text: string; color: string };
  /** Answers and prompts sit ABOVE the abacus; part labels sit beside it. */
  labelPos?: "side" | "above";

  hand?: { digit: "thumb" | "index"; direction: "up" | "down"; rod: number; heaven: boolean };
  count?: "upper" | "lower" | "active" | null;
  /** Show the bead being valued next to what it is worth. */
  beadWorth?: { which: "upper" | "lower"; worth: number };
  /** Rich reveal for a your-turn answer: how many of each bead, and the sum. */
  sumBreakdown?: { upper: number; lower: number };

  /** Rod this line is about; 0 = ones = RIGHTMOST. Drives the arrow target and which side
   *  the card sits on, so the pointer is always short and unambiguous. */
  targetRod?: number;
  /** Force the card to one side. The finger beats need it: the hand reaches in from the
   *  right of the ones rod, so a card auto-placed on the right sits on top of it. */
  panelSide?: "left" | "right";
  /** "aboveRod" centres the card over its target rod and points the arrow straight down.
   *  For lines that name a COLUMN rather than a part, which have no anatomical highlight. */
  panelPlace?: "side" | "aboveRod";
  /** Text under the target rod, naming it. */
  centreNote?: string;

  /** Mark a whole SECTION — frame-top to beam, or beam to frame-bottom. */
  band?: "top" | "bottom";
  /** Mark a whole ROD, top of the frame to the bottom. A single lit bead does not say
   *  "this whole rod". */
  rodBand?: number;
  /** Box this many rods, counted from the ones rod — for lines about a GROUP of columns. */
  boxRods?: number;

  /** Beads keep moving for the whole line, for a line that says they slide. */
  liveBeads?: boolean;
  /** Light these rods one after another across the line, so a rule about moving left is
   *  demonstrated rather than only stated. */
  sweepRods?: number[];
  /** Step one rod through a range of values across the line, one value per beat, with the
   *  beads actually travelling between them. "Make every number from zero to nine" has to
   *  BE every number from zero to nine, not a card that says so. */
  rodRamp?: { rod: number; from: number; to: number };

  /** Pull the world back behind a foreground that has to carry the frame. 0..1 */
  worldWash?: number;
  /** The abacus steps aside for an episode-specific closing composition. */
  closing?: boolean;
  /** Which closing composition. Interpreted only by the episode's slot. */
  closeBeat?: string;
  /** Beats where the visual IS the message and a caption would compete. */
  noCaption?: boolean;
}
