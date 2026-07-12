#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

: "${DEB_VERSION:?DEB_VERSION must be set}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY must be set}"

ARTIFACT_DIR="${ARTIFACT_DIR:-$ROOT_DIR/artifacts}"
APT_WORKDIR="$(mktemp -d)"
APT_BRANCH="${APT_BRANCH:-apt}"
APT_CODENAME="${APT_CODENAME:-stable}"
REPO_SLUG="${GITHUB_REPOSITORY##*/}"
REPO_OWNER="${GITHUB_REPOSITORY%%/*}"
APT_BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_SLUG}/refs/heads/${APT_BRANCH}"

cleanup() {
  rm -rf "$APT_WORKDIR"
}
trap cleanup EXIT

git config --global user.name "${GIT_USER_NAME:-github-actions[bot]}"
git config --global user.email "${GIT_USER_EMAIL:-41898282+github-actions[bot]@users.noreply.github.com}"

REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"

if git ls-remote --heads "$REMOTE_URL" "$APT_BRANCH" | grep -q "$APT_BRANCH"; then
  git clone --branch "$APT_BRANCH" --depth 1 "$REMOTE_URL" "$APT_WORKDIR/repo"
else
  mkdir -p "$APT_WORKDIR/repo"
  git -C "$APT_WORKDIR/repo" init -b "$APT_BRANCH"
fi

cd "$APT_WORKDIR/repo"

mkdir -p conf
SIGN_KEY_ID=""

if [[ -n "${APT_REPO_GPG_PRIVATE_KEY:-}" ]]; then
  export GNUPGHOME="$APT_WORKDIR/gnupg"
  mkdir -p "$GNUPGHOME"
  chmod 700 "$GNUPGHOME"
  echo "$APT_REPO_GPG_PRIVATE_KEY" | gpg --batch --import
  SIGN_KEY_ID="$(gpg --list-secret-keys --with-colons | awk -F: '/^sec:/ {print $5; exit}')"
  gpg --armor --export "$SIGN_KEY_ID" > yad-apt.gpg.key
fi

{
  cat <<EOF
Codename: ${APT_CODENAME}
Components: main
Architectures: amd64 arm64 source
Label: YAD APT Repository
Description: YAD packages built from ${GITHUB_REPOSITORY}
EOF
  if [[ -n "$SIGN_KEY_ID" ]]; then
    echo "SignWith: ${SIGN_KEY_ID}"
  fi
} > conf/distributions

cat > conf/options <<'EOF'
verbose
basedir .
EOF

if [[ -f yad-apt.gpg.key ]]; then
  APT_INSTALL="sudo mkdir -p /etc/apt/keyrings
curl -fsSL ${APT_BASE_URL}/yad-apt.gpg.key | sudo tee /etc/apt/keyrings/yad-apt.gpg >/dev/null
echo \"deb [signed-by=/etc/apt/keyrings/yad-apt.gpg] ${APT_BASE_URL} ${APT_CODENAME} main\" | sudo tee /etc/apt/sources.list.d/yad.list"
else
  APT_INSTALL="echo \"deb [trusted=yes] ${APT_BASE_URL} ${APT_CODENAME} main\" | sudo tee /etc/apt/sources.list.d/yad.list"
fi

cat > README.md <<EOF
# YAD APT repository

Binary packages for YAD built automatically from commits on \`master\`.

\`\`\`sh
${APT_INSTALL}
sudo apt update
sudo apt install yad
\`\`\`
EOF

shopt -s nullglob
debs=( "$ARTIFACT_DIR"/*.deb )
if (( ${#debs[@]} == 0 )); then
  echo "No .deb packages found in ${ARTIFACT_DIR}" >&2
  exit 1
fi

for deb in "${debs[@]}"; do
  reprepro -b . includedeb "$APT_CODENAME" "$deb"
done

git add -A
if git diff --cached --quiet; then
  echo "APT repository is already up to date"
  exit 0
fi

git commit -m "Update APT repository for ${DEB_VERSION}"
git push "$REMOTE_URL" "HEAD:${APT_BRANCH}"
