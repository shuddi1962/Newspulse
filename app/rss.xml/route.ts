import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { listArticlesForRss, listPublicNewsCategories } from '@/lib/db/public-articles';

export const dynamic = 'force-dynamic';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const [articlesRes, categoriesRes] = await Promise.all([
    listArticlesForRss(20),
    listPublicNewsCategories(20),
  ]);

  const articles = articlesRes.status === 'ok' ? articlesRes.data : [];
  const categories = categoriesRes.status === 'ok' ? categoriesRes.data : [];

  const now = new Date().toUTCString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(env.NEXT_PUBLIC_SITE_NAME)}</title>
    <link>${escapeXml(env.NEXT_PUBLIC_SITE_URL)}</link>
    <description>Editorial authority for the modern web.</description>
    <language>en-us</language>
    <pubDate>${now}</pubDate>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${escapeXml(env.NEXT_PUBLIC_SITE_URL)}/rss.xml" rel="self" type="application/rss+xml" />
`;

  for (const cat of categories) {
    xml += `    <atom:link href="${escapeXml(env.NEXT_PUBLIC_SITE_URL)}/rss/${cat.slug}.xml" rel="self" type="application/rss+xml" />\n`;
  }

  for (const article of articles) {
    const url = article.category_slug
      ? `${env.NEXT_PUBLIC_SITE_URL}/${article.category_slug}/${article.slug}`
      : `${env.NEXT_PUBLIC_SITE_URL}/article/${article.slug}`;

    const pubDate = article.publish_at ? new Date(article.publish_at).toUTCString() : now;

    xml += `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <dc:creator>${escapeXml(article.author_display_name ?? 'Staff')}</dc:creator>
      ${article.category_name ? `<category>${escapeXml(article.category_name)}</category>` : ''}
      <description>${escapeXml(article.excerpt ?? '')}</description>
    </item>\n`;
  }

  xml += `  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
