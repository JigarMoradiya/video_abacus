// NUMBER MERGE — seventh Math Game Zone reel, and a SIXTH distinct cast: the two seagulls
// (grey & cream) from E09, over a deep violet-plum Sky Islands night — its own palette,
// distinct from the indigo dojo, coral dawn, maroon bingo hall, and teal den before it. A
// 2048-style chain of merges climbs "higher" through the video exactly as the script says,
// matching the REAL swipe mechanic (checked against Merge2048ViewModel.swift): every tile in
// the row slides all the way to the wall and merges with the first match it hits there. Real
// screenshots + real gameplay recording (user-provided) drive the "find it in the app" montage.
//
// Timing from public/audio/short_video_game_number_merge/*.phrases.json, aligned from
// docs/reel_game_number_merge_lines.txt. 12 phrases, ~52.6s. SEVEN anomalies patched.
//
// Persistent header pattern (learned on Missing Sign): the title + category chip stay hidden
// until the narrator actually names the game, then stay on top of everything — teaching,
// parent beat, nav — all the way to the store screen, instead of flashing once and vanishing.

import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import phrasesJson from "../data/game_number_merge.phrases.json";
import { sec, makeTrack, type TPhrase } from "../lib/timing";
import { clockAt } from "../stage/clock";
import { Seagull, type SeagullMood } from "../components/e09/Seagull";
import { SkyIslandsWorld } from "../components/heroes/SkyIslandsWorld";
import { GameTitleCard } from "../components/gamezone/GameTitleCard";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { AppNavMontage } from "../components/gamezone/AppNavMontage";
import { NumberMergeSim, TILE_COLORS, tileInk, type TileTrack, type TileKeyframe, type SwipeCue } from "../components/gamezone/sims/NumberMergeSim";
import { applyMove, type MTile } from "../lib/merge2048";
import { Celebration } from "../components/heroes/Celebration";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { Caption } from "../components/Caption";
import type { Layout } from "../stage/layout";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

const PHRASES = phrasesJson as unknown as TPhrase[];
export const AUDIO_SEC = 52.610563;
export const FPS = 30;

// toggled by hand to produce the "without music" delivered version — ducked WAY down (this
// reel has a full narration track to sit under, unlike the trailer which has none) using the
// same ambient pad every reel in the series shares (tools/make_music.py).
const INCLUDE_MUSIC = true;
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps

export const GAME_NUMBER_MERGE_DURATION = sec(AUDIO_SEC, FPS);

const W = 1080;
const H = 1920;

const P = (i: number, which: "start" | "end") => sec(PHRASES[i][which], FPS);

// ---------------------------------------------------------------- the sim's storyboard
// A REAL persistent board, not isolated per-beat scenarios. One tile list evolves across the
// whole video: every swipe below is computed by applyMove() — the actual ported algorithm
// (src/lib/merge2048.ts, copied from Merge2048ViewModel.swift) — and every new tile is an
// explicit, visible spawn, exactly like the real game. Round 1 and Round 2's merges are
// word-synced to land exactly on "eight!" and "sixteen!"; everything else (the hook's 2+2, the
// spawns' timing) is this reel's own choice of when to feed the persistent board its next tile.
const F = (s: number) => sec(s, FPS);

let boardTiles: MTile[] = [
  { id: 1, value: 16, row: 0, col: 3 },
  { id: 2, value: 2, row: 2, col: 0 },
  { id: 3, value: 2, row: 2, col: 3 },
  { id: 4, value: 64, row: 3, col: 0 },
];
let nextTileId = 5;
const tileTracks: Record<number, TileTrack> = {};
const swipeCues: SwipeCue[] = [];
const mergeFrames: number[] = [];

const ensureTrack = (id: number): TileTrack => (tileTracks[id] ??= { id, keyframes: [] });
const pushKf = (id: number, kf: TileKeyframe) => ensureTrack(id).keyframes.push(kf);
for (const tl of boardTiles) pushKf(tl.id, { frame: 0, row: tl.row, col: tl.col, value: tl.value });

/** one real swipe, in any of the 4 directions, applied to the CURRENT persistent board.
    `lane` is the row (for left/right) or column (for up/down) the chevron cue sweeps along —
    purely cosmetic, doesn't affect the actual merge math. */
