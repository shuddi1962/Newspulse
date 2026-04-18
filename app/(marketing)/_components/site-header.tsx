import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { env } from '@/lib/env';
import { getCurrentUser } from '@/lib/auth/session';

const navItems: Array<{ href: string; label: string }> = [
  { href: '/news', label: 'News' },
  { href: '/directory', label: 'Directory' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/events', label: 'Events' },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

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
          {user ? (
            <Link
              href="/admin"
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-(--fg-muted) transition-colors hover:text-(--fg-default)"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
