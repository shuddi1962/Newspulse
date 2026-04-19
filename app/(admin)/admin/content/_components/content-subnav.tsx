'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, FolderTree, ImageIcon, Tags } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/admin/content/articles', label: 'Articles', icon: FileText },
  { href: '/admin/content/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/content/tags', label: 'Tags', icon: Tags },
  { href: '/admin/content/media', label: 'Media', icon: ImageIcon },
];

export function ContentSubnav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Content sections"
      className="flex flex-wrap gap-1 border-b border-(--border-subtle) pb-1"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-(--color-ink-black) text-(--color-paper)'
                : 'text-(--fg-muted) hover:bg-(--bg-muted) hover:text-(--fg-default)',
            )}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
