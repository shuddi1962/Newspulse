'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-(--bg-base) px-6 py-16">
      <div className="w-full max-w-lg space-y-6">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Error
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-(--fg-muted)">
            An unexpected error interrupted this page. You can retry, or head
            back to the home page.
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
          <Link href="/" className={cn(buttonVariants({ variant: 'secondary' }))}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
