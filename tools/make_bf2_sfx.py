#!/usr/bin/env python3
"""Original SFX for the Math Heroes BIG FRIEND short 2 (closing time, the frozen scoreboard).

A different palette from bf1's arcade ticket counter: a sports-hall / game-centre at dusk, so
whistles, wooden clocks, a big brass closing bell, scoreboard flip clacks, a digital glitch and a
power-down / power-up for the freezing and restarting scoreboard. Same helper family as
make_math_heroes_sfx.py (imported, not copied). Bead clicks, friend sparkle, hero call and the
mission-solved chimes in public/audio/sfx/ are reused by the reel.

  bf2_bell.mp3      the big closing bell: a deep brass strike with a long ring
  bf2_tock.mp3      one wooden clock tick/tock (two alternating pitches in the reel)
  bf2_buzzer.mp3    the scoreboard buzzer: a low, raspy two-pulse buzz
  bf2_whistle.mp3   a referee whistle: a bright warbling tweet
  bf2_flip.mp3      scoreboard flip-cards: a fast cascade of plastic clacks
  bf2_glitch.mp3    the digital freeze: a stuttering burst and a falling whine
  bf2_cheer.mp3     a hall crowd cheer with foot-stomp thumps
  bf2_off.mp3       the lights and scoreboard powering down
  bf2_on.mp3        the scoreboard rebooting: a rising chirp and a ping
  bf2_stopwatch.mp3 a stopwatch click and a tiny ratchet
  bf2_gasp.mp3      a comic gasp: a quick breath of filtered noise
  bf2_pop.mp3       a tag popping onto the board
  bf2_thunk.mp3     the frozen stamp landing

Usage:  python3 tools/make_bf2_sfx.py   (writes .wav then converts to .mp3 in public/audio/sfx/)
"""
from __future__ import annotations

import math
import random
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_math_heroes_sfx import OUT, SR, bell, click, glide_tone, mix, whoosh, write  # noqa: E402

random.seed(2611)


def noise(dur: float, lp: float = 0.2, pw: float = 1.5, gain: float = 1.0) -> list[float]:
    n = int(dur * SR)
    prev = 0.0
    out = []
    for i in range(n):
        x = i / n
        prev = prev * (1 - lp) + random.uniform(-1, 1) * lp
        out.append(prev * (1 - x) ** pw * gain)
    return out


def square(freq: float, dur: float, duty: float = 0.5, pw: float = 1.0) -> list[float]:
    n = int(dur * SR)
    out = []
    ph = 0.0
    for i in range(n):
        ph += freq / SR
        v = 1.0 if (ph % 1.0) < duty else -1.0
        out.append(v * (1 - i / n) ** pw * 0.5)
    return out


