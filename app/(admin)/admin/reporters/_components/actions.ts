'use server';

import { revalidatePath } from 'next/cache';
import { createServerInsForge } from '@/lib/insforge/server';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';

export async function addReporterAction(input: {
  displayName: string;
  email: string;
  bio: string;
  twitter: string;
  facebook: string;
  linkedin: string;
  active: boolean;
}): Promise<{ status: 'ok'; message: string } | { status: 'error'; message: string }> {
  const actor = await getCurrentUser();
  if (!actor || !isAdmin(actor)) {
    return { status: 'error', message: 'Only admins can add reporters.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) {
    return { status: 'error', message: 'Session expired.' };
  }

  const insforge = createServerInsForge(accessToken);
  const tempPassword = Array.from({ length: 16 }, () =>
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]
  ).join('');

  const { data: signUpData, error: signUpError } = await insforge.auth.signUp({
    email: input.email,
    password: tempPassword,
    name: input.displayName,
  });

  if (signUpError) {
    return { status: 'error', message: signUpError.message ?? 'Could not create reporter.' };
  }

  const userId = signUpData?.user?.id;

  if (userId) {
    const profileUpdates: Record<string, unknown> = {
      role: 'author',
      bio: input.bio || null,
      website_url: input.linkedin || null,
    };

    const { error: profileError } = await insforge.database
      .from('profiles')
      .update(profileUpdates)
      .eq('id', userId);

    if (profileError) {
      return { status: 'error', message: 'User created but profile update failed: ' + profileError.message };
    }
  }

  revalidatePath('/admin/reporters');
  return { status: 'ok', message: 'Reporter created successfully.' };
}

export async function deleteReporterAction(
  userId: string,
): Promise<{ status: 'ok'; message: string } | { status: 'error'; message: string }> {
  const actor = await getCurrentUser();
  if (!actor || !isAdmin(actor)) {
    return { status: 'error', message: 'Only admins can delete reporters.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) {
    return { status: 'error', message: 'Session expired.' };
  }

  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database.from('profiles').delete().eq('id', userId);

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not delete reporter.' };
  }

  revalidatePath('/admin/reporters');
  return { status: 'ok', message: 'Reporter deleted.' };
}
