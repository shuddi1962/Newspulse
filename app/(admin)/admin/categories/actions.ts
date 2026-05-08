'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { insertCategory, updateCategory, deleteCategory } from '@/lib/db/categories';
import { categorySchema, slugifyName } from '@/lib/validation/taxonomy';
import type { ActionResult } from '@/lib/auth/actions';

export type CategoryFormState = {
  name: string;
  slug: string;
  parent_id: string;
};

export async function createCategoryAction(
  data: CategoryFormState,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const slug = data.slug || slugifyName(data.name);

  const parsed = categorySchema.safeParse({
    kind: 'news',
    slug,
    name: data.name,
    parent_id: data.parent_id || undefined,
    sort_order: 0,
    language: 'en',
    is_active: true,
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const patch = {
    ...parsed.data,
    description: (parsed.data.description ?? null) as string | null,
    icon: (parsed.data.icon ?? null) as string | null,
    seo_title: (parsed.data.seo_title ?? null) as string | null,
    seo_description: (parsed.data.seo_description ?? null) as string | null,
  };

  const result = await insertCategory(patch as never, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/categories');
  return { status: 'ok', data: result.data };
}

export async function updateCategoryAction(
  id: string,
  data: CategoryFormState,
): Promise<ActionResult> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const slug = data.slug || slugifyName(data.name);

  const parsed = categorySchema.safeParse({
    kind: 'news',
    slug,
    name: data.name,
    parent_id: data.parent_id || undefined,
    sort_order: 0,
    language: 'en',
    is_active: true,
  });

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const patch = {
    ...parsed.data,
    description: (parsed.data.description ?? null) as string | null,
    icon: (parsed.data.icon ?? null) as string | null,
    seo_title: (parsed.data.seo_title ?? null) as string | null,
    seo_description: (parsed.data.seo_description ?? null) as string | null,
  };

  const result = await updateCategory(id, patch as never, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/categories');
  return { status: 'ok' };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const result = await deleteCategory(id, accessToken);
  if (result.status === 'error') return result;

  revalidatePath('/admin/categories');
  return { status: 'ok' };
}
