"""Snap every phrase-embedded word (the ones the reel's wordFrameIn reads) to the real speech in the
recording, using ffmpeg's silence windows. Run AFTER align_by_matching.py, BEFORE building a reel.

    python3 tools/snap_words.py public/audio/e0NN_x/ENN.mp3 public/audio/e0NN_x/ENN.phrases.json \
        [--expressive docs/ENN_lines_expressive.txt]

Rewrites the phrases.json in place (and copies it to src/data/eNN.phrases.json if --copy is given).

WHY (E12, 2026-09-23): the aligner pins the first word after a scripted pause to the START of the
pause — the previous word's end — so captions, number flashes and SFX all fired up to 2.4 s early
and then froze through the silence. Four conservative rules, per word, grouping never changes:

  A  start in / at the lip of a real pause (>= 0.25 s)  -> snap forward to where speech resumes
  B  end that runs >0.30 s into a pause starting inside the word -> clip to the pause start
  C  a pause lying wholly INSIDE a word, starting < 0.35 s after its start -> the head is the
     previous word's tail; snap the start past the pause
  D  a word that is only a sliver (< 0.25 s) right before a pause, contiguous with the previous
     word, with unclaimed speech after the pause -> the word is the speech after the pause

NEVER clip a multi-word phrase's end against "any silence inside it" — that collapsed 98/128
E12 phrases to < 0.3 s once. Every rule here looks at ONE word.

With --expressive, every line following a [pause N] marker is checked: its phrase must start
within 0.08 s of a silence end. Anything else is printed as NEEDS WAVEFORM CHECK.
"""
import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("audio")
ap.add_argument("phrases")
ap.add_argument("--expressive")
ap.add_argument("--copy", help="also write the result here (src/data/eNN.phrases.json)")
args = ap.parse_args()

out = subprocess.run(
    ["ffmpeg", "-i", args.audio, "-af", "silencedetect=noise=-30dB:d=0.15", "-f", "null", "-"],
    capture_output=True, text=True,
).stderr
windows, st = [], None
for line in out.splitlines():
    m = re.search(r"silence_start:\s*([\d.]+)", line)
    if m:
        st = float(m.group(1))
        continue
    m = re.search(r"silence_end:\s*([\d.]+)", line)
    if m and st is not None:
        windows.append((st, float(m.group(1))))
        st = None
print(f"{len(windows)} silence windows")

MIN_PAUSE, LIP, TAIL, MIN_WORD, HEAD, SLIVER = 0.25, 0.08, 0.30, 0.12, 0.35, 0.25
pauses = [(a, b) for a, b in windows if b - a >= MIN_PAUSE]

path = Path(args.phrases)
phrases = json.loads(path.read_text())
flat = [w for ph in phrases for w in ph.get("words") or []]
counts = dict(A=0, B=0, C=0, D=0)

for k, w in enumerate(flat):
    s, e = w["start"], w["end"]
    for a, b in pauses:  # A
        if a <= s + LIP and s < b:
            s = b; e = max(e, s + MIN_WORD); counts["A"] += 1; break
    for a, b in pauses:  # C
        if s < a and b <= e and (a - s) < HEAD:
            s = b; e = max(e, s + MIN_WORD); counts["C"] += 1; break
    for a, b in pauses:  # B
        if s + MIN_WORD < a < e and (e - a) >= TAIL:
            e = a; counts["B"] += 1; break
    prev_end = flat[k - 1]["end"] if k else None
    nxt = flat[k + 1]["start"] if k + 1 < len(flat) else None
    if prev_end is not None and abs(s - prev_end) <= 0.06:  # D
        for a, b in pauses:
            if s <= a and e <= a + 0.02 and (a - s) < SLIVER and (nxt is None or nxt > b + 0.05):
                s = b; e = max(min(nxt, b + 0.6) if nxt is not None else b + 0.3, b + MIN_WORD)
                counts["D"] += 1; break
    w["start"], w["end"] = round(s, 3), round(e, 3)

for k in range(1, len(flat)):  # monotonic, no overlaps
    if flat[k]["start"] < flat[k - 1]["end"]:
        flat[k - 1]["end"] = flat[k]["start"]
for ph in phrases:
    ws = ph.get("words") or []
    if ws:
        ph["start"], ph["end"] = ws[0]["start"], ws[-1]["end"]
        ph["duration"] = round(ph["end"] - ph["start"], 3)

path.write_text(json.dumps(phrases, indent=2))
print("rules applied:", counts)
short = [(i, p["text"]) for i, p in enumerate(phrases) if p["end"] - p["start"] < 0.1]
print("phrases < 0.1 s:", short or "none")

if args.expressive:
    lines = [l.strip() for l in Path(args.expressive).read_text().splitlines() if l.strip()]
    def clean(t):
        return re.sub(r"[^a-z0-9 ]", "", re.sub(r"\[[^\]]*\]", "", t).lower()).split()
    bad = 0
    for i, l in enumerate(lines):
        if l.startswith("[pause") and i + 1 < len(lines):
            first = clean(lines[i + 1])[:3]
            for j, ph in enumerate(phrases):
                pt = clean(ph["text"])
                n = min(len(first), len(pt))  # "Nine! One and nine…" is ONE line but TWO phrases
                if n and pt[:n] == first[:n] and ph["start"] > (phrases[j - 1]["start"] if j else -1):
                    s = ph["start"]
                    near = min((abs(b - s) for a, b in pauses), default=9)
                    tag = "OK" if near < 0.08 else "NEEDS WAVEFORM CHECK"
                    if tag != "OK":
                        bad += 1
                    print(f"  after pause -> p{j:<3} {s:8.2f}  off {near:5.2f}s  {tag}  {ph['text'][:40]}")
                    break
    print(f"pause check: {bad} need a look")

if args.copy:
    shutil.copy(path, args.copy)
    print("copied ->", args.copy)
