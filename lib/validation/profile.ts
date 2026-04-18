import { z } from 'zod';

export const updateProfileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, 'Display name is required.')
    .max(80, 'Display name must be 80 characters or fewer.'),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .max(32, 'Username must be 32 characters or fewer.')
    .refine(
      (value) => value === '' || /^[a-z0-9_]{3,32}$/.test(value),
      'Username must be 3–32 characters using a–z, 0–9, or underscore.',
    ),
  bio: z
    .string()
    .trim()
    .max(500, 'Bio must be 500 characters or fewer.'),
  website_url: z
    .string()
    .trim()
    .max(200, 'Website URL is too long.')
    .refine(
      (value) => {
        if (value === '') return true;
        try {
          const parsed = new URL(value);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      'Website must be a valid http(s) URL.',
    ),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
