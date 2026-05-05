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

export type PublicArticleFull = PublicArticleCard & {
  content_html: string | null;
  gallery_images: string[];
  tags: string[];
  word_count: number | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  og_image: string | null;
  canonical_url: string | null;
  language: string;
  allow_comments: boolean;
  view_count: number;
  share_count: number;
  updated_at: string;
  created_at: string;
  is_premium: boolean;
};

export type PublicCategory = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  sort_order: number;
};

export type PublicAuthor = {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
};

const CARD_COLUMNS =
  'id, title, slug, excerpt, featured_image, publish_at, is_breaking, is_featured, reading_time_min, category_id, author_id';

const FULL_COLUMNS = `${CARD_COLUMNS}, content_html, gallery_images, tags, word_count, seo_title, seo_description, seo_keywords, og_image, canonical_url, language, allow_comments, view_count, share_count, updated_at, created_at, is_premium`;

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

export type RssArticle = {
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string | null;
  publish_at: string | null;
  category_slug: string | null;
  category_name: string | null;
  author_display_name: string | null;
};

export async function listArticlesForRss(
  limit = 20,
  categoryId?: string,
): Promise<Result<RssArticle[]>> {
  const insforge = createServerInsForge();
  let query = insforge.database
    .from('articles')
    .select(
      'title, slug, excerpt, content_html, publish_at, category_id, author_id, categories!articles_category_id_fkey(slug, name), profiles!articles_author_id_fkey(display_name)',
    )
    .eq('status', 'published')
    .order('publish_at', { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) return { status: 'error', message: error.message ?? 'Could not load articles for RSS.' };

  const articles = (data ?? []).map((row: Record<string, unknown>) => {
    const categories = row.categories as { slug: string; name: string } | null;
    const profiles = row.profiles as { display_name: string | null } | null;
    return {
      title: row.title as string,
      slug: row.slug as string,
      excerpt: (row.excerpt as string) ?? null,
      content_html: (row.content_html as string) ?? null,
      publish_at: (row.publish_at as string) ?? null,
      category_slug: categories?.slug ?? null,
      category_name: categories?.name ?? null,
      author_display_name: profiles?.display_name ?? null,
    } as RssArticle;
  });

  return { status: 'ok', data: articles };
}

export async function getPublicArticleBySlug(
  slug: string,
): Promise<Result<PublicArticleFull | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('articles')
    .select(FULL_COLUMNS)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load article.' };
  return { status: 'ok', data: (data as PublicArticleFull | null) ?? null };
}

export async function getPublicCategoryById(
  categoryId: string,
): Promise<Result<PublicCategory | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('categories')
    .select('id, slug, name, color, sort_order')
    .eq('id', categoryId)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load category.' };
  return { status: 'ok', data: (data as PublicCategory | null) ?? null };
}

export async function getPublicCategoryBySlug(
  slug: string,
): Promise<Result<PublicCategory | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('categories')
    .select('id, slug, name, color, sort_order')
    .eq('slug', slug)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load category.' };
  return { status: 'ok', data: (data as PublicCategory | null) ?? null };
}

export async function getPublicAuthorById(
  authorId: string,
): Promise<Result<PublicAuthor | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('profiles')
    .select('id, display_name, username, avatar_url, bio, website_url')
    .eq('id', authorId)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load author.' };
  return { status: 'ok', data: (data as PublicAuthor | null) ?? null };
}

export type PaginatedArticles = {
  articles: PublicArticleCard[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listCategoryArticlesPaginated(
  categoryId: string,
  page = 1,
  pageSize = 12,
): Promise<Result<PaginatedArticles>> {
  const insforge = createServerInsForge();
  const offset = (page - 1) * pageSize;

  const countRes = await insforge.database
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .eq('category_id', categoryId);

  if (countRes.error) return { status: 'error', message: countRes.error.message ?? 'Could not count articles.' };
  const total = countRes.count ?? 0;

  const { data, error } = await insforge.database
    .from('articles')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .order('publish_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) return { status: 'error', message: error.message ?? 'Could not load articles.' };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    status: 'ok',
    data: {
      articles: (data ?? []) as PublicArticleCard[],
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

export async function searchArticles(
  query: string,
  page = 1,
  pageSize = 12,
): Promise<Result<PaginatedArticles>> {
  if (!query.trim()) {
    return {
      status: 'ok',
      data: { articles: [], total: 0, page, pageSize, totalPages: 1 },
    };
  }

  const insforge = createServerInsForge();
  const offset = (page - 1) * pageSize;
  const term = `%${query.trim()}%`;

  const countRes = await insforge.database
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .or(`title.ilike.${term},excerpt.ilike.${term}`);

  if (countRes.error) return { status: 'error', message: countRes.error.message ?? 'Could not count results.' };
  const total = countRes.count ?? 0;

  const { data, error } = await insforge.database
    .from('articles')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .or(`title.ilike.${term},excerpt.ilike.${term}`)
    .order('publish_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) return { status: 'error', message: error.message ?? 'Could not load results.' };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    status: 'ok',
    data: {
      articles: (data ?? []) as PublicArticleCard[],
      total,
      page,
      pageSize,
      totalPages,
    },
  };
}

export async function listRelatedArticles(
  article: Pick<PublicArticleCard, 'id' | 'category_id'>,
  limit = 3,
): Promise<Result<PublicArticleCard[]>> {
  const insforge = createServerInsForge();
  let query = insforge.database
    .from('articles')
    .select(CARD_COLUMNS)
    .eq('status', 'published')
    .neq('id', article.id);

  if (article.category_id) {
    query = query.eq('category_id', article.category_id);
  }

  const { data, error } = await query
    .order('publish_at', { ascending: false })
    .limit(limit);
  if (error) return { status: 'error', message: error.message ?? 'Could not load related articles.' };
  return { status: 'ok', data: (data ?? []) as PublicArticleCard[] };
}
