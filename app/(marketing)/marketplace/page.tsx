import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, Tag, MapPin, Heart, ShoppingCart } from 'lucide-react';
import { env } from '@/lib/env';

export const revalidate = 60;

const featuredItems = [
  {
    id: '1',
    title: 'MacBook Pro M3 — Like New Condition',
    price: '$1,299',
    location: 'Brooklyn, NY',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
    seller: 'TechResaleNYC',
    rating: 4.9,
    featured: true,
  },
  {
    id: '2',
    title: '2021 Tesla Model 3 — Low Miles',
    price: '$28,500',
    location: 'Manhattan, NY',
    image: 'https://images.unsplash.com/photo-1619767886553-4b8d7c2b2c7?w=400&h=300&fit=crop',
    seller: 'AutoMax Brooklyn',
    rating: 4.7,
    featured: true,
  },
  {
    id: '3',
    title: 'Vintage Leather Jacket — Size L',
    price: '$89',
    location: 'Queens, NY',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
    seller: 'UrbanVintage',
    rating: 4.5,
    featured: false,
  },
  {
    id: '4',
    title: 'Smart Home Bundle — Alexa + Ring',
    price: '$249',
    location: 'Bronx, NY',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
    seller: 'SmartLiving Co',
    rating: 4.8,
    featured: false,
  },
  {
    id: '5',
    title: 'Professional Logo Design Pack',
    price: '$149',
    location: 'Remote',
    image: 'https://images.unsplash.com/photo-1626785774573-4b7998d34d21?w=400&h=300&fit=crop',
    seller: 'DesignHub',
    rating: 4.6,
    featured: false,
  },
  {
    id: '6',
    title: 'iPad Pro M2 — 256GB Space Gray',
    price: '$749',
    location: 'Staten Island, NY',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ff89f9?w=400&h=300&fit=crop',
    seller: 'GadgetSwap',
    rating: 4.9,
    featured: false,
  },
];

export function generateMetadata(): Metadata {
  return {
    title: `Marketplace — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Buy and sell in your local community.',
  };
}

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? '';

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10 border-b border-(--border-subtle) pb-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Community
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-(--fg-default)">
          Marketplace
        </h1>
        <p className="mt-2 max-w-2xl text-base text-(--fg-muted)">
          Buy, sell, and trade with your local community. From electronics to services, find what you need.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <form action="/marketplace" method="GET" className="flex flex-1 gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search items, categories, or sellers..."
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
          href="/marketplace/new"
          className="inline-flex items-center gap-2 rounded-lg bg-(--forest-green) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          <Tag className="h-4 w-4" />
          Sell Item
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {['All', 'Electronics', 'Vehicles', 'Fashion', 'Home & Garden', 'Services', 'Digital'].map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/marketplace' : `/marketplace?category=${cat.toLowerCase()}`}
            className="rounded-full border border-(--border-subtle) px-4 py-1.5 text-xs font-medium text-(--fg-muted) transition-colors hover:border-(--border-strong) hover:text-(--fg-default)"
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featuredItems.map((item) => (
          <Link
            key={item.id}
            href={`/marketplace/${item.id}`}
            className="group overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface) transition-all duration-200 hover:border-(--border-strong) hover:shadow-sm"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-(--bg-muted)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {item.featured && (
                <span className="absolute left-3 top-3 rounded bg-(--color-cat-lifestyle) px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                  Featured
                </span>
              )}
              <div
                className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 backdrop-blur-sm"
              >
                <Heart className="h-4 w-4 text-(--fg-muted)" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 text-base font-semibold leading-tight text-(--fg-default) group-hover:underline">
                {item.title}
              </h3>
              <p className="mt-2 text-xl font-bold text-(--forest-green)">{item.price}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-(--fg-subtle)">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-(--color-cat-lifestyle)">★</span>
                  {item.rating}
                </span>
              </div>
              <p className="mt-1 text-xs text-(--fg-subtle)">{item.seller}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
