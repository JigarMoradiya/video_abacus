// AD 1 — "Screen time that builds a brain." Parent pain: screen time. Cartoon watching vs
// learning on the abacus, then two quick wins with real bead swipes, then the app's 4 learning-path levels + 8 practice levels and
// "Level 1 is FREE". World: cloud castle sky; characters Cloudy and Sparky.
//
// VOICE-OVER (owner's take, public/audio/ads/ad1_vo.mp3, 19.8 s): every beat below is set on its words
// (faster-whisper word times, 2026-11-06):
//   0.00 "Screen time that builds a brain" · 2.68 "Same screen, different brain" · 5.22 "Swipe the beads, make three"
//   (three 7.02) · 7.44 "now make eight" (eight 8.24) · 8.82 "four learning levels" · 10.26 "eight practice levels"
//   · 11.80 "level one is free" · 13.48 "try all premium free for three (16.28) or seven (16.92) days" · 17.80 "download it free today"
// Beats (30 fps): 0-80 hook · 80-158 compare · 158-262 play (Make 3 lands 211, Make 8 lands 247) · 262-402 levels
// (practice 306, FREE 354) · 402-532 free trial (3 flashes 488, 7 flashes 508) · 532-630 end card.

import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { World } from "../../components/World";
import { Celebration } from "../../components/heroes/Celebration";
import { BB_RIGS } from "../../data/bbworlds";
import { BrandBadge } from "../../components/Brand";
import { KID_FONT } from "../../lib/fonts";
import {
  AD_H, AD_W, AdBuddies, AdEndCard, AdSound, endSfx, type CloseTiming, GameHud, GoalChip, HookBurst, NumberPlate, Panel, PlayableAbacus, PopLine, StarGain, Sticker,
  abacusAt, playBox, popIn, valueOf, windowIn, type AbacusPlay, type AdSfx,
} from "./AdKit";

const ACCENT = "#FF7A1A";
const SCALE = 1.8;
const BAND_TOP = 680;
const BAND_BOTTOM = 1500;
const PLAY_FROM = 158;
const PLAY_TO = 262;
const HOOK_TO = 80;
const CLOSE: CloseTiming = { trialAt: 402, endAt: 532, flash: [488, 508] };
export const AD1_FRAMES = 630;

const PLAY: AbacusPlay = {
  rods: 3,
  start: [0, 0, 0],
  moves: [
    { at: 201, to: [3, 0, 0], hand: { rod: 0, heaven: false, direction: "up", digit: "thumb" } },
    { at: 237, to: [8, 0, 0], hand: { rod: 0, heaven: true, direction: "down", digit: "index" } },
  ],
};
const WIN_1 = 211;
const WIN_2 = 247;

export const AD1_SFX: AdSfx[] = [
  { frame: 0, file: "gz_hook.mp3" },
  { frame: 10, file: "gz_star.mp3" },
  { frame: 104, file: "gz_wrong.mp3" },
  { frame: 142, file: "gz_correct.mp3" },
  { frame: 201, file: "bead_add.mp3" },
  { frame: WIN_1, file: "gz_star.mp3" },
  { frame: 237, file: "bead_upper_swap.mp3" },
  { frame: WIN_2, file: "gz_win.mp3" },
  { frame: 264, file: "gz_benefit.mp3" },
  { frame: 306, file: "gz_tap.mp3", vol: 0.45 },
  { frame: 354, file: "gz_star.mp3" },
  ...endSfx(CLOSE),
];


/** Left: just watching (grey, ✗). Right: learning on the abacus (bright, ✓). */
const Compare: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const vis = windowIn(frame, HOOK_TO, PLAY_FROM);
  if (vis <= 0) return null;
  const card = (side: 0 | 1) => {
    const at = 86 + side * 10;
    const good = side === 1;
    const stamp = popIn(frame, fps, good ? 142 : 104, 9);
    return (
      <div style={{ transform: `scale(${popIn(frame, fps, at)}) rotate(${good ? Math.sin(frame / 8) * 2 : 0}deg)`, position: "relative" }}>
        <Panel bg={good ? "linear-gradient(180deg,#FFE27A,#FF9F1C)" : "linear-gradient(180deg,#C9CED6,#9AA1AC)"} base={good ? "#B4570A" : "#6B717B"} pad="34px 24px" style={{ width: 420, textAlign: "center" }}>
          <div style={{ fontSize: 170, lineHeight: 1.1, filter: good ? "none" : "grayscale(1)" }}>{good ? "🧮" : "📺"}</div>
          <Sticker text={good ? "Abacus" : "Cartoons"} size={58} outline={good ? "#7A3A00" : "#4A4F57"} />
          <div style={{ fontFamily: KID_FONT, fontWeight: 600, fontSize: 40, color: good ? "#6A2E00" : "#3E434B", marginTop: 10 }}>
            {good ? "Thinks + learns" : "Just watches"}
          </div>
        </Panel>
        <div style={{ position: "absolute", right: -26, top: -36, transform: `scale(${stamp})`, fontSize: 130 }}>{good ? "✅" : "❌"}</div>
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", top: 560, left: 0, width: AD_W, display: "flex", justifyContent: "center", gap: 50, opacity: vis }}>
      {card(0)}
      {card(1)}
    </div>
  );
};

