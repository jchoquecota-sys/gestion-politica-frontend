#!/usr/bin/env bash
# Deploy frontend en el VPS. Ejecutar desde /var/www/gestion-politica-frontend
set -euo pipefail

# Normalizar CRLF si el repo se editó en Windows
sed -i 's/\r$//' "set -euo pipefail
" 2>/dev/null || true

APP_DIR="${APP_DIR:-/var/www/gestion-politica-frontend}"
REMOTE="${DEPLOY_REMOTE:-mio}"
BRANCH="${DEPLOY_BRANCH:-main}"
PM2_APP="${PM2_APP:-gp-frontend}"

cd "$APP_DIR"

echo "==> [frontend] Fetch $REMOTE/$BRANCH"
git remote get-url "$REMOTE" >/dev/null 2>&1 || \
  git remote add "$REMOTE" https://github.com/jchoquecota-sys/gestion-politica-frontend.git

git fetch "$REMOTE" "$BRANCH"
git reset --hard "$REMOTE/$BRANCH"

echo "==> [frontend] Instalar dependencias"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1536}"
npm ci

echo "==> [frontend] Build"
npm run build

echo "==> [frontend] Reiniciar PM2 ($PM2_APP)"
pm2 restart "$PM2_APP" --update-env
pm2 save || true

echo "==> [frontend] OK $(git rev-parse --short HEAD)"
