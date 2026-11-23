// MATH GAME ZONE — TRAILER. The last piece of the Math Game Zone series (per the standing
// plan — built LAST, once every one of the 18 game sims actually existed to sample from). No
// narration track: this is a music/SFX-driven sizzle reel, not a taught lesson, so there is no
// phrases.json and no Caption component here — every beat is a fixed frame constant instead of
// a word timestamp.
//
// Structure: a hook title card, then all 5 app sections in their real home-screen order
// (Speedy → Equation Fun → Adventures → Builders → Puzzles), each announced by a label card
// and then a rapid-fire clip from every one of its games (an actual 1.8s clip lifted straight
// out of that game's own finished reel — see `public/videos/trailer/<game>.mp4`, extracted
// from `out/short_game_<game>.mp4` at each game's own mid-sim action beat). Ends on a "SO MANY
// MATH GAMES!" benefit card and the same StoreFlow/DownloadCta outro every other reel uses.
//
// Deliberately NO specific game count anywhere on screen (not "18 games", not an "n/18"
// counter) — the roster grows over time (more games get added, and 2 already-existing games
// — Equation Match, Number Snake — don't have reels yet as of this writing), so a hardcoded
// number would go stale. "So many" / generic framing stays true no matter how many exist.
//
// Also deliberately NO per-clip title-chip overlay: each source reel already carries its own
// persistent game-title card baked into the footage, so an extra name chip on top of it just
// duplicated the same name and read as overlapping clutter — the clip's own title is enough.
//
// Section → game mapping and accent colors come straight from `GameZoneWorld.SECTION_META` —
// the same source every game reel's own `GameTitleCard` uses, so the section labels here match
// the app's real grouping exactly, not a guess.

import React from "react";
import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { GameZoneWorld, SECTION_META, type GameSection } from "../components/gamezone/GameZoneWorld";
import { BenefitCard } from "../components/gamezone/BenefitCard";
import { StoreFlow, DownloadCta } from "../components/AppShowcase";
import { BrandBadge, PoweredBy } from "../components/Brand";
import { KID_FONT } from "../lib/fonts";

export const FPS = 30;

const HOOK_FRAMES = 90;
const LABEL_FRAMES = 24;
const CLIP_FRAMES = 54; // matches the extracted clips exactly (1.8s @ 30fps)
const BENEFIT_FRAMES = 130;
const CTA_FRAMES = 240;

interface GameEntry {
  file: string;
  title: string;
  /** this game's own reel doesn't keep its title card up long enough to still be showing at
   *  the mid-sim action moment this clip is grabbed from (an early-build reel, predating the
   *  "persistent header" convention every later reel uses) — so THIS clip needs its own small
   *  name label, unlike every other clip which already shows its name in the footage itself. */
  needsLabel?: boolean;
}

interface SectionEntry {
  key: GameSection;
  games: GameEntry[];
}

const SECTIONS: SectionEntry[] = [
  {
    key: "speedy",
    games: [
      { file: "balloon_pop", title: "🎈 Balloon Pop", needsLabel: true },
      { file: "speed_compare", title: "⚖️ Speed Compare", needsLabel: true },
      { file: "true_or_false", title: "✅ True or False", needsLabel: true },
      { file: "math_bingo", title: "🎯 Math Bingo", needsLabel: true },
    ],
  },
  {
    key: "equation",
    games: [
      { file: "cross_math", title: "➕ Cross Math", needsLabel: true },
      { file: "missing_sign", title: "🔣 Missing Sign" },
      { file: "target_number", title: "🎯 Target Number" },
    ],
  },
  {
    key: "adventures",
    games: [
      { file: "magic_square", title: "🔮 Magic Square" },
      { file: "math_pyramid", title: "🔺 Math Pyramid" },
      { file: "number_merge", title: "🔢 Number Merge" },
      { file: "number_path", title: "🐸 Number Path" },
    ],
  },
  {
    key: "builders",
    games: [
      { file: "clock_master", title: "🕐 Clock Master" },
      { file: "number_detective", title: "🔍 Number Detective" },
      { file: "number_sequence", title: "🧩 Number Sequence" },
      { file: "place_value", title: "🐿️ Place Value" },
    ],
  },
  {
    key: "puzzles",
    games: [
      { file: "calcudoku", title: "🐙 Calcudoku" },
      { file: "kakuro", title: "🐜 Kakuro" },
      { file: "sudoku", title: "🔢 Sudoku" },
    ],
  },
];

