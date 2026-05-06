import { createServerInsForge } from '@/lib/insforge/server';

export async function getSettings() {
  const insforge = await createServerInsForge();
  const { data, error } = await insforge.from('settings').select('*').single();
  if (error) throw error;
  return data;
}

export async function updateSettings(key: string, value: Record<string, unknown>) {
  const insforge = await createServerInsForge();
  const { data, error } = await insforge
    .from('settings')
    .upsert({ key, value })
    .select()
    .single();
  if (error) throw error;
  return data;
}
