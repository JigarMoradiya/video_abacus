#!/usr/bin/env python3
"""python3 tools/bb_ba_phr.py OLD.mp4 PHRASES.json STILLS_DIR OUT.png p0 p13 ...  — left: the old video at that phrase, right: the new still (full-size 960x540 each)."""
import sys, json, glob, os, subprocess, tempfile
from PIL import Image
old, ph, d, out, *ps = sys.argv[1:]
P = json.load(open(ph))
W, H = 960, 540
sh = Image.new("RGB", (W * 2 + 6, (H + 6) * len(ps)), (30, 30, 30))
for r, p in enumerate(ps):
    i = int(p[1:])
    t = P[i]["start"] + min(0.8, (P[i]["end"] - P[i]["start"]) * 0.6) + 5.034
    tmp = tempfile.mktemp(suffix=".png")
    subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", old, "-frames:v", "1", "-vf", f"scale={W}:{H}", "-y", tmp], check=True)
    sh.paste(Image.open(tmp).convert("RGB"), (0, r * (H + 6))); os.remove(tmp)
    f = [x for x in glob.glob(f"{d}/{p}_*.png") if os.path.basename(x).split("_")[0] == p][0]
    sh.paste(Image.open(f).convert("RGB").resize((W, H)), (W + 6, r * (H + 6)))
sh.save(out)
