'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type CategoryFormState,
} from '../actions';
import type { CategoryRow } from '@/lib/db/categories';

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

interface CategoryManagerProps {
  categories: CategoryRow[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const parentOptions = useMemo(
    () => categories.filter((c) => c.id !== editingId && !c.parent_id),
    [categories, editingId],
  );

  const handleNameChange = useCallback(
    (val: string) => {
      setName(val);
      if (!slugTouched) setSlug(slugify(val));
    },
    [slugTouched],
  );

  const startEditing = useCallback((cat: CategoryRow) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parent_id ?? '');
    setSlugTouched(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setName('');
    setSlug('');
    setParentId('');
    setSlugTouched(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        toast.error('Category name is required.');
        return;
      }
      setSubmitting(true);

      const data: CategoryFormState = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        parent_id: parentId,
      };

      const result = editingId
        ? await updateCategoryAction(editingId, data)
        : await createCategoryAction(data);

      setSubmitting(false);

      if (result.status === 'error') {
        toast.error(result.message);
      } else {
        toast.success(editingId ? 'Category updated.' : 'Category created.');
        cancelEditing();
        router.refresh();
      }
    },
    [name, slug, parentId, editingId, cancelEditing, router],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const cat = categories.find((c) => c.id === id);
      const hasChildren = categories.some((c) => c.parent_id === id);
      if (hasChildren) {
        toast.error('Cannot delete a category with subcategories. Reassign or delete them first.');
        return;
      }
      const confirmed = window.confirm(`Delete "${cat?.name ?? id}"? This cannot be undone.`);
      if (!confirmed) return;

      const result = await deleteCategoryAction(id);
      if (result.status === 'error') {
        toast.error(result.message);
      } else {
        toast.success('Category deleted.');
        if (editingId === id) cancelEditing();
        router.refresh();
      }
    },
    [categories, editingId, cancelEditing, router],
  );

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const dataWithIndex = useMemo(
    () =>
      categories.map((c, i) => ({
        ...c,
        _row_num: i + 1,
        _parent_name: c.parent_id ? categoryMap.get(c.parent_id) ?? '—' : '—',
      })),
    [categories, categoryMap],
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
      key: '_parent_name',
      header: 'Parent',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {row._parent_name as string}
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
            onClick={() =>
              startEditing(categories.find((c) => c.id === (row.id as string))!)
            }
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
            aria-label="Edit category"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id as string)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
            aria-label="Delete category"
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
          Categories
        </h1>
        <p className="mt-1 text-sm text-[var(--color-admin-text-muted)]">
          Manage news categories for your publication.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-admin-text)]">
              {editingId ? 'Edit category' : 'Add category'}
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
                Category name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. World News"
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
                placeholder="world-news"
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none font-mono"
              />
              <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">
                Auto-generated from name. Edit if needed.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--color-admin-text)]">
                Parent category
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] focus:border-[var(--color-crimson)] focus:outline-none"
              >
                <option value="">None (top-level)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-crimson)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
            >
              {submitting ? (
                <span>Saving...</span>
              ) : editingId ? (
                'Update category'
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add category
                </>
              )}
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)]">
          <div className="p-5 pb-0">
            <p className="text-sm text-[var(--color-admin-text-muted)]">
              {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} total
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
