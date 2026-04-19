import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type { MediaAsset } from '@/lib/db/types';

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export type MediaListFilter = {
  bucket?: string;
  search?: string;
  uploaderId?: string;
};

export type MediaListPage = {
  rows: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 48;

export async function listMedia(
  accessToken: string,
  filter: MediaListFilter = {},
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<Result<MediaListPage>> {
  const insforge = createServerInsForge(accessToken);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = insforge.database
    .from('media_assets')
    .select('*', { count: 'exact' });
  if (filter.bucket) query = query.eq('bucket', filter.bucket);
  if (filter.uploaderId) query = query.eq('uploader_id', filter.uploaderId);
  if (filter.search) query = query.ilike('alt_text', `%${filter.search}%`);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not load media.' };
  }
  return {
    status: 'ok',
    data: {
      rows: (data ?? []) as MediaAsset[],
      total: count ?? 0,
      page,
      pageSize,
    },
  };
}

export async function getMediaById(
  id: string,
  accessToken: string,
): Promise<MediaAsset | null> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as MediaAsset;
}

export async function updateMediaAlt(
  id: string,
  altText: string | null,
  accessToken: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database
    .from('media_assets')
    .update({ alt_text: altText })
    .eq('id', id);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not update alt text.' };
  }
  return { status: 'ok', data: null };
}

export async function deleteMediaRow(
  id: string,
  accessToken: string,
): Promise<Result<{ bucket: string; object_key: string } | null>> {
  const insforge = createServerInsForge(accessToken);
  const { data: row, error: selectError } = await insforge.database
    .from('media_assets')
    .select('bucket, object_key')
    .eq('id', id)
    .maybeSingle();
  if (selectError) {
    return { status: 'error', message: selectError.message ?? 'Could not locate asset.' };
  }
  const { error } = await insforge.database
    .from('media_assets')
    .delete()
    .eq('id', id);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not delete asset.' };
  }
  return {
    status: 'ok',
    data: row
      ? { bucket: (row as { bucket: string }).bucket, object_key: (row as { object_key: string }).object_key }
      : null,
  };
}
