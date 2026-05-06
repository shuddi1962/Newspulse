import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Clock, Star, CalendarCheck } from 'lucide-react';
import { env } from '@/lib/env';

export const revalidate = 60;

const services = [
  {
    id: '1',
    name: 'The Grand Bistro',
    service: 'Dinner Reservation',
    price: 'Free',
    time: 'Today, 7:00 PM',
    priceValue: 0,
    image: 'https://images.unsplash.com/photo-1517248135457-2c065e093?w=400&h=300&fit=crop',
    rating: 4.8,
    category: 'Restaurant',
    slots: 3,
  },
  {
    id: '2',
    name: 'Glamour Studio',
    service: 'Haircut & Styling',
    price: '$65',
    time: 'Tomorrow, 10:00 AM',
    priceValue: 65,
    image: 'https://images.unsplash.com/photo-1560066984-9a27fa9f3ae?w=400&h=300&fit=crop',
    rating: 4.6,
    category: 'Beauty',
    slots: 5,
  },
  {
    id: '3',
    name: 'Elite Wellness',
    service: 'General Checkup',
    price: '$120',
    time: 'Mar 29, 2:00 PM',
    priceValue: 120,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
    rating: 4.9,
    category: 'Health',
    slots: 2,
  },
  {
    id: '4',
    name: 'FitZone Gym',
    service: 'Personal Training',
    price: '$45/session',
    time: 'Today, 6:00 PM',
    priceValue: 45,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec261012?w=400&h=300&fit=crop',
    rating: 4.7,
    category: 'Fitness',
    slots: 1,
  },
  {
    id: '5',
    name: 'Dr. Sarah Lee',
    service: 'Legal Consultation',
    price: '$200/hr',
    time: 'Mar 30, 11:00 AM',
    priceValue: 200,
    image: 'https://images.unsplash.com/photo-1560250097-0b9358e751141?w=400&h=300&fit=crop',
    rating: 5.0,
    category: 'Professional',
    slots: 4,
  },
  {
    id: '6',
    name: 'QuickFix Auto',
    service: 'Oil Change + Check',
    price: '$49',
    time: 'Mar 28, 9:00 AM',
    priceValue: 49,
    image: 'https://images.unsplash.com/photo-1632823405341-31e047ff79c6?w=400&h=300&fit=crop',
    rating: 4.5,
    category: 'Automotive',
    slots: 6,
  },
];

export function generateMetadata(): Metadata {
  return {
    title: `Booking — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Book appointments with local service providers.',
  };
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? '';

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10 border-b border-(--border-subtle) pb-8">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Services
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-(--fg-default)">
          Book a Service
        </h1>
        <p className="mt-2 max-w-2xl text-base text-(--fg-muted)">
          Schedule appointments with verified local professionals and service providers.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <form action="/booking" method="GET" className="flex flex-1 gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Service, business, or professional..."
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
          {['Restaurants', 'Beauty', 'Health', 'Fitness', 'Professional', 'Automotive'].map((cat) => (
            <Link
              key={cat}
              href={`/booking?category=${cat.toLowerCase()}`}
              className="rounded-full border border-(--border-subtle) px-4 py-1.5 text-xs font-medium text-(--fg-muted) transition-colors hover:border-(--border-strong) hover:text-(--fg-default)"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <div
            key={s.id}
            className="overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface) transition-all duration-200 hover:border-(--border-strong) hover:shadow-sm"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-(--bg-muted)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.name}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
              />
              <span className="absolute left-3 top-3 rounded bg-(--ocean-blue) px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                {s.category}
              </span>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold leading-tight text-(--fg-default)">
                    {s.name}
                  </h3>
                  <p className="text-sm text-(--fg-muted)">{s.service}</p>
                </div>
              </div>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-(--fg-subtle)">
                  <Star className="h-3 w-3 fill-(--color-cat-lifestyle) text-(--color-cat-lifestyle)" />
                  <span>{s.rating}</span>
                </div>
                <span className={`text-sm font-bold ${s.priceValue === 0 ? 'text-(--forest-green)' : 'text-(--fg-default)'}`}>
                  {s.price}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-(--fg-subtle)">
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  {s.time}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {s.category}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${s.slots <= 2 ? 'bg-(--signal-red) text-white' : 'bg-(--forest-green) text-white'}`}>
                  {s.slots} slots left
                </span>
                <button className="rounded-lg bg-(--ink-black) px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-(--ink-dark)">
                  <CalendarCheck className="mr-1.5 inline h-3 w-3" />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
