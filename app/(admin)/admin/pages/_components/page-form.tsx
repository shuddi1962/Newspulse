'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { createPage, updatePage } from '../actions';
import type { Page } from '@/lib/db/types';

const initialState: { error?: string; success?: boolean } = {};

export default function PageForm({ page }: { page?: Page }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      const title = formData.get('title') as string;
      const slug = formData.get('slug') as string;
      const meta_title = formData.get('meta_title') as string;
      const meta_description = formData.get('meta_description') as string;
      const content_html = formData.get('content_html') as string;
      const status = formData.get('status') as string;

      if (!title || !slug) {
        return { error: 'Title and slug are required' };
      }

      try {
        if (page?.id) {
          await updatePage(page.id, { title, slug, meta_title, meta_description, content_html, status });
        } else {
          await createPage({ title, slug, meta_title, meta_description, content_html, status });
        }
        router.push('/admin/pages');
        return { success: true };
      } catch {
        return { error: 'Failed to save page' };
      }
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={page?.title}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            required
            defaultValue={page?.slug}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="content_html" className="block text-sm font-medium text-gray-700">
          Content (HTML)
        </label>
        <textarea
          id="content_html"
          name="content_html"
          rows={10}
          defaultValue={page?.content_html || ''}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700">
            Meta Title
          </label>
          <input
            id="meta_title"
            name="meta_title"
            type="text"
            defaultValue={page?.meta_title || ''}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={page?.status || 'published'}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700">
          Meta Description
        </label>
        <textarea
          id="meta_description"
          name="meta_description"
          rows={3}
          defaultValue={page?.meta_description || ''}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-ink-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-black/90 disabled:opacity-50"
        >
          {pending ? 'Saving...' : 'Save Page'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
