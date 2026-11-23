// AD 5 — "Hates maths? Make it a game!" Fun angle for the child who avoids maths: two real Math
// Game Zone games played (Balloon Pop, True or False, the same rebuilt sims as the game reels),
// then a wall of game tiles (ending on "More games") + "plus a real abacus". World: night funfair;
// characters Balloon and Bear.
// Store-copy rule: never say how many games there are.
//
// Beats (30 fps): 0-60 hook · 60-200 Balloon Pop · 200-340 True or False · 340-432 game wall · 432 free trial · 480 end.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { World } from "../../components/World";
import { BalloonPopSim, type BalloonSpec } from "../../components/gamezone/sims/BalloonPopSim";
import { TrueOrFalseSim, type TrueOrFalseStoryboard } from "../../components/gamezone/sims/TrueOrFalseSim";
import { Celebration } from "../../components/heroes/Celebration";
import { BrandBadge } from "../../components/Brand";
import { KID_FONT } from "../../lib/fonts";
import { AD_H, AD_W, AdBuddies, AdEndCard, AdSound, END_SFX, TRIAL_AT, GameHud, HookBurst, Panel, PopLine, Sticker, popIn, ramp, windowIn, type AdSfx } from "./AdKit";

const ACCENT = "#7E57C2";
const BALLOON_FROM = 60;
const BALLOON_TO = 200;
const TF_TO = 340;
const RISE_H = AD_H * 0.74;

const POP_1 = 150;
const POP_2 = 185;
const BALLOONS: BalloonSpec[] = ([
  // already rising when the game appears, so the sky is never empty
  { number: 2, colorIdx: 3, x: 0.2, spawnFrame: -34, riseSpeed: 150 },
  { number: 5, colorIdx: 6, x: 0.52, spawnFrame: -26, riseSpeed: 140, wiggleAt: 124 },
  { number: 3, colorIdx: 2, x: 0.34, spawnFrame: -20, riseSpeed: 140, popAt: POP_1 },
  { number: 8, colorIdx: 7, x: 0.8, spawnFrame: -12, riseSpeed: 150 },
  { number: 3, colorIdx: 5, x: 0.66, spawnFrame: 44, riseSpeed: 180, popAt: POP_2 },
  { number: 6, colorIdx: 1, x: 0.16, spawnFrame: 60, riseSpeed: 170 },
] as BalloonSpec[]).map((b) => ({ ...b, scale: 1.45 }));

const JUDGE_1 = 246;
const JUDGE_2 = 314;
const tokens = (texts: string[], from: number) => texts.map((text, i) => ({ text, at: from + i * 6 }));
const STORY: TrueOrFalseStoryboard = {
  rounds: [
    { tokens: tokens(["7", "+", "5", "=", "12"], 212), isTrue: true, tapAt: JUDGE_1 - 2, judgeAt: JUDGE_1, activeUntil: 272 },
    { tokens: tokens(["9", "−", "4", "=", "6"], 274), isTrue: false, tapAt: JUDGE_2 - 2, judgeAt: JUDGE_2, activeUntil: 10000 },
  ],
};

const WALL_FROM_ = 340;
const GAMES = [
  { name: "Balloon Pop", icon: "🎈", c: "#FF5A3C" },
  { name: "True or False", icon: "✅", c: "#2EB85C" },
  { name: "Cross Math", icon: "➕", c: "#7E57C2" },
  { name: "Kakuro", icon: "🟦", c: "#2C6FE8" },
  { name: "Calcudoku", icon: "➗", c: "#E8432C" },
  { name: "Math Pyramid", icon: "🔺", c: "#F5A524" },
  { name: "Sudoku", icon: "🧩", c: "#8E4FD0" },
  { name: "Number Merge", icon: "🔢", c: "#2E9E62" },
  { name: "Math Bingo", icon: "🎱", c: "#0288D1" },
  { name: "More games", icon: "🎮", c: "#D63384", more: true },
] as { name: string; icon: string; c: string; more?: boolean }[];
const CARD_STEP = 4;
const PILL_AT = WALL_FROM_ + 20 + GAMES.length * CARD_STEP + 6;
const WALL_FROM = WALL_FROM_;

export const AD5_SFX: AdSfx[] = [
  { frame: 0, file: "gz_hook.mp3" },
  { frame: 26, file: "gz_wrong.mp3" },
  { frame: 34, file: "gz_win.mp3" },
  { frame: 124, file: "gz_wrong.mp3" },
  { frame: POP_1, file: "gz_balloon_pop.mp3" },
  { frame: POP_2, file: "gz_balloon_pop.mp3" },
  { frame: JUDGE_1, file: "gz_correct.mp3" },
  { frame: JUDGE_2, file: "gz_correct.mp3" },
  ...GAMES.map((_, i) => ({ frame: WALL_FROM_ + 20 + i * CARD_STEP, file: "gz_tap.mp3", vol: 0.4 })),
  ...END_SFX,
];

