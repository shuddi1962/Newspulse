'use client';

import Image from 'next/image';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadAvatarAction } from '@/lib/auth/profile-actions';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  AVATAR_MAX_BYTES,
} from '@/lib/storage/buckets';

interface AvatarUploaderProps {
  currentUrl: string | null;
  displayName: string;
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function AvatarUploader({ currentUrl, displayName }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(currentUrl);
  const [isPending, startTransition] = useTransition();

  const onPick = () => inputRef.current?.click();

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
      toast.error('Only JPEG, PNG, WebP, or GIF images are allowed.');
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error('File is too large. Max size is 2 MB.');
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    const formData = new FormData();
    formData.append('file', file);

    startTransition(async () => {
      const result = await uploadAvatarAction(formData);
      URL.revokeObjectURL(localPreview);

      if (result.status === 'error') {
        setPreview(currentUrl);
        toast.error(result.message);
        return;
      }

      setPreview(result.data?.url ?? currentUrl);
      toast.success('Avatar updated.');
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-20 w-20 overflow-hidden border border-(--border-subtle) bg-(--bg-muted)">
        {preview ? (
          <Image
            src={preview}
            alt={`${displayName} avatar`}
            fill
            sizes="80px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-lg font-semibold text-(--fg-muted)">
            {initialsOf(displayName) || 'NP'}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Button type="button" variant="secondary" size="sm" onClick={onPick} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload photo
            </>
          )}
        </Button>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          JPEG · PNG · WebP · GIF · max 2 MB
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_MIME_TYPES.join(',')}
        className="sr-only"
        onChange={onChange}
      />
    </div>
  );
}
