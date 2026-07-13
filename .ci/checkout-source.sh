#!/usr/bin/env bash
set -euo pipefail

SOURCE_REF="${SOURCE_REF:?SOURCE_REF must be set}"
CI_REF="${CI_REF:-dev}"
UPSTREAM_BRANCH="${UPSTREAM_BRANCH:-master}"
UPSTREAM_REPOSITORY="${UPSTREAM_REPOSITORY:-v1cont/yad}"
UPSTREAM_GIT_URL="https://github.com/${UPSTREAM_REPOSITORY}.git"

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

git fetch --no-tags --depth=1 origin "refs/heads/${CI_REF}"
git checkout "origin/${CI_REF}" -- .ci
chmod +x .ci/*.sh

echo "Checked out ${SOURCE_REF} ($(git rev-parse --short=7 HEAD)) with CI scripts from ${CI_REF}"
