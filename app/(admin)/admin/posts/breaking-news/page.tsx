import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';
import { AlertCircle, Star, Clock } from 'lucide-react';

export const metadata: Metadata = { title: 'Breaking News — Admin' };

export default async function BreakingNewsPage() {
  await requireAdmin();
  const insforge = createServerInsForge();
  const { data: articles } = await insforge.database
    .from('articles')
    .select('id, title, slug, is_breaking, is_featured, status, publish_at, view_count')
    .in('status', ['published', 'scheduled'])
    .order('publish_at', { ascending: false })
    .limit(50);

  const breaking = (articles ?? []).filter((a: Record<string, unknown>) => a.is_breaking);
  const featured = (articles ?? []).filter((a: Record<string, unknown>) => a.is_featured && !a.is_breaking);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Content</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Breaking News</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-red-600"><AlertCircle className="h-5 w-5" /> Breaking ({breaking.length})</h2>
          {breaking.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No breaking news articles. Mark articles as breaking in the editor.</p>
          ) : (
            <div className="space-y-2">
              {breaking.map((a: Record<string, unknown>) => (
                <div key={a.id as string} className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-base) p-3">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <Link href={`/admin/posts/edit/${a.id}`} className="flex-1 text-sm font-medium text-gray-900 hover:text-blue-600">{a.title as string}</Link>
                  <span className="text-xs text-gray-400">{a.publish_at ? new Date(a.publish_at as string).toLocaleDateString() : '—'}</span>
                  <span className="text-xs text-gray-400">{String(a.view_count ?? 0)} views</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-amber-600"><Star className="h-5 w-5" /> Featured ({featured.length})</h2>
          {featured.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No featured articles. Mark articles as featured in the editor.</p>
          ) : (
            <div className="space-y-2">
              {featured.map((a: Record<string, unknown>) => (
                <div key={a.id as string} className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-base) p-3">
                  <Star className="h-4 w-4 shrink-0 text-amber-500" />
                  <Link href={`/admin/posts/edit/${a.id}`} className="flex-1 text-sm font-medium text-gray-900 hover:text-blue-600">{a.title as string}</Link>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="h-3 w-3" />{a.publish_at ? new Date(a.publish_at as string).toLocaleDateString() : '—'}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
