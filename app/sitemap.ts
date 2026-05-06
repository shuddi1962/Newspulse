import { MetadataRoute } from 'next';
import { createServerInsForge } from '@/lib/insforge/server';
import { env } from '@/lib/env';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/video`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/directory`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/jobs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/marketplace`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
    { url: `${siteUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/real-estate`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/classifieds`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    { url: `${siteUrl}/subscribe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/advertise`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const insforge = createServerInsForge();

  const { data: articles } = await insforge.database
    .from('articles')
    .select('slug, category_id, updated_at, status')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  const { data: categories } = await insforge.database
    .from('categories')
    .select('id, slug, kind')
    .eq('is_active', true);

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c]));

  const articleRoutes: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a) => a.slug)
    .map((a) => {
      const category = a.category_id ? categoryMap.get(a.category_id) : null;
      const slug = category ? `${category.slug}/${a.slug}` : `article/${a.slug}`;
      return {
        url: `${siteUrl}/${slug}`,
        lastModified: new Date(a.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? [])
    .filter((c) => c.kind === 'news' && c.slug)
    .map((c) => ({
      url: `${siteUrl}/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
