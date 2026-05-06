import 'server-only';
import {
  getPublicArticleBySlug,
  getPublicAuthorById,
  getPublicCategoryById,
  listRelatedArticles,
  type PublicArticleFull,
  type PublicAuthor,
  type PublicCategory,
  type PublicArticleCard,
} from '@/lib/db/public-articles';
import { listApprovedComments, type PublicComment } from '@/lib/db/comments';

export type ArticlePageData = {
  article: PublicArticleFull;
  category: PublicCategory | null;
  author: PublicAuthor | null;
  related: PublicArticleCard[];
  categoriesById: Map<string, PublicCategory>;
  comments: PublicComment[];
};

export async function loadArticlePageData(
  slug: string,
): Promise<ArticlePageData | null> {
  const articleRes = await getPublicArticleBySlug(slug);
  if (articleRes.status !== 'ok' || !articleRes.data) return null;
  const article = articleRes.data;

  const [categoryRes, authorRes, relatedRes, commentsRes] = await Promise.all([
    article.category_id
      ? getPublicCategoryById(article.category_id)
      : Promise.resolve({ status: 'ok', data: null } as const),
    article.author_id
      ? getPublicAuthorById(article.author_id)
      : Promise.resolve({ status: 'ok', data: null } as const),
    listRelatedArticles({ id: article.id, category_id: article.category_id }, 3),
    article.allow_comments ? listApprovedComments(article.id) : Promise.resolve({ status: 'ok', data: [] as PublicComment[] } as const),
  ]);

  const category = categoryRes.status === 'ok' ? categoryRes.data : null;
  const author = authorRes.status === 'ok' ? authorRes.data : null;
  const related = relatedRes.status === 'ok' ? relatedRes.data : [];
  const comments = commentsRes.status === 'ok' ? commentsRes.data : [];

  const categoriesById = new Map<string, PublicCategory>();
  if (category) categoriesById.set(category.id, category);

  const missingCategoryIds = new Set(
    related.map((a) => a.category_id).filter((id): id is string => Boolean(id)),
  );
  if (category) missingCategoryIds.delete(category.id);

  if (missingCategoryIds.size > 0) {
    const extras = await Promise.all(
      Array.from(missingCategoryIds).map((id) => getPublicCategoryById(id)),
    );
    for (const res of extras) {
      if (res.status === 'ok' && res.data) {
        categoriesById.set(res.data.id, res.data);
      }
    }
  }

  return { article, category, author, related, categoriesById, comments };
}

export function buildArticleMetadata(
  data: ArticlePageData,
  _siteUrl: string,
  siteName: string,
  articleUrl: string,
) {
  const { article, author, category } = data;
  const title = article.seo_title ?? article.title;
  const description = article.seo_description ?? article.excerpt ?? undefined;
  const image = article.og_image ?? article.featured_image ?? undefined;

  return {
    title,
    description,
    alternates: {
      canonical: article.canonical_url ?? articleUrl,
    },
    keywords: article.seo_keywords.length > 0 ? article.seo_keywords : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      url: articleUrl,
      siteName,
      images: image ? [{ url: image }] : undefined,
      publishedTime: article.publish_at ?? undefined,
      modifiedTime: article.updated_at,
      section: category?.name,
      authors: author ? [author.display_name] : undefined,
      tags: article.tags,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: {
      'article:published_time': article.publish_at ?? '',
      'article:modified_time': article.updated_at,
    },
  };
}

export function canonicalArticlePath(
  article: Pick<PublicArticleFull, 'slug'>,
  category: PublicCategory | null,
): string {
  return category ? `/${category.slug}/${article.slug}` : `/article/${article.slug}`;
}
