'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import {
  createTagAction,
  updateTagAction,
  deleteTagAction,
  type TagFormState,
} from '../actions';
import type { TagRow } from '@/lib/db/tags';

function slugify(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

interface TagManagerProps {
  tags: TagRow[];
}

export function TagManager({ tags }: TagManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = useCallback(
    (val: string) => {
      setName(val);
      if (!slugTouched) setSlug(slugify(val));
    },
    [slugTouched],
  );

  const startEditing = useCallback((tag: TagRow) => {
    setEditingId(tag.id);
    setName(tag.name);
    setSlug(tag.slug);
    setSlugTouched(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setName('');
    setSlug('');
    setSlugTouched(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error('Tag name is required.');
        return;
      }
      setSubmitting(true);

      const data: TagFormState = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
      };

      const result = editingId
        ? await updateTagAction(editingId, data)
        : await createTagAction(data);

      setSubmitting(false);

      if (result.status === 'error') {
        toast.error(result.message);
      } else {
        toast.success(editingId ? 'Tag updated.' : 'Tag created.');
        cancelEditing();
        router.refresh();
      }
    },
    [name, slug, editingId, cancelEditing, router],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const tag = tags.find((t) => t.id === id);
      const confirmed = window.confirm(`Delete tag "${tag?.name ?? id}"? This cannot be undone.`);
      if (!confirmed) return;

      const result = await deleteTagAction(id);
      if (result.status === 'error') {
        toast.error(result.message);
      } else {
        toast.success('Tag deleted.');
        if (editingId === id) cancelEditing();
        router.refresh();
      }
    },
    [tags, editingId, cancelEditing, router],
  );

  const dataWithIndex = useMemo(
    () => tags.map((t, i) => ({ ...t, _row_num: i + 1 })),
    [tags],
  );

  const columns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: '_row_num',
      header: '#',
      className: 'w-12 text-center text-[var(--color-admin-text-muted)]',
      sortable: false,
    },
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <span className="font-medium text-[var(--color-admin-text)]">{row.name as string}</span>
      ),
    },
    {
      key: 'slug',
      header: 'Slug',
      render: (row) => (
        <code className="text-sm text-[var(--color-admin-text-muted)]">{row.slug as string}</code>
      ),
    },
    {
      key: 'article_count',
      header: 'Posts Count',
      className: 'text-center',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {(row.article_count as number) ?? 0}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => startEditing(tags.find((t) => t.id === (row.id as string))!)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
            aria-label="Edit tag"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id as string)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
            aria-label="Delete tag"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-admin-text)]">
          Tags
        </h1>
        <p className="mt-1 text-sm text-[var(--color-admin-text-muted)]">
          Manage tags used across your content.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-admin-text)]">
              {editingId ? 'Edit tag' : 'Add tag'}
            </h2>
            {editingId && (
              <button
                onClick={cancelEditing}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-admin-text)]">
                Tag name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Technology"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-admin-text)]">
                Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="technology"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none font-mono"
              />
              <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">
                Auto-generated from name. Edit if needed.
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-crimson)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : editingId ? (
                'Update tag'
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add tag
                </>
              )}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)]">
          <div className="p-5 pb-0">
            <p className="text-sm text-[var(--color-admin-text-muted)]">
              {tags.length} tag{tags.length === 1 ? '' : 's'} total
            </p>
          </div>
          <div className="p-5">
            <DataTable
              columns={columns}
              data={dataWithIndex as unknown as Record<string, unknown>[]}
              searchable
              pagination
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
