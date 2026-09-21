#!/bin/sh
# Backup runner (Phase 2 §2.3/§11.4 + BD1) — DORMANT until explicitly enabled.
# Preconditions enforced by ops before starting this service (compose profile "backup"):
#   1. An approved ENCRYPTED OFF-SERVER destination exists (Cloudflare R2 preferred — not final).
#   2. A documented restore test has been completed and recorded.
# Until then this runner must NOT be scheduled. When enabled it:
#   - dumps PostgreSQL with the READ-ONLY backup role (no DDL, no writes)
#   - tars the media volume
#   - encrypts both with age using the BACKUP_ENCRYPTION_PUBLIC_KEY (private half never on this container)
#   - writes to the encrypted spool; the off-server sync is the ops-runbook step
#   - reports results (non-sensitive, sanitized) to the CMS via BACKUP_REPORT_KEY
set -eu

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SPOOL="${BACKUP_SPOOL_DIR:-/backups/spool}"
mkdir -p "$SPOOL"

report() {
  # $1 type, $2 status, $3 errorSummary (optional, will be sanitized server-side too)
  STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  wget -qO- --header="x-internal-key: ${BACKUP_REPORT_KEY}" \
    --header="content-type: application/json" \
    --post-data="{\"type\":\"$1\",\"status\":\"$2\",\"startedAt\":\"$STARTED\",\"finishedAt\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"errorSummary\":${3:-null}}" \
    "$BACKUP_REPORT_URL" >/dev/null 2>&1 || echo "[backup] report failed (non-fatal)"
}

echo "[backup] starting scheduled backup ${STAMP}"
if ! pg_dump -F c -f "${SPOOL}/db-${STAMP}.dump"; then
  echo "[backup] pg_dump FAILED"
  report scheduled failed '"pg_dump failed"'
  exit 1
fi

# Media volume backup (bind-mounted read-only by ops when enabled)
if [ -d "$MEDIA_VOLUME_SOURCE" ]; then
  tar -C "$(dirname "$MEDIA_VOLUME_SOURCE")" -czf "${SPOOL}/media-${STAMP}.tar.gz" "$(basename "$MEDIA_VOLUME_SOURCE")" || {
    echo "[backup] media tar FAILED"
    report scheduled failed '"media tar failed"'
    exit 1
  }
fi

# Encrypt with age (public-key only; the private half lives off this container)
if command -v age >/dev/null 2>&1 && [ -n "${BACKUP_ENCRYPTION_PUBLIC_KEY:-}" ]; then
  for f in "${SPOOL}/db-${STAMP}.dump" ${SPOOL}/media-${STAMP}.tar.gz; do
    [ -f "$f" ] && age -r "$BACKUP_ENCRYPTION_PUBLIC_KEY" -o "${f}.age" "$f" && rm -f "$f"
  done
else
  echo "[backup] WARNING: age or public key missing — spool left UNENCRYPTED; do NOT sync off-server in this state"
  report scheduled verification_required '"encryption unavailable"'
  exit 1
fi

echo "[backup] encrypted artifacts written to spool: ${SPOOL} (off-server sync per ops runbook)"
report scheduled success null
# Retention target (30 daily + 12 monthly) is applied by the ops retention script — server-side only.
