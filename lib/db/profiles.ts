import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type { Profile } from '@/lib/db/types';

export async function getProfileById(
  userId: string,
  accessToken?: string,
): Promise<Profile | null> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
}
