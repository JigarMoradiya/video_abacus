#!/usr/bin/env python3
"""Transcribe a narration take, so the AS-RECORDED text can be written from the recording.

EPISODE_RULES §3.1a: if the take paraphrases the script, the take wins and gets its own
`<EP>_spoken.txt`. This prints what was actually said, one sentence per line, ready to paste — plus
the gaps between sentences, which is how you check that a scripted pause was actually held. E03's
three-second recall gap came out at 0.84 s and nobody noticed until the episode was built.

    python3 tools/transcribe.py public/audio/e004_bigger_number/E04.mp3 [--model base.en] [--json out.json]

It used to hard-code `out/audio.mp3` and write `src/data/word_timings.json`, which was a leftover
from the phonics pipeline's karaoke captions; alignment now comes from `align_by_matching.py`.
"""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

from faster_whisper import WhisperModel


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", type=Path)
    ap.add_argument("--model", default="base.en")
    ap.add_argument("--json", type=Path, help="also dump word timings here")
    ap.add_argument(
        "--gap",
        type=float,
        default=1.0,
        help="flag silences longer than this between sentences (seconds)",
    )
    a = ap.parse_args()

    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(str(a.audio), word_timestamps=True)

    words: list[dict] = []
    for seg in segments:
        for w in seg.words or []:
            words.append(
                {"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)}
            )

    if not words:
        print("no words transcribed")
        return 1

    # Rebuild sentences from the word stream rather than trusting Whisper's segment breaks, which
    # split on breath rather than on punctuation.
    sentences: list[dict] = []
    cur: list[dict] = []
    for w in words:
        cur.append(w)
        if re.search(r"[.!?…]$", w["word"]):
            sentences.append(
                {"text": " ".join(x["word"] for x in cur), "start": cur[0]["start"], "end": cur[-1]["end"]}
            )
            cur = []
    if cur:
        sentences.append(
            {"text": " ".join(x["word"] for x in cur), "start": cur[0]["start"], "end": cur[-1]["end"]}
        )

    print(f"# {len(words)} words · {len(sentences)} sentences · {words[-1]['end']:.1f}s\n")
    for i, s in enumerate(sentences):
        print(s["text"])
        if i + 1 < len(sentences):
            gap = sentences[i + 1]["start"] - s["end"]
            if gap >= a.gap:
                print(f"#   ^^ {gap:.2f}s silence follows")

    print("\n# --- gaps over %.1fs ---" % a.gap)
    for i, s in enumerate(sentences[:-1]):
        gap = sentences[i + 1]["start"] - s["end"]
        if gap >= a.gap:
            print(f"#   {gap:5.2f}s after: {s['text'][:64]}")

    if a.json:
        a.json.write_text(json.dumps(words, indent=0), encoding="utf-8")
        print(f"\nwrote {len(words)} word timings -> {a.json}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
