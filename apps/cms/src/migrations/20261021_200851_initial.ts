import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_users_role" AS ENUM('super_admin', 'content_manager', 'editor', 'sales_manager');
  CREATE TYPE "public"."enum_users_preferred_admin_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_media_category" AS ENUM('logos', 'og-images', 'team', 'projects', 'initiatives', 'content', 'documents');
  CREATE TYPE "public"."enum_media_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum_media_sensitivity_screening_status" AS ENUM('unscreened', 'pending', 'approved', 'rejected');
  CREATE TYPE "public"."enum_services_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_services_icon" AS ENUM('code', 'layers', 'shield', 'gauge', 'workflow', 'server');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum__services_v_version_icon" AS ENUM('code', 'layers', 'shield', 'gauge', 'workflow', 'server');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_case_studies_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_case_studies_project_type" AS ENUM('client_project', 'internal_product', 'open_source', 'rnd');
  CREATE TYPE "public"."enum_case_studies_client_approval_status" AS ENUM('pending', 'approved_restricted', 'approved_full');
  CREATE TYPE "public"."enum_case_studies_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_studies_v_version_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum__case_studies_v_version_project_type" AS ENUM('client_project', 'internal_product', 'open_source', 'rnd');
  CREATE TYPE "public"."enum__case_studies_v_version_client_approval_status" AS ENUM('pending', 'approved_restricted', 'approved_full');
  CREATE TYPE "public"."enum__case_studies_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__case_studies_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_technical_initiatives_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_technical_initiatives_category" AS ENUM('open_source', 'technical', 'rnd');
  CREATE TYPE "public"."initiative_status" AS ENUM('in_development', 'available', 'archived');
  CREATE TYPE "public"."enum_technical_initiatives_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__technical_initiatives_v_version_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum__technical_initiatives_v_version_category" AS ENUM('open_source', 'technical', 'rnd');
  CREATE TYPE "public"."enum__technical_initiatives_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__technical_initiatives_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_team_members_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_team_members_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_version_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum__team_members_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__team_members_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_media_text_layout" AS ENUM('image_start', 'image_end');
  CREATE TYPE "public"."enum_pages_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_pages_content_origin" AS ENUM('draft_template', 'final');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_media_text_layout" AS ENUM('image_start', 'image_end');
  CREATE TYPE "public"."enum__pages_v_version_published_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum__pages_v_version_content_origin" AS ENUM('draft_template', 'final');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_leads_service_interest" AS ENUM('custom_software', 'digital_products', 'cybersecurity', 'general');
  CREATE TYPE "public"."enum_leads_source_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_leads_status" AS ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost', 'archived');
  CREATE TYPE "public"."enum_social_links_platform" AS ENUM('linkedin', 'x', 'instagram', 'facebook', 'youtube', 'whatsapp', 'github', 'other');
  CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '302', '307', '308');
  CREATE TYPE "public"."enum_audit_logs_event_type" AS ENUM('login_success', 'login_failure', 'logout', 'password_reset_requested', 'password_reset_completed', 'user_created', 'user_updated', 'user_disabled', 'role_changed', 'draft_saved', 'publish', 'unpublish', 'revert', 'settings_changed', 'theme_changed', 'theme_reset', 'media_uploaded', 'media_deleted', 'media_archived', 'media_screening_changed', 'lead_created', 'lead_status_changed', 'lead_exported', 'backup_schedule_changed', 'backup_requested', 'backup_completed', 'backup_failed', 'backup_verification_required', 'backup_verified', 'backup_config_changed', 'legal_content_confirmed', 'break_glass_used');
  CREATE TYPE "public"."enum_backup_records_type" AS ENUM('scheduled', 'manual');
  CREATE TYPE "public"."enum_backup_records_status" AS ENUM('requested', 'running', 'success', 'failed', 'verification_required', 'verified');
  CREATE TYPE "public"."enum_backup_records_verification_status" AS ENUM('not_checked', 'passed', 'failed');
  CREATE TYPE "public"."enum_theme_settings_color_preset" AS ENUM('ink_stone_v1');
  CREATE TYPE "public"."enum_theme_settings_default_mode" AS ENUM('system', 'light', 'dark');
  CREATE TYPE "public"."enum_theme_settings_button_style" AS ENUM('filled', 'outline', 'soft');
  CREATE TYPE "public"."enum_theme_settings_border_radius" AS ENUM('sm', 'md', 'lg', 'full');
  CREATE TYPE "public"."enum_homepage_hero_background_pattern" AS ENUM('none');
  CREATE TYPE "public"."fb" AS ENUM('hide_section', 'neutral_alternative');
  CREATE TYPE "public"."enum_homepage_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_version_hero_background_pattern" AS ENUM('none');
  CREATE TYPE "public"."enum__homepage_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__homepage_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_seo_settings_sitemap_includes" AS ENUM('home', 'services', 'case-studies', 'pages', 'team');
  CREATE TYPE "public"."enum_backup_settings_schedule_frequency" AS ENUM('daily');
  CREATE TYPE "public"."enum_backup_settings_destination_status" AS ENUM('not_configured', 'configured');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"preferred_admin_locale" "enum_users_preferred_admin_locale" DEFAULT 'ar',
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt_text_ar" varchar,
  	"alt_text_en" varchar,
  	"category" "enum_media_category" DEFAULT 'content' NOT NULL,
  	"visibility" "enum_media_visibility" DEFAULT 'public' NOT NULL,
  	"sensitivity_screening_status" "enum_media_sensitivity_screening_status" DEFAULT 'unscreened',
  	"sensitivity_screening_reviewed_by" varchar,
  	"sensitivity_screening_reviewed_at" timestamp(3) with time zone,
  	"sensitivity_screening_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "media_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "services_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "services_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_services_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"icon" "enum_services_icon",
  	"initiative_section_enabled" boolean DEFAULT false,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"archived_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar,
  	"hero_headline" varchar,
  	"hero_subhead" varchar,
  	"summary" varchar,
  	"overview" jsonb,
  	"initiative_section_heading" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "services_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "services_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"case_studies_id" integer
  );
  
  CREATE TABLE "_services_v_version_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__services_v_version_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_icon" "enum__services_v_version_icon",
  	"version_initiative_section_enabled" boolean DEFAULT false,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_archived_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_title" varchar,
  	"version_hero_headline" varchar,
  	"version_hero_subhead" varchar,
  	"version_summary" varchar,
  	"version_overview" jsonb,
  	"version_initiative_section_heading" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_services_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"case_studies_id" integer
  );
  
  CREATE TABLE "case_studies_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_case_studies_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "case_studies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"project_type" "enum_case_studies_project_type",
  	"cover_image_id" integer,
  	"client_name" varchar,
  	"client_logo_id" integer,
  	"client_name_visible" boolean DEFAULT false,
  	"client_logo_visible" boolean DEFAULT false,
  	"client_approval_status" "enum_case_studies_client_approval_status" DEFAULT 'pending',
  	"client_approval_date" timestamp(3) with time zone,
  	"client_approval_ref" varchar,
  	"featured" boolean DEFAULT false,
  	"timeline_start_date" timestamp(3) with time zone,
  	"timeline_end_date" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_case_studies_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "case_studies_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"challenge" jsonb,
  	"solution" jsonb,
  	"outcomes" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "case_studies_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "case_studies_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_case_studies_v_version_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__case_studies_v_version_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_case_studies_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_project_type" "enum__case_studies_v_version_project_type",
  	"version_cover_image_id" integer,
  	"version_client_name" varchar,
  	"version_client_logo_id" integer,
  	"version_client_name_visible" boolean DEFAULT false,
  	"version_client_logo_visible" boolean DEFAULT false,
  	"version_client_approval_status" "enum__case_studies_v_version_client_approval_status" DEFAULT 'pending',
  	"version_client_approval_date" timestamp(3) with time zone,
  	"version_client_approval_ref" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_timeline_start_date" timestamp(3) with time zone,
  	"version_timeline_end_date" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__case_studies_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__case_studies_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_case_studies_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_challenge" jsonb,
  	"version_solution" jsonb,
  	"version_outcomes" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_case_studies_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar,
  	"locale" "_locales"
  );
  
  CREATE TABLE "_case_studies_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "technical_initiatives_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_technical_initiatives_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "technical_initiatives" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_technical_initiatives_category",
  	"status" "initiative_status" DEFAULT 'in_development',
  	"placements_cybersecurity_card" boolean DEFAULT true,
  	"placements_homepage_section" boolean DEFAULT false,
  	"links_github" varchar,
  	"links_github_approved" boolean DEFAULT false,
  	"links_docs" varchar,
  	"links_docs_approved" boolean DEFAULT false,
  	"links_website" varchar,
  	"links_website_approved" boolean DEFAULT false,
  	"roadmap" jsonb,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_technical_initiatives_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "technical_initiatives_locales" (
  	"title" varchar,
  	"short_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "technical_initiatives_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_technical_initiatives_v_version_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__technical_initiatives_v_version_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_technical_initiatives_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_category" "enum__technical_initiatives_v_version_category",
  	"version_status" "initiative_status" DEFAULT 'in_development',
  	"version_placements_cybersecurity_card" boolean DEFAULT true,
  	"version_placements_homepage_section" boolean DEFAULT false,
  	"version_links_github" varchar,
  	"version_links_github_approved" boolean DEFAULT false,
  	"version_links_docs" varchar,
  	"version_links_docs_approved" boolean DEFAULT false,
  	"version_links_website" varchar,
  	"version_links_website_approved" boolean DEFAULT false,
  	"version_roadmap" jsonb,
  	"version_featured" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__technical_initiatives_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__technical_initiatives_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_technical_initiatives_v_locales" (
  	"version_title" varchar,
  	"version_short_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_technical_initiatives_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "team_members_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_team_members_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "team_members" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"photo_id" integer,
  	"linkedin_url" varchar,
  	"visible" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_team_members_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "team_members_locales" (
  	"job_title" varchar,
  	"bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_team_members_v_version_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__team_members_v_version_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_team_members_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_photo_id" integer,
  	"version_linkedin_url" varchar,
  	"version_visible" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__team_members_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__team_members_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_team_members_v_locales" (
  	"version_job_title" varchar,
  	"version_bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages_blocks_content_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_accordion_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"cta_target" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"text" jsonb,
  	"layout" "enum_pages_blocks_media_text_layout" DEFAULT 'image_start',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_pages_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"in_nav" boolean DEFAULT false,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"legal_review_required" boolean DEFAULT false,
  	"content_origin" "enum_pages_content_origin" DEFAULT 'draft_template',
  	"legal_reviewed_by" varchar,
  	"legal_reviewed_at" timestamp(3) with time zone,
  	"legal_approval_ref" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_content_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_accordion_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_accordion" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" varchar,
  	"cta_label" varchar,
  	"cta_target" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"text" jsonb,
  	"layout" "enum__pages_v_blocks_media_text_layout" DEFAULT 'image_start',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_version_published_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_version_published_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_in_nav" boolean DEFAULT false,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_legal_review_required" boolean DEFAULT false,
  	"version_content_origin" "enum__pages_v_version_content_origin" DEFAULT 'draft_template',
  	"version_legal_reviewed_by" varchar,
  	"version_legal_reviewed_at" timestamp(3) with time zone,
  	"version_legal_approval_ref" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "leads_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"body" varchar NOT NULL,
  	"author_id" integer,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference_code" varchar NOT NULL,
  	"full_name" varchar NOT NULL,
  	"company" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"service_interest" "enum_leads_service_interest" NOT NULL,
  	"message" varchar NOT NULL,
  	"source_locale" "enum_leads_source_locale" NOT NULL,
  	"page_path" varchar,
  	"consent" boolean DEFAULT true NOT NULL,
  	"ip_hash" varchar,
  	"submitted_at" timestamp(3) with time zone NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'new' NOT NULL,
  	"assigned_to_id" integer
  );
  
  CREATE TABLE "social_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL,
  	"visible" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "social_links_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"status_code" "enum_redirects_status_code" DEFAULT '301',
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "audit_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_time" timestamp(3) with time zone NOT NULL,
  	"actor_id" integer,
  	"actor_label" varchar,
  	"event_type" "enum_audit_logs_event_type" NOT NULL,
  	"entity_collection" varchar,
  	"entity_id" varchar,
  	"entity_slug" varchar,
  	"entity_locale" varchar,
  	"changes_summary" varchar
  );
  
  CREATE TABLE "backup_records" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum_backup_records_type" NOT NULL,
  	"status" "enum_backup_records_status" NOT NULL,
  	"started_at" timestamp(3) with time zone NOT NULL,
  	"finished_at" timestamp(3) with time zone,
  	"duration_ms" numeric,
  	"verification_status" "enum_backup_records_verification_status" DEFAULT 'not_checked',
  	"verification_checked_at" timestamp(3) with time zone,
  	"triggered_by_id" integer,
  	"error_summary" varchar
  );
  
  CREATE TABLE "preview_codes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"jti_hash" varchar NOT NULL,
  	"collection" varchar NOT NULL,
  	"doc_id" varchar NOT NULL,
  	"locale" varchar NOT NULL,
  	"revision_id" varchar,
  	"issuing_admin_id" varchar NOT NULL,
  	"expires_at" timestamp(3) with time zone NOT NULL,
  	"used" boolean DEFAULT false NOT NULL,
  	"used_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"services_id" integer,
  	"case_studies_id" integer,
  	"technical_initiatives_id" integer,
  	"team_members_id" integer,
  	"pages_id" integer,
  	"leads_id" integer,
  	"social_links_id" integer,
  	"redirects_id" integer,
  	"audit_logs_id" integer,
  	"backup_records_id" integer,
  	"preview_codes_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email_main" varchar,
  	"email_sales" varchar,
  	"email_support" varchar,
  	"phone" varchar,
  	"whatsapp_number" varchar,
  	"city" varchar,
  	"country" varchar,
  	"google_maps_url" varchar,
  	"seo_domain" varchar DEFAULT 'protosoftdev.com' NOT NULL,
  	"logo_dark_id" integer,
  	"logo_light_id" integer,
  	"favicon_id" integer,
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"company_name" varchar NOT NULL,
  	"legal_company_name" varchar,
  	"description" varchar,
  	"tagline" varchar,
  	"address_line" varchar,
  	"working_hours" varchar,
  	"footer_copyright" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "theme_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"color_preset" "enum_theme_settings_color_preset" DEFAULT 'ink_stone_v1' NOT NULL,
  	"default_mode" "enum_theme_settings_default_mode" DEFAULT 'system' NOT NULL,
  	"button_style" "enum_theme_settings_button_style" DEFAULT 'filled' NOT NULL,
  	"border_radius" "enum_theme_settings_border_radius" DEFAULT 'md' NOT NULL,
  	"animations_enabled" boolean DEFAULT true NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"target" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 100,
  	"visible" boolean DEFAULT true
  );
  
  CREATE TABLE "navigation_header_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"target" varchar NOT NULL,
  	"sort_order" numeric DEFAULT 100
  );
  
  CREATE TABLE "navigation_footer_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation_footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"sort_order" numeric DEFAULT 100
  );
  
  CREATE TABLE "navigation_footer_columns_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_cta_target" varchar DEFAULT '/contact' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_locales" (
  	"header_cta_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_sections_differentiators" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "homepage_sections_why_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "homepage_sections_methodology_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"promise" varchar
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_enabled" boolean DEFAULT true,
  	"hero_secondary_cta_target" varchar DEFAULT '/services',
  	"hero_background_pattern" "enum_homepage_hero_background_pattern" DEFAULT 'none',
  	"sections_value_statement_enabled" boolean DEFAULT true,
  	"sections_services_overview_enabled" boolean DEFAULT true,
  	"sections_why_enabled" boolean DEFAULT true,
  	"sections_methodology_enabled" boolean DEFAULT true,
  	"sections_featured_project_enabled" boolean DEFAULT true,
  	"sections_featured_project_project_id" integer,
  	"sections_featured_project_fallback_mode" "fb" DEFAULT 'hide_section',
  	"sections_technical_initiatives_enabled" boolean DEFAULT false,
  	"sections_secure_by_design_enabled" boolean DEFAULT true,
  	"final_cta_enabled" boolean DEFAULT true,
  	"final_cta_cta_target" varchar DEFAULT '/contact',
  	"_status" "enum_homepage_status" DEFAULT 'draft',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_locales" (
  	"hero_kicker" varchar,
  	"hero_headline" varchar,
  	"hero_subheadline" varchar,
  	"hero_primary_cta_label" varchar,
  	"hero_secondary_cta_label" varchar,
  	"sections_value_statement" varchar,
  	"sections_services_heading" varchar,
  	"sections_featured_project_heading" varchar,
  	"sections_featured_project_neutral_alternative" varchar,
  	"sections_technical_initiatives_heading" varchar,
  	"sections_secure_by_design" varchar,
  	"final_cta_heading" varchar,
  	"final_cta_body" varchar,
  	"final_cta_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_sections_differentiators" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_why_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_sections_methodology_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"promise" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_hero_enabled" boolean DEFAULT true,
  	"version_hero_secondary_cta_target" varchar DEFAULT '/services',
  	"version_hero_background_pattern" "enum__homepage_v_version_hero_background_pattern" DEFAULT 'none',
  	"version_sections_value_statement_enabled" boolean DEFAULT true,
  	"version_sections_services_overview_enabled" boolean DEFAULT true,
  	"version_sections_why_enabled" boolean DEFAULT true,
  	"version_sections_methodology_enabled" boolean DEFAULT true,
  	"version_sections_featured_project_enabled" boolean DEFAULT true,
  	"version_sections_featured_project_project_id" integer,
  	"version_sections_featured_project_fallback_mode" "fb" DEFAULT 'hide_section',
  	"version_sections_technical_initiatives_enabled" boolean DEFAULT false,
  	"version_sections_secure_by_design_enabled" boolean DEFAULT true,
  	"version_final_cta_enabled" boolean DEFAULT true,
  	"version_final_cta_cta_target" varchar DEFAULT '/contact',
  	"version__status" "enum__homepage_v_version_status" DEFAULT 'draft',
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__homepage_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_homepage_v_locales" (
  	"version_hero_kicker" varchar,
  	"version_hero_headline" varchar,
  	"version_hero_subheadline" varchar,
  	"version_hero_primary_cta_label" varchar,
  	"version_hero_secondary_cta_label" varchar,
  	"version_sections_value_statement" varchar,
  	"version_sections_services_heading" varchar,
  	"version_sections_featured_project_heading" varchar,
  	"version_sections_featured_project_neutral_alternative" varchar,
  	"version_sections_technical_initiatives_heading" varchar,
  	"version_sections_secure_by_design" varchar,
  	"version_final_cta_heading" varchar,
  	"version_final_cta_body" varchar,
  	"version_final_cta_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "seo_settings_sitemap_includes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_seo_settings_sitemap_includes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "seo_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"default_og_image_id" integer,
  	"canonical_domain" varchar DEFAULT 'https://protosoftdev.com' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "seo_settings_locales" (
  	"title_template" varchar NOT NULL,
  	"default_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "form_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"notification_recipients" jsonb,
  	"rate_limits_per_ip_per_hour" numeric DEFAULT 5 NOT NULL,
  	"rate_limits_per_ip_per_day" numeric DEFAULT 20 NOT NULL,
  	"rate_limits_per_service_per_minute" numeric DEFAULT 30 NOT NULL,
  	"auto_responder_enabled" boolean DEFAULT false,
  	"retention_months" numeric DEFAULT 12 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "form_settings_locales" (
  	"confirmation_message" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "backup_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"schedule_enabled" boolean DEFAULT false NOT NULL,
  	"schedule_frequency" "enum_backup_settings_schedule_frequency" DEFAULT 'daily' NOT NULL,
  	"schedule_time" varchar DEFAULT '03:00',
  	"destination_status" "enum_backup_settings_destination_status" DEFAULT 'not_configured' NOT NULL,
  	"retention_target_daily_copies" numeric DEFAULT 30,
  	"retention_target_monthly_copies" numeric DEFAULT 12,
  	"manual_request_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_texts" ADD CONSTRAINT "media_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_deliverables" ADD CONSTRAINT "services_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_process_steps" ADD CONSTRAINT "services_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faqs" ADD CONSTRAINT "services_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_published_locales" ADD CONSTRAINT "services_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_texts" ADD CONSTRAINT "services_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_rels" ADD CONSTRAINT "services_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_deliverables" ADD CONSTRAINT "_services_v_version_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_process_steps" ADD CONSTRAINT "_services_v_version_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faqs" ADD CONSTRAINT "_services_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_published_locales" ADD CONSTRAINT "_services_v_version_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_texts" ADD CONSTRAINT "_services_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_rels" ADD CONSTRAINT "_services_v_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_published_locales" ADD CONSTRAINT "case_studies_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_client_logo_id_media_id_fk" FOREIGN KEY ("client_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "case_studies_locales" ADD CONSTRAINT "case_studies_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_texts" ADD CONSTRAINT "case_studies_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "case_studies_rels" ADD CONSTRAINT "case_studies_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_version_published_locales" ADD CONSTRAINT "_case_studies_v_version_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_parent_id_case_studies_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_cover_image_id_media_id_fk" FOREIGN KEY ("version_cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_client_logo_id_media_id_fk" FOREIGN KEY ("version_client_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v" ADD CONSTRAINT "_case_studies_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_case_studies_v_locales" ADD CONSTRAINT "_case_studies_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_texts" ADD CONSTRAINT "_case_studies_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_case_studies_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_case_studies_v_rels" ADD CONSTRAINT "_case_studies_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technical_initiatives_published_locales" ADD CONSTRAINT "technical_initiatives_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."technical_initiatives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technical_initiatives_locales" ADD CONSTRAINT "technical_initiatives_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."technical_initiatives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technical_initiatives_rels" ADD CONSTRAINT "technical_initiatives_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."technical_initiatives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "technical_initiatives_rels" ADD CONSTRAINT "technical_initiatives_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technical_initiatives_v_version_published_locales" ADD CONSTRAINT "_technical_initiatives_v_version_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_technical_initiatives_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technical_initiatives_v" ADD CONSTRAINT "_technical_initiatives_v_parent_id_technical_initiatives_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."technical_initiatives"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_technical_initiatives_v_locales" ADD CONSTRAINT "_technical_initiatives_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_technical_initiatives_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technical_initiatives_v_rels" ADD CONSTRAINT "_technical_initiatives_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_technical_initiatives_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_technical_initiatives_v_rels" ADD CONSTRAINT "_technical_initiatives_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members_published_locales" ADD CONSTRAINT "team_members_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_members" ADD CONSTRAINT "team_members_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team_members_locales" ADD CONSTRAINT "team_members_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v_version_published_locales" ADD CONSTRAINT "_team_members_v_version_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_parent_id_team_members_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team_members"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v" ADD CONSTRAINT "_team_members_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_team_members_v_locales" ADD CONSTRAINT "_team_members_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_team_members_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_content_rich_text" ADD CONSTRAINT "pages_blocks_content_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid_items" ADD CONSTRAINT "pages_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_grid" ADD CONSTRAINT "pages_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_accordion_faqs" ADD CONSTRAINT "pages_blocks_faq_accordion_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_accordion" ADD CONSTRAINT "pages_blocks_faq_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_banner" ADD CONSTRAINT "pages_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text" ADD CONSTRAINT "pages_blocks_media_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_text" ADD CONSTRAINT "pages_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_published_locales" ADD CONSTRAINT "pages_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_content_rich_text" ADD CONSTRAINT "_pages_v_blocks_content_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid_items" ADD CONSTRAINT "_pages_v_blocks_feature_grid_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_grid"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_grid" ADD CONSTRAINT "_pages_v_blocks_feature_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_accordion_faqs" ADD CONSTRAINT "_pages_v_blocks_faq_accordion_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_accordion"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_accordion" ADD CONSTRAINT "_pages_v_blocks_faq_accordion_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_banner" ADD CONSTRAINT "_pages_v_blocks_cta_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_text" ADD CONSTRAINT "_pages_v_blocks_media_text_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_text" ADD CONSTRAINT "_pages_v_blocks_media_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_published_locales" ADD CONSTRAINT "_pages_v_version_published_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_notes" ADD CONSTRAINT "leads_notes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_notes" ADD CONSTRAINT "leads_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_links_locales" ADD CONSTRAINT "social_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "backup_records" ADD CONSTRAINT "backup_records_triggered_by_id_users_id_fk" FOREIGN KEY ("triggered_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_case_studies_fk" FOREIGN KEY ("case_studies_id") REFERENCES "public"."case_studies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_technical_initiatives_fk" FOREIGN KEY ("technical_initiatives_id") REFERENCES "public"."technical_initiatives"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_members_fk" FOREIGN KEY ("team_members_id") REFERENCES "public"."team_members"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_links_fk" FOREIGN KEY ("social_links_id") REFERENCES "public"."social_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_audit_logs_fk" FOREIGN KEY ("audit_logs_id") REFERENCES "public"."audit_logs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_backup_records_fk" FOREIGN KEY ("backup_records_id") REFERENCES "public"."backup_records"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_preview_codes_fk" FOREIGN KEY ("preview_codes_id") REFERENCES "public"."preview_codes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_dark_id_media_id_fk" FOREIGN KEY ("logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_logo_light_id_media_id_fk" FOREIGN KEY ("logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items_locales" ADD CONSTRAINT "navigation_header_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links" ADD CONSTRAINT "navigation_footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_links_locales" ADD CONSTRAINT "navigation_footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns" ADD CONSTRAINT "navigation_footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_columns_locales" ADD CONSTRAINT "navigation_footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_differentiators" ADD CONSTRAINT "homepage_sections_differentiators_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_why_items" ADD CONSTRAINT "homepage_sections_why_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_sections_methodology_steps" ADD CONSTRAINT "homepage_sections_methodology_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_sections_featured_project_project_id_case_studies_id_fk" FOREIGN KEY ("sections_featured_project_project_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_differentiators" ADD CONSTRAINT "_homepage_v_version_sections_differentiators_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_why_items" ADD CONSTRAINT "_homepage_v_version_sections_why_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_sections_methodology_steps" ADD CONSTRAINT "_homepage_v_version_sections_methodology_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_sections_featured_project_project_id_case_studies_id_fk" FOREIGN KEY ("version_sections_featured_project_project_id") REFERENCES "public"."case_studies"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_locales" ADD CONSTRAINT "_homepage_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_settings_sitemap_includes" ADD CONSTRAINT "seo_settings_sitemap_includes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."seo_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "seo_settings" ADD CONSTRAINT "seo_settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "seo_settings_locales" ADD CONSTRAINT "seo_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."seo_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "form_settings_locales" ADD CONSTRAINT "form_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."form_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_sensitivity_screening_sensitivity_screening_status_idx" ON "media" USING btree ("sensitivity_screening_status");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_texts_order_parent" ON "media_texts" USING btree ("order","parent_id");
  CREATE INDEX "services_deliverables_order_idx" ON "services_deliverables" USING btree ("_order");
  CREATE INDEX "services_deliverables_parent_id_idx" ON "services_deliverables" USING btree ("_parent_id");
  CREATE INDEX "services_deliverables_locale_idx" ON "services_deliverables" USING btree ("_locale");
  CREATE INDEX "services_process_steps_order_idx" ON "services_process_steps" USING btree ("_order");
  CREATE INDEX "services_process_steps_parent_id_idx" ON "services_process_steps" USING btree ("_parent_id");
  CREATE INDEX "services_process_steps_locale_idx" ON "services_process_steps" USING btree ("_locale");
  CREATE INDEX "services_faqs_order_idx" ON "services_faqs" USING btree ("_order");
  CREATE INDEX "services_faqs_parent_id_idx" ON "services_faqs" USING btree ("_parent_id");
  CREATE INDEX "services_faqs_locale_idx" ON "services_faqs" USING btree ("_locale");
  CREATE INDEX "services_published_locales_order_idx" ON "services_published_locales" USING btree ("order");
  CREATE INDEX "services_published_locales_parent_idx" ON "services_published_locales" USING btree ("parent_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_seo_seo_og_image_idx" ON "services" USING btree ("seo_og_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "services_texts_order_parent" ON "services_texts" USING btree ("order","parent_id");
  CREATE INDEX "services_texts_locale_parent" ON "services_texts" USING btree ("locale","parent_id");
  CREATE INDEX "services_rels_order_idx" ON "services_rels" USING btree ("order");
  CREATE INDEX "services_rels_parent_idx" ON "services_rels" USING btree ("parent_id");
  CREATE INDEX "services_rels_path_idx" ON "services_rels" USING btree ("path");
  CREATE INDEX "services_rels_case_studies_id_idx" ON "services_rels" USING btree ("case_studies_id");
  CREATE INDEX "_services_v_version_deliverables_order_idx" ON "_services_v_version_deliverables" USING btree ("_order");
  CREATE INDEX "_services_v_version_deliverables_parent_id_idx" ON "_services_v_version_deliverables" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_deliverables_locale_idx" ON "_services_v_version_deliverables" USING btree ("_locale");
  CREATE INDEX "_services_v_version_process_steps_order_idx" ON "_services_v_version_process_steps" USING btree ("_order");
  CREATE INDEX "_services_v_version_process_steps_parent_id_idx" ON "_services_v_version_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_process_steps_locale_idx" ON "_services_v_version_process_steps" USING btree ("_locale");
  CREATE INDEX "_services_v_version_faqs_order_idx" ON "_services_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_services_v_version_faqs_parent_id_idx" ON "_services_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faqs_locale_idx" ON "_services_v_version_faqs" USING btree ("_locale");
  CREATE INDEX "_services_v_version_published_locales_order_idx" ON "_services_v_version_published_locales" USING btree ("order");
  CREATE INDEX "_services_v_version_published_locales_parent_idx" ON "_services_v_version_published_locales" USING btree ("parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_seo_version_seo_og_image_idx" ON "_services_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE INDEX "_services_v_autosave_idx" ON "_services_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_texts_order_parent" ON "_services_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_services_v_texts_locale_parent" ON "_services_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_services_v_rels_order_idx" ON "_services_v_rels" USING btree ("order");
  CREATE INDEX "_services_v_rels_parent_idx" ON "_services_v_rels" USING btree ("parent_id");
  CREATE INDEX "_services_v_rels_path_idx" ON "_services_v_rels" USING btree ("path");
  CREATE INDEX "_services_v_rels_case_studies_id_idx" ON "_services_v_rels" USING btree ("case_studies_id");
  CREATE INDEX "case_studies_published_locales_order_idx" ON "case_studies_published_locales" USING btree ("order");
  CREATE INDEX "case_studies_published_locales_parent_idx" ON "case_studies_published_locales" USING btree ("parent_id");
  CREATE UNIQUE INDEX "case_studies_slug_idx" ON "case_studies" USING btree ("slug");
  CREATE INDEX "case_studies_project_type_idx" ON "case_studies" USING btree ("project_type");
  CREATE INDEX "case_studies_cover_image_idx" ON "case_studies" USING btree ("cover_image_id");
  CREATE INDEX "case_studies_client_client_logo_idx" ON "case_studies" USING btree ("client_logo_id");
  CREATE INDEX "case_studies_client_client_approval_status_idx" ON "case_studies" USING btree ("client_approval_status");
  CREATE INDEX "case_studies_seo_seo_og_image_idx" ON "case_studies" USING btree ("seo_og_image_id");
  CREATE INDEX "case_studies_updated_at_idx" ON "case_studies" USING btree ("updated_at");
  CREATE INDEX "case_studies_created_at_idx" ON "case_studies" USING btree ("created_at");
  CREATE INDEX "case_studies__status_idx" ON "case_studies" USING btree ("_status");
  CREATE UNIQUE INDEX "case_studies_locales_locale_parent_id_unique" ON "case_studies_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "case_studies_texts_order_parent" ON "case_studies_texts" USING btree ("order","parent_id");
  CREATE INDEX "case_studies_texts_locale_parent" ON "case_studies_texts" USING btree ("locale","parent_id");
  CREATE INDEX "case_studies_rels_order_idx" ON "case_studies_rels" USING btree ("order");
  CREATE INDEX "case_studies_rels_parent_idx" ON "case_studies_rels" USING btree ("parent_id");
  CREATE INDEX "case_studies_rels_path_idx" ON "case_studies_rels" USING btree ("path");
  CREATE INDEX "case_studies_rels_media_id_idx" ON "case_studies_rels" USING btree ("media_id");
  CREATE INDEX "_case_studies_v_version_published_locales_order_idx" ON "_case_studies_v_version_published_locales" USING btree ("order");
  CREATE INDEX "_case_studies_v_version_published_locales_parent_idx" ON "_case_studies_v_version_published_locales" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_parent_idx" ON "_case_studies_v" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_version_version_slug_idx" ON "_case_studies_v" USING btree ("version_slug");
  CREATE INDEX "_case_studies_v_version_version_project_type_idx" ON "_case_studies_v" USING btree ("version_project_type");
  CREATE INDEX "_case_studies_v_version_version_cover_image_idx" ON "_case_studies_v" USING btree ("version_cover_image_id");
  CREATE INDEX "_case_studies_v_version_client_version_client_logo_idx" ON "_case_studies_v" USING btree ("version_client_logo_id");
  CREATE INDEX "_case_studies_v_version_client_version_client_approval_s_idx" ON "_case_studies_v" USING btree ("version_client_approval_status");
  CREATE INDEX "_case_studies_v_version_seo_version_seo_og_image_idx" ON "_case_studies_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_case_studies_v_version_version_updated_at_idx" ON "_case_studies_v" USING btree ("version_updated_at");
  CREATE INDEX "_case_studies_v_version_version_created_at_idx" ON "_case_studies_v" USING btree ("version_created_at");
  CREATE INDEX "_case_studies_v_version_version__status_idx" ON "_case_studies_v" USING btree ("version__status");
  CREATE INDEX "_case_studies_v_created_at_idx" ON "_case_studies_v" USING btree ("created_at");
  CREATE INDEX "_case_studies_v_updated_at_idx" ON "_case_studies_v" USING btree ("updated_at");
  CREATE INDEX "_case_studies_v_snapshot_idx" ON "_case_studies_v" USING btree ("snapshot");
  CREATE INDEX "_case_studies_v_published_locale_idx" ON "_case_studies_v" USING btree ("published_locale");
  CREATE INDEX "_case_studies_v_latest_idx" ON "_case_studies_v" USING btree ("latest");
  CREATE INDEX "_case_studies_v_autosave_idx" ON "_case_studies_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_case_studies_v_locales_locale_parent_id_unique" ON "_case_studies_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_case_studies_v_texts_order_parent" ON "_case_studies_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "_case_studies_v_texts_locale_parent" ON "_case_studies_v_texts" USING btree ("locale","parent_id");
  CREATE INDEX "_case_studies_v_rels_order_idx" ON "_case_studies_v_rels" USING btree ("order");
  CREATE INDEX "_case_studies_v_rels_parent_idx" ON "_case_studies_v_rels" USING btree ("parent_id");
  CREATE INDEX "_case_studies_v_rels_path_idx" ON "_case_studies_v_rels" USING btree ("path");
  CREATE INDEX "_case_studies_v_rels_media_id_idx" ON "_case_studies_v_rels" USING btree ("media_id");
  CREATE INDEX "technical_initiatives_published_locales_order_idx" ON "technical_initiatives_published_locales" USING btree ("order");
  CREATE INDEX "technical_initiatives_published_locales_parent_idx" ON "technical_initiatives_published_locales" USING btree ("parent_id");
  CREATE INDEX "technical_initiatives_status_idx" ON "technical_initiatives" USING btree ("status");
  CREATE INDEX "technical_initiatives_updated_at_idx" ON "technical_initiatives" USING btree ("updated_at");
  CREATE INDEX "technical_initiatives_created_at_idx" ON "technical_initiatives" USING btree ("created_at");
  CREATE INDEX "technical_initiatives__status_idx" ON "technical_initiatives" USING btree ("_status");
  CREATE UNIQUE INDEX "technical_initiatives_locales_locale_parent_id_unique" ON "technical_initiatives_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "technical_initiatives_rels_order_idx" ON "technical_initiatives_rels" USING btree ("order");
  CREATE INDEX "technical_initiatives_rels_parent_idx" ON "technical_initiatives_rels" USING btree ("parent_id");
  CREATE INDEX "technical_initiatives_rels_path_idx" ON "technical_initiatives_rels" USING btree ("path");
  CREATE INDEX "technical_initiatives_rels_media_id_idx" ON "technical_initiatives_rels" USING btree ("media_id");
  CREATE INDEX "_technical_initiatives_v_version_published_locales_order_idx" ON "_technical_initiatives_v_version_published_locales" USING btree ("order");
  CREATE INDEX "_technical_initiatives_v_version_published_locales_parent_idx" ON "_technical_initiatives_v_version_published_locales" USING btree ("parent_id");
  CREATE INDEX "_technical_initiatives_v_parent_idx" ON "_technical_initiatives_v" USING btree ("parent_id");
  CREATE INDEX "_technical_initiatives_v_version_version_status_idx" ON "_technical_initiatives_v" USING btree ("version_status");
  CREATE INDEX "_technical_initiatives_v_version_version_updated_at_idx" ON "_technical_initiatives_v" USING btree ("version_updated_at");
  CREATE INDEX "_technical_initiatives_v_version_version_created_at_idx" ON "_technical_initiatives_v" USING btree ("version_created_at");
  CREATE INDEX "_technical_initiatives_v_version_version__status_idx" ON "_technical_initiatives_v" USING btree ("version__status");
  CREATE INDEX "_technical_initiatives_v_created_at_idx" ON "_technical_initiatives_v" USING btree ("created_at");
  CREATE INDEX "_technical_initiatives_v_updated_at_idx" ON "_technical_initiatives_v" USING btree ("updated_at");
  CREATE INDEX "_technical_initiatives_v_snapshot_idx" ON "_technical_initiatives_v" USING btree ("snapshot");
  CREATE INDEX "_technical_initiatives_v_published_locale_idx" ON "_technical_initiatives_v" USING btree ("published_locale");
  CREATE INDEX "_technical_initiatives_v_latest_idx" ON "_technical_initiatives_v" USING btree ("latest");
  CREATE INDEX "_technical_initiatives_v_autosave_idx" ON "_technical_initiatives_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_technical_initiatives_v_locales_locale_parent_id_unique" ON "_technical_initiatives_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_technical_initiatives_v_rels_order_idx" ON "_technical_initiatives_v_rels" USING btree ("order");
  CREATE INDEX "_technical_initiatives_v_rels_parent_idx" ON "_technical_initiatives_v_rels" USING btree ("parent_id");
  CREATE INDEX "_technical_initiatives_v_rels_path_idx" ON "_technical_initiatives_v_rels" USING btree ("path");
  CREATE INDEX "_technical_initiatives_v_rels_media_id_idx" ON "_technical_initiatives_v_rels" USING btree ("media_id");
  CREATE INDEX "team_members_published_locales_order_idx" ON "team_members_published_locales" USING btree ("order");
  CREATE INDEX "team_members_published_locales_parent_idx" ON "team_members_published_locales" USING btree ("parent_id");
  CREATE INDEX "team_members_photo_idx" ON "team_members" USING btree ("photo_id");
  CREATE INDEX "team_members_updated_at_idx" ON "team_members" USING btree ("updated_at");
  CREATE INDEX "team_members_created_at_idx" ON "team_members" USING btree ("created_at");
  CREATE INDEX "team_members__status_idx" ON "team_members" USING btree ("_status");
  CREATE UNIQUE INDEX "team_members_locales_locale_parent_id_unique" ON "team_members_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_team_members_v_version_published_locales_order_idx" ON "_team_members_v_version_published_locales" USING btree ("order");
  CREATE INDEX "_team_members_v_version_published_locales_parent_idx" ON "_team_members_v_version_published_locales" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_parent_idx" ON "_team_members_v" USING btree ("parent_id");
  CREATE INDEX "_team_members_v_version_version_photo_idx" ON "_team_members_v" USING btree ("version_photo_id");
  CREATE INDEX "_team_members_v_version_version_updated_at_idx" ON "_team_members_v" USING btree ("version_updated_at");
  CREATE INDEX "_team_members_v_version_version_created_at_idx" ON "_team_members_v" USING btree ("version_created_at");
  CREATE INDEX "_team_members_v_version_version__status_idx" ON "_team_members_v" USING btree ("version__status");
  CREATE INDEX "_team_members_v_created_at_idx" ON "_team_members_v" USING btree ("created_at");
  CREATE INDEX "_team_members_v_updated_at_idx" ON "_team_members_v" USING btree ("updated_at");
  CREATE INDEX "_team_members_v_snapshot_idx" ON "_team_members_v" USING btree ("snapshot");
  CREATE INDEX "_team_members_v_published_locale_idx" ON "_team_members_v" USING btree ("published_locale");
  CREATE INDEX "_team_members_v_latest_idx" ON "_team_members_v" USING btree ("latest");
  CREATE INDEX "_team_members_v_autosave_idx" ON "_team_members_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_team_members_v_locales_locale_parent_id_unique" ON "_team_members_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_content_rich_text_order_idx" ON "pages_blocks_content_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_content_rich_text_parent_id_idx" ON "pages_blocks_content_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_content_rich_text_path_idx" ON "pages_blocks_content_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_content_rich_text_locale_idx" ON "pages_blocks_content_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_grid_items_order_idx" ON "pages_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_items_parent_id_idx" ON "pages_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_items_locale_idx" ON "pages_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_feature_grid_order_idx" ON "pages_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_grid_parent_id_idx" ON "pages_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_grid_path_idx" ON "pages_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_grid_locale_idx" ON "pages_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_accordion_faqs_order_idx" ON "pages_blocks_faq_accordion_faqs" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_accordion_faqs_parent_id_idx" ON "pages_blocks_faq_accordion_faqs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_accordion_faqs_locale_idx" ON "pages_blocks_faq_accordion_faqs" USING btree ("_locale");
  CREATE INDEX "pages_blocks_faq_accordion_order_idx" ON "pages_blocks_faq_accordion" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_accordion_parent_id_idx" ON "pages_blocks_faq_accordion" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_accordion_path_idx" ON "pages_blocks_faq_accordion" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_accordion_locale_idx" ON "pages_blocks_faq_accordion" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_banner_order_idx" ON "pages_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_banner_parent_id_idx" ON "pages_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_banner_path_idx" ON "pages_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_banner_locale_idx" ON "pages_blocks_cta_banner" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_text_order_idx" ON "pages_blocks_media_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_text_parent_id_idx" ON "pages_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_text_path_idx" ON "pages_blocks_media_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_text_locale_idx" ON "pages_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_media_text_image_idx" ON "pages_blocks_media_text" USING btree ("image_id");
  CREATE INDEX "pages_published_locales_order_idx" ON "pages_published_locales" USING btree ("order");
  CREATE INDEX "pages_published_locales_parent_idx" ON "pages_published_locales" USING btree ("parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_content_rich_text_order_idx" ON "_pages_v_blocks_content_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_content_rich_text_parent_id_idx" ON "_pages_v_blocks_content_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_content_rich_text_path_idx" ON "_pages_v_blocks_content_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_content_rich_text_locale_idx" ON "_pages_v_blocks_content_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_order_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_parent_id_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_items_locale_idx" ON "_pages_v_blocks_feature_grid_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_feature_grid_order_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_grid_parent_id_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_grid_path_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_grid_locale_idx" ON "_pages_v_blocks_feature_grid" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_accordion_faqs_order_idx" ON "_pages_v_blocks_faq_accordion_faqs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_accordion_faqs_parent_id_idx" ON "_pages_v_blocks_faq_accordion_faqs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_accordion_faqs_locale_idx" ON "_pages_v_blocks_faq_accordion_faqs" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_faq_accordion_order_idx" ON "_pages_v_blocks_faq_accordion" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_accordion_parent_id_idx" ON "_pages_v_blocks_faq_accordion" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_accordion_path_idx" ON "_pages_v_blocks_faq_accordion" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_accordion_locale_idx" ON "_pages_v_blocks_faq_accordion" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_banner_order_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_banner_parent_id_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_banner_path_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_banner_locale_idx" ON "_pages_v_blocks_cta_banner" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_text_order_idx" ON "_pages_v_blocks_media_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_text_parent_id_idx" ON "_pages_v_blocks_media_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_text_path_idx" ON "_pages_v_blocks_media_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_text_locale_idx" ON "_pages_v_blocks_media_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_media_text_image_idx" ON "_pages_v_blocks_media_text" USING btree ("image_id");
  CREATE INDEX "_pages_v_version_published_locales_order_idx" ON "_pages_v_version_published_locales" USING btree ("order");
  CREATE INDEX "_pages_v_version_published_locales_parent_idx" ON "_pages_v_version_published_locales" USING btree ("parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "leads_notes_order_idx" ON "leads_notes" USING btree ("_order");
  CREATE INDEX "leads_notes_parent_id_idx" ON "leads_notes" USING btree ("_parent_id");
  CREATE INDEX "leads_notes_author_idx" ON "leads_notes" USING btree ("author_id");
  CREATE UNIQUE INDEX "leads_reference_code_idx" ON "leads" USING btree ("reference_code");
  CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");
  CREATE INDEX "leads_ip_hash_idx" ON "leads" USING btree ("ip_hash");
  CREATE INDEX "leads_submitted_at_idx" ON "leads" USING btree ("submitted_at");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_assigned_to_idx" ON "leads" USING btree ("assigned_to_id");
  CREATE INDEX "social_links_updated_at_idx" ON "social_links" USING btree ("updated_at");
  CREATE INDEX "social_links_created_at_idx" ON "social_links" USING btree ("created_at");
  CREATE UNIQUE INDEX "social_links_locales_locale_parent_id_unique" ON "social_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "audit_logs_actor_idx" ON "audit_logs" USING btree ("actor_id");
  CREATE INDEX "audit_logs_event_type_idx" ON "audit_logs" USING btree ("event_type");
  CREATE INDEX "backup_records_status_idx" ON "backup_records" USING btree ("status");
  CREATE INDEX "backup_records_started_at_idx" ON "backup_records" USING btree ("started_at");
  CREATE INDEX "backup_records_triggered_by_idx" ON "backup_records" USING btree ("triggered_by_id");
  CREATE UNIQUE INDEX "preview_codes_jti_hash_idx" ON "preview_codes" USING btree ("jti_hash");
  CREATE INDEX "preview_codes_expires_at_idx" ON "preview_codes" USING btree ("expires_at");
  CREATE INDEX "preview_codes_used_idx" ON "preview_codes" USING btree ("used");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_case_studies_id_idx" ON "payload_locked_documents_rels" USING btree ("case_studies_id");
  CREATE INDEX "payload_locked_documents_rels_technical_initiatives_id_idx" ON "payload_locked_documents_rels" USING btree ("technical_initiatives_id");
  CREATE INDEX "payload_locked_documents_rels_team_members_id_idx" ON "payload_locked_documents_rels" USING btree ("team_members_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_social_links_id_idx" ON "payload_locked_documents_rels" USING btree ("social_links_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_locked_documents_rels_audit_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("audit_logs_id");
  CREATE INDEX "payload_locked_documents_rels_backup_records_id_idx" ON "payload_locked_documents_rels" USING btree ("backup_records_id");
  CREATE INDEX "payload_locked_documents_rels_preview_codes_id_idx" ON "payload_locked_documents_rels" USING btree ("preview_codes_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "site_settings_logo_dark_idx" ON "site_settings" USING btree ("logo_dark_id");
  CREATE INDEX "site_settings_logo_light_idx" ON "site_settings" USING btree ("logo_light_id");
  CREATE INDEX "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
  CREATE INDEX "site_settings_default_og_image_idx" ON "site_settings" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_header_items_order_idx" ON "navigation_header_items" USING btree ("_order");
  CREATE INDEX "navigation_header_items_parent_id_idx" ON "navigation_header_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_items_locales_locale_parent_id_unique" ON "navigation_header_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_columns_links_order_idx" ON "navigation_footer_columns_links" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_links_parent_id_idx" ON "navigation_footer_columns_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_columns_links_locales_locale_parent_id_uni" ON "navigation_footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_footer_columns_order_idx" ON "navigation_footer_columns" USING btree ("_order");
  CREATE INDEX "navigation_footer_columns_parent_id_idx" ON "navigation_footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_columns_locales_locale_parent_id_unique" ON "navigation_footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_sections_differentiators_order_idx" ON "homepage_sections_differentiators" USING btree ("_order");
  CREATE INDEX "homepage_sections_differentiators_parent_id_idx" ON "homepage_sections_differentiators" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_differentiators_locale_idx" ON "homepage_sections_differentiators" USING btree ("_locale");
  CREATE INDEX "homepage_sections_why_items_order_idx" ON "homepage_sections_why_items" USING btree ("_order");
  CREATE INDEX "homepage_sections_why_items_parent_id_idx" ON "homepage_sections_why_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_why_items_locale_idx" ON "homepage_sections_why_items" USING btree ("_locale");
  CREATE INDEX "homepage_sections_methodology_steps_order_idx" ON "homepage_sections_methodology_steps" USING btree ("_order");
  CREATE INDEX "homepage_sections_methodology_steps_parent_id_idx" ON "homepage_sections_methodology_steps" USING btree ("_parent_id");
  CREATE INDEX "homepage_sections_methodology_steps_locale_idx" ON "homepage_sections_methodology_steps" USING btree ("_locale");
  CREATE INDEX "homepage_sections_featured_project_sections_featured_pro_idx" ON "homepage" USING btree ("sections_featured_project_project_id");
  CREATE INDEX "homepage__status_idx" ON "homepage" USING btree ("_status");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_homepage_v_version_sections_differentiators_order_idx" ON "_homepage_v_version_sections_differentiators" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_differentiators_parent_id_idx" ON "_homepage_v_version_sections_differentiators" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_differentiators_locale_idx" ON "_homepage_v_version_sections_differentiators" USING btree ("_locale");
  CREATE INDEX "_homepage_v_version_sections_why_items_order_idx" ON "_homepage_v_version_sections_why_items" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_why_items_parent_id_idx" ON "_homepage_v_version_sections_why_items" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_why_items_locale_idx" ON "_homepage_v_version_sections_why_items" USING btree ("_locale");
  CREATE INDEX "_homepage_v_version_sections_methodology_steps_order_idx" ON "_homepage_v_version_sections_methodology_steps" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_sections_methodology_steps_parent_id_idx" ON "_homepage_v_version_sections_methodology_steps" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_sections_methodology_steps_locale_idx" ON "_homepage_v_version_sections_methodology_steps" USING btree ("_locale");
  CREATE INDEX "_homepage_v_version_sections_featured_project_version_se_idx" ON "_homepage_v" USING btree ("version_sections_featured_project_project_id");
  CREATE INDEX "_homepage_v_version_version__status_idx" ON "_homepage_v" USING btree ("version__status");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_snapshot_idx" ON "_homepage_v" USING btree ("snapshot");
  CREATE INDEX "_homepage_v_published_locale_idx" ON "_homepage_v" USING btree ("published_locale");
  CREATE INDEX "_homepage_v_latest_idx" ON "_homepage_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_homepage_v_locales_locale_parent_id_unique" ON "_homepage_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "seo_settings_sitemap_includes_order_idx" ON "seo_settings_sitemap_includes" USING btree ("order");
  CREATE INDEX "seo_settings_sitemap_includes_parent_idx" ON "seo_settings_sitemap_includes" USING btree ("parent_id");
  CREATE INDEX "seo_settings_default_og_image_idx" ON "seo_settings" USING btree ("default_og_image_id");
  CREATE UNIQUE INDEX "seo_settings_locales_locale_parent_id_unique" ON "seo_settings_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "form_settings_locales_locale_parent_id_unique" ON "form_settings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "media_texts" CASCADE;
  DROP TABLE "services_deliverables" CASCADE;
  DROP TABLE "services_process_steps" CASCADE;
  DROP TABLE "services_faqs" CASCADE;
  DROP TABLE "services_published_locales" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "services_texts" CASCADE;
  DROP TABLE "services_rels" CASCADE;
  DROP TABLE "_services_v_version_deliverables" CASCADE;
  DROP TABLE "_services_v_version_process_steps" CASCADE;
  DROP TABLE "_services_v_version_faqs" CASCADE;
  DROP TABLE "_services_v_version_published_locales" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "_services_v_texts" CASCADE;
  DROP TABLE "_services_v_rels" CASCADE;
  DROP TABLE "case_studies_published_locales" CASCADE;
  DROP TABLE "case_studies" CASCADE;
  DROP TABLE "case_studies_locales" CASCADE;
  DROP TABLE "case_studies_texts" CASCADE;
  DROP TABLE "case_studies_rels" CASCADE;
  DROP TABLE "_case_studies_v_version_published_locales" CASCADE;
  DROP TABLE "_case_studies_v" CASCADE;
  DROP TABLE "_case_studies_v_locales" CASCADE;
  DROP TABLE "_case_studies_v_texts" CASCADE;
  DROP TABLE "_case_studies_v_rels" CASCADE;
  DROP TABLE "technical_initiatives_published_locales" CASCADE;
  DROP TABLE "technical_initiatives" CASCADE;
  DROP TABLE "technical_initiatives_locales" CASCADE;
  DROP TABLE "technical_initiatives_rels" CASCADE;
  DROP TABLE "_technical_initiatives_v_version_published_locales" CASCADE;
  DROP TABLE "_technical_initiatives_v" CASCADE;
  DROP TABLE "_technical_initiatives_v_locales" CASCADE;
  DROP TABLE "_technical_initiatives_v_rels" CASCADE;
  DROP TABLE "team_members_published_locales" CASCADE;
  DROP TABLE "team_members" CASCADE;
  DROP TABLE "team_members_locales" CASCADE;
  DROP TABLE "_team_members_v_version_published_locales" CASCADE;
  DROP TABLE "_team_members_v" CASCADE;
  DROP TABLE "_team_members_v_locales" CASCADE;
  DROP TABLE "pages_blocks_content_rich_text" CASCADE;
  DROP TABLE "pages_blocks_feature_grid_items" CASCADE;
  DROP TABLE "pages_blocks_feature_grid" CASCADE;
  DROP TABLE "pages_blocks_faq_accordion_faqs" CASCADE;
  DROP TABLE "pages_blocks_faq_accordion" CASCADE;
  DROP TABLE "pages_blocks_cta_banner" CASCADE;
  DROP TABLE "pages_blocks_media_text" CASCADE;
  DROP TABLE "pages_published_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_content_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid_items" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_accordion_faqs" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_accordion" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_media_text" CASCADE;
  DROP TABLE "_pages_v_version_published_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "leads_notes" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "social_links" CASCADE;
  DROP TABLE "social_links_locales" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "audit_logs" CASCADE;
  DROP TABLE "backup_records" CASCADE;
  DROP TABLE "preview_codes" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "theme_settings" CASCADE;
  DROP TABLE "navigation_header_items" CASCADE;
  DROP TABLE "navigation_header_items_locales" CASCADE;
  DROP TABLE "navigation_footer_columns_links" CASCADE;
  DROP TABLE "navigation_footer_columns_links_locales" CASCADE;
  DROP TABLE "navigation_footer_columns" CASCADE;
  DROP TABLE "navigation_footer_columns_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  DROP TABLE "homepage_sections_differentiators" CASCADE;
  DROP TABLE "homepage_sections_why_items" CASCADE;
  DROP TABLE "homepage_sections_methodology_steps" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "_homepage_v_version_sections_differentiators" CASCADE;
  DROP TABLE "_homepage_v_version_sections_why_items" CASCADE;
  DROP TABLE "_homepage_v_version_sections_methodology_steps" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_locales" CASCADE;
  DROP TABLE "seo_settings_sitemap_includes" CASCADE;
  DROP TABLE "seo_settings" CASCADE;
  DROP TABLE "seo_settings_locales" CASCADE;
  DROP TABLE "form_settings" CASCADE;
  DROP TABLE "form_settings_locales" CASCADE;
  DROP TABLE "backup_settings" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_users_preferred_admin_locale";
  DROP TYPE "public"."enum_media_category";
  DROP TYPE "public"."enum_media_visibility";
  DROP TYPE "public"."enum_media_sensitivity_screening_status";
  DROP TYPE "public"."enum_services_published_locales";
  DROP TYPE "public"."enum_services_icon";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_published_locales";
  DROP TYPE "public"."enum__services_v_version_icon";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_case_studies_published_locales";
  DROP TYPE "public"."enum_case_studies_project_type";
  DROP TYPE "public"."enum_case_studies_client_approval_status";
  DROP TYPE "public"."enum_case_studies_status";
  DROP TYPE "public"."enum__case_studies_v_version_published_locales";
  DROP TYPE "public"."enum__case_studies_v_version_project_type";
  DROP TYPE "public"."enum__case_studies_v_version_client_approval_status";
  DROP TYPE "public"."enum__case_studies_v_version_status";
  DROP TYPE "public"."enum__case_studies_v_published_locale";
  DROP TYPE "public"."enum_technical_initiatives_published_locales";
  DROP TYPE "public"."enum_technical_initiatives_category";
  DROP TYPE "public"."initiative_status";
  DROP TYPE "public"."enum_technical_initiatives_status";
  DROP TYPE "public"."enum__technical_initiatives_v_version_published_locales";
  DROP TYPE "public"."enum__technical_initiatives_v_version_category";
  DROP TYPE "public"."enum__technical_initiatives_v_version_status";
  DROP TYPE "public"."enum__technical_initiatives_v_published_locale";
  DROP TYPE "public"."enum_team_members_published_locales";
  DROP TYPE "public"."enum_team_members_status";
  DROP TYPE "public"."enum__team_members_v_version_published_locales";
  DROP TYPE "public"."enum__team_members_v_version_status";
  DROP TYPE "public"."enum__team_members_v_published_locale";
  DROP TYPE "public"."enum_pages_blocks_media_text_layout";
  DROP TYPE "public"."enum_pages_published_locales";
  DROP TYPE "public"."enum_pages_content_origin";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_media_text_layout";
  DROP TYPE "public"."enum__pages_v_version_published_locales";
  DROP TYPE "public"."enum__pages_v_version_content_origin";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
  DROP TYPE "public"."enum_leads_service_interest";
  DROP TYPE "public"."enum_leads_source_locale";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_social_links_platform";
  DROP TYPE "public"."enum_redirects_status_code";
  DROP TYPE "public"."enum_audit_logs_event_type";
  DROP TYPE "public"."enum_backup_records_type";
  DROP TYPE "public"."enum_backup_records_status";
  DROP TYPE "public"."enum_backup_records_verification_status";
  DROP TYPE "public"."enum_theme_settings_color_preset";
  DROP TYPE "public"."enum_theme_settings_default_mode";
  DROP TYPE "public"."enum_theme_settings_button_style";
  DROP TYPE "public"."enum_theme_settings_border_radius";
  DROP TYPE "public"."enum_homepage_hero_background_pattern";
  DROP TYPE "public"."fb";
  DROP TYPE "public"."enum_homepage_status";
  DROP TYPE "public"."enum__homepage_v_version_hero_background_pattern";
  DROP TYPE "public"."enum__homepage_v_version_status";
  DROP TYPE "public"."enum__homepage_v_published_locale";
  DROP TYPE "public"."enum_seo_settings_sitemap_includes";
  DROP TYPE "public"."enum_backup_settings_schedule_frequency";
  DROP TYPE "public"."enum_backup_settings_destination_status";`)
}
