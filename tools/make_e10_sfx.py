#!/usr/bin/env python3
"""Original SFX for E10 — pure stdlib synthesis, same technique as make_e08_sfx.py's second pass
(portamento, rounded envelopes, overlapping shimmer runs) — never a click, never a flat pluck.

THE EIGHT "STUCK" SOUNDS. Every worked round in E10 hits the same wall ("we are stuck"), and the
first draft was going to reuse one sound eight times, which is exactly the "everything sounds like
a click" mistake E08 already paid for once — just at the level of REPETITION instead of technique.
Each one is built to match its own line's tone, not just given a different pitch:

  stuck_matteroffact.wav  "Look at that, we are stuck."            — plain, unbothered downward glide.
  stuck_uhoh.wav          "Uh oh, we are stuck again."              — the classic comic "uh-oh": high
                          note dropping to a lower one, unmistakably a little blooper.
  stuck_determined.wav    "Stuck already? Let's fix that."          — short, brisk, rising — "let's go",
                          not "oh no".
  stuck_weary.wav         "There it is — stuck once more."          — slow, low, a long sighing release.
  stuck_confident.wav     "We are stuck, but we know exactly what to do." — steady tone with a small
                          resolved flick UP at the end, not worried.
  stuck_bright.wav        "Stuck! Lucky for us, we have a trick."   — a short bright shimmering run,
                          relieved rather than alarmed.
  stuck_playful.wav       "Here we go again — stuck!"               — a bouncy two-note "boop-boop",
                          playful repetition, echoing `uhoh`'s comic shape without copying it.
  stuck_final.wav         "One more stuck moment to solve."         — warm and unhurried, the last one,
                          anticipation rather than surprise.

Plus three for the game's own props:
  wheel_spin.wav   a ratchet of quick clicks, spacing widening as it slows — a wheel decelerating.
  wheel_land.wav   one bright sustained ding — the wheel settling on its answer.
  buzzer.wav       a cartoon "bwap", not a harsh electric buzzer — a kid-show buzz-in, not an alarm.

Usage:  python3 tools/make_e10_sfx.py
        (then convert to mp3 — the renderer prefers it)
"""
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "public/audio/sfx"
random.seed(10)


def write(path: Path, samples: list[float]) -> None:
    peak = max(1e-9, max(abs(s) for s in samples))
    norm = 0.72 / peak
    with wave.open(str(path), "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(
            b"".join(struct.pack("<h", int(max(-1, min(1, s * norm)) * 32767)) for s in samples)
        )
    print(f"  {path.name}  {len(samples)/SR:.3f}s")


def mix(a: list[float], b: list[float], at: float = 0.0) -> list[float]:
    start = int(at * SR)
    n = max(len(a), start + len(b))
    out = list(a) + [0.0] * (n - len(a))
    for i, s in enumerate(b):
        out[start + i] += s
    return out


def round_env(t: float, total: float, attack: float, release_pow: float) -> float:
    if t < attack:
        x = t / attack
        return x * x * (3 - 2 * x)
    x = (t - attack) / max(1e-6, total - attack)
    return max(0.0, (1.0 - x)) ** release_pow


def glide_tone(f_start: float, f_end: float, dur: float, attack: float, release_pow: float,
               warmth: float = 0.5) -> list[float]:
    n = int(dur * SR)
    out: list[float] = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        gx = x * x * (3 - 2 * x)
        f = f_start + (f_end - f_start) * gx
        phase += 2 * math.pi * f / SR
        fundamental = math.sin(phase)
        triangle_ish = math.sin(phase) - 0.15 * math.sin(3 * phase) + 0.06 * math.sin(5 * phase)
        s = fundamental * (1 - warmth) + triangle_ish * warmth
        out.append(s * round_env(t, dur, attack, release_pow))
    return out


def sparkle_note(freq: float, dur: float, attack: float = 0.02) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack, release_pow=1.6)
        shimmer = 1.0 + 0.08 * math.sin(2 * math.pi * 9 * t)
        s = math.sin(2 * math.pi * freq * t * shimmer) + 0.22 * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env)
    return out


