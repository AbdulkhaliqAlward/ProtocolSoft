/**
 * Homepage (Phase 2 §5.1.4): per-section bilingual copy, enable/order, anchored hero
 * + final CTA. featuredProject defaults to NONE — must reference a gate-passing
 * project; technicalInitiatives is DISABLED at launch (D2). The homepage must look
 * complete without EDR content and without a featured project (fallback modes).
 */
import type { GlobalConfig } from 'payload';

import { requireCapability } from '../access/roles.js';
import { auditGlobalChange } from '../utilities/audit.js';
import { revalidateGlobal } from '../utilities/revalidate.js';

const sectionToggle = (description: string) => ({
  name: 'enabled',
  type: 'checkbox' as const,
  defaultValue: true,
  admin: { description },
});

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'الصفحة الرئيسية / Homepage',
  admin: { group: 'المحتوى / Content' },
  access: { read: requireCapability('content_edit'), update: requireCapability('content_edit') },
  hooks: { afterChange: [auditGlobalChange('settings_changed'), revalidateGlobal('homepage')] },
  // Editorial content global: draft/publish gated exactly like content collections —
  // the public homepage endpoint serves the PUBLISHED snapshot only. Updates write
  // drafts; publishing is an explicit admin action.
  versions: { drafts: true },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            sectionToggle('مثبّت في الأعلى / anchored first'),
            { name: 'kicker', type: 'text', localized: true },
            { name: 'headline', type: 'text', required: true, localized: true, admin: { description: 'الرسالة المعتمدة: «نبني أنظمة رقمية موثوقة، ونحميها لتعمل بثقة.» / "Trusted digital systems, built and protected to run with confidence."' } },
            { name: 'subheadline', type: 'textarea', localized: true, admin: { description: 'تذكر الخدمات الثلاث / names the three services' } },
            { name: 'primaryCtaLabel', type: 'text', localized: true },
            { name: 'secondaryCtaLabel', type: 'text', localized: true },
            { name: 'secondaryCtaTarget', type: 'text', defaultValue: '/services' },
            // Phase 5 visual rebuild: decorative background patterns retired — the
            // public site renders none, so the control is fixed to 'none'.
            { name: 'backgroundPattern', type: 'select', defaultValue: 'none', options: ['none'].map((v) => ({ label: v, value: v })) },
          ],
        },
        {
          label: 'Sections',
          name: 'sections',
          fields: [
            { name: 'valueStatementEnabled', type: 'checkbox', defaultValue: true },
            { name: 'valueStatement', type: 'textarea', localized: true },
            {
              name: 'differentiators',
              type: 'array',
              maxRows: 3,
              localized: true,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'text' },
              ],
            },
            { name: 'servicesOverviewEnabled', type: 'checkbox', defaultValue: true, admin: { description: '3 بطاقات مشتقة تلقائياً من الخدمات المنشورة / auto-derived from published services' } },
            { name: 'servicesHeading', type: 'text', localized: true },
            { name: 'whyEnabled', type: 'checkbox', defaultValue: true },
            {
              name: 'whyItems',
              type: 'array',
              maxRows: 6,
              localized: true,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'description', type: 'text' },
              ],
            },
            { name: 'methodologyEnabled', type: 'checkbox', defaultValue: true },
            {
              name: 'methodologySteps',
              type: 'array',
              maxRows: 5,
              localized: true,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'promise', type: 'text' },
              ],
            },
            {
              name: 'featuredProject',
              type: 'group',
              admin: { description: 'بلا مشروع افتراضياً — يعرض فقط مشروعاً يجتاز بوابة الجاهزية؛ وإلا يعرض الوضع البديل / no default project; renders only a gate-passing project, else the fallback' },
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: true },
                { name: 'heading', type: 'text', localized: true },
                { name: 'project', type: 'relationship', relationTo: 'case-studies', admin: { description: 'لا قيمة افتراضية / no default (Phase 2 v1.3)' } },
                {
                  name: 'fallbackMode',
                  dbName: 'fb', // shortens the version-table enum below Postgres's 63-char identifier limit
                  type: 'select',
                  label: 'الوضع البديل / Fallback mode',
                  defaultValue: 'hide_section',
                  options: [
                    { label: 'إخفاء القسم / hide section', value: 'hide_section' },
                    { label: 'قسم قدرات محايد / neutral capabilities band', value: 'neutral_alternative' },
                  ],
                },
                {
                  name: 'neutralAlternative',
                  type: 'textarea',
                  localized: true,
                  admin: { description: 'نص القسم البديل المحايد المعتمد / approved neutral alternative copy' },
                },
              ],
            },
            {
              name: 'technicalInitiatives',
              type: 'group',
              admin: { description: 'معطّل عند الإطلاق (D2) — يعرض بطاقة «قيد التطوير» بالصياغة المعتمدة فقط، بلا روابط أو CTAs / disabled at launch (D2) — renders the In-Development card with approved wording only, no CTAs/links' },
              fields: [
                { name: 'enabled', type: 'checkbox', defaultValue: false },
                { name: 'heading', type: 'text', localized: true },
              ],
            },
            { name: 'secureByDesignEnabled', type: 'checkbox', defaultValue: true },
            { name: 'secureByDesign', type: 'textarea', localized: true },
          ],
        },
        {
          label: 'Final CTA',
          name: 'finalCta',
          fields: [
            sectionToggle('مثبّت في الأسفل / anchored last'),
            { name: 'heading', type: 'text', localized: true },
            { name: 'body', type: 'textarea', localized: true },
            { name: 'ctaLabel', type: 'text', localized: true },
            { name: 'ctaTarget', type: 'text', defaultValue: '/contact' },
          ],
        },
      ],
    },
  ],
};
