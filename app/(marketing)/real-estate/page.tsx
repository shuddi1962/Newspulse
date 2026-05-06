import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { env } from '@/lib/env';

export const revalidate = 60;

const properties = [
  {
    id: '1',
    title: 'Modern 2BR Condo — Skyline Views',
    price: '$485,000',
    location: 'Williamsburg, Brooklyn',
    beds: 2,
    baths: 1,
    sqft: 950,
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3a10fb3b?w=600&h=400&fit=crop',
    type: 'Condo',
    new: true,
    forSale: true,
  },
  {
    id: '2',
    title: 'Charming 3BR Brownstone',
    price: '$1,250,000',
    location: 'Park Slope, Brooklyn',
    beds: 3,
    baths: 2,
    sqft: 1800,
    image: 'https://images.unsplash.com/photo-1564013799919-7cf2f65e0ae2?w=600&h=400&fit=crop',
    type: 'House',
    new: false,
    forSale: true,
  },
  {
    id: '3',
    title: 'Luxury Studio — Doorman Building',
    price: '$2,800/mo',
    location: 'Midtown, Manhattan',
    beds: 0,
    baths: 1,
    sqft: 550,
    image: 'https://images.unsplash.com/photo-1522708326310-7dec728fd4a2?w=600&h=400&fit=crop',
    type: 'Rental',
    new: true,
    forSale: false,
  },
  {
    id: '4',
    title: 'Spacious 4BR Family Home',
    price: '$725,000',
    location: 'Astoria, Queens',
    beds: 4,
    baths: 3,
    sqft: 2200,
    image: 'https://images.unsplash.com/photo-1570129478242-77a4714ae4e8?w=600&h=400&fit=crop',
    type: 'House',
    new: false,
    forSale: true,
  },
  {
    id: '5',
    title: 'Cozy 1BR — Steps from Subway',
    price: '$1,950/mo',
    location: 'East Village, Manhattan',
    beds: 1,
    baths: 1,
    sqft: 650,
    image: 'https://images.unsplash.com/photo-1502672260266-1d2b0c6a352b?w=600&h=400&fit=crop',
    type: 'Rental',
    new: false,
    forSale: false,
  },
  {
    id: '6',
    title: 'Penthouse Duplex — Private Terrace',
    price: '$2,100,000',
    location: 'DUMBO, Brooklyn',
    beds: 3,
    baths: 2,
    sqft: 2400,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4f750?w=600&h=400&fit=crop',
    type: 'Condo',
    new: true,
    forSale: true,
  },
];

export function generateMetadata(): Metadata {
  return {
    title: `Real Estate — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Find properties for sale and rent.',
  };
}

export default async function RealEstatePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q ?? '';

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10 border-b border-(--border-subtle) pb-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Property
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-(--fg-default)">
          Real Estate
        </h1>
        <p className="mt-2 max-w-2xl text-base text-(--fg-muted)">
          Find your perfect home — buy, rent, or list your property with confidence.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <form action="/real-estate" method="GET" className="flex flex-1 gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Neighborhood, city, or ZIP..."
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
        <div className="flex gap-2">
          {['Buy', 'Rent', 'Sell'].map((mode) => (
            <button
              key={mode}
              className="rounded-lg border border-(--border-subtle) px-5 py-2.5 text-sm font-medium text-(--fg-muted) transition-colors hover:border-(--border-strong) hover:text-(--fg-default)"
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/real-estate/${property.id}`}
            className="group overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface) transition-all duration-200 hover:border-(--border-strong) hover:shadow-sm"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-(--bg-muted)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={property.image}
                alt={property.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {property.new && (
                <span className="absolute left-3 top-3 rounded bg-(--forest-green) px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                  New
                </span>
              )}
              <span className="absolute right-3 top-3 rounded bg-black/60 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                {property.type}
              </span>
              <button
                className="absolute right-3 bottom-3 rounded-full bg-white/80 p-1.5 backdrop-blur-sm transition-colors hover:bg-white"
                aria-label="Save property"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-4 w-4 text-(--fg-muted)" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-xl font-bold text-(--fg-default)">{property.price}</p>
              <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-tight text-(--fg-default) group-hover:underline">
                {property.title}
              </h3>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-(--fg-subtle)">
                <MapPin className="h-3 w-3" />
                {property.location}
              </p>
              <div className="mt-3 flex gap-4 text-xs text-(--fg-subtle)">
                <span className="flex items-center gap-1">
                  <Bed className="h-3 w-3" />
                  {property.beds || 'Studio'}
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="h-3 w-3" />
                  {property.baths}
                </span>
                <span className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  {property.sqft} ft²
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
