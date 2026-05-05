'use client';

import { useState, useTransition } from 'react';
import { useActionState } from 'react';
import { createCommentAction } from '../_actions/comment-actions';

type Props = {
  articleId: string;
};

export function CommentForm({ articleId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(createCommentAction, null);
  const [content, setContent] = useState('');

  const isSubmitting = isPending;
  const charCount = content.length;
  const maxChars = 5000;

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          formAction(formData);
        });
      }}
      className="space-y-4"
    >
      <input type="hidden" name="articleId" value={articleId} />
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts..."
        rows={4}
        maxLength={maxChars}
        required
        className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-4 py-3 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--ocean-blue) focus:outline-none focus:ring-1 focus:ring-(--ocean-blue) disabled:opacity-50"
        disabled={isSubmitting}
        aria-label="Your comment"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-(--fg-subtle)">
          {charCount}/{maxChars} characters
        </span>
        <button
          type="submit"
          disabled={isSubmitting || charCount === 0}
          className="rounded-lg bg-(--ink-black) px-4 py-2 text-sm font-medium text-(--pure-white) transition-colors hover:bg-(--ink-dark) disabled:opacity-50"
        >
          {isSubmitting ? 'Posting...' : 'Post comment'}
        </button>
      </div>
      {state?.status === 'error' && (
        <p className="text-sm text-(--signal-red)" role="alert">
          {state.message}
        </p>
      )}
      {state?.status === 'success' && (
        <p className="text-sm text-(--forest-green)" role="status">
          Comment submitted and awaiting approval.
        </p>
      )}
    </form>
  );
}
