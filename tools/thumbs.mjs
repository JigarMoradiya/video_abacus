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
  { n: 3, dir: "e03_adding_two_numbers", frame: Number(process.env.E03_FRAME ?? 20) },
  { n: 4, dir: "e04_bigger_numbers", frame: 128 },
];

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome");
for (const ep of EPISODES) {
  // Straight into the episode's folder, next to its two mp4s — no subfolder. Named off the video
  // so a directory listing sorts the four files of an episode together.
  const dir = path.join("out", ep.dir);
  fs.mkdirSync(dir, { recursive: true });
  for (const [id, name] of [
    [`thumb-e0${ep.n}`, `${ep.dir}_thumb_16x9.png`],
    [`thumb-e0${ep.n}-9x16`, `${ep.dir}_thumb_9x16.png`],
  ]) {
    const composition = await selectComposition({ serveUrl, id, inputProps: {} });
    const output = path.join(dir, name);
    await renderStill({ composition, serveUrl, output, frame: ep.frame, imageFormat: "png", puppeteerInstance: browser, overwrite: true });
    console.log(`${ep.dir}/${name}  ${composition.width}x${composition.height}  ${(fs.statSync(output).size / 1024).toFixed(0)} KB`);
  }
}
await browser.close({ silent: true });
