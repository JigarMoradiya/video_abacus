// The paid-ad videos (9:16, 18 s, silent until the owner's voice-over).
// Render one: npx remotion render ad-3-make-seven out/shorts/NNNN_ad_make_seven.mp4
import type React from "react";
import type { ReelEntry } from "../index";
import { AD_FRAMES, AD_H, AD_W } from "./AdKit";
import { AD1_FRAMES, Ad1ScreenTime } from "./ad1_screen_time";
import { Ad2ClassCost } from "./ad2_class_cost";
import { Ad3MakeSeven } from "./ad3_make_seven";
import { Ad4MentalMath } from "./ad4_mental_math";
import { Ad5MathGames } from "./ad5_math_games";
import { Ad6FreeTrial } from "./ad6_free_trial";

const ad = (id: string, component: React.FC, frames = AD_FRAMES): ReelEntry => ({ id, component, durationInFrames: frames, width: AD_W, height: AD_H });

export const AD_REELS: ReelEntry[] = [
  ad("ad-1-screen-time", Ad1ScreenTime, AD1_FRAMES),
  ad("ad-2-class-cost", Ad2ClassCost),
  ad("ad-3-make-seven", Ad3MakeSeven),
  ad("ad-4-mental-math", Ad4MentalMath),
  ad("ad-5-math-games", Ad5MathGames),
  ad("ad-6-free-trial", Ad6FreeTrial),
];
