#!/usr/bin/env python3
"""Shared mechanics of a Bead Buddies remake: copy a reel, rename its exports, swap palette and worlds, add the stage's
audit-friendly props and the HideText fragment. Mascot code is replaced per episode by the caller (see tools/bb_e07.py etc.)."""
import re

STAGE_PROPS = '''    placeLabelHalo={() => true}
    chipInk="#06222C"
    countInk="#06222C"
    labelInk={["#06222C", "#06222C", "#06222C", "#06222C", "#06222C"]}
    captionComing={{ coming: "#5F7385", keyComing: "#A8441F" }}
    renderBehind={(scene, ctx) => {
      // a pale pill behind each place name so "tens" / "ones" read on any background (measured)
      if (scene.stage !== "abacus" || scene.closing) return null;
      const b = ctx.box;
      const sc = b.scale;
      return (
        <svg width={ctx.layout.W} height={ctx.layout.H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          {[1, 0].filter((rod) => scene.rods[rod]?.chipLower && scene.rods[rod]?.placeName).map((rod) => (
            <rect key={rod} x={rodX(b, rod) - 56 * sc} y={b.innerTop + (545 - 30) * sc} width={112 * sc} height={40 * sc} rx={20 * sc} fill="#F4FBFA" opacity={0.94} stroke="#06222C" strokeWidth={2.5 * sc} />
          ))}
        </svg>
      );
    }}
'''

def convert(src, dst, *, card_accent=None, header, comp, comp_new, dur, dur_new, rig, rig_new, worlds, extra_imports='', extra=None, stage_props=True):
    s = open(src).read()
    s = header + '\n' + s
    s = s.replace('export const %s: React.FC = () => (\n  <SceneStage<Scene>' % comp,
                  'export const %s: React.FC = () => (\n  <>\n  <HideTextStyle />\n  <SceneStage<Scene>' % comp_new, 1)
    assert 'HideTextStyle' in s, 'component wrapper not found'
    i = s.rindex('\n  />\n);')
    s = s[:i] + '\n  />\n  </>\n);' + s[i + len('\n  />\n);'):]
    s = s.replace('export const %s = ' % dur, 'export const %s = ' % dur_new, 1)
    s = re.sub(r'\b%s\b' % re.escape(dur), dur_new, s)
    s = re.sub(r'\b%s\b' % re.escape(rig), rig_new, s)
    out = []
    for line in s.split('\n'):
        if 'world:' in line:
            for old, new in worlds.items():
                line = line.replace('"%s"' % old, '"%s"' % new)
        out.append(line)
    s = '\n'.join(out)
    has_rodx = re.search(r'import \{[^}]*\brodX\b[^}]*\} from', s) is not None
    imp = 'import { HideTextStyle } from "../lib/hideText";\n' + ('' if has_rodx else 'import { rodX } from "../stage/geometry";\n') + extra_imports
    s = s.replace('import { KID_FONT } from "../lib/fonts";', 'import { KID_FONT } from "../lib/fonts";\n' + imp, 1)
    if stage_props:
        m = re.search(r'    palette=\{%s\}\n' % re.escape(rig_new), s)
        assert m, 'palette prop not found'
        # drop an existing placeLabelHalo / renderBehind if the reel has its own (rare)
        s = s[:m.end()] + STAGE_PROPS + s[m.end():]
        s = s.replace('    placeLabelHalo={(_scene, L) => L.portrait}\n', '')
    # every ColumnSum: brighter "?" placeholder; every BigFriendCards: a higher floor for dimmed pairs (contrast audit)
    if 'placeholderOpacity' not in s:
        s = re.sub(r'(<ColumnSum\b[^>]*?\bbg=\{[^}]*\})', r'\1 placeholderOpacity={0.9}', s, flags=re.S)
    s = re.sub(r'(<BigFriendCards\b)', r'\1 dimFloor={0.72}', s)
    s += '\n/** For tools/bb_audit.ts */\nexport const __audit = { sceneFor, PHRASES, SFX_CUES };\n'
    if card_accent:
        s = re.sub(r'const CARD_ACCENT = "#[0-9A-Fa-f]{6}";', 'const CARD_ACCENT = "%s"; // darkened for the contrast audit' % card_accent, s)
    if extra:
        s = extra(s)
    if 'Twinkles' not in s:
        s = re.sub(r'(import \{ CastGroup)', r'import { Twinkles } from "../components/cast";\n\1', s, count=1)
        m = re.search(r"\n        \{/\* THE [A-Z' ]*EDGE FRIENDS", s)
        if m:
            s = s[:m.start()] + '\n        {scene.closeBeat === "next" && <Twinkles frame={ctx.frame} W={ctx.layout.W} H={ctx.layout.H} />}' + s[m.start():]
    open(dst, 'w').write(s)
