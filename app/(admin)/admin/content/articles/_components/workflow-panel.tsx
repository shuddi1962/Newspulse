'use client';

import { useActionState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  allowedActionsFor,
  type ArticleStatus,
  type WorkflowAction,
  type WorkflowRole,
} from '@/lib/validation/article';
import type { ActionResult } from '@/lib/auth/actions';
import { transitionArticleAction } from '../actions';

type Props = {
  articleId: string;
  currentStatus: ArticleStatus;
  workflowRole: WorkflowRole;
  isOwnArticle: boolean;
  currentPublishAt: string | null;
};

const ACTION_LABELS: Record<WorkflowAction, { label: string; variant: 'primary' | 'secondary' | 'destructive' }> = {
  submit: { label: 'Submit for review', variant: 'primary' },
  recall: { label: 'Recall to draft', variant: 'secondary' },
  approve: { label: 'Approve', variant: 'primary' },
  reject: { label: 'Reject', variant: 'destructive' },
  schedule: { label: 'Schedule', variant: 'primary' },
  unschedule: { label: 'Unschedule', variant: 'secondary' },
  publish: { label: 'Publish now', variant: 'primary' },
  unpublish: { label: 'Unpublish (archive)', variant: 'destructive' },
  archive: { label: 'Archive', variant: 'destructive' },
  restore: { label: 'Restore to draft', variant: 'secondary' },
};

const STATUS_VARIANT: Record<ArticleStatus, 'neutral' | 'warning' | 'outline' | 'solid' | 'destructive'> = {
  draft: 'neutral',
  review: 'warning',
  approved: 'outline',
  scheduled: 'outline',
  published: 'solid',
  archived: 'neutral',
  rejected: 'destructive',
};

function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function WorkflowPanel({
  articleId,
  currentStatus,
  workflowRole,
  isOwnArticle,
  currentPublishAt,
}: Props) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string; status: ArticleStatus }> | null,
    FormData
  >(transitionArticleAction, null);
  const [, startTransition] = useTransition();

  const actions = allowedActionsFor(workflowRole, currentStatus, isOwnArticle);

  function runAction(action: WorkflowAction, publishAt?: string) {
    const data = new FormData();
    data.set('id', articleId);
    data.set('action', action);
    if (publishAt) data.set('publish_at', publishAt);
    startTransition(() => formAction(data));
  }

  function handleSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('publish_at') as HTMLInputElement | null;
    if (!input?.value) return;
    runAction('schedule', new Date(input.value).toISOString());
  }

  const ok = state?.status === 'ok';
  const errorMessage = state?.status === 'error' ? state.message : null;
  const canSchedule = actions.includes('schedule');

  return (
    <aside className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5 space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Workflow
          </p>
          <div className="mt-1 flex items-center gap-2 text-sm text-(--fg-muted)">
            Current status
            <Badge variant={STATUS_VARIANT[currentStatus]}>{currentStatus}</Badge>
          </div>
          {currentPublishAt ? (
            <p className="mt-1 text-xs text-(--fg-subtle)">
              Publish time: {new Date(currentPublishAt).toLocaleString()}
            </p>
          ) : null}
        </div>
      </header>

      {ok ? (
        <Alert>
          <CheckCircle2 />
          <div className="space-y-1">
            <AlertTitle>Status updated</AlertTitle>
            <AlertDescription>Article is now {state?.data?.status}.</AlertDescription>
          </div>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not update</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      {actions.length === 0 ? (
        <p className="text-sm text-(--fg-muted)">
          No workflow actions available from this status for your role.
        </p>
      ) : (
        <div className="space-y-2">
          {actions
            .filter((action) => action !== 'schedule')
            .map((action) => {
              const cfg = ACTION_LABELS[action];
              return (
                <Button
                  key={action}
                  variant={cfg.variant}
                  disabled={pending}
                  onClick={() => runAction(action)}
                  className="w-full"
                >
                  {cfg.label}
                </Button>
              );
            })}
        </div>
      )}

      {canSchedule ? (
        <form onSubmit={handleSchedule} className="space-y-2 border-t border-(--border-subtle) pt-4">
          <Label htmlFor="workflow-publish-at">Schedule publish time</Label>
          <Input
            id="workflow-publish-at"
            name="publish_at"
            type="datetime-local"
            defaultValue={toLocalInputValue(currentPublishAt)}
            required
          />
          <Button type="submit" disabled={pending} className="w-full">
            {ACTION_LABELS.schedule.label}
          </Button>
          <p className="text-xs text-(--fg-subtle)">
            Article enters the publish queue; the scheduler edge function flips it to published at the chosen time.
          </p>
        </form>
      ) : null}
    </aside>
  );
}
