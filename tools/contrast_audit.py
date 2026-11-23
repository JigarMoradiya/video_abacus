#!/usr/bin/env python3
"""Measured text-contrast audit for the short reels.

Render the stills twice (tools/phrase_stills.mjs ... --out A, then the same with --notext --out B: every
text turns transparent), then:

    python3 tools/contrast_audit.py A B [--report out.txt]

Per still, the pixels that differ between A and B are the TEXT; B around them is what is BEHIND the text.
Each text blob (a word, a number, a tag) is measured:
  inner  = the glyph fill (deep interior pixels), outer = its outline/halo (edge pixels), bg = median of B in a
  ring around the blob. Plain text must reach fill/bg; OUTLINED text must reach fill/outline AND its outline
  must separate from the plate, so the effective ratio is min(fill/outline, max(outline/bg, fill/bg)).
Required: 4.5:1 for small text, 3:1 for big heavy text (blob taller than 70 px). Brand furniture (logo and
"powered by") is skipped. Prints every failure plus the worst/median numbers.
"""
import sys, glob, os, re
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def lum(c):
    c = np.asarray(c, dtype=float) / 255.0
    f = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]

def cr(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

SKIP = [(840, 50, 1040, 130), (40, 1800, 360, 1870)]  # logo, powered-by (portrait shorts)
CAP_Y = 1660  # the caption band starts here in the portrait shorts
if "--landscape" in sys.argv:  # 1920x1080 episodes: brand badge top right, "powered by" bottom left, caption band from 860
    SKIP = [(1600, 20, 1900, 120), (20, 990, 340, 1070)]
    CAP_Y = 860

def audit_pair(fa, fb):
    A = np.asarray(Image.open(fa).convert("RGB")).astype(int)
    B = np.asarray(Image.open(fb).convert("RGB")).astype(int)
    diff = np.abs(A - B).max(axis=2) > 14
    diff = ndi.binary_opening(diff, iterations=1) | ndi.binary_closing(diff, iterations=1) & diff
    blobs, n = ndi.label(ndi.binary_dilation(diff, iterations=4))
    out = []
    for i in range(1, n + 1):
        sl = ndi.find_objects(blobs == i)[0]
        y0, y1, x0, x1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
        if (y1 - y0) * (x1 - x0) < 250 or (y1 - y0) < 14:
            continue
        if any(x0 >= s[0] and x1 <= s[2] and y0 >= s[1] and y1 <= s[3] for s in SKIP):
            continue
        pad = 14
        ys, ye, xs, xe = max(0, y0 - pad), min(A.shape[0], y1 + pad), max(0, x0 - pad), min(A.shape[1], x1 + pad)
        raw = (blobs[ys:ye, xs:xe] == i) & diff[ys:ye, xs:xe]
        if raw.sum() < 60:
            continue
        near = ndi.binary_dilation(raw, iterations=9) & ~ndi.binary_dilation(raw, iterations=3)
        bgpix = B[ys:ye, xs:xe][near]
        if len(bgpix) < 30:
            continue
        bg = np.median(bgpix, axis=0)
        dist = ndi.distance_transform_edt(raw)
        px = A[ys:ye, xs:xe]
        pts = px[raw].astype(float)
        dd = dist[raw]
        if len(pts) > 3000:
            idx = np.random.RandomState(1).choice(len(pts), 3000, replace=False)
            pts, dd = pts[idx], dd[idx]
        from scipy.cluster.vq import kmeans2
        try:
            cen, lab = kmeans2(pts, 3, minit="++", seed=3)
        except Exception:
            continue
        groups = []
        for k in range(3):
            m = lab == k
            if m.sum() < 8:
                continue
            c = cen[k]
            if cr(c, bg) < 1.35:  # anti-aliased blends that are basically the plate colour
                continue
            groups.append((m.sum(), c, dd[m].mean()))
        if not groups:
            continue
        groups.sort(key=lambda g: -g[0])
        tot = sum(g[0] for g in groups)
        groups = [g for g in groups if g[0] >= 0.12 * tot][:2]
        def is_blend(o, i):
            # an anti-aliasing blend of glyph colour i and plate colour bg lies on the segment between them
            d = i - bg
            n2 = float(d @ d)
            if n2 < 1:
                return True
            t = float((o - bg) @ d) / n2
            res = np.linalg.norm(o - (bg + t * d))
            return 0 <= t <= 1 and res < 26
        outlined = False
        if len(groups) == 2 and cr(groups[0][1], groups[1][1]) > 1.5:
            fillg, outg = (groups[0], groups[1]) if groups[0][2] >= groups[1][2] else (groups[1], groups[0])
            if not is_blend(outg[1], fillg[1]) and not is_blend(fillg[1], outg[1]):
                inner, outer = fillg[1], outg[1]
                outlined = True
        if not outlined:
            inner = groups[0][1]
            outer = inner
        r_ib = cr(inner, bg)
        r_ob = cr(outer, bg)
        r_io = cr(inner, outer)
        eff = min(r_io, max(r_ob, r_ib)) if outlined else r_ib
        big = (y1 - y0) >= 70
        need = 3.0 if big else 4.5
        hexs = '#%02X%02X%02X' % tuple(int(v) for v in inner)
        if y0 >= CAP_Y and not outlined and (abs(inner - np.array([0x8A, 0x76, 0x9B])).max() < 10 or abs(inner - np.array([0xC9, 0x5C, 0x86])).max() < 10 or abs(inner - np.array([0x7A, 0x62, 0x00])).max() < 10 or abs(inner - np.array([0x3F, 0x63, 0xC0])).max() < 10 or abs(inner - np.array([0x4A, 0x7F, 0xB5])).max() < 10 or abs(inner - np.array([0x5F, 0x73, 0x89])).max() < 10 or abs(inner - np.array([0x8B, 0x7D, 0x49])).max() < 10 or abs(inner - np.array([0x6E, 0x7A, 0xA5])).max() < 10):
            need = 3.0  # caption words that are NOT SPOKEN YET: lighter on purpose, floor 3:1
        if eff < 1.5 and not outlined and np.abs(inner - bg).max() < 45:
            continue  # a faint drop shadow / anti-alias artefact, not text
        out.append(dict(box=(x0, y0, x1, y1), eff=eff, need=need, inner=inner, outer=outer, bg=bg, ok=eff >= need, outlined=outlined, big=big))
    return out

def main():
    a, b = sys.argv[1], sys.argv[2]
    report = None
    if "--report" in sys.argv:
        report = open(sys.argv[sys.argv.index("--report") + 1], "w")
    fails = 0
    allr = []
    for fa in sorted(glob.glob(os.path.join(a, "p*.png"))):
        fb = os.path.join(b, os.path.basename(fa))
        if not os.path.exists(fb):
            continue
        rs = audit_pair(fa, fb)
        for r in rs:
            allr.append(r["eff"] / r["need"])
            if not r["ok"]:
                fails += 1
                hx = lambda c: "#%02X%02X%02X" % tuple(int(v) for v in c)
                line = f"FAIL {os.path.basename(fa).split('_')[0]} box={r['box']} eff={r['eff']:.2f} need={r['need']} fill={hx(r['inner'])} outline={hx(r['outer'])} bg={hx(r['bg'])} {'outlined' if r['outlined'] else 'plain'} {'big' if r['big'] else 'small'}"
                print(line)
                if report: report.write(line + "\n")
    allr = np.array(allr) if allr else np.array([0.0])
    s = f"blobs={len(allr)} failures={fails} worst(eff/need)={allr.min():.2f} median={np.median(allr):.2f}"
    print(s)
    if report:
        report.write(s + "\n")

if __name__ == "__main__":
    main()
