// THE BEAD BUDDIES WORLDS (docs/COVE_SERIES_PLAN.md): one new theme per remade episode, each with four moods (A..D, morning to dusk
// or calm to lively). A theme is drawn by src/components/cast/ThemeLayer.tsx. All are calm: soft gradient, detail only at the edges.
import type { RigPalette, WorldTheme } from "./theme";

export type BBTheme = "cloud" | "snow" | "space" | "pirate" | "farm" | "train" | "fair";
export type BBMood = "A" | "B" | "C" | "D";
export type BBWorldKind = `${BBTheme}${BBMood}`;

interface Def {
  sky: [string, string][]; // per mood
  ink: string[]; // per mood
  pill: string;
  accent: string;
}

const DEFS: Record<BBTheme, Def> = {
  cloud: { sky: [["#FFD1E8", "#9AD8FF"], ["#8FD6FF", "#D9F2FF"], ["#FFC8F0", "#A9B8FF"], ["#FFB98A", "#B795F0"]], ink: ["#2B2C6B", "#2B2C6B", "#2B2C6B", "#FFFFFF"], pill: "#3A3F9E", accent: "#3A3F9E" },
  snow: { sky: [["#BDE9FF", "#EAF8FF"], ["#9FDFFF", "#F2FBFF"], ["#7FD0F0", "#DDF4FF"], ["#4C6FD0", "#C9A8F0"]], ink: ["#143A5C", "#143A5C", "#143A5C", "#FFFFFF"], pill: "#17497A", accent: "#17497A" },
  space: { sky: [["#2A1B7A", "#6B3FD0"], ["#1B2A8A", "#3FA0E8"], ["#3A1B7A", "#C04FB8"], ["#160F5A", "#4A2FA8"]], ink: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"], pill: "#241B7A", accent: "#241B7A" },
  pirate: { sky: [["#FFE08A", "#6FE0F0"], ["#7FDCFF", "#B8F0FF"], ["#FFC27A", "#6FD0E8"], ["#FF9E6A", "#7A6FD8"]], ink: ["#0F3B5A", "#0F3B5A", "#0F3B5A", "#FFFFFF"], pill: "#0F4F7A", accent: "#0F4F7A" },
  farm: { sky: [["#FFE3A0", "#9AE6F0"], ["#8FDCFF", "#D8F6C0"], ["#FFD08A", "#9BE0D0"], ["#FFA880", "#A890E0"]], ink: ["#4A2A12", "#4A2A12", "#4A2A12", "#FFFFFF"], pill: "#7A3F12", accent: "#7A3F12" },
  train: { sky: [["#FFC27A", "#9AD8E8"], ["#FFB07A", "#C9A8F0"], ["#FF9A7A", "#8F78D8"], ["#6A4AB8", "#F09A8A"]], ink: ["#3A1A4A", "#3A1A4A", "#3A1A4A", "#FFFFFF"], pill: "#4A1F6B", accent: "#4A1F6B" },
  fair: { sky: [["#2A2A7A", "#C04F9A"], ["#1B2A7A", "#8A4FD8"], ["#3A1B6A", "#FF6FA8"], ["#1B1B5A", "#5A3FC0"]], ink: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"], pill: "#2A1B6A", accent: "#2A1B6A" },
};

const MOODS: BBMood[] = ["A", "B", "C", "D"];
export const BB_WORLDS = {} as Record<BBWorldKind, WorldTheme>;
(Object.keys(DEFS) as BBTheme[]).forEach((th) => {
  const d = DEFS[th];
  MOODS.forEach((m, i) => {
    BB_WORLDS[`${th}${m}` as BBWorldKind] = { sky: d.sky[i], ink: d.ink[i], pill: d.pill, accent: d.accent, bb: { theme: th, mood: i } } as WorldTheme;
  });
});

const rig = (wl: string, w: string, wd: string, panel: string, onT: string, onB: string, onE: string): RigPalette => ({
  woodLight: wl, wood: w, woodDark: wd, panel, panelEdge: "#E3D2A8", rod: "#C9B48A", beam: wd, onTop: onT, onBottom: onB, onEdge: onE,
  offTop: "#D9DDD2", offBottom: "#B8BDB0", offEdge: "#8A8E84",
});
export const BB_RIGS: Record<BBTheme, RigPalette> = {
  cloud: rig("#B79BFF", "#8A6BE8", "#4B2FA8", "#FFFBF2", "#FFD36B", "#FF9F3D", "#B25F08"),
  snow: rig("#7FC8F0", "#4A9BD0", "#1F5A8A", "#FFFFFF", "#FF8FB0", "#FF4F86", "#A02456"),
  space: rig("#8A7FF0", "#5A4FC8", "#2A1F7A", "#F6F2FF", "#5FF0D0", "#1FC8A8", "#0A7A68"),
  pirate: rig("#C79A5B", "#9C6B34", "#6B4420", "#FFF7E2", "#FFD23F", "#FF9F1C", "#B25F08"),
  farm: rig("#D98A5B", "#B2582F", "#7A3515", "#FFF9EC", "#7FDB5F", "#3FB84A", "#1F7A2A"),
  train: rig("#8F78D8", "#6A4AB8", "#3A2478", "#FFF8F0", "#FF9A5B", "#F0602B", "#A0360F"),
  fair: rig("#FF7FC0", "#E04A9A", "#8A1F5F", "#FFF6FB", "#FFE066", "#FFB020", "#B26F08"),
};
