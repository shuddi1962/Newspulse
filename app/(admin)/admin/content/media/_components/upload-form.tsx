'use client';

import { useActionState, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ActionResult } from '@/lib/auth/actions';
import { uploadMediaAction } from '../actions';

export function UploadForm() {
  const [state, formAction, pending] = useActionState<
    ActionResult<{ id: string; url: string }> | null,
    FormData
  >(uploadMediaAction, null);
  const [, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setPreview(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(() => {
      formAction(data);
      form.reset();
      setPreview(null);
      setFileName(null);
    });
  }

  const errorMessage = state?.status === 'error' ? state.message : null;

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5 space-y-4"
      noValidate
    >
      <header>
        <h2 className="font-display text-lg font-semibold text-(--fg-default)">
          Upload image
        </h2>
        <p className="mt-1 text-sm text-(--fg-muted)">
          JPEG, PNG, WebP, or GIF · max 8 MB · stored in the <code>media</code> bucket.
        </p>
      </header>

      {state?.status === 'ok' ? (
        <Alert>
          <CheckCircle2 />
          <div className="space-y-1">
            <AlertTitle>Uploaded</AlertTitle>
            <AlertDescription>Added to the library below.</AlertDescription>
          </div>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive" role="alert">
          <AlertTriangle />
          <div className="space-y-1">
            <AlertTitle>Could not upload</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </div>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-[10rem_1fr]">
        <div
          className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-(--border-default) bg-(--bg-muted)"
          aria-live="polite"
        >
          {preview ? (
            <Image
              src={preview}
              alt="Pending upload preview"
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <Upload className="h-6 w-6 text-(--fg-subtle)" aria-hidden />
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="media-file">File</Label>
            <Input
              id="media-file"
              ref={fileInputRef}
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              required
            />
            {fileName ? (
              <p className="text-xs text-(--fg-subtle)">Selected: {fileName}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <Label htmlFor="media-alt">Alt text (optional, recommended)</Label>
            <Input
              id="media-alt"
              name="alt_text"
              placeholder="Short description for accessibility"
              maxLength={500}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? 'Uploading…' : 'Upload to library'}
          </Button>
        </div>
      </div>
    </form>
  );
}
