#!/usr/bin/env bash
set -e

PROJECT_DIR="/var/www/visionoftrad_usr/projects/vision-site"
WEB_DIR="/var/www/visionoftrad_usr/data/www/visionoftrading.com"
OWNER="visionoftrad_usr:visionoftrad_usr"

cd "$PROJECT_DIR"

echo "==> Install deps (if needed)"
npm install

echo "==> Build"
npm run build

echo "==> Deploy dist -> web dir"
sudo rsync -av --delete dist/ "$WEB_DIR/"

echo "==> Fix permissions"
sudo chown -R $OWNER "$WEB_DIR"

echo "✅ Done"
