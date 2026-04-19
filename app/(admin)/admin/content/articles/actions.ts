'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, hasRole } from '@/lib/auth/session';
import {
  allowedActionsFor,
  createDraftSchema,
  estimateReadingTime,
  targetStatusFor,
  updateDraftSchema,
  type ArticleStatus,
  type WorkflowAction,
  type WorkflowRole,
} from '@/lib/validation/article';
import {
  appendArticleRevision,
  getArticleById,
  insertDraftArticle,
  setArticleStatus,
  updateDraftArticle,
} from '@/lib/db/articles';
import type { ActionResult } from '@/lib/auth/actions';
import type { UserRole } from '@/lib/db/types';

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

const WORKFLOW_ACTIONS: readonly WorkflowAction[] = [
  'submit',
  'recall',
  'approve',
  'reject',
  'schedule',
  'unschedule',
  'publish',
  'unpublish',
  'archive',
  'restore',
];

function workflowRoleFor(role: UserRole): WorkflowRole | null {
  if (role === 'admin' || role === 'editor') return 'editor';
  if (role === 'author') return 'author';
  return null;
}

function isWorkflowAction(value: string): value is WorkflowAction {
  return (WORKFLOW_ACTIONS as readonly string[]).includes(value);
}

function parsePublishAt(value: string | null): string | null {
  if (!value) return null;
  const ts = new Date(value);
  if (Number.isNaN(ts.getTime())) return null;
  return ts.toISOString();
}

export async function transitionArticleAction(
  _prevState: ActionResult<{ id: string; status: ArticleStatus }> | null,
  formData: FormData,
): Promise<ActionResult<{ id: string; status: ArticleStatus }>> {
  const id = (formData.get('id') as string | null) ?? '';
  const actionRaw = (formData.get('action') as string | null) ?? '';
  const publishAtRaw = (formData.get('publish_at') as string | null) ?? '';

  if (!id) return { status: 'error', message: 'Missing article ID.' };
  if (!isWorkflowAction(actionRaw)) {
    return { status: 'error', message: 'Unknown workflow action.' };
  }

  const user = await getCurrentUser();
  if (!user) return { status: 'error', message: 'You must be signed in.' };
  if (!hasRole(user, 'author', 'editor', 'admin')) {
    return { status: 'error', message: 'You do not have permission for this action.' };
  }

  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired. Sign in again.' };

  const article = await getArticleById(id, accessToken);
  if (!article) return { status: 'error', message: 'Article not found.' };

  const workflowRole = workflowRoleFor(user.role);
  if (!workflowRole) {
    return { status: 'error', message: 'You do not have permission for this action.' };
  }

  const isOwn = article.author_id === user.id;
  const allowed = allowedActionsFor(workflowRole, article.status, isOwn);
  if (!allowed.includes(actionRaw)) {
    return {
      status: 'error',
      message: `Cannot ${actionRaw} an article in status "${article.status}".`,
    };
  }

  const target = targetStatusFor(actionRaw);

  let publishAt: string | null | undefined = undefined;
  if (actionRaw === 'schedule') {
    const iso = parsePublishAt(publishAtRaw);
    if (!iso) return { status: 'error', message: 'Provide a valid publish date/time.' };
    if (new Date(iso).getTime() <= Date.now()) {
      return { status: 'error', message: 'Publish date must be in the future.' };
    }
    publishAt = iso;
  } else if (actionRaw === 'publish') {
    publishAt = new Date().toISOString();
  } else if (actionRaw === 'unschedule') {
    publishAt = null;
  }

  const result = await setArticleStatus(
    id,
    publishAt === undefined ? { status: target } : { status: target, publish_at: publishAt },
    accessToken,
  );
  if (result.status === 'error') {
    return { status: 'error', message: result.message };
  }

  await appendArticleRevision(
    id,
    article.content_json,
    user.id,
    accessToken,
    `status → ${target} (${actionRaw})`,
  );

  revalidatePath('/admin/content/articles');
  revalidatePath(`/admin/content/articles/${id}/edit`);
  return { status: 'ok', data: { id, status: target } };
}
