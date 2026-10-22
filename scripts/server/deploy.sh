#!/bin/sh
# Builds and (re)starts the production stack. Run from anywhere on the server:
#
#   sh scripts/server/deploy.sh --first-run   # first deployment only
#   sh scripts/server/deploy.sh               # every later update (after git pull)
#
# Every run: build images, start PostgreSQL, apply migrations (as the
# migration role), then start/refresh web, cms, caddy and cloudflared.
# --first-run also loads the structure and the site copy as DRAFTS (nothing is
# published) and creates the first Super Admin from SUPERADMIN_EMAIL /
# SUPERADMIN_PASSWORD given on the command line, e.g.:
#   SUPERADMIN_EMAIL=you@example.com SUPERADMIN_PASSWORD='long-passphrase' \
#     sh scripts/server/deploy.sh --first-run
set -eu

cd "$(dirname "$0")/../.."
[ -f .env ] || { echo "No .env: run scripts/server/generate-env.sh first." >&2; exit 1; }
FIRST_RUN=0
[ "${1:-}" = "--first-run" ] && FIRST_RUN=1

# Values needed to build the migration connection string.
set -a
# shellcheck disable=SC1091
. ./.env
set +a
[ -n "${CLOUDFLARE_TUNNEL_TOKEN:-}" ] || echo "Warning: CLOUDFLARE_TUNNEL_TOKEN is empty; the admin (admin.protosoftdev.com) will not be reachable until it is set." >&2

C="docker compose -f docker-compose.production.yml"

echo "==> Building images"
$C build web cms

echo "==> Starting PostgreSQL"
$C up -d --wait postgres

echo "==> Applying database migrations"
$C run --rm --no-deps \
  -e DATABASE_URI="postgresql://${POSTGRES_MIGRATE_USER}:${POSTGRES_MIGRATE_PASSWORD}@postgres:5432/${POSTGRES_DB}" \
  cms npm run migrate -w @protocol-soft/cms -- --force-accept-warning

if [ "$FIRST_RUN" = 1 ]; then
  : "${SUPERADMIN_EMAIL:?Set SUPERADMIN_EMAIL for the first Super Admin}"
  : "${SUPERADMIN_PASSWORD:?Set SUPERADMIN_PASSWORD (12+ characters)}"
  echo "==> Loading structure and site copy as drafts (nothing is published)"
  $C run --rm --no-deps cms npm run seed -w @protocol-soft/cms
  $C run --rm --no-deps cms npm run content:load-drafts -w @protocol-soft/cms
  echo "==> Creating the first Super Admin"
  $C run --rm --no-deps \
    -e BOOTSTRAP_SUPERADMIN_EMAIL="$SUPERADMIN_EMAIL" \
    -e BOOTSTRAP_SUPERADMIN_PASSWORD="$SUPERADMIN_PASSWORD" \
    -e BOOTSTRAP_SUPERADMIN_NAME="${SUPERADMIN_NAME:-Super Admin}" \
    cms npm run bootstrap:superadmin -w @protocol-soft/cms
fi

echo "==> Starting the stack"
$C up -d --remove-orphans
$C ps
echo "Done. Site: https://protosoftdev.com  ·  Admin: https://admin.protosoftdev.com/admin"
