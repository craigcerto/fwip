#!/bin/bash
# Sync config JSON files from TypeScript (canonical) to Python package.
# Run from the repo root: ./scripts/sync-configs.sh

set -e

SRC="typescript/src/configs"
DST="python/refrase/configs"

if [ ! -d "$SRC" ]; then
  echo "Error: Source directory $SRC not found. Run from repo root."
  exit 1
fi

mkdir -p "$DST"
cp "$SRC"/*.json "$DST"/
echo "Synced $(ls "$DST"/*.json | wc -l | tr -d ' ') configs from $SRC to $DST"

# Verify parity
DIFF=$(diff <(cd "$SRC" && md5 *.json 2>/dev/null || md5sum *.json) <(cd "$DST" && md5 *.json 2>/dev/null || md5sum *.json) 2>/dev/null || true)
if [ -z "$DIFF" ]; then
  echo "Configs are identical."
else
  echo "Warning: Config mismatch detected!"
  echo "$DIFF"
  exit 1
fi
