/* tunnel: admin route — Payload admin panel (admin.protosoftdev.com only, noindex at proxy/edge) */
import { RootPage } from '@payloadcms/next/views';
import type { Metadata } from 'next';
import configPromise from '@payload-config';
import { importMap } from '../importMap.js';

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'بروتوكول سوفت — لوحة التحكم',
    robots: { index: false, follow: false },
  };
};

const Page = ({ params, searchParams }: Args) => (
  <RootPage config={configPromise} importMap={importMap} params={params} searchParams={searchParams} />
);

export default Page;
