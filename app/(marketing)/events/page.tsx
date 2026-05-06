import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Ticket, Star, TrendingUp } from 'lucide-react';
import { env } from '@/lib/env';

export const revalidate = 60;

const events = [
  {
    id: '1',
    name: 'Tech Innovation Summit 2026',
    date: 'Apr 15–16, 2026',
    time: '9:00 AM – 6:00 PM',
    location: 'Javits Convention Center, NYC',
    price: '$299',
    image: 'https://images.unsplash.com/photo-154057546996-705c0906daeb?w=600&h=400&fit=crop',
    category: 'Conference',
    attendees: 2400,
    hot: true,
  },
  {
    id: '2',
    name: 'Jazz Night at Blue Note',
    date: 'Mar 29, 2026',
    time: '8:00 PM – 11:00 PM',
    location: 'Blue Note, Greenwich Village',
    price: '$45',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    category: 'Music',
    attendees: 180,
    hot: false,
  },
  {
    id: '3',
    name: 'Startup Pitch Competition',
    date: 'Apr 5, 2026',
    time: '2:00 PM – 5:00 PM',
    location: 'WeWork, SoHo',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1559136555-9303b1ab0c3?w=600&h=400&fit=crop',
    category: 'Business',
    attendees: 350,
    hot: true,
  },
  {
    id: '4',
    name: 'Food & Wine Festival',
    date: 'Apr 10–12, 2026',
    time: '12:00 PM – 8:00 PM',
    location: 'Central Park, NYC',
    price: '$75',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop',
    category: 'Food & Drink',
    attendees: 5000,
    hot: false,
  },
  {
    id: '5',
    name: 'Yoga in the Park',
    date: 'Every Saturday',
    time: '9:00 AM – 10:30 AM',
    location: 'Prospect Park, Brooklyn',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    category: 'Wellness',
    attendees: 60,
    hot: false,
  },
  {
    id: '6',
    name: 'Web3 Developer Meetup',
    date: 'Apr 2, 2026',
    time: '6:00 PM – 9:00 PM',
    location: 'Virtual / Zoom',
    price: 'Free',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
    category: 'Tech',
    attendees: 420,
    hot: false,
  },
];

export function generateMetadata(): Metadata {
  return {
    title: `Events — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Discover upcoming events and get tickets.',
  };
}

export default async function EventsPage({
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
          Community
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-(--fg-default)">
          Events
        </h1>
        <p className="mt-2 max-w-2xl text-base text-(--fg-muted)">
          Discover local and virtual events, conferences, and meetups happening near you.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <form action="/events" method="GET" className="flex flex-1 gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search events, categories, or venues..."
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
        <select
          className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2.5 text-sm text-(--fg-default) focus:border-(--ocean-blue) focus:outline-none"
          aria-label="Filter by date"
        >
          <option value="">Any date</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {['All', 'Conference', 'Music', 'Business', 'Food & Drink', 'Wellness', 'Tech'].map((cat) => (
          <Link
            key={cat}
            href={cat === 'All' ? '/events' : `/events?category=${cat.toLowerCase()}`}
            className="rounded-full border border-(--border-subtle) px-4 py-1.5 text-xs font-medium text-(--fg-muted) transition-colors hover:border-(--border-strong) hover:text-(--fg-default)"
          >
            {cat}
          </Link>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="group overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface) transition-all duration-200 hover:border-(--border-strong) hover:shadow-sm"
          >
            <div className="relative aspect-[3/2] overflow-hidden bg-(--bg-muted)">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.image}
                alt={event.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {event.hot && (
                <span className="absolute right-3 top-3 rounded bg-(--signal-red) px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                  Hot
                </span>
              )}
              <div className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-1 backdrop-blur-sm">
                <p className="text-xs font-semibold text-white">{event.price}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-(--ocean-blue) px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                  {event.category}
                </span>
              </div>
              <h3 className="line-clamp-2 text-base font-semibold leading-tight text-(--fg-default) group-hover:underline">
                {event.name}
              </h3>
              <div className="mt-3 space-y-1.5 text-xs text-(--fg-subtle)">
                <p className="flex items-center gap-1.5">
                  <Ticket className="h-3 w-3" />
                  {event.date} · {event.time}
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </p>
                <p className="flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" />
                  {event.attendees.toLocaleString()} attending
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
