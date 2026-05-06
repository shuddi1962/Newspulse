import Image from 'next/image';
import Link from 'next/link';
import type { PublicArticleFull, PublicAuthor, PublicCategory } from '@/lib/db/public-articles';
import { Badge } from '@/components/ui/badge';

type Props = {
  article: PublicArticleFull;
  category: PublicCategory | null;
  author: PublicAuthor | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArticleHeader({ article, category, author }: Props) {
  const published = formatDate(article.publish_at);

  return (
    <header className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 pt-12 pb-8">
      <div className="flex flex-wrap items-center gap-3">
        {article.is_breaking ? <Badge variant="destructive">Breaking</Badge> : null}
        {article.is_premium ? (
          <Badge variant="outline" className="border-(--color-cat-lifestyle) text-(--color-cat-lifestyle)">
            Premium
          </Badge>
        ) : null}
        {category ? (
          <Link
            href={`/${category.slug}`}
            className="font-mono text-xs uppercase tracking-[0.2em] text-(--fg-muted) hover:text-(--fg-default)"
          >
            {category.name}
          </Link>
        ) : null}
      </div>

      <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-(--fg-default) sm:text-5xl">
        {article.title}
      </h1>

      {article.excerpt ? (
        <p className="text-xl leading-relaxed text-(--fg-muted)">{article.excerpt}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4 border-t border-b border-(--border-subtle) py-4 text-sm text-(--fg-muted)">
        {author ? (
          <div className="flex items-center gap-3">
            {author.avatar_url ? (
              <Image
                src={author.avatar_url}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-full bg-(--bg-muted)" aria-hidden />
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-medium text-(--fg-default)">{author.display_name}</span>
              {author.username ? (
                <span className="text-xs text-(--fg-subtle)">@{author.username}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        {published ? (
          <>
            <span aria-hidden>·</span>
            <time dateTime={article.publish_at ?? undefined}>{published}</time>
          </>
        ) : null}

        {article.reading_time_min ? (
          <>
            <span aria-hidden>·</span>
            <span>{article.reading_time_min} min read</span>
          </>
        ) : null}

        {article.view_count > 0 ? (
          <>
            <span aria-hidden>·</span>
            <span>{article.view_count.toLocaleString()} views</span>
          </>
        ) : null}
      </div>
    </header>
  );
}
