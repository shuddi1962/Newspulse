'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import type { AdminUserRow } from '@/lib/db/admin-users';
import { addUserAction, deleteUserAction } from './actions';

const TABS = [
  { key: 'all', label: 'All Users' },
  { key: 'admin', label: 'Admin' },
  { key: 'editor', label: 'Editor' },
  { key: 'author', label: 'Reporter' },
  { key: 'reader', label: 'Subscriber' },
] as const;

const ROLE_BADGES: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  author: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  reader: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function initialsOf(name: string | null): string {
  if (!name) return 'U';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface Props {
  rows: AdminUserRow[];
  actorId: string;
}

export function UsersManager({ rows, actorId }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({ displayName: '', email: '', role: 'reader', active: true });

  const filtered = useMemo(() => {
    if (activeTab === 'all') return rows;
    return rows.filter((r) => r.role === activeTab);
  }, [rows, activeTab]);

  const columns: ColumnDef<AdminUserRow>[] = [
    {
      key: 'display_name',
      header: 'Name',
      render: (row) => {
        const name = row.display_name ?? row.email.split('@')[0] ?? 'User';
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-crimson) text-xs font-bold text-white">
              {initialsOf(row.display_name)}
            </div>
            <div>
              <p className="font-medium text-(--fg-default)">{name}</p>
              {row.is_project_admin && (
                <p className="text-[0.65rem] font-mono uppercase tracking-wider text-(--fg-subtle)">Project admin</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => (
        <span className="text-(--fg-muted) text-sm">{row.email}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) => {
        const role = row.role ?? 'reader';
        return (
          <span className={cn('inline-block rounded-md px-2.5 py-0.5 text-xs font-medium', ROLE_BADGES[role] ?? ROLE_BADGES.reader)}>
            {role}
          </span>
        );
      },
    },
    {
      key: 'email_verified',
      header: 'Status',
      render: (row) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs font-medium',
            row.email_verified ? 'text-(--color-forest-green)' : 'text-(--fg-subtle)',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', row.email_verified ? 'bg-(--color-forest-green)' : 'bg-(--fg-subtle)')} />
          {row.email_verified ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      key: 'updated_at',
      header: 'Last Active',
      render: (row) => (
        <span className="text-sm text-(--fg-muted)">{formatDate(row.updated_at)}</span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      className: 'w-[100px]',
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded-md p-1.5 text-(--fg-muted) hover:bg-(--bg-muted) hover:text-(--fg-default) transition-colors"
            aria-label={`Edit ${row.display_name ?? row.email}`}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {row.id !== actorId && (
            <button
              type="button"
              onClick={() => {
                if (!confirm('Delete this user? This cannot be undone.')) return;
                startTransition(async () => {
                  const result = await deleteUserAction(row.id);
                  if (result.status === 'error') {
                    toast.error(result.message);
                    return;
                  }
                  toast.success(result.message);
                  router.refresh();
                });
              }}
              disabled={isPending}
              className="rounded-md p-1.5 text-(--fg-muted) hover:bg-red-50 hover:text-(--signal-red) transition-colors disabled:opacity-50"
              aria-label={`Delete ${row.display_name ?? row.email}`}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!form.displayName.trim() || !form.email.trim()) {
      toast.error('Name and email are required.');
      return;
    }
    startTransition(async () => {
      const result = await addUserAction(form);
      if (result.status === 'error') {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setShowAdd(false);
      setForm({ displayName: '', email: '', role: 'reader', active: true });
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Directory</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
            User Management
          </h1>
          <p className="mt-1 max-w-xl text-sm text-(--fg-muted)">
            Manage all registered users, their roles, and access levels.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="mb-6 flex gap-1 border-b border-(--border-subtle)">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-(--fg-default) after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-(--color-crimson)'
                : 'text-(--fg-muted) hover:text-(--fg-default)',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable<AdminUserRow>
        columns={columns}
        data={filtered}
        idKey="id"
        searchable
        pagination
        rowsPerPageOptions={[10, 25, 50]}
      />

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-(--bg-base) p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg-default)">Add User</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-md p-1.5 text-(--fg-muted) hover:bg-(--bg-muted)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Full Name</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) focus:border-(--color-ink-medium) focus:outline-none"
                >
                  <option value="reader">Subscriber</option>
                  <option value="author">Reporter</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-(--border-subtle) px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-(--fg-default)">Active</p>
                  <p className="text-xs text-(--fg-muted)">User can log in immediately</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition-colors',
                    form.active ? 'bg-(--color-forest-green)' : 'bg-(--border-subtle)',
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                      form.active ? 'translate-x-[22px]' : 'translate-x-0.5',
                    )}
                  />
                </button>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark) disabled:opacity-60"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
