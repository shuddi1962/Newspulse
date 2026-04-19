'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import {
  deleteCategory,
  insertCategory,
  updateCategory,
} from '@/lib/db/categories';
import { categorySchema } from '@/lib/validation/taxonomy';
import type { ActionResult } from '@/lib/auth/actions';

type SaveResult = ActionResult<{ id: string }>;

function fromFormData(form: FormData): Record<string, string> {
  const get = (key: string) => (form.get(key) as string | null) ?? '';
  return {
    id: get('id'),
    kind: get('kind'),
    slug: get('slug'),
    name: get('name'),
    description: get('description'),
    parent_id: get('parent_id'),
    sort_order: get('sort_order') || '0',
    icon: get('icon'),
    color: get('color'),
    language: get('language') || 'en',
    seo_title: get('seo_title'),
    seo_description: get('seo_description'),
    is_active: form.get('is_active') === 'on' || form.get('is_active') === 'true' ? 'true' : 'false',
  };
}

function toRow(parsed: ReturnType<typeof categorySchema.parse>) {
  return {
    kind: parsed.kind,
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description ?? null,
    parent_id: parsed.parent_id ?? null,
    sort_order: parsed.sort_order,
    icon: parsed.icon ?? null,
    color: parsed.color ?? null,
    language: parsed.language,
    seo_title: parsed.seo_title ?? null,
    seo_description: parsed.seo_description ?? null,
    is_active: parsed.is_active,
  };
}

export async function saveCategoryAction(
  _prevState: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const user = await getCurrentUser();
  if (!user) return { status: 'error', message: 'You must be signed in.' };
  if (!isAdmin(user)) {
    return { status: 'error', message: 'Only admins can manage categories.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired. Sign in again.' };

  const parsed = categorySchema.safeParse(fromFormData(formData));
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const row = toRow(parsed.data);

  if (parsed.data.id) {
    if (parsed.data.parent_id === parsed.data.id) {
      return { status: 'error', message: 'A category cannot be its own parent.' };
    }
    const result = await updateCategory(parsed.data.id, row, accessToken);
    if (result.status === 'error') return { status: 'error', message: result.message };
    revalidatePath('/admin/content/categories');
    return { status: 'ok', data: { id: parsed.data.id } };
  }

  const result = await insertCategory(row, accessToken);
  if (result.status === 'error') return { status: 'error', message: result.message };

  revalidatePath('/admin/content/categories');
  redirect(`/admin/content/categories?kind=${row.kind}&saved=1`);
}

export async function deleteCategoryAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return;

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return;

  const id = (formData.get('id') as string | null) ?? '';
  if (!id) return;

  await deleteCategory(id, accessToken);
  revalidatePath('/admin/content/categories');
}
