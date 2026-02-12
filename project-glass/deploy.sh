#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Building..."
npm run build

# Next.js standalone mirrors the project path from the workspace root.
# Find server.js dynamically to handle any directory structure.
SERVER_JS=$(find .next/standalone -name "server.js" -not -path "*/node_modules/*" | head -1)

if [ -z "$SERVER_JS" ]; then
  echo "Error: server.js not found in .next/standalone/"
  exit 1
fi

STANDALONE_APP_DIR=$(dirname "$SERVER_JS")

echo "Copying static assets to $STANDALONE_APP_DIR ..."
cp -r public "$STANDALONE_APP_DIR/public"
cp -r .next/static "$STANDALONE_APP_DIR/.next/static"

echo "Restarting PM2..."
# Try to reload/restart; if it fails (not running), start from config
pm2 restart glass --update-env || pm2 start ecosystem.config.js

echo "Deploy complete."
