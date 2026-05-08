'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatColor = 'green' | 'blue' | 'purple' | 'pink' | 'yellow' | 'cyan' | 'orange' | 'lime';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: StatColor;
  trend?: { value: number; direction: 'up' | 'down' };
}

const colorMap: Record<StatColor, { bg: string; icon: string }> = {
  green: { bg: 'bg-emerald-100', icon: 'text-emerald-600' },
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  pink: { bg: 'bg-pink-100', icon: 'text-pink-600' },
  yellow: { bg: 'bg-amber-100', icon: 'text-amber-600' },
  cyan: { bg: 'bg-cyan-100', icon: 'text-cyan-600' },
  orange: { bg: 'bg-orange-100', icon: 'text-orange-600' },
  lime: { bg: 'bg-lime-100', icon: 'text-lime-600' },
};

export function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5 shadow-sm">
      <div className={cn('flex h-12 w-12 items-center justify-center rounded-lg', c.bg)}>
        <Icon className={cn('h-6 w-6', c.icon)} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-admin-text-muted)]">
          {title}
        </p>
        <p className="mt-1 text-2xl font-bold text-[var(--color-admin-text)]">{value}</p>
        {trend && (
          <p className={cn('mt-0.5 text-xs', trend.direction === 'up' ? 'text-emerald-600' : 'text-red-600')}>
            {trend.direction === 'up' ? '\u2191' : '\u2193'} {trend.value}%
          </p>
        )}
      </div>
    </div>
  );
}
