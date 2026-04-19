import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type { CategoryKind } from '@/lib/validation/taxonomy';

export type CategoryRow = {
  id: string;
  kind: CategoryKind;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  icon: string | null;
  color: string | null;
  language: string;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listCategories(
  accessToken: string,
  filter?: { kind?: CategoryKind },
): Promise<Result<CategoryRow[]>> {
  const insforge = createServerInsForge(accessToken);
  let query = insforge.database.from('categories').select('*');
  if (filter?.kind) query = query.eq('kind', filter.kind);
  const { data, error } = await query
    .order('kind', { ascending: true })
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .limit(500);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not load categories.' };
  }
  return { status: 'ok', data: (data ?? []) as CategoryRow[] };
}

export async function getCategoryById(
  id: string,
  accessToken: string,
): Promise<CategoryRow | null> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('categories')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as CategoryRow;
}

type CategoryInsertPatch = {
  kind: CategoryKind;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  icon: string | null;
  color: string | null;
  language: string;
  seo_title: string | null;
  seo_description: string | null;
  is_active: boolean;
};

export async function insertCategory(
  row: CategoryInsertPatch,
  accessToken: string,
): Promise<Result<{ id: string }>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('categories')
    .insert(row)
    .select('id')
    .single();
  if (error || !data) {
    return { status: 'error', message: error?.message ?? 'Could not create category.' };
  }
  return { status: 'ok', data: { id: (data as { id: string }).id } };
}

export async function updateCategory(
  id: string,
  patch: CategoryInsertPatch,
  accessToken: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database
    .from('categories')
    .update(patch)
    .eq('id', id);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not update category.' };
  }
  return { status: 'ok', data: null };
}

export async function deleteCategory(
  id: string,
  accessToken: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database.from('categories').delete().eq('id', id);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not delete category.' };
  }
  return { status: 'ok', data: null };
}
