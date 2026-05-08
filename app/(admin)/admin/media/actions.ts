'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createServerInsForge } from '@/lib/insforge/server';
import { updateMediaAlt, deleteMediaRow } from '@/lib/db/media';
import type { ActionResult } from '@/lib/auth/actions';

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const result = await deleteMediaRow(id, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/media');
  return { status: 'ok' };
}

export async function updateMediaAltAction(
  id: string,
  altText: string,
): Promise<ActionResult> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const result = await updateMediaAlt(id, altText || null, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/media');
  return { status: 'ok' };
}

export async function uploadMediaAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { status: 'error', message: 'No file provided.' };
  }

  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    return { status: 'error', message: 'File exceeds 20 MB limit.' };
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const objectKey = `uploads/${user.id}/${timestamp}_${safeName}`;

  const insforge = createServerInsForge(accessToken);

  const { data: uploadResult, error: uploadError } = await insforge.storage
    .from('media')
    .upload(objectKey, file);

  if (uploadError) {
    return { status: 'error', message: uploadError.message ?? 'Upload failed.' };
  }

  const { data: insertResult, error: insertError } = await insforge.database
    .from('media_assets')
    .insert({
      uploader_id: user.id,
      bucket: 'media',
      object_key: objectKey,
      url: uploadResult?.url ?? objectKey,
      mime_type: file.type || null,
      size_bytes: file.size,
    })
    .select('id')
    .single();

  if (insertError || !insertResult) {
    return { status: 'error', message: insertError?.message ?? 'Could not record asset.' };
  }

  revalidatePath('/admin/media');
  return { status: 'ok', data: { id: (insertResult as { id: string }).id } };
}
