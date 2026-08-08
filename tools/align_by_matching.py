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


# Whisper writes spoken numbers as DIGITS ("that is 4"), while the script says them as
# words on purpose — EPISODE_RULES.md §3.6, because the caption reads better and because
# a number word can carry a word timestamp. Under norm() alone "four" and "4" share no
# characters, so every counting beat failed to match: measured on E02's take, 1 of 51
# number-words matched, and the script as a whole only reached 81.7%.
#
# That matters more here than a percentage suggests. The number words ARE the beats where
# beads move, and the your-turn answer ("It is three") lands right after 2.5 s of
# deliberate silence — miss it and its onset gets interpolated across the pause, putting
# the answer on screen while the child is still being asked.
#
# Both sides collapse to the digit form. Kept to what narration actually says: units,
# teens, tens, and the two scale words. Exact whole-token keys only, so "ones" (as in the
# ones rod) and "fourth" pass through untouched.
_UNITS = "zero one two three four five six seven eight nine".split()
_TEENS = ("ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen "
          "nineteen").split()
_TENS = "twenty thirty forty fifty sixty seventy eighty ninety".split()

NUM_WORDS: dict[str, str] = {w: str(i) for i, w in enumerate(_UNITS)}
NUM_WORDS.update({w: str(10 + i) for i, w in enumerate(_TEENS)})
NUM_WORDS.update({w: str(20 + 10 * i) for i, w in enumerate(_TENS)})
NUM_WORDS.update({"hundred": "100", "thousand": "1000"})


# Whisper reliably hears "bead" as "beat" — and "bead" is the most-spoken word in this entire
# series, roughly twenty-five times in E05 alone. Under norm() the two share no match, so every one
# of those failed and took the surrounding timing with it. Folding the homophone is the same class
# of fix as the number words: the SCRIPT keeps the correct spelling, because that is what the caption
# renders, and matching is taught to see through a known transcription error.
ASR_HOMOPHONES: dict[str, str] = {"beat": "bead", "beats": "beads", "bees": "beads"}


# THE PLACE NAMES, which Whisper writes as possessives of a digit.
#
# "the ones rod" is transcribed "the 1's rod", and "the tens rod" as "the 10's rod"; norm() strips
# the apostrophe and leaves "1s" and "10s", which share no match with the script's "ones" and "tens".
# E06 says those two words twenty-six times — it is an episode ABOUT the two rods — and every one of
# them failed, taking the alignment from 100% to 86.7%.
#
# NUM_WORDS deliberately lets "ones" through untouched, and its comment says so; that was right when
# nothing depended on it and is wrong now. Kept as its own map rather than folded into NUM_WORDS,
# because these are PLURAL PLACE NAMES, not numbers — "ones" is a column, not the value 1.
#
# Mapped SYMMETRICALLY: both spellings collapse to the same token, so a phrase matches whichever way
# Whisper chose to write it that day. That can only add matches, never remove one.
PLACE_WORDS: dict[str, str] = {
    "ones": "1s",
    "tens": "10s",
    "hundreds": "100s",
    "thousands": "1000s",
}


# Tens and units, for fusing a compound number into the single token Whisper usually writes.
_TENS_DIGITS = {str(20 + 10 * i) for i in range(8)}
_UNIT_DIGITS = {str(i) for i in range(1, 10)}


def compound(text: str) -> str | None:
    """"twenty-one" -> "21", but only when EVERY part is a number word.

    Whisper is inconsistent about compound numbers: E05's take gave "twenty" and "one" as two
    tokens, E06's gave "21" as one. Both are correct transcriptions and the script cannot be written
    to suit both, so the matcher learns the equivalence instead — see `fuse` for the other half.
    """
    parts = [p for p in text.split("-") if norm(p)]
    if len(parts) < 2:
        return None
    digits = [NUM_WORDS.get(norm(p)) for p in parts]
    if any(d is None for d in digits):
        return None
    if len(digits) == 2 and digits[0] in _TENS_DIGITS and digits[1] in _UNIT_DIGITS:
        return str(int(digits[0]) + int(digits[1]))
    return None


