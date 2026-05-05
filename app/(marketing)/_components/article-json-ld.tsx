import type { PublicArticleFull, PublicAuthor, PublicCategory } from '@/lib/db/public-articles';

type Props = {
  article: PublicArticleFull;
  author: PublicAuthor | null;
  category: PublicCategory | null;
  siteUrl: string;
  siteName: string;
  articleUrl: string;
};

export function ArticleJsonLd({
  article,
  author,
  category,
  siteUrl,
  siteName,
  articleUrl,
}: Props) {
  const image = article.og_image ?? article.featured_image;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': article.is_breaking ? 'NewsArticle' : 'Article',
    headline: article.seo_title ?? article.title,
    description: article.seo_description ?? article.excerpt ?? undefined,
    image: image ? [image] : undefined,
    datePublished: article.publish_at ?? article.created_at,
    dateModified: article.updated_at,
    inLanguage: article.language,
    articleSection: category?.name,
    keywords: article.seo_keywords.length > 0 ? article.seo_keywords.join(', ') : undefined,
    wordCount: article.word_count ?? undefined,
    author: author
      ? {
          '@type': 'Person',
          name: author.display_name,
          url: author.username ? `${siteUrl}/author/${author.username}` : undefined,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    url: articleUrl,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
