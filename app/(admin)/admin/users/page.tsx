import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { adminListUsers } from '@/lib/db/admin-users';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UsersManager } from './_components/users-manager';

export const metadata: Metadata = {
  title: 'User Management — Admin',
  description: 'Manage all registered users, their roles, and access levels.',
};

export default async function AdminUsersPage() {
  const actor = await requireAdmin();
  const { accessToken } = await getAuthCookies();

  const loadError = !accessToken ? 'Session expired. Sign in again.' : null;
  const result = accessToken
    ? await adminListUsers(accessToken)
    : ({ status: 'error', message: loadError ?? 'No session' } as const);

  if (result.status === 'error') {
    return (
      <div className="space-y-8">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Directory</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">User Management</h1>
        </div>
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not load users</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      </div>
    );
  }

  return <UsersManager rows={result.rows} actorId={actor.id} />;
}
