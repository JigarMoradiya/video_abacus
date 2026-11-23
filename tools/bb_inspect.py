#!/usr/bin/env python3
"""python3 tools/bb_inspect.py NEW.mp4 OUT.png [OLD.mp4] — 6 frames (full 960x540, or 4:5 at 600x750) from the delivered video, old on the left when given."""
import subprocess, sys
from PIL import Image
new, out = sys.argv[1:3]; old = sys.argv[3] if len(sys.argv) > 3 else None
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f]).decode())
d = dur(new)
w, h = [int(x) for x in subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0","-show_entries","stream=width,height","-of","csv=p=0:s=x",new]).decode().strip().strip("x").split("x")[:2]]
W, H = (960, 540) if w > h else (600, 750)
cols = 2 if (old or w > h) else 3
vs = [old, new] if old else [new]
fr = [0.05, 0.2, 0.38, 0.55, 0.75, 0.93]
rows = len(fr) if old else (len(fr) + cols - 1) // cols
sh = Image.new("RGB", (len(vs) * (W + 6) if old else cols * (W + 6), rows * (H + 6)), (30, 30, 30))
for i, f in enumerate(fr):
    for c, v in enumerate(vs):
        t = 5.1 + (dur(v) - 5.1) * f
        subprocess.run(["ffmpeg","-v","error","-ss",f"{t:.2f}","-i",v,"-frames:v","1","-vf",f"scale={W}:{H}","-y","/tmp/q.png"],check=True)
        im = Image.open("/tmp/q.png").convert("RGB")
        if old: sh.paste(im, (c * (W + 6), i * (H + 6)))
        else: sh.paste(im, ((i % cols) * (W + 6), (i // cols) * (H + 6)))
sh.save(out)
