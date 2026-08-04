// The closing beats: the app in a phone, the store badges, and a teaser for episode 2.
//
// The phone screen is a live recreation of Free Mode rather than a screenshot, so it can
// actually do what the lines say — "tap every bead" shows a tap, "move them yourself"
// shows a bead move. A still image under those three lines was the last static stretch
// left in the episode.

import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { Abacus } from "./Abacus";
import { KID_FONT } from "../lib/fonts";
import { BEAD, RIG } from "../data/theme";

/** Phone body with the app's Free Mode screen inside it. */
export const PhoneFreeMode: React.FC<{
  frame: number;
  fps: number;
  /** which stage of the close we're in */
  beat: "show" | "tap" | "move" | "play";
  value: number;
}> = ({ frame, fps, beat, value }) => {
  const t = frame / fps;
  const W = 470;
  const H = 940;
  // tap ripple pulses about twice a second while tapping
  const ripple = (t * 2) % 1;
  const showTap = beat === "tap" || beat === "move" || beat === "play";

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      {/* phone body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 62,
          background: "#1F2933",
          boxShadow: "0 22px 0 rgba(0,0,0,0.28)",
          padding: 14,
        }}
      >
        {/* screen — the app's own pale background, since this IS the app */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 50,
            overflow: "hidden",
            background: "linear-gradient(160deg,#F7F2FF 0%,#FDFCFF 45%,#EFF6FF 100%)",
          }}
        >
          {/* notch */}
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 132,
              height: 26,
              borderRadius: 999,
              background: "#1F2933",
            }}
          />

          {/* app header, matching Free Mode's own bar */}
          <div
            style={{
              position: "absolute",
              top: 58,
              left: 20,
              right: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: KID_FONT,
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 22, color: "#00838F" }}>‹ Free Mode</span>
            <span style={{ fontSize: 22, color: "#5F0F40" }}>Set : {value}</span>
          </div>

          {/* the abacus, drawn by the same component the video uses */}
          <div
            style={{
              position: "absolute",
              top: 300,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Abacus rods={[{ value }, { value: 0 }, { value: 0 }]} scale={0.62} />
          </div>

          {/* tap ripple on the ones rod */}
          {showTap && (
            <svg
              width={W}
              height={H}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              <circle
                cx={W * 0.66}
                cy={H * 0.52}
                r={18 + ripple * 52}
                fill="none"
                stroke={BEAD.onBottom}
                strokeWidth={6}
                opacity={1 - ripple}
              />
              <circle cx={W * 0.66} cy={H * 0.52} r={15} fill={BEAD.onBottom} opacity={0.85} />
            </svg>
          )}

          {beat === "play" && (
            <div
              style={{
                position: "absolute",
                bottom: 54,
                left: 0,
                width: "100%",
                textAlign: "center",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 30,
                color: "#2E7D32",
              }}
            >
              Nice! ⭐
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** The two real store badges, as used by the phonics series. */
export const StoreBadges: React.FC<{ progress: number }> = ({ progress }) => {
  const a = interpolate(progress, [0, 0.3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const g = interpolate(progress, [0.18, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
      <Img
        src={staticFile("brand/appstore.png")}
        style={{ width: 380, transform: `scale(${0.8 + a * 0.2})`, opacity: a }}
      />
      <Img
        src={staticFile("brand/playstore.png")}
        style={{ width: 380, transform: `scale(${0.8 + g * 0.2})`, opacity: g }}
      />
    </div>
  );
};

/**
 * The next-episode teaser. Series furniture (EPISODE_RULES.md §2), so the shell is fixed
 * and the promise inside it changes every episode — the teaser must SHOW what is coming,
 * not only name it, which is why the example is a slot rather than a string.
 */
export const NextUpCard: React.FC<{
  progress: number;
  /** two lines, because the shell is sized for two */
  title?: [string, string];
  /** what the next episode will do, drawn. Defaults to E01's "your first number". */
  example?: React.ReactNode;
}> = ({ progress, title = ["your first", "number"], example }) => {
  // 0 -> 1 on the ones rod, part-way through the line
  const set = progress > 0.45;
  const settle = interpolate(progress, [0.45, 0.72], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        background: "rgba(255,255,255,0.96)",
        borderRadius: 46,
        padding: "30px 46px",
        boxShadow: "0 12px 0 rgba(0,0,0,0.2)",
      }}
    >
      <div style={{ textAlign: "left", fontFamily: KID_FONT }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: RIG.woodDark, letterSpacing: 2 }}>
          NEXT VIDEO
        </div>
        <div style={{ fontSize: 62, fontWeight: 700, color: BEAD.onBottom, lineHeight: 1.1 }}>
          {title[0]}
          <br />
          {title[1]}
        </div>
      </div>
      {/* the example: one bead goes up and the rod reads 1 */}
      {example ?? (
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <Abacus
            rods={[{ value: set ? 1 : 0, from: 0 }]}
            settle={settle}
            scale={0.58}
          />
          <span
            style={{
              fontFamily: KID_FONT,
              fontWeight: 700,
              fontSize: 96,
              color: set ? BEAD.onBottom : "#B9C6CE",
            }}
          >
            {set ? 1 : "?"}
          </span>
        </div>
      )}
    </div>
  );
};


/**
 * The like-and-subscribe beat. Series furniture, placed straight after the praise while
 * the viewer is feeling good (EPISODE_RULES.md §3.9), and it promises no schedule — a
 * cadence the upload calendar cannot keep costs trust, which is why E01 dropped
 * "tomorrow".
 *
 * Both controls get an actual tap, because a child who has just been told to tap something
 * should see it being tapped. The bell rings once and then settles.
 */
export const SubscribeCard: React.FC<{ progress: number; frame: number; fps: number }> = ({
  progress,
  frame,
  fps,
}) => {
  const t = frame / fps;
  const ease = (from: number, to: number) =>
    interpolate(progress, [from, to], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  const thumbIn = ease(0.05, 0.3);
  const bellIn = ease(0.32, 0.55);
  // one ring, not a loop: it lands on the word and then stops
  const ring = interpolate(progress, [0.55, 0.62, 0.78], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tap = (t * 2) % 1;

  const Pill: React.FC<{
    label: string;
    bg: string;
    pop: number;
    children: React.ReactNode;
  }> = ({ label, bg, pop, children }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: bg,
        borderRadius: 999,
        padding: "22px 42px",
        boxShadow: "0 10px 0 rgba(0,0,0,0.24)",
        transform: `scale(${0.82 + pop * 0.18})`,
        opacity: pop,
      }}
    >
      {children}
      <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 54, color: "#FFF" }}>
        {label}
      </span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start" }}>
      <Pill label="Like" bg="#2E7D32" pop={thumbIn}>
        <svg width={64} height={64} viewBox="0 0 64 64">
          <path
            d="M22 28 L32 10 Q36 6 39 10 L36 26 L54 26 Q58 30 56 34 L50 54 Q48 58 44 58 L22 58 Z"
            fill="#FFF"
          />
          <rect x={6} y={28} width={14} height={30} rx={4} fill="#FFF" opacity={0.9} />
        </svg>
      </Pill>
      <Pill label="Subscribe" bg="#C62828" pop={bellIn}>
        <svg width={64} height={64} viewBox="0 0 64 64">
          <g transform={`rotate(${Math.sin(ring * Math.PI * 4) * 16} 32 14)`}>
            <path
              d="M32 8 Q46 10 46 26 L48 42 L16 42 L18 26 Q18 10 32 8 Z"
              fill="#FFF"
            />
            <circle cx={32} cy={50} r={7} fill="#FFF" />
          </g>
        </svg>
      </Pill>
      {/* the tap itself, on whichever control has just arrived */}
      <svg width={520} height={260} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {bellIn > 0.5 && (
          <circle
            cx={64}
            cy={186}
            r={26 + tap * 46}
            fill="none"
            stroke="#FFF"
            strokeWidth={5}
            opacity={(1 - tap) * 0.8}
          />
        )}
        {thumbIn > 0.5 && bellIn < 0.5 && (
          <circle
            cx={64}
            cy={54}
            r={26 + tap * 46}
            fill="none"
            stroke="#FFF"
            strokeWidth={5}
            opacity={(1 - tap) * 0.8}
          />
        )}
      </svg>
    </div>
  );
};
