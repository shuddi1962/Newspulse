'use client';

import { Eye, Pencil } from 'lucide-react';
import { DataTable, type ColumnDef } from './DataTable';
import type { AdminArticleRow } from '@/lib/db/articles';

interface PostsTableProps {
  title: string;
  data: AdminArticleRow[];
  loading?: boolean;
}

const columns: ColumnDef<AdminArticleRow>[] = [
  { key: 'title', header: 'Title', render: (row) => (
    <span className="font-medium text-[var(--color-admin-text)] line-clamp-1">{row.title}</span>
  )},
  { key: 'status', header: 'Status', render: (row) => {
    const colors: Record<string, string> = {
      published: 'bg-emerald-100 text-emerald-700',
      draft: 'bg-gray-100 text-gray-600',
      scheduled: 'bg-blue-100 text-blue-700',
      review: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
      approved: 'bg-green-100 text-green-700',
      archived: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[row.status] ?? 'bg-gray-100 text-gray-600'}`}>
        {row.status}
      </span>
    );
  }},
  { key: 'word_count', header: 'Words', className: 'text-center', render: (row) => (
    <span className="text-sm text-[var(--color-admin-text-muted)]">{row.word_count ?? '-'}</span>
  )},
  { key: 'updated_at', header: 'Updated', render: (row) => (
    <span className="text-sm text-[var(--color-admin-text-muted)]">
      {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '-'}
    </span>
  )},
  { key: 'actions', header: '', className: 'w-20', render: () => (
    <div className="flex items-center gap-2">
      <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600" aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </button>
      <button className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600" aria-label="Preview">
        <Eye className="h-4 w-4" />
      </button>
    </div>
  )},
];

export function PostsTable({ title, data, loading }: PostsTableProps) {
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
        <h3 className="mb-4 text-lg font-semibold text-[var(--color-admin-text)]">{title}</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
      <h3 className="mb-4 text-lg font-semibold text-[var(--color-admin-text)]">{title}</h3>
      <DataTable
        columns={columns}
        data={data}
        searchable={false}
        pagination={false}
      />
    </div>
  );
}
