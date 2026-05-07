'use server';

import { createServerInsForge } from '@/lib/insforge/server';
import { revalidatePath } from 'next/cache';

type PageData = {
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  content_html: string;
  status: string;
};

export async function createPage(data: PageData) {
  const insforge = await createServerInsForge();

  const { error } = await insforge.database.from('pages').insert({
    title: data.title,
    slug: data.slug,
    meta_title: data.meta_title,
    meta_description: data.meta_description,
    content_html: data.content_html,
    status: data.status,
  });

  if (error) throw error;
  revalidatePath('/admin/pages');
}

export async function updatePage(id: string, data: PageData) {
  const insforge = await createServerInsForge();

  const { error } = await insforge.database
    .from('pages')
    .update({
      title: data.title,
      slug: data.slug,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      content_html: data.content_html,
      status: data.status,
    })
    .eq('id', id);

  if (error) throw error;
  revalidatePath('/admin/pages');
}

export async function deletePage(id: string) {
  const insforge = await createServerInsForge();
  const { error } = await insforge.database.from('pages').delete().eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/pages');
}
