import { format } from 'date-fns';
import type { PublicComment } from '@/lib/db/comments';
import { cn } from '@/lib/utils';

type Props = {
  comments: PublicComment[];
};

export function CommentList({ comments }: Props) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-(--fg-muted)">
        No comments yet. Be the first to share your thoughts.
      </p>
    );
  }

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  return (
    <div className="space-y-6">
      {topLevel.map((comment) => {
        const commentReplies = replies.filter((r) => r.parent_id === comment.id);
        return (
          <CommentThread
            key={comment.id}
            comment={comment}
            replies={commentReplies}
          />
        );
      })}
    </div>
  );
}

function CommentThread({
  comment,
  replies,
}: {
  comment: PublicComment;
  replies: PublicComment[];
}) {
  return (
    <div className="border-b border-(--border-subtle) pb-6">
      <CommentItem comment={comment} />
      {replies.length > 0 && (
        <div className="ml-8 mt-4 space-y-4 border-l-2 border-(--border-subtle) pl-4">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  isReply = false,
}: {
  comment: PublicComment;
  isReply?: boolean;
}) {
  const date = format(new Date(comment.created_at), 'MMM d, yyyy');

  return (
    <div className={cn(isReply && 'text-sm')}>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm font-medium text-(--fg-default)">
          {comment.author_display_name ?? 'Anonymous'}
        </span>
        <time dateTime={comment.created_at} className="text-xs text-(--fg-subtle)">
          {date}
        </time>
      </div>
      <p className="whitespace-pre-wrap text-(--fg-muted)">{comment.content}</p>
    </div>
  );
}