function doSwipe(dir: "left" | "right" | "up" | "down", lane: number, slideAt: number, mergeAt: number) {
  const before = boardTiles;
  const res = applyMove(before, dir);
  for (const tl of before) {
    const dest = res.movedTo[tl.id];
    if (!dest) continue;
    pushKf(tl.id, { frame: slideAt, row: tl.row, col: tl.col, value: tl.value });
    pushKf(tl.id, { frame: mergeAt, row: dest.row, col: dest.col, value: tl.value });
  }
  for (const id of res.absorbedIds) {
    const val = before.find((t) => t.id === id)!.value;
    pushKf(id, { frame: mergeAt + 6, row: res.movedTo[id].row, col: res.movedTo[id].col, value: val, opacity: 0, scale: 0.6 });
  }
  for (const id of res.doubledIds) {
    const newVal = res.tiles.find((t) => t.id === id)!.value;
    const pos = res.movedTo[id];
    pushKf(id, { frame: mergeAt + 1, row: pos.row, col: pos.col, value: newVal, scale: 1.3 });
    pushKf(id, { frame: mergeAt + 10, row: pos.row, col: pos.col, value: newVal, scale: 1 });
  }
  swipeCues.push({ dir, lane, atFrame: slideAt - 9, toFrame: slideAt });
  mergeFrames.push(mergeAt);
  boardTiles = res.tiles;
}

/** a fresh tile pops onto the board — a real, visible spawn, not a silent reset. */
function doSpawn(value: number, row: number, col: number, at: number) {
  const t: MTile = { id: nextTileId++, value, row, col };
  boardTiles.push(t);
  pushKf(t.id, { frame: at - 8, row, col, value, opacity: 0, scale: 0.4 });
  pushKf(t.id, { frame: at, row, col, value, opacity: 1, scale: 1.15 });
  pushKf(t.id, { frame: at + 6, row, col, value, opacity: 1, scale: 1 });
}

// named explicitly (not read back from mergeFrames by array position) — doSwipe pushes to
// that array on every call including the down-demo, so positional destructuring would have
// silently grabbed the wrong frame the moment the number of swipes changed.
const HOOK_MERGE = F(3.4);
const ROUND1_MERGE = F(14.98);
const DOWN_DEMO_SLIDE_MERGE = F(16.9); // first down-swipe: only one tile exists yet, so it just slides, no merge
const DOWN_DEMO_MERGE = F(18.7);
const ROUND2_MERGE = F(22.24);
const ROUND3_MERGE = F(29.62);

doSwipe("right", 2, F(0.9), HOOK_MERGE); // hook: "Two matching tiles slide together... and merge into one!" (2+2=4)
doSpawn(4, 2, 0, F(7.2)); // a fresh 4 pops in during "This is Number Merge! Swipe to combine tiles..."
doSwipe("right", 2, F(13.22), ROUND1_MERGE); // "Four meets four — that's eight!" (4+4=8, lands exactly on "eight!")

// a DOWN-swipe demo in the empty column 2, during "Swipe again, and keep the chain going!" —
// proving the mechanic isn't just left-to-right. The real game spawns exactly ONE tile per
// move, never two before a swipe — so this is two real move cycles (spawn, then a swipe that
// just slides it since nothing matches yet; spawn again, then a swipe that merges), not two
// simultaneous spawns.
doSpawn(2, 0, 2, F(15.4));
doSwipe("down", 2, F(15.8), DOWN_DEMO_SLIDE_MERGE); // solo tile slides to the wall, nothing to merge with yet
doSpawn(2, 1, 2, F(17.1));
doSwipe("down", 2, F(17.4), DOWN_DEMO_MERGE); // now it merges with the one already at the wall
doSpawn(8, 2, 0, F(19.6)); // feeds Round 2

doSwipe("right", 2, F(20.62), ROUND2_MERGE); // "Eight meets eight — that's sixteen!" (8+8=16, lands on "sixteen!")

// A left-swipe demo was tried here too, but a swipe acts on the WHOLE board, not just one
// row — since the growing chain tile sits at the right wall (col 3), any LEFT swipe drags it
// back to col 0 and breaks Round 3's merge. A down-swipe is safe here because the chain tile
// already occupies the exact cell a down-compaction would leave it at; left/right isn't, so
// it's dropped rather than silently repositioning the chain to paper over it.
doSpawn(16, 2, 0, F(24.6)); // feeds Round 3

doSwipe("right", 2, F(28.2), ROUND3_MERGE); // "Chain your merges..." keeps the climb going (16+16=32)

const TILE_TRACKS = Object.values(tileTracks);

const SIM_X = W / 2 - (4 * 88 + 3 * 10) / 2;
const SIM_Y = H * 0.19;

// the persistent "NUMBER MERGE! / Number Adventures" header — held back until the narrator
// names the game, then stays on top of everything all the way to the store screen.
const HEADER_AT = sec(6.86, FPS); // "This is Number Merge!"

const BENEFIT_AT = sec(34.16, FPS);
const BENEFIT_1_AT = sec(35.76, FPS); // "doubling instinct"
const BENEFIT_2_AT = sec(37.36, FPS); // "strategic planning"

