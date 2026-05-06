'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus, FileText, ImageIcon, Tags, FolderTree } from 'lucide-react';

const quickActions = [
  { label: 'New Article', href: '/admin/content/articles/new', icon: FileText },
  { label: 'New Page', href: '/admin/pages/new', icon: Plus },
  { label: 'Upload Media', href: '/admin/content/media', icon: ImageIcon },
  { label: 'New Category', href: '/admin/content/categories/new', icon: FolderTree },
  { label: 'New Tag', href: '/admin/content/tags', icon: Tags },
];

export function QuickActionsDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-ink-black px-3 py-2 text-sm font-medium text-white hover:bg-ink-black/90"
      >
        <Plus className="inline h-4 w-4" /> Quick Actions
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="py-1">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                <action.icon className="h-4 w-4 text-gray-500" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
