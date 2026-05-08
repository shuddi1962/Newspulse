import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createServerInsForge } from '@/lib/insforge/server';
import { getArticleById } from '@/lib/db/articles';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PostForm } from '../../_components/post-form';

export const metadata: Metadata = {
  title: 'Edit Post',
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();
  const { accessToken } = await getAuthCookies();

  if (!accessToken) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle />
        <div className="space-y-1">
          <AlertTitle>Session expired</AlertTitle>
          <AlertDescription>Sign in again to continue.</AlertDescription>
        </div>
      </Alert>
    );
  }

  const insforge = createServerInsForge(accessToken);

  const [article, categoriesRes] = await Promise.all([
    getArticleById(id, accessToken),
    insforge.database
      .from('categories')
      .select('id, name')
      .eq('kind', 'news')
      .order('name')
      .limit(500),
  ]);

  if (!article) {
    notFound();
  }

  const categories = categoriesRes.data ?? [];

  const initial = {
    id: article.id,
    title: article.title,
    slug: article.slug,
    content: article.content_html ?? '',
    featured_image: (article as Record<string, unknown>).featured_image as string ?? '',
    status: (['draft', 'published', 'scheduled'] as const).includes(
      article.status as 'draft' | 'published' | 'scheduled',
    )
      ? (article.status as 'draft' | 'published' | 'scheduled')
      : 'draft',
    publish_at: article.publish_at ?? '',
    is_breaking: article.is_breaking,
    is_featured: article.is_featured,
    category_id: (article as Record<string, unknown>).category_id as string ?? '',
    tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
    seo_title: (article as Record<string, unknown>).seo_title as string ?? '',
    seo_description: (article as Record<string, unknown>).seo_description as string ?? '',
    focus_keyword: (article as Record<string, unknown>).focus_keyword as string ?? '',
    og_title: (article as Record<string, unknown>).og_title as string ?? '',
    og_description: (article as Record<string, unknown>).og_description as string ?? '',
    og_image: (article as Record<string, unknown>).og_image as string ?? '',
    excerpt: article.excerpt ?? '',
  };

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-admin-text)]">
            Edit Post
          </h1>
          <p className="mt-1 text-sm text-[var(--color-admin-text-muted)]">
            Editing:{' '}
            <span className="font-medium text-[var(--color-admin-text)]">{article.title}</span>
          </p>
        </div>
      </header>

      <PostForm mode="edit" initial={initial} categories={categories} />
    </div>
  );
}
