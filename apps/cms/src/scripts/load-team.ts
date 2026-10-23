/**
 * Adds the team members to the About page's team section and publishes them in
 * Arabic and English (the same mutation as the per-locale publish endpoint).
 * Safe to re-run: a member that already exists (same Arabic name) is updated in
 * place, never duplicated. Names, titles and order come from the company.
 *
 *   npm run content:load-team -w @protocol-soft/cms
 */
import { getPayload } from 'payload';

import configPromise from '../payload.config';

type Member = { sortOrder: number; ar: { name: string; jobTitle: string }; en: { name: string; jobTitle: string } };

const TEAM: Member[] = [
  {
    sortOrder: 10,
    ar: { name: 'عبدالخالق عمر الورد', jobTitle: 'معماري الأنظمة والأمن السيبراني' },
    en: { name: 'Abdulkhaliq Omar Alward', jobTitle: 'Systems & Security Architect' },
  },
  {
    sortOrder: 20,
    ar: { name: 'رشيد محمد شرف الدين', jobTitle: 'مهندس أمن التطبيقات' },
    en: { name: 'Rasheed Mohammed Sharafuddin', jobTitle: 'Application Security Engineer' },
  },
  {
    sortOrder: 30,
    ar: { name: 'رؤوف عبدالله الفلاح', jobTitle: 'مهندس أمن سيبراني' },
    en: { name: 'Raouf Abdullah Alfallah', jobTitle: 'Cybersecurity Engineer' },
  },
];

const run = async (): Promise<void> => {
  const payload = await getPayload({ config: configPromise });

  for (const m of TEAM) {
    const found = await payload.find({
      collection: 'team-members',
      where: { name: { equals: m.ar.name } },
      locale: 'ar',
      limit: 1,
      draft: true,
      overrideAccess: true,
    });
    let id = found.docs[0]?.id;
    if (id == null) {
      const created = await payload.create({
        collection: 'team-members',
        locale: 'ar',
        draft: true,
        overrideAccess: true,
        data: { ...m.ar, visible: true, sortOrder: m.sortOrder, _status: 'draft' } as never,
      });
      id = created.id;
    }
    for (const locale of ['ar', 'en'] as const) {
      await payload.update({
        collection: 'team-members',
        id,
        locale,
        draft: true,
        overrideAccess: true,
        data: { ...m[locale], visible: true, sortOrder: m.sortOrder } as never,
      });
    }
    await payload.update({
      collection: 'team-members',
      id,
      draft: true,
      overrideAccess: true,
      data: { _status: 'published', publishedLocales: ['ar', 'en'] } as never,
    });
    console.log(`team member published (ar+en): ${m.en.name}`);
  }
  process.exit(0);
};

void run();
