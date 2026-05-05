import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';
import { env } from '@/lib/env';
import { listArticlesForRss, getPublicCategoryBySlug } from '@/lib/db/public-articles';

export const dynamic = 'force-dynamic';

type Params = { category: string };

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const { category } = await params;

  const [catRes, articlesRes] = await Promise.all([
    getPublicCategoryBySlug(category),
    listArticlesForRss(20, undefined),
  ]);

  const cat = catRes.status === 'ok' ? catRes.data : null;
  if (!cat) notFound();

  const allArticles = articlesRes.status === 'ok' ? articlesRes.data : [];
  const articles = allArticles.filter((a) => a.category_slug === cat.slug);

  const now = new Date().toUTCString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(cat.name)} — ${escapeXml(env.NEXT_PUBLIC_SITE_NAME)}</title>
    <link>${escapeXml(env.NEXT_PUBLIC_SITE_URL)}/${escapeXml(cat.slug)}</link>
    <description>Latest coverage from ${escapeXml(cat.name)}.</description>
    <language>en-us</language>
    <pubDate>${now}</pubDate>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${escapeXml(env.NEXT_PUBLIC_SITE_URL)}/rss/${escapeXml(cat.slug)}.xml" rel="self" type="application/rss+xml" />
`;

  for (const article of articles) {
    const url = `${env.NEXT_PUBLIC_SITE_URL}/${cat.slug}/${article.slug}`;
    const pubDate = article.publish_at ? new Date(article.publish_at).toUTCString() : now;

    xml += `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${escapeXml(pubDate)}</pubDate>
      <dc:creator>${escapeXml(article.author_display_name ?? 'Staff')}</dc:creator>
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
