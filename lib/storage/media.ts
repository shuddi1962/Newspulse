import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type { MediaAsset } from '@/lib/db/types';
import {
  extensionForMime,
  isAllowedImageMime,
  type AllowedImageMimeType,
  type StorageBucket,
} from '@/lib/storage/buckets';

export type UploadImageInput = {
  file: File;
  bucket: StorageBucket;
  keyPrefix: string;
  uploaderId: string;
  accessToken: string;
  maxBytes: number;
  altText?: string | null;
};

export type UploadImageResult = {
  asset: MediaAsset;
  url: string;
  key: string;
};

export type UploadImageError = { message: string };

export async function uploadImageAndTrack(
  input: UploadImageInput,
): Promise<
  | { status: 'ok'; data: UploadImageResult }
  | { status: 'error'; error: UploadImageError }
> {
  const { file, bucket, keyPrefix, uploaderId, accessToken, maxBytes, altText } = input;

  if (file.size <= 0) {
    return { status: 'error', error: { message: 'The uploaded file is empty.' } };
  }
  if (file.size > maxBytes) {
    const limitMb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10;
    return {
      status: 'error',
      error: { message: `File is too large. Max size is ${limitMb} MB.` },
    };
  }
  if (!isAllowedImageMime(file.type)) {
    return {
      status: 'error',
      error: { message: 'Only JPEG, PNG, WebP, or GIF images are allowed.' },
    };
  }

  const mime = file.type as AllowedImageMimeType;
  const ext = extensionForMime(mime);
  const key = `${keyPrefix.replace(/^\/+|\/+$/g, '')}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const insforge = createServerInsForge(accessToken);
  const uploadRes = await insforge.storage.from(bucket).upload(key, file);
  if (uploadRes.error || !uploadRes.data) {
    return {
      status: 'error',
      error: { message: uploadRes.error?.message ?? 'Upload failed.' },
    };
  }

  const publicUrl = insforge.storage.from(bucket).getPublicUrl(key);

  const { data: assetRow, error: insertError } = await insforge.database
    .from('media_assets')
    .insert({
      uploader_id: uploaderId,
      bucket,
      object_key: key,
      url: publicUrl,
      mime_type: mime,
      size_bytes: file.size,
      alt_text: altText ?? null,
    })
    .select('*')
    .single();

  if (insertError || !assetRow) {
    await insforge.storage.from(bucket).remove(key);
    return {
      status: 'error',
      error: {
        message: insertError?.message ?? 'Could not record uploaded asset.',
      },
    };
  }

  return {
    status: 'ok',
    data: { asset: assetRow as MediaAsset, url: publicUrl, key },
  };
}

export async function removeStorageObject(
  bucket: StorageBucket,
  key: string,
  accessToken?: string,
): Promise<void> {
  const insforge = createServerInsForge(accessToken);
  await insforge.storage.from(bucket).remove(key);
}
