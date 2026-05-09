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

  const [articlesResult] = await Promise.all([
    accessToken
      ? listArticlesForAdmin(accessToken)
      : Promise.resolve({ status: 'error' as const, message: 'No session' }),
  ]);

  const articles = articlesResult.status === 'ok' ? articlesResult.data : [];
  const todayPosts = articles.filter((a) => {
    if (!a.updated_at) return false;
    const d = new Date(a.updated_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  let categoryBreakdown: { name: string; count: number; color: string }[] = [];
  try {
    const insforge = createServerInsForge(accessToken);
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
          color: palette[i % palette.length],
        }))
        .sort((a, b) => b.count - a.count);
    }
  } catch {
    // category breakdown unavailable
  }

  return (
    <DashboardClient
      articles={articles}
      todayPostsCount={todayPosts.length}
      categoryBreakdown={categoryBreakdown}
    />
  );
}
