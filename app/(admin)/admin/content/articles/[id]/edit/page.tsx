import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import type { JSONContent } from '@tiptap/react';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, hasRole } from '@/lib/auth/session';
import { getArticleById } from '@/lib/db/articles';
import { Badge } from '@/components/ui/badge';
import { ArticleForm } from '../../_components/article-form';
import { WorkflowPanel } from '../../_components/workflow-panel';
import type { WorkflowRole } from '@/lib/validation/article';

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

  const workflowRole: WorkflowRole | null =
    user.role === 'admin' || user.role === 'editor'
      ? 'editor'
      : user.role === 'author'
        ? 'author'
        : null;

  const isOwnArticle = article.author_id === user.id;
  const canEditBody =
    workflowRole === 'editor' ||
    (workflowRole === 'author' && isOwnArticle && ['draft', 'review', 'rejected'].includes(article.status));

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          {canEditBody ? (
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
          ) : (
            <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-6 text-sm text-(--fg-muted)">
              Body editing is locked while this article is in status{' '}
              <strong>{article.status}</strong>. Use the workflow panel to move it
              to a state where edits are allowed.
            </div>
          )}
        </div>

        {workflowRole ? (
          <WorkflowPanel
            articleId={article.id}
            currentStatus={article.status}
            workflowRole={workflowRole}
            isOwnArticle={isOwnArticle}
            currentPublishAt={article.publish_at}
          />
        ) : null}
      </div>
    </div>
  );
}
