#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

UPSTREAM_VERSION="$(grep '^AC_INIT' configure.ac | sed -E 's/^AC_INIT\(\[[^]]+\], \[([^]]+)\].*/\1/')"
SOURCE_SHA="$(git rev-parse HEAD)"
SHORT_SHA="${SOURCE_SHA:0:7}"
DEB_VERSION="${UPSTREAM_VERSION}-1+git${SHORT_SHA}"

export UPSTREAM_VERSION DEB_VERSION SHORT_SHA SOURCE_SHA

echo "Package version set to ${DEB_VERSION}"

if [[ -n "${GITHUB_ENV:-}" ]]; then
  {
    echo "UPSTREAM_VERSION=${UPSTREAM_VERSION}"
    echo "DEB_VERSION=${DEB_VERSION}"
    echo "SHORT_SHA=${SHORT_SHA}"
  } >> "$GITHUB_ENV"
fi
