import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import type { JSONContent } from '@tiptap/react';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, hasRole } from '@/lib/auth/session';
import { getArticleById } from '@/lib/db/articles';
import { Badge } from '@/components/ui/badge';
import { ArticleForm } from '../../_components/article-form';

export const metadata: Metadata = {
  title: 'Edit article',
};

export default async function EditArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin/content/articles/${id}/edit`);
  if (!hasRole(user, 'author', 'editor', 'admin')) {
    redirect('/admin?error=forbidden');
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) redirect('/login?next=/admin/content/articles');

  const article = await getArticleById(id, accessToken);
  if (!article) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Newsroom · Editing
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            {article.title || 'Untitled draft'}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-(--fg-muted)">
            <Badge variant="neutral">{article.status}</Badge>
            <span>Last updated {new Date(article.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <ArticleForm
        mode="edit"
        showSavedBanner={saved === '1'}
        initial={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt ?? '',
          content_json: (article.content_json as JSONContent | null) ?? null,
        }}
      />
    </div>
  );
}
