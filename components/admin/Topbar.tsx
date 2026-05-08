'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ExternalLink, Bell, ChevronDown, LogOut, Settings } from 'lucide-react';
import { signOutAction } from '@/lib/auth/actions';
import type { AuthUser } from '@/lib/auth/session';

interface TopbarProps {
  user: AuthUser;
}

function useBreadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return [{ label: 'Dashboard', href: '/admin/dashboard' }];
  return parts.map((part, i) => ({
    label: part
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: '/' + parts.slice(0, i + 1).join('/'),
  }));
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const breadcrumbs = useBreadcrumbs();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[var(--color-admin-border)] bg-white px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">/</span>}
            {i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="text-[var(--color-admin-text-muted)] hover:text-[var(--color-admin-text)]">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--color-admin-text)]">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-[var(--color-admin-text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--color-admin-text)]"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">View Site</span>
        </Link>

        <button
          className="relative rounded-md p-2 text-[var(--color-admin-text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--color-admin-text)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-crimson)] text-[10px] font-bold text-white">
            3
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-md p-1.5 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-crimson)] text-xs font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <ChevronDown className="h-4 w-4 text-[var(--color-admin-text-muted)]" />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border border-[var(--color-admin-border)] bg-white py-1 shadow-lg">
                <div className="border-b border-[var(--color-admin-border)] px-4 py-2">
                  <p className="text-sm font-medium text-[var(--color-admin-text)]">{user.name ?? 'Admin'}</p>
                  <p className="text-xs text-[var(--color-admin-text-muted)]">{user.email}</p>
                </div>
                <Link
                  href="/admin/settings/general"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-admin-text)] hover:bg-gray-50"
                  onClick={() => setDropdownOpen(false)}
                >
                  <Settings className="h-4 w-4" /> Settings
                </Link>
                <button
                  onClick={() => {
                    startTransition(async () => {
                      const result = await signOutAction();
                      if (result.status === 'error') {
                        toast.error(result.message);
                        return;
                      }
                      router.replace('/login');
                      router.refresh();
                    });
                  }}
                  disabled={isPending}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
