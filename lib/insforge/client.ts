import { createClient } from '@insforge/sdk';

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl) {
  throw new Error(
    'NEXT_PUBLIC_INSFORGE_URL is not set. Copy .env.example to .env.local and set the InsForge OSS host.',
  );
}

if (!anonKey) {
  throw new Error(
    'NEXT_PUBLIC_INSFORGE_ANON_KEY is not set. Run `npx @insforge/cli secrets get ANON_KEY` and add it to .env.local.',
  );
}

export const insforge = createClient({ baseUrl, anonKey });

export type InsForgeClient = typeof insforge;
