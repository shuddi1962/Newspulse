import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { env } from '@/lib/env';
import {
  getPublicCategoryBySlug,
  listCategoryArticlesPaginated,
  type PublicArticleCard,
} from '@/lib/db/public-articles';
import { ArticleCard, articleHref } from '../_components/article-card';
import { TrendingWidget } from '@/components/sidebar/TrendingWidget';
import { NewsletterWidget } from '@/components/sidebar/NewsletterWidget';
import { TagsWidget } from '@/components/sidebar/TagsWidget';
import { AdBannerWidget } from '@/components/sidebar/AdBannerWidget';
import { AdBanner } from '@/components/ads/AdBanner';

type Params = { category: string };
type SearchParams = { page?: string };

export const revalidate = 60;

const PAGE_SIZE = 12;

const CATEGORY_THEMES: Record<string, { color: string; gradient: string; description: string }> = {
  politics: {
    color: '#7c3aed',
    gradient: 'from-[#7c3aed]/90 via-[#7c3aed]/50 to-transparent',
    description: 'Government, policy, elections, and political developments',
  },
  business: {
    color: '#2563eb',
    gradient: 'from-[#2563eb]/90 via-[#2563eb]/50 to-transparent',
    description: 'Markets, economy, corporate news, and financial analysis',
  },
  technology: {
    color: '#0891b2',
    gradient: 'from-[#0891b2]/90 via-[#0891b2]/50 to-transparent',
    description: 'AI, startups, innovation, and the digital frontier',
  },
  sports: {
    color: '#059669',
    gradient: 'from-[#059669]/90 via-[#059669]/50 to-transparent',
    description: 'Football, basketball, athletics, and sporting events',
  },
  entertainment: {
    color: '#d97706',
    gradient: 'from-[#d97706]/90 via-[#d97706]/50 to-transparent',
    description: 'Movies, music, culture, and celebrity news',
  },
  health: {
    color: '#dc2626',
    gradient: 'from-[#dc2626]/90 via-[#dc2626]/50 to-transparent',
    description: 'Medical breakthroughs, wellness, and public health',
  },
  africa: {
    color: '#e67e22',
    gradient: 'from-[#e67e22]/90 via-[#e67e22]/50 to-transparent',
    description: 'News and analysis from across the African continent',
  },
  world: {
    color: '#4f46e5',
    gradient: 'from-[#4f46e5]/90 via-[#4f46e5]/50 to-transparent',
    description: 'International news and global affairs coverage',
  },
  opinion: {
    color: '#8b5cf6',
    gradient: 'from-[#8b5cf6]/90 via-[#8b5cf6]/50 to-transparent',
    description: 'Perspectives, editorials, and thought leadership',
  },
};

const trendingItems = [
  { title: 'Dangote Refinery Now Supplying Jet Fuel to Five African Airports', category: 'Business', reads: '3.2K' },
  { title: 'Super Eagles Squad Named For AFCON Qualifiers, Lookman Leads Attack', category: 'Sports', reads: '4.8K' },
  { title: 'CBN Raises Interest Rates to 27% Amid Persistent Inflation Pressures', category: 'Finance', reads: '2.1K' },
  { title: 'Netflix Orders First Nigerian Original Series With $40M Production Budget', category: 'Entertainment', reads: '6.7K' },
  { title: "Elon Musk's Starlink Expands Nigeria Coverage to 200 New LGAs", category: 'Tech', reads: '3.9K' },
];

