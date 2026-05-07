import { createServerInsForge } from '@/lib/insforge/server';
import type { Page } from '@/lib/db/types';

export async function getPages() {
  const insforge = await createServerInsForge();
  const { data, error } = await insforge.database
    .from('pages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Page[];
}

export async function getPageBySlug(slug: string) {
  const insforge = await createServerInsForge();
  const { data, error } = await insforge.database
    .from('pages')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data as Page;
}

export async function createPage(page: Partial<Page>) {
  const insforge = await createServerInsForge();
  const { data, error } = await insforge.database
    .from('pages')
    .insert(page)
    .select()
    .single();
  if (error) throw error;
  return data as Page;
}

export async function updatePage(id: string, updates: Partial<Page>) {
  const insforge = await createServerInsForge();
  const { data, error } = await insforge.database
    .from('pages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Page;
}

export async function deletePage(id: string) {
  const insforge = await createServerInsForge();
  const { error } = await insforge.database
    .from('pages')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
