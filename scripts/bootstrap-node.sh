#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="$(tr -d ' \n\r' <"$ROOT_DIR/.nvmrc")"

if [[ ! "$NODE_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Expected $ROOT_DIR/.nvmrc to be an exact semver (e.g. 24.13.1). Got: $NODE_VERSION" >&2
  exit 1
fi

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin) OS_NAME="darwin" ;;
  Linux) OS_NAME="linux" ;;
  *)
    echo "Unsupported OS: $OS" >&2
    exit 1
    ;;
esac

case "$ARCH" in
  arm64 | aarch64) ARCH_NAME="arm64" ;;
  x86_64 | amd64) ARCH_NAME="x64" ;;
  *)
    echo "Unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

DIST="node-v${NODE_VERSION}-${OS_NAME}-${ARCH_NAME}"
TARBALL="${DIST}.tar.gz"
URL="https://nodejs.org/dist/v${NODE_VERSION}/${TARBALL}"

DEST_DIR="$ROOT_DIR/.tools/node/$DIST"

if [[ -x "$DEST_DIR/bin/node" ]]; then
  echo "$DEST_DIR"
  exit 0
fi

mkdir -p "$ROOT_DIR/.tools/node"

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

echo "Downloading Node.js v$NODE_VERSION ($OS_NAME-$ARCH_NAME)..."
curl -fL --retry 3 --retry-delay 1 -o "$TMP_DIR/$TARBALL" "$URL"
tar -xzf "$TMP_DIR/$TARBALL" -C "$TMP_DIR"
mv "$TMP_DIR/$DIST" "$DEST_DIR"

echo "$DEST_DIR"

