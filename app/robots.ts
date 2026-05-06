import { env } from '@/lib/env';

export default function robots(): Response {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;

  return new Response(
    [
      `User-agent: *`,
      `Allow: /`,
      ``,
      `Sitemap: ${siteUrl}/sitemap.xml`,
      ``,
      `# Admin and auth routes`,
      `Disallow: /admin/`,
      `Disallow: /login`,
      `Disallow: /signup`,
      `Disallow: /forgot-password`,
      `Disallow: /reset-password`,
      `Disallow: /account/`,
      ``,
      `# API routes`,
      `Disallow: /api/`,
      ``,
      `# Advertiser dashboard`,
      `Disallow: /ads/`,
      ``,
      `# Search (prevent crawl of search results)`,
      `Disallow: /search`,
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain' } },
  );
}
