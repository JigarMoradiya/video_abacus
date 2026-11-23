// AD 6 — "Try EVERYTHING free." Conversion angle: the free trials. Monthly comes with 3 days free, Yearly with 7 days
// free (owner, 2026-11-06), and during the trial every premium feature is open. Plan cards, then the premium features
// unlock one by one, then "cancel any time". World: snow mountain; characters Penguin and Snowman.
// No prices here on purpose (they differ per store and country).
//
// Beats (30 fps): 0-66 hook · 66-190 the two trials · 190-370 everything unlocks · 370-480 cancel any time · 480 end. (No shared trial beat: this whole ad is the trial.)

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { World } from "../../components/World";
import { Celebration } from "../../components/heroes/Celebration";
import { BrandBadge } from "../../components/Brand";
import { KID_FONT } from "../../lib/fonts";
import { AD_H, AD_W, AdBuddies, AdEndCard, END_AT, AdSound, HookBurst, Panel, PopLine, Sticker, popIn, windowIn, type AdSfx } from "./AdKit";

const ACCENT = "#17497A";
const PLANS_FROM = 66;
const UNLOCK_FROM = 190;
const CANCEL_FROM = 370;

const PLANS = [
  { name: "Monthly", days: 3, at: 80, flash: 96, c: ["#2C6FE8", "#1B4FB8"] },
  { name: "Yearly", days: 7, at: 110, flash: 126, c: ["#FF8A3D", "#E8432C"] },
];

/** premium features that the trial opens (all real: Home tiles, the two level tracks, practice step mode, reports) */
const FEATURES = [
  { icon: "🧮", text: "4 learning levels" },
  { icon: "🐣", text: "8 practice levels" },
  { icon: "🎮", text: "All math games" },
  { icon: "📝", text: "All math exams" },
  { icon: "↕️", text: "Bead directions" },
  { icon: "📊", text: "Full reports" },
];
const unlockAt = (i: number) => UNLOCK_FROM + 34 + i * 18;

export const AD6_SFX: AdSfx[] = [
  { frame: 0, file: "gz_hook.mp3" },
  { frame: 20, file: "gz_win.mp3" },
  ...PLANS.flatMap((p) => [{ frame: p.at, file: "gz_tap.mp3", vol: 0.45 }, { frame: p.flash, file: "gz_star.mp3" }]),
  ...FEATURES.map((_, i) => ({ frame: unlockAt(i), file: "bf3_lock.mp3", vol: 0.5 })),
  { frame: unlockAt(FEATURES.length - 1) + 14, file: "gz_win.mp3" },
  { frame: CANCEL_FROM + 4, file: "gz_correct.mp3", vol: 0.45 },
  { frame: END_AT, file: "cta_pop.mp3" },
];

/** Monthly / Yearly trial cards; the day number flashes gold when it lands. */
const PlanCard: React.FC<{ frame: number; fps: number; p: (typeof PLANS)[number] }> = ({ frame, fps, p }) => {
  const k = Math.max(0, 1 - (frame - p.flash) / 18);
  const lit = frame >= p.flash;
  return (
    <div style={{ transform: `scale(${popIn(frame, fps, p.at)})` }}>
      <div
        style={{
          width: 420,
          borderRadius: 48,
          background: `linear-gradient(180deg, ${p.c[0]}, ${p.c[1]})`,
          border: "8px solid #FFFFFF",
          boxShadow: "0 14px 0 rgba(0,0,0,0.22)",
          padding: "30px 0 34px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Sticker text={p.name} size={60} outline="rgba(0,0,0,0.35)" />
        <div
          style={{
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 210,
            lineHeight: 1,
            color: lit ? "#FFE15A" : "#FFFFFF",
            transform: `scale(${1 + 0.25 * k})`,
            textShadow: `0 0 ${46 * k}px rgba(255,210,60,1), 0 8px 0 rgba(0,0,0,0.25)`,
          }}
        >
          {p.days}
        </div>
        <Sticker text="days FREE" size={58} color="#FFFFFF" outline="rgba(0,0,0,0.35)" style={{ whiteSpace: "nowrap" }} />
      </div>
    </div>
  );
};

/** A premium feature tile: locked and grey, then the lock pops open and the tile lights up. */
const FeatureTile: React.FC<{ frame: number; fps: number; i: number }> = ({ frame, fps, i }) => {
  const f = FEATURES[i];
  const at = unlockAt(i);
  const open = frame >= at;
  const bump = open ? 1 + 0.12 * Math.max(0, 1 - (frame - at) / 8) : 1;
  return (
    <div style={{ position: "relative", transform: `scale(${popIn(frame, fps, UNLOCK_FROM + 8 + i * 4) * bump})` }}>
      <Panel
        bg={open ? "#FFFFFF" : "#D9DEE6"}
        base={open ? "#2EB85C" : "#9AA1AC"}
        radius={36}
        pad="0 20px"
        style={{ width: 460, height: 130, boxSizing: "border-box", display: "flex", alignItems: "center", gap: 16 }}
      >
        <span style={{ fontSize: 62, filter: open ? "none" : "grayscale(1)", opacity: open ? 1 : 0.6 }}>{f.icon}</span>
        <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 42, color: open ? "#145A2B" : "#6B717B", whiteSpace: "nowrap" }}>{f.text}</span>
      </Panel>
      <div style={{ position: "absolute", top: -26, right: -14, fontSize: 64, transform: `rotate(${open ? 12 : 0}deg) scale(${open ? popIn(frame, fps, at) : 1})` }}>{open ? "🔓" : "🔒"}</div>
    </div>
  );
};

