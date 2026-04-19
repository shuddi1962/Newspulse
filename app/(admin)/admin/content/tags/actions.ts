'use server';

import { revalidatePath } from 'next/cache';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { deleteTag, insertTag, updateTag } from '@/lib/db/tags';
import { tagSchema } from '@/lib/validation/taxonomy';
import type { ActionResult } from '@/lib/auth/actions';

type SaveResult = ActionResult<{ id: string }>;

function fromFormData(form: FormData): Record<string, string> {
  const get = (key: string) => (form.get(key) as string | null) ?? '';
  return {
    id: get('id'),
    slug: get('slug'),
    name: get('name'),
    color: get('color'),
  };
}

export async function saveTagAction(
  _prevState: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { status: 'error', message: 'You must be signed in.' };
  if (!isAdmin(user)) return { status: 'error', message: 'Only admins can manage tags.' };

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired. Sign in again.' };

  const parsed = tagSchema.safeParse(fromFormData(formData));
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const patch = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    color: parsed.data.color ?? null,
  };

  if (parsed.data.id) {
    const result = await updateTag(parsed.data.id, patch, accessToken);
    if (result.status === 'error') return { status: 'error', message: result.message };
    revalidatePath('/admin/content/tags');
    return { status: 'ok', data: { id: parsed.data.id } };
  }

  const result = await insertTag(patch, accessToken);
  if (result.status === 'error') return { status: 'error', message: result.message };

  revalidatePath('/admin/content/tags');
  return { status: 'ok', data: { id: result.data.id } };
}

export async function deleteTagAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return;

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return;

  const id = (formData.get('id') as string | null) ?? '';
  if (!id) return;

  await deleteTag(id, accessToken);
  revalidatePath('/admin/content/tags');
}
