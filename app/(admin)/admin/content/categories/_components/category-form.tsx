'use client';

import { useActionState, useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button, buttonVariants } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  CATEGORY_KINDS,
  slugifyName,
  type CategoryKind,
} from '@/lib/validation/taxonomy';
import type { ActionResult } from '@/lib/auth/actions';
import type { CategoryRow } from '@/lib/db/categories';
import { saveCategoryAction } from '../actions';

type Props = {
  mode: 'create' | 'edit';
  initial?: Partial<CategoryRow>;
  parentOptions: { id: string; name: string; kind: CategoryKind }[];
  showSavedBanner?: boolean;
  defaultKind?: CategoryKind;
};

export function CategoryForm({
  mode,
  initial,
  parentOptions,
  showSavedBanner,
  defaultKind,
}: Props) {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string }> | null,
    FormData
  >(saveCategoryAction, null);
  const [, startTransition] = useTransition();

  const [kind, setKind] = useState<CategoryKind>(
    (initial?.kind as CategoryKind | undefined) ?? defaultKind ?? 'news',
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  function handleNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(next ? slugifyName(next) : '');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  const errorMessage = state?.status === 'error' ? state.message : null;
  const parentsOfSameKind = parentOptions.filter((p) => p.kind === kind && p.id !== initial?.id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {showSavedBanner ? (
        <Alert>
          <CheckCircle2 />
          <div className="space-y-1">
            <AlertTitle>Saved</AlertTitle>
            <AlertDescription>Category has been stored.</AlertDescription>
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cat-kind">Kind</Label>
          <select
            id="cat-kind"
            name="kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as CategoryKind)}
            required
            className="h-10 w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 text-sm"
          >
            {CATEGORY_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <p className="text-xs text-(--fg-subtle)">
            Each kind has its own slug namespace across the platform.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-name">Name</Label>
          <Input
            id="cat-name"
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Politics"
            required
            maxLength={80}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-slug">Slug</Label>
          <Input
            id="cat-slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="politics"
            required
            pattern="^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$"
            autoComplete="off"
          />
          <p className="text-xs text-(--fg-subtle)">
            Lowercase, numbers, hyphens. Auto-generated until you edit it.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-parent">Parent category</Label>
          <select
            id="cat-parent"
            name="parent_id"
            defaultValue={initial?.parent_id ?? ''}
            className="h-10 w-full rounded-md border border-(--border-default) bg-(--bg-surface) px-3 text-sm"
          >
            <option value="">— top-level —</option>
            {parentsOfSameKind.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-sort">Sort order</Label>
          <Input
            id="cat-sort"
            name="sort_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={initial?.sort_order ?? 0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-language">Language</Label>
          <Input
            id="cat-language"
            name="language"
            defaultValue={initial?.language ?? 'en'}
            pattern="^[a-z]{2}(-[A-Z]{2})?$"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-icon">Icon (lucide-react name)</Label>
          <Input
            id="cat-icon"
            name="icon"
            defaultValue={initial?.icon ?? ''}
            placeholder="e.g. Newspaper"
            maxLength={64}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-color">Color</Label>
          <Input
            id="cat-color"
            name="color"
            defaultValue={initial?.color ?? ''}
            placeholder="#336699"
            pattern="^#[0-9a-fA-F]{6}$"
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label htmlFor="cat-description">Description</Label>
          <Textarea
            id="cat-description"
            name="description"
            defaultValue={initial?.description ?? ''}
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-seo-title">SEO title</Label>
          <Input
            id="cat-seo-title"
            name="seo_title"
            defaultValue={initial?.seo_title ?? ''}
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cat-seo-desc">SEO description</Label>
          <Input
            id="cat-seo-desc"
            name="seo_description"
            defaultValue={initial?.seo_description ?? ''}
            maxLength={300}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="cat-active"
            name="is_active"
            defaultChecked={initial?.is_active ?? true}
            className="h-4 w-4"
          />
          <Label htmlFor="cat-active" className="text-sm font-normal">
            Active (visible on public pages)
          </Label>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : mode === 'create' ? 'Create category' : 'Save changes'}
        </Button>
        <Link
          href="/admin/content/categories"
          className={cn(buttonVariants({ variant: 'secondary' }))}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
