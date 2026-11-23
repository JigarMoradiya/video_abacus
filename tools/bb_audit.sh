#!/bin/sh
# usage: sh tools/bb_audit.sh src/reels/e07_cloud_castle.tsx
set -e
sed "s#REEL_PATH#../$1#" tools/bb_audit.ts > tools/_bb_audit_tmp.ts
npx esbuild tools/_bb_audit_tmp.ts --bundle --platform=node --outfile=/tmp/bb_audit.cjs --loader:.png=dataurl --loader:.mp3=dataurl --loader:.svg=dataurl --log-level=error
node /tmp/bb_audit.cjs
rm -f tools/_bb_audit_tmp.ts
