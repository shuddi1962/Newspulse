import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { Sidebar } from '@/components/admin/Sidebar';
import { Topbar } from '@/components/admin/Topbar';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/admin');
  }

  return (
    <div className="min-h-screen bg-[var(--color-admin-bg)]">
      <Sidebar user={user} />
      <div className="flex flex-col md:ml-[260px] transition-all duration-200">
        <Topbar user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
