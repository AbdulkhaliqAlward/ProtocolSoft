/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Preview surfaces (OD2): never cached, never referrer-leaked, never indexed.
        source: '/preview',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        // Preview code exchange: config headers OVERRIDE route-handler headers of
        // the same name, so the no-referrer guarantee must live here as well (the
        // global `/:path*` entry would otherwise win over the route's own header).
        source: '/api/preview/:path*',
        headers: [
          { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
  // Workspace sources use NodeNext `.js` specifiers pointing at `.ts` files;
  // webpack needs the alias to resolve them in the Next build.
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

export default nextConfig;
