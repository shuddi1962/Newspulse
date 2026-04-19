import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser, hasRole } from '@/lib/auth/session';
import { ArticleForm } from '../_components/article-form';

export const metadata: Metadata = {
  title: 'New article',
};

export default async function NewArticlePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/content/articles/new');
  if (!hasRole(user, 'author', 'editor', 'admin')) {
    redirect('/admin?error=forbidden');
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Newsroom · Draft
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          New article
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-(--fg-muted)">
          Saved drafts stay private to you until submitted for review.
        </p>
      </div>
      <ArticleForm mode="create" />
    </div>
  );
}
