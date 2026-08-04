#!/usr/bin/env python3
"""faster-whisper backend for align_audio.py.

The phonics pipeline uses `stable_whisper`, which is not installed on this machine;
`faster_whisper` is. This module exposes the two things align_audio.py touches —
`load_model()` returning an object with `.align()` and `.transcribe()` — so that
align_audio.py runs unchanged.

IMPORTANT DIFFERENCE FROM stable_whisper
----------------------------------------
stable_whisper's `.align(audio, text)` is TRUE forced alignment: it constrains the
model to the known script, so every script word gets a timestamp even if the audio
is unclear.

faster-whisper has no forced-alignment entry point. `.align()` here is ASR with
word-level timestamps, and the known text is used only to bias decoding. So:

  * A mis-transcribed word shifts the greedy character match in
    map_words_to_lines(), which can drag a line boundary.
  * Counted runs ("one, two, three, four") are still collapsed, exactly as they are
    with stable_whisper. Run tools/refine_phrase_onsets.py afterwards regardless.

Read the printed table before trusting the output. If line starts drift from the
audio, install stable-ts and rerun for true alignment.
"""
from __future__ import annotations

from dataclasses import dataclass

from faster_whisper import WhisperModel


@dataclass
class _Word:
    word: str
    start: float
    end: float


@dataclass
class _Segment:
    text: str
    start: float
    end: float
    words: list


@dataclass
class _Result:
    segments: list


class _Model:
    def __init__(self, name: str):
        # int8 on CPU: no GPU is assumed, and accuracy loss is irrelevant next to
        # the ASR-vs-forced-alignment gap documented above.
        self._m = WhisperModel(name, device="cpu", compute_type="int8")

    def _run(self, audio: str, language: str, initial_prompt: str | None):
        segments, _info = self._m.transcribe(
            audio,
            language=language,
            word_timestamps=True,
            initial_prompt=initial_prompt,
            vad_filter=False,          # never drop the deliberate 3 s recall gap
            condition_on_previous_text=True,
        )
        out = []
        for seg in segments:            # generator — must be consumed
            words = [
                _Word(w.word, w.start, w.end)
                for w in (seg.words or [])
                if w.start is not None and w.end is not None
            ]
            out.append(_Segment(seg.text, seg.start, seg.end, words))
        return _Result(out)

    def align(self, audio: str, text: str, language: str = "en"):
        # Only the head of the script fits in the prompt window (~224 tokens), but
        # biasing the opening still measurably steadies the vocabulary that follows.
        return self._run(audio, language, initial_prompt=text[:800] or None)

    def transcribe(self, audio: str, language: str = "en"):
        return self._run(audio, language, initial_prompt=None)


def load_model(name: str = "base"):
    return _Model(name)
