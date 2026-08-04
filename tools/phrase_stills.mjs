// One still per phrase, for reading the screen against the words that are being said.
//
// The CLI's `remotion still` re-bundles and re-launches Chrome on every invocation, so
// 79 stills that way is ~15 minutes. This bundles once, opens one browser, and reuses
// both — the same 79 stills take well under a minute.
//
// Two jobs:
//   1. Verification. Render a still at the middle of every phrase and read the card
//      against the caption in the SAME frame. DESIGN_SYSTEM.md §8b: E01 shipped a
//      tooltip a full line out of step because contact sheets were checked for layout
//      and never for whether the label agreed with the sentence.
//   2. A refactor oracle. Every scene value is a pure function of the frame, so a
//      refactor that changes nothing must reproduce these stills byte-for-byte.
//      `--png` matters here: jpeg is fine to look at, but its encoder is not
//      bit-stable enough to diff.
//
// Usage:
//   node tools/phrase_stills.mjs --id meet-the-abacus --phrases src/data/e01.phrases.json \
//        --out out/e01_base --png [--offset 20] [--only 3,4,5]

import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

const id = flag("id");
const phrasesPath = flag("phrases");
const outDir = flag("out");
// Phrase starts are word onsets, so frame 0 of a phrase is mid-transition from the one
// before. 20 frames in (two thirds of a second) every spring has settled, which is what
// makes the image worth reading.
const offset = parseInt(flag("offset", "20"), 10);
const png = has("png");
const only = flag("only");

if (!id || !phrasesPath || !outDir) {
  console.error("need --id, --phrases and --out");
  process.exit(1);
}

const phrases = JSON.parse(fs.readFileSync(phrasesPath, "utf8"));
const wanted = only ? new Set(only.split(",").map((s) => parseInt(s.trim(), 10))) : null;

fs.mkdirSync(outDir, { recursive: true });

console.log(`bundling…`);
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  onProgress: () => {},
});

const composition = await selectComposition({ serveUrl, id });
const { fps, durationInFrames } = composition;
console.log(`${id}: ${durationInFrames} frames @ ${fps}fps · ${phrases.length} phrases`);

const browser = await openBrowser("chrome");
const ext = png ? "png" : "jpeg";
let written = 0;
let clamped = 0;

for (const p of phrases) {
  if (wanted && !wanted.has(p.index)) continue;

  // Clamp rather than skip: a phrase whose start+offset runs past the end is still a
  // frame worth seeing, and a missing file would look like a crashed render.
  let frame = Math.round(p.start * fps) + offset;
  if (frame > durationInFrames - 1) {
    frame = durationInFrames - 1;
    clamped++;
  }

  const slug = String(p.index).padStart(2, "0");
  const output = path.join(outDir, `p${slug}_f${frame}.${ext}`);

  await renderStill({
    composition,
    serveUrl,
    output,
    frame,
    imageFormat: ext,
    puppeteerInstance: browser,
    overwrite: true,
  });

  written++;
  const words = p.text.length > 62 ? p.text.slice(0, 59) + "…" : p.text;
  console.log(`  p${slug} f${String(frame).padStart(4)}  ${words}`);
}

await browser.close({ silent: true });
console.log(`\n${written} stills -> ${outDir}${clamped ? ` (${clamped} clamped to the last frame)` : ""}`);
