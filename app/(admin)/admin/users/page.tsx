import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { adminListUsers } from '@/lib/db/admin-users';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UsersTable } from './_components/users-table';

export const metadata: Metadata = {
  title: 'Users',
};

export default async function AdminUsersPage() {
  const actor = await requireAdmin();
  const { accessToken } = await getAuthCookies();

  const loadError = !accessToken ? 'Session expired. Sign in again.' : null;
  const result = accessToken
    ? await adminListUsers(accessToken)
    : ({ status: 'error', message: loadError ?? 'No session' } as const);

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Directory
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Users
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-(--fg-muted)">
          Everyone with an account on NewsPulse PRO. Change a user&rsquo;s role
          to grant them editorial or admin privileges. Role changes are
          enforced server-side by a Postgres trigger.
        </p>
      </div>

      {result.status === 'error' ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not load users</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </div>
        </Alert>
      ) : (
        <UsersTable rows={result.rows} actorId={actor.id} />
      )}
    </div>
  );
}
