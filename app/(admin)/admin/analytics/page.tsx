import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';

export const metadata: Metadata = {
  title: 'Analytics — Admin',
  description: 'Platform analytics and performance metrics.',
};

async function getAnalyticsOverview() {
  const insforge = createServerInsForge();

  const [articlesRes, commentsRes, subscribersRes, usersRes] = await Promise.all([
    insforge.database.from('articles').select('id, status, view_count, created_at'),
    insforge.database.from('comments').select('id, status, created_at'),
    insforge.database.from('newsletter_subscribers').select('id, status, created_at'),
    insforge.database.from('profiles').select('id, role, created_at'),
  ]);

  const articles = (articlesRes.data ?? []) as Array<{ id: string; status: string; view_count: number; created_at: string }>;
  const comments = (commentsRes.data ?? []) as Array<{ id: string; status: string; created_at: string }>;
  const subscribers = (subscribersRes.data ?? []) as Array<{ id: string; status: string; created_at: string }>;
  const users = (usersRes.data ?? []) as Array<{ id: string; role: string; created_at: string }>;

  const publishedArticles = articles.filter((a) => a.status === 'published');
  const totalViews = publishedArticles.reduce((sum, a) => sum + (a.view_count ?? 0), 0);
  const approvedComments = comments.filter((c) => c.status === 'approved');
  const confirmedSubscribers = subscribers.filter((s) => s.status === 'confirmed');

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86_400_000);

  const recentArticles = publishedArticles.filter((a) => new Date(a.created_at) >= thirtyDaysAgo);
  const recentViews = recentArticles.reduce((sum, a) => sum + (a.view_count ?? 0), 0);

  return {
    totalArticles: articles.length,
    publishedArticles: publishedArticles.length,
    totalViews,
    recentArticles: recentArticles.length,
    recentViews,
    totalComments: comments.length,
    approvedComments: approvedComments.length,
    totalSubscribers: subscribers.length,
    confirmedSubscribers: confirmedSubscribers.length,
    totalUsers: users.length,
    authors: users.filter((u) => u.role === 'author' || u.role === 'editor' || u.role === 'admin').length,
  };
}

async function getTopArticles(limit = 10) {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('articles')
    .select('id, title, slug, view_count, share_count, status, created_at')
    .eq('status', 'published')
    .order('view_count', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    title: string;
    slug: string;
    view_count: number;
    share_count: number;
    status: string;
    created_at: string;
  }>;
}

async function getCategoryBreakdown() {
  const insforge = createServerInsForge();
  const { data: articles, error } = await insforge.database
    .from('articles')
    .select('category_id, view_count, status')
    .eq('status', 'published');

  if (error) return [];

  const { data: categories } = await insforge.database
    .from('categories')
    .select('id, name, slug')
    .eq('kind', 'news');

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, { name: c.name, slug: c.slug, views: 0, articles: 0 }]));

  for (const article of articles ?? []) {
    if (article.category_id && categoryMap.has(article.category_id)) {
      const cat = categoryMap.get(article.category_id)!;
      cat.views += article.view_count ?? 0;
      cat.articles++;
    }
  }

  return Array.from(categoryMap.values()).sort((a, b) => b.views - a.views);
}

export default async function AnalyticsPage() {
  await requireAdmin();

  const [overview, topArticles, categoryBreakdown] = await Promise.all([
    getAnalyticsOverview(),
    getTopArticles(10),
    getCategoryBreakdown(),
  ]);

  const maxCategoryViews = Math.max(...categoryBreakdown.map((c) => c.views), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Analytics</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Platform performance overview and content metrics.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Published articles" value={String(overview.publishedArticles)} />
        <StatCard label="Total views" value={overview.totalViews.toLocaleString()} />
        <StatCard label="30-day views" value={overview.recentViews.toLocaleString()} />
        <StatCard label="Confirmed subscribers" value={overview.confirmedSubscribers.toLocaleString()} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Views by category</h2>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.slug}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-(--fg-default)">{cat.name}</span>
                  <span className="text-(--fg-muted)">
                    {cat.views.toLocaleString()} views · {cat.articles} articles
                  </span>
                </div>
                <div className="h-2 rounded-full bg-(--bg-muted)">
                  <div
                    className="h-full rounded-full bg-(--color-ocean-blue)"
                    style={{ width: `${(cat.views / maxCategoryViews) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {categoryBreakdown.length === 0 && (
              <p className="text-sm text-(--fg-muted)">No category data yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Platform summary</h2>
          <div className="space-y-4">
            <SummaryRow label="Total users" value={overview.totalUsers.toLocaleString()} />
            <SummaryRow label="Authors & editors" value={overview.authors.toLocaleString()} />
            <SummaryRow label="Total comments" value={overview.totalComments.toLocaleString()} />
            <SummaryRow label="Approved comments" value={overview.approvedComments.toLocaleString()} />
            <SummaryRow label="Newsletter subscribers" value={overview.totalSubscribers.toLocaleString()} />
            <SummaryRow label="Articles published (30d)" value={overview.recentArticles.toLocaleString()} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
        <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Top articles by views</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">#</th>
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Title</th>
                <th className="pb-3 px-4 text-right font-medium text-(--fg-muted)">Views</th>
                <th className="pb-3 px-4 text-right font-medium text-(--fg-muted)">Shares</th>
                <th className="pb-3 pl-4 text-left font-medium text-(--fg-muted)">Published</th>
              </tr>
            </thead>
            <tbody>
              {topArticles.map((article, idx) => (
                <tr key={article.id} className="border-t border-(--border-subtle)">
                  <td className="py-3 pr-6 font-mono text-xs text-(--fg-subtle)">{idx + 1}</td>
                  <td className="py-3 pr-6 font-medium text-(--fg-default)">
                    <a href={`/article/${article.slug}`} className="hover:text-(--color-ocean-blue)">
                      {article.title}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-right text-(--fg-muted)">{article.view_count?.toLocaleString() ?? '0'}</td>
                  <td className="py-3 px-4 text-right text-(--fg-muted)">{article.share_count ?? '0'}</td>
                  <td className="py-3 pl-4 text-(--fg-muted)">
                    {new Date(article.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {topArticles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-(--fg-muted)">
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
      <p className="text-sm text-(--fg-muted)">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-(--fg-default)">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-(--fg-muted)">{label}</span>
      <span className="text-sm font-medium text-(--fg-default)">{value}</span>
    </div>
  );
}
