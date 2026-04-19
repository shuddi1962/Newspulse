import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { getTagById } from '@/lib/db/tags';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TagForm } from '../../_components/tag-form';

export const metadata: Metadata = {
  title: 'Edit tag',
};

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin/content/tags/${id}/edit`);
  if (!isAdmin(user)) redirect('/admin?error=forbidden');

  const { accessToken } = await getAuthCookies();
  if (!accessToken) redirect('/login?next=/admin/content/tags');

  const tag = await getTagById(id, accessToken);
  if (!tag) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Taxonomy · Editing
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            {tag.name}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-(--fg-muted)">
            <Badge variant="neutral">{tag.article_count} articles</Badge>
            <span className="font-mono text-xs">/{tag.slug}</span>
          </div>
        </div>
        <Link
          href="/admin/content/tags"
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          Back
        </Link>
      </div>
      <section className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
        <TagForm mode="edit" initial={tag} />
      </section>
    </div>
  );
}
