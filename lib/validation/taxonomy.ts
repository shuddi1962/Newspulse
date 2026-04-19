import { z } from 'zod';

export const CATEGORY_KINDS = [
  'news',
  'directory',
  'jobs',
  'marketplace',
  'events',
  'real_estate',
  'classifieds',
] as const;
export type CategoryKind = (typeof CATEGORY_KINDS)[number];

const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;
const LANG_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/;

const trimmed = z.string().trim();

const optionalString = (max: number) =>
  trimmed
    .max(max, `Must be ${max} characters or fewer`)
    .optional()
    .or(z.literal('').transform(() => undefined));

export const categorySchema = z.object({
  id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  kind: z.enum(CATEGORY_KINDS),
  slug: trimmed
    .min(1, 'Slug is required')
    .max(64, 'Slug must be 64 characters or fewer')
    .refine((v) => SLUG_REGEX.test(v), 'Lowercase letters, numbers, hyphens only'),
  name: trimmed.min(1, 'Name is required').max(80, 'Name must be 80 characters or fewer'),
  description: optionalString(500),
  parent_id: z
    .string()
    .uuid('Invalid parent category')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  sort_order: z.coerce.number().int().min(0).max(9999).default(0),
  icon: optionalString(64),
  color: optionalString(7).refine(
    (v) => v === undefined || COLOR_REGEX.test(v),
    'Color must be a hex value like #336699',
  ),
  language: trimmed
    .min(2, 'Language is required')
    .max(5)
    .refine((v) => LANG_REGEX.test(v), 'Use BCP-47 like "en" or "en-US"')
    .default('en'),
  seo_title: optionalString(120),
  seo_description: optionalString(300),
  is_active: z.coerce.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export const tagSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('').transform(() => undefined)),
  slug: trimmed
    .min(1, 'Slug is required')
    .max(64, 'Slug must be 64 characters or fewer')
    .refine((v) => SLUG_REGEX.test(v), 'Lowercase letters, numbers, hyphens only'),
  name: trimmed.min(1, 'Name is required').max(50, 'Name must be 50 characters or fewer'),
  color: optionalString(7).refine(
    (v) => v === undefined || COLOR_REGEX.test(v),
    'Color must be a hex value like #336699',
  ),
});

export type TagInput = z.infer<typeof tagSchema>;
