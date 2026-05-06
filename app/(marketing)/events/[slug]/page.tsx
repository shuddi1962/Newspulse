import type { Metadata } from 'next';
import Link from 'next/link';
import { env } from '@/lib/env';

export const revalidate = 60;

export function generateMetadata(): Metadata {
  return { title: `Event — ${env.NEXT_PUBLIC_SITE_NAME}` };
}

export default async function EventDetailPage() {
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <nav className="mb-6 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-(--fg-muted)">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/events" className="hover:text-(--fg-muted)">Events</Link>
        <span className="mx-1">/</span>
        <span className="text-(--fg-muted)">Event</span>
      </nav>
      <section className="py-20 text-center">
        <h2 className="text-xl font-semibold">Event details coming soon</h2>
        <p className="mt-2 text-sm text-(--fg-muted)">Full event details, ticketing, and venue info will appear here.</p>
      </section>
    </main>
  );
}
