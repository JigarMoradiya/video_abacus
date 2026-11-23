// Scripted phrase audit for a Bead Buddies reel (same checks as e15_audit.ts, written against the fields every reel shares):
//   rod named -> spotlight / hand / band    number spoken -> something to flash    expressive -> SFX in the phrase    static > 2 s -> a visual
// usage: npx esbuild tools/bb_audit.ts --bundle --platform=node --define:REEL=... (see tools/bb_audit.sh)
import { __audit as A } from "REEL_PATH";
const FPS = 30;
const P = A.PHRASES as any[];
const NUM = /\b(one|two|three|four|five|six|seven|eight|nine|ten|thirteen|fourteen|twenty|thirty|fours|sixs|nines|sevens)\b/i;
const EXPR = /(uh|oh no|stuck|good news|wow|well done|problem|fun|like and subscribe|congrat)/i;
const out: string[] = [];
for (let i = 0; i < P.length; i++) {
  const ph = P[i];
  const sc = A.sceneFor(i) as any;
  const t = ph.text as string;
  const s = Math.round(ph.start * FPS);
  const e = Math.round(ph.end * FPS);
  const dur = (e - s) / FPS;
  const visual = !!(sc.card || sc.hand || sc.band || sc.bandSeq || sc.rodBandSeq || sc.spotlightRod || sc.headline || sc.big || sc.closing || sc.hook || sc.count || sc.beadSteps || sc.sum || sc.friends || sc.formulas || sc.board || sc.seesaw || sc.wheel || sc.beadWorth || sc.highlight || sc.pups || sc.rabbit || sc.gulls || sc.foxes || sc.hedgehogs || sc.toucan || sc.squirrel || sc.elephant || sc.otters || sc.valueChip || sc.formulaList || sc.round || sc.game || sc.stage !== "abacus");
  if (/\b(ones|tens) rod\b/i.test(t) && !(sc.spotlightRod || sc.hand || sc.band || sc.bandSeq || sc.rodBandSeq || sc.highlight || sc.beadSteps || sc.rods))
    out.push(`p${i} rod named, nothing on the rod: "${t}"`);
  if (EXPR.test(t) && !A.SFX_CUES.some((c: any) => c.frame >= s - 2 && c.frame <= e + 6)) out.push(`p${i} expressive, no SFX: "${t}"`);
  if (dur > 2 && !visual) out.push(`p${i} ${dur.toFixed(1)} s with no visual change source: "${t}"`);
  if (NUM.test(t) && !visual && dur > 1.2) out.push(`p${i} number spoken, nothing to flash: "${t}"`);
}
console.log(out.length ? out.join("\n") : "audit clean");
console.log("phrases", P.length, "sfx", A.SFX_CUES.length);
