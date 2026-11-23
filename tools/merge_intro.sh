#!/usr/bin/env bash
# Prepend the Vedaavi brand intro to a rendered episode — the DELIVERABLE is always intro+episode.
#
#   sh tools/merge_intro.sh out/e12_all_five_big_friends/all_five_big_friends_16x9.mp4 \
#                           out/e12_all_five_big_friends/e12_16x9.mp4
#
# The intro is chosen by the episode's own aspect (16x9 / 4x5 / 9x16) from out/intro/.
#
# VIDEO is joined by lossless stream-copy (concat demuxer) — every reel is rendered with the same
# codec/fps/pix_fmt as the intro (h264 High, 30 fps, yuvj420p), so no re-encode is needed.
#
# AUDIO is NOT stream-copied. The first version of this script copied the two AAC streams too and
# the join clicked: each AAC file carries its own encoder priming samples and the decoder sees a
# discontinuity at the splice ("some noise come between merger" — user, 2026-09-23). So both
# tracks are decoded, the intro's last 40 ms faded out and the episode's first 40 ms faded in,
# concatenated as one continuous PCM stream, and encoded ONCE to AAC. Two short fades on a
# near-silent intro tail and a breath before "Hello again!" are inaudible; the pop is not.
set -eu
IN="${1:?usage: sh tools/merge_intro.sh <episode.mp4> <out.mp4>}"
OUT="${2:?usage: sh tools/merge_intro.sh <episode.mp4> <out.mp4>}"

# plain $(...) — this runs under `sh`, where bash's `< <(...)` is a syntax error;
# glob match — ffprobe's csv writer appends a trailing separator ("1920x1080x")
DIMS=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$IN")
case "$DIMS" in
  1920x1080*) ASPECT=16x9 ;;
  1080x1350*) ASPECT=4x5 ;;
  1080x1920*) ASPECT=9x16 ;;
  *) echo "merge_intro.sh: no intro for ${DIMS}" >&2; exit 1 ;;
esac
INTRO="out/intro/vedaavi_intro_${ASPECT}.mp4"
[ -f "$INTRO" ] || { echo "merge_intro.sh: missing $INTRO" >&2; exit 1; }

INTRO_ABS="$(cd "$(dirname "$INTRO")" && pwd)/$(basename "$INTRO")"
IN_ABS="$(cd "$(dirname "$IN")" && pwd)/$(basename "$IN")"
# THE INTRO SOURCE FILES CLICK. All three vedaavi_intro_*.mp4 carry the same 6 ms tick at
# 4.715–4.721 s (peak −35 dB against near-silence) — after its music has already ended (nothing
# above −45 dB from 4.20 s on except that tick). A seam fade at the very end cannot reach it, so the
# intro's audio is faded to true silence BY 4.60 s: 4.30 → 4.60, then zero through the seam.
# Measured 2026-09-24; if the intro is ever re-exported, re-measure (see the peak scan in the
# E12 checklist memory) before trusting these two numbers.
INTRO_FADE_AT=4.30
INTRO_FADE_LEN=0.30
FADE=0.04

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
printf "file '%s'\nfile '%s'\n" "$INTRO_ABS" "$IN_ABS" > "$TMP/list.txt"

# 1. video: lossless join
ffmpeg -y -v error -f concat -safe 0 -i "$TMP/list.txt" -c:v copy -an "$TMP/video.mp4"

# 2. audio: decode both, fade the seam, join as one continuous stream, encode once
ffmpeg -y -v error -i "$INTRO_ABS" -i "$IN_ABS" -filter_complex \
  "[0:a]afade=t=out:st=${INTRO_FADE_AT}:d=${INTRO_FADE_LEN}[a0];[1:a]afade=t=in:st=0:d=${FADE}[a1];[a0][a1]concat=n=2:v=0:a=1[a]" \
  -map "[a]" -c:a aac -b:a 320k -ar 48000 -ac 2 "$TMP/audio.m4a"

# 3. mux
mkdir -p "$(dirname "$OUT")"
ffmpeg -y -v error -i "$TMP/video.mp4" -i "$TMP/audio.m4a" -map 0:v -map 1:a -c copy -movflags +faststart "$OUT"
echo "→ $INTRO + $IN  ->  $OUT   (video copy, audio re-encoded with ${FADE}s seam fades)"
