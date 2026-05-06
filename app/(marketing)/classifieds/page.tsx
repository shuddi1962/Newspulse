import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Heart, Tag, Clock } from 'lucide-react';
import { env } from '@/lib/env';

export const revalidate = 60;

const classifieds = [
  {
    id: '1',
    title: 'Moving Sale — Furniture, Electronics & More',
    price: 'Various',
    location: 'Upper East Side, NY',
    time: '1h ago',
    image: 'https://images.unsplash.com/photo-1555041469-a5861c5ff5f?w=400&h=300&fit=crop',
    category: 'For Sale',
    featured: true,
  },
  {
    id: '2',
    title: 'Experienced Dog Walker Available',
    price: '$20/walk',
    location: 'All Brooklyn, NY',
    time: '3h ago',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc247b?w=400&h=300&fit=crop',
    category: 'Services',
    featured: false,
  },
  {
    id: '3',
    title: 'Looking for 2BR Roommate — $1,200/mo',
    price: '$1,200/mo',
    location: 'Bushwick, NY',
    time: '5h ago',
    image: 'https://images.unsplash.com/photo-1560185007-cde43648e21e?w=400&h=300&fit=crop',
    category: 'Wanted',
    featured: false,
  },
  {
    id: '4',
    title: 'Weekend Photography — Weddings & Events',
    price: 'From $500',
    location: 'NYC Metro',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1600573472552-0a7f87c3f89?w=400&h=300&fit=crop',
    category: 'Gigs',
    featured: true,
  },
  {
    id: '5',
    title: 'Free Community Coding Workshop',
    price: 'Free',
    location: 'Public Library, BK',
    time: '6h ago',
    image: 'https://images.unsplash.com/photo-1516321318423-49756c63fac4?w=400&h=300&fit=crop',
    category: 'Community',
    featured: false,
  },
  {
    id: '6',
    title: 'Lost Orange Tabby Cat — REWARD',
    price: '$200 reward',
    location: 'Chelsea, NY',
    time: '30m ago',
    image: 'https://images.unsplash.com/photo-1518717758536-2ae8f8ceb25?w=400&h=300&fit=crop',
    category: 'Lost & Found',
    featured: false,
  },
];

export function generateMetadata(): Metadata {
  return {
    title: `Classifieds — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Buy, sell, and trade in your community.',
  };
}

export default async function ClassifiedsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? '';

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10 border-b border-(--border-subtle) pb-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Community
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-(--fg-default)">
          Classifieds
        </h1>
        <p className="mt-2 max-w-2xl text-base text-(--fg-muted)">
          Community classifieds — post anything, find everything.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <form action="/classifieds" method="GET" className="flex flex-1 gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="What are you looking for?"
              className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) py-2.5 pl-10 pr-4 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--ocean-blue) focus:outline-none focus:ring-1 focus:ring-(--ocean-blue)"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-(--ink-black) px-5 py-2.5 text-sm font-medium text-(--pure-white) transition-colors hover:bg-(--ink-dark)"
          >
            Search
          </button>
        </form>
        <Link
          href="/classifieds/new"
          className="inline-flex items-center gap-2 rounded-lg bg-(--forest-green) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          <Tag className="h-4 w-4" />
          Post Free Ad
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {['All', 'For Sale', 'Wanted', 'Services', 'Gigs', 'Community', 'Lost & Found'].map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/classifieds' : `/classifieds?category=${cat.toLowerCase()}`}
            className="rounded-full border border-(--border-subtle) px-4 py-1.5 text-xs font-medium text-(--fg-muted) transition-colors hover:border-(--border-strong) hover:text-(--fg-default)"
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {classifieds.map((ad) => (
          <div
            key={ad.id}
            className={`flex gap-4 rounded-lg border p-4 transition-all duration-200 hover:border-(--border-strong) hover:shadow-sm ${ad.featured ? 'border-l-4 border-l-(--color-cat-lifestyle)' : ''}`}
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-(--bg-muted)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ad.image}
                alt={ad.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-(--fg-default)">
                  {ad.title}
                </h3>
                <div
                  className="shrink-0 rounded-full p-1"
                >
                  <Heart className="h-4 w-4 text-(--fg-subtle)" />
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-(--fg-subtle)">
                <span className="rounded-full bg-(--color-cat-lifestyle) bg-opacity-10 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-(--color-cat-lifestyle)">
                  {ad.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {ad.location}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-sm font-bold ${ad.price === 'Free' ? 'text-(--forest-green)' : 'text-(--fg-default)'}`}>
                  {ad.price}
                </span>
                <span className="flex items-center gap-1 text-xs text-(--fg-subtle)">
                  <Clock className="h-3 w-3" />
                  {ad.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
