'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, hasRole } from '@/lib/auth/session';
import { createDraftSchema, estimateReadingTime, updateDraftSchema } from '@/lib/validation/article';
import {
  appendArticleRevision,
  insertDraftArticle,
  updateDraftArticle,
} from '@/lib/db/articles';
import type { ActionResult } from '@/lib/auth/actions';

function parseContentJson(raw: string): unknown {
  return JSON.parse(raw);
}

function fromFormData(form: FormData): Record<string, string> {
  return {
    id: (form.get('id') as string | null) ?? '',
    title: (form.get('title') as string | null) ?? '',
    slug: (form.get('slug') as string | null) ?? '',
    excerpt: (form.get('excerpt') as string | null) ?? '',
    content_json: (form.get('content_json') as string | null) ?? '',
    content_html: (form.get('content_html') as string | null) ?? '',
    word_count: (form.get('word_count') as string | null) ?? '0',
  };
}

export async function createDraftAction(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { status: 'error', message: 'You must be signed in.' };
  if (!hasRole(user, 'author', 'editor', 'admin')) {
    return { status: 'error', message: 'Only authors and above can create articles.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired. Sign in again.' };

  const parsed = createDraftSchema.safeParse(fromFormData(formData));
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const wordCount = parsed.data.word_count ?? 0;
  const result = await insertDraftArticle(
    {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt ?? null,
      content_json: parseContentJson(parsed.data.content_json),
      content_html: parsed.data.content_html ?? null,
      author_id: user.id,
      status: 'draft',
      word_count: wordCount,
      reading_time_min: estimateReadingTime(wordCount),
    },
    accessToken,
  );

  if (result.status === 'error') {
    return { status: 'error', message: result.message };
  }

  revalidatePath('/admin/content/articles');
  redirect(`/admin/content/articles/${result.data.id}/edit?saved=1`);
}

export async function updateDraftAction(
  _prevState: ActionResult<{ id: string }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser();
  if (!user) return { status: 'error', message: 'You must be signed in.' };

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired. Sign in again.' };

  const parsed = updateDraftSchema.safeParse(fromFormData(formData));
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const wordCount = parsed.data.word_count ?? 0;
  const contentJson = parseContentJson(parsed.data.content_json);

  const updateResult = await updateDraftArticle(
    parsed.data.id,
    {
      title: parsed.data.title,
      slug: parsed.data.slug,
      excerpt: parsed.data.excerpt ?? null,
      content_json: contentJson,
      content_html: parsed.data.content_html ?? null,
      word_count: wordCount,
      reading_time_min: estimateReadingTime(wordCount),
    },
    accessToken,
  );

  if (updateResult.status === 'error') {
    return { status: 'error', message: updateResult.message };
  }

  await appendArticleRevision(parsed.data.id, contentJson, user.id, accessToken, 'draft update');

  revalidatePath('/admin/content/articles');
  revalidatePath(`/admin/content/articles/${parsed.data.id}/edit`);
  return { status: 'ok', data: { id: parsed.data.id } };
}
