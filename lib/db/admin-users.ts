import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type { UserRole } from '@/lib/db/types';

export type AdminUserRow = {
  id: string;
  email: string;
  email_verified: boolean;
  display_name: string | null;
  username: string | null;
  role: UserRole | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  is_project_admin: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export async function adminListUsers(
  accessToken: string,
): Promise<
  | { status: 'ok'; rows: AdminUserRow[] }
  | { status: 'error'; message: string }
> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database.rpc('admin_list_users');
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not load users.' };
  }
  return { status: 'ok', rows: (data ?? []) as AdminUserRow[] };
}
