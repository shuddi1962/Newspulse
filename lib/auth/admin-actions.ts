'use server';

import { revalidatePath } from 'next/cache';
import { createServerInsForge } from '@/lib/insforge/server';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { updateUserRoleSchema } from '@/lib/validation/admin';
import type { ActionResult } from '@/lib/auth/actions';
import type { Profile } from '@/lib/db/types';

export async function updateUserRoleAction(
  input: unknown,
): Promise<ActionResult<Profile>> {
  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Invalid input.',
    };
  }

  const actor = await getCurrentUser();
  if (!actor) {
    return { status: 'error', message: 'You must be signed in.' };
  }
  if (!isAdmin(actor)) {
    return { status: 'error', message: 'Only admins can change user roles.' };
  }
  if (actor.id === parsed.data.userId && parsed.data.role !== 'admin') {
    return {
      status: 'error',
      message: 'You cannot demote yourself from admin.',
    };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) {
    return { status: 'error', message: 'Session expired. Sign in again.' };
  }

  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.userId)
    .select('*')
    .single();

  if (error || !data) {
    return {
      status: 'error',
      message: error?.message ?? 'Could not update role.',
    };
  }

  const updated = data as Profile;
  if (updated.role !== parsed.data.role) {
    // DB-level guard reverted the change silently — surface it clearly.
    return {
      status: 'error',
      message: 'Role change was rejected by the database. Verify you are an admin.',
    };
  }

  revalidatePath('/admin/users');
  return { status: 'ok', data: updated };
}
