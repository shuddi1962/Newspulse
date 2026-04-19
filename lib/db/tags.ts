import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';

export type TagRow = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  article_count: number;
  created_at: string;
};

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listTags(
  accessToken: string,
  options?: { search?: string },
): Promise<Result<TagRow[]>> {
  const insforge = createServerInsForge(accessToken);
  let query = insforge.database.from('tags').select('*');
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`);
  }
  const { data, error } = await query
    .order('article_count', { ascending: false })
    .order('name', { ascending: true })
    .limit(500);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not load tags.' };
  }
  return { status: 'ok', data: (data ?? []) as TagRow[] };
}

export async function getTagById(
  id: string,
  accessToken: string,
): Promise<TagRow | null> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('tags')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as TagRow;
}

type TagInsertPatch = {
  slug: string;
  name: string;
  color: string | null;
};

export async function insertTag(
  row: TagInsertPatch,
  accessToken: string,
): Promise<Result<{ id: string }>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('tags')
    .insert(row)
    .select('id')
    .single();
  if (error || !data) {
    return { status: 'error', message: error?.message ?? 'Could not create tag.' };
  }
  return { status: 'ok', data: { id: (data as { id: string }).id } };
}

export async function updateTag(
  id: string,
  patch: TagInsertPatch,
  accessToken: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database.from('tags').update(patch).eq('id', id);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not update tag.' };
  }
  return { status: 'ok', data: null };
}

export async function deleteTag(
  id: string,
  accessToken: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database.from('tags').delete().eq('id', id);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not delete tag.' };
  }
  return { status: 'ok', data: null };
}