type Beat =
  | { kind: "hook"; from: number }
  | { kind: "label"; from: number; section: GameSection }
  | { kind: "clip"; from: number; section: GameSection; game: GameEntry }
  | { kind: "benefit"; from: number }
  | { kind: "cta"; from: number };

const BEATS: Beat[] = [];
{
  let cursor = 0;
  BEATS.push({ kind: "hook", from: cursor });
  cursor += HOOK_FRAMES;
  for (const section of SECTIONS) {
    BEATS.push({ kind: "label", from: cursor, section: section.key });
    cursor += LABEL_FRAMES;
    for (const game of section.games) {
      BEATS.push({ kind: "clip", from: cursor, section: section.key, game });
      cursor += CLIP_FRAMES;
    }
  }
  BEATS.push({ kind: "benefit", from: cursor });
  cursor += BENEFIT_FRAMES;
  BEATS.push({ kind: "cta", from: cursor });
  cursor += CTA_FRAMES;
}

const CTA_START = BEATS.find((b) => b.kind === "cta")!.from;
export const ZONE_TRAILER_DURATION = CTA_START + CTA_FRAMES;

const W = 1080;
const H = 1920;

// the hook's photo-wall — 6 real, colorful moments (stills pulled from the same clips used
// later in the trailer, see public/images/trailer_hook/), scattered around the two screen
// edges so the title stays legible in the clear middle column.
const THUMB_W = 230;
const THUMB_H = 409; // matches the 9:16 source aspect
const HOOK_THUMBS = [
  { file: "math_bingo", x: -30, y: 120, rot: -7 },
  { file: "magic_square", x: W - THUMB_W + 30, y: 90, rot: 8 },
  { file: "number_path", x: -50, y: 720, rot: -5 },
  { file: "kakuro", x: W - THUMB_W + 50, y: 700, rot: 6 },
  { file: "place_value", x: -20, y: 1340, rot: 9 },
  { file: "number_sequence", x: W - THUMB_W + 20, y: 1330, rot: -9 },
];

// toggled by hand between the two delivered renders — the "with music" and "without music"
// versions the user asked for are otherwise identical (same SFX stings either way, only the
// continuous ambient bed differs).
const INCLUDE_MUSIC = true;

type SfxCue = { frame: number; file: string; vol?: number };
const SFX_CUES: SfxCue[] = [
  { frame: 0, file: "gz_hook.mp3", vol: 0.6 },
  ...BEATS.filter((b) => b.kind === "label").map((b) => ({ frame: b.from, file: "gz_tap.mp3", vol: 0.4 })),
  ...BEATS.filter((b) => b.kind === "clip").map((b) => ({ frame: b.from, file: "gz_tile_place.mp3", vol: 0.3 })),
  { frame: BEATS.find((b) => b.kind === "benefit")!.from, file: "gz_win.mp3", vol: 0.6 },
  { frame: CTA_START + 4, file: "cta_pop.mp3", vol: 0.5 },
];

// the same ambient pad every other reel ducks under its narration — there's no narration
// here, so it's the trailer's only continuous bed and needs real presence (0.4, not the usual
// ~8% "stay out of the way of the voice" level), looped end to end.
const MUSIC_LOOP_FRAMES = 390; // 13s @ 30fps
const MUSIC_LOOPS = Math.ceil((CTA_START + CTA_FRAMES) / MUSIC_LOOP_FRAMES);

