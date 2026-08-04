#!/usr/bin/env python3
"""Align a script to audio by SEQUENCE MATCHING, not greedy consumption.

Why this exists
---------------
align_audio.py's map_words_to_lines() walks the ASR word stream and consumes words
until each script line's character count is satisfied. That assumes the ASR output
matches the script word-for-word. It doesn't: the narrator paraphrases, the ASR drops
filler, and every insertion or deletion shifts EVERY later line permanently. Measured
drift on E01 reached -15.6 s and never recovered.

This tool instead runs difflib over (normalised ASR words) vs (normalised script words)
to find true matching blocks, so a mismatch is absorbed locally rather than propagating.
Script words with no ASR match get interpolated between their nearest matched neighbours.

Output is drop-in compatible with align_audio.py:
    <name>.phrases.json   [{index, text, line_index, start, end, duration, words}]
    <name>.words.json
    <name>.srt

Usage:
    python3 tools/align_by_matching.py <audio> <script.txt> [--model base]
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
from pathlib import Path

from faster_whisper import WhisperModel


def norm(text: str) -> str:
    return re.sub(r"[^a-z0-9]", "", text.lower())


def read_lines(path: Path) -> list[str]:
    out = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if line and not line.startswith("#"):
            out.append(line)
    return out


def split_phrases(line: str) -> list[str]:
    parts = re.split(r"(?<=[.!?…])\s+", line)
    return [p.strip() for p in parts if p.strip()]


def fmt_ts(seconds: float) -> str:
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3_600_000)
    m, ms = divmod(ms, 60_000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def transcribe_words(audio: Path, model_name: str, lang: str) -> list[dict]:
    """Plain ASR with word timestamps. No initial_prompt: biasing the decoder toward
    the script is what made the previous pass hallucinate script wording into places
    the narrator said something else. vad_filter off so deliberate silence survives."""
    model = WhisperModel(model_name, device="cpu", compute_type="int8")
    segments, _ = model.transcribe(
        str(audio), language=lang, word_timestamps=True,
        vad_filter=False, condition_on_previous_text=True,
    )
    words = []
    for seg in segments:
        for w in seg.words or []:
            if w.start is None or w.end is None:
                continue
            if not norm(w.word):
                continue
            words.append({"word": w.word.strip(), "start": w.start, "end": w.end})
    return words


def align(script_words: list[str], asr: list[dict]) -> list[dict | None]:
    """Return, per script word, the matched ASR word dict (or None)."""
    a = [norm(w) for w in script_words]
    b = [norm(w["word"]) for w in asr]
    matched: list[dict | None] = [None] * len(a)
    for blk in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            matched[blk.a + k] = asr[blk.b + k]
    return matched


def interpolate(matched: list[dict | None], total: float) -> list[tuple[float, float]]:
    """Give every script word a (start, end), interpolating across unmatched runs."""
    n = len(matched)
    times: list[tuple[float, float] | None] = [
        (m["start"], m["end"]) if m else None for m in matched
    ]
    anchors = [i for i, t in enumerate(times) if t is not None]
    if not anchors:
        raise SystemExit("no words matched at all — wrong audio or wrong script?")

    for i in range(n):
        if times[i] is not None:
            continue
        prev = next((j for j in reversed(anchors) if j < i), None)
        nxt = next((j for j in anchors if j > i), None)
        if prev is None:
            lo, hi = 0.0, times[nxt][0]
        elif nxt is None:
            lo, hi = times[prev][1], total
        else:
            lo, hi = times[prev][1], times[nxt][0]
        # spread the unmatched run evenly across the hole
        run = [k for k in range(prev + 1 if prev is not None else 0, nxt if nxt is not None else n)
               if times[k] is None]
        if not run:
            run = [i]
        span = max(hi - lo, 1e-3) / len(run)
        pos = run.index(i)
        times[i] = (lo + pos * span, lo + (pos + 1) * span)
    return times  # type: ignore[return-value]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", type=Path)
    ap.add_argument("script", type=Path)
    ap.add_argument("--model", default="base")
    ap.add_argument("--lang", default="en")
    args = ap.parse_args()

    lines = read_lines(args.script)
    phrases, parents = [], []
    for li, line in enumerate(lines):
        for ph in split_phrases(line):
            phrases.append(ph)
            parents.append(li)

    print(f"transcribing {args.audio.name}...", file=sys.stderr)
    asr = transcribe_words(args.audio, args.model, args.lang)
    total = max(w["end"] for w in asr)
    print(f"  {len(asr)} ASR words, audio speech ends {total:.2f}s", file=sys.stderr)

    # flat script word list, remembering which phrase each word belongs to
    script_words, owner = [], []
    for pi, ph in enumerate(phrases):
        for w in ph.split():
            if norm(w):
                script_words.append(w)
                owner.append(pi)

    matched = align(script_words, asr)
    hit = sum(1 for m in matched if m)
    print(f"  matched {hit}/{len(script_words)} script words "
          f"({100*hit/len(script_words):.1f}%)", file=sys.stderr)
    times = interpolate(matched, total)

    out = []
    for pi, ph in enumerate(phrases):
        idxs = [i for i, o in enumerate(owner) if o == pi]
        start = min(times[i][0] for i in idxs)
        end = max(times[i][1] for i in idxs)
        out.append({
            "index": pi,
            "text": ph,
            "line_index": parents[pi],
            "start": round(start, 3),
            "end": round(end, 3),
            "duration": round(end - start, 3),
            "matched": sum(1 for i in idxs if matched[i]),
            "words": [{"word": script_words[i],
                       "start": round(times[i][0], 3),
                       "end": round(times[i][1], 3)} for i in idxs],
        })

    stem = args.audio.with_suffix("")
    Path(f"{stem}.phrases.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))
    Path(f"{stem}.words.json").write_text(json.dumps(
        [w for p in out for w in p["words"]], indent=2, ensure_ascii=False))
    Path(f"{stem}.srt").write_text("\n".join(
        f"{i}\n{fmt_ts(p['start'])} --> {fmt_ts(p['end'])}\n{p['text']}\n"
        for i, p in enumerate(out, 1)), encoding="utf-8")

    print(f"\n{'#':>3} {'start':>7} {'end':>7} {'dur':>6} {'mat':>4}  phrase")
    print("-" * 74)
    for p in out:
        print(f"{p['index']:>3} {p['start']:>7.2f} {p['end']:>7.2f} "
              f"{p['duration']:>6.2f} {p['matched']:>4}  {p['text'][:36]}")
    print(f"\nwrote {stem}.phrases.json / .words.json / .srt", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
