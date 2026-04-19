'use client';

import { useActionState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ActionResult } from '@/lib/auth/actions';
import { updateMediaAltAction } from '../actions';

type Props = {
  id: string;
  initialAlt: string;
};

export function AltEditForm({ id, initialAlt }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(updateMediaAltAction, null);
  const [, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <Input
        name="alt_text"
        defaultValue={initialAlt}
        placeholder="Alt text"
        maxLength={500}
        className="h-8 text-xs"
      />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? '…' : state?.status === 'ok' ? 'Saved' : 'Save'}
      </Button>
    </form>
  );
}
