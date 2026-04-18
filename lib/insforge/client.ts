import { createClient } from '@insforge/sdk';
import { env } from '@/lib/env';

export const insforge = createClient({
  baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
  anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
});

export type InsForgeClient = typeof insforge;
