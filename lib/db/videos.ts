import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';

export type PublicVideo = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category_id: string | null;
  tags: string[];
  is_featured: boolean;
  view_count: number;
  created_at: string;
  author_display_name: string | null;
  category_slug: string | null;
  category_name: string | null;
};

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listPublishedVideos(
  limit = 20,
): Promise<Result<PublicVideo[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('videos')
    .select(
      'id, title, slug, description, video_url, thumbnail_url, duration_seconds, category_id, tags, is_featured, view_count, created_at, author_id, categories!videos_category_id_fkey(slug, name), profiles!videos_author_id_fkey(display_name)',
    )
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return { status: 'error', message: error.message ?? 'Could not load videos.' };

  const videos = (data ?? []).map((row: Record<string, unknown>) => {
    const categories = row.categories as { slug: string; name: string } | null;
    const profiles = row.profiles as { display_name: string | null } | null;
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      description: (row.description as string) ?? null,
      video_url: row.video_url as string,
      thumbnail_url: (row.thumbnail_url as string) ?? null,
      duration_seconds: (row.duration_seconds as number) ?? null,
      category_id: (row.category_id as string) ?? null,
      tags: (row.tags as string[]) ?? [],
      is_featured: row.is_featured as boolean,
      view_count: Number(row.view_count ?? 0),
      created_at: row.created_at as string,
      author_display_name: profiles?.display_name ?? null,
      category_slug: categories?.slug ?? null,
      category_name: categories?.name ?? null,
    } as PublicVideo;
  });

  return { status: 'ok', data: videos };
}

export async function getPublicVideoBySlug(
  slug: string,
): Promise<Result<PublicVideo | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('videos')
    .select(
      'id, title, slug, description, video_url, thumbnail_url, duration_seconds, category_id, tags, is_featured, view_count, created_at, author_id, categories!videos_category_id_fkey(slug, name), profiles!videos_author_id_fkey(display_name)',
    )
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return { status: 'error', message: error.message ?? 'Could not load video.' };
  if (!data) return { status: 'ok', data: null };

  const categories = (data as Record<string, unknown>).categories as { slug: string; name: string } | null;
  const profiles = (data as Record<string, unknown>).profiles as { display_name: string | null } | null;

  return {
    status: 'ok',
    data: {
      id: data.id as string,
      title: data.title as string,
      slug: data.slug as string,
      description: (data.description as string) ?? null,
      video_url: data.video_url as string,
      thumbnail_url: (data.thumbnail_url as string) ?? null,
      duration_seconds: (data.duration_seconds as number) ?? null,
      category_id: (data.category_id as string) ?? null,
      tags: (data.tags as string[]) ?? [],
      is_featured: data.is_featured as boolean,
      view_count: Number(data.view_count ?? 0),
      created_at: data.created_at as string,
      author_display_name: profiles?.display_name ?? null,
      category_slug: categories?.slug ?? null,
      category_name: categories?.name ?? null,
    } as PublicVideo,
  };
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}
