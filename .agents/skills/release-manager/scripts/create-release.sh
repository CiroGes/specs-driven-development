#!/usr/bin/env bash
set -euo pipefail

VERSION=""
BRANCH="main"
NOTES_MODE="auto"
NOTES_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --version)
      VERSION="$2"
      shift 2
      ;;
    --branch)
      BRANCH="$2"
      shift 2
      ;;
    --notes)
      NOTES_MODE="$2"
      shift 2
      ;;
    --notes-file)
      NOTES_FILE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$VERSION" ]]; then
  echo "Usage: create-release.sh --version vX.Y.Z [--branch main] [--notes auto|manual] [--notes-file FILE]"
  exit 1
fi

if [[ "$NOTES_MODE" != "auto" && "$NOTES_MODE" != "manual" ]]; then
  echo "--notes must be auto or manual"
  exit 1
fi

if [[ "$NOTES_MODE" == "manual" && -z "$NOTES_FILE" ]]; then
  echo "--notes-file is required when --notes manual"
  exit 1
fi

TAG="$VERSION"
if [[ "$TAG" != v* ]]; then
  TAG="v$TAG"
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree is dirty. Commit or stash changes first."
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  echo "Current branch is '$CURRENT_BRANCH'. Expected '$BRANCH'."
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Tag already exists: $TAG"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

node "$SCRIPT_DIR/bump-version.mjs" --version "$TAG"
node "$SCRIPT_DIR/generate-changelog.mjs" --version "$TAG"

git add package.json
if [[ -f package-lock.json ]]; then
  git add package-lock.json
fi
if [[ -f CHANGELOG.md ]]; then
  git add CHANGELOG.md
fi

git commit -m "chore(release): $TAG"
git tag -a "$TAG" -m "$TAG"

git push origin "$BRANCH"
git push origin "$TAG"

if command -v gh >/dev/null 2>&1; then
  if [[ "$NOTES_MODE" == "auto" ]]; then
    gh release create "$TAG" --generate-notes
  else
    gh release create "$TAG" --notes-file "$NOTES_FILE"
  fi
  echo "GitHub release published: $TAG"
else
  echo "gh CLI not found. Tag pushed, but GitHub release was not created automatically."
fi
