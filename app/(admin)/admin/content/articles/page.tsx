import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, Plus } from 'lucide-react';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, hasRole } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  countArticlesByStatus,
  listArticlesForAdmin,
  type AdminArticleRow,
} from '@/lib/db/articles';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ARTICLE_STATUSES, type ArticleStatus } from '@/lib/validation/article';

export const metadata: Metadata = {
  title: 'Articles',
};

function parseStatusParam(raw: string | undefined): ArticleStatus | null {
  if (!raw) return null;
  return (ARTICLE_STATUSES as readonly string[]).includes(raw)
    ? (raw as ArticleStatus)
    : null;
}

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusRaw } = await searchParams;
  const statusFilter = parseStatusParam(statusRaw);

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/content/articles');
  if (!hasRole(user, 'author', 'editor', 'admin')) {
    redirect('/admin?error=forbidden');
  }

  const { accessToken } = await getAuthCookies();
  const [listResult, countsResult] = accessToken
    ? await Promise.all([
        listArticlesForAdmin(accessToken, statusFilter ? { status: statusFilter } : undefined),
        countArticlesByStatus(accessToken),
      ])
    : [
        { status: 'error', message: 'Session expired. Sign in again.' } as const,
        { status: 'error', message: 'Session expired.' } as const,
      ];

  const counts = countsResult.status === 'ok' ? countsResult.data : null;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Newsroom
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            Articles
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-(--fg-muted)">
            Drafts, scheduled pieces, and the published archive. Authors see their
            own work; editors and admins see everything.
          </p>
        </div>
        <Link href="/admin/content/articles/new" className={cn(buttonVariants({ variant: 'primary' }))}>
          <Plus size={16} />
          New article
        </Link>
      </header>

      <StatusFilter currentStatus={statusFilter} counts={counts} />

      {listResult.status === 'error' ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not load articles</AlertTitle>
            <AlertDescription>{listResult.message}</AlertDescription>
          </div>
        </Alert>
      ) : listResult.data.length === 0 ? (
        <EmptyState statusFilter={statusFilter} />
      ) : (
        <ArticlesTable rows={listResult.data} />
      )}
    </div>
  );
}

function StatusFilter({
  currentStatus,
  counts,
}: {
  currentStatus: ArticleStatus | null;
  counts: Record<ArticleStatus, number> | null;
}) {
  const total = counts
    ? Object.values(counts).reduce((sum, n) => sum + n, 0)
    : null;
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip href="/admin/content/articles" active={currentStatus === null}>
        All{total !== null ? ` (${total})` : ''}
      </FilterChip>
      {ARTICLE_STATUSES.map((s) => (
        <FilterChip
          key={s}
          href={`/admin/content/articles?status=${s}`}
          active={currentStatus === s}
        >
          {s}
          {counts ? ` (${counts[s] ?? 0})` : ''}
        </FilterChip>
      ))}
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-(--color-ink-black) bg-(--color-ink-black) text-(--color-paper)'
          : 'border-(--border-default) bg-(--bg-surface) text-(--fg-muted) hover:bg-(--bg-muted)',
      )}
    >
      {children}
    </Link>
  );
}

function EmptyState({ statusFilter }: { statusFilter: ArticleStatus | null }) {
  return (
    <div className="rounded-lg border border-dashed border-(--border-default) bg-(--bg-surface) px-6 py-16 text-center">
      <h2 className="font-display text-lg font-semibold text-(--fg-default)">
        {statusFilter ? `No ${statusFilter} articles` : 'No articles yet'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-(--fg-muted)">
        {statusFilter
          ? 'Try clearing the filter or choosing a different status.'
          : 'Start a draft to see it listed here. Drafts stay private to their author until submitted for review.'}
      </p>
      <Link
        href="/admin/content/articles/new"
        className={cn(buttonVariants({ variant: 'primary' }), 'mt-6')}
      >
        <Plus size={16} />
        New article
      </Link>
    </div>
  );
}

const STATUS_VARIANT: Record<string, 'solid' | 'neutral' | 'outline' | 'success' | 'warning' | 'destructive'> = {
  draft: 'neutral',
  review: 'warning',
  approved: 'outline',
  scheduled: 'outline',
  published: 'solid',
  archived: 'neutral',
  rejected: 'destructive',
};

function ArticlesTable({ rows }: { rows: AdminArticleRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-surface)">
      <table className="w-full text-sm">
        <thead className="border-b border-(--border-subtle) bg-(--bg-muted) text-left text-xs uppercase tracking-wide text-(--fg-subtle)">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Words</th>
            <th className="px-4 py-3 font-medium">Publish at</th>
            <th className="px-4 py-3 font-medium">Updated</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--border-subtle)">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-(--bg-muted)/40">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/content/articles/${row.id}/edit`}
                  className="font-medium text-(--fg-default) hover:underline"
                >
                  {row.title}
                </Link>
                <div className="mt-1 font-mono text-xs text-(--fg-subtle)">/{row.slug}</div>
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_VARIANT[row.status] ?? 'neutral'}>{row.status}</Badge>
              </td>
              <td className="px-4 py-3 text-(--fg-muted)">{row.word_count ?? 0}</td>
              <td className="px-4 py-3 text-(--fg-muted)">
                {row.publish_at
                  ? new Date(row.publish_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : '—'}
              </td>
              <td className="px-4 py-3 text-(--fg-muted)">
                {new Date(row.updated_at).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/admin/content/articles/${row.id}/edit`}
                  className="text-sm text-(--fg-default) hover:underline"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
