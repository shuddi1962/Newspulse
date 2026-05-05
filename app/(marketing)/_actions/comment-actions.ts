'use server';

import { revalidatePath } from 'next/cache';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createComment } from '@/lib/db/comments';

type ActionState =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string }
  | null;

export async function createCommentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const articleId = formData.get('articleId') as string;
  const content = (formData.get('content') as string)?.trim();

  if (!articleId || !content || content.length < 1) {
    return { status: 'error', message: 'Comment cannot be empty.' };
  }

  if (content.length > 5000) {
    return { status: 'error', message: 'Comment is too long (max 5,000 characters).' };
  }

  const cookies = getAuthCookies();
  if (!cookies?.accessToken) {
    return { status: 'error', message: 'You must be signed in to comment.' };
  }

  const result = await createComment(articleId, content, cookies.accessToken);

  if (result.status === 'error') {
    if (result.message.includes('auth') || result.message.includes('login')) {
      return { status: 'error', message: 'You must be signed in to comment.' };
    }
    return { status: 'error', message: result.message };
  }

  revalidatePath(`/[category]/[slug]`, 'page');
  revalidatePath(`/article/[slug]`, 'page');
  return { status: 'success', message: 'Comment submitted and awaiting approval.' };
}
