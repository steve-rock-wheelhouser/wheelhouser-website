#!/bin/bash
# Puller: robustly fetch and pull the current branch for Wheelhouser-Website

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📥 Fetching latest changes from remotes..."
git fetch --all --prune || echo "⚠️ git fetch had problems; continuing..."

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch: $BRANCH"

REMOTE="origin"
echo "🔍 Checking for origin/$BRANCH..."
if git rev-parse --verify --quiet refs/remotes/$REMOTE/$BRANCH >/dev/null; then
    echo "Found remote branch $REMOTE/$BRANCH"
else
    echo "⚠️ $REMOTE/$BRANCH not found; attempting pull from $REMOTE/$BRANCH anyway."
fi

echo "🔄 Pulling updates from $REMOTE/$BRANCH..."
if git pull --ff-only "$REMOTE" "$BRANCH" 2>/dev/null; then
    echo "✅ Successfully fast-forwarded to the latest version!"
    exit 0
fi

echo "🔄 Fast-forward not possible; attempting pull with rebase and autostash..."
if git pull --rebase --autostash "$REMOTE" "$BRANCH" 2>/dev/null; then
    echo "✅ Successfully rebased on top of $REMOTE/$BRANCH!"
    exit 0
fi

if git pull --no-rebase --autostash "$REMOTE" "$BRANCH" 2>/dev/null; then
    echo "✅ Successfully merged updates from $REMOTE/$BRANCH!"
    exit 0
fi

echo "❌ Error: Pull failed. You may have conflicting changes that need manual resolution."
git status -s
exit 1
