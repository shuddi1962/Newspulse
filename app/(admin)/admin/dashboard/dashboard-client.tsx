'use client';

import {
  FileText, MessageCircle, Users, UserCheck,
  Calendar, MessageSquare, UserPlus, UserCog,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';
import { StatCard } from '@/components/admin/StatCard';
import { PerformanceChart } from '@/components/admin/PerformanceChart';
import { PostsTable } from '@/components/admin/PostsTable';
import type { AdminArticleRow } from '@/lib/db/articles';

interface DashboardClientProps {
  articles: AdminArticleRow[];
  todayPostsCount: number;
  categoryBreakdown: { name: string; count: number; color: string }[];
}

export function DashboardClient({ articles, todayPostsCount, categoryBreakdown }: DashboardClientProps) {
  const totalViews = articles.reduce((s, a) => s + (a.word_count ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back. Here is your overview.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          All systems operational
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Posts" value={articles.length} icon={FileText} color="blue" subtitle="All time" />
        <StatCard title="Total Comments" value={128} icon={MessageCircle} color="emerald" trend={{ value: 12, direction: 'up' }} />
        <StatCard title="Subscribers" value={1560} icon={Users} color="violet" trend={{ value: 8, direction: 'up' }} />
        <StatCard title="Total Users" value={45} icon={UserCheck} color="rose" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Posts" value={todayPostsCount} icon={Calendar} color="amber" />
        <StatCard title="Today's Comments" value={18} icon={MessageSquare} color="cyan" />
        <StatCard title="New Subscribers" value={12} icon={UserPlus} color="orange" trend={{ value: 5, direction: 'up' }} />
        <StatCard title="Reporters" value={8} icon={UserCog} color="indigo" />
      </div>

      <PerformanceChart />

      {categoryBreakdown.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Content by Category</h3>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {categoryBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="flex items-center gap-3 text-sm">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="flex-1 text-gray-700">{cat.name}</span>
                  <span className="font-medium text-gray-900">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Traffic Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Direct', value: '45%', color: 'bg-blue-500' },
                  { label: 'Social', value: '28%', color: 'bg-violet-500' },
                  { label: 'Search', value: '27%', color: 'bg-emerald-500' },
                ].map((source) => (
                  <div key={source.label} className="rounded-lg bg-gray-50 p-4 text-center">
                    <div className={cn('mx-auto mb-2 h-3 w-3 rounded-full', source.color)} />
                    <p className="text-lg font-bold text-gray-900">{source.value}</p>
                    <p className="text-xs text-gray-500">{source.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Top Countries</h4>
                {[
                  { country: 'United States', flag: 'US', visits: 12840, pct: 38 },
                  { country: 'United Kingdom', flag: 'UK', visits: 5620, pct: 17 },
                  { country: 'Germany', flag: 'DE', visits: 3890, pct: 12 },
                  { country: 'Canada', flag: 'CA', visits: 2950, pct: 9 },
                  { country: 'Australia', flag: 'AU', visits: 2100, pct: 6 },
                ].map((loc) => (
                  <div key={loc.country} className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-500 w-8">{loc.flag}</span>
                    <span className="flex-1 text-gray-700">{loc.country}</span>
                    <span className="text-gray-500">{loc.visits.toLocaleString()}</span>
                    <div className="h-2 w-24 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${loc.pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-500">{loc.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <PostsTable title="Latest Posts" data={articles.slice(0, 10)} />
        <PostsTable title="Popular Posts" data={[...articles].sort((a, b) => (b.word_count ?? 0) - (a.word_count ?? 0)).slice(0, 10)} />
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
