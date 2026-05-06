import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { env } from '@/lib/env';
import { checkPaywall } from '@/lib/db/paywall';
import { ArticleView } from '../../_components/article-view';
import {
  buildArticleMetadata,
  canonicalArticlePath,
  loadArticlePageData,
} from '../../_lib/article-page-data';

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadArticlePageData(slug);
  if (!data) return { title: 'Article not found' };
  const articleUrl = `${env.NEXT_PUBLIC_SITE_URL}/article/${data.article.slug}`;
  return buildArticleMetadata(
    data,
    env.NEXT_PUBLIC_SITE_URL,
    env.NEXT_PUBLIC_SITE_NAME,
    articleUrl,
  );
}

export default async function ArticleFallbackPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const data = await loadArticlePageData(slug);
  if (!data) notFound();

  if (data.category) {
    redirect(canonicalArticlePath(data.article, data.category));
  }

  const articleUrl = `${env.NEXT_PUBLIC_SITE_URL}/article/${data.article.slug}`;
  const paywall = await checkPaywall(data.article.is_premium ?? false);

  return (
    <ArticleView
      article={data.article}
      category={data.category}
      author={data.author}
      related={data.related}
      categoriesById={data.categoriesById}
      comments={data.comments}
      siteUrl={env.NEXT_PUBLIC_SITE_URL}
      siteName={env.NEXT_PUBLIC_SITE_NAME}
      articleUrl={articleUrl}
      paywall={paywall}
    />
  );
}
