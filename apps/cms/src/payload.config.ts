/**
 * Payload CMS configuration (Phase 2 §5 field-level schema, implemented).
 *
 * Isolation invariants enforced here:
 *  - This service is the ONLY application runtime with PostgreSQL credentials.
 *  - Internal Public Content API = custom endpoints under /api/internal/* (Option A);
 *    the web service never talks to Payload REST/GraphQL directly.
 *  - Admin panel + all admin APIs are reachable only via the Cloudflare
 *    Access-protected admin domain (admin.protosoftdev.com).
 */
import { postgresAdapter } from '@payloadcms/db-postgres';
import { ar } from '@payloadcms/translations/languages/ar';
import { en } from '@payloadcms/translations/languages/en';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { AuditLogs } from './collections/AuditLogs';
import { BackupRecords } from './collections/BackupRecords';
import { CaseStudies } from './collections/CaseStudies';
import { Leads } from './collections/Leads';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { PreviewCodes } from './collections/PreviewCodes';
import { Redirects } from './collections/Redirects';
import { Services } from './collections/Services';
import { SocialLinks } from './collections/SocialLinks';
import { TechnicalInitiatives } from './collections/TechnicalInitiatives';
import { TeamMembers } from './collections/TeamMembers';
import { Users } from './collections/Users';
import { BackupSettings } from './globals/BackupSettings';
import { FormSettings } from './globals/FormSettings';
import { Homepage } from './globals/Homepage';
import { Navigation } from './globals/Navigation';
import { SeoSettings } from './globals/SeoSettings';
import { SiteSettings } from './globals/SiteSettings';
import { ThemeSettings } from './globals/ThemeSettings';
import { backupEndpoints } from './endpoints/internal/backup';
import { contentEndpoints } from './endpoints/internal/content';
import { leadsEndpoint } from './endpoints/internal/leads';
import { mediaEndpoint } from './endpoints/internal/media';
import { previewEndpoints } from './endpoints/internal/preview';
import { publishEndpoints } from './endpoints/publish';
import { adminLabels } from './admin/labels';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Production must never boot on a fallback secret (Phase 4 final security item):
// a missing PAYLOAD_SECRET under NODE_ENV=production is a hard startup failure.
// The one exception is `next build` itself (NEXT_PHASE=phase-production-build):
// images are built without secrets by design, and nothing built there serves
// requests; the running server is still refused without the real secret.
const buildingImage = process.env.NEXT_PHASE === 'phase-production-build';
if (process.env.NODE_ENV === 'production' && !process.env.PAYLOAD_SECRET && !buildingImage) {
  throw new Error('PAYLOAD_SECRET is required in production — refusing to start with a development fallback.');
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'dev-only-secret-change-me',
  telemetry: false,
  graphQL: { disable: true }, // REST (admin-only) + the custom internal API; GraphQL surface closed

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? 'postgresql://postgres:postgres@localhost:5432/protocol_soft',
      // Pooled connections (serverless-safe sizing; private network only — §11.3)
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    },
    // Schema changes go through committed migrations in every environment, so dev
    // exercises exactly what production runs (`npm run migrate:create` / `migrate`).
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),

  // Order = admin menu order (groups appear in the order first met):
  // content, leads, media, settings, advanced, system.
  collections: [
    Services,
    Pages,
    TeamMembers,
    SocialLinks,
    TechnicalInitiatives,
    CaseStudies,
    Leads,
    Media,
    Redirects,
    Users,
    AuditLogs,
    BackupRecords,
    PreviewCodes,
  ],

  globals: [
    Homepage,
    SiteSettings,
    FormSettings,
    Navigation,
    SeoSettings,
    ThemeSettings,
    BackupSettings,
  ],

  plugins: [adminLabels],

  endpoints: [...contentEndpoints, mediaEndpoint, leadsEndpoint, ...previewEndpoints, ...backupEndpoints, ...publishEndpoints],

  admin: {
    user: 'users',
    importMap: { baseDir: dirname },
    meta: {
      titleSuffix: '| بروتوكول سوفت',
      robots: 'noindex, nofollow', // never indexed (Phase 1 §7)
      icons: [{ rel: 'icon', type: 'image/svg+xml', url: '/icon.svg' }],
    },
    components: {
      graphics: { Logo: '/admin/Graphics#Logo', Icon: '/admin/Graphics#Icon' },
      beforeLogin: ['/admin/BeforeLogin#BeforeLogin'],
      beforeDashboard: ['/admin/Welcome#Welcome'],
      actions: ['/admin/HeaderToggles#HeaderToggles'],
    },
  },

  i18n: {
    // The admin speaks Arabic by default (RTL); English is a switch away in the account page.
    supportedLanguages: { ar, en },
    fallbackLanguage: 'ar',
    // Admin UI languages; content locales are defined per-collection (ar default).
    translations: {
      en: {
        authentication: { loggedIn: 'Welcome to Protocol Soft admin' },
      },
      ar: {
        authentication: { loggedIn: 'مرحباً بك في لوحة تحكم بروتوكول سوفت' },
      },
    } as never,
  },

  // Content locales (ar default). Collections re-declare this with their own
  // labels; globals pick it up from here (Payload reads localization at the
  // config level for globals in particular).
  localization: {
    locales: [
      { code: 'ar', label: { ar: 'العربية', en: 'Arabic' } },
      { code: 'en', label: { ar: 'الإنجليزية', en: 'English' } },
    ],
    defaultLocale: 'ar',
    fallback: false,
  },

  typescript: {
    outputFile: path.resolve(dirname, './payload-types.ts'),
  },

  editor: lexicalEditor({}),
});
