'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ImagePlus, Tag, Eye, Settings, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { slugifyTitle } from '@/lib/validation/article';
import { createPostAction, updatePostAction, type PostFormData } from '../actions';

const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(280),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(122)
    .regex(/^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$/, 'Use lowercase letters, numbers and hyphens'),
  content: z.string().optional(),
  featured_image: z.string().optional(),
  status: z.enum(['draft', 'published', 'scheduled']),
  publish_at: z.string().optional(),
  is_breaking: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  category_id: z.string().optional(),
  tags: z.string().optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  focus_keyword: z.string().optional(),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  og_image: z.string().optional(),
  excerpt: z.string().optional(),
});

type FormValues = z.input<typeof postFormSchema>;

interface PostFormProps {
  mode: 'create' | 'edit';
  initial?: Partial<FormValues> & { id?: string };
  categories: { id: string; name: string }[];
}

export function PostForm({ mode, initial, categories }: PostFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!initial?.slug);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      featured_image: '',
      status: 'draft',
      publish_at: '',
      is_breaking: false,
      is_featured: false,
      category_id: '',
      tags: '',
      seo_title: '',
      seo_description: '',
      focus_keyword: '',
      og_title: '',
      og_description: '',
      og_image: '',
      excerpt: '',
      ...initial,
    },
  });

  const seoTitleLength = watch('seo_title')?.length ?? 0;
  const seoDescLength = watch('seo_description')?.length ?? 0;
  const excerptLength = watch('excerpt')?.length ?? 0;

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setValue('title', val, { shouldValidate: true });
      if (!slugTouched) {
        setValue('slug', val ? slugifyTitle(val) : '', { shouldValidate: true });
      }
    },
    [slugTouched, setValue],
  );

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setSubmitting(true);
      try {
        if (data.status === 'scheduled' && !data.publish_at) {
          toast.error('Set a publish date for scheduled posts.');
          setSubmitting(false);
          return;
        }

        const payload: PostFormData = {
          title: data.title,
          slug: data.slug,
          content: data.content ?? '',
          featured_image: data.featured_image ?? '',
          status: data.status ?? 'draft',
          publish_at: data.publish_at ?? '',
          is_breaking: data.is_breaking ?? false,
          is_featured: data.is_featured ?? false,
          category_id: data.category_id ?? '',
          tags: data.tags ?? '',
          seo_title: data.seo_title ?? '',
          seo_description: data.seo_description ?? '',
          focus_keyword: data.focus_keyword ?? '',
          og_title: data.og_title ?? '',
          og_description: data.og_description ?? '',
          og_image: data.og_image ?? '',
          excerpt: data.excerpt ?? '',
        };

        if (mode === 'create') {
          const result = await createPostAction(payload);
          if (result.status === 'error') {
            toast.error(result.message);
          } else {
            toast.success('Post created.');
            router.push(`/admin/posts/edit/${result.data!.id}`);
          }
        } else {
          if (!initial?.id) {
            toast.error('Missing post ID.');
            setSubmitting(false);
            return;
          }
          const result = await updatePostAction(initial.id, payload);
          if (result.status === 'error') {
            toast.error(result.message);
          } else {
            toast.success('Post updated.');
            router.refresh();
          }
        }
      } catch {
        toast.error('An unexpected error occurred.');
      } finally {
        setSubmitting(false);
      }
    },
    [mode, initial?.id, router],
  );

  const isPublishing = watch('status') !== 'draft';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-[var(--color-admin-text)]"
            >
              Post Title
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              onChange={handleTitleChange}
              placeholder="Enter your post title"
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-lg font-medium text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
            <label
              htmlFor="slug"
              className="mb-2 block text-sm font-medium text-[var(--color-admin-text)]"
            >
              Slug
            </label>
            <input
              id="slug"
              type="text"
              {...register('slug')}
              onChange={(e) => {
                setValue('slug', e.target.value, { shouldValidate: true });
                setSlugTouched(true);
              }}
              placeholder="auto-generated-from-title"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
            />
            {errors.slug && (
              <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>
            )}
            <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">
              Lowercase letters, numbers, and hyphens. Auto-fills from the title until edited.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
            <label className="mb-2 block text-sm font-medium text-[var(--color-admin-text)]">
              Featured Image
            </label>
            <div className="flex items-center gap-4">
              <div className="flex h-32 w-48 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400">
                {watch('featured_image') ? (
                  <img
                    src={watch('featured_image')}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs">Upload image</span>
                  </div>
                )}
              </div>
              <input
                type="text"
                {...register('featured_image')}
                placeholder="Paste image URL or upload"
                className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
            <label
              htmlFor="content"
              className="mb-2 block text-sm font-medium text-[var(--color-admin-text)]"
            >
              Content
            </label>
            <textarea
              id="content"
              rows={20}
              {...register('content')}
              placeholder="Write your post content here... (Rich text editor coming soon — plain text for now)"
              className="w-full rounded-md border border-gray-200 px-4 py-3 font-mono text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">
              TipTap rich editor integration will replace this textarea in a future update.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
            <label
              htmlFor="excerpt"
              className="mb-2 block text-sm font-medium text-[var(--color-admin-text)]"
            >
              Excerpt
            </label>
            <textarea
              id="excerpt"
              rows={3}
              {...register('excerpt')}
              placeholder="Short summary for listings and social shares."
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">
              {excerptLength} / 500 characters
            </p>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-admin-text)]">
              <Settings className="h-4 w-4" />
              Publish
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="status"
                  className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]"
                >
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] focus:border-[var(--color-crimson)] focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {watch('status') === 'scheduled' && (
                <div>
                  <label
                    htmlFor="publish_at"
                    className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]"
                  >
                    Schedule Date
                  </label>
                  <input
                    id="publish_at"
                    type="datetime-local"
                    {...register('publish_at')}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] focus:border-[var(--color-crimson)] focus:outline-none"
                  />
                </div>
              )}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[var(--color-admin-text)]">
                  <input
                    type="checkbox"
                    {...register('is_breaking')}
                    className="rounded border-gray-300"
                  />
                  Breaking News
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--color-admin-text)]">
                  <input
                    type="checkbox"
                    {...register('is_featured')}
                    className="rounded border-gray-300"
                  />
                  Featured
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-md bg-[var(--color-crimson)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </span>
                  ) : isPublishing ? (
                    'Publish'
                  ) : (
                    'Save Draft'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/posts')}
                  className="rounded-md border border-gray-200 px-4 py-2 text-sm text-[var(--color-admin-text)] hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-admin-text)]">
              <Eye className="h-4 w-4" />
              Category
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-xs text-[var(--color-admin-text-muted)]">No categories found.</p>
              ) : (
                categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-admin-text)]"
                  >
                    <input
                      type="radio"
                      value={cat.id}
                      {...register('category_id')}
                      className="accent-[var(--color-crimson)]"
                    />
                    {cat.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-admin-text)]">
              <Tag className="h-4 w-4" />
              Tags
            </div>
            <input
              type="text"
              {...register('tags')}
              placeholder="Enter tags separated by commas"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
            />
            <p className="mt-1 text-xs text-[var(--color-admin-text-muted)]">
              Separate tags with commas (e.g. politics, economy, tech).
            </p>
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-admin-text)]">
              <Settings className="h-4 w-4" />
              SEO
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]">
                  Meta Title
                </label>
                <input
                  type="text"
                  {...register('seo_title')}
                  placeholder="SEO title (defaults to post title)"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                />
                <p className="mt-0.5 text-xs text-[var(--color-admin-text-muted)]">
                  {seoTitleLength}/70 characters
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  {...register('seo_description')}
                  placeholder="Brief description for search engines"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                />
                <p className="mt-0.5 text-xs text-[var(--color-admin-text-muted)]">
                  {seoDescLength}/160 characters
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]">
                  Focus Keyword
                </label>
                <input
                  type="text"
                  {...register('focus_keyword')}
                  placeholder="Primary keyword for SEO"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--color-admin-text)]">
              <Share2 className="h-4 w-4" />
              Social Sharing
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]">
                  OG Title
                </label>
                <input
                  type="text"
                  {...register('og_title')}
                  placeholder="Title for social shares"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]">
                  OG Description
                </label>
                <textarea
                  rows={2}
                  {...register('og_description')}
                  placeholder="Description for social shares"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[var(--color-admin-text-muted)]">
                  OG Image URL
                </label>
                <input
                  type="text"
                  {...register('og_image')}
                  placeholder="URL for social share image"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