def canon(text: str) -> str:
    """Normalise for MATCHING: norm(), then number words to digits.

    Deliberately separate from norm(), which also decides whether a token is a word at
    all. Folding the two would change what gets filtered out, not just what matches.
    """
    fused = compound(text)
    if fused is not None:
        return fused
    n = norm(text)
    n = ASR_HOMOPHONES.get(n, n)
    n = PLACE_WORDS.get(n, n)
    return NUM_WORDS.get(n, n)


# A tens word and a unit word that sit next to each other are only ONE number if they were spoken as
# one. E04 says "Three tens is thirty. Eight ones is eight." — "thirty" and "Eight" are adjacent in
# the stream and belong to different sentences, and fusing them into "38" broke two words that had
# always matched. Punctuation and a pause are what separate them.
_SENTENCE_END = tuple(".,!?;:")
_FUSE_MAX_GAP = 0.22


def fuse(tokens: list[str], raw: list[dict]) -> list[tuple[str, int, int]]:
    """Collapse an adjacent tens+unit pair into one token: ("21", first_index, last_index).

    The other half of `compound`. Whichever way the transcription split a compound number, both
    sides end up holding the same single token, so the 1:1 alignment can pair them.

    Only fuses a pair the narrator ran together: no sentence punctuation after the first word, and
    less than `_FUSE_MAX_GAP` of silence between them. "Twenty-one" is said as one word; "thirty.
    Eight" is not.
    """
    out: list[tuple[str, int, int]] = []
    i = 0
    while i < len(tokens):
        joined = (
            i + 1 < len(tokens)
            and tokens[i] in _TENS_DIGITS
            and tokens[i + 1] in _UNIT_DIGITS
            and not raw[i]["word"].strip().endswith(_SENTENCE_END)
            and raw[i + 1]["start"] - raw[i]["end"] < _FUSE_MAX_GAP
        )
        if joined:
            out.append((str(int(tokens[i]) + int(tokens[i + 1])), i, i + 1))
            i += 2
        else:
            out.append((tokens[i], i, i))
            i += 1
    return out



def script_tokens(phrase: str) -> list[str]:
    """Split a phrase into the tokens the ASR will produce, not the ones the page shows.

    Whitespace alone is not enough once numbers get past nine. `norm()` strips the hyphen, so
    "twenty-three" collapses to "twentythree", which is in no lookup table — while Whisper emits it
    as two words, "twenty" and "three". One token against two never matches, and the number words
    are precisely the beats a bead move is timed to (E02: 1 of 51 matched before `canon()` existed).

    A hyphenated number is now kept WHOLE, because `canon` resolves "twenty-one" to "21" itself and
    `fuse` collapses the ASR side when the transcription split it instead. Splitting here as well
    would put two tokens against Whisper's one on any take that wrote the compound as a digit — which
    is what E06's take did, and it cost 39 words.
    """
    out: list[str] = []
    for w in phrase.split():
        parts = w.split("-")
        numeric = len(parts) > 1 and all(canon(p) != norm(p) for p in parts if norm(p))
        # a tens+unit compound stays whole; anything else numeric still splits
        for piece in ([w] if compound(w) else (parts if numeric else [w])):
            if norm(piece):
                out.append(piece)
    return out


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
    a = [canon(w) for w in script_words]
    # FUSE THE ASR SIDE. Whisper may render "twenty-one" as one token ("21") or two ("twenty",
    # "one"); the script now always holds one. Fusing adjacent tens+unit pairs makes the two streams
    # agree either way. A fused pair keeps the START of its first word and the END of its second, so
    # the compound's timing still spans the whole spoken number.
    fused = fuse([canon(w["word"]) for w in asr], asr)
    b = [tok for tok, _, _ in fused]
    spans = [
        {"word": asr[i]["word"], "start": asr[i]["start"], "end": asr[j]["end"]}
        for _, i, j in fused
    ]
    matched: list[dict | None] = [None] * len(a)
    for blk in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            matched[blk.a + k] = spans[blk.b + k]
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
        for w in script_tokens(ph):
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
