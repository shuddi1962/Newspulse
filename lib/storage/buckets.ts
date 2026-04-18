export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  MEDIA: 'media',
} as const;

export type StorageBucket =
  (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const MEDIA_IMAGE_MAX_BYTES = 8 * 1024 * 1024; // 8 MB

export function isAllowedImageMime(
  value: string | undefined | null,
): value is AllowedImageMimeType {
  if (!value) return false;
  return ALLOWED_IMAGE_MIME_TYPES.includes(value as AllowedImageMimeType);
}

export function extensionForMime(mime: AllowedImageMimeType): string {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
  }
}
