#!/usr/bin/env python3
"""E16 audio prep: pacing against every scripted hold, plus the optional Make-twenty-six pickup splice.

    python3 tools/e15_audio_prep.py RAW.mp3 RAW.phrases.json OUT.wav [--pickup E16_make26.mp3]

What it does, in ONE filter pass (so there is a single set of 0.04 s fades per edit):
  1. PACING. Every `# ⏸ hold Ns` in docs/E16_spoken.txt sits after one script line. The gap between that
     line's last phrase and the next line's first phrase is measured from the aligner's word times; where
     it is shorter than the hold, REAL silence is inserted at the middle of the REAL quiet stretch
     (found from the samples, not from the ASR's estimate of where a word ends).  Nothing is stretched
     and nothing already long enough is touched.
  2. PICKUP (optional). The old take's "Bigger numbers now. Make twenty-six. ... Thumb up, index finger
     down!" block (the phrases whose text starts with "Bigger numbers now" through "Thumb up, index
     finger down") is cut out at silence boundaries and replaced by the pickup, trimmed to its own
     speech with a short lead and tail, level-matched (RMS of the speech) to the surrounding take, with
     0.04 s fades.  The silence before and after keeps the lengths the old take had (1 s hold before,
     the old natural gap after).
Prints every edit and writes a report of every splice position so the spectrogram / 1 ms peak scan can
check them.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 44100
FADE = 0.04
SCRIPT = Path("docs/E16_spoken.txt")


def load(path: str) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768.0


def holds_by_line() -> dict[int, float]:
    """script line index (non-comment, non-blank) -> hold seconds that follows it"""
    out: dict[int, float] = {}
    li = -1
    for ln in SCRIPT.read_text().splitlines():
        s = ln.strip()
        if not s:
            continue
        if s.startswith("#"):
            m = re.search(r"⏸\s*hold\s*(\d+(?:\.\d+)?)\s*s", s)
            if m and li >= 0:
                out[li] = float(m.group(1))
            continue
        li += 1
    return out


def quiet_mid(x: np.ndarray, a: float, b: float, thr: float = 0.004) -> tuple[float, float, float]:
    """The REAL quiet stretch that follows a phrase end `a` (ASR time; may be a beat early or late):
    the first run of near-silence (>= 0.15 s) that starts no earlier than 0.3 s before `a`.
    `b` (the next phrase's ASR start) only bounds the fall-back. Returns (start, end, mid)."""
    win = int(0.01 * SR)
    env = np.sqrt(np.convolve(x * x, np.ones(win) / win, mode="same"))
    i0 = max(0, int((a - 0.3) * SR))
    i1 = min(len(x), int((max(b, a) + 3.5) * SR))
    q = env[i0:i1] < thr
    run = None
    for k, v in enumerate(q):
        if v and run is None:
            run = k
        if run is not None and (not v or k == len(q) - 1):
            end = k if not v else k + 1
            if end - run >= int(0.15 * SR):
                s0, e0 = (i0 + run) / SR, (i0 + end) / SR
                return s0, e0, (s0 + e0) / 2
            run = None
    return a, b, (a + b) / 2


def main() -> None:
    raw_path, ph_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    pickup = sys.argv[sys.argv.index("--pickup") + 1] if "--pickup" in sys.argv else None
    x = load(raw_path)
    ph = json.load(open(ph_path))
    holds = holds_by_line()
    by_line: dict[int, list[dict]] = {}
    for p in ph:
        by_line.setdefault(p["line_index"], []).append(p)

    # ---- the pickup block in the old take
    blk = None
    if pickup:
        idx = [p["index"] for p in ph if p["text"].lower().startswith("bigger numbers now")]
        last = [p["index"] for p in ph if p["text"].lower().startswith("thumb up, index finger down")]
        if not idx or not last:
            raise SystemExit("cannot find the Make twenty-six block in the old take's phrases")
        first_p, last_p = ph[idx[0]], ph[last[0]]
        prev_p, next_p = ph[first_p["index"] - 1], ph[last_p["index"] + 1]
        _, _, mid_left = quiet_mid(x, prev_p["end"], first_p["start"])
        _, _, mid_right = quiet_mid(x, last_p["end"], next_p["start"])
        blk = dict(cut_a=mid_left, cut_b=mid_right, prev=prev_p, first=first_p, last=last_p, next=next_p)

    edits: list[tuple[float, float]] = []  # (time in raw, silence seconds to ADD)
    report = []
    for li, hold in sorted(holds.items()):
        if li not in by_line or li + 1 not in by_line:
            continue
        a = by_line[li][-1]["end"]
        b = by_line[li + 1][0]["start"]
        if blk and blk["cut_a"] - 0.5 < a < blk["cut_b"] + 0.5:
            continue  # inside the pickup block: the pickup carries its own pacing
        # the gap is measured from the REAL quiet stretch (the aligner can be a beat off at a boundary)
        s, e, mid = quiet_mid(x, a, b)
        gap = (e - s) if (e - s) > 0.12 and (e - s) < 6 else b - a
        add = hold - gap
        if add > 0.15:
            edits.append((mid, round(add, 3)))
            report.append(f"hold {hold:g}s after line {li}: real gap {gap:.2f} -> +{add:.2f}s at {mid:.3f}")
        else:
            report.append(f"hold {hold:g}s after line {li}: gap {gap:.2f} ok")

    # ---- build the segment list: (kind, data)
    segs: list[tuple[str, float, float] | tuple[str, float]] = []
    cursor = 0.0
    events: list[tuple[float, str, object]] = [(t, "sil", add) for t, add in edits]
    if blk:
        events.append((blk["cut_a"], "pickup", blk))
    events.sort(key=lambda e: e[0])
    order: list[str] = []
    fc: list[str] = []
    n = 0
    outpos = 0.0
    splices: list[tuple[float, float]] = []
    skip_to = None
    srcs = ["-i", raw_path]
    if pickup:
        srcs += ["-i", pickup]

    def add_piece(start: float, end: float | None, fin: bool, fout: bool, src: int = 0) -> None:
        nonlocal n, outpos
        if end is not None:
            outpos += end - start
        f = f"[{src}:a]atrim=start={start:.4f}" + (f":end={end:.4f}" if end is not None else "") + ",asetpts=PTS-STARTPTS"
        if fin:
            f += f",afade=t=in:d={FADE}"
        if fout and end is not None:
            f += f",afade=t=out:st={max(0.0, end - start - FADE):.4f}:d={FADE}"
        fc.append(f + f"[p{n}]")
        order.append(f"[p{n}]")
        n += 1

    def add_sil(sec: float) -> None:
        nonlocal n, outpos
        splices.append((outpos, outpos + sec))
        outpos += sec
        fc.append(f"aevalsrc=0:d={sec:.4f}:s={SR}:c=mono[p{n}]")
        order.append(f"[p{n}]")
        n += 1

    first = True
    for t, kind, data in events:
        if skip_to is not None and t < skip_to:
            continue
        if kind == "sil":
            add_piece(cursor, t, not first, True)
            add_sil(float(data))  # type: ignore[arg-type]
            cursor = t
            first = False
        else:
            b = data  # type: ignore[assignment]
            # left piece ends in real silence at cut_a; the pickup follows after the old 1 s hold
            add_piece(cursor, b["cut_a"], not first, True)
            first = False
            pk = load(pickup)  # type: ignore[arg-type]
            win = int(0.02 * SR)
            env = np.sqrt(np.convolve(pk * pk, np.ones(win) / win, mode="same"))
            sp = np.where(env > 0.01)[0]
            ps, pe = sp[0] / SR, sp[-1] / SR
            lead, tail = 0.25, 0.40
            ps0, pe0 = max(0.0, ps - lead), min(len(pk) / SR, pe + tail)
            # level match: speech RMS of the pickup vs the old block's neighbours (the line before and after)
            def rms(a: float, b2: float) -> float:
                seg = x[int(a * SR):int(b2 * SR)]
                seg = seg[np.abs(seg) > 0.01]
                return float(np.sqrt(np.mean(seg * seg))) if len(seg) else 1e-6
            ref = (rms(b["prev"]["start"], b["prev"]["end"]) + rms(b["next"]["start"], b["next"]["end"])) / 2
            pr = rms(ps, pe)
            gain = ref / pr
            report.append(f"pickup speech {ps:.2f}-{pe:.2f}s of {len(pk)/SR:.2f}s, rms {pr:.4f} vs surrounding {ref:.4f} -> gain x{gain:.2f}")
            # silence before: keep the natural 0.45 s of real quiet already in the left piece (cut_a is the
            # middle of the old quiet stretch), so the total gap before the pickup speech is
            # (cut_a's quiet half) + S1 + lead = 1.0 s
            left_quiet = b["cut_a"] - b["prev"]["end"]
            s1 = max(0.0, 1.0 - left_quiet - lead)
            add_sil(s1)
            fc.append(f"[1:a]atrim=start={ps0:.4f}:end={pe0:.4f},asetpts=PTS-STARTPTS,volume={gain:.4f},afade=t=in:d={FADE},afade=t=out:st={max(0.0, pe0 - ps0 - FADE):.4f}:d={FADE}[p{n}]")
            order.append(f"[p{n}]")
            n += 1
            outpos += pe0 - ps0
            # silence after: restore the old natural gap (last end -> next start) minus the pickup's tail
            old_gap = b["next"]["start"] - b["last"]["end"]
            right_quiet = b["next"]["start"] - b["cut_b"]
            s2 = max(0.0, old_gap - tail - right_quiet)
            add_sil(s2)
            cursor = b["cut_b"]
            skip_to = b["cut_b"]
            report.append(f"pickup splice: old block {b['cut_a']:.2f}-{b['cut_b']:.2f}s replaced; +{s1:.2f}s before, +{s2:.2f}s after")
    add_piece(cursor, None, not first, False)
    fc.append("".join(order) + f"concat=n={len(order)}:v=0:a=1[out]")
    subprocess.run(["ffmpeg", "-y", "-v", "error", *srcs, "-filter_complex", ";".join(fc), "-map", "[out]", "-ar", str(SR), "-ac", "1", out_path], check=True)
    Path(out_path).with_suffix(".splices.json").write_text(json.dumps(splices))
    print("\n".join(report))
    print("wrote", out_path)


if __name__ == "__main__":
    main()
