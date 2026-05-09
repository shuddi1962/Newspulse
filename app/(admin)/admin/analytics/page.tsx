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

export default async function AnalyticsPage() {
  await requireAdmin();

  const [overview, topArticles, categoryBreakdown] = await Promise.all([
    getAnalyticsOverview(),
    getTopArticles(10),
    getCategoryBreakdown(),
  ]);

  const palette = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#ec4899', '#f97316'];
  const pieData = categoryBreakdown.map((c, i) => ({
    name: c.name,
    value: c.views,
    color: palette[i % palette.length],
  }));

  const monthlyTrend = [
    { month: 'Dec', views: 5200, articles: 72 },
    { month: 'Jan', views: 4800, articles: 68 },
    { month: 'Feb', views: 3600, articles: 58 },
    { month: 'Mar', views: 5600, articles: 74 },
    { month: 'Apr', views: 4300, articles: 63 },
    { month: 'May', views: 6100, articles: 80 },
  ];

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
