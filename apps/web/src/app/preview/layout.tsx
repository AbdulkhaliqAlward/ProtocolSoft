/** Root layout for draft previews (outside the public [locale] tree). */
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { DocumentShell } from '@/components/DocumentShell';
import { siteUrl } from '@/lib/env';

export const metadata: Metadata = { metadataBase: new URL(siteUrl()), robots: { index: false, follow: false } };

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return <DocumentShell lang="ar" dir="rtl">{children}</DocumentShell>;
}
