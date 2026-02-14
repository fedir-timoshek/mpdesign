#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-}"

if [[ -z "$BASE_URL" ]]; then
  echo "Usage: scripts/smoke-check.sh <base-url>" >&2
  exit 1
fi

BASE_URL="${BASE_URL%/}"

check_url() {
  local url="$1"
  curl -fsS --max-time 20 "$url" >/dev/null
  echo "ok $url"
}

echo "Running smoke checks for $BASE_URL"
check_url "$BASE_URL/robots.txt"
check_url "$BASE_URL/sitemap.xml"
check_url "$BASE_URL/fr/"
check_url "$BASE_URL/de/"
check_url "$BASE_URL/fr/windows/pvc/"
check_url "$BASE_URL/de/windows/pvc/"
check_url "$BASE_URL/fr/doors/"
check_url "$BASE_URL/de/doors/"

FR_HTML="$(curl -fsSL --max-time 20 "$BASE_URL/fr/windows/pvc/")"
DE_HTML="$(curl -fsSL --max-time 20 "$BASE_URL/de/windows/pvc/")"
SITEMAP_XML="$(curl -fsSL --max-time 20 "$BASE_URL/sitemap.xml")"

echo "$FR_HTML" | grep -Eiq 'rel="canonical"[^>]*href="[^"]*/fr/windows/pvc/?'
echo "$FR_HTML" | grep -Eiq 'rel="alternate"[^>]*href[Ll]ang="de"[^>]*href="[^"]*/de/windows/pvc/?'
echo "$DE_HTML" | grep -Eiq 'rel="canonical"[^>]*href="[^"]*/de/windows/pvc/?'
echo "$DE_HTML" | grep -Eiq 'rel="alternate"[^>]*href[Ll]ang="fr"[^>]*href="[^"]*/fr/windows/pvc/?'
echo "$SITEMAP_XML" | grep -Eq '/fr/'
echo "$SITEMAP_XML" | grep -Eq '/de/'

echo "Smoke checks passed for $BASE_URL"
