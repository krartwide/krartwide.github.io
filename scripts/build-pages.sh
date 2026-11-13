#!/usr/bin/env bash
# Static export for GitHub Pages (https://krartwide.github.io/).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKUP="$(mktemp -d)"
restore() {
  if [[ -d "$BACKUP/api" ]]; then
    rm -rf src/app/api
    mv "$BACKUP/api" src/app/api
  fi
  rm -rf "$BACKUP"
}
trap restore EXIT

if [[ -d src/app/api ]]; then
  mv src/app/api "$BACKUP/api"
fi

export GITHUB_PAGES=true
npx next build

echo "Static site ready in out/ (site root)"