/** The app's two level tracks on one screen. Top: the 4 learning-path levels as the Home level cards (HomeView
 *  levelsPager: gradient pill, emoji circle, "LEVEL n", title, chevron). Bottom: the 8 Abacus Practice levels as the real
 *  practice cards (Chick … Lion, cropped from app captures in public/images/ads). Level 1 of BOTH tracks is free (owner). */
const LEVEL_CARDS = [
  { n: 1, icon: "🔢", title: "Bead Basics", c: ["#2E7D32", "#43A047"] },
  { n: 2, icon: "➕", title: "Add & Subtract", c: ["#1565C0", "#1976D2"] },
  { n: 3, icon: "⚡", title: "Speed & Anzan", c: ["#6A1B9A", "#7B1FA2"] },
  { n: 4, icon: "✖️", title: "Times Tables", c: ["#E65100", "#F57C00"] },
];
const CARDS_AT = PLAY_TO + 6;
/** "eight practice levels" */
const PRACTICE_AT = 306;
/** "level one is free" */
const FREE_AT = 354;

const LevelCards: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const vis = windowIn(frame, PLAY_TO, CLOSE.trialAt);
  if (vis <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: vis, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 200, gap: 18 }}>
      <div style={{ transform: `scale(${popIn(frame, fps, PLAY_TO + 2)})` }}>
        <Sticker text="Learning path · 4 levels" size={64} style={{ whiteSpace: "nowrap" }} />
      </div>
      {LEVEL_CARDS.map((l, i) => {
        const at = CARDS_AT + i * 6;
        const pulse = l.n === 1 && frame > at + 20 ? 1 + Math.sin((frame - at) / 5) * 0.03 : 1;
        return (
          <div key={l.n} style={{ position: "relative", transform: `scale(${popIn(frame, fps, at) * pulse})` }}>
            <div
              style={{
                width: 760,
                height: 100,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${l.c[0]}, ${l.c[1]})`,
                boxShadow: `0 9px 0 ${l.c[0]}88`,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "0 36px 0 18px",
                boxSizing: "border-box",
              }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 999, background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>{l.icon}</div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", lineHeight: 1.05 }}>
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 24, letterSpacing: 2, color: "rgba(255,255,255,0.85)" }}>LEVEL {l.n}</span>
                <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 42, color: "#FFFFFF", whiteSpace: "nowrap" }}>{l.title}</span>
              </div>
              <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 48, color: "rgba(255,255,255,0.8)" }}>›</span>
            </div>
            {l.n === 1 && (
              <div style={{ position: "absolute", top: -20, right: 26, transform: `rotate(8deg) scale(${popIn(frame, fps, at + 14)})`, background: "#FFD84D", borderRadius: 999, padding: "4px 18px", border: "4px solid #FFFFFF", fontFamily: KID_FONT, fontWeight: 700, fontSize: 32, color: "#6A3A00" }}>
                FREE
              </div>
            )}
          </div>
        );
      })}
      <div style={{ marginTop: 22, transform: `scale(${popIn(frame, fps, PRACTICE_AT)})` }}>
        <Sticker text="Practice · 8 levels" size={64} style={{ whiteSpace: "nowrap" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 212px)", gap: 16 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => (
          <div key={n} style={{ position: "relative", transform: `scale(${popIn(frame, fps, PRACTICE_AT + 6 + i * 3)}) translateY(${Math.sin((frame + i * 7) / 8) * 4}px)` }}>
            <Img src={staticFile(`images/ads/practice_lvl${n}.png`)} style={{ width: 212, height: 184, borderRadius: 26, boxShadow: "0 8px 0 rgba(0,0,0,0.18)" }} />
            {n === 1 && (
              <div style={{ position: "absolute", top: -18, right: -14, transform: `rotate(10deg) scale(${popIn(frame, fps, PRACTICE_AT + 20)})`, background: "#FFD84D", borderRadius: 999, padding: "2px 14px", border: "4px solid #FFFFFF", fontFamily: KID_FONT, fontWeight: 700, fontSize: 28, color: "#6A3A00" }}>
                FREE
              </div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, transform: `scale(${popIn(frame, fps, FREE_AT)})` }}>
        <Panel bg="#2EB85C" base="#1B7A3A" radius={999} pad="12px 40px">
          <Sticker text="Level 1 is FREE" size={58} outline="rgba(0,0,0,0.4)" />
        </Panel>
      </div>
    </div>
  );
};

export const Ad1ScreenTime: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const box = playBox(PLAY, SCALE, BAND_TOP, BAND_BOTTOM, frame, fps);
  const value = valueOf(abacusAt(PLAY, frame).values);
  const playVis = windowIn(frame, PLAY_FROM, PLAY_TO, 8);
  const plateY = box.top - 150;
  const cheering = (frame >= WIN_1 && frame < WIN_1 + 30) || (frame >= WIN_2 && frame < WIN_2 + 50) || frame < HOOK_TO;

  return (
    <AbsoluteFill style={{ fontFamily: KID_FONT }}>
      <World kind="cloudB" />

      {/* hook */}
      <HookBurst frame={frame} fps={fps} until={HOOK_TO} x={AD_W / 2} y={1080} text="🧠" size={260} />
      <PopLine frame={frame} fps={fps} at={0} until={HOOK_TO} y={220} text="Screen time" size={140} />
      <PopLine frame={frame} fps={fps} at={28} until={HOOK_TO} y={390} text={"that builds\na BRAIN"} size={112} color="#FFD84D" outline="#5A2E00" tilt={-2} />

      <PopLine frame={frame} fps={fps} at={HOOK_TO + 2} until={PLAY_FROM} y={300} text={"Same screen.\nDifferent brain."} size={96} />
      <Compare frame={frame} fps={fps} />

      {playVis > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: playVis }}>
          <PlayableAbacus frame={frame} fps={fps} play={PLAY} scale={SCALE} top={BAND_TOP} bottom={BAND_BOTTOM} palette={BB_RIGS.cloud} focusRod={0} />
          <NumberPlate frame={frame} value={value} flashAt={[WIN_1, WIN_2]} x={AD_W / 2} y={plateY} ink="#7A3A00" />
          {frame < 223 ? (
            <GoalChip frame={frame} fps={fps} at={PLAY_FROM + 2} text="Make 3" y={320} bg={ACCENT} done={frame >= WIN_1} />
          ) : (
            <GoalChip frame={frame} fps={fps} at={223} text="Make 8" y={320} bg="#2C6FE8" done={frame >= WIN_2} />
          )}
        </div>
      )}
      <GameHud frame={frame} fps={fps} level="Level 1" starAt={[WIN_1, WIN_2]} accent={ACCENT} showFrom={PLAY_FROM} hideAt={PLAY_TO} />
      <StarGain frame={frame} at={WIN_1 + 2} x={AD_W * 0.78} y={plateY + 20} />
      <StarGain frame={frame} at={WIN_2 + 2} x={AD_W * 0.78} y={plateY + 20} />

      <LevelCards frame={frame} fps={fps} />

      <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={AD_W / 2} y={plateY + 60} frame={frame} fps={fps} startFrame={WIN_1} />
        <Celebration x={AD_W / 2} y={plateY + 60} frame={frame} fps={fps} startFrame={WIN_2} />
        <Celebration x={AD_W * 0.72} y={640} frame={frame} fps={fps} startFrame={142} />
      </svg>

      <AdBuddies frame={frame} fps={fps} kinds={["cloudy", "sparky"]} mood={cheering || (frame >= PLAY_TO && frame < CLOSE.trialAt) ? "cheer" : "calm"} />

      <AdEndCard frame={frame} fps={fps} headline="Level 1 is FREE" sub="Screen time that teaches" accent={ACCENT} timing={CLOSE} />
      <BrandBadge portrait />
      <AdSound cues={AD1_SFX} voice="ad1_vo.mp3" />
    </AbsoluteFill>
  );
};
