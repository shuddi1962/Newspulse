import Link from 'next/link';
import { createServerInsForge } from '@/lib/insforge/server';

export async function MegaMenu() {
  const insforge = createServerInsForge();

  const { data: categories } = await insforge.database
    .from('categories')
    .select('id, slug, name, kind')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (!categories || categories.length === 0) return null;

  const newsCats = categories.filter((c: { kind: string }) => c.kind === 'news');
  const otherCats = categories.filter((c: { kind: string }) => c.kind !== 'news');

  return (
    <div className="absolute left-0 top-full z-50 hidden w-[600px] rounded-xl border border-(--border-default) bg-(--bg-base) p-6 shadow-lg group-hover:block">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Categories
          </p>
          <div className="grid grid-cols-2 gap-2">
            {newsCats.map((cat: { slug: string; name: string }) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="rounded-md px-3 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            More
          </p>
          <div className="flex flex-col gap-1">
            {otherCats.map((cat: { slug: string; name: string }) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="rounded-md px-3 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/video"
              className="rounded-md px-3 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
            >
              Video
            </Link>
            <Link
              href="/search"
              className="rounded-md px-3 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
            >
              Archive
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
