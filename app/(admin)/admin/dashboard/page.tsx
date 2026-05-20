import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createServerInsForge } from '@/lib/insforge/server';
import { listArticlesForAdmin } from '@/lib/db/articles';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard — NewsPulse PRO',
};

export default async function AdminDashboardPage() {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();

  const insforge = createServerInsForge(accessToken ?? undefined);

  const [articlesResult, commentsRes, subscribersRes, usersRes] = await Promise.all([
    accessToken
      ? listArticlesForAdmin(accessToken)
      : Promise.resolve({ status: 'error' as const, message: 'No session' }),
    insforge.database.from('comments').select('id, status, created_at'),
    insforge.database.from('newsletter_subscribers').select('id, status, created_at'),
    insforge.database.from('profiles').select('id, role, created_at'),
  ]);

  const articles = articlesResult.status === 'ok' ? articlesResult.data : [];

  const todayPosts = articles.filter((a) => {
    if (!a.updated_at) return false;
    const d = new Date(a.updated_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  const comments = (commentsRes.data ?? []) as Array<{ id: string; status: string; created_at: string }>;
  const subscribers = (subscribersRes.data ?? []) as Array<{ id: string; status: string; created_at: string }>;
  const users = (usersRes.data ?? []) as Array<{ id: string; role: string; created_at: string }>;

  const totalComments = comments.length;
  const confirmedSubscribers = subscribers.filter((s) => s.status === 'confirmed').length;
  const totalUsers = users.length;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const todayComments = comments.filter((c) => c.created_at >= todayStart).length;
  const todaySubscribers = subscribers.filter((s) => s.created_at >= todayStart).length;
  const reporters = users.filter((u) => ['author', 'editor', 'admin'].includes(u.role)).length;

  let categoryBreakdown: { name: string; count: number; color: string }[] = [];
  try {
    const { data: cats } = await insforge.database
      .from('categories')
      .select('id, name')
      .eq('kind', 'news')
      .limit(20);
    const { data: artData } = await insforge.database
      .from('articles')
      .select('category_id, status')
      .eq('status', 'published');

    if (cats && artData) {
      const catCount = new Map<string, number>();
      for (const a of artData as Array<{ category_id: string | null; status: string }>) {
        if (a.category_id) {
          catCount.set(a.category_id, (catCount.get(a.category_id) ?? 0) + 1);
        }
      }
      const palette = ['#2563eb', '#059669', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#ec4899', '#f97316'];
      categoryBreakdown = (cats as Array<{ id: string; name: string }>)
        .filter((c) => catCount.has(c.id))
        .map((c, i) => ({
          name: c.name,
          count: catCount.get(c.id) ?? 0,
          color: palette[i % palette.length] ?? '#6b7280',
        }))
        .sort((a, b) => b.count - a.count);
    }
  } catch {
    // category breakdown unavailable
  }

  let monthlyData: { month: string; posts: number; views: number; users: number }[] = [];
  try {
    const publishedArticles = articlesResult.status === 'ok'
      ? articlesResult.data.filter((a) => a.status === 'published')
      : [];

    const monthMap = new Map<string, { posts: number; views: number; users: number }>();
    for (const a of publishedArticles) {
      const d = a.updated_at ? new Date(a.updated_at) : null;
      if (!d) continue;
      const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const existing = monthMap.get(key) ?? { posts: 0, views: 0, users: 0 };
      existing.posts++;
      monthMap.set(key, existing);
    }
    monthlyData = Array.from(monthMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => {
        const da = new Date(a.month);
        const db = new Date(b.month);
        return da.getTime() - db.getTime();
      });
  } catch {
    // monthly data unavailable
  }

  return (
    <DashboardClient
      articles={articles}
      todayPostsCount={todayPosts.length}
      categoryBreakdown={categoryBreakdown}
      totalComments={totalComments}
      confirmedSubscribers={confirmedSubscribers}
      totalUsers={totalUsers}
      todayComments={todayComments}
      todaySubscribers={todaySubscribers}
      reporters={reporters}
      monthlyData={monthlyData}
    />
  );
}
