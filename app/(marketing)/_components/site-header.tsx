import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { env } from '@/lib/env';
import { getCurrentUser } from '@/lib/auth/session';
import { detectLocale } from '@/lib/i18n/server';
import { LocaleSelector } from './locale-selector';

const navItems: Array<{ href: string; label: string }> = [
  { href: '/news', label: 'News' },
  { href: '/video', label: 'Video' },
  { href: '/directory', label: 'Directory' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/events', label: 'Events' },
  { href: '/subscribe', label: 'Subscribe' },
  { href: '/advertise', label: 'Advertise' },
];

export async function SiteHeader() {
  const [user, locale] = await Promise.all([getCurrentUser(), detectLocale()]);

  return (
    <header className="border-b border-(--border-subtle) bg-(--bg-base)">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-tight text-(--fg-default)"
          >
            {env.NEXT_PUBLIC_SITE_NAME}
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-(--fg-muted) transition-colors hover:text-(--fg-default)"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <LocaleSelector currentLocale={locale} />
          <Link
            href="/search"
            className="text-(--fg-muted) transition-colors hover:text-(--fg-default)"
            aria-label="Search"
          >
            <SearchIcon className="h-5 w-5" aria-hidden />
          </Link>
          {user ? (
            <>
              <Link
                href="/ads"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                Ad Center
              </Link>
              <Link
                href="/subscribe"
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Subscribe
              </Link>
              <Link
                href="/admin"
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-(--fg-muted) transition-colors hover:text-(--fg-default)"
              >
                Sign in
              </Link>
              <Link
                href="/subscribe"
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Subscribe
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
