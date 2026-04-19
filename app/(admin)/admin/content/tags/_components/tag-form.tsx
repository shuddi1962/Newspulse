'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { slugifyName } from '@/lib/validation/taxonomy';
import type { ActionResult } from '@/lib/auth/actions';
import type { TagRow } from '@/lib/db/tags';
import { saveTagAction } from '../actions';

type Props = {
  mode: 'create' | 'edit';
  initial?: Partial<TagRow>;
};

export function TagForm({ mode, initial }: Props) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(saveTagAction, null);
  const [, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  function handleNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(next ? slugifyName(next) : '');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(() => {
      formAction(data);
      if (mode === 'create') {
        form.reset();
        setName('');
        setSlug('');
        setSlugTouched(false);
      }
    });
  }

  const errorMessage = state?.status === 'error' ? state.message : null;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state?.status === 'ok' && mode === 'create' ? (
        <Alert>
          <CheckCircle2 />
          <div className="space-y-1">
            <AlertTitle>Tag created</AlertTitle>
            <AlertDescription>Ready for another one.</AlertDescription>
          </div>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not save</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[1fr_1fr_8rem_auto]">
        <div className="space-y-1">
          <Label htmlFor="tag-name">Name</Label>
          <Input
            id="tag-name"
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Election 2026"
            required
            maxLength={50}
            autoComplete="off"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tag-slug">Slug</Label>
          <Input
            id="tag-slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="election-2026"
            required
            pattern="^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$"
            autoComplete="off"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tag-color">Color</Label>
          <Input
            id="tag-color"
            name="color"
            defaultValue={initial?.color ?? ''}
            placeholder="#336699"
            pattern="^#[0-9a-fA-F]{6}$"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full md:w-auto">
            {pending ? 'Saving…' : mode === 'create' ? 'Add tag' : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  );
}
