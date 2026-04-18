import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminNotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          404 — Admin
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-(--fg-default)">
          Admin page not found
        </h1>
        <p className="mt-2 text-sm text-(--fg-muted)">
          This admin route doesn&rsquo;t exist. Use the sidebar to navigate to
          a valid section.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: 'primary' }))}
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
