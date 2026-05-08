import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
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

  return <DashboardClient articles={articles} todayPostsCount={todayPosts.length} />;
}
