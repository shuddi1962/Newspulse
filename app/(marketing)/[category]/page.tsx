import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { env } from '@/lib/env';
import {
  getPublicCategoryBySlug,
  listCategoryArticlesPaginated,
  type PublicCategory,
  type PublicArticleCard,
} from '@/lib/db/public-articles';
import { ArticleCard, articleHref } from '../_components/article-card';

type Params = { category: string };
type SearchParams = { page?: string };

export const revalidate = 60;

const PAGE_SIZE = 12;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { category } = await params;
  const catRes = await getPublicCategoryBySlug(category);
  if (catRes.status !== 'ok' || !catRes.data) return { title: 'Category not found' };
  return {
    title: `${catRes.data.name} — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Latest news and coverage from ${catRes.data.name}.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [catRes, articlesRes] = await Promise.all([
    getPublicCategoryBySlug(categorySlug),
    listCategoryArticlesPaginated(categorySlug, page, PAGE_SIZE),
  ]);

  const category = catRes.status === 'ok' ? catRes.data : null;
  if (!category) notFound();

  const paginated =
    articlesRes.status === 'ok'
      ? articlesRes.data
      : { articles: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10 border-b border-(--border-subtle) pb-6">
        <nav className="mb-3 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-(--fg-muted)">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span className="text-(--fg-muted)">{category.name}</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight">{category.name}</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          {paginated.total} article{paginated.total !== 1 ? 's' : ''} published
        </p>
      </header>

      {paginated.articles.length === 0 ? (
        <EmptyState categoryName={category.name} />
      ) : (
        <>
          <ArticleGrid articles={paginated.articles} />
          <Pagination
            currentPage={paginated.page}
            totalPages={paginated.totalPages}
            categorySlug={category.slug}
          />
        </>
      )}
    </main>
  );
}

function ArticleGrid({ articles }: { articles: PublicArticleCard[] }) {
  if (articles.length === 0) return null;

  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <section aria-label="Articles">
      <Link
        href={articleHref(lead)}
        className="group mb-10 grid gap-6 md:grid-cols-2 md:items-center"
      >
        {lead.featured_image && (
          <div className="aspect-[16/10] overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface-subtle)">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.featured_image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
          </div>
        )}
        <div className={lead.featured_image ? '' : 'md:col-span-2'}>
          {lead.is_breaking && (
            <span className="mb-2 inline-block rounded bg-(--signal-red) px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
              Breaking
            </span>
          )}
          <h2 className="text-xl font-semibold leading-tight tracking-tight text-(--fg-default) transition-colors group-hover:text-(--ink-medium)">
            {lead.title}
          </h2>
          {lead.excerpt && (
            <p className="mt-2 text-sm leading-relaxed text-(--fg-muted) line-clamp-3">
              {lead.excerpt}
            </p>
          )}
          <MetaRow article={lead} />
        </div>
      </Link>

      {rest.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => (
            <ArticleCard key={article.id} article={article} size="sm" />
          ))}
        </div>
      )}
    </section>
  );
}

function MetaRow({ article }: { article: PublicArticleCard }) {
  const date = article.publish_at ? format(new Date(article.publish_at), 'MMM d, yyyy') : null;
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-(--fg-subtle)">
      {date && <time dateTime={article.publish_at ?? undefined}>{date}</time>}
      {article.reading_time_min && (
        <>
          <span aria-hidden>&middot;</span>
          <span>{article.reading_time_min} min read</span>
        </>
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  categorySlug,
}: {
  currentPage: number;
  totalPages: number;
  categorySlug: string;
}) {
  if (totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-1"
      aria-label="Pagination"
    >
      <PageLink
        href={`/${categorySlug}?page=${currentPage - 1}`}
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
            href={`/${categorySlug}?page=${p}`}
            active={p === currentPage}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </PageLink>
        ),
      )}

      <PageLink
        href={`/${categorySlug}?page=${currentPage + 1}`}
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
        aria-hidden={ariaLabel ? undefined : true}
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

function EmptyState({ categoryName }: { categoryName: string }) {
  return (
    <section className="py-20 text-center">
      <h2 className="text-xl font-semibold text-(--fg-default)">
        No articles in {categoryName} yet
      </h2>
      <p className="mt-2 text-sm text-(--fg-muted)">
        Check back soon — our editorial team is working on stories for this section.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-(--ocean-blue) underline underline-offset-2 hover:text-(--fg-default)"
      >
        Return to homepage
      </Link>
    </section>
  );
}
