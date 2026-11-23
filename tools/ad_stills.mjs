// Stills of the ad videos at chosen frames, bundled once, then one contact sheet per ad.
// node tools/ad_stills.mjs <out_dir> <id>:<f1,f2,...> [<id>:<frames> ...]
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [outDir, ...specs] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browser = await openBrowser("chrome");
for (const spec of specs) {
  const [id, frames] = spec.split(":");
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
  for (const f of frames.split(",").map(Number)) {
    await renderStill({ serveUrl, composition, frame: f, output: path.join(outDir, `${id}_${String(f).padStart(3, "0")}.png`), puppeteerInstance: browser, scale: 0.4 });
  }
  console.log("done", id);
}
await browser.close({ silent: true });
