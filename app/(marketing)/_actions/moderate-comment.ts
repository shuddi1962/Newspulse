'use server';

import { moderateComment } from '@/lib/ai/writer';

export async function moderateCommentAction(comment: string) {
  if (!comment || comment.trim().length === 0) {
    return { verdict: 'spam' as const, reason: 'Empty comment' };
  }

  const result = await moderateComment(comment);

  if (result.status === 'error') {
    return { verdict: 'review' as const, reason: 'AI moderation unavailable — manual review required.' };
  }

  return { verdict: result.verdict, reason: result.reason };
}
