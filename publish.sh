#!/bin/bash

# --- CONFIGURATION ---
GITHUB_USER="steve-rock-wheelhouser"
GITHUB_REPO="wheelhouser-website"

# READ TOKEN SECURELY (DO NOT HARDCODE!)
if [ -f ".token" ]; then
    GITHUB_TOKEN=$(cat .token)
else
    echo "Error: .token file not found!"
    exit 1
fi
# ---------------------

# 1. Initialize Git if it's not already there
if [ ! -d ".git" ]; then
    echo "Initializing new git repository..."
    git init
    git branch -M main
fi

# 2. Configure the Remote URL with the Token (Auth-Embedded)
# This allows pushing without a password prompt
REMOTE_URL="https://$GITHUB_USER:$GITHUB_TOKEN@github.com/$GITHUB_USER/$GITHUB_REPO.git"

# Check if remote 'origin' exists, if not add it, if yes update it
if git remote get-url origin > /dev/null 2>&1; then
    git remote set-url origin "$REMOTE_URL"
else
    git remote add origin "$REMOTE_URL"
fi

# 3. Add all files
echo "Adding files..."
git add .

# 4. Commit with a timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "Committing changes for $TIMESTAMP..."
git commit -m "Website update: $TIMESTAMP"

# 5. Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo "Done! Website published to https://github.com/$GITHUB_USER/$GITHUB_REPO"