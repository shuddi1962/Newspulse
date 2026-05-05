import type { Metadata } from 'next';
import Link from 'next/link';
import { Tag, Search as SearchIcon } from 'lucide-react';
import { env } from '@/lib/env';

export const revalidate = 60;

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
      <header className="mb-8 border-b border-(--border-subtle) pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Classifieds</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Buy, sell, and trade in your community</p>
      </header>

      <form action="/classifieds" method="GET" className="mb-8">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search classifieds..."
            className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) py-2.5 pl-10 pr-4 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--ocean-blue) focus:outline-none focus:ring-1 focus:ring-(--ocean-blue)"
          />
        </div>
      </form>

      <section className="py-20 text-center">
        <Tag className="mx-auto h-12 w-12 text-(--fg-subtle)" strokeWidth={1} aria-hidden />
        <h2 className="mt-4 text-xl font-semibold">No classifieds yet</h2>
        <p className="mt-2 text-sm text-(--fg-muted)">Be the first to post an ad.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-(--ocean-blue) underline underline-offset-2 hover:text-(--fg-default)">
          Return to homepage
        </Link>
      </section>
    </main>
  );
}
