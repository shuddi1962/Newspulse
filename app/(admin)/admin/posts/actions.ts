'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createServerInsForge } from '@/lib/insforge/server';
import { estimateReadingTime } from '@/lib/validation/article';
import type { ActionResult } from '@/lib/auth/actions';

const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(280),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(122)
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$/, 'Use lowercase letters, numbers and hyphens'),
  content: z.string().optional(),
  featured_image: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  publish_at: z.string().optional(),
  is_breaking: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  category_id: z.string().optional(),
  tags: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  focus_keyword: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  excerpt: z.string().optional(),
});

export type PostFormData = z.infer<typeof postFormSchema>;

function fill(data: PostFormData): Record<string, unknown> {
  const wordCount = data.content
    ? data.content.split(/\s+/).filter(Boolean).length
    : 0;
  const tagArray = data.tags
    ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];
  return {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? null,
    content_html: data.content ?? null,
    content_json: data.content ? { type: 'doc', content: [] } : null,
    featured_image: data.featured_image ?? null,
    status: data.status ?? 'draft',
    publish_at: data.publish_at ?? null,
    is_breaking: data.is_breaking ?? false,
    is_featured: data.is_featured ?? false,
    category_id: data.category_id ?? null,
    tags: tagArray,
    seo_title: data.seo_title ?? null,
    seo_description: data.seo_description ?? null,
    focus_keyword: data.focus_keyword ?? null,
    og_title: data.og_title ?? null,
    og_description: data.og_description ?? null,
    og_image: data.og_image ?? null,
    word_count: wordCount,
    reading_time_min: estimateReadingTime(wordCount),
  };
}

export async function createPostAction(
  data: PostFormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const parsed = postFormSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const insforge = createServerInsForge(accessToken);
  const insertData = {
    ...fill(parsed.data),
    author_id: user.id,
  };

  const { data: result, error } = await insforge.database
    .from('articles')
    .insert(insertData)
    .select('id')
    .single();

  if (error || !result) {
    return { status: 'error', message: error?.message ?? 'Could not create post.' };
  }

  revalidatePath('/admin/posts');
  return { status: 'ok', data: { id: (result as { id: string }).id } };
}

export async function updatePostAction(
  id: string,
  data: PostFormData,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const parsed = postFormSchema.safeParse(data);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid input.' };
  }

  const insforge = createServerInsForge(accessToken);
  const updateData = fill(parsed.data);

  const { error } = await insforge.database
    .from('articles')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not update post.' };
  }

  revalidatePath('/admin/posts');
  revalidatePath(`/admin/posts/edit/${id}`);
  return { status: 'ok', data: { id } };
}

export async function deletePostsAction(ids: string[]): Promise<ActionResult> {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();
  if (!accessToken) return { status: 'error', message: 'Session expired.' };

  const insforge = createServerInsForge(accessToken);

  for (const id of ids) {
    const { error } = await insforge.database.from('articles').delete().eq('id', id);
    if (error) {
      return { status: 'error', message: error.message ?? 'Could not delete post.' };
    }
  }

  revalidatePath('/admin/posts');
  return { status: 'ok' };
}
