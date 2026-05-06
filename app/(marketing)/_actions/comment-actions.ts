'use server';

import { revalidatePath } from 'next/cache';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createComment } from '@/lib/db/comments';
import { moderateCommentAction } from './moderate-comment';

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

  const cookies = await getAuthCookies();
  if (!cookies?.accessToken) {
    return { status: 'error', message: 'You must be signed in to comment.' };
  }

  const moderation = await moderateCommentAction(content);
  const status = moderation.verdict === 'safe' ? 'approved' : moderation.verdict === 'spam' || moderation.verdict === 'toxic' ? 'rejected' : 'pending';

  if (moderation.verdict === 'toxic') {
    return { status: 'error', message: 'Your comment contains inappropriate language. Please revise.' };
  }

  const result = await createComment(articleId, content, cookies.accessToken, null, status);

  if (result.status === 'error') {
    if (result.message.includes('auth') || result.message.includes('login')) {
      return { status: 'error', message: 'You must be signed in to comment.' };
    }
    return { status: 'error', message: result.message };
  }

  revalidatePath(`/[category]/[slug]`, 'page');
  revalidatePath(`/article/[slug]`, 'page');

  if (status === 'approved') {
    return { status: 'success', message: 'Comment posted successfully.' };
  }
  return { status: 'success', message: 'Comment submitted and awaiting approval.' };
}
