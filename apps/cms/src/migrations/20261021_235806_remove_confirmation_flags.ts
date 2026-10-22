import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_engagement_facts" DROP COLUMN "needs_confirmation";
  ALTER TABLE "services_not_included" DROP COLUMN "needs_confirmation";
  ALTER TABLE "_services_v_version_engagement_facts" DROP COLUMN "needs_confirmation";
  ALTER TABLE "_services_v_version_not_included" DROP COLUMN "needs_confirmation";
  ALTER TABLE "homepage_sections_faqs" DROP COLUMN "needs_confirmation";
  ALTER TABLE "_homepage_v_version_sections_faqs" DROP COLUMN "needs_confirmation";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_engagement_facts" ADD COLUMN "needs_confirmation" boolean DEFAULT false;
  ALTER TABLE "services_not_included" ADD COLUMN "needs_confirmation" boolean DEFAULT true;
  ALTER TABLE "_services_v_version_engagement_facts" ADD COLUMN "needs_confirmation" boolean DEFAULT false;
  ALTER TABLE "_services_v_version_not_included" ADD COLUMN "needs_confirmation" boolean DEFAULT true;
  ALTER TABLE "homepage_sections_faqs" ADD COLUMN "needs_confirmation" boolean DEFAULT false;
  ALTER TABLE "_homepage_v_version_sections_faqs" ADD COLUMN "needs_confirmation" boolean DEFAULT false;`)
}
