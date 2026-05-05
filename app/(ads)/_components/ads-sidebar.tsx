'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Megaphone,
  PlusCircle,
  BarChart3,
  CreditCard,
  FileText,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/ads', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ads/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/ads/create', label: 'New Campaign', icon: PlusCircle },
  { href: '/ads/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/ads/payments', label: 'Payments', icon: CreditCard },
  { href: '/ads/invoices', label: 'Invoices', icon: FileText },
  { href: '/ads/account', label: 'Account Settings', icon: Settings },
];

export function AdsSidebar({ hasAccount }: { hasAccount: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-(--border-subtle) bg-(--bg-surface) lg:block">
      <div className="flex h-16 items-center border-b border-(--border-subtle) px-6">
        <span className="font-display text-lg font-semibold tracking-tight text-(--fg-base)">
          Ad Center
        </span>
      </div>
      <nav className="flex flex-col gap-1 p-4" aria-label="Advertiser navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isDisabled = !hasAccount && item.href !== '/ads/account';
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isDisabled
                  ? 'pointer-events-none text-(--fg-subtle)'
                  : isActive
                  ? 'bg-(--bg-surface-subtle) font-medium text-(--fg-base)'
                  : 'text-(--fg-muted) hover:bg-(--bg-surface-subtle) hover:text-(--fg-base)',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
