#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Fehlt: $1" >&2
    exit 1
  fi
}

require_cmd git
require_cmd gh
require_cmd jq
require_cmd npm

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI ist nicht angemeldet. Fuehre zuerst 'gh auth login' aus." >&2
  exit 1
fi

if ! npx wrangler whoami --json >/tmp/wrangler-whoami.json 2>/dev/null; then
  echo "Wrangler ist nicht angemeldet. Fuehre zuerst 'npx wrangler login' aus." >&2
  exit 1
fi

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
if [ -z "$ACCOUNT_ID" ]; then
  ACCOUNT_ID="$(jq -r '.accounts[0].id // empty' /tmp/wrangler-whoami.json)"
fi

if [ -z "$ACCOUNT_ID" ]; then
  echo "Konnte keine Cloudflare Account ID ermitteln." >&2
  exit 1
fi

API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"
if [ -z "$API_TOKEN" ]; then
  if ! npx wrangler auth token --json >/tmp/wrangler-auth-token.json 2>/dev/null; then
    echo "Konnte kein Cloudflare Token lesen. Setze CLOUDFLARE_API_TOKEN und starte erneut." >&2
    exit 1
  fi

  TOKEN_TYPE="$(jq -r '.type // empty' /tmp/wrangler-auth-token.json)"
  if [ "$TOKEN_TYPE" = "api_token" ]; then
    API_TOKEN="$(jq -r '.token // empty' /tmp/wrangler-auth-token.json)"
  fi
fi

if [ -z "$API_TOKEN" ]; then
  echo "GitHub Actions braucht ein Cloudflare API Token." >&2
  echo "Setze CLOUDFLARE_API_TOKEN und starte das Skript erneut." >&2
  exit 1
fi

REPO_SLUG="${GITHUB_REPOSITORY:-}"
if [ -z "$REPO_SLUG" ]; then
  REMOTE_URL="$(git remote get-url origin)"
  REPO_SLUG="$(printf '%s\n' "$REMOTE_URL" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
fi

if [ -z "$REPO_SLUG" ]; then
  echo "Konnte das GitHub Repository nicht aus 'origin' ableiten." >&2
  exit 1
fi

gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$REPO_SLUG" --body "$ACCOUNT_ID"
gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO_SLUG" --body "$API_TOKEN"

if [ -n "${GITHUB_OAUTH_ID:-}" ]; then
  gh secret set GITHUB_OAUTH_ID --repo "$REPO_SLUG" --body "$GITHUB_OAUTH_ID"
fi

if [ -n "${GITHUB_OAUTH_SECRET:-}" ]; then
  gh secret set GITHUB_OAUTH_SECRET --repo "$REPO_SLUG" --body "$GITHUB_OAUTH_SECRET"
fi

echo "GitHub Secrets gesetzt fuer $REPO_SLUG"
echo "  CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID"
echo "  CLOUDFLARE_API_TOKEN=<redacted>"
if [ -n "${GITHUB_OAUTH_ID:-}" ]; then
  echo "  GITHUB_OAUTH_ID=<redacted>"
fi
if [ -n "${GITHUB_OAUTH_SECRET:-}" ]; then
  echo "  GITHUB_OAUTH_SECRET=<redacted>"
fi
echo
echo "Naechster Schritt:"
echo "  git push origin main"
