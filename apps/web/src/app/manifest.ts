import type { MetadataRoute } from 'next';

/** Web app manifest: brand pair from the logo (purple #2E0661 / cream #FEF0E1). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'بروتوكول سوفت | Protocol Soft',
    short_name: 'Protocol Soft',
    lang: 'ar',
    dir: 'rtl',
    start_url: '/',
    display: 'browser',
    background_color: '#FEF0E1',
    theme_color: '#2E0661',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
