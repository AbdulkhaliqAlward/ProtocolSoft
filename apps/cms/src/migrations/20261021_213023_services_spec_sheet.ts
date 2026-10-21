import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "services_engagement_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"needs_confirmation" boolean DEFAULT false
  );
  
  CREATE TABLE "services_not_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"needs_confirmation" boolean DEFAULT true
  );
  
  CREATE TABLE "services_capability_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "services_capability_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"stage" varchar,
  	"title" varchar
  );
  
  CREATE TABLE "_services_v_version_engagement_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"needs_confirmation" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_not_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"needs_confirmation" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_capability_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_capability_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"stage" varchar,
  	"title" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "homepage_sections_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"needs_confirmation" boolean DEFAULT false
  );
  
  CREATE TABLE "_homepage_v_version_sections_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"needs_confirmation" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  ALTER TABLE "services_process_steps" ADD COLUMN "client_provides" varchar;
  ALTER TABLE "services_process_steps" ADD COLUMN "we_deliver" varchar;
  ALTER TABLE "_services_v_version_process_steps" ADD COLUMN "client_provides" varchar;
  ALTER TABLE "_services_v_version_process_steps" ADD COLUMN "we_deliver" varchar;
  ALTER TABLE "homepage" ADD COLUMN "sections_faq_enabled" boolean DEFAULT true;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_sections_faq_enabled" boolean DEFAULT true;
  ALTER TABLE "services_engagement_facts" ADD CONSTRAINT "services_engagement_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_not_included" ADD CONSTRAINT "services_not_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_capability_groups_items" ADD CONSTRAINT "services_capability_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services_capability_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_capability_groups" ADD CONSTRAINT "services_capability_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_engagement_facts" ADD CONSTRAINT "_services_v_version_engagement_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_not_included" ADD CONSTRAINT "_services_v_version_not_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_capability_groups_items" ADD CONSTRAINT "_services_v_version_capability_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v_version_capability_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_capability_groups" ADD CONSTRAINT "_services_v_version_capability_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_faqs" ADD CONSTRAINT "homepage_sections_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_faqs" ADD CONSTRAINT "_homepage_v_version_sections_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_engagement_facts_order_idx" ON "services_engagement_facts" USING btree ("_order");
  CREATE INDEX "services_engagement_facts_parent_id_idx" ON "services_engagement_facts" USING btree ("_parent_id");
  CREATE INDEX "services_engagement_facts_locale_idx" ON "services_engagement_facts" USING btree ("_locale");
  CREATE INDEX "services_not_included_order_idx" ON "services_not_included" USING btree ("_order");
  CREATE INDEX "services_not_included_parent_id_idx" ON "services_not_included" USING btree ("_parent_id");
  CREATE INDEX "services_not_included_locale_idx" ON "services_not_included" USING btree ("_locale");
  CREATE INDEX "services_capability_groups_items_order_idx" ON "services_capability_groups_items" USING btree ("_order");
  CREATE INDEX "services_capability_groups_items_parent_id_idx" ON "services_capability_groups_items" USING btree ("_parent_id");
  CREATE INDEX "services_capability_groups_items_locale_idx" ON "services_capability_groups_items" USING btree ("_locale");
  CREATE INDEX "services_capability_groups_order_idx" ON "services_capability_groups" USING btree ("_order");
  CREATE INDEX "services_capability_groups_parent_id_idx" ON "services_capability_groups" USING btree ("_parent_id");
  CREATE INDEX "services_capability_groups_locale_idx" ON "services_capability_groups" USING btree ("_locale");
  CREATE INDEX "_services_v_version_engagement_facts_order_idx" ON "_services_v_version_engagement_facts" USING btree ("_order");
  CREATE INDEX "_services_v_version_engagement_facts_parent_id_idx" ON "_services_v_version_engagement_facts" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_engagement_facts_locale_idx" ON "_services_v_version_engagement_facts" USING btree ("_locale");
  CREATE INDEX "_services_v_version_not_included_order_idx" ON "_services_v_version_not_included" USING btree ("_order");
  CREATE INDEX "_services_v_version_not_included_parent_id_idx" ON "_services_v_version_not_included" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_not_included_locale_idx" ON "_services_v_version_not_included" USING btree ("_locale");
  CREATE INDEX "_services_v_version_capability_groups_items_order_idx" ON "_services_v_version_capability_groups_items" USING btree ("_order");
  CREATE INDEX "_services_v_version_capability_groups_items_parent_id_idx" ON "_services_v_version_capability_groups_items" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_capability_groups_items_locale_idx" ON "_services_v_version_capability_groups_items" USING btree ("_locale");
  CREATE INDEX "_services_v_version_capability_groups_order_idx" ON "_services_v_version_capability_groups" USING btree ("_order");
  CREATE INDEX "_services_v_version_capability_groups_parent_id_idx" ON "_services_v_version_capability_groups" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_capability_groups_locale_idx" ON "_services_v_version_capability_groups" USING btree ("_locale");
  CREATE INDEX "homepage_sections_faqs_order_idx" ON "homepage_sections_faqs" USING btree ("_order");
  CREATE INDEX "homepage_sections_faqs_parent_id_idx" ON "homepage_sections_faqs" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_faqs_locale_idx" ON "homepage_sections_faqs" USING btree ("_locale");
  CREATE INDEX "_homepage_v_version_sections_faqs_order_idx" ON "_homepage_v_version_sections_faqs" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_faqs_parent_id_idx" ON "_homepage_v_version_sections_faqs" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_faqs_locale_idx" ON "_homepage_v_version_sections_faqs" USING btree ("_locale");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "services_engagement_facts" CASCADE;
  DROP TABLE "services_not_included" CASCADE;
  DROP TABLE "services_capability_groups_items" CASCADE;
  DROP TABLE "services_capability_groups" CASCADE;
  DROP TABLE "_services_v_version_engagement_facts" CASCADE;
  DROP TABLE "_services_v_version_not_included" CASCADE;
  DROP TABLE "_services_v_version_capability_groups_items" CASCADE;
  DROP TABLE "_services_v_version_capability_groups" CASCADE;
  DROP TABLE "homepage_sections_faqs" CASCADE;
  DROP TABLE "_homepage_v_version_sections_faqs" CASCADE;
  ALTER TABLE "services_process_steps" DROP COLUMN "client_provides";
  ALTER TABLE "services_process_steps" DROP COLUMN "we_deliver";
  ALTER TABLE "_services_v_version_process_steps" DROP COLUMN "client_provides";
  ALTER TABLE "_services_v_version_process_steps" DROP COLUMN "we_deliver";
  ALTER TABLE "homepage" DROP COLUMN "sections_faq_enabled";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_sections_faq_enabled";`)
}
