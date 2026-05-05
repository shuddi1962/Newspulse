import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';
import { env } from '@/lib/env';

export const revalidate = 60;

export function generateMetadata(): Metadata {
  return {
    title: `Events — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Discover upcoming events and get tickets.',
  };
}

export default async function EventsPage() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-8 border-b border-(--border-subtle) pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Discover upcoming events and get tickets</p>
      </header>
      <section className="py-20 text-center">
        <CalendarDays className="mx-auto h-12 w-12 text-(--fg-subtle)" strokeWidth={1} aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">No events scheduled</h2>
        <p className="mt-2 text-sm text-(--fg-muted)">Check back soon for upcoming events.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-(--ocean-blue) underline underline-offset-2 hover:text-(--fg-default)">
          Return to homepage
        </Link>
      </section>
    </main>
  );
}