const popularTags = [
  'Nigeria', 'Economy', 'Politics', 'Tech', 'Sports',
  'Health', 'Africa', 'Business', 'Dangote', 'AFCON',
  'Crypto', 'Oil & Gas', 'UN', 'Elections', 'Fintech',
];

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
    description: CATEGORY_THEMES[category]?.description ?? `Latest news and coverage from ${catRes.data.name}.`,
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

  const catRes = await getPublicCategoryBySlug(categorySlug);
  const category = catRes.status === 'ok' ? catRes.data : null;
  if (!category) notFound();

  const allArticlesRes = await listCategoryArticlesPaginated(category.id, page, PAGE_SIZE);

  const paginated =
    allArticlesRes.status === 'ok'
      ? allArticlesRes.data
      : { articles: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };

  const theme = CATEGORY_THEMES[categorySlug] ?? {
    color: '#6b7280',
    gradient: 'from-[#6b7280]/90 via-[#6b7280]/50 to-transparent',
    description: `Latest news and coverage from ${category.name}.`,
  };

  const articles = paginated.articles;
  const lead = articles[0] ?? null;
  const rest = page === 1 ? articles.slice(1) : articles;

  return (
    <main className="w-full">
      {/* Category Hero */}
      <section
        className="relative overflow-hidden pt-4 pb-12 md:pb-16"
        style={{ backgroundColor: theme.color }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.15) 0%, transparent 40%)',
          }}
        />
        <div className="relative z-10 px-4 md:px-8 lg:px-12">
          <nav className="mb-6 text-xs text-white/60" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white/90 font-medium">{category.name}</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {category.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/80 sm:text-lg">
              {theme.description}
            </p>
            <div className="mt-4 flex items-center gap-4 text-sm text-white/60">
              <span>{paginated.total} article{paginated.total !== 1 ? 's' : ''}</span>
              {page > 1 && <span>Page {page}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <section className="px-4 md:px-8 lg:px-12 py-8">
        <AdBanner size="leaderboard" />
      </section>

      {paginated.articles.length === 0 ? (
        <EmptyState categoryName={category.name} />
      ) : (
        <div className="px-4 md:px-8 lg:px-12 pb-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              {/* Lead Article */}
              {lead && page === 1 && (
                <section className="mb-12">
                  <Link
                    href={articleHref(lead, category.slug)}
                    className="group grid gap-6 md:grid-cols-2 md:items-center"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-(--bg-muted)">
                      {lead.featured_image ? (
                        <Image
                          src={lead.featured_image}
                          alt=""
                          fill
                          priority
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-(--fg-subtle) text-sm">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      {lead.is_breaking && (
                        <span
                          className="mb-3 inline-block rounded px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: theme.color }}
                        >
                          Breaking
                        </span>
                      )}
                      <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight text-(--fg-default) group-hover:underline sm:text-3xl">
                        {lead.title}
                      </h2>
                      {lead.excerpt && (
                        <p className="mt-3 text-base leading-relaxed text-(--fg-muted) line-clamp-3">
                          {lead.excerpt}
                        </p>
                      )}
                      <MetaRow article={lead} />
                    </div>
                  </Link>
                </section>
              )}

              {/* Section heading for remaining articles */}
              {rest.length > 0 && (
                <section>
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className="h-1 w-8 rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                    <h2 className="font-display text-lg font-semibold tracking-tight text-(--fg-default)">
                      {page === 1 ? 'More Articles' : 'Articles'}
                    </h2>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((article) => (
                      <ArticleCard key={article.id} article={article} size="sm" categorySlug={category.slug} categoryName={category.name} />
                    ))}
                  </div>
                </section>
              )}

              {/* Pagination */}
              {paginated.totalPages > 1 && (
                <Pagination
                  currentPage={paginated.page}
                  totalPages={paginated.totalPages}
                  categorySlug={category.slug}
                  themeColor={theme.color}
                />
              )}
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-8">
              <TrendingWidget items={trendingItems} />
              <AdBannerWidget />
              <NewsletterWidget />
              <TagsWidget tags={popularTags} />
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}

function MetaRow({ article }: { article: PublicArticleCard }) {
  const date = article.publish_at ? format(new Date(article.publish_at), 'MMM d, yyyy') : null;
  return (
    <div className="mt-3 flex items-center gap-2 text-sm text-(--fg-subtle)">
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
  themeColor,
}: {
  currentPage: number;
  totalPages: number;
  categorySlug: string;
  themeColor: string;
}) {
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink
        href={`/${categorySlug}?page=${currentPage - 1}`}
        disabled={currentPage <= 1}
        themeColor={themeColor}
        aria-label="Previous page"
      >
        Prev
      </PageLink>

      {pages.map((p, i) =>
        p === null ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-(--fg-subtle)"
            aria-hidden
          >
            &hellip;
          </span>
        ) : (
          <PageLink
            key={p}
            href={`/${categorySlug}?page=${p}`}
            active={p === currentPage}
            themeColor={themeColor}
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
        themeColor={themeColor}
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
  themeColor,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
  children,
}: {
  href: string;
  disabled?: boolean;
  active?: boolean;
  themeColor: string;
  'aria-label'?: string;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | true | false;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        className="flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm text-(--fg-subtle) opacity-40 cursor-not-allowed"
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
        className="flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-semibold text-white"
        style={{ backgroundColor: themeColor }}
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
      className="flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-surface-subtle) hover:text-(--fg-default)"
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
    <section className="px-4 md:px-8 lg:px-12 py-20 text-center">
      <div className="mx-auto max-w-md">
        <h2 className="text-xl font-semibold text-(--fg-default)">
          No articles in {categoryName} yet
        </h2>
        <p className="mt-2 text-sm text-(--fg-muted)">
          Check back soon — our editorial team is working on stories for this section.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-(--ink-black) px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Return to homepage
        </Link>
      </div>
    </section>
  );
}
