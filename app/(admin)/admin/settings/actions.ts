'use server';

import { createServerInsForge } from '@/lib/insforge/server';
import { revalidatePath } from 'next/cache';

export async function updateSettings(key: string, value: Record<string, unknown>) {
  const insforge = await createServerInsForge();
  const { error } = await insforge
    .database.from('settings')
    .upsert({ key, value });
  if (error) throw error;
  revalidatePath('/admin/settings');
}
