import { z } from 'zod';

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$/;

export const ARTICLE_STATUSES = [
  'draft',
  'review',
  'approved',
  'scheduled',
  'published',
  'archived',
  'rejected',
] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

const trimmedNonEmpty = z
  .string()
  .trim()
  .min(1, 'This field is required');

export const createDraftSchema = z.object({
  title: trimmedNonEmpty.max(280, 'Title must be 280 characters or fewer'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required')
    .max(122, 'Slug must be 122 characters or fewer')
    .refine((v) => SLUG_REGEX.test(v), 'Use lowercase letters, numbers and hyphens only'),
  excerpt: z
    .string()
    .trim()
    .max(500, 'Excerpt must be 500 characters or fewer')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  content_json: z
    .string()
    .min(1, 'Article body cannot be empty')
    .refine((v) => {
      try {
        const parsed = JSON.parse(v);
        return typeof parsed === 'object' && parsed !== null;
      } catch {
        return false;
      }
    }, 'Article body is not valid editor JSON'),
  content_html: z.string().optional().default(''),
  word_count: z.coerce.number().int().min(0).optional(),
});

export type CreateDraftInput = z.infer<typeof createDraftSchema>;

export const updateDraftSchema = createDraftSchema.extend({
  id: z.string().uuid('Missing article ID'),
});

export type UpdateDraftInput = z.infer<typeof updateDraftSchema>;

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function estimateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 220;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}
