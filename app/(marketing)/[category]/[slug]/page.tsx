import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { getPublicCategoryBySlug } from '@/lib/db/public-articles';
import { ArticleView } from '../../_components/article-view';
import {
  buildArticleMetadata,
  canonicalArticlePath,
  loadArticlePageData,
} from '../../_lib/article-page-data';

type Params = { category: string; slug: string };

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadArticlePageData(slug);
  if (!data) return { title: 'Article not found' };
  const articleUrl = `${env.NEXT_PUBLIC_SITE_URL}${canonicalArticlePath(
    data.article,
    data.category,
  )}`;
  return buildArticleMetadata(
    data,
    env.NEXT_PUBLIC_SITE_URL,
    env.NEXT_PUBLIC_SITE_NAME,
    articleUrl,
  );
}

export default async function ArticleCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { category: categorySlug, slug } = await params;

  const [data, categoryRes] = await Promise.all([
    loadArticlePageData(slug),
    getPublicCategoryBySlug(categorySlug),
  ]);

  if (!data) notFound();

  const routeCategory = categoryRes.status === 'ok' ? categoryRes.data : null;
  if (!routeCategory) notFound();

  if (!data.article.category_id || data.article.category_id !== routeCategory.id) {
    redirect(canonicalArticlePath(data.article, data.category));
  }

  const articleUrl = `${env.NEXT_PUBLIC_SITE_URL}${canonicalArticlePath(
    data.article,
    data.category,
  )}`;

  return (
    <ArticleView
      article={data.article}
      category={data.category}
      author={data.author}
      related={data.related}
      categoriesById={data.categoriesById}
      siteUrl={env.NEXT_PUBLIC_SITE_URL}
      siteName={env.NEXT_PUBLIC_SITE_NAME}
      articleUrl={articleUrl}
    />
  );
}
