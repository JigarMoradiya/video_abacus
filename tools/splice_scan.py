#!/usr/bin/env python3
"""Peak scan at every EDIT of a spliced narration. Reads FILE.splices.json (written by
tools/e15_audio_prep.py: the output-time start/end of every inserted silence) and, for each, reports the
largest sample-to-sample step and the peak in a 4 ms window at both edges - a clean fade-edged splice is
near zero. Also lists every natural silence boundary for context (--all).
    python3 tools/splice_scan.py OUT.wav"""
import json, subprocess, sys
from pathlib import Path
import numpy as np
SR = 44100
path = sys.argv[1]
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True).stdout, dtype=np.int16).astype(float) / 32768
sp = json.loads(Path(path).with_suffix(".splices.json").read_text())
bad = 0
for s, e in sp:
    for name, c in (("start", s), ("end", e)):
        a, b = max(0, int((c - 0.002) * SR)), min(len(x), int((c + 0.002) * SR))
        seg = x[a:b]
        step = float(np.max(np.abs(np.diff(seg)))) if len(seg) > 1 else 0.0
        pk = float(np.max(np.abs(seg)))
        flag = step > 0.02 or pk > 0.02
        bad += flag
        print(f"  {'CLICK?' if flag else 'ok    '} {name:5s} {c:8.3f}s  step {step:.4f}  peak {pk:.4f}")
print(f"{len(sp)} inserted silences, {bad} suspicious edges")
