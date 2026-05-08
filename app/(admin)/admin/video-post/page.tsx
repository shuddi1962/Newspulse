import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';
import { VideoManager } from './video-manager';

export const metadata: Metadata = {
  title: 'Video Posts — Admin',
  description: 'Manage video posts and analytics.',
};

async function getCategories() {
  const insforge = createServerInsForge();
  const { data } = await insforge.database
    .from('categories')
    .select('id, name, slug')
    .eq('kind', 'news')
    .eq('is_active', true)
    .order('name');
  return (data ?? []) as Array<{ id: string; name: string; slug: string }>;
}

async function getVideos() {
  const insforge = createServerInsForge();
  const { data } = await insforge.database
    .from('videos')
    .select('id, title, slug, description, video_url, thumbnail_url, duration_seconds, category_id, tags, is_featured, view_count, status, created_at, updated_at, profiles!videos_author_id_fkey(display_name), categories!videos_category_id_fkey(name)')
    .order('created_at', { ascending: false });
  return (data ?? []).map((v: Record<string, unknown>) => ({
    id: v.id as string,
    title: v.title as string,
    slug: v.slug as string,
    description: (v.description as string) ?? null,
    video_url: v.video_url as string,
    thumbnail_url: (v.thumbnail_url as string) ?? null,
    duration_seconds: (v.duration_seconds as number) ?? null,
    category_id: (v.category_id as string) ?? null,
    tags: (v.tags as string[]) ?? [],
    is_featured: v.is_featured as boolean ?? false,
    view_count: Number(v.view_count ?? 0),
    status: (v.status as string) ?? 'draft',
    created_at: (v.created_at as string) ?? '',
    updated_at: (v.updated_at as string) ?? '',
    author_name: ((v.profiles as { display_name: string | null } | null)?.display_name) ?? null,
    category_name: ((v.categories as { name: string | null } | null)?.name) ?? null,
  }));
}

export default async function AdminVideoPostPage() {
  await requireAdmin();
  const [videos, categories] = await Promise.all([getVideos(), getCategories()]);
  return <VideoManager videos={videos} categories={categories} />;
}