export const ZoneTrailer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ctaProgress = interpolate(frame, [CTA_START, CTA_START + CTA_FRAMES], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#161425" }}>
      {/* ---------------------------------------------------------------- HOOK */}
      {frame < HOOK_FRAMES + 10 && (
        <AbsoluteFill>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 35%, #3A2E6B 0%, #1B1533 55%, #100D1F 100%)",
              opacity: interpolate(frame, [HOOK_FRAMES - 10, HOOK_FRAMES], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          />

          {/* a scattered photo-wall of real game moments framing the title — so the opening
              shows actual gameplay right away instead of plain text on a gradient */}
          {HOOK_THUMBS.map((t, i) => {
            const popAt = 2 + i * 3;
            const pop = interpolate(frame, [popAt, popAt + 8, popAt + 14], [0.3, 1.1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const fade = interpolate(frame, [popAt, popAt + 6, HOOK_FRAMES - 10], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div
                key={t.file}
                style={{
                  position: "absolute",
                  left: t.x,
                  top: t.y,
                  width: THUMB_W,
                  height: THUMB_H,
                  borderRadius: 22,
                  overflow: "hidden",
                  boxShadow: "0 14px 0 rgba(0,0,0,0.3), 0 0 0 5px rgba(255,255,255,0.9)",
                  opacity: fade,
                  transform: `rotate(${t.rot}deg) scale(${pop})`,
                }}
              >
                <Img src={staticFile(`images/trailer_hook/${t.file}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              left: 0,
              top: H * 0.34,
              width: W,
              textAlign: "center",
              opacity: interpolate(frame, [0, 8, HOOK_FRAMES - 10], [0, 1, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `scale(${interpolate(frame, [0, 10, 18], [0.3, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
            }}
          >
            <div
              style={{
                display: "inline-block",
                fontFamily: KID_FONT,
                fontWeight: 700,
                fontSize: 78,
                color: "#FFFFFF",
                textShadow: "0 0 30px rgba(142,79,208,0.7), 0 8px 0 rgba(0,0,0,0.35)",
                lineHeight: 1.02,
              }}
            >
              MATH GAME
              <br />
              ZONE
            </div>
            <div
              style={{
                marginTop: 26,
                opacity: interpolate(frame, [16, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 34,
                  color: "#1B1440",
                  background: "#FFD54F",
                  borderRadius: 999,
                  padding: "12px 34px",
                  boxShadow: "0 6px 0 rgba(0,0,0,0.25)",
                }}
              >
                So many games. All free to try!
              </span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* ---------------------------------------------------------------- SECTION LABEL */}
      {BEATS.filter((b) => b.kind === "label").map((b, i) => {
        const from = b.from;
        if (frame < from - 4 || frame >= from + LABEL_FRAMES + 6) return null;
        const section = (b as Extract<Beat, { kind: "label" }>).section;
        const meta = SECTION_META[section];
        const opacity = interpolate(frame, [from - 4, from + 2, from + LABEL_FRAMES - 4, from + LABEL_FRAMES + 6], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const pop = interpolate(frame, [from, from + 8, from + 14], [0.4, 1.18, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            <GameZoneWorld section={section} width={W} height={H} frame={frame} fps={fps} />
            <div style={{ position: "absolute", left: 0, top: H / 2 - 60, width: W, textAlign: "center", transform: `scale(${pop})` }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 52,
                  color: "#FFFFFF",
                  background: meta.accent,
                  borderRadius: 999,
                  padding: "20px 50px",
                  boxShadow: "0 8px 0 rgba(0,0,0,0.25)",
                }}
              >
                {meta.label}
              </span>
            </div>
          </AbsoluteFill>
        );
      })}

      {/* ---------------------------------------------------------------- CLIPS */}
      {BEATS.filter((b) => b.kind === "clip").map((b, i) => {
        const beat = b as Extract<Beat, { kind: "clip" }>;
        return (
          <Sequence key={i} from={beat.from} durationInFrames={CLIP_FRAMES}>
            <OffthreadVideo src={staticFile(`videos/trailer/${beat.game.file}.mp4`)} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />
          </Sequence>
        );
      })}

      {/* No overlay chrome during MOST clips on purpose — each source reel already carries its
          own persistent title card baked into the footage (that's what "top-left game name
          card and center title getting overlay" was: a SECOND name chip stacked on top of the
          clip's own already-visible title). The clip speaks for itself.
          The `needsLabel` games are the exception: their own reel's title had already faded
          out by the exciting mid-sim moment this clip is grabbed from, so a small clean label
          is the only way to show the name WITHOUT trading away that action for an early, more
          static frame where the title happens to still be up. */}
      {BEATS.filter((b) => b.kind === "clip" && b.game.needsLabel).map((b, i) => {
        const beat = b as Extract<Beat, { kind: "clip" }>;
        return (
          <Sequence key={`label${i}`} from={beat.from} durationInFrames={CLIP_FRAMES}>
            <div style={{ position: "absolute", left: 24, top: 92 }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 24,
                  color: "#1B1440",
                  background: "rgba(255,255,255,0.94)",
                  border: `3px solid ${SECTION_META[beat.section].accent}`,
                  borderRadius: 999,
                  padding: "7px 20px",
                  boxShadow: "0 4px 0 rgba(0,0,0,0.16)",
                }}
              >
                {beat.game.title}
              </span>
            </div>
          </Sequence>
        );
      })}

      {/* ---------------------------------------------------------------- BENEFIT */}
      {(() => {
        const benefitFrom = BEATS.find((b) => b.kind === "benefit")!.from;
        if (frame < benefitFrom - 4 || frame >= benefitFrom + BENEFIT_FRAMES + 6) return null;
        const dimIn = interpolate(frame, [benefitFrom - 4, benefitFrom + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const headlineIn = interpolate(frame, [benefitFrom, benefitFrom + 8, benefitFrom + 14], [0.4, 1.15, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <AbsoluteFill>
            <GameZoneWorld section="puzzles" width={W} height={H} frame={frame} fps={fps} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(15,10,30,0.6)", opacity: dimIn }} />
            <div style={{ position: "absolute", left: 0, top: H * 0.14, width: W, textAlign: "center", transform: `scale(${headlineIn})` }}>
              <span
                style={{
                  display: "inline-block",
                  fontFamily: KID_FONT,
                  fontWeight: 700,
                  fontSize: 54,
                  color: "#FFFFFF",
                  textShadow: "0 0 24px rgba(142,79,208,0.6), 0 6px 0 rgba(0,0,0,0.3)",
                }}
              >
                SO MANY MATH GAMES!
              </span>
            </div>
            <BenefitCard
              frame={frame}
              fps={fps}
              startFrame={benefitFrom + 10}
              benefits={[
                { icon: "🧮", text: "Arithmetic & logic, every level", atFrame: benefitFrom + 20 },
                { icon: "⚡", text: "Speed, focus, and quick thinking", atFrame: benefitFrom + 46 },
                { icon: "🧩", text: "Real problem-solving skills", atFrame: benefitFrom + 72 },
              ]}
              accent="#8E4FD0"
              x={W / 2 - 340}
              y={H * 0.38}
              width={680}
            />
          </AbsoluteFill>
        );
      })()}

      {/* ---------------------------------------------------------------- CTA */}
      {frame >= CTA_START && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: H * 0.1,
            gap: 36,
            background: "#161425",
          }}
        >
          <span style={{ fontFamily: KID_FONT, fontWeight: 700, fontSize: 40, color: "#FFFFFF", textAlign: "center" }}>Math Game Zone</span>
          <StoreFlow frame={frame - CTA_START} fps={fps} height={860} span={CTA_FRAMES - 40} />
          <DownloadCta progress={ctaProgress} nameColor="#FFFFFF" badgeMarginTop={26} />
        </div>
      )}

      <BrandBadge portrait />
      <PoweredBy portrait />

      {INCLUDE_MUSIC &&
        Array.from({ length: MUSIC_LOOPS }, (_, i) => (
          <Sequence key={`music${i}`} from={i * MUSIC_LOOP_FRAMES} durationInFrames={MUSIC_LOOP_FRAMES}>
            <Audio src={staticFile("music_bed.mp3")} volume={0.4} />
          </Sequence>
        ))}

      {SFX_CUES.map((c, i) => (
        <Sequence key={i} from={Math.max(0, c.frame)} durationInFrames={40}>
          <Audio src={staticFile(`audio/sfx/${c.file}`)} volume={c.vol ?? 1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
