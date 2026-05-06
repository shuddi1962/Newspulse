import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';
import Link from 'next/link';
import { FileText, Bookmark, BarChart3, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard — NewsPulse PRO',
};

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
          Dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-gray-900">
          Welcome back, {displayName}.
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Posts</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">2,847</p>
          <p className="mt-1 text-xs font-medium text-green-600">+12%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Active Listings</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">1,234</p>
          <p className="mt-1 text-xs font-medium text-green-600">+23%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Job Posts</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">456</p>
          <p className="mt-1 text-xs font-medium text-green-600">+18%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Bookings Today</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">89</p>
          <p className="mt-1 text-xs font-medium text-green-600">+31%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Subscribers</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">34.5K</p>
          <p className="mt-1 text-xs font-medium text-green-600">+8%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">$24,847</p>
          <p className="mt-1 text-xs font-medium text-green-600">+22%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="space-y-2">
          <Link
            href="/admin/content/articles/new"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 text-gray-500" />
            New Article
          </Link>
          <Link
            href="/admin/content/categories/new"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <Bookmark className="h-4 w-4 text-gray-500" />
            New Directory Listing
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <BarChart3 className="h-4 w-4 text-gray-500" />
            View Analytics
          </Link>
          <Link
            href="/admin/ads"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <TrendingUp className="h-4 w-4 text-gray-500" />
            Manage Ads
          </Link>
        </div>
      </div>
    </div>
  );
}
