import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The CMS service serves ONLY the admin panel + APIs at admin.protosoftdev.com.
  // It must never be indexed or linked publicly.
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingExcludes: {
    '*': ['../media/**', '../backups/**', './media/**', './backups/**'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  // Source uses NodeNext `.js` specifiers that point at `.ts` files (tsconfig
  // module NodeNext); webpack needs the alias to resolve them in the Next build.
  webpack: (webpackConfig) => {
    webpackConfig.resolve = {
      ...webpackConfig.resolve,
      extensionAlias: {
        ...(webpackConfig.resolve?.extensionAlias || {}),
        '.js': ['.ts', '.tsx', '.js'],
        '.mjs': ['.mts', '.mjs'],
      },
    };
    return webpackConfig;
  },
};

export default withPayload(nextConfig, { importMapUrl: new URL('src/app/(payload)/importMap.js', import.meta.url) });
