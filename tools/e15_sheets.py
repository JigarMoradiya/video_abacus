#!/usr/bin/env python3
"""Contact sheets for E15 stills: python3 tools/e15_sheets.py STILLS_DIR OUT_PREFIX  (28 per sheet, numeric order)."""
import sys, re, glob, subprocess, os, tempfile
d, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(d, "p*.png")), key=lambda f: int(re.search(r"p(\d+)_", f).group(1)))
for i in range(0, len(files), 28):
    chunk = files[i:i+28]
    lst = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False)
    for f in chunk: lst.write(f"file '{f}'\nduration 1\n")
    lst.close()
    subprocess.run(["ffmpeg","-loglevel","error","-y","-f","concat","-safe","0","-i",lst.name,"-vf","fps=1,scale=480:-1,tile=4x7:padding=4","-frames:v","1",f"{out}{i//28}.png"],check=True)
print("sheets", (len(files)+27)//28)
