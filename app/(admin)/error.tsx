'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/(admin)/error]', error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Admin error
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-(--fg-default)">
          This section failed to load
        </h1>
        <p className="mt-2 text-sm text-(--fg-muted)">
          An error prevented the admin page from rendering. Retry below, or
          return to the overview.
        </p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle />
        <div className="space-y-1">
          <AlertTitle>Request failed</AlertTitle>
          <AlertDescription>
            {error.message || 'Unknown error.'}
            {error.digest ? (
              <span className="mt-1 block font-mono text-[0.7rem] text-(--fg-subtle)">
                digest: {error.digest}
              </span>
            ) : null}
          </AlertDescription>
        </div>
      </Alert>

      <div className="flex items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          Back to overview
        </Link>
      </div>
    </div>
  );
}
