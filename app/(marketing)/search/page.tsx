import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, X } from 'lucide-react';
import { env } from '@/lib/env';
import { searchArticles } from '@/lib/db/public-articles';
import { ArticleCard } from '../_components/article-card';

type SearchParams = { q?: string; page?: string };

export const revalidate = 0;

const PAGE_SIZE = 12;

export function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  return (async () => {
    const sp = await searchParams;
    const q = sp.q ?? '';
    return {
      title: q ? `Search: "${q}" — ${env.NEXT_PUBLIC_SITE_NAME}` : 'Search',
      description: q ? `Search results for "${q}"` : 'Search articles',
    };
  })();
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();
  const page = Math.max(1, Number(sp.page) || 1);

  const resultsRes = q ? await searchArticles(q, page, PAGE_SIZE) : null;
  const results =
    resultsRes?.status === 'ok'
      ? resultsRes.data
      : { articles: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Search across all published articles
        </p>
      </header>

      <SearchForm initialQuery={q} />

      {!q && (
        <section className="py-16 text-center">
          <SearchIcon
            className="mx-auto h-12 w-12 text-(--fg-subtle)"
            strokeWidth={1}
            aria-hidden
          />
          <h2 className="mt-4 text-lg font-semibold text-(--fg-default)">
            Find articles
          </h2>
          <p className="mt-2 text-sm text-(--fg-muted)">
            Enter a topic, headline, or keyword to search our archive.
          </p>
        </section>
      )}

      {q && results.total === 0 && (
        <section className="py-16 text-center">
          <h2 className="text-lg font-semibold text-(--fg-default)">
            No results for &ldquo;{q}&rdquo;
          </h2>
          <p className="mt-2 text-sm text-(--fg-muted)">
            Try different keywords or browse our categories instead.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm text-(--ocean-blue) underline underline-offset-2 hover:text-(--fg-default)"
          >
            Return to homepage
          </Link>
        </section>
      )}

      {q && results.articles.length > 0 && (
        <>
          <p className="mb-6 text-sm text-(--fg-muted)">
            {results.total} result{results.total !== 1 ? 's' : ''} for &ldquo;
            {q}&rdquo;
          </p>
          <section
            aria-label="Search results"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {results.articles.map((article) => (
              <ArticleCard key={article.id} article={article} size="sm" />
            ))}
          </section>
          <Pagination
            currentPage={results.page}
            totalPages={results.totalPages}
            query={q}
          />
        </>
      )}
    </main>
  );
}

function SearchForm({ initialQuery }: { initialQuery: string }) {
  return (
    <form action="/search" method="GET" className="mb-8">
      <div className="relative flex items-center">
        <SearchIcon
          className="absolute left-4 h-5 w-5 text-(--fg-subtle)"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search articles..."
          className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) py-3 pl-12 pr-24 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--ocean-blue) focus:outline-none focus:ring-1 focus:ring-(--ocean-blue)"
          aria-label="Search"
          autoComplete="off"
        />
        {initialQuery && (
          <Link
            href="/search"
            className="absolute right-3 flex h-8 w-8 items-center justify-center rounded text-(--fg-subtle) transition-colors hover:text-(--fg-default)"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>
    </form>
  );
}

function Pagination({
  currentPage,
  totalPages,
  query,
}: {
  currentPage: number;
  totalPages: number;
  query: string;
}) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);
  const encoded = encodeURIComponent(query);

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-1"
      aria-label="Search pagination"
    >
      <PageLink
        href={`/search?q=${encoded}&page=${currentPage - 1}`}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        Prev
      </PageLink>

      {pages.map((p) =>
        p === null ? (
          <span
            key={`ellipsis-${p}`}
            className="flex h-8 w-8 items-center justify-center text-sm text-(--fg-subtle)"
            aria-hidden
          >
            …
          </span>
        ) : (
          <PageLink
            key={p}
            href={`/search?q=${encoded}&page=${p}`}
            active={p === currentPage}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </PageLink>
        ),
      )}

      <PageLink
        href={`/search?q=${encoded}&page=${currentPage + 1}`}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  active,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  children,
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  'aria-label'?: string;
  'aria-current'?: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        className="flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm text-(--fg-subtle) opacity-50"
        aria-label={ariaLabel}
      >
        {children}
      </span>
    );
  }

  if (active) {
    return (
      <span
        className="flex h-8 min-w-8 items-center justify-center rounded bg-(--ink-black) px-2 text-sm font-medium text-(--pure-white)"
        aria-label={ariaLabel}
        aria-current={ariaCurrent}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-surface-subtle) hover:text-(--fg-default)"
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
    >
      {children}
    </Link>
  );
}

function getVisiblePages(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, null, total];
  if (current >= total - 2) return [1, null, total - 3, total - 2, total - 1, total];
  return [1, null, current - 1, current, current + 1, null, total];
}
