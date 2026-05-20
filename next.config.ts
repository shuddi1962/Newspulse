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
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.pexels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'punchng.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.premiumtimesng.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.vanguardngr.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.channelstv.com', pathname: '/**' },
      { protocol: 'https', hostname: 'dailypost.ng', pathname: '/**' },
      { protocol: 'https', hostname: 'thenationonlineng.net', pathname: '/**' },
      { protocol: 'https', hostname: 'guardian.ng', pathname: '/**' },
      { protocol: 'https', hostname: 'www.legit.ng', pathname: '/**' },
      { protocol: 'https', hostname: 'businessday.ng', pathname: '/**' },
      { protocol: 'https', hostname: 'nairametrics.com', pathname: '/**' },
      { protocol: 'https', hostname: 'techcabal.com', pathname: '/**' },
      { protocol: 'https', hostname: 'techpoint.africa', pathname: '/**' },
      { protocol: 'https', hostname: 'pulse.ng', pathname: '/**' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk', pathname: '/**' },
      { protocol: 'https', hostname: 'www.aljazeera.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media.npr.org', pathname: '/**' },
      { protocol: 'https', hostname: 'media.wired.com', pathname: '/**' },
      { protocol: 'https', hostname: 'techcrunch.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.vox-cdn.com', pathname: '/**' },
      { protocol: 'https', hostname: 'www.who.int', pathname: '/**' },
      { protocol: 'https', hostname: 'www.nasa.gov', pathname: '/**' },
      { protocol: 'https', hostname: '*.wp.com', pathname: '/**' },
      { protocol: 'https', hostname: '*.wordpress.com', pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
    cpus: 1,
  },
  staticPageGenerationTimeout: 300,
};

export default nextConfig;
