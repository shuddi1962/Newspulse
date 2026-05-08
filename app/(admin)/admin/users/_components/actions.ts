'use server';

import { revalidatePath } from 'next/cache';
import { createServerInsForge } from '@/lib/insforge/server';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';

export async function addUserAction(input: {
  displayName: string;
  email: string;
  role: string;
  active: boolean;
}): Promise<{ status: 'ok'; message: string } | { status: 'error'; message: string }> {
  const actor = await getCurrentUser();
  if (!actor || !isAdmin(actor)) {
    return { status: 'error', message: 'Only admins can add users.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) {
    return { status: 'error', message: 'Session expired. Sign in again.' };
  }

  const insforge = createServerInsForge(accessToken);
  const tempPassword = Array.from({ length: 16 }, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
  ).join('');

  const { error } = await insforge.auth.signUp({
    email: input.email,
    password: tempPassword,
    name: input.displayName,
  });

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not create user.' };
  }

  if (input.role !== 'reader' || !input.active) {
    const { data: lookup } = await insforge.database
      .from('profiles')
      .select('id')
      .eq('email', input.email)
      .maybeSingle();

    if (lookup) {
      await insforge.database
        .from('profiles')
        .update({ role: input.role })
        .eq('id', lookup.id);
    }
  }

  revalidatePath('/admin/users');
  return { status: 'ok', message: 'User created. They will receive a welcome email to set their password.' };
}

export async function deleteUserAction(
  userId: string,
): Promise<{ status: 'ok'; message: string } | { status: 'error'; message: string }> {
  const actor = await getCurrentUser();
  if (!actor || !isAdmin(actor)) {
    return { status: 'error', message: 'Only admins can delete users.' };
  }
  if (actor.id === userId) {
    return { status: 'error', message: 'You cannot delete yourself.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) {
    return { status: 'error', message: 'Session expired.' };
  }

  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database.from('profiles').delete().eq('id', userId);

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not delete user.' };
  }

  revalidatePath('/admin/users');
  return { status: 'ok', message: 'User deleted.' };
}
