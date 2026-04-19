import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { listTags, type TagRow } from '@/lib/db/tags';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TagForm } from './_components/tag-form';
import { deleteTagAction } from './actions';

export const metadata: Metadata = {
  title: 'Tags',
};

export default async function TagsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/content/tags');
  if (!isAdmin(user)) redirect('/admin?error=forbidden');

  const { accessToken } = await getAuthCookies();
  const result = accessToken
    ? await listTags(accessToken, q ? { search: q } : undefined)
    : ({ status: 'error', message: 'Session expired. Sign in again.' } as const);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Taxonomy
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            Tags
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-(--fg-muted)">
            Free-form tags for cross-category topics. Authors attach them per article.
          </p>
        </div>
      </header>

      <form className="flex items-center gap-3" method="get">
        <Input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Search tags by name…"
          className="max-w-md"
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {q ? (
          <Link href="/admin/content/tags" className="text-sm text-(--fg-muted) hover:underline">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
        <h2 className="font-display text-lg font-semibold text-(--fg-default)">
          Create tag
        </h2>
        <p className="mt-1 mb-4 text-sm text-(--fg-muted)">
          Slug auto-generates from the name until you edit it.
        </p>
        <TagForm mode="create" />
      </section>

      {result.status === 'error' ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not load tags</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      ) : result.data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-(--border-default) bg-(--bg-surface) px-6 py-12 text-center text-sm text-(--fg-muted)">
          {q ? `No tags matched "${q}".` : 'No tags yet — add the first one above.'}
        </p>
      ) : (
        <TagsTable rows={result.data} />
      )}
    </div>
  );
}

function TagsTable({ rows }: { rows: TagRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-surface)">
      <table className="w-full text-sm">
        <thead className="border-b border-(--border-subtle) bg-(--bg-muted) text-left text-xs uppercase tracking-wide text-(--fg-subtle)">
          <tr>
            <th className="px-4 py-3 font-medium">Tag</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Color</th>
            <th className="px-4 py-3 font-medium">Articles</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--border-subtle)">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-(--bg-muted)/40">
              <td className="px-4 py-3">
                <Link
                  href={`/admin/content/tags/${row.id}/edit`}
                  className="font-medium text-(--fg-default) hover:underline"
                >
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-(--fg-subtle)">/{row.slug}</td>
              <td className="px-4 py-3">
                {row.color ? (
                  <span className="inline-flex items-center gap-2 text-xs text-(--fg-muted)">
                    <span
                      aria-hidden
                      className="inline-block h-4 w-4 rounded-full border border-(--border-default)"
                      style={{ background: row.color }}
                    />
                    {row.color}
                  </span>
                ) : (
                  <span className="text-(--fg-subtle)">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge variant="neutral">{row.article_count}</Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/content/tags/${row.id}/edit`}
                    className="text-sm text-(--fg-default) hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteTagAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-(--color-signal-red)">
                      Delete
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
