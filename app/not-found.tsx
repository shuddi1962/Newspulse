import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-(--bg-base) px-6 py-16">
      <div className="w-full max-w-lg space-y-6 text-center">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          404 — Not found
        </p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-(--fg-default)">
          This page has gone to press
        </h1>
        <p className="text-sm text-(--fg-muted)">
          The URL you followed doesn&rsquo;t match anything we publish. It may
          have been moved, retitled, or never existed at all.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className={cn(buttonVariants({ variant: 'primary' }))}>
            Back to home
          </Link>
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: 'secondary' }))}
          >
            Open admin
          </Link>
        </div>
      </div>
    </main>
  );
}
