'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatColor = 'blue' | 'emerald' | 'violet' | 'amber' | 'rose' | 'cyan' | 'orange' | 'indigo';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: StatColor;
  trend?: { value: number; direction: 'up' | 'down' };
  subtitle?: string;
}

const gradients: Record<StatColor, { bar: string; icon: string; bg: string }> = {
  blue: { bar: 'from-blue-500 to-blue-600', icon: 'text-blue-600', bg: 'bg-blue-50' },
  emerald: { bar: 'from-emerald-500 to-emerald-600', icon: 'text-emerald-600', bg: 'bg-emerald-50' },
  violet: { bar: 'from-violet-500 to-violet-600', icon: 'text-violet-600', bg: 'bg-violet-50' },
  amber: { bar: 'from-amber-500 to-amber-600', icon: 'text-amber-600', bg: 'bg-amber-50' },
  rose: { bar: 'from-rose-500 to-rose-600', icon: 'text-rose-600', bg: 'bg-rose-50' },
  cyan: { bar: 'from-cyan-500 to-cyan-600', icon: 'text-cyan-600', bg: 'bg-cyan-50' },
  orange: { bar: 'from-orange-500 to-orange-600', icon: 'text-orange-600', bg: 'bg-orange-50' },
  indigo: { bar: 'from-indigo-500 to-indigo-600', icon: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export function StatCard({ title, value, icon: Icon, color, trend, subtitle }: StatCardProps) {
  const g = gradients[color];
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn('absolute left-0 top-0 h-full w-1 bg-gradient-to-b', g.bar)} />
      <div className="p-5 pl-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                'mt-1 flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up' ? 'text-emerald-600' : 'text-red-500',
              )}>
                <span>{trend.direction === 'up' ? '\u2191' : '\u2193'}</span>
                <span>{trend.value}%</span>
                <span className="text-gray-400 font-normal">vs last month</span>
              </p>
            )}
          </div>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', g.bg)}>
            <Icon className={cn('h-5 w-5', g.icon)} />
          </div>
        </div>
      </div>
    </div>
  );
}
