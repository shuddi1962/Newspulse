import type { ReactNode } from 'react';
import { ContentSubnav } from './_components/content-subnav';

export default function ContentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6">
      <ContentSubnav />
      {children}
    </div>
  );
}
