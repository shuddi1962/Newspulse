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
  totalComments: number;
  confirmedSubscribers: number;
  totalUsers: number;
  todayComments: number;
  todaySubscribers: number;
  reporters: number;
  monthlyData: { month: string; posts: number; views: number; users: number }[];
}

export function DashboardClient({
  articles,
  todayPostsCount,
  categoryBreakdown,
  totalComments,
  confirmedSubscribers,
  totalUsers,
  todayComments,
  todaySubscribers,
  reporters,
  monthlyData,
}: DashboardClientProps) {
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

      {articles.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Posts" value={articles.length} icon={FileText} color="blue" subtitle="All time" />
            <StatCard title="Total Comments" value={totalComments} icon={MessageCircle} color="emerald" trend={totalComments > 0 ? { value: Math.round(totalComments / 10), direction: 'up' } : undefined} />
            <StatCard title="Subscribers" value={confirmedSubscribers} icon={Users} color="violet" trend={confirmedSubscribers > 0 ? { value: Math.round(confirmedSubscribers / 10), direction: 'up' } : undefined} />
            <StatCard title="Total Users" value={totalUsers} icon={UserCheck} color="rose" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Today's Posts" value={todayPostsCount} icon={Calendar} color="amber" />
            <StatCard title="Today's Comments" value={todayComments} icon={MessageSquare} color="cyan" />
            <StatCard title="New Subscribers" value={todaySubscribers} icon={UserPlus} color="orange" trend={todaySubscribers > 0 ? { value: Math.round(todaySubscribers / 2), direction: 'up' } : undefined} />
            <StatCard title="Reporters" value={reporters} icon={UserCog} color="indigo" />
          </div>

          {monthlyData.length > 0 && (
            <PerformanceChart data={monthlyData} />
          )}

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
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Platform Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
                      <p className="text-xs text-gray-500">Total Articles</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
                      <p className="text-xs text-gray-500">Comments</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{confirmedSubscribers}</p>
                      <p className="text-xs text-gray-500">Subscribers</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                      <p className="text-xs text-gray-500">Users</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">No articles yet</h2>
          <p className="mt-2 text-sm text-gray-500">Publish your first article to see dashboard metrics.</p>
        </div>
      )}

      {articles.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          <PostsTable title="Latest Posts" data={articles.slice(0, 10)} />
          <PostsTable title="Popular Posts" data={[...articles].sort((a, b) => (b.word_count ?? 0) - (a.word_count ?? 0)).slice(0, 10)} />
        </div>
      )}
    </div>
  );
}
