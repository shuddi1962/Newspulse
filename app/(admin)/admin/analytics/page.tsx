import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';
import { AnalyticsClient } from './analytics-client';

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

async function getMonthlyTrend() {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('articles')
    .select('status, created_at, view_count')
    .eq('status', 'published');

  if (error) return [];

  const articles = (data ?? []) as Array<{ status: string; created_at: string; view_count: number }>;
  const monthMap = new Map<string, { views: number; articles: number }>();

  for (const a of articles) {
    const d = new Date(a.created_at);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = monthMap.get(key) ?? { views: 0, articles: 0 };
    existing.views += a.view_count ?? 0;
    existing.articles++;
    monthMap.set(key, existing);
  }

  return Array.from(monthMap.entries())
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => {
      const da = new Date(a.month);
      const db = new Date(b.month);
      return da.getTime() - db.getTime();
    });
}

export default async function AnalyticsPage() {
  await requireAdmin();

  const [overview, topArticles, categoryBreakdown, monthlyTrend] = await Promise.all([
    getAnalyticsOverview(),
    getTopArticles(10),
    getCategoryBreakdown(),
    getMonthlyTrend(),
  ]);

  const palette = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#ec4899', '#f97316'];
  const pieData = categoryBreakdown.map((c, i) => ({
    name: c.name,
    value: c.views,
    color: palette[i % palette.length] ?? '#6b7280',
  }));

  return (
    <AnalyticsClient
      overview={overview}
      topArticles={topArticles}
      categoryBreakdown={categoryBreakdown}
      pieData={pieData}
      monthlyTrend={monthlyTrend}
    />
  );
}
