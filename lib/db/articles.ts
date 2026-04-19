import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type { ArticleStatus } from '@/lib/validation/article';

export type ArticleRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: unknown;
  content_html: string | null;
  author_id: string | null;
  status: ArticleStatus;
  category_id: string | null;
  tags: string[];
  is_breaking: boolean;
  is_featured: boolean;
  is_premium: boolean;
  reading_time_min: number | null;
  word_count: number | null;
  publish_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminArticleRow = Pick<
  ArticleRow,
  | 'id'
  | 'title'
  | 'slug'
  | 'status'
  | 'author_id'
  | 'word_count'
  | 'reading_time_min'
  | 'publish_at'
  | 'updated_at'
>;

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listArticlesForAdmin(
  accessToken: string,
  filter?: { status?: ArticleStatus },
): Promise<Result<AdminArticleRow[]>> {
  const insforge = createServerInsForge(accessToken);
  let query = insforge.database
    .from('articles')
    .select(
      'id, title, slug, status, author_id, word_count, reading_time_min, publish_at, updated_at',
    );
  if (filter?.status) {
    query = query.eq('status', filter.status);
  }
  const { data, error } = await query
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not load articles.' };
  }
  return { status: 'ok', data: (data ?? []) as AdminArticleRow[] };
}

export async function countArticlesByStatus(
  accessToken: string,
): Promise<Result<Record<ArticleStatus, number>>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('articles')
    .select('status')
    .limit(5000);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not count articles.' };
  }
  const counts: Record<ArticleStatus, number> = {
    draft: 0,
    review: 0,
    approved: 0,
    scheduled: 0,
    published: 0,
    archived: 0,
    rejected: 0,
  };
  for (const row of (data ?? []) as { status: ArticleStatus }[]) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }
  return { status: 'ok', data: counts };
}

export async function getArticleById(
  id: string,
  accessToken: string,
): Promise<ArticleRow | null> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return data as ArticleRow;
}

type CreateDraftRow = {
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: unknown;
  content_html: string | null;
  author_id: string;
  status: 'draft';
  word_count: number | null;
  reading_time_min: number | null;
};

export async function insertDraftArticle(
  row: CreateDraftRow,
  accessToken: string,
): Promise<Result<{ id: string }>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('articles')
    .insert(row)
    .select('id')
    .single();
  if (error || !data) {
    return {
      status: 'error',
      message: error?.message ?? 'Could not save draft.',
    };
  }
  return { status: 'ok', data: { id: (data as { id: string }).id } };
}

type UpdateDraftPatch = {
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: unknown;
  content_html: string | null;
  word_count: number | null;
  reading_time_min: number | null;
};

export async function updateDraftArticle(
  id: string,
  patch: UpdateDraftPatch,
  accessToken: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database
    .from('articles')
    .update(patch)
    .eq('id', id);
  if (error) {
    return {
      status: 'error',
      message: error.message ?? 'Could not update draft.',
    };
  }
  return { status: 'ok', data: null };
}

export async function appendArticleRevision(
  articleId: string,
  contentJson: unknown,
  userId: string,
  accessToken: string,
  note?: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database.from('article_revisions').insert({
    article_id: articleId,
    content_json: contentJson,
    revised_by: userId,
    revision_note: note ?? null,
  });
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not save revision.' };
  }
  return { status: 'ok', data: null };
}

type StatusPatch = {
  status: ArticleStatus;
  publish_at?: string | null;
};

export async function setArticleStatus(
  id: string,
  patch: StatusPatch,
  accessToken: string,
): Promise<Result<null>> {
  const insforge = createServerInsForge(accessToken);
  const { error } = await insforge.database
    .from('articles')
    .update(patch)
    .eq('id', id);
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not update status.' };
  }
  return { status: 'ok', data: null };
}
