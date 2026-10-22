#!/bin/sh
# Runs ONCE, when the PostgreSQL data volume is first created
# (mounted into /docker-entrypoint-initdb.d by docker-compose.production.yml).
#
# Creates the three least-privilege roles the stack connects with:
#   migrate_user  owns the schema objects; used only to run migrations
#   cms_user      read/write on data (the CMS at runtime); no DDL
#   backup_user   read-only (pg_dump)
# Tables created later by migrate_user grant their privileges automatically
# through ALTER DEFAULT PRIVILEGES below.
set -eu

: "${POSTGRES_DB:?}" "${POSTGRES_MIGRATE_USER:?}" "${POSTGRES_MIGRATE_PASSWORD:?}"
: "${POSTGRES_CMS_USER:?}" "${POSTGRES_CMS_PASSWORD:?}" "${POSTGRES_BACKUP_USER:?}" "${POSTGRES_BACKUP_PASSWORD:?}"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v db="$POSTGRES_DB" \
  -v mig="$POSTGRES_MIGRATE_USER" -v mig_pw="$POSTGRES_MIGRATE_PASSWORD" \
  -v cms="$POSTGRES_CMS_USER" -v cms_pw="$POSTGRES_CMS_PASSWORD" \
  -v bak="$POSTGRES_BACKUP_USER" -v bak_pw="$POSTGRES_BACKUP_PASSWORD" <<'SQL'
CREATE ROLE :"mig" LOGIN PASSWORD :'mig_pw';
CREATE ROLE :"cms" LOGIN PASSWORD :'cms_pw';
CREATE ROLE :"bak" LOGIN PASSWORD :'bak_pw';

REVOKE ALL ON DATABASE :"db" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"db" TO :"mig", :"cms", :"bak";

REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO :"mig";
GRANT USAGE ON SCHEMA public TO :"cms", :"bak";

-- Everything migrate_user creates is usable by the CMS (data only) and readable by backups.
ALTER DEFAULT PRIVILEGES FOR ROLE :"mig" IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO :"cms";
ALTER DEFAULT PRIVILEGES FOR ROLE :"mig" IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO :"cms";
ALTER DEFAULT PRIVILEGES FOR ROLE :"mig" IN SCHEMA public GRANT USAGE ON TYPES TO :"cms";
ALTER DEFAULT PRIVILEGES FOR ROLE :"mig" IN SCHEMA public GRANT SELECT ON TABLES TO :"bak";
ALTER DEFAULT PRIVILEGES FOR ROLE :"mig" IN SCHEMA public GRANT SELECT ON SEQUENCES TO :"bak";
SQL

echo "init-roles: created $POSTGRES_MIGRATE_USER, $POSTGRES_CMS_USER, $POSTGRES_BACKUP_USER"
