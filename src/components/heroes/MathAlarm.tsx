// THE MATH ALARM — a real push-notification banner, not a sign in the sky. White card,
// bold header, colour only in the accent ring/icon — the same visual language a phone's own
// alert uses, so "an alert just came in" reads instantly instead of needing a caption to
// explain it. Flashes red while stuck, green the instant it's solved — the same "state you
// can read from across the room" job E09's negative-X and E10's landing-glow both did.

import React from "react";
import { Img, staticFile } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export type AlarmState = "idle" | "alert" | "solved";

export const MathAlarm: React.FC<{
  /** top edge, in canvas px — negative while sliding in from off-screen */
  y: number;
  width?: number;
  a: number;
  b: number;
  op: "+" | "−";
  answer?: number;
  state: AlarmState;
  frame: number;
  fps: number;
  /** the small header row — "MATH ALARM" by default. A second reel about a different trick
   *  (numbers going missing, not stuck) gets its own header rather than reusing this one's
   *  wording under a different picture. */
  label?: string;
  /** the "alert" state's colour — red by default. Opt-in so a daytime reel can use amber
   *  instead of reusing reel 1's red-alert without it having to mean the same thing here. */
  alertColor?: string;
}> = ({ y, width = 700, a, b, op, answer, state, frame, fps, label = "MATH ALARM", alertColor = "#E23B3B" }) => {
  const t = frame / fps;
  const pulse = 0.5 + Math.sin(t * 6) * 0.5;
  const accent = state === "solved" ? "#1FA855" : state === "alert" ? alertColor : "#8892A6";
  const ringGlow = state === "idle" ? 0 : 0.5 + pulse * 0.5;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        transform: "translateX(-50%)",
        width,
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 22,
          background: "rgba(255,255,255,0.98)",
          borderRadius: 30,
          padding: "22px 30px",
          boxShadow: `0 12px 0 rgba(0,0,0,0.18), 0 0 0 5px ${accent}, 0 0 ${34 + ringGlow * 26}px ${accent}`,
        }}
      >
        {/* the SENDER icon — the real app icon, where a phone notification always shows the
            icon of the app that sent it. Baked into the card itself, not a corner watermark,
            so it can't be cropped out without cropping the alert too. */}
        <Img
          src={staticFile("brand/app_icon.png")}
          style={{ width: 100, height: 100, borderRadius: 26, flexShrink: 0 }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 26, color: "#8892A6", letterSpacing: 2 }}>
            {label}
          </span>
          <div style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 58, color: "#101A2E", lineHeight: 1.05 }}>
            {state === "solved" && answer !== undefined ? `${a} ${op} ${b} = ${answer}` : `${a} ${op} ${b} = ?`}
          </div>
        </div>

        {/* the state chip, top-right of a real notification */}
        <div
          style={{
            alignSelf: "flex-start",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 20,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}
        >
          {state === "solved" ? "Solved" : state === "alert" ? "Now" : ""}
        </div>

        {/* the alert/solved indicator — now a small badge overlapping the card's own top-right
            corner, the same way a real app icon carries its own notification badge, instead
            of being the card's main icon. */}
        <div
          style={{
            position: "absolute",
            top: -14,
            right: -14,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: accent,
            border: "4px solid #FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: KID_FONT,
            fontWeight: 700,
            fontSize: 20,
            color: "#FFF",
            boxShadow: "0 3px 0 rgba(0,0,0,0.2)",
          }}
        >
          {state === "solved" ? "✓" : "!"}
        </div>
      </div>
    </div>
  );
};

/** The card's own footprint, for placement/overlap checks by hand — this reel doesn't run
 *  through the shared guard system, so this is measured the same way world props always are. */
export const ALARM_BOX = { up: 0, down: 128, half: 350 };
