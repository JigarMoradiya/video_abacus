#!/usr/bin/env python3
"""Cheap regression check for shared-file edits: render a few stills per reel with the CURRENT code and compare them with the
same frames cut from the last known-good delivered video. A mean absolute difference above ~3 (video compression is ~1) means
that reel's pixels changed.

    python3 tools/regress_check.py [OUTDIR]
"""
import subprocess, sys, glob, re, os, json
import numpy as np
from PIL import Image
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/regress"
INTRO = 5.034  # seconds the Vedaavi intro adds to a merged episode
CASES = [  # id, phrases json, video, intro offset, phrase indices
    ("big-friend-intro", "src/data/e11.phrases.json", "out/e11_big_friend_intro/e11_16x9.mp4", INTRO, "6,20,45,70"),
    ("all-five-big-friends", "src/data/e12.phrases.json", "out/e12_all_five_big_friends/e12_16x9.mp4", INTRO, "6,20,45,70"),
    ("big-friend-taking-away", "src/data/e13.phrases.json", "out/e13_big_friend_taking_away/e13_16x9.mp4", INTRO, "6,20,45,70"),
    ("big-friend-recap", "src/data/e14.phrases.json", "out/e14_big_friend_recap/e14_16x9.mp4", INTRO, "6,20,45,70"),
] + [(f"short-math-heroes-bf{i}", f"src/data/math_heroes_bf{i}.phrases.json", glob.glob(f"out/shorts/00{7+i:02d}_big_friend_{i}.mp4")[0], 0.0, "3,10,20,30") for i in range(1, 7)]
bad = []
for cid, ph, vid, off, only in CASES:
    d = f"{OUT}/{cid}"
    subprocess.run(["rm", "-rf", d])
    r = subprocess.run(["node", "tools/phrase_stills.mjs", "--id", cid, "--phrases", ph, "--out", d, "--png", "--only", only], capture_output=True, text=True)
    files = sorted(glob.glob(d + "/p*.png"))
    if not files:
        print(cid, "NO STILLS", r.stderr[-300:]); bad.append(cid); continue
    diffs = []
    for f in files:
        n = int(re.search(r"_f(\d+)", f).group(1))
        ref = f"{d}/ref_{n}.png"
        subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{n/30 + off:.3f}", "-i", vid, "-frames:v", "1", "-y", ref], check=True)
        a = np.asarray(Image.open(f).convert("RGB")).astype(int)
        b = np.asarray(Image.open(ref).convert("RGB").resize((a.shape[1], a.shape[0]))).astype(int)
        diffs.append(float(np.abs(a - b).mean()))
    flag = "CHANGED" if max(diffs) > 3.0 else "ok"
    if flag != "ok": bad.append(cid)
    print(f"{cid:28s} {flag:8s} mean-abs-diff per frame: {[round(x,2) for x in diffs]}")
print("changed:", bad or "none")
