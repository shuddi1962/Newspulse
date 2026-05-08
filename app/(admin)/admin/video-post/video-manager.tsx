'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, X, Search, Film, Eye, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { insforge } from '@/lib/insforge/client';

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category_id: string | null;
  tags: string[];
  is_featured: boolean;
  view_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  category_name: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  videos: Video[];
  categories: Category[];
}

const STATUS_BADGES: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  archived: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}


export function VideoManager({ videos, categories }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    title: '', slug: '', description: '', videoUrl: '', thumbnailUrl: '',
    categoryId: '', tags: '', isFeatured: false, status: 'draft',
  });

  const totalViews = videos.reduce((s, v) => s + v.view_count, 0);
  const publishedCount = videos.filter((v) => v.status === 'published').length;
  const trending = [...videos].sort((a, b) => b.view_count - a.view_count).slice(0, 5);

  const filtered = useMemo(() => {
    let list = videos;
    if (search.trim()) {
      const t = search.toLowerCase();
      list = list.filter((v) => v.title.toLowerCase().includes(t));
    }
    if (catFilter) list = list.filter((v) => v.category_id === catFilter);
    if (statusFilter) list = list.filter((v) => v.status === statusFilter);
    return list;
  }, [videos, search, catFilter, statusFilter]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.videoUrl.trim()) {
      toast.error('Title and Video URL are required.');
      return;
    }
    startTransition(async () => {
      const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const { error } = await insforge.database.from('videos').insert({
        title: form.title, slug,
        description: form.description || null,
        video_url: form.videoUrl,
        thumbnail_url: form.thumbnailUrl || null,
        category_id: form.categoryId || null,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
        is_featured: form.isFeatured,
        status: form.status,
      });
      if (error) {
        toast.error(error.message ?? 'Could not save video.');
        return;
      }
      toast.success('Video created.');
      setShowAdd(false);
      setForm({ title: '', slug: '', description: '', videoUrl: '', thumbnailUrl: '', categoryId: '', tags: '', isFeatured: false, status: 'draft' });
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this video post?')) return;
    startTransition(async () => {
      const { error } = await insforge.database.from('videos').delete().eq('id', id);
      if (error) { toast.error(error.message); return; }
      toast.success('Video deleted.');
      router.refresh();
    });
  };

  const update = <K extends keyof typeof form>(key: K, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Media</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Video Posts</h1>
          <p className="mt-1 text-sm text-(--fg-muted)">Manage video content and track performance.</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">
          <Plus className="h-4 w-4" />
          Add Video Post
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-(--fg-muted)">Total Videos</p>
              <p className="text-2xl font-bold text-(--fg-default)">{videos.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-(--fg-muted)">Total Views</p>
              <p className="text-2xl font-bold text-(--fg-default)">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-(--fg-muted)">Published</p>
              <p className="text-2xl font-bold text-(--fg-default)">{publishedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {trending.length > 0 && (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-(--signal-red)" />
            <h3 className="text-sm font-semibold text-(--fg-default)">Trending Videos</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map((v) => (
              <span key={v.id} className="rounded-md bg-(--bg-muted) px-2.5 py-1 text-xs text-(--fg-muted)">
                {v.title} ({v.view_count} views)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-muted)" />
          <input type="text" placeholder="Search videos..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) py-2 pl-10 pr-3 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-(--border-subtle)">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-(--border-subtle) bg-(--bg-surface-subtle)">
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Video</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Category</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Views</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Status</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Date</th>
              <th className="px-4 py-3 font-medium text-(--fg-muted)">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-(--fg-muted)">No videos found.</td></tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 shrink-0 overflow-hidden rounded bg-(--bg-muted)">
                        {v.thumbnail_url ? (
                          <img src={v.thumbnail_url} alt={v.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Film className="h-4 w-4 text-(--fg-muted)" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-(--fg-default)">{v.title}</p>
                        <p className="text-xs text-(--fg-muted)">
                          {formatDuration(v.duration_seconds)}
                          {v.author_name && <span> &middot; {v.author_name}</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">{v.category_name ?? '—'}</td>
                  <td className="px-4 py-3 font-medium text-(--fg-default)">{v.view_count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block rounded-md px-2.5 py-0.5 text-xs font-medium', STATUS_BADGES[v.status] ?? STATUS_BADGES.draft)}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button"
                        className="rounded-md p-1.5 text-(--fg-muted) hover:bg-(--bg-muted) hover:text-(--fg-default) transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDelete(v.id)} disabled={isPending}
                        className="rounded-md p-1.5 text-(--fg-muted) hover:bg-red-50 hover:text-(--signal-red) transition-colors disabled:opacity-50" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8">
          <div className="w-full max-w-xl rounded-xl bg-(--bg-base) p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg-default)">Add Video Post</h2>
              <button onClick={() => setShowAdd(false)}
                className="rounded-md p-1.5 text-(--fg-muted) hover:bg-(--bg-muted)">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Title *</label>
                <input type="text" value={form.title} onChange={(e) => update('title', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Slug</label>
                <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Description</label>
                <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Video URL (YouTube/Vimeo) *</label>
                <input type="url" value={form.videoUrl} onChange={(e) => update('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Thumbnail URL</label>
                <input type="url" value={form.thumbnailUrl} onChange={(e) => update('thumbnailUrl', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Category</label>
                  <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    <option value="">Select</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Tags (comma separated)</label>
                  <input type="text" value={form.tags} onChange={(e) => update('tags', e.target.value)}
                    placeholder="news, breaking, tech"
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-(--border-subtle) px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-(--fg-default)">Featured</p>
                  <p className="text-xs text-(--fg-muted)">Show in featured video section</p>
                </div>
                <button type="button" onClick={() => update('isFeatured', !form.isFeatured)}
                  className={cn('relative h-6 w-11 rounded-full transition-colors', form.isFeatured ? 'bg-(--color-forest-green)' : 'bg-(--border-subtle)')}>
                  <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', form.isFeatured ? 'translate-x-[22px]' : 'translate-x-0.5')} />
                </button>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Status</label>
                <select value={form.status} onChange={(e) => update('status', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">Cancel</button>
                <button type="submit" disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark) disabled:opacity-60">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