def sine_env(freq: float, dur: float, attack: float = 0.01, pw: float = 2.0) -> list[float]:
    n = int(dur * SR)
    out = []
    for i in range(n):
        t = i / SR
        a = min(1.0, t / attack)
        out.append(math.sin(2 * math.pi * freq * t) * a * (1 - i / n) ** pw)
    return out


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("BF2 sounds:")

    # BELL — a deep brass strike: inharmonic partials with a long decay.
    b = bell(392, 1.6, attack=0.003)
    for f, g in [(588, 0.6), (790, 0.45), (1063, 0.3), (1390, 0.2)]:
        b = mix(b, [s * g for s in bell(f, 1.2, attack=0.003)], at=0.0)
    b = mix(b, [s * 0.5 for s in noise(0.08, 0.5, 2.0)], at=0.0)
    write(OUT / "bf2_bell.wav", b)

    # TOCK — a dry wooden tick (the reel alternates pitch by playing it twice).
    tk = click(900, 0.05, warmth=0.55)
    tk = mix(tk, [s * 0.5 for s in sine_env(420, 0.06, 0.002, 3.0)], at=0.0)
    write(OUT / "bf2_tock.wav", tk)

    # BUZZER — a raspy two-pulse buzz.
    bz = square(118, 0.22, 0.5, 0.4)
    bz = mix(bz, [s * 0.6 for s in square(176, 0.22, 0.3, 0.4)], at=0.0)
    bz = mix(bz, [s * 0.9 for s in square(118, 0.3, 0.5, 0.6)], at=0.27)
    bz = mix(bz, [s * 0.9 for s in square(176, 0.3, 0.3, 0.6)], at=0.27)
    write(OUT / "bf2_buzzer.wav", bz)

    # WHISTLE — a bright warble: 2.6 kHz with a fast pitch wobble.
    n = int(0.55 * SR)
    wh = []
    ph = 0.0
    for i in range(n):
        t = i / SR
        x = i / n
        f = 2650 + 220 * math.sin(2 * math.pi * 38 * t) + 250 * (1 - x)
        ph += 2 * math.pi * f / SR
        env = min(1.0, t / 0.015) * (1 - x) ** 0.6
        wh.append((math.sin(ph) * 0.8 + math.sin(ph * 2) * 0.12) * env)
    wh = mix(wh, [s * 0.18 for s in noise(0.5, 0.7, 0.8)], at=0.0)
    write(OUT / "bf2_whistle.wav", wh)

    # FLIP — a cascade of flip-card clacks, speeding up.
    fl: list[float] = []
    t = 0.0
    gap = 0.07
    for i in range(10):
        c = [s * (0.6 + 0.3 * random.random()) for s in click(random.choice([1100, 1400, 1800]), 0.016, warmth=0.5)]
        c = mix(c, [s * 0.3 for s in noise(0.02, 0.6, 2.0)], at=0.0)
        fl = mix(fl, c, at=t)
        t += gap
        gap = max(0.03, gap * 0.88)
    write(OUT / "bf2_flip.wav", fl)

    # GLITCH — stuttering digital bursts, then a falling whine.
    gl: list[float] = []
    for k, (f, at) in enumerate([(1900, 0.0), (900, 0.05), (2600, 0.09), (700, 0.16), (1500, 0.2)]):
        gl = mix(gl, [s * 0.5 for s in square(f, 0.035, 0.5, 0.2)], at=at)
    gl = mix(gl, [s * 0.35 for s in noise(0.25, 0.6, 1.0)], at=0.0)
    gl = mix(gl, [s * 0.55 for s in glide_tone(900, 70, 0.5, attack=0.01, release_pow=1.3, warmth=0.8, vibrato=0.06)], at=0.22)
    write(OUT / "bf2_glitch.wav", gl)

    # CHEER — a hall cheer: swell, claps and foot stomps.
    ch = noise(1.4, 0.12, 0.9)
    ch = [s * (math.sin(math.pi * min(1, i / (1.15 * len(ch)))) ** 0.9) * 0.9 for i, s in enumerate(ch)]
    for k in range(22):
        ch = mix(ch, [s * 0.4 for s in noise(0.025, 0.45, 1.5)], at=0.05 + k * 0.05 + random.uniform(0, 0.02))
    for at in (0.1, 0.45, 0.8):
        ch = mix(ch, [s * 0.7 for s in sine_env(80, 0.16, 0.003, 2.5)], at=at)
    ch = mix(ch, [s * 0.3 for s in glide_tone(340, 560, 1.0, attack=0.12, release_pow=1.2, warmth=0.4, vibrato=0.05)], at=0.05)
    write(OUT / "bf2_cheer.wav", ch)

    # OFF — power-down: a falling thrum and a thunk.
    off = glide_tone(520, 55, 0.7, attack=0.005, release_pow=1.2, warmth=0.7)
    off = mix(off, [s * 0.5 for s in sine_env(60, 0.25, 0.004, 2.0)], at=0.65)
    write(OUT / "bf2_off.wav", off)

    # ON — reboot: rising chirp, then a ping.
    on = glide_tone(180, 1400, 0.3, attack=0.01, release_pow=0.6, warmth=0.3)
    on = mix(on, [s * 0.7 for s in bell(1568, 0.5, attack=0.004)], at=0.3)
    on = mix(on, [s * 0.6 for s in bell(2093, 0.4, attack=0.004)], at=0.36)
    write(OUT / "bf2_on.wav", on)

    # STOPWATCH — a click and a tiny ratchet.
    sw = click(2400, 0.012, warmth=0.1)
    for k in range(5):
        sw = mix(sw, [s * 0.5 for s in click(3200, 0.008, warmth=0.1)], at=0.05 + k * 0.018)
    write(OUT / "bf2_stopwatch.wav", sw)

    # GASP — a quick intake of breath.
    gs = noise(0.28, 0.35, 0.8)
    gs = [s * math.sin(math.pi * min(1, i / (len(gs) * 0.9))) for i, s in enumerate(gs)]
    gs = mix(gs, [s * 0.25 for s in glide_tone(300, 520, 0.25, attack=0.05, release_pow=1.0, warmth=0.5)], at=0.02)
    write(OUT / "bf2_gasp.wav", gs)

    # POP — a tag popping on.
    pop = glide_tone(300, 900, 0.09, attack=0.004, release_pow=1.2, warmth=0.3)
    pop = mix(pop, [s * 0.5 for s in bell(1319, 0.2, attack=0.003)], at=0.05)
    write(OUT / "bf2_pop.wav", pop)

    # THUNK — a frozen stamp landing.
    th = sine_env(95, 0.24, 0.003, 2.2)
    th = mix(th, [s * 0.5 for s in noise(0.1, 0.3, 2.0)], at=0.0)
    th = mix(th, [s * 0.4 for s in bell(2200, 0.25, attack=0.002)], at=0.02)
    write(OUT / "bf2_thunk.wav", th)

    print("\nconverting to mp3…")
    for wav in OUT.glob("bf2_*.wav"):
        mp3 = wav.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), str(mp3)], check=True)
        wav.unlink()
    print("done.")


if __name__ == "__main__":
    main()
