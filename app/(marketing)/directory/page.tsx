import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Star, ExternalLink, Verified } from 'lucide-react';
import { env } from '@/lib/env';
import { listDirectoryCategories, listActiveListings, formatRating } from '@/lib/db/directory';
import type { DirectoryListing } from '@/lib/db/directory';

type SearchParams = { q?: string; category?: string; city?: string; page?: string };

export const revalidate = 60;

const PAGE_SIZE = 12;

export function generateMetadata(): Metadata {
  return {
    title: `Business Directory — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Discover local businesses, restaurants, services, and more.',
  };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? '';
  const category = sp.category ?? '';
  const city = sp.city ?? '';
  const page = Math.max(1, Number(sp.page) || 1);

  const [categoriesRes, listingsRes] = await Promise.all([
    listDirectoryCategories(),
    listActiveListings(page, PAGE_SIZE, category || undefined, q || undefined, city || undefined),
  ]);

  const categories = categoriesRes.status === 'ok' ? categoriesRes.data : [];
  const paginated =
    listingsRes.status === 'ok'
      ? listingsRes.data
      : { listings: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10 border-b border-(--border-subtle) pb-6">
        <nav className="mb-3 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-(--fg-muted)">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span className="text-(--fg-muted)">Directory</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight">Business Directory</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Discover local businesses, restaurants, services, and more
        </p>
      </header>

      <SearchBar initialQ={q} initialCity={city} initialCategory={category} categories={categories} />

      {categories.length > 0 && (
        <CategoryFilter categories={categories} activeCategory={category} />
      )}

      {paginated.listings.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <p className="mb-6 text-sm text-(--fg-muted)">
            {paginated.total} business{paginated.total !== 1 ? 'es' : ''} found
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination
            currentPage={paginated.page}
            totalPages={paginated.totalPages}
            q={q}
            category={category}
            city={city}
          />
        </>
      )}
    </main>
  );
}

function SearchBar({
  initialQ,
  initialCity,
  initialCategory,
  categories,
}: {
  initialQ: string;
  initialCity: string;
  initialCategory: string;
  categories: Array<{ id: string; name: string }>;
}) {
  return (
    <form action="/directory" method="GET" className="mb-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-0 flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={initialQ}
            placeholder="Search businesses..."
            className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) py-2.5 pl-10 pr-4 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--ocean-blue) focus:outline-none focus:ring-1 focus:ring-(--ocean-blue)"
          />
        </div>
        <input
          type="text"
          name="city"
          defaultValue={initialCity}
          placeholder="City"
          className="w-40 rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2.5 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--ocean-blue) focus:outline-none focus:ring-1 focus:ring-(--ocean-blue)"
        />
        <button
          type="submit"
          className="rounded-lg bg-(--ink-black) px-5 py-2.5 text-sm font-medium text-(--pure-white) transition-colors hover:bg-(--ink-dark)"
        >
          Search
        </button>
      </div>
    </form>
  );
}

function CategoryFilter({
  categories,
  activeCategory,
}: {
  categories: Array<{ id: string; name: string; slug: string }>;
  activeCategory: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      <Link
        href="/directory"
        className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
          !activeCategory
            ? 'border-(--ink-black) bg-(--ink-black) text-(--pure-white)'
            : 'border-(--border-subtle) text-(--fg-muted) hover:border-(--border-strong) hover:text-(--fg-default)'
        }`}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/directory?category=${cat.slug}`}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === cat.slug
              ? 'border-(--ink-black) bg-(--ink-black) text-(--pure-white)'
              : 'border-(--border-subtle) text-(--fg-muted) hover:border-(--border-strong) hover:text-(--fg-default)'
          }`}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}

function ListingCard({ listing }: { listing: DirectoryListing }) {
  const location = [listing.city, listing.state].filter(Boolean).join(', ');

  return (
    <Link
      href={`/directory/${listing.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface) transition-colors hover:border-(--border-strong)"
    >
      {listing.cover_image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={listing.cover_image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold leading-tight text-(--fg-default) group-hover:underline">
            {listing.business_name}
          </h3>
          {listing.is_verified && (
            <Verified className="h-4 w-4 shrink-0 text-(--ocean-blue)" aria-label="Verified" />
          )}
        </div>
        {listing.category_name && (
          <span className="mb-2 text-xs font-mono uppercase tracking-wider text-(--fg-muted)">
            {listing.category_name}
          </span>
        )}
        {listing.short_description && (
          <p className="mb-3 line-clamp-2 text-sm text-(--fg-muted)">
            {listing.short_description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-(--fg-subtle)">
          <div className="flex items-center gap-3">
            {listing.rating_avg > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-(--fg-subtle)" aria-hidden />
                {formatRating(listing.rating_avg)}
                <span className="text-(--fg-subtle)">({listing.review_count})</span>
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {location}
              </span>
            )}
          </div>
          {listing.price_range && <span>{listing.price_range}</span>}
        </div>
      </div>
    </Link>
  );
}

function Pagination({
  currentPage,
  totalPages,
  q,
  category,
  city,
}: {
  currentPage: number;
  totalPages: number;
  q: string;
  category: string;
  city: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <PageLink
        href={buildHref({ currentPage: currentPage - 1, q, category, city })}
        disabled={currentPage <= 1}
      >
        Prev
      </PageLink>
      <span className="text-sm text-(--fg-muted)">
        Page {currentPage} of {totalPages}
      </span>
      <PageLink
        href={buildHref({ currentPage: currentPage + 1, q, category, city })}
        disabled={currentPage >= totalPages}
      >
        Next
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm text-(--fg-subtle) opacity-50">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-surface-subtle) hover:text-(--fg-default)"
    >
      {children}
    </Link>
  );
}

function buildHref({
  currentPage,
  q,
  category,
  city,
}: {
  currentPage: number;
  q: string;
  category: string;
  city: string;
}): string {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (city) params.set('city', city);
  if (currentPage > 1) params.set('page', String(currentPage));
  return `/directory?${params.toString()}`;
}

function EmptyState() {
  return (
    <section className="py-20 text-center">
      <MapPin className="mx-auto h-12 w-12 text-(--fg-subtle)" strokeWidth={1} aria-hidden />
      <h2 className="mt-4 text-xl font-semibold text-(--fg-default)">
        No businesses found
      </h2>
      <p className="mt-2 text-sm text-(--fg-muted)">
        Try adjusting your search or browse a different category.
      </p>
      <Link
        href="/directory"
        className="mt-4 inline-block text-sm text-(--ocean-blue) underline underline-offset-2 hover:text-(--fg-default)"
      >
        View all listings
      </Link>
    </section>
  );
}
