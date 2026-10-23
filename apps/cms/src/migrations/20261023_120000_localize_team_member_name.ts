import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Team member names become localized (Arabic and Latin spelling): the column
// moves to the locales tables, carrying any existing value into every locale row.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team_members_locales" ADD COLUMN "name" varchar;
  UPDATE "team_members_locales" l SET "name" = t."name" FROM "team_members" t WHERE l."_parent_id" = t."id";
  ALTER TABLE "team_members" DROP COLUMN "name";
  ALTER TABLE "_team_members_v_locales" ADD COLUMN "version_name" varchar;
  UPDATE "_team_members_v_locales" l SET "version_name" = v."version_name" FROM "_team_members_v" v WHERE l."_parent_id" = v."id";
  ALTER TABLE "_team_members_v" DROP COLUMN "version_name";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "team_members" ADD COLUMN "name" varchar;
  UPDATE "team_members" t SET "name" = l."name" FROM "team_members_locales" l WHERE l."_parent_id" = t."id" AND l."_locale" = 'ar';
  ALTER TABLE "team_members_locales" DROP COLUMN "name";
  ALTER TABLE "_team_members_v" ADD COLUMN "version_name" varchar;
  UPDATE "_team_members_v" v SET "version_name" = l."version_name" FROM "_team_members_v_locales" l WHERE l."_parent_id" = v."id" AND l."_locale" = 'ar';
  ALTER TABLE "_team_members_v_locales" DROP COLUMN "version_name";`)
}
