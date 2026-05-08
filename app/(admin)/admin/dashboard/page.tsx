import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import {
  FileText, MessageCircle, Users, UserCheck,
  Calendar, MessageSquare, UserPlus, UserCog,
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';
import { PerformanceChart } from '@/components/admin/PerformanceChart';
import { PostsTable } from '@/components/admin/PostsTable';
import { listArticlesForAdmin } from '@/lib/db/articles';

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-admin-text-muted)]">
          Welcome back. Here is what is happening today.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Posts" value={articles.length} icon={FileText} color="green" />
        <StatCard title="Total Comments" value={128} icon={MessageCircle} color="blue" trend={{ value: 12, direction: 'up' }} />
        <StatCard title="Total Subscribers" value={1560} icon={Users} color="purple" trend={{ value: 8, direction: 'up' }} />
        <StatCard title="Total Users" value={45} icon={UserCheck} color="pink" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Posts" value={todayPosts.length} icon={Calendar} color="yellow" />
        <StatCard title="Today's Comments" value={18} icon={MessageSquare} color="cyan" />
        <StatCard title="Today Subscribers" value={12} icon={UserPlus} color="orange" trend={{ value: 5, direction: 'up' }} />
        <StatCard title="Total Reporters" value={8} icon={UserCog} color="lime" />
      </div>

      <PerformanceChart />

      <div className="grid gap-6 lg:grid-cols-2">
        <PostsTable title="Latest Posts" data={articles.slice(0, 10)} />
        <PostsTable title="Popular Posts" data={[...articles].sort((a, b) => (b.word_count ?? 0) - (a.word_count ?? 0)).slice(0, 10)} />
      </div>
    </div>
  );
}
