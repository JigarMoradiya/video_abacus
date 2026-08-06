// The registry: one entry per video. Adding an episode is one line here.
// Composition ids use HYPHENS — Remotion forbids underscores.
import React from "react";
import { E01MeetTheAbacus, E01_DURATION } from "./e01_meet_the_abacus";
import { E02Numbers0To9, E02_DURATION } from "./e02_numbers_0_to_9";
import { E03AddingTwoNumbers, E03_DURATION } from "./e03_adding_two_numbers";
import { W, H } from "../data/tokens";

export interface ReelEntry {
  id: string;
  component: React.FC;
  durationInFrames: number;
  width?: number;
  height?: number;
}

// Each episode ships twice: 16:9 for YouTube and 4:5 for Facebook and Instagram. The SAME
// component, registered at two sizes — the phrase table, worlds, audio and teaching are
// identical and only the arrangement differs (src/stage/layout.ts). A second reel file per
// aspect would drift the moment either was edited; the phonics series learned that first.
export const REELS: ReelEntry[] = [
  {
    id: "meet-the-abacus",
    component: E01MeetTheAbacus,
    durationInFrames: E01_DURATION,
    width: W,
    height: H,
  },
  {
    id: "meet-the-abacus-4x5",
    component: E01MeetTheAbacus,
    durationInFrames: E01_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "numbers-0-to-9",
    component: E02Numbers0To9,
    durationInFrames: E02_DURATION,
    width: W,
    height: H,
  },
  {
    id: "numbers-0-to-9-4x5",
    component: E02Numbers0To9,
    durationInFrames: E02_DURATION,
    width: 1080,
    height: 1350,
  },
  {
    id: "adding-two-numbers",
    component: E03AddingTwoNumbers,
    durationInFrames: E03_DURATION,
    width: W,
    height: H,
  },
  {
    id: "adding-two-numbers-4x5",
    component: E03AddingTwoNumbers,
    durationInFrames: E03_DURATION,
    width: 1080,
    height: 1350,
  },
];
