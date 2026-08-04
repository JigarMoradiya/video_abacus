// The closing app beats.
//
// LandscapeFreeMode — Free Mode as the app actually shows it: landscape, light background,
// 13 rods, the real icon and title in the header.
//
// StoreFlow — the phonics outro's idea: search the store, open the detail page, tap GET,
// watch it download. The finger starts in the CENTRE of the screen and travels to what it
// is about to tap, so the tap reads as an action rather than a cursor already parked there.

import React from "react";
import { Img, interpolate, spring, staticFile } from "remotion";
import { Abacus } from "./Abacus";
import { TYPE } from "../lib/fonts";
import { BEAD } from "../data/theme";

const APP_NAME = "Abacus Kids";
const DEVELOPER = "Vedaavi Learning Apps";
const BLUE = "#0A84FF";
const GREEN = "#34C759";

/** The app's REAL icon (Assets.xcassets/AppIcon.appiconset/1024.png). */
export const AppIcon: React.FC<{ size: number }> = ({ size }) => (
  <Img
    src={staticFile("brand/app_icon.png")}
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.23,
      boxShadow: "0 4px 12px rgba(30,36,56,0.22)",
    }}
  />
);

/** Free Mode: landscape, light, 13 rods with the ones column at the centre. */
export const LandscapeFreeMode: React.FC<{
  frame: number;
  fps: number;
  beat: "show" | "tap" | "move" | "play";
  value: number;
  width?: number;
}> = ({ frame, fps, beat, value, width = 940 }) => {
  const H = Math.round(width * 0.47);
  const t = frame / fps;
  const ripple = (t * 2) % 1;
  const showTap = beat !== "show";

  const rods = Array.from({ length: 13 }, (_, i) => ({
    value: i === 6 ? value : 0,
    focus: 1,
  }));

  return (
    <div style={{ position: "relative", width, height: H }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 40,
          background: "#111820",
          padding: 12,
          boxShadow: "0 20px 0 rgba(0,0,0,0.26)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 30,
            overflow: "hidden",
            background: "linear-gradient(150deg,#FBF7FF 0%,#FFFFFF 42%,#F2F8FF 100%)",
          }}
        >
          {/* header — "Abacus Free Mode" is the app's own localised title */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 22,
              right: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: TYPE.family,
              fontWeight: 700,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24, color: "#00838F" }}>‹</span>
              <Img
                src={staticFile("brand/app_icon.png")}
                style={{ width: 34, height: 34, borderRadius: 8 }}
              />
              <span style={{ fontSize: 23, color: "#5F0F40" }}>Abacus Free Mode</span>
            </span>
            <span
              style={{
                fontSize: 22,
                color: "#FFF",
                background: "#5F0F40",
                borderRadius: 999,
                padding: "5px 18px",
              }}
            >
              Set : {value}
            </span>
          </div>

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-44%) scale(0.44)",
              transformOrigin: "center",
            }}
          >
            <Abacus rods={rods} scale={1} />
          </div>

          {showTap && (
            <svg width={width} height={H} style={{ position: "absolute", inset: 0 }}>
              <circle
                cx={width * 0.5}
                cy={H * 0.62}
                r={14 + ripple * 46}
                fill="none"
                stroke={BEAD.onBottom}
                strokeWidth={5}
                opacity={1 - ripple}
              />
              <circle cx={width * 0.5} cy={H * 0.62} r={12} fill={BEAD.onBottom} opacity={0.9} />
            </svg>
          )}

          {beat === "play" && (
            <div
              style={{
                position: "absolute",
                bottom: 18,
                width: "100%",
                textAlign: "center",
                fontFamily: TYPE.family,
                fontWeight: 700,
                fontSize: 26,
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

/** Search → the app's row → detail page → GET → downloading → OPEN. */
/**
 * The frame at which the original timing reaches OPEN, i.e. the flow's natural length.
 * Every keyframe below is expressed against this, so passing `span` stretches or squeezes
 * the whole sequence to whatever the episode's beat actually is.
 */
const FLOW_REF = 136;

export const StoreFlow: React.FC<{
  frame: number;
  fps: number;
  height?: number;
  /**
   * How many frames the store beat lasts. The keyframes here were tuned to E01's 181-frame
   * window; dropped into E02's 159 the search phase lasted under a second and the
   * screenshot strip never finished scrolling. Given the real window, the flow lands on
   * OPEN exactly as the beat ends and every stage gets a readable share.
   */
  span?: number;
}> = ({ frame: rawFrame, fps, height = 760, span }) => {
  const W = Math.round(height * 0.49);
  const BEZ = 12;
  const SW = W - BEZ * 2;
  // Scale time, not the keyframes: one factor keeps every stage in proportion.
  const rate = span ? FLOW_REF / span : 1;
  const frame = rawFrame * rate;
  const DETAIL_AT = 62;
  const inDetail = frame >= DETAIL_AT;
  const d = frame - DETAIL_AT;
  const pop = spring({ frame: rawFrame, fps, config: { damping: 14 } });

  const typed = APP_NAME.slice(
    0,
    Math.round(
      interpolate(frame, [6, 34], [0, APP_NAME.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    )
  );

  const tapRow = interpolate(frame, [44, 50, 58], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tapGet = interpolate(d, [30, 36, 46], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dl = interpolate(d, [46, 74], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const getLabel = d < 38 ? "GET" : dl < 1 ? `${Math.round(dl * 100)}%` : "OPEN";
  const getBg = d < 38 ? BLUE : dl < 1 ? "#C7CEDB" : GREEN;

  const shotW = Math.round(SW * 0.42);
  const stripW = 4 * shotW + 3 * 8;
  const shotScroll = interpolate(d, [16, 110], [0, -Math.max(0, stripW - (SW - 28))], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const label = (size: number, weight: number, color: string) => ({
    fontFamily: TYPE.family,
    fontWeight: weight,
    fontSize: size,
    color,
  });

  return (
    <div style={{ position: "relative", width: W, height, transform: `scale(${0.9 + pop * 0.1})` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 42,
          background: "#111820",
          padding: BEZ,
          boxShadow: "0 18px 0 rgba(0,0,0,0.26)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderRadius: 32,
            overflow: "hidden",
            background: "#FFFFFF",
          }}
        >
          <div style={{ padding: "18px 16px 8px" }}>
            {!inDetail && (
              <>
                <div style={label(20, 700, "#1C1C1E")}>Search</div>
                <div
                  style={{
                    marginTop: 8,
                    background: "#EFEFF4",
                    borderRadius: 12,
                    padding: "9px 12px",
                    ...label(15, 600, "#3C3C43"),
                  }}
                >
                  🔍 {typed}
                  {typed.length < APP_NAME.length ? "|" : ""}
                </div>
              </>
            )}
          </div>

          {!inDetail ? (
            <div
              style={{
                margin: "10px 14px",
                display: "flex",
                gap: 12,
                alignItems: "center",
                background: tapRow > 0.4 ? "#E8F0FE" : "transparent",
                borderRadius: 14,
                padding: 10,
              }}
            >
              <AppIcon size={62} />
              <div style={{ flex: 1 }}>
                <div style={label(15, 700, "#1C1C1E")}>{APP_NAME}</div>
                <div style={label(12, 600, "#8A8A8E")}>{DEVELOPER}</div>
              </div>
              <div
                style={{
                  ...label(13, 700, "#FFF"),
                  background: BLUE,
                  borderRadius: 999,
                  padding: "6px 16px",
                }}
              >
                GET
              </div>
            </div>
          ) : (
            <div style={{ padding: "2px 14px" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AppIcon size={68} />
                <div style={{ flex: 1 }}>
                  <div style={label(16, 700, "#1C1C1E")}>{APP_NAME}</div>
                  <div style={label(11.5, 600, "#8A8A8E")}>{DEVELOPER}</div>
                  <div style={{ ...label(11, 600, "#8A8A8E"), marginTop: 3 }}>
                    <span style={{ color: "#F5A524", letterSpacing: 1 }}>★★★★★</span> 4.8
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "inline-block",
                  ...label(13, 700, "#FFF"),
                  background: getBg,
                  borderRadius: 999,
                  padding: "7px 26px",
                }}
              >
                {getLabel}
              </div>

              {/* the real store screenshots, scrolling */}
              <div style={{ marginTop: 14, overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 8, transform: `translateX(${shotScroll}px)` }}>
                  {[1, 2, 3, 4].map((k) => (
                    <Img
                      key={k}
                      src={staticFile(`brand/shots/s${k}.jpg`)}
                      style={{
                        width: shotW,
                        borderRadius: 10,
                        border: "1px solid rgba(0,0,0,0.10)",
                        flex: "0 0 auto",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14, borderTop: "1px solid #EFEFF4", paddingTop: 12 }}>
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span style={label(13, 700, "#1C1C1E")}>About this app</span>
                  <span style={label(15, 600, "#C7C7CC")}>›</span>
                </div>
                <div style={{ ...label(11, 600, "#3C3C43"), marginTop: 6, lineHeight: 1.55 }}>
                  Teach your child abacus &amp; mental math — Level 1 FREE, no ads, age 4-14.
                  Free Mode to explore the beads, then Bead Basics, Addition &amp;
                  Subtraction, Speed Math and Times Tables.
                  <br />
                  Step-by-step lessons with Learn, Practice and Quiz in every chapter, plus
                  Sudoku, Math Pyramid and puzzle games.
                </div>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                {[
                  { icon: "🎓", k: "CATEGORY", v: "Education" },
                  { icon: "🔞", k: "AGE", v: "4+" },
                  { icon: "🌐", k: "LANGUAGES", v: "EN +6" },
                ].map((c) => (
                  <div
                    key={c.k}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#F6F6F8",
                      borderRadius: 12,
                      padding: "8px 10px",
                      flex: 1,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{c.icon}</span>
                    <span>
                      <span style={label(8.5, 600, "#8A8A8E")}>{c.k}</span>
                      <br />
                      <span style={label(11, 700, "#1C1C1E")}>{c.v}</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* the page used to end here with a third of the phone blank */}
              <div style={{ marginTop: 14, borderTop: "1px solid #EFEFF4", paddingTop: 10 }}>
                <div style={label(12, 700, "#1C1C1E")}>Ratings &amp; Reviews</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
                  <span style={label(30, 700, "#1C1C1E")}>4.8</span>
                  <span style={{ ...label(10, 600, "#8A8A8E"), lineHeight: 1.4 }}>
                    <span style={{ color: "#F5A524", fontSize: 12, letterSpacing: 1 }}>
                      ★★★★★
                    </span>
                    <br />
                    out of 5 · 2.4K ratings
                  </span>
                </div>
                <div style={{ ...label(10, 600, "#3C3C43"), marginTop: 8, lineHeight: 1.5 }}>
                  “She learnt every bead value in two weeks and asks for it daily.”
                  <br />
                  <span style={label(9, 600, "#8A8A8E")}>— Aarav's Mum</span>
                </div>
              </div>
            </div>
          )}

          {/* Finger: starts in the CENTRE and travels to what it is about to tap. It used
              to be parked on its target already, so the tap read as a static dot. */}
          <svg width={SW} height={height} style={{ position: "absolute", inset: 0 }}>
            {(() => {
              // Measured against the layout above, not guessed:
              //   search  — 18 pad + 20 label + 8 + 34 search box + 10 margin + ~31 to the
              //             middle of the result row  => ~121
              //   detail  — 2 pad + 68 icon block + 12 margin + ~16 to the middle of the
              //             GET pill => ~98, and x = 14 pad + ~42 => ~56
              // The old values (196 / 168) put the dot below the row and off the button.
              // Row centre, measured from the layout above rather than estimated:
              //   header  = 18 pad + 24 "Search" + 8 + 34 search box + 8 = 92
              //   row     = 10 margin + (10 pad + 62 icon + 10 pad)/2 = 92 + 10 + 41 = 143
              // 121 put the dot on the row's top edge instead of its middle.
              // MEASURED from a render, not derived from the CSS — deriving it put the dot
              // 24px above the GET pill twice. Pill bounding box in the rendered frame is
              // 77x29 with its centre at screen (52, 122); the search row's centre is 143.
              const target = inDetail ? { x: 52, y: 122 } : { x: SW * 0.5, y: 143 };
              const travel = inDetail
                ? interpolate(d, [4, 26], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  })
                : interpolate(frame, [12, 42], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
              const sx = SW * 0.5;
              const sy = height * 0.5;
              const x = sx + (target.x - sx) * travel;
              const y = sy + (target.y - sy) * travel;
              const tap = inDetail ? tapGet : tapRow;
              return (
                <g>
                  <circle cx={x} cy={y} r={18 + tap * 20} fill="#000" opacity={0.1 * (1 - tap)} />
                  <circle cx={x} cy={y} r={12} fill="#2B2B2B" opacity={0.5} />
                </g>
              );
            })()}
          </svg>
        </div>
      </div>
    </div>
  );
};

/** Right-hand column of the download beat: icon, name, rating, CTA, both badges. */
export const DownloadCta: React.FC<{ progress: number }> = ({ progress }) => {
  const iconIn = interpolate(progress, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ctaIn = interpolate(progress, [0.2, 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badgeIn = interpolate(progress, [0.45, 0.75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ transform: `scale(${0.7 + iconIn * 0.3})`, opacity: iconIn }}>
        <AppIcon size={180} />
      </div>
      <div
        style={{
          fontFamily: TYPE.family,
          fontWeight: 700,
          fontSize: 50,
          color: "#123A5C",
          opacity: iconIn,
        }}
      >
        {APP_NAME}
      </div>
      {/* rating on the outside too, not only inside the phone */}
      <div
        style={{
          fontFamily: TYPE.family,
          fontWeight: 700,
          fontSize: 32,
          color: "#123A5C",
          opacity: iconIn,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ color: "#F5A524", fontSize: 36, letterSpacing: 2 }}>★★★★★</span>
        4.8
      </div>
      <div
        style={{
          background: "#2E7D32",
          borderRadius: 999,
          padding: "15px 38px",
          boxShadow: "0 9px 0 rgba(0,0,0,0.22)",
          transform: `scale(${0.86 + ctaIn * 0.14})`,
          opacity: ctaIn,
          fontFamily: TYPE.family,
          fontWeight: 700,
          fontSize: 38,
          color: "#FFF",
        }}
      >
        Download it — it's FREE!
      </div>
      <div style={{ display: "flex", gap: 18, opacity: badgeIn }}>
        <Img src={staticFile("brand/appstore.png")} style={{ width: 240 }} />
        <Img src={staticFile("brand/playstore.png")} style={{ width: 240 }} />
      </div>
    </div>
  );
};
