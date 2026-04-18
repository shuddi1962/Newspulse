import 'server-only';
import { createClient } from '@insforge/sdk';
import { env } from '@/lib/env';

export function createServerInsForge(accessToken?: string) {
  return createClient({
    baseUrl: env.NEXT_PUBLIC_INSFORGE_URL,
    anonKey: env.NEXT_PUBLIC_INSFORGE_ANON_KEY,
    isServerMode: true,
    edgeFunctionToken: accessToken,
  });
}

export type ServerInsForge = ReturnType<typeof createServerInsForge>;
