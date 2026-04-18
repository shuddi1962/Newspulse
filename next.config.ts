import type { NextConfig } from 'next';

const insforgeHost = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_INSFORGE_URL;
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
})();

const extraImageHosts = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? '')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  typescript: {
    // `npm run typecheck` runs tsc separately in CI. Skipping the in-build
    // worker avoids a Next.js 16 OOM on Windows.
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...(insforgeHost
        ? [{ protocol: 'https' as const, hostname: insforgeHost, pathname: '/**' }]
        : []),
      ...extraImageHosts.map((hostname) => ({
        protocol: 'https' as const,
        hostname,
        pathname: '/**',
      })),
      // Editorial demo imagery sources (Phase 1–2). Replace with CDN in production.
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
};

export default nextConfig;
