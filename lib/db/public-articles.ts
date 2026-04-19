import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';

export type PublicArticleCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  publish_at: string | null;
  is_breaking: boolean;
  is_featured: boolean;
  reading_time_min: number | null;
  category_id: string | null;
  author_id: string | null;
};

export type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  sort_order: number;
};

const CARD_COLUMNS =
  'id, title, slug, excerpt, featured_image, publish_at, is_breaking, is_featured, reading_time_min, category_id, author_id';

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listBreakingArticles(limit = 5): Promise<Result<PublicArticleCard[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('articles')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .eq('is_breaking', true)
    .order('publish_at', { ascending: false })
    .limit(limit);
  if (error) return { status: 'error', message: error.message ?? 'Could not load breaking news.' };
  return { status: 'ok', data: (data ?? []) as PublicArticleCard[] };
}

export async function listFeaturedArticles(limit = 6): Promise<Result<PublicArticleCard[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('articles')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('publish_at', { ascending: false })
    .limit(limit);
  if (error) return { status: 'error', message: error.message ?? 'Could not load featured articles.' };
  return { status: 'ok', data: (data ?? []) as PublicArticleCard[] };
}

export async function listLatestArticles(limit = 8): Promise<Result<PublicArticleCard[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('articles')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .order('publish_at', { ascending: false })
    .limit(limit);
  if (error) return { status: 'error', message: error.message ?? 'Could not load articles.' };
  return { status: 'ok', data: (data ?? []) as PublicArticleCard[] };
}

export async function listArticlesByCategory(
  categoryId: string,
  limit = 4,
): Promise<Result<PublicArticleCard[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('articles')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .order('publish_at', { ascending: false })
    .limit(limit);
  if (error) return { status: 'error', message: error.message ?? 'Could not load articles.' };
  return { status: 'ok', data: (data ?? []) as PublicArticleCard[] };
}

export async function listPublicNewsCategories(limit = 6): Promise<Result<PublicCategory[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('categories')
    .select('id, slug, name, color, sort_order')
    .eq('kind', 'news')
    .eq('is_active', true)
    .is('parent_id', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .limit(limit);
  if (error) return { status: 'error', message: error.message ?? 'Could not load categories.' };
  return { status: 'ok', data: (data ?? []) as PublicCategory[] };
}
