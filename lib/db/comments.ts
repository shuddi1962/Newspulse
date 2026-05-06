import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';

export type PublicComment = {
  id: string;
  article_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  status: string;
  likes_count: number;
  created_at: string;
  author_display_name: string | null;
};

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listApprovedComments(
  articleId: string,
): Promise<Result<PublicComment[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('comments')
    .select(
      'id, article_id, user_id, parent_id, content, status, likes_count, created_at, profiles!comments_user_id_fkey(display_name)',
    )
    .eq('article_id', articleId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) return { status: 'error', message: error.message ?? 'Could not load comments.' };

  const comments = (data ?? []).map((row: Record<string, unknown>) => {
    const profiles = row.profiles as { display_name: string | null } | null;
    return {
      id: row.id as string,
      article_id: row.article_id as string,
      user_id: row.user_id as string | null,
      parent_id: row.parent_id as string | null,
      content: row.content as string,
      status: row.status as string,
      likes_count: row.likes_count as number,
      created_at: row.created_at as string,
      author_display_name: profiles?.display_name ?? null,
    } as PublicComment;
  });

  return { status: 'ok', data: comments };
}

export async function createComment(
  articleId: string,
  content: string,
  accessToken: string,
  parentId?: string | null,
  status?: string,
): Promise<Result<PublicComment>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('comments')
    .insert({
      article_id: articleId,
      content: content.trim(),
      parent_id: parentId ?? null,
      status: status ?? 'pending',
    })
    .select(
      'id, article_id, user_id, parent_id, content, status, likes_count, created_at, profiles!comments_user_id_fkey(display_name)',
    )
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Could not post comment.' };

  const profiles = (data as Record<string, unknown>).profiles as { display_name: string | null } | null;
  return {
    status: 'ok',
    data: {
      id: data.id as string,
      article_id: data.article_id as string,
      user_id: data.user_id as string | null,
      parent_id: data.parent_id as string | null,
      content: data.content as string,
      status: data.status as string,
      likes_count: data.likes_count as number,
      created_at: data.created_at as string,
      author_display_name: profiles?.display_name ?? null,
    } as PublicComment,
  };
}
