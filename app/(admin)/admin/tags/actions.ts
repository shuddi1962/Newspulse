'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { insertTag, updateTag, deleteTag } from '@/lib/db/tags';
import { tagSchema, slugifyName } from '@/lib/validation/taxonomy';
import type { ActionResult } from '@/lib/auth/actions';

export type TagFormState = {
  name: string;
  slug: string;
};

export async function createTagAction(
  data: TagFormState,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const slug = data.slug || slugifyName(data.name);

  const parsed = tagSchema.safeParse({
    slug,
    name: data.name,
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const patch = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    color: (parsed.data.color ?? null) as string | null,
  };

  const result = await insertTag(patch, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/tags');
  return { status: 'ok', data: result.data };
}

export async function updateTagAction(
  id: string,
  data: TagFormState,
): Promise<ActionResult> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const slug = data.slug || slugifyName(data.name);

  const parsed = tagSchema.safeParse({
    slug,
    name: data.name,
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const patch = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    color: (parsed.data.color ?? null) as string | null,
  };

  const result = await updateTag(id, patch, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/tags');
  return { status: 'ok' };
}

export async function deleteTagAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const result = await deleteTag(id, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/tags');
  return { status: 'ok' };
}
