// THE "FIND IT IN THE APP" MONTAGE — a real screen recording of the actual app (captured in
// the iOS simulator) inside a landscape phone bezel, because the app itself is landscape-only:
// a portrait re-creation would show parents something the app never looks like. The reel's
// narration line has four beats (Math Game Zone → pick the game → choose level → play) and a
// step chip pops under the phone on each beat. Tap rings are overlaid in Remotion at measured
// positions, since simulator recordings don't visualize touches.

import React from "react";
import { Img, interpolate, OffthreadVideo, Sequence, staticFile } from "remotion";
import { KID_FONT } from "../../lib/fonts";

export interface NavStep {
  /** reel frame this step's chip pops */
  atFrame: number;
  label: string;
}

export interface NavRing {
  /** reel frame the ring lands */
  atFrame: number;
  /** position as fractions of the VIDEO's width/height */
  x: number;
  y: number;
}

export const AppNavMontage: React.FC<{
  frame: number;
  /** montage window — the whole block fades in/out at these edges */
  startFrame: number;
  endFrame: number;
  /** recording file under public/ */
  videoSrc: string;
  /** seconds to trim off the recording's start */
  videoStartFromSec?: number;
  playbackRate?: number;
  steps: NavStep[];
  rings?: NavRing[];
  /** phone block width; height derives from the recording's aspect */
  width: number;
  x: number;
  y: number;
  videoAspect?: number; // width/height of the recording
  fps: number;
}> = ({ frame, startFrame, endFrame, videoSrc, videoStartFromSec = 0, playbackRate = 1, steps, rings = [], width, x, y, videoAspect = 2.16, fps }) => {
  if (frame < startFrame - 5 || frame > endFrame + 5) return null;
  const blockIn = interpolate(frame, [startFrame, startFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blockOut = interpolate(frame, [endFrame - 6, endFrame], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(blockIn, blockOut);

  const bezel = 14;
  const screenW = width - bezel * 2;
  const screenH = screenW / videoAspect;
  const phoneH = screenH + bezel * 2;

  const logoIn = interpolate(frame, [startFrame, startFrame + 10, startFrame + 16], [0.4, 1.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const LOGO_SIZE = 128;
  const LOGO_GAP = 46;

  return (
    <div style={{ position: "absolute", left: x, top: y, width, opacity }}>
      {/* a bigger brand mark sits above the phone, with real breathing room before the
          bezel starts — the small corner badge alone got lost next to the recording. */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: LOGO_GAP,
          transform: `scale(${logoIn})`,
        }}
      >
        <Img src={staticFile("brand/app_icon.png")} style={{ width: LOGO_SIZE, height: LOGO_SIZE, borderRadius: 30, boxShadow: "0 10px 0 rgba(0,0,0,0.22)" }} />
      </div>

      {/* the phone — same dark rounded bezel language as AppShowcase's LandscapeFreeMode */}
      <div
        style={{
          width,
          height: phoneH,
          borderRadius: 36,
          background: "#111820",
          padding: bezel,
          boxShadow: "0 16px 0 rgba(0,0,0,0.3)",
          transform: `scale(${0.96 + blockIn * 0.04})`,
        }}
      >
        <div style={{ position: "relative", width: screenW, height: screenH, borderRadius: 24, overflow: "hidden", background: "#000" }}>
          {/* MUST be its own Sequence: without one, OffthreadVideo seeks by the GLOBAL
              composition frame instead of time-since-montage-start, so by the time this
              block reaches its ~37s mark it's seeking miles past an 8s clip and just
              freezes on the last frame for the whole block — the actual bug behind
              "nothing is playing, just an empty background". */}
          <Sequence from={startFrame} durationInFrames={endFrame - startFrame + 16}>
            <OffthreadVideo
              src={staticFile(videoSrc)}
              startFrom={Math.round(videoStartFromSec * fps)}
              playbackRate={playbackRate}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Sequence>
          {rings.map((r, i) => {
            const p = interpolate(frame, [r.atFrame - 8, r.atFrame], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            if (frame < r.atFrame - 8 || frame > r.atFrame + 6) return null;
            const size = interpolate(p, [0, 1], [120, 64]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: r.x * screenW - size / 2,
                  top: r.y * screenH - size / 2,
                  width: size,
                  height: size,
                  border: "6px solid #FFFFFF",
                  borderRadius: 999,
                  boxShadow: "0 0 12px rgba(0,0,0,0.4)",
                  opacity: interpolate(p, [0, 0.3, 1], [0, 1, 1]),
                }}
              />
            );
          })}
        </div>
      </div>

      {/* the step chips — one pops per narration beat, previous ones stay lit */}
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        {steps.map((s, i) => {
          const sIn = interpolate(frame, [s.atFrame, s.atFrame + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span
              key={i}
              style={{
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 28,
                color: "#FFF",
                background: "#1B1440",
                border: "3px solid rgba(255,255,255,0.5)",
                borderRadius: 999,
                padding: "8px 20px",
                opacity: sIn,
                transform: `scale(${0.7 + sIn * 0.3})`,
              }}
            >
              {s.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};
