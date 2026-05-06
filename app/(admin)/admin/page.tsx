import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { FileText, Bookmark, Briefcase, Calendar, Users, DollarSign, BarChart3, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard — NewsPulse PRO',
};

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Welcome back, {displayName}.
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Total Posts', value: '2,847', change: '+12%', icon: FileText },
          { label: 'Active Listings', value: '1,234', change: '+23%', icon: Bookmark },
          { label: 'Job Posts', value: '456', change: '+18%', icon: Briefcase },
          { label: 'Bookings Today', value: '89', change: '+31%', icon: Calendar },
          { label: 'Subscribers', value: '34.5K', change: '+8%', icon: Users },
          { label: 'Revenue', value: '$24,847', change: '+22%', icon: DollarSign },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4 transition-colors hover:border-(--border-strong)">
            <div className="flex items-center justify-between">
              <p className="text-xs text-(--fg-subtle)">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-(--fg-subtle)" strokeWidth={1.5} />
            </div>
            <p className="mt-2 text-2xl font-bold text-(--fg-default)">{stat.value}</p>
            <p className="mt-1 text-xs font-medium text-(--forest-green)">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Module Activity */}
        <div className="lg:col-span-2 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
          <h2 className="mb-6 font-display text-lg font-semibold text-(--fg-default)">Module Activity (This Week)</h2>
          <div className="space-y-4">
            {[
              { module: 'News Posts', count: 47, bar: 'w-10/12' },
              { module: 'Directory Listings', count: 23, bar: 'w-5/12' },
              { module: 'Job Postings', count: 34, bar: 'w-7/12' },
              { module: 'Marketplace Items', count: 56, bar: 'w-5/6' },
              { module: 'Bookings', count: 89, bar: 'w-full' },
              { module: 'Events', count: 12, bar: 'w-1/4' },
              { module: 'Real Estate', count: 18, bar: 'w-1/3' },
              { module: 'Classifieds', count: 31, bar: 'w-3/5' },
            ].map((m) => (
              <div key={m.module} className="grid grid-cols-[200px_1fr_60px] items-center gap-4">
                <span className="text-sm text-(--fg-muted)">{m.module}</span>
                <div className="h-2 overflow-hidden rounded-full bg-(--bg-muted)">
                  <div className={`h-full rounded-full bg-(--ocean-blue) transition-all duration-500 ${m.bar}`} />
                </div>
                <span className="text-right text-sm font-semibold text-(--fg-default)">{m.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
            <h2 className="mb-4 font-display text-lg font-semibold text-(--fg-default)">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: 'New Article', href: '/admin/content/articles/new', icon: FileText },
                { label: 'New Directory Listing', href: '/admin/content/categories/new', icon: Bookmark },
                { label: 'View Analytics', href: '/admin/analytics', icon: BarChart3 },
                { label: 'Manage Ads', href: '/admin/ads', icon: TrendingUp },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-(--border-subtle) p-3 text-sm font-medium text-(--fg-default) transition-colors hover:border-(--border-strong) hover:bg-(--bg-muted)"
                >
                  <action.icon className="h-4 w-4 text-(--fg-subtle)" />
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-(--color-cat-lifestyle)" />
              <h2 className="font-display text-lg font-semibold text-(--fg-default)">AI Insights</h2>
            </div>
            <div className="space-y-2">
              {[
                'Directory: 12 businesses pending verification — review queue',
                'Jobs: React Developer has 3x more applicants than avg — boost similar',
                'Marketplace: 5 reported listings flagged for review',
              ].map((insight, i) => (
                <div key={i} className="rounded border-l-2 border-l-(--ocean-blue) bg-(--bg-muted) p-3 text-xs text-(--fg-muted)">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
        <h2 className="mb-6 font-display text-lg font-semibold text-(--fg-default)">Recent Activity Across All Modules</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                {['Type', 'Item', 'User', 'Status', 'Time'].map((h) => (
                  <th key={h} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-(--fg-subtle)">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'News', item: 'Fed Signals Rate Cuts Article', user: 'Sarah M.', status: 'Published', statusClass: 'border-(--forest-green) bg-(--forest-green)/10 text-(--forest-green)', time: '2h ago' },
                { type: 'Directory', item: 'The Grand Bistro — Claimed', user: 'Owner', status: 'Verified', statusClass: 'border-(--ocean-blue) bg-(--ocean-blue)/10 text-(--ocean-blue)', time: '3h ago' },
                { type: 'Jobs', item: 'Senior React Developer', user: 'TechFlow', status: 'Active', statusClass: 'border-(--forest-green) bg-(--forest-green)/10 text-(--forest-green)', time: '4h ago' },
                { type: 'Marketplace', item: 'MacBook Pro M4 Listed', user: 'TechDeals', status: 'Live', statusClass: 'border-(--forest-green) bg-(--forest-green)/10 text-(--forest-green)', time: '5h ago' },
                { type: 'Booking', item: 'Haircut @ Glamour Studio', user: 'Jane D.', status: 'Confirmed', statusClass: 'border-(--ocean-blue) bg-(--ocean-blue)/10 text-(--ocean-blue)', time: '6h ago' },
                { type: 'Events', item: 'Tech Summit — Ticket Sold', user: 'Alex K.', status: 'Paid', statusClass: 'border-(--forest-green) bg-(--forest-green)/10 text-(--forest-green)', time: '7h ago' },
                { type: 'Real Estate', item: '2BR Condo Inquiry', user: 'Mike R.', status: 'New Lead', statusClass: 'border-(--color-cat-lifestyle) bg-(--color-cat-lifestyle)/10 text-(--color-cat-lifestyle)', time: '8h ago' },
                { type: 'Classifieds', item: 'Lost Cat Posted', user: 'Lisa P.', status: 'Active', statusClass: 'border-(--forest-green) bg-(--forest-green)/10 text-(--forest-green)', time: '30m ago' },
              ].map((row, i) => (
                <tr key={i} className="border-b border-(--border-subtle) last:border-0">
                  <td className="py-3 text-sm font-medium text-(--fg-default)">{row.type}</td>
                  <td className="py-3 text-sm text-(--fg-muted)">{row.item}</td>
                  <td className="py-3 text-sm text-(--fg-subtle)">{row.user}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-medium ${row.statusClass}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-(--fg-subtle)">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
