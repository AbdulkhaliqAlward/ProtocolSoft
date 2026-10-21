import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "reset_password_requested_at" timestamp(3) with time zone;
  CREATE INDEX "media_locales_parent_id_idx" ON "media_locales" USING btree ("_parent_id");
  CREATE INDEX "services_locales_parent_id_idx" ON "services_locales" USING btree ("_parent_id");
  CREATE INDEX "_services_v_locales_parent_id_idx" ON "_services_v_locales" USING btree ("_parent_id");
  CREATE INDEX "case_studies_locales_parent_id_idx" ON "case_studies_locales" USING btree ("_parent_id");
  CREATE INDEX "_case_studies_v_locales_parent_id_idx" ON "_case_studies_v_locales" USING btree ("_parent_id");
  CREATE INDEX "technical_initiatives_locales_parent_id_idx" ON "technical_initiatives_locales" USING btree ("_parent_id");
  CREATE INDEX "_technical_initiatives_v_locales_parent_id_idx" ON "_technical_initiatives_v_locales" USING btree ("_parent_id");
  CREATE INDEX "team_members_locales_parent_id_idx" ON "team_members_locales" USING btree ("_parent_id");
  CREATE INDEX "_team_members_v_locales_parent_id_idx" ON "_team_members_v_locales" USING btree ("_parent_id");
  CREATE INDEX "pages_locales_parent_id_idx" ON "pages_locales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_locales_parent_id_idx" ON "_pages_v_locales" USING btree ("_parent_id");
  CREATE INDEX "social_links_locales_parent_id_idx" ON "social_links_locales" USING btree ("_parent_id");
  CREATE INDEX "site_settings_locales_parent_id_idx" ON "site_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_header_items_locales_parent_id_idx" ON "navigation_header_items_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_links_locales_parent_id_idx" ON "navigation_footer_columns_links_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_footer_columns_locales_parent_id_idx" ON "navigation_footer_columns_locales" USING btree ("_parent_id");
  CREATE INDEX "navigation_locales_parent_id_idx" ON "navigation_locales" USING btree ("_parent_id");
  CREATE INDEX "homepage_locales_parent_id_idx" ON "homepage_locales" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_locales_parent_id_idx" ON "_homepage_v_locales" USING btree ("_parent_id");
  CREATE INDEX "seo_settings_locales_parent_id_idx" ON "seo_settings_locales" USING btree ("_parent_id");
  CREATE INDEX "form_settings_locales_parent_id_idx" ON "form_settings_locales" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_locales_parent_id_idx";
  DROP INDEX "services_locales_parent_id_idx";
  DROP INDEX "_services_v_locales_parent_id_idx";
  DROP INDEX "case_studies_locales_parent_id_idx";
  DROP INDEX "_case_studies_v_locales_parent_id_idx";
  DROP INDEX "technical_initiatives_locales_parent_id_idx";
  DROP INDEX "_technical_initiatives_v_locales_parent_id_idx";
  DROP INDEX "team_members_locales_parent_id_idx";
  DROP INDEX "_team_members_v_locales_parent_id_idx";
  DROP INDEX "pages_locales_parent_id_idx";
  DROP INDEX "_pages_v_locales_parent_id_idx";
  DROP INDEX "social_links_locales_parent_id_idx";
  DROP INDEX "site_settings_locales_parent_id_idx";
  DROP INDEX "navigation_header_items_locales_parent_id_idx";
  DROP INDEX "navigation_footer_columns_links_locales_parent_id_idx";
  DROP INDEX "navigation_footer_columns_locales_parent_id_idx";
  DROP INDEX "navigation_locales_parent_id_idx";
  DROP INDEX "homepage_locales_parent_id_idx";
  DROP INDEX "_homepage_v_locales_parent_id_idx";
  DROP INDEX "seo_settings_locales_parent_id_idx";
  DROP INDEX "form_settings_locales_parent_id_idx";
  ALTER TABLE "users" DROP COLUMN "reset_password_requested_at";`)
}