// ---------------------------------------------------------------- nav montage beats (p10)
const NAV_START = P(10, "start");
const NAV_STEPS = [
  { atFrame: sec(42.68, FPS), label: "1️⃣ Math Game Zone" },
  { atFrame: sec(44.68, FPS), label: "2️⃣ Number Merge" },
  { atFrame: sec(46.42, FPS), label: "3️⃣ Choose your level" },
  { atFrame: sec(47.12, FPS), label: "4️⃣ Play!" },
];
const NAV_END = NAV_START + 234; // 75 (home) + 48 (zone) + 39 (diff) + 72 (gameplay), 7.8s

const STORE_START = P(11, "start");
const STORE_FRAMES = 100;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.55 },
  { frame: HOOK_MERGE, file: "gz_tile_place.mp3", vol: 0.4 },
  { frame: ROUND1_MERGE, file: "gz_correct.mp3", vol: 0.5 },
  { frame: DOWN_DEMO_MERGE, file: "gz_tile_place.mp3", vol: 0.4 },
  { frame: ROUND2_MERGE, file: "gz_correct.mp3", vol: 0.5 },
  { frame: ROUND3_MERGE, file: "gz_win.mp3", vol: 0.5 },
  { frame: BENEFIT_AT, file: "gz_benefit.mp3", vol: 0.55 },
  ...NAV_STEPS.map((s) => ({ frame: s.atFrame, file: "gz_tap.mp3", vol: 0.5 })),
  { frame: STORE_START + 4, file: "cta_pop.mp3", vol: 0.45 },
];

const REEL_LAYOUT: Layout = {
  W,
  H,
  portrait: true,
  band: { headlineTop: 0, headlineBottom: 0, stageTop: 0, stageBottom: 0, captionTop: H - 230, captionBottom: H - 90 },
  cardBand: null,
  cardMaxW: W - 80,
  edge: 20,
  captionMaxW: W - 120,
  captionSize: 34,
  propScale: 1,
};
const CAPTION_KEYWORDS = ["merge!", "eight!", "sixteen!", "chain", "climb?", "doubling", "strategic", "free"];

