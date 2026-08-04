// The registry: one entry per video. Adding an episode is one line here.
// Composition ids use HYPHENS — Remotion forbids underscores.
import React from "react";
import { E01MeetTheAbacus, E01_DURATION } from "./e01_meet_the_abacus";
import { W, H } from "../data/tokens";

export interface ReelEntry {
  id: string;
  component: React.FC;
  durationInFrames: number;
  width?: number;
  height?: number;
}

export const REELS: ReelEntry[] = [
  {
    id: "meet-the-abacus",
    component: E01MeetTheAbacus,
    durationInFrames: E01_DURATION,
    width: W,
    height: H,
  },
];
