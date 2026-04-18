import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  BarChart3,
  CalendarClock,
  FileText,
  LayoutDashboard,
  Newspaper,
  Settings,
  Users,
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
import { SignOutButton } from './_components/sign-out-button';

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content', icon: Newspaper },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/schedule', label: 'Schedule', icon: CalendarClock },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/admin');
  }

  return (
    <div className="flex min-h-screen flex-1 bg-(--bg-muted)">
      <aside
        aria-label="Admin navigation"
        className="hidden w-60 shrink-0 flex-col border-r border-(--border-subtle) bg-(--bg-base) md:flex"
      >
        <div className="h-16 border-b border-(--border-subtle) px-6 text-sm">
          <Link
            href="/"
            className="flex h-full items-center font-display text-base font-semibold tracking-tight text-(--fg-default)"
          >
            {env.NEXT_PUBLIC_SITE_NAME}
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm text-(--fg-muted) transition-colors',
                'hover:bg-(--bg-muted) hover:text-(--fg-default)',
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-(--border-subtle) bg-(--bg-base) px-6">
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
              Admin
            </p>
            <p className="text-sm text-(--fg-default)">
              Signed in as{' '}
              <span className="text-(--fg-default)">{user.email}</span>
            </p>
          </div>
          <SignOutButton />
        </header>
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}
