#!/usr/bin/env python3
"""Before/after sheet: python3 tools/bb_ba.py OLD.mp4 NEW.mp4 OUT.png  — 8 frames at the same fractions of the speech (16:9)."""
import subprocess, sys, tempfile, os
from PIL import Image
old, new, out = sys.argv[1:4]
fr = [0.03, 0.12, 0.25, 0.38, 0.52, 0.66, 0.82, 0.96]
def dur(f):
    return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]).decode())
W, H = 640, 360
sh = Image.new("RGB", (W*2+12, (H+6)*8), (30,30,30))
d0, d1 = dur(old), dur(new)
for r, f in enumerate(fr):
    for c, (v, d) in enumerate([(old, d0), (new, d1)]):
        t = 5.0 + (d - 5.0) * f
        tmp = tempfile.mktemp(suffix=".png")
        subprocess.run(["ffmpeg","-v","error","-ss",f"{t:.2f}","-i",v,"-frames:v","1","-vf",f"scale={W}:{H}","-y",tmp],check=True)
        sh.paste(Image.open(tmp).convert("RGB"), (c*(W+12), r*(H+6))); os.remove(tmp)
sh.save(out)
