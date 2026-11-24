// Render every thumbnail as a PNG, into the episode's own output folder.
//
// PNG, not JPEG: YouTube re-encodes on upload, so an already-lossy source compounds the artefacts.
//
// Each thumbnail declares the FRAME it is captured at. The worlds drift — clouds, fish, a crane —
// so frame 0 is not a neutral choice, it is just the one where everything is at its starting mark.
// Picking the frame is part of the composition: it is how the fish end up in open water instead of
// behind the abacus.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const EPISODES = [
  { n: 1, dir: "e01_meet_the_abacus", frame: 128 },
  { n: 2, dir: "e02_numbers_0_to_9", frame: 128 },
  // E03's FOLDER and its FILE names differ: the folder is named for the lesson (addition on
  // rod 1) and the files for the episode title. Stated rather than inferred, so a render does
  // not quietly recreate the folder it was moved out of.
  { n: 3, dir: "e03_addition_rod1", name: "e03_adding_two_numbers", frame: Number(process.env.E03_FRAME ?? 20) },
  { n: 4, dir: "e04_bigger_numbers", frame: 128 },
  { n: 5, dir: "e05_taking_away", frame: 128 },
  { n: 6, dir: "e06_two_rods", frame: 128 },
  { n: 7, dir: "e07_small_friend_intro", frame: 128 },
  { n: 8, dir: "e08_all_small_friends", frame: 128 },
  { n: 9, dir: "e09_small_friend_subtract", frame: 128 },
  { n: 10, dir: "e10_small_friend_game", frame: 128 },
  // E11's files predate this list and are named thumb_e11_16x9.png / thumb_e11_9x16.png: stated, not inferred
  { n: 11, dir: "e11_big_friend_intro", frame: 128, files: ["thumb_e11_16x9.png", "thumb_e11_9x16.png"] },
  { n: 12, dir: "e12_all_five_big_friends", frame: 128, files: ["thumb_e12_16x9.png", "thumb_e12_9x16.png"] },
  { n: 13, dir: "e13_big_friend_taking_away", frame: 128, files: ["e13_thumb_16x9.png", "e13_thumb_9x16.png"] },
  { n: 14, dir: "e14_big_friend_recap", frame: 128 },
  { n: 15, dir: "e15_family_plus", frame: 128, files: ["e15_thumb_16x9.png", "e15_thumb_9x16.png"] },
];

// ONLY=7 renders just that episode. Re-rendering all fourteen stills to add one is not free, and
// every re-render is a chance to overwrite an approved thumbnail with a drifted one.
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",").map(Number)) : null;

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome");
for (const ep of EPISODES) {
  if (ONLY && !ONLY.has(ep.n)) continue;
  // Straight into the episode's folder, next to its two mp4s — no subfolder. Named off the video
  // so a directory listing sorts the four files of an episode together.
  const dir = path.join("out", ep.dir);
  fs.mkdirSync(dir, { recursive: true });
  // `e0${n}` was hard-coded for a one-digit episode number and silently produced "e010" the
  // first time a tenth episode showed up — pad to two digits instead so this keeps working
  // past e09 without needing a second special case for e100.
  const epId = `e${String(ep.n).padStart(2, "0")}`;
  for (const [id, name] of [
    [`thumb-${epId}`, ep.files?.[0] ?? `${ep.name ?? ep.dir}_thumb_16x9.png`],
    [`thumb-${epId}-9x16`, ep.files?.[1] ?? `${ep.name ?? ep.dir}_thumb_9x16.png`],
  ]) {
    const composition = await selectComposition({ serveUrl, id, inputProps: {} });
    const output = path.join(dir, name);
    await renderStill({ composition, serveUrl, output, frame: ep.frame, imageFormat: "png", puppeteerInstance: browser, overwrite: true });
    console.log(`${ep.dir}/${name}  ${composition.width}x${composition.height}  ${(fs.statSync(output).size / 1024).toFixed(0)} KB`);
  }
}
await browser.close({ silent: true });
