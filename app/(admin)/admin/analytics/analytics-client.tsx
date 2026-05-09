'use client';

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Legend,
} from 'recharts';

interface Overview {
  publishedArticles: number;
  totalViews: number;
  recentViews: number;
  confirmedSubscribers: number;
  totalUsers: number;
  authors: number;
  totalComments: number;
  approvedComments: number;
  totalSubscribers: number;
  recentArticles: number;
}

interface AnalyticsClientProps {
  overview: Overview;
  topArticles: Array<{
    id: string; title: string; slug: string;
    view_count: number; share_count: number;
    status: string; created_at: string;
  }>;
  categoryBreakdown: Array<{ name: string; slug: string; views: number; articles: number }>;
  pieData: Array<{ name: string; value: number; color: string }>;
  monthlyTrend: Array<{ month: string; views: number; articles: number }>;
}

export function AnalyticsClient({ overview, topArticles, categoryBreakdown, pieData, monthlyTrend }: AnalyticsClientProps) {
  const maxCategoryViews = Math.max(...categoryBreakdown.map((c) => c.views), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">Platform performance overview and content metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <OverviewCard label="Published Articles" value={overview.publishedArticles.toLocaleString()} />
        <OverviewCard label="Total Views" value={overview.totalViews.toLocaleString()} />
        <OverviewCard label="30-Day Views" value={overview.recentViews.toLocaleString()} />
        <OverviewCard label="Confirmed Subscribers" value={overview.confirmedSubscribers.toLocaleString()} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Monthly Views Trend</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="trendViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="trendArticles" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 13,
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} fill="url(#trendViews)" name="Page Views" dot={{ r: 3 }} />
                <Area type="monotone" dataKey="articles" stroke="#059669" strokeWidth={2} fill="url(#trendArticles)" name="Articles" dot={{ r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Views by Category</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="views" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={20} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {categoryBreakdown.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No category data yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Content Distribution</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-3 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="flex-1 text-gray-700">{d.name}</span>
                <span className="font-medium text-gray-900">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Platform Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <SummaryCard label="Total Users" value={overview.totalUsers.toLocaleString()} />
            <SummaryCard label="Authors & Editors" value={overview.authors.toLocaleString()} />
            <SummaryCard label="Total Comments" value={overview.totalComments.toLocaleString()} />
            <SummaryCard label="Approved Comments" value={overview.approvedComments.toLocaleString()} />
            <SummaryCard label="Newsletter Subscribers" value={overview.totalSubscribers.toLocaleString()} />
            <SummaryCard label="Articles (30d)" value={overview.recentArticles.toLocaleString()} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Top Articles by Views</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pr-6 text-left font-medium text-gray-400">#</th>
                <th className="pb-3 pr-6 text-left font-medium text-gray-400">Title</th>
                <th className="pb-3 px-4 text-right font-medium text-gray-400">Views</th>
                <th className="pb-3 px-4 text-right font-medium text-gray-400">Shares</th>
                <th className="pb-3 pl-4 text-left font-medium text-gray-400">Published</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.map((article, idx) => (
                <tr key={article.id} className="border-t border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="py-3 pr-6 font-mono text-xs text-gray-400">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="py-3 pr-6 font-medium text-gray-900">
                    <a href={`/article/${article.slug}`} className="hover:text-blue-600 transition-colors">
                      {article.title}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{article.view_count?.toLocaleString() ?? '0'}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{article.share_count ?? '0'}</td>
                  <td className="py-3 pl-4 text-gray-500">
                    {new Date(article.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {topArticles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                    No published articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
