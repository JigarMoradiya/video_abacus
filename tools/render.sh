#!/usr/bin/env bash
# Render a composition into the video-wise out/ layout.
#
#   sh tools/render.sh c-k-ck-4x5      ->  out/c_k_ck/c_k_ck_4x5.mp4
#   sh tools/render.sh ai-ay           ->  out/ai_ay/ai_ay_9x16.mp4
#   sh tools/render.sh short-vowels    ->  out/short_vowels/short_vowels_16x9.mp4
#
# The folder is ONE per video and every aspect of that video lives in it:
#
#   out/<video>/<video>_16x9.mp4     YouTube
#   out/<video>/<video>_4x5.mp4      Facebook
#   out/<video>/<video>_9x16.mp4     Shorts / Reels / Instagram
#   out/<video>/yt_thumb_16x9.png    YouTube thumbnail
#   out/<video>/fb_thumb_9x16.png    Facebook thumbnail
#
# The aspect is read from the COMPOSITION's real size, never from the id, so an id that
# omits its aspect (ai-ay is 1080x1920) still lands in the right file. Deriving the path
# here instead of hard-coding ~30 package.json lines means the layout cannot drift.
set -eu
ID="${1:?usage: sh tools/render.sh <composition-id> [extra remotion args...]}"
shift || true

SIZE=$(npx remotion compositions 2>/dev/null | awk -v id="$ID" '$1 == id {print $3; exit}')
[ -n "$SIZE" ] || { echo "render.sh: no composition '$ID' (check src/reels/index.ts)" >&2; exit 1; }

case "$SIZE" in
  1920x1080) ASPECT=16x9 ;;
  1080x1350) ASPECT=4x5 ;;
  1080x1920) ASPECT=9x16 ;;
  1080x1080) ASPECT=1x1 ;;
  *) echo "render.sh: unmapped size $SIZE for '$ID' — add it to the case above" >&2; exit 1 ;;
esac

# video name = id with hyphens -> underscores, minus a trailing aspect suffix
BASE=$(printf '%s' "$ID" | sed -E 's/-(16x9|9x16|4x5|1x1)$//' | tr '-' '_')
DIR="out/$BASE"

# CURRICULUM EPISODES live in out/eNN_<slug>/ — the episode number first, matching the audio
# folder (public/audio/e0NN_<slug>) so the two sort together. Composition ids carry no number
# (big-friend-intro, all-five-big-friends), so the prefix is mapped here. Add a line per episode.
#
# An episode's ONLY saved file is the intro-merged one (out/eNN_<slug>/eNN_<aspect>.mp4). The raw
# render goes to a temp folder, tools/merge_intro.sh prepends the Vedaavi intro, and the raw is
# deleted — so the folder never holds a second, intro-less copy that could be sent by mistake.
EP=""
case "$BASE" in
  big_friend_intro)      DIR="out/e11_big_friend_intro";      EP=e11 ;;
  all_five_big_friends)  DIR="out/e12_all_five_big_friends";  EP=e12 ;;
  big_friend_taking_away) DIR="out/e13_big_friend_taking_away"; EP=e13 ;;
  big_friend_recap)       DIR="out/e14_big_friend_recap";       EP=e14 ;;
  family_plus)            DIR="out/e15_family_plus";            EP=e15 ;;
esac
mkdir -p "$DIR"

if [ -z "$EP" ]; then
  OUT="$DIR/${BASE}_${ASPECT}.mp4"
  echo "→ $ID  ($SIZE)  ->  $OUT"
  npx remotion render "$ID" "$OUT" "$@"
  exit 0
fi

RAW_DIR=$(mktemp -d)
trap 'rm -rf "$RAW_DIR"' EXIT
RAW="$RAW_DIR/${BASE}_${ASPECT}.mp4"
OUT="$DIR/${EP}_${ASPECT}.mp4"
echo "→ $ID  ($SIZE)  ->  $OUT  (intro merged; raw render not kept)"
npx remotion render "$ID" "$RAW" "$@"
sh tools/merge_intro.sh "$RAW" "$OUT"
