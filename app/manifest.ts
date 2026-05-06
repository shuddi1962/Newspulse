import { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: env.NEXT_PUBLIC_SITE_NAME,
    short_name: 'NewsPulse',
    description: 'Production-grade all-in-one publishing and community platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#0F1419',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
