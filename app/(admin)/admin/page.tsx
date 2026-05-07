import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import Link from 'next/link';
import {
  FileText,
  FolderTree,
  ImageIcon,
  Tags,
  BarChart3,
  Plus,
} from 'lucide-react';
import { listArticlesForAdmin as getArticles } from '@/lib/db/articles';
import { listCategories as getCategories } from '@/lib/db/categories';
import { listMedia as getMediaAssets } from '@/lib/db/media';

export const metadata: Metadata = {
  title: 'Dashboard — NewsPulse PRO',
};

export default async function AdminOverviewPage() {
  const user = await requireAdmin();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

  const { accessToken } = await getAuthCookies();

  const [articlesResult, categoriesResult, mediaResult] = await Promise.all([
    accessToken ? getArticles(accessToken) : Promise.resolve({ status: 'error' as const, message: 'No session' }),
    accessToken ? getCategories(accessToken, { kind: 'news' }) : Promise.resolve({ status: 'error' as const, message: 'No session' }),
    accessToken ? getMediaAssets(accessToken) : Promise.resolve({ status: 'error' as const, message: 'No session' }),
  ]);

  const articles = articlesResult.status === 'ok' ? articlesResult.data : [];
  const categories = categoriesResult.status === 'ok' ? categoriesResult.data : [];
  const media = mediaResult.status === 'ok' ? mediaResult.data.rows : [];

  const stats = [
    { label: 'Articles', count: articles.length, href: '/admin/content/articles', icon: FileText },
    { label: 'Categories', count: categories.length, href: '/admin/content/categories', icon: FolderTree },
    { label: 'Media Files', count: media.length, href: '/admin/content/media', icon: ImageIcon },
    { label: 'Tags', count: 0, href: '/admin/content/tags', icon: Tags },
  ];

  const quickActions = [
    { label: 'New Article', href: '/admin/content/articles/new', icon: FileText },
    { label: 'New Page', href: '/admin/pages/new', icon: Plus },
    { label: 'Upload Media', href: '/admin/content/media', icon: ImageIcon },
    { label: 'View Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.href}
            href={stat.href}
            className="rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 text-gray-500" />
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.count}</p>
          </Link>
        ))}
      </div>

      {/* Recent Articles */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-gray-900">
            Recent Articles
          </h2>
          <Link
            href="/admin/content/articles"
            className="text-sm text-ink-black hover:underline"
          >
            View all
          </Link>
        </div>
        {articles.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No articles yet.{' '}
            <Link href="/admin/content/articles/new" className="text-ink-black underline">
              Create your first article
            </Link>
          </p>
        ) : (
          <div className="space-y-3">
            {articles.slice(0, 5).map((article) => (
              <div
                key={article.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{article.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(article.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  href={`/admin/content/articles/${article.id}/edit`}
                  className="text-sm text-inherit hover:underline"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 font-display text-lg font-semibold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              <action.icon className="h-4 w-4 text-gray-500" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
