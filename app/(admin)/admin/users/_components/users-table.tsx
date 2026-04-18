import Image from 'next/image';
import { ShieldCheck } from 'lucide-react';
import type { AdminUserRow } from '@/lib/db/admin-users';
import type { UserRole } from '@/lib/db/types';
import { RoleSelect } from './role-select';

interface UsersTableProps {
  rows: AdminUserRow[];
  actorId: string;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function initialsOf(name: string | null): string {
  if (!name) return 'NP';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function UsersTable({ rows, actorId }: UsersTableProps) {
  if (rows.length === 0) {
    return (
      <div className="border border-dashed border-(--border-subtle) bg-(--bg-base) p-10 text-center text-sm text-(--fg-muted)">
        No users yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-(--border-subtle) bg-(--bg-base)">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="border-b border-(--border-subtle) bg-(--bg-muted) text-xs uppercase tracking-[0.15em] text-(--fg-subtle)">
          <tr>
            <th scope="col" className="px-4 py-3 font-mono">User</th>
            <th scope="col" className="px-4 py-3 font-mono">Handle</th>
            <th scope="col" className="px-4 py-3 font-mono">Role</th>
            <th scope="col" className="px-4 py-3 font-mono">Email</th>
            <th scope="col" className="px-4 py-3 font-mono">Joined</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const displayName = row.display_name ?? row.email.split('@')[0] ?? 'User';
            const isSelf = row.id === actorId;
            const currentRole = (row.role ?? 'reader') as UserRole;
            return (
              <tr
                key={row.id}
                className="border-b border-(--border-subtle) last:border-b-0 hover:bg-(--bg-muted)"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 overflow-hidden border border-(--border-subtle) bg-(--bg-muted)">
                      {row.avatar_url ? (
                        <Image
                          src={row.avatar_url}
                          alt={`${displayName} avatar`}
                          fill
                          sizes="32px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center font-display text-[0.65rem] font-semibold text-(--fg-muted)">
                          {initialsOf(row.display_name)}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-(--fg-default)">
                        {displayName}
                      </span>
                      {row.is_project_admin ? (
                        <span className="flex items-center gap-1 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
                          <ShieldCheck className="h-3 w-3" aria-hidden />
                          Project admin
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-(--fg-muted)">
                  {row.username ? `@${row.username}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <RoleSelect
                    userId={row.id}
                    current={currentRole}
                    label={displayName}
                    disabled={isSelf}
                    disabledReason={isSelf ? 'You cannot change your own role.' : undefined}
                  />
                </td>
                <td className="px-4 py-3 text-(--fg-muted)">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{row.email}</span>
                    {row.email_verified ? (
                      <span className="inline-flex items-center border border-(--border-subtle) px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
                        verified
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-(--fg-muted)">
                  {formatDate(row.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
