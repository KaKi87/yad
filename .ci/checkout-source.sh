#!/usr/bin/env bash
set -euo pipefail

SOURCE_REF="${SOURCE_REF:?SOURCE_REF must be set}"
CI_REF="${CI_REF:-dev}"

git fetch --no-tags origin "${SOURCE_REF}"
git checkout --force FETCH_HEAD

git fetch --no-tags --depth=1 origin "${CI_REF}"
git checkout "origin/${CI_REF}" -- .ci
chmod +x .ci/*.sh

echo "Checked out ${SOURCE_REF} ($(git rev-parse --short=7 HEAD)) with CI scripts from ${CI_REF}"
