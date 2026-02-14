#!/usr/bin/env bash
set -euo pipefail

# Wrapper around Codex Playwright CLI that:
# - pins Node via nvm (so `npx` is always available)
# - uses a stable session name
# - lets us save/load auth state to avoid re-login/2FA loops
#
# IMPORTANT: storage state contains cookies/localStorage. It MUST NOT be committed.
# We keep it under `output/playwright/` which is gitignored.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SESSION="${SESSION:-mpdesign}"
STATE_FILE="${STATE_FILE:-$ROOT_DIR/output/playwright/google-storage-state.json}"

export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"

# Ensure Node/npm/npx are available (nvm-installed)
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"
  nvm use 24 >/dev/null
fi

mkdir -p "$(dirname "$STATE_FILE")"

cmd="${1:-}"
shift || true

case "$cmd" in
  open)
    # Always open headed for Google sign-in reliability.
    # If we already have a saved state, load it first to avoid re-login/2FA loops.
    url="${1:-}"
    if [[ -f "$STATE_FILE" ]]; then
      "$PWCLI" --session "$SESSION" open --headed
      "$PWCLI" --session "$SESSION" state-load "$STATE_FILE"
      if [[ -n "$url" ]]; then
        "$PWCLI" --session "$SESSION" goto "$url"
      fi
    else
      "$PWCLI" --session "$SESSION" open "$@" --headed
    fi
    ;;
  save-state)
    "$PWCLI" --session "$SESSION" state-save "$STATE_FILE"
    echo "Saved storage state to: $STATE_FILE"
    ;;
  load-state)
    if [[ ! -f "$STATE_FILE" ]]; then
      echo "No storage state file found at: $STATE_FILE" >&2
      echo "Open + login once, then run: scripts/pwcli.sh save-state" >&2
      exit 1
    fi
    "$PWCLI" --session "$SESSION" state-load "$STATE_FILE"
    ;;
  ""|-h|--help|help)
    cat <<EOF
Usage:
  scripts/pwcli.sh open <url>         Open browser (headed) in stable session
  scripts/pwcli.sh save-state         Save cookies/localStorage to avoid re-login
  scripts/pwcli.sh load-state         Restore cookies/localStorage
  scripts/pwcli.sh <pwcli-cmd> [...]  Pass-through to playwright-cli

Examples:
  scripts/pwcli.sh open https://docs.google.com
  scripts/pwcli.sh load-state
  scripts/pwcli.sh goto https://docs.google.com/spreadsheets/d/<id>/edit
  scripts/pwcli.sh snapshot

Env vars:
  SESSION=mpdesign
  STATE_FILE=$ROOT_DIR/output/playwright/google-storage-state.json
EOF
    ;;
  *)
    "$PWCLI" --session "$SESSION" "$cmd" "$@"
    ;;
esac
