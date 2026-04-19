'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import { ArticleEditor, type ArticleEditorHandle } from '@/components/editor/article-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FieldError } from '@/components/ui/field-error';
import { cn } from '@/lib/utils';
import { slugifyTitle } from '@/lib/validation/article';
import type { ActionResult } from '@/lib/auth/actions';
import { createDraftAction, updateDraftAction } from '../actions';

type Mode = 'create' | 'edit';

export type ArticleFormInitial = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content_json?: JSONContent | null;
};

type Props = {
  mode: Mode;
  initial?: ArticleFormInitial;
  showSavedBanner?: boolean;
};

export function ArticleForm({ mode, initial, showSavedBanner }: Props) {
  const action = mode === 'create' ? createDraftAction : updateDraftAction;
  const [state, formAction, pending] = useActionState<ActionResult<{ id: string }> | null, FormData>(
    action,
    null,
  );
  const [, startTransition] = useTransition();

  const editorHandle = useRef<ArticleEditorHandle>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? '');

  const errorMessage = state?.status === 'error' ? state.message : null;

  function handleTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) {
      setSlug(next ? slugifyTitle(next) : '');
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editorHandle.current) return;
    const json = editorHandle.current.getJSON();
    const html = editorHandle.current.getHTML();
    const words = Math.max(
      0,
      (editorHandle.current.getText() ?? '')
        .split(/\s+/)
        .filter((token) => token.length > 0).length,
    );

    const form = event.currentTarget;
    const jsonField = form.elements.namedItem('content_json') as HTMLInputElement | null;
    const htmlField = form.elements.namedItem('content_html') as HTMLInputElement | null;
    const wordField = form.elements.namedItem('word_count') as HTMLInputElement | null;
    if (jsonField) jsonField.value = JSON.stringify(json);
    if (htmlField) htmlField.value = html;
    if (wordField) wordField.value = String(words);

    const data = new FormData(form);
    startTransition(() => formAction(data));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="content_json" defaultValue="" />
      <input type="hidden" name="content_html" defaultValue="" />
      <input type="hidden" name="word_count" defaultValue="0" />

      {showSavedBanner ? (
        <Alert>
          <CheckCircle2 />
          <div className="space-y-1">
            <AlertTitle>Draft saved</AlertTitle>
            <AlertDescription>Your changes have been stored.</AlertDescription>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="article-title">Title</Label>
            <Input
              id="article-title"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Your headline"
              required
              maxLength={280}
              autoComplete="off"
            />
            <FieldError>{title.length > 280 ? 'Title must be 280 characters or fewer' : null}</FieldError>
          </div>

          <div className="space-y-2">
            <Label htmlFor="article-body">Body</Label>
            <ArticleEditor
              editorRef={editorHandle}
              initialContent={initial?.content_json ?? null}
              className="min-h-[32rem]"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="article-slug">Slug</Label>
            <Input
              id="article-slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="auto-generated-from-title"
              required
              pattern="^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$"
              autoComplete="off"
            />
            <p className="text-xs text-(--fg-subtle)">
              Lowercase letters, numbers, and hyphens. Auto-fills from the title until you edit it.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="article-excerpt">Excerpt</Label>
            <Textarea
              id="article-excerpt"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short summary shown in listings and social shares."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-(--fg-subtle)">{excerpt.length} / 500</p>
          </div>

          <div className="space-y-3">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Saving…' : mode === 'create' ? 'Save draft' : 'Update draft'}
            </Button>
            <Link
              href="/admin/content/articles"
              className={cn(buttonVariants({ variant: 'secondary' }), 'w-full')}
            >
              Cancel
            </Link>
          </div>
        </aside>
      </div>
    </form>
  );
}
