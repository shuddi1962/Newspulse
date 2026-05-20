import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/admin');
  }

  let pendingCount = 0;
  try {
    const insforge = createServerInsForge();
    const { data } = await insforge.database
      .from('comments')
      .select('id, status')
      .eq('status', 'pending');
    pendingCount = ((data ?? []) as Array<{ id: string; status: string }>).length;
  } catch {
    // pending count unavailable
  }

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)]">
      <Sidebar user={user} />
      <div className="flex flex-col md:ml-[260px] transition-all duration-200">
        <Topbar user={user} pendingCount={pendingCount} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
