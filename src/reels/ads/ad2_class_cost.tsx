// AD 2 — "Abacus classes cost how much?" Parent pain: class cost and travel. Classes vs the app,
// all 8 levels inside, then the yearly price as about ₹100 a month. World: farm market; characters Pig and Chick.
//
// PRICE: Google Play India yearly plan ₹1,200 (2026-11-05). Check the live price before this ad
// runs, and never run this cut on iOS or outside India: those prices differ.
//
// Beats (30 fps): 0-75 hook · 75-200 classes vs app · 200-330 8 levels · 330-432 price · 432 free trial · 480 end.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { World } from "../../components/World";
import { Celebration } from "../../components/heroes/Celebration";
import { BrandBadge } from "../../components/Brand";
import { KID_FONT } from "../../lib/fonts";
import { AD_H, AD_W, AdBuddies, AdEndCard, AdSound, END_SFX, TRIAL_AT, HookBurst, Panel, PopLine, Sticker, popIn, ramp, windowIn, type AdSfx } from "./AdKit";

const ACCENT = "#0288D1";
export const YEARLY_PRICE = "₹1,200";
export const MONTHLY_EQUIV = "₹100";

const ROWS = [
  { bad: "🚗 Travel every week", good: "🏠 Learn at home" },
  { bad: "⏰ Fixed class time", good: "🕒 Any time" },
  { bad: "👀 Wait for a turn", good: "👆 Every tap is yours" },
];

const LEVELS = [
  { n: 1, icon: "🌱", c: "#FF8A3D" },
  { n: 2, icon: "⭐", c: "#2EB85C" },
  { n: 3, icon: "🚀", c: "#2C6FE8" },
  { n: 4, icon: "🎯", c: "#7E57C2" },
  { n: 5, icon: "🔥", c: "#E8432C" },
  { n: 6, icon: "💎", c: "#00A6A6" },
  { n: 7, icon: "⚡", c: "#F5A524" },
  { n: 8, icon: "🏆", c: "#D63384" },
];

/** real app features (Practice step-by-step mode, Home "Math Exam" tile, Final Answer mode) */
const HELPS = ["💡 Step-by-step help", "↕️ Smart bead directions", "📝 Math exams", "✅ Final answer mode"];
const HELP_AT = 262;

const PRICE_AT = 340;
const STAMP_AT = 372;

export const AD2_SFX: AdSfx[] = [
  { frame: 0, file: "gz_hook.mp3" },
  { frame: 12, file: "bf3_coins.mp3" },
  ...ROWS.flatMap((_, i) => [{ frame: 96 + i * 22, file: "gz_wrong.mp3", vol: 0.35 }, { frame: 104 + i * 22, file: "gz_correct.mp3", vol: 0.45 }]),
  ...LEVELS.map((_, i) => ({ frame: 214 + i * 7, file: "gz_tap.mp3", vol: 0.4 })),
  ...HELPS.map((_, i) => ({ frame: HELP_AT + i * 12, file: "gz_correct.mp3", vol: 0.35 })),
  { frame: PRICE_AT, file: "bf3_coins.mp3" },
  { frame: STAMP_AT, file: "bf1_stamp.mp3" },
  ...END_SFX,
];

