import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { listCategories, type CategoryRow } from '@/lib/db/categories';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CATEGORY_KINDS, type CategoryKind } from '@/lib/validation/taxonomy';
import { deleteCategoryAction } from './actions';

export const metadata: Metadata = {
  title: 'Categories',
};

function parseKindParam(raw: string | undefined): CategoryKind | null {
  if (!raw) return null;
  return (CATEGORY_KINDS as readonly string[]).includes(raw)
    ? (raw as CategoryKind)
    : null;
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; saved?: string }>;
}) {
  const { kind: kindRaw, saved } = await searchParams;
  const kind = parseKindParam(kindRaw);

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/content/categories');
  if (!isAdmin(user)) redirect('/admin?error=forbidden');

  const { accessToken } = await getAuthCookies();
  const result = accessToken
    ? await listCategories(accessToken, kind ? { kind } : undefined)
    : ({ status: 'error', message: 'Session expired. Sign in again.' } as const);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Taxonomy
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            Categories
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-(--fg-muted)">
            Hierarchical taxonomy across news, directory, jobs, marketplace, events,
            real estate, and classifieds. Admin-only.
          </p>
        </div>
        <Link
          href={`/admin/content/categories/new${kind ? `?kind=${kind}` : ''}`}
          className={cn(buttonVariants({ variant: 'primary' }))}
        >
          <Plus size={16} />
          New category
        </Link>
      </header>

      {saved === '1' ? (
        <Alert>
          <CheckCircle2 />
          <div className="space-y-1">
            <AlertTitle>Category saved</AlertTitle>
            <AlertDescription>Your changes have been applied.</AlertDescription>
          </div>
        </Alert>
      ) : null}

      <KindFilter currentKind={kind} />

      {result.status === 'error' ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not load categories</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      ) : result.data.length === 0 ? (
        <EmptyState kind={kind} />
      ) : (
        <CategoriesTable rows={result.data} />
      )}
    </div>
  );
}

function KindFilter({ currentKind }: { currentKind: CategoryKind | null }) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip href="/admin/content/categories" active={currentKind === null}>
        All kinds
      </FilterChip>
      {CATEGORY_KINDS.map((k) => (
        <FilterChip
          key={k}
          href={`/admin/content/categories?kind=${k}`}
          active={currentKind === k}
        >
          {k}
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

function EmptyState({ kind }: { kind: CategoryKind | null }) {
  return (
    <div className="rounded-lg border border-dashed border-(--border-default) bg-(--bg-surface) px-6 py-16 text-center">
      <h2 className="font-display text-lg font-semibold text-(--fg-default)">
        {kind ? `No ${kind} categories yet` : 'No categories yet'}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-(--fg-muted)">
        Create the first category for this kind so authors can classify their work.
      </p>
      <Link
        href={`/admin/content/categories/new${kind ? `?kind=${kind}` : ''}`}
        className={cn(buttonVariants({ variant: 'primary' }), 'mt-6')}
      >
        <Plus size={16} />
        New category
      </Link>
    </div>
  );
}

function CategoriesTable({ rows }: { rows: CategoryRow[] }) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return (
    <div className="overflow-hidden rounded-lg border border-(--border-default) bg-(--bg-surface)">
      <table className="w-full text-sm">
        <thead className="border-b border-(--border-subtle) bg-(--bg-muted) text-left text-xs uppercase tracking-wide text-(--fg-subtle)">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Kind</th>
            <th className="px-4 py-3 font-medium">Parent</th>
            <th className="px-4 py-3 font-medium">Sort</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--border-subtle)">
          {rows.map((row) => {
            const parent = row.parent_id ? byId.get(row.parent_id) : null;
            return (
              <tr key={row.id} className="hover:bg-(--bg-muted)/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/content/categories/${row.id}/edit`}
                    className="font-medium text-(--fg-default) hover:underline"
                  >
                    {row.name}
                  </Link>
                  <div className="mt-1 font-mono text-xs text-(--fg-subtle)">/{row.slug}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{row.kind}</Badge>
                </td>
                <td className="px-4 py-3 text-(--fg-muted)">
                  {parent?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-(--fg-muted)">{row.sort_order}</td>
                <td className="px-4 py-3">
                  {row.is_active ? (
                    <Badge variant="success">active</Badge>
                  ) : (
                    <Badge variant="neutral">hidden</Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/content/categories/${row.id}/edit`}
                      className="text-sm text-(--fg-default) hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteCategoryAction}>
                      <input type="hidden" name="id" value={row.id} />
                      <Button type="submit" variant="ghost" size="sm" className="text-(--color-signal-red)">
                        Delete
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
