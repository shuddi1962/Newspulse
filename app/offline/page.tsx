import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'You are offline — NewsPulse',
  description: 'You are currently offline. Please check your connection.',
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--bg-muted)">
        <svg
          className="h-8 w-8 text-(--fg-muted)"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">
        You are offline
      </h1>
      <p className="mt-2 max-w-md text-sm text-(--fg-muted)">
        Please check your internet connection and try again. Some previously viewed articles
        may still be available from cache.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)"
      >
        Return home
      </Link>
    </main>
  );
}