def click(freq: float, dur: float, warmth: float = 0.4) -> list[float]:
    """A single soft ratchet click — rounded, not sharp, for the wheel's own tick."""
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        env = round_env(t, dur, attack=0.003, release_pow=2.2)
        s = math.sin(2 * math.pi * freq * t) - warmth * math.sin(2 * math.pi * freq * 2 * t)
        out.append(s * env)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("E10 sounds:")

    # STUCK MATTER-OF-FACT — plain downward glide, mid register, unbothered.
    write(OUT / "stuck_matteroffact.wav", glide_tone(420, 300, 0.26, attack=0.02, release_pow=1.5, warmth=0.5))

    # STUCK UH-OH — the classic blooper: a high note dropping to a lower one.
    uhoh = glide_tone(560, 480, 0.14, attack=0.01, release_pow=1.4, warmth=0.4)
    uhoh = mix(uhoh, glide_tone(400, 300, 0.22, attack=0.01, release_pow=1.6, warmth=0.5), at=0.15)
    write(OUT / "stuck_uhoh.wav", uhoh)

    # STUCK DETERMINED — short, brisk, RISING. "Let's fix that," not "oh no."
    write(OUT / "stuck_determined.wav", glide_tone(360, 520, 0.16, attack=0.008, release_pow=1.3, warmth=0.35))

    # STUCK WEARY — slow, low, a long sighing release.
    write(OUT / "stuck_weary.wav", glide_tone(340, 230, 0.42, attack=0.06, release_pow=2.0, warmth=0.65))

    # STUCK CONFIDENT — a steady tone that resolves UP at the end, not worried.
    conf = glide_tone(380, 370, 0.22, attack=0.03, release_pow=1.4, warmth=0.5)
    conf = mix(conf, glide_tone(370, 480, 0.14, attack=0.01, release_pow=1.3, warmth=0.35), at=0.2)
    write(OUT / "stuck_confident.wav", conf)

    # STUCK BRIGHT — a short shimmering run, relieved rather than alarmed.
    bright = sparkle_note(660, 0.16, attack=0.015)
    bright = mix(bright, sparkle_note(880, 0.2, attack=0.015), at=0.09)
    write(OUT / "stuck_bright.wav", bright)

    # STUCK PLAYFUL — bouncy two-note "boop-boop", echoing uh-oh's shape without copying it.
    playful = glide_tone(500, 560, 0.1, attack=0.008, release_pow=1.2, warmth=0.3)
    playful = mix(playful, glide_tone(440, 500, 0.12, attack=0.008, release_pow=1.2, warmth=0.3), at=0.13)
    write(OUT / "stuck_playful.wav", playful)

    # STUCK FINAL — warm and unhurried, the last one; anticipation, not surprise.
    write(OUT / "stuck_final.wav", glide_tone(350, 420, 0.34, attack=0.05, release_pow=1.8, warmth=0.6))

    # WHEEL SPIN — a ratchet of quick clicks, spacing widening as the wheel slows. 24 clicks
    # reaches ~2.85s, matching the measured spin-to-land window across all 8 rounds (2.4-3.0s,
    # word "spin" to word "lands") — the first pass (22 clicks, ~2.1s) finished up to a second
    # before the wheel actually landed, which is why it read as having no spin sound at all.
    spin: list[float] = []
    t = 0.0
    gap = 0.028
    for i in range(24):
        spin = mix(spin, click(300 + random.uniform(-15, 15), 0.05), at=t)
        t += gap
        gap *= 1.11  # each click a little further from the last — the wheel decelerating
    write(OUT / "wheel_spin.wav", spin)

    # WHEEL LAND — one bright sustained ding, the wheel settling on its answer.
    write(OUT / "wheel_land.wav", sparkle_note(988, 0.5, attack=0.01))

    # BUZZER — a cartoon "bwap", a kid-show buzz-in, not an alarm klaxon.
    write(OUT / "buzzer.wav", glide_tone(260, 140, 0.22, attack=0.005, release_pow=1.6, warmth=0.7))


if __name__ == "__main__":
    main()
