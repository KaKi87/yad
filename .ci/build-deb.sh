#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${DEB_VERSION:?DEB_VERSION must be set (run .ci/set-version.sh first)}"

ARTIFACT_DIR="${ARTIFACT_DIR:-$ROOT_DIR/artifacts}"
BUILD_ROOT="$(mktemp -d)"

cleanup() {
  rm -rf "$BUILD_ROOT"
}
trap cleanup EXIT

mkdir -p "$ARTIFACT_DIR"
cp -a "$ROOT_DIR/." "$BUILD_ROOT/yad"

cd "$BUILD_ROOT/yad"

export DEBFULLNAME="${DEBFULLNAME:-YAD CI}"
export DEBEMAIL="${DEBEMAIL:-ci@yad.local}"

dch --newversion "$DEB_VERSION" \
  --distribution stable \
  --force-distribution \
  --force-bad-version \
  "Automated CI build from ${GITHUB_SHA:-local}" < /dev/null

dpkg-buildpackage -us -uc -b

shopt -s nullglob
for deb in "$BUILD_ROOT"/*.deb; do
  cp -v "$deb" "$ARTIFACT_DIR/"
done

ls -la "$ARTIFACT_DIR"
