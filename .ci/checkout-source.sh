#!/usr/bin/env bash
set -euo pipefail

SOURCE_REF="${SOURCE_REF:?SOURCE_REF must be set}"
CI_REF="${CI_REF:-dev}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-master}"
UPSTREAM_REPOSITORY="${UPSTREAM_REPOSITORY:-v1cont/yad}"
UPSTREAM_GIT_URL="https://github.com/${UPSTREAM_REPOSITORY}.git"

# Remember the currently checked-out commit (PR head / push branch) so we can
# restore overlay paths after swapping in upstream C sources.
OVERLAY_SHA="$(git rev-parse HEAD)"

checkout_ref() {
  local ref="$1"

  if git fetch --no-tags origin "refs/heads/${ref}:refs/remotes/origin/_ci_source" 2>/dev/null; then
    git checkout --force refs/remotes/origin/_ci_source
    return 0
  fi

  if git fetch --no-tags origin "refs/tags/${ref}:refs/tags/_ci_source" 2>/dev/null; then
    git checkout --force refs/tags/_ci_source
    return 0
  fi

  if git fetch --no-tags "${UPSTREAM_GIT_URL}" "refs/tags/${ref}:refs/tags/_ci_upstream_source" 2>/dev/null; then
    git checkout --force refs/tags/_ci_upstream_source
    return 0
  fi

  if [[ "$ref" =~ ^[0-9a-fA-F]{40}$ ]]; then
    if git fetch --no-tags --depth=1 origin "${ref}" 2>/dev/null; then
      git checkout --force FETCH_HEAD
      return 0
    fi
  fi

  git fetch --no-tags origin "refs/heads/${UPSTREAM_BRANCH}:refs/remotes/origin/${UPSTREAM_BRANCH}"
  local commit
  if ! commit="$(git rev-parse --verify "${ref}^{commit}" 2>/dev/null)"; then
    echo "error: unable to resolve '${ref}' as a branch, tag, or commit" >&2
    return 1
  fi
  git checkout --force "$commit"
}

checkout_ref "${SOURCE_REF}"

# Restore CI scripts and the TypeScript package from the overlay commit.
# Fall back to CI_REF when the overlay commit does not contain those paths
# (e.g. a pure upstream SOURCE_REF checkout used outside the workflow).
restore_overlay() {
  local path="$1"
  if git cat-file -e "${OVERLAY_SHA}:${path}" 2>/dev/null; then
    git checkout "${OVERLAY_SHA}" -- "${path}"
    return 0
  fi
  git fetch --no-tags --depth=1 origin "refs/heads/${CI_REF}"
  git checkout "origin/${CI_REF}" -- "${path}"
}

restore_overlay .ci
restore_overlay ts
chmod +x .ci/*.sh

echo "Checked out ${SOURCE_REF} ($(git rev-parse --short=7 HEAD)) with overlay from ${OVERLAY_SHA:0:7} (.ci, ts)"
