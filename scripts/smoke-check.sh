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

ROBOTS_TXT="$(curl -fsSL --max-time 20 "$BASE_URL/robots.txt")"
FR_HTML="$(curl -fsSL --max-time 20 "$BASE_URL/fr/windows/pvc/")"
DE_HTML="$(curl -fsSL --max-time 20 "$BASE_URL/de/windows/pvc/")"
SITEMAP_XML="$(curl -fsSL --max-time 20 "$BASE_URL/sitemap.xml")"

# Ensure the HTML references a real build artifact (prevents partial deploys where
# HTML from an older build points to deleted chunk files).
FR_CSS="$(python3 -c "import re,sys; html=sys.stdin.read(); m=re.search(r'rel=\"stylesheet\" href=\"([^\"]+)\"', html); print(m.group(1) if m else '')" 2>/dev/null <<<\"$FR_HTML\" || true)"
if [[ -z "$FR_CSS" ]]; then
  echo "Missing stylesheet link in $BASE_URL/fr/windows/pvc/" >&2
  exit 1
fi
check_url "$BASE_URL$FR_CSS"

FR_JS="$(python3 -c "import re,sys; html=sys.stdin.read(); m=re.search(r'src=\"(/_next/static/chunks/[^\"]+\\.js)\"', html); print(m.group(1) if m else '')" 2>/dev/null <<<\"$FR_HTML\" || true)"
if [[ -z "$FR_JS" ]]; then
  echo "Missing script chunk link in $BASE_URL/fr/windows/pvc/" >&2
  exit 1
fi
check_url "$BASE_URL$FR_JS"

if [[ "${SMOKE_EXPECT_NOINDEX:-}" == "1" ]]; then
  # Avoid pipelines here to prevent SIGPIPE when grep exits early under `set -o pipefail`.
  grep -Eiq '^Disallow:\s*/\s*$' <<<"$ROBOTS_TXT"
  grep -Eiq '<meta[^>]*name="robots"[^>]*content="[^"]*noindex' <<<"$FR_HTML"
fi

grep -Eiq 'rel="canonical"[^>]*href="[^"]*/fr/windows/pvc/?' <<<"$FR_HTML"
grep -Eiq 'rel="alternate"[^>]*href[Ll]ang="de"[^>]*href="[^"]*/de/windows/pvc/?' <<<"$FR_HTML"
grep -Eiq 'rel="canonical"[^>]*href="[^"]*/de/windows/pvc/?' <<<"$DE_HTML"
grep -Eiq 'rel="alternate"[^>]*href[Ll]ang="fr"[^>]*href="[^"]*/fr/windows/pvc/?' <<<"$DE_HTML"
grep -Eq '/fr/' <<<"$SITEMAP_XML"
grep -Eq '/de/' <<<"$SITEMAP_XML"

echo "Smoke checks passed for $BASE_URL"