export const Ad2ClassCost: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const compareVis = windowIn(frame, 75, 200);
  const levelsVis = windowIn(frame, 200, 330);
  const priceVis = windowIn(frame, 330, TRIAL_AT);

  return (
    <AbsoluteFill style={{ fontFamily: KID_FONT }}>
      <World kind="farmB" />

      {/* hook */}
      <HookBurst frame={frame} fps={fps} until={75} x={AD_W / 2} y={1060} text="₹ ?" size={270} />
      <PopLine frame={frame} fps={fps} at={0} until={75} y={220} text="Abacus classes" size={124} />
      <PopLine frame={frame} fps={fps} at={10} until={75} y={370} text="cost how much? 😳" size={96} color="#FFD84D" outline="#3A2200" tilt={-2} />

      {/* classes vs app */}
      {compareVis > 0 && (
        <div style={{ position: "absolute", top: 300, left: 0, width: AD_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 34, opacity: compareVis }}>
          <div style={{ transform: `scale(${popIn(frame, fps, 76)})`, display: "flex", gap: 30 }}>
            <Panel bg="#9AA1AC" base="#5E646D" radius={999} pad="10px 34px"><Sticker text="Classes" size={56} outline="#3E434B" /></Panel>
            <Sticker text="vs" size={60} />
            <Panel bg="#2EB85C" base="#1B7A3A" radius={999} pad="10px 34px"><Sticker text="This app" size={56} outline="#145A2B" /></Panel>
          </div>
          {ROWS.map((r, i) => {
            const at = 92 + i * 22;
            return (
              <div key={i} style={{ display: "flex", gap: 20, transform: `scale(${popIn(frame, fps, at)})` }}>
                <Panel bg="#E3E6EB" base="#8A9099" radius={34} pad="22px 22px" style={{ width: 460 }}>
                  <div style={{ fontWeight: 600, fontSize: 38, color: "#4A4F57", whiteSpace: "nowrap", textDecoration: frame >= at + 4 ? "line-through" : "none" }}>{r.bad}</div>
                </Panel>
                <Panel bg="#FFF6D6" base="#2EB85C" radius={34} pad="22px 22px" style={{ width: 460, transform: `scale(${1 + 0.08 * Math.max(0, 1 - (frame - at - 8) / 10)})` }}>
                  <div style={{ fontWeight: 700, fontSize: 40, color: "#145A2B", whiteSpace: "nowrap" }}>{r.good} ✓</div>
                </Panel>
              </div>
            );
          })}
        </div>
      )}

      {/* all 8 levels */}
      {levelsVis > 0 && (
        <div style={{ position: "absolute", top: 230, left: 0, width: AD_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, opacity: levelsVis }}>
          <div style={{ transform: `scale(${popIn(frame, fps, 202)})` }}>
            <Sticker text="All 8 levels inside" size={92} style={{ whiteSpace: "nowrap" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 210px)", gap: 26 }}>
            {LEVELS.map((l, i) => {
              const k = popIn(frame, fps, 214 + i * 7);
              return (
                <div key={l.n} style={{ position: "relative", transform: `scale(${k}) translateY(${Math.sin((frame + i * 7) / 8) * 5}px)` }}>
                  <div style={{ height: 230, borderRadius: 40, background: l.c, border: "6px solid #FFFFFF", boxShadow: "0 12px 0 rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <span style={{ fontSize: 86 }}>{l.icon}</span>
                    <Sticker text={`Level ${l.n}`} size={40} outline="rgba(0,0,0,0.4)" />
                  </div>
                  {l.n === 1 && (
                    <div style={{ position: "absolute", top: -22, right: -18, transform: "rotate(10deg)", background: "#FFD84D", borderRadius: 999, padding: "4px 16px", border: "4px solid #FFFFFF", fontWeight: 700, fontSize: 32, color: "#6A3A00" }}>FREE</div>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            {HELPS.map((h, i) => (
              <div key={h} style={{ transform: `scale(${popIn(frame, fps, HELP_AT + i * 12)})` }}>
                <Panel bg="#FFFFFF" base={ACCENT} radius={999} pad="12px 40px">
                  <div style={{ fontWeight: 700, fontSize: 46, color: "#0B4F7A", whiteSpace: "nowrap" }}>{h}</div>
                </Panel>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* the price */}
      {priceVis > 0 && (
        <div style={{ position: "absolute", top: 380, left: 0, width: AD_W, display: "flex", flexDirection: "column", alignItems: "center", gap: 40, opacity: priceVis }}>
          <div style={{ transform: `scale(${popIn(frame, fps, PRICE_AT)})` }}>
            <Panel bg="#FFFFFF" base="#B7791F" radius={48} pad="34px 70px" style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 600, fontSize: 48, color: "#5A6270" }}>Yearly plan</div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 190,
                  lineHeight: 1.05,
                  color: "#6A3A00",
                  textShadow: `0 0 ${50 * Math.max(0, 1 - (frame - PRICE_AT) / 18)}px rgba(255,200,40,1)`,
                }}
              >
                {YEARLY_PRICE}
              </div>
            </Panel>
          </div>
          <div style={{ transform: `scale(${frame < STAMP_AT ? 0 : 1 + 1.2 * Math.max(0, 1 - (frame - STAMP_AT) / 6)}) rotate(-8deg)`, opacity: ramp(frame, STAMP_AT, STAMP_AT + 2) }}>
            <div style={{ border: "12px solid #E8432C", borderRadius: 34, padding: "10px 40px", background: "rgba(255,255,255,0.92)" }}>
              <Sticker text={`= ${MONTHLY_EQUIV} a month`} size={92} color="#E8432C" outline="#FFFFFF" />
            </div>
          </div>
        </div>
      )}

      <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={AD_W * 0.3} y={800} frame={frame} fps={fps} startFrame={STAMP_AT} />
        <Celebration x={AD_W * 0.7} y={800} frame={frame} fps={fps} startFrame={STAMP_AT + 6} />
      </svg>

      <AdBuddies frame={frame} fps={fps} kinds={["pig", "chick"]} mood={frame < 75 ? "tilt" : frame >= STAMP_AT ? "cheer" : "calm"} />

      <AdEndCard frame={frame} fps={fps} headline="Start with Level 1 FREE" sub="Learn at home, any time" accent={ACCENT} />
      <BrandBadge portrait />
      <AdSound cues={AD2_SFX} />
    </AbsoluteFill>
  );
};
