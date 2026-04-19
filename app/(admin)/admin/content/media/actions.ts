'use server';

import { revalidatePath } from 'next/cache';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, hasRole, isAdmin } from '@/lib/auth/session';
import {
  deleteMediaRow,
  getMediaById,
  updateMediaAlt,
} from '@/lib/db/media';
import {
  removeStorageObject,
  uploadImageAndTrack,
} from '@/lib/storage/media';
import {
  MEDIA_IMAGE_MAX_BYTES,
  STORAGE_BUCKETS,
  type StorageBucket,
} from '@/lib/storage/buckets';
import type { ActionResult } from '@/lib/auth/actions';

export async function uploadMediaAction(
  _prev: ActionResult<{ id: string; url: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string; url: string }>> {
  const user = await getCurrentUser();
  if (!user) return { status: 'error', message: 'You must be signed in.' };
  if (!hasRole(user, 'author', 'editor', 'admin')) {
    return { status: 'error', message: 'Only authors and above can upload media.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired. Sign in again.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { status: 'error', message: 'Select a file to upload.' };
  }

  const altRaw = (formData.get('alt_text') as string | null) ?? '';
  const altText = altRaw.trim() ? altRaw.trim().slice(0, 500) : null;

  const result = await uploadImageAndTrack({
    file,
    bucket: STORAGE_BUCKETS.MEDIA,
    keyPrefix: `library/${user.id}`,
    uploaderId: user.id,
    accessToken,
    maxBytes: MEDIA_IMAGE_MAX_BYTES,
    altText,
  });

  if (result.status === 'error') {
    return { status: 'error', message: result.error.message };
  }

  revalidatePath('/admin/content/media');
  return {
    status: 'ok',
    data: { id: result.data.asset.id, url: result.data.url },
  };
}

export async function updateMediaAltAction(
  _prev: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { status: 'error', message: 'You must be signed in.' };

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired. Sign in again.' };

  const id = (formData.get('id') as string | null) ?? '';
  if (!id) return { status: 'error', message: 'Missing media ID.' };

  const altRaw = (formData.get('alt_text') as string | null) ?? '';
  const altText = altRaw.trim() ? altRaw.trim().slice(0, 500) : null;

  const existing = await getMediaById(id, accessToken);
  if (!existing) return { status: 'error', message: 'Media not found.' };
  if (existing.uploader_id !== user.id && !isAdmin(user)) {
    return { status: 'error', message: 'You can only edit your own uploads.' };
  }

  const result = await updateMediaAlt(id, altText, accessToken);
  if (result.status === 'error') return { status: 'error', message: result.message };

  revalidatePath('/admin/content/media');
  return { status: 'ok', data: { id } };
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return;

  const id = (formData.get('id') as string | null) ?? '';
  if (!id) return;

  const existing = await getMediaById(id, accessToken);
  if (!existing) return;
  if (existing.uploader_id !== user.id && !isAdmin(user)) return;

  const result = await deleteMediaRow(id, accessToken);
  if (result.status === 'ok' && result.data) {
    await removeStorageObject(
      result.data.bucket as StorageBucket,
      result.data.object_key,
      accessToken,
    );
  }

  revalidatePath('/admin/content/media');
}
