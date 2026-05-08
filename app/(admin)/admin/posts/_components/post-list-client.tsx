'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable, type ColumnDef, type BulkAction } from '@/components/admin/DataTable';
import { deletePostsAction } from '../actions';

export interface PostTableItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  author_id: string | null;
  category_id: string | null;
  featured_image: string | null;
  publish_at: string | null;
  view_count: number | null;
  updated_at: string;
  created_at: string;
  _row_num?: number;
}

interface PostListClientProps {
  articles: PostTableItem[];
  categories: { id: string; name: string }[];
  profiles: { id: string; display_name: string; avatar_url: string | null }[];
}

const STATUS_COLORS: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700',
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  approved: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-500',
};

export function PostListClient({ articles, categories, profiles }: PostListClientProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.id, p.display_name])),
    [profiles],
  );

  const filtered = useMemo(() => {
    let list = articles;
    if (statusFilter) list = list.filter((a) => a.status === statusFilter);
    if (categoryFilter) list = list.filter((a) => a.category_id === categoryFilter);
    return list;
  }, [articles, statusFilter, categoryFilter]);

  const dataWithIndex = useMemo(
    () => filtered.map((item, i) => ({ ...item, _row_num: i + 1 })),
    [filtered],
  );

  const handleDelete = useCallback(
    async (selected: string[]) => {
      const confirmed = window.confirm(
        `Delete ${selected.length} post(s)? This action cannot be undone.`,
      );
      if (!confirmed) return;
      const result = await deletePostsAction(selected);
      if (result.status === 'error') alert(result.message);
      router.refresh();
    },
    [router],
  );

  const bulkActions: BulkAction[] = [
    { label: 'Delete selected', variant: 'destructive', onClick: handleDelete },
  ];

  const columns: ColumnDef<PostTableItem>[] = [
    {
      key: '_row_num',
      header: '#',
      className: 'w-12 text-center text-[var(--color-admin-text-muted)]',
      sortable: false,
    },
    {
      key: 'featured_image',
      header: 'Thumbnail',
      className: 'w-16',
      sortable: false,
      render: (row) => (
        <div className="flex h-[45px] w-[60px] items-center justify-center rounded bg-gray-100 text-[0.6rem] text-gray-400">
          {row.featured_image ? (
            <img src={row.featured_image} alt="" className="h-full w-full rounded object-cover" />
          ) : (
            'No img'
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <Link
          href={`/admin/posts/edit/${row.id}`}
          className="font-medium text-[var(--color-admin-text)] hover:underline"
        >
          <span className="line-clamp-1">{row.title}</span>
        </Link>
      ),
    },
    {
      key: 'category_id',
      header: 'Category',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {categoryMap.get(row.category_id ?? '') ?? '—'}
        </span>
      ),
    },
    {
      key: 'author_id',
      header: 'Reporter',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {profileMap.get(row.author_id ?? '') ?? '—'}
        </span>
      ),
    },
    {
      key: 'publish_at',
      header: 'Published Date',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {row.publish_at
            ? new Date(row.publish_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'view_count',
      header: 'Read Count',
      className: 'text-center',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">{row.view_count ?? 0}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/posts/edit/${row.id}`}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
            aria-label="Edit post"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete([row.id])}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
            aria-label="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[var(--color-admin-text-muted)]">
            Category:
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-[var(--color-admin-text)] focus:border-[var(--color-crimson)] focus:outline-none"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[var(--color-admin-text-muted)]">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-[var(--color-admin-text)] focus:border-[var(--color-crimson)] focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="review">Review</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={dataWithIndex}
        selectable
        searchable
        pagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        bulkActions={bulkActions}
      />
    </div>
  );
}
