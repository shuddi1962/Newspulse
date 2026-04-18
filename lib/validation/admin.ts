import { z } from 'zod';

export const USER_ROLE_VALUES = ['reader', 'author', 'editor', 'admin'] as const;

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid('Invalid user id.'),
  role: z.enum(USER_ROLE_VALUES),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
