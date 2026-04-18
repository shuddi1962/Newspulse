'use server';

import { revalidatePath } from 'next/cache';
import { createServerInsForge } from '@/lib/insforge/server';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser } from '@/lib/auth/session';
import { updateProfileSchema } from '@/lib/validation/profile';
import { uploadImageAndTrack } from '@/lib/storage/media';
import {
  AVATAR_MAX_BYTES,
  STORAGE_BUCKETS,
} from '@/lib/storage/buckets';
import type { ActionResult } from '@/lib/auth/actions';
import type { Profile } from '@/lib/db/types';

async function requireSession(): Promise<
  | { status: 'ok'; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; accessToken: string }
  | { status: 'error'; message: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: 'error', message: 'You must be signed in.' };
  }
  const { accessToken } = await getAuthCookies();
  if (!accessToken) {
    return { status: 'error', message: 'Session expired. Please sign in again.' };
  }
  return { status: 'ok', user, accessToken };
}

export async function updateProfileAction(
  input: unknown,
): Promise<ActionResult<Profile>> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Check the form and try again.',
    };
  }

  const session = await requireSession();
  if (session.status === 'error') {
    return { status: 'error', message: session.message };
  }

  const insforge = createServerInsForge(session.accessToken);
  const { data, error } = await insforge.database
    .from('profiles')
    .update({
      display_name: parsed.data.display_name,
      username: parsed.data.username === '' ? null : parsed.data.username,
      bio: parsed.data.bio === '' ? null : parsed.data.bio,
      website_url:
        parsed.data.website_url === '' ? null : parsed.data.website_url,
    })
    .eq('id', session.user.id)
    .select('*')
    .single();

  if (error || !data) {
    const message = error?.message?.includes('profiles_username_unique')
      ? 'That username is already taken.'
      : error?.message ?? 'Could not save your profile.';
    return { status: 'error', message };
  }

  revalidatePath('/admin', 'layout');
  return { status: 'ok', data: data as Profile };
}

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult<{ url: string }>> {
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { status: 'error', message: 'No file was provided.' };
  }

  const session = await requireSession();
  if (session.status === 'error') {
    return { status: 'error', message: session.message };
  }

  const upload = await uploadImageAndTrack({
    file,
    bucket: STORAGE_BUCKETS.AVATARS,
    keyPrefix: session.user.id,
    uploaderId: session.user.id,
    accessToken: session.accessToken,
    maxBytes: AVATAR_MAX_BYTES,
    altText: `${session.user.name ?? 'User'} avatar`,
  });

  if (upload.status === 'error') {
    return { status: 'error', message: upload.error.message };
  }

  const insforge = createServerInsForge(session.accessToken);
  const { error: updateError } = await insforge.database
    .from('profiles')
    .update({ avatar_url: upload.data.url })
    .eq('id', session.user.id);

  if (updateError) {
    return {
      status: 'error',
      message: updateError.message ?? 'Uploaded, but could not update profile.',
    };
  }

  revalidatePath('/admin', 'layout');
  return { status: 'ok', data: { url: upload.data.url } };
}
