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
  pendingCount?: number;
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

export function Topbar({ user, pendingCount = 0 }: TopbarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const breadcrumbs = useBreadcrumbs();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">/</span>}
            {i < breadcrumbs.length - 1 ? (
              <Link href={crumb.href} className="text-gray-500 hover:text-gray-800 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-800"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">View Site</span>
        </Link>

        <button
          className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-crimson)] text-[10px] font-bold text-white">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-crimson)] text-xs font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 leading-tight">{user.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{user.name ?? 'Admin'}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <Link
                  href="/admin/settings/general"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
