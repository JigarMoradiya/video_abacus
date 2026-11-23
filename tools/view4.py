#!/usr/bin/env python3
"""python3 tools/view4.py STILLS_DIR OUT.png p18 p21 p25 p27 — 2x2 grid of full-frame stills at 960x540 (readable)."""
import sys, glob, os
from PIL import Image
d, out, *ps = sys.argv[1:]
sh = Image.new("RGB", (1926, 1086), (30,30,30))
for i, p in enumerate(ps[:4]):
    f = [x for x in glob.glob(f"{d}/{p}_*.png") if os.path.basename(x).split("_")[0] == p][0]
    sh.paste(Image.open(f).convert("RGB").resize((960, 540)), ((i % 2) * 966, (i // 2) * 546))
sh.save(out)
