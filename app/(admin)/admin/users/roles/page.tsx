import type { Metadata } from 'next';
import { Shield, ShieldAlert, Users, Plus, Trash2 } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Role Management — Admin',
  description: 'Manage user roles, permissions, and access control.',
};

const PREDEFINED_ROLES = [
  { name: 'Admin', slug: 'admin', users: 3, created: 'Jan 15, 2026', protected: true },
  { name: 'Editor', slug: 'editor', users: 12, created: 'Jan 15, 2026', protected: false },
  { name: 'Reporter', slug: 'reporter', users: 28, created: 'Jan 15, 2026', protected: false },
  { name: 'Moderator', slug: 'moderator', users: 7, created: 'Mar 2, 2026', protected: false },
  { name: 'Subscriber', slug: 'subscriber', users: 1542, created: 'Jan 15, 2026', protected: false },
];

const PERMISSION_GROUPS = [
  {
    module: 'Posts',
    perms: [
      { key: 'posts_create', label: 'Create' },
      { key: 'posts_edit', label: 'Edit' },
      { key: 'posts_delete', label: 'Delete' },
      { key: 'posts_publish', label: 'Publish' },
      { key: 'posts_schedule', label: 'Schedule' },
    ],
  },
  {
    module: 'Media',
    perms: [
      { key: 'media_upload', label: 'Upload' },
      { key: 'media_edit', label: 'Edit' },
      { key: 'media_delete', label: 'Delete' },
    ],
  },
  {
    module: 'Comments',
    perms: [{ key: 'comments_moderate', label: 'Moderate' }],
  },
  {
    module: 'Users',
    perms: [{ key: 'users_manage', label: 'Manage' }],
  },
  {
    module: 'Settings',
    perms: [{ key: 'settings_manage', label: 'Manage' }],
  },
  {
    module: 'Categories',
    perms: [{ key: 'categories_manage', label: 'Manage' }],
  },
  {
    module: 'Ads',
    perms: [{ key: 'ads_manage', label: 'Manage' }],
  },
  {
    module: 'AI',
    perms: [{ key: 'ai_tools', label: 'Use tools' }],
  },
  {
    module: 'Pages',
    perms: [{ key: 'pages_manage', label: 'Manage' }],
  },
  {
    module: 'Reports',
    perms: [{ key: 'reports_view', label: 'View' }],
  },
];

const ACTIVE_ROLE_PERMS: Record<string, string[]> = {
  admin: PERMISSION_GROUPS.flatMap((g) => g.perms.map((p) => p.key)),
  editor: ['posts_create', 'posts_edit', 'posts_delete', 'posts_publish', 'posts_schedule', 'media_upload', 'media_edit', 'media_delete', 'comments_moderate', 'categories_manage'],
  reporter: ['posts_create', 'posts_edit', 'media_upload'],
  moderator: ['comments_moderate', 'media_upload', 'media_edit'],
  subscriber: [],
};

export default async function RoleManagementPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Access Control</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Role Management
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Define roles and configure granular permissions for each role.
        </p>
      </div>

      <div className="space-y-8">
        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-(--fg-default)">Roles</h2>
            <button className="flex items-center gap-1.5 rounded-lg bg-(--color-crimson) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-crimson-dark)">
              <Plus className="h-4 w-4" />
              Add New Role
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Role</th>
                  <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Slug</th>
                  <th className="pb-3 pr-6 text-right font-medium text-(--fg-muted)">Users</th>
                  <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Created</th>
                  <th className="pb-3 text-right font-medium text-(--fg-muted)">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PREDEFINED_ROLES.map((role) => (
                  <tr key={role.slug} className="border-b border-(--border-subtle) last:border-b-0">
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        {role.protected ? (
                          <ShieldAlert className="h-4 w-4 text-(--signal-red)" />
                        ) : (
                          <Shield className="h-4 w-4 text-(--fg-muted)" />
                        )}
                        <span className="font-medium text-(--fg-default)">{role.name}</span>
                        {role.protected && (
                          <span className="rounded-md bg-(--signal-red)/10 px-1.5 py-0.5 text-xs font-medium text-(--signal-red)">
                            Protected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-6 font-mono text-xs text-(--fg-muted)">{role.slug}</td>
                    <td className="py-3 pr-6 text-right">
                      <a
                        href={`/admin/users?role=${role.slug}`}
                        className="inline-flex items-center gap-1 text-(--color-ocean-blue) hover:underline"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {role.users}
                      </a>
                    </td>
                    <td className="py-3 pr-6 text-(--fg-muted)">{role.created}</td>
                    <td className="py-3 text-right">
                      {!role.protected && (
                        <button className="rounded-md p-1.5 text-(--fg-muted) transition-colors hover:bg-(--signal-red)/10 hover:text-(--signal-red)">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-(--fg-default)">Permissions — Admin</h2>
              <p className="mt-1 text-sm text-(--fg-muted)">Configure granular access for this role.</p>
            </div>
            <select className="rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
              <option>Admin</option>
              <option>Editor</option>
              <option>Reporter</option>
              <option>Moderator</option>
              <option>Subscriber</option>
            </select>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.module} className="rounded-md border border-(--border-subtle) p-4">
                <h3 className="mb-3 text-sm font-semibold text-(--fg-default)">{group.module}</h3>
                <div className="space-y-2.5">
                  {group.perms.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex cursor-pointer items-center justify-between"
                    >
                      <span className="text-sm text-(--fg-muted)">{perm.label}</span>
                      <input
                        type="checkbox"
                        defaultChecked={
                          ACTIVE_ROLE_PERMS.admin?.includes(perm.key) ?? false
                        }
                        className="h-4 w-4 rounded"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button className="rounded-lg bg-(--color-crimson) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-crimson-dark)">
              Update permissions
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Add New Role</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Role name</label>
              <input
                type="text"
                placeholder="e.g., Contributor"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Slug</label>
              <input
                type="text"
                placeholder="contributor"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm font-mono text-(--fg-default)"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-lg bg-(--color-crimson) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-crimson-dark)">
              Create role
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
