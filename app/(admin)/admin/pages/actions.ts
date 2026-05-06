'use server';

import { createServerInsForge } from '@/lib/insforge/server';
import { revalidatePath } from 'next/cache';

export async function createPage(formData: FormData) {
  const insforge = await createServerInsforge();
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const content_html = formData.get('content_html') as string;
  const status = formData.get('status') as string;

  const { error } = await insforge.from('pages').insert({
    title,
    slug,
    meta_title,
    meta_description,
    content_html,
    status,
  });

  if (error) throw error;
  revalidatePath('/admin/pages');
}

export async function updatePage(id: string, formData: FormData) {
  const insforge = await createServerInsforge();
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const meta_title = formData.get('meta_title') as string;
  const meta_description = formData.get('meta_description') as string;
  const content_html = formData.get('content_html') as string;
  const status = formData.get('status') as string;

  const { error } = await insforge
    .from('pages')
    .update({ title, slug, meta_title, meta_description, content_html, status })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin/pages');
}

export async function deletePage(id: string) {
  const insforge = await createServerInsforge();
  const { error } = await insforge.from('pages').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/pages');
}