export const Ad6FreeTrial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plansVis = windowIn(frame, PLANS_FROM, UNLOCK_FROM);
  const unlockVis = windowIn(frame, UNLOCK_FROM, CANCEL_FROM);
  const cancelVis = windowIn(frame, CANCEL_FROM, END_AT + 8);
  const allOpen = unlockAt(FEATURES.length - 1) + 14;
  const cheer = frame < 60 || (frame >= PLANS[0].flash && frame < PLANS[1].flash + 30) || frame >= allOpen;

  return (
    <AbsoluteFill style={{ fontFamily: KID_FONT }}>
      <World kind="snowB" />

      {/* hook */}
      <HookBurst frame={frame} fps={fps} until={66} x={AD_W / 2} y={1060} text="🎁" size={270} />
      <PopLine frame={frame} fps={fps} at={0} until={66} y={220} text="Try EVERYTHING" size={120} />
      <PopLine frame={frame} fps={fps} at={10} until={66} y={370} text="for FREE! 🎉" size={130} color="#FFD84D" outline="#5A2E00" tilt={-3} />

      {/* the two trials */}
      {plansVis > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: plansVis, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 260, gap: 50 }}>
          <div style={{ transform: `scale(${popIn(frame, fps, PLANS_FROM + 2)})` }}>
            <Sticker text="Free trial on every plan" size={78} style={{ whiteSpace: "nowrap" }} outline="#17497A" />
          </div>
          <div style={{ display: "flex", gap: 40 }}>
            {PLANS.map((p) => (
              <PlanCard key={p.name} frame={frame} fps={fps} p={p} />
            ))}
          </div>
          <div style={{ transform: `scale(${popIn(frame, fps, 150)})` }}>
            <Panel bg="#FFFFFF" base={ACCENT} radius={999} pad="14px 44px">
              <div style={{ fontWeight: 700, fontSize: 50, color: ACCENT, whiteSpace: "nowrap" }}>🔓 Every premium feature open</div>
            </Panel>
          </div>
        </div>
      )}

      {/* everything unlocks */}
      {unlockVis > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: unlockVis, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 240, gap: 44 }}>
          <div style={{ transform: `scale(${popIn(frame, fps, UNLOCK_FROM + 2)})` }}>
            <Sticker text="During the trial" size={84} style={{ whiteSpace: "nowrap" }} outline="#17497A" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 460px)", gap: "40px 30px" }}>
            {FEATURES.map((_, i) => (
              <FeatureTile key={i} frame={frame} fps={fps} i={i} />
            ))}
          </div>
          <PopLine frame={frame} fps={fps} at={allOpen} until={CANCEL_FROM} y={1100} text="All unlocked! ✨" size={100} color="#FFD84D" outline="#5A2E00" tilt={-2} />
        </div>
      )}

      {/* cancel any time */}
      {cancelVis > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: cancelVis, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 420, gap: 36 }}>
          {["✅ Cancel any time", "🔔 Before the trial ends", "🛡️ Parents stay in control"].map((t, i) => (
            <div key={t} style={{ transform: `scale(${popIn(frame, fps, CANCEL_FROM + 4 + i * 10)})` }}>
              <Panel bg="#FFFFFF" base="#2EB85C" radius={999} pad="16px 48px">
                <div style={{ fontWeight: 700, fontSize: 60, color: "#145A2B", whiteSpace: "nowrap" }}>{t}</div>
              </Panel>
            </div>
          ))}
        </div>
      )}

      <svg width={AD_W} height={AD_H} viewBox={`0 0 ${AD_W} ${AD_H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={AD_W / 2} y={560} frame={frame} fps={fps} startFrame={20} />
        <Celebration x={AD_W * 0.28} y={700} frame={frame} fps={fps} startFrame={PLANS[0].flash} />
        <Celebration x={AD_W * 0.72} y={700} frame={frame} fps={fps} startFrame={PLANS[1].flash} />
        <Celebration x={AD_W / 2} y={1000} frame={frame} fps={fps} startFrame={allOpen} />
      </svg>

      <AdBuddies frame={frame} fps={fps} kinds={["penguin", "snowman"]} mood={cheer ? "cheer" : "calm"} />

      <AdEndCard frame={frame} fps={fps} headline="Start your FREE trial" sub="3 days monthly · 7 days yearly" accent={ACCENT} trial={false} />
      <BrandBadge portrait />
      <AdSound cues={AD6_SFX} />
    </AbsoluteFill>
  );
};
