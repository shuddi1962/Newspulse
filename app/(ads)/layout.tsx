import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdAccountByOwnerId } from '@/lib/db/ads';
import { redirect } from 'next/navigation';
import { AdsSidebar } from './_components/ads-sidebar';

export default async function AdsLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?next=/ads');
  }

  const accountRes = await getAdAccountByOwnerId(user.id);
  const hasAccount = accountRes.status === 'ok' && accountRes.data !== null;

  return (
    <>
      <SiteHeader activeNav="home" />
      <div className="flex min-h-[calc(100vh-4rem)] flex-1">
        <AdsSidebar hasAccount={hasAccount} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <SiteFooter />
    </>
  );
}
