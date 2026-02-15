#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_DIR="$("$ROOT_DIR/scripts/bootstrap-node.sh")"

export PATH="$NODE_DIR/bin:$PATH"
exec "$NODE_DIR/bin/npm" "$@"