export const Ad5MathGames: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const strike = ramp(frame, 22, 30);
  const balloonVis = windowIn(frame, BALLOON_FROM, BALLOON_TO, 8);
  const tfVis = windowIn(frame, BALLOON_TO, TF_TO, 8);
  const wallVis = windowIn(frame, WALL_FROM, TRIAL_AT, 8);

  return (
    <AbsoluteFill style={{ fontFamily: KID_FONT }}>
      <World kind="fairB" />

      {/* hook */}
      <HookBurst frame={frame} fps={fps} until={60} x={AD_W / 2} y={1060} text="🎮" size={260} rays="rgba(126,87,194,0.45)" />
      {frame < 60 && (
        <div style={{ position: "absolute", top: 210, left: 0, width: AD_W, display: "flex", justifyContent: "center", transform: `scale(${popIn(frame, fps, 0)})`, opacity: 1 - ramp(frame, 52, 60) }}>
          <div style={{ position: "relative" }}>
            <Sticker text="Hates maths? 😩" size={118} />
            <div style={{ position: "absolute", left: -10, right: -10, top: "48%", height: 18, borderRadius: 9, background: "#E8432C", transform: `scaleX(${strike}) rotate(-4deg)`, transformOrigin: "left center" }} />
          </div>
        </div>
      )}
      <PopLine frame={frame} fps={fps} at={30} until={60} y={420} text={"Make it a GAME!"} size={120} color="#FFD84D" outline="#3A1A6E" tilt={-3} />

      {/* Balloon Pop */}
      {balloonVis > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: balloonVis }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: AD_W, height: RISE_H }}>
            <BalloonPopSim frame={frame} fps={fps} width={AD_W} height={RISE_H} balloons={BALLOONS} targetText="Make 10 with 7" targetInAt={70} showStreak={frame >= POP_1} targetTop={AD_H * 0.19} />
          </div>
          <PopLine frame={frame} fps={fps} at={62} y={110} text="🎈 BALLOON POP!" size={100} color="#FFFFFF" outline="#C2410C" />
        </div>
      )}

      {/* True or False */}
      {tfVis > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: tfVis }}>
          <PopLine frame={frame} fps={fps} at={202} y={110} text="✅ TRUE OR FALSE!" size={96} color="#FFFFFF" outline="#1B7A3A" />
          <TrueOrFalseSim frame={frame} fps={fps} x={AD_W / 2 - 300 * 1.6 / 1.15} y={AD_H * 0.27} story={STORY} scale={1.6} />
        </div>
      )}
      <GameHud frame={frame} fps={fps} level="Game Zone" starAt={[POP_1, POP_2, JUDGE_1, JUDGE_2]} accent={ACCENT} showFrom={BALLOON_FROM + 30} hideAt={TF_TO} top={220} />

      {/* the game wall */}
      {wallVis > 0 && (
        <div style={{ position: "absolute", top: 200, left: 0, width: AD_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, opacity: wallVis }}>
          <div style={{ transform: `scale(${popIn(frame, fps, WALL_FROM + 2)})` }}>
            <Sticker text={"Lots of math games"} size={96} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 460px)", gap: 22 }}>
            {GAMES.map((g, i) => (
              <div key={g.name} style={{ transform: `scale(${popIn(frame, fps, WALL_FROM + 20 + i * CARD_STEP) * (g.more ? 1 + Math.sin(frame / 5) * 0.04 : 1)}) rotate(${Math.sin((frame + i * 11) / 10) * 2}deg)` }}>
                <Panel
                  bg={g.more ? "#FFFFFF" : g.c}
                  base={g.more ? g.c : "rgba(0,0,0,0.3)"}
                  radius={40}
                  pad="14px 20px"
                  style={{ display: "flex", alignItems: "center", gap: 14, height: 104, border: g.more ? `6px dashed ${g.c}` : undefined }}
                >
                  <span style={{ fontSize: 66 }}>{g.icon}</span>
                  <Sticker text={g.more ? "More games!" : g.name} size={42} color={g.more ? g.c : "#FFFFFF"} outline={g.more ? "#FFFFFF" : "rgba(0,0,0,0.4)"} />
                </Panel>
              </div>
            ))}
          </div>
          <div style={{ transform: `scale(${popIn(frame, fps, PILL_AT)})` }}>
            <Panel bg="#FFD84D" base="#B7791F" radius={999} pad="14px 44px">
              <Sticker text="+ a real abacus 🧮" size={64} color="#FFFFFF" outline="#7A4A00" />
            </Panel>
          </div>
        </div>
      )}

      <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={AD_W / 2} y={560} frame={frame} fps={fps} startFrame={34} />
        <Celebration x={AD_W * 0.34} y={RISE_H * 0.6} frame={frame} fps={fps} startFrame={POP_1} />
        <Celebration x={AD_W * 0.66} y={RISE_H * 0.6} frame={frame} fps={fps} startFrame={POP_2} />
        <Celebration x={AD_W / 2} y={760} frame={frame} fps={fps} startFrame={JUDGE_1} />
        <Celebration x={AD_W / 2} y={760} frame={frame} fps={fps} startFrame={JUDGE_2} />
      </svg>

      <AdBuddies frame={frame} fps={fps} kinds={["balloon", "bear"]} mood={[frame < 22 ? "tilt" : "cheer", frame < 22 ? "tilt" : frame >= BALLOON_FROM && frame < TF_TO ? "calm" : "cheer"]} />

      <AdEndCard frame={frame} fps={fps} headline="Try it FREE" sub="Learning that feels like play" accent={ACCENT} />
      <BrandBadge portrait dark />
      <AdSound cues={AD5_SFX} />
    </AbsoluteFill>
  );
};
