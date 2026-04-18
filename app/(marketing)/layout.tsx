import type { ReactNode } from 'react';
import { SiteHeader } from './_components/site-header';
import { SiteFooter } from './_components/site-footer';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