export const ShortGameNumberMerge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { p, beatProgress } = clockAt(PHRASES, frame, fps);
  const track = useMemo(() => makeTrack(PHRASES, FPS), []);

  const showSim = p <= 8;
  const dimIn = p === 9 ? interpolate(frame, [P(9, "start"), P(9, "start") + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  const gullMoodA: SeagullMood = p <= 1 ? "wave" : p <= 7 ? "sit" : p === 8 ? "cheer" : p === 9 ? "point" : p === 10 ? "point" : "sit";
  const gullMoodB: SeagullMood = p <= 1 ? "wave" : p <= 7 ? "sit" : p === 8 ? "cheer" : p === 9 ? "think" : p === 10 ? "sit" : "sit";
  const mascotY = H * 0.86;

  return (
    <AbsoluteFill style={{ background: "#1B1240" }}>
      <SkyIslandsWorld width={W} height={H} frame={frame} fps={fps} />

      {showSim && (
        <NumberMergeSim frame={frame} fps={fps} x={SIM_X} y={SIM_Y} tracks={TILE_TRACKS} swipeCues={swipeCues} targetLabel="🎯 Reach 128!" scale={1.2} />
      )}

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Celebration x={W / 2} y={SIM_Y + 300} frame={frame} fps={fps} startFrame={ROUND1_MERGE} />
        <Celebration x={W / 2} y={SIM_Y + 300} frame={frame} fps={fps} startFrame={ROUND2_MERGE + 4} />
        <Celebration x={W / 2} y={SIM_Y + 300} frame={frame} fps={fps} startFrame={ROUND3_MERGE + 4} />
      </svg>

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <Seagull x={W * 0.16} y={mascotY} scale={0.95} mood={gullMoodA} marking="grey" progress={beatProgress} frame={frame} fps={fps} facing={1} />
        <Seagull x={W * 0.84} y={mascotY} scale={0.85} mood={gullMoodB} marking="cream" progress={beatProgress} frame={frame} fps={fps} facing={-1} phase={1.4} />
      </svg>

      {p === 9 && <div style={{ position: "absolute", inset: 0, background: "rgba(15,10,35,0.55)", opacity: dimIn }} />}
      {p === 9 && frame >= BENEFIT_AT - 26 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: H * 0.14,
            width: W,
            textAlign: "center",
            opacity: interpolate(frame, [BENEFIT_AT - 26, BENEFIT_AT - 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [BENEFIT_AT - 26, BENEFIT_AT - 18, BENEFIT_AT - 12], [0.3, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        >
          {/* the real tile ladder, 2 rows of 4 — every value a kid will actually see climb,
              before the "16+16=32" example makes it concrete */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 30 }}>
            {[[2, 4, 8, 16], [32, 64, 128, 256]].map((row, ri) => (
              <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                {row.map((val, ci) => {
                  const popAt = BENEFIT_AT - 24 + (ri * 4 + ci) * 3;
                  const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return (
                    <div
                      key={ci}
                      style={{
                        width: 100,
                        height: 100,
                        background: TILE_COLORS[val],
                        borderRadius: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 5px 0 rgba(0,0,0,0.2)",
                        transform: `scale(${pop})`,
                      }}
                    >
                      <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: val >= 100 ? 32 : 42, color: tileInk(val) }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 20 }}>
            {[
              { l: "16", c: "#FF8A65" },
              { l: "+", c: null },
              { l: "16", c: "#FF8A65" },
              { l: "=", c: null },
              { l: "32", c: "#FF7043" },
            ].map((it, i) => {
              const popAt = BENEFIT_AT + i * 4;
              const pop = interpolate(frame, [popAt, popAt + 6, popAt + 10], [0.2, 1.22, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const bob = Math.sin((frame / fps) * 2.1 + i * 0.9) * 6;
              return it.c ? (
                <div
                  key={i}
                  style={{
                    width: 86,
                    height: 86,
                    background: it.c,
                    borderRadius: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 0 rgba(0,0,0,0.22)",
                    transform: `translateY(${bob}px) scale(${pop})`,
                  }}
                >
                  <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 40, color: "#FFF" }}>{it.l}</span>
                </div>
              ) : (
                <span
                  key={i}
                  style={{
                    fontFamily: KID_FONT,
                    fontWeight: 700,
                    fontSize: 54,
                    color: "#FFFFFF",
                    textShadow: "0 3px 0 rgba(0,0,0,0.25)",
                    display: "inline-block",
                    transform: `scale(${pop}) translateY(${bob * 0.5}px)`,
                  }}
                >
                  {it.l}
                </span>
              );
            })}
          </div>
        </div>
      )}
      {p === 9 && frame >= BENEFIT_AT - 2 && (
        <BenefitCard
          frame={frame}
          fps={fps}
          startFrame={BENEFIT_AT}
          benefits={[
            { icon: "🧠", text: "Doubling instinct", atFrame: BENEFIT_1_AT },
            { icon: "🧩", text: "Strategic planning", atFrame: BENEFIT_2_AT },
          ]}
          accent="#2E9E62"
          x={W / 2 - 340}
          y={H * 0.38}
          width={680}
        />
      )}

      <AppNavMontage
        frame={frame}
        fps={fps}
        startFrame={NAV_START}
        endFrame={NAV_END}
        videoSrc="videos/nav_number_merge.mp4"
        videoStartFromSec={0}
        playbackRate={1}
        videoAspect={1600 / 736}
        steps={NAV_STEPS}
        rings={[
          { atFrame: NAV_START + 65, x: 0.787, y: 0.616 },
          { atFrame: NAV_START + 113, x: 0.817, y: 0.726 },
          { atFrame: NAV_START + 145, x: 0.663, y: 0.89 },
        ]}
        width={W - 120}
        x={60}
        y={H * 0.19}
      />

      {frame < STORE_START && (
        <Caption track={track} frame={frame} ink="#1C3A4A" accent="#2E9E62" keywords={CAPTION_KEYWORDS} layout={REEL_LAYOUT} />
      )}

      {frame >= STORE_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: H * 0.06,
            gap: 36,
            background: "rgba(15,10,35,0.55)",
          }}
        >
          <StoreFlow frame={frame - STORE_START} fps={fps} height={900} span={STORE_FRAMES} />
          <DownloadCta progress={beatProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      {/* the persistent header — rendered last so it stacks on top of the dim overlay too */}
      {frame >= HEADER_AT && frame < STORE_START && (
        <GameTitleCard frame={frame} startFrame={HEADER_AT} title="NUMBER MERGE!" section="adventures" y={H * 0.04} width={W} />
      )}

      <BrandBadge portrait />
      <PoweredBy portrait />

      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}

      {INCLUDE_MUSIC &&
        Array.from({ length: Math.ceil((AUDIO_SEC * FPS) / MUSIC_LOOP_FRAMES) }, (_, i) => (
          <Sequence key={`music${i}`} from={i * MUSIC_LOOP_FRAMES} durationInFrames={MUSIC_LOOP_FRAMES}>
            <Audio src={staticFile("music_bed.mp3")} volume={0.12} />
          </Sequence>
        ))}

      <Audio src={staticFile("audio/short_video_game_number_merge/short_video_game_number_merge.mp3")} />
    </AbsoluteFill>
  );
};
