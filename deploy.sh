#!/bin/sh
# 把 little-habitats/ 直接推到 Cloudflare Pages（项目 little-island）
# 用法：./deploy.sh
set -eu

cd "$(dirname "$0")"

if ! command -v npx >/dev/null 2>&1; then
  echo "找不到 npx：需要先装 Node.js（18 或更高）。" >&2
  exit 1
fi

if [ ! -f little-habitats/index.html ]; then
  echo "little-habitats/index.html 不见了，确认一下目录。" >&2
  exit 1
fi

exec npx --yes wrangler@latest pages deploy little-habitats \
  --project-name little-island \
  --branch main \
  --commit-dirty=true
