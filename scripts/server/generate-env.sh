#!/bin/sh
# Creates the production .env for docker-compose.production.yml with fresh,
# random secrets. Run ONCE on the server, from the repository root:
#
#   sh scripts/server/generate-env.sh
#
# Afterwards, edit .env and fill the two values only you can provide:
#   CLOUDFLARE_TUNNEL_TOKEN  (Cloudflare Zero Trust > Tunnels)
#   RESEND_API_KEY           (optional; without it, lead e-mails are not sent)
# Never commit .env (it is git-ignored) and keep a copy in your password manager.
set -eu

cd "$(dirname "$0")/../.."
if [ -f .env ]; then
  echo ".env already exists; refusing to overwrite it (secrets would change and break the database login)." >&2
  exit 1
fi
command -v openssl >/dev/null || { echo "openssl is required" >&2; exit 1; }

rand() { openssl rand -hex 32; }
# Ed25519 preview key pair, written on one line with literal \n (the apps accept both forms).
tmp="$(mktemp -d)"
openssl genpkey -algorithm ed25519 -out "$tmp/preview.key" 2>/dev/null
openssl pkey -in "$tmp/preview.key" -pubout -out "$tmp/preview.pub" 2>/dev/null
oneline() { awk 'BEGIN{ORS="\\n"} {print}' "$1"; }
PREVIEW_PRIVATE="$(oneline "$tmp/preview.key")"
PREVIEW_PUBLIC="$(oneline "$tmp/preview.pub")"
rm -rf "$tmp"

umask 077
cat > .env <<EOF
# Production secrets for docker-compose.production.yml — generated $(date -u +%Y-%m-%dT%H:%MZ).
# NEVER commit this file. Keep a copy in a password manager.

POSTGRES_DB=protocol_soft
POSTGRES_PASSWORD=$(rand)
POSTGRES_MIGRATE_USER=migrate_user
POSTGRES_MIGRATE_PASSWORD=$(rand)
POSTGRES_CMS_USER=cms_user
POSTGRES_CMS_PASSWORD=$(rand)
POSTGRES_BACKUP_USER=backup_user
POSTGRES_BACKUP_PASSWORD=$(rand)

PAYLOAD_SECRET=$(rand)
WEB_TO_CMS_CONTENT_READ_KEY=$(rand)
WEB_TO_CMS_LEAD_SUBMIT_KEY=$(rand)
CMS_TO_WEB_REVALIDATE_KEY=$(rand)
BACKUP_REPORT_KEY=$(rand)
LEAD_IP_HASH_SECRET=$(rand)

PREVIEW_SIGNING_PRIVATE_KEY='${PREVIEW_PRIVATE}'
PREVIEW_VERIFY_PUBLIC_KEY='${PREVIEW_PUBLIC}'

CLOUDFLARE_TUNNEL_TOKEN=
RESEND_API_KEY=
EMAIL_SINK_ADDRESS=notifications-sink@example.invalid
BACKUP_ENCRYPTION_PUBLIC_KEY=
EOF

echo "Created .env with fresh secrets (permissions 600)."
echo "Next: put your Cloudflare tunnel token in CLOUDFLARE_TUNNEL_TOKEN, then run: sh scripts/server/deploy.sh --first-run"
