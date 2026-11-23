// Scripted phrase audit for E15 (docs/SCRIPT_CHECKLIST.md): every phrase scanned for
//   rod named       -> spotlight / hand / band on that rod
//   number spoken   -> a word-synced flash (sum card, card cell, otter lit) or a big number
//   expressive word -> an SFX cue inside the phrase
//   static stretch  -> no visual change for > 2 s (a phrase longer than 2 s with no card, hand, band, spotlight, headline, otter change)
import { __e15Audit as A } from "../src/reels/e15_family_plus";

const FPS = 30;
const P = A.PHRASES as any[];
const NUM = /\b(one|two|three|four|five|six|seven|eight|nine|ten|thirteen|fourteen|twenty|thirty|fours|sixs|nines|sevens)\b/i;
const EXPR = /(uh|oh|stuck|good news|thumb|wow|well done|problem|only|no!|fun|like and subscribe)/i;
const findings: string[] = [];
for (let i = 0; i < P.length; i++) {
  const ph = P[i];
  const sc = A.sceneFor(i) as any;
  const t = ph.text as string;
  const s = Math.round(ph.start * FPS);
  const e = Math.round(ph.end * FPS);
  const dur = (e - s) / FPS;
  if (/\b(ones|tens) rod\b/i.test(t) && !(sc.spotlightRod || sc.hand || sc.band || sc.bandSeq || sc.rodBandSeq || sc.highlight !== null))
    findings.push(`p${i} rod named but no spotlight/hand/band: "${t}"`);
  if (NUM.test(t) && !sc.closing && !(sc.sum || sc.card || sc.big || sc.valueChip || sc.otters) && i > 5)
    findings.push(`p${i} number spoken, nothing to flash: "${t}"`);
  if (EXPR.test(t)) {
    const hit = A.SFX_CUES.some((c: any) => c.frame >= s - 2 && c.frame <= e + 6);
    if (!hit) findings.push(`p${i} expressive, no SFX in phrase: "${t}"`);
  }
  const visual = !!(sc.card || sc.hand || sc.band || sc.bandSeq || sc.rodBandSeq || sc.spotlightRod || sc.headline || sc.big || sc.closing || sc.hook || sc.count || sc.beadSteps || sc.sum);
  if (dur > 2 && !visual) findings.push(`p${i} ${dur.toFixed(1)} s with no card/hand/band/spotlight/headline: "${t}"`);
  // per-phrase: a question must not show its answer
  if (/\?$/.test(t) && sc.big) findings.push(`p${i} question shows a big answer: "${t}"`);
}
console.log(findings.length ? findings.join("\n") : "audit clean");
console.log("phrases", P.length, "sfx cues", A.SFX_CUES.length);
