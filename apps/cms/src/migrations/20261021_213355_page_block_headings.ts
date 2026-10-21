import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_faq_accordion" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_content_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_faq_accordion" ADD COLUMN "heading" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_content_rich_text" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_faq_accordion" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_content_rich_text" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_faq_accordion" DROP COLUMN "heading";`)
}
