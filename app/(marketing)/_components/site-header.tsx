import Link from 'next/link';
import { ChevronDown, Menu } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { env } from '@/lib/env';
import { getCurrentUser } from '@/lib/auth/session';
import { detectLocale } from '@/lib/i18n/server';
import { LocaleSelector } from './locale-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { MegaMenu } from './mega-menu';
import { LiveSearch } from './live-search';

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
    <header className="sticky top-0 z-50 border-b border-(--border-subtle) bg-(--bg-base/95) backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="font-display text-xl font-semibold tracking-tight text-(--fg-default)"
          >
            {env.NEXT_PUBLIC_SITE_NAME}
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              if (item.href === '/news') {
                return (
                  <div key={item.href} className="group relative">
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
                    >
                      {item.label}
                      <ChevronDown className="h-3 w-3" />
                    </Link>
                    <MegaMenu />
                  </div>
                );
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LocaleSelector currentLocale={locale} />
          <LiveSearch />
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
          <button
            className="flex items-center rounded-md p-2 text-(--fg-muted) hover:bg-(--bg-muted) md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
