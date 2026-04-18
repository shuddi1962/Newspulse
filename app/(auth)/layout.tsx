import Link from 'next/link';
import type { ReactNode } from 'react';
import { env } from '@/lib/env';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-(--border-subtle)">
        <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center px-6">
          <Link
            href="/"
            className="font-display text-lg font-semibold tracking-tight text-(--fg-default)"
          >
            {env.NEXT_PUBLIC_SITE_NAME}
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
