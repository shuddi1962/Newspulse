import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { AlertTriangle, ImagePlus } from 'lucide-react';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, hasRole, isAdmin } from '@/lib/auth/session';
import { listMedia } from '@/lib/db/media';
import type { MediaAsset } from '@/lib/db/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UploadForm } from './_components/upload-form';
import { AltEditForm } from './_components/alt-edit-form';
import { deleteMediaAction } from './actions';

export const metadata: Metadata = {
  title: 'Media library',
};

const PAGE_SIZE = 48;

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; scope?: string }>;
}) {
  const { q, page: pageRaw, scope } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/content/media');
  if (!hasRole(user, 'author', 'editor', 'admin')) {
    redirect('/admin?error=forbidden');
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) redirect('/login?next=/admin/content/media');

  const page = Math.max(1, Number.parseInt(pageRaw ?? '1', 10) || 1);
  const restrictToMine = scope === 'mine' || (!isAdmin(user) && user.role !== 'editor');

  const result = await listMedia(
    accessToken,
    {
      bucket: 'media',
      search: q,
      uploaderId: restrictToMine ? user.id : undefined,
    },
    page,
    PAGE_SIZE,
  );

  const totalPages =
    result.status === 'ok' ? Math.max(1, Math.ceil(result.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Newsroom
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            Media library
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-(--fg-muted)">
            Images uploaded once, reused across articles. Authors see their own uploads
            by default; editors and admins can browse everything.
          </p>
        </div>
      </header>

      <UploadForm />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <form className="flex items-end gap-3" method="get">
          <div className="space-y-1">
            <label htmlFor="media-search" className="text-xs uppercase tracking-wide text-(--fg-subtle)">
              Search alt text
            </label>
            <Input
              id="media-search"
              name="q"
              defaultValue={q ?? ''}
              placeholder="e.g. president, skyline…"
              className="min-w-64"
            />
          </div>
          {(isAdmin(user) || user.role === 'editor') && (
            <input type="hidden" name="scope" value={scope === 'mine' ? 'mine' : 'all'} />
          )}
          <Button type="submit" variant="secondary">
            Search
          </Button>
          {q ? (
            <Link
              href={`/admin/content/media${scope === 'mine' ? '?scope=mine' : ''}`}
              className="text-sm text-(--fg-muted) hover:underline"
            >
              Clear
            </Link>
          ) : null}
        </form>

        {(isAdmin(user) || user.role === 'editor') && (
          <div className="flex gap-2">
            <ScopeChip href="/admin/content/media" active={scope !== 'mine'}>
              All uploads
            </ScopeChip>
            <ScopeChip href="/admin/content/media?scope=mine" active={scope === 'mine'}>
              My uploads
            </ScopeChip>
          </div>
        )}
      </div>

      {result.status === 'error' ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not load media</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      ) : result.data.rows.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <MediaGrid
            rows={result.data.rows}
            currentUserId={user.id}
            canManageAll={isAdmin(user)}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={result.data.total}
            q={q}
            scope={scope}
          />
        </>
      )}
    </div>
  );
}

function ScopeChip({
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

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-(--border-default) bg-(--bg-surface) px-6 py-16 text-center">
      <ImagePlus className="mx-auto mb-3 h-8 w-8 text-(--fg-subtle)" aria-hidden />
      <h2 className="font-display text-lg font-semibold text-(--fg-default)">
        No images yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-(--fg-muted)">
        Upload above to seed the library. Images appear here immediately and can be
        referenced from any article.
      </p>
    </div>
  );
}

function MediaGrid({
  rows,
  currentUserId,
  canManageAll,
}: {
  rows: MediaAsset[];
  currentUserId: string;
  canManageAll: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {rows.map((row) => {
        const canManage = canManageAll || row.uploader_id === currentUserId;
        return (
          <article
            key={row.id}
            className="flex flex-col gap-2 rounded-md border border-(--border-default) bg-(--bg-surface) p-2"
          >
            <div className="relative aspect-square overflow-hidden rounded-md bg-(--bg-muted)">
              <Image
                src={row.url}
                alt={row.alt_text ?? ''}
                fill
                sizes="(min-width:1280px) 12vw, (min-width:1024px) 20vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="space-y-1 text-xs text-(--fg-muted)">
              <div className="flex items-center justify-between">
                <Badge variant="neutral">{formatBytes(row.size_bytes)}</Badge>
                <span className="font-mono text-[0.65rem]">
                  {new Date(row.created_at).toLocaleDateString()}
                </span>
              </div>
              {canManage ? (
                <AltEditForm id={row.id} initialAlt={row.alt_text ?? ''} />
              ) : row.alt_text ? (
                <p className="truncate" title={row.alt_text}>
                  {row.alt_text}
                </p>
              ) : (
                <p className="text-(--fg-subtle)">No alt text</p>
              )}
              <div className="flex items-center justify-between gap-2 pt-1">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-(--fg-default) hover:underline"
                  title={row.url}
                >
                  Open original
                </a>
                {canManage ? (
                  <form action={deleteMediaAction}>
                    <input type="hidden" name="id" value={row.id} />
                    <Button type="submit" variant="ghost" size="sm" className="text-(--color-signal-red)">
                      Delete
                    </Button>
                  </form>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  q,
  scope,
}: {
  page: number;
  totalPages: number;
  total: number;
  q: string | undefined;
  scope: string | undefined;
}) {
  if (totalPages <= 1) return null;
  function href(p: number) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (scope === 'mine') params.set('scope', 'mine');
    params.set('page', String(p));
    return `/admin/content/media?${params.toString()}`;
  }
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-(--border-subtle) pt-4 text-sm text-(--fg-muted)"
    >
      <p>
        Page {page} of {totalPages} · {total} image{total === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className="text-(--fg-default) hover:underline">
            ← Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link href={href(page + 1)} className="text-(--fg-default) hover:underline">
            Next →
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
