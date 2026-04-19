import Image from 'next/image';
import Link from 'next/link';
import type { PublicArticleCard } from '@/lib/db/public-articles';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'hero';

type Props = {
  article: PublicArticleCard;
  categorySlug?: string | null;
  categoryName?: string | null;
  size?: Size;
  className?: string;
};

function formatPublishedAt(iso: string | null): string {
  if (!iso) return '';
  const ts = new Date(iso);
  if (Number.isNaN(ts.getTime())) return '';
  return ts.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function articleHref(article: PublicArticleCard, categorySlug?: string | null): string {
  return categorySlug ? `/${categorySlug}/${article.slug}` : `/article/${article.slug}`;
}

export function ArticleCard({
  article,
  categorySlug,
  categoryName,
  size = 'md',
  className,
}: Props) {
  const href = articleHref(article, categorySlug);
  const published = formatPublishedAt(article.publish_at);

  const isHero = size === 'hero';
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const imageWrapper = cn(
    'relative w-full overflow-hidden bg-(--bg-muted)',
    isHero && 'aspect-[16/9]',
    isLg && 'aspect-[16/9]',
    size === 'md' && 'aspect-[16/10]',
    isSm && 'aspect-[4/3]',
  );

  const titleClass = cn(
    'font-display font-semibold tracking-tight text-(--fg-default) group-hover:underline',
    isHero && 'text-3xl leading-tight sm:text-4xl',
    isLg && 'text-2xl leading-tight',
    size === 'md' && 'text-lg leading-snug',
    isSm && 'text-base leading-snug',
  );

  const excerptClass = cn(
    'text-(--fg-muted)',
    isHero ? 'mt-3 text-base' : isLg ? 'mt-2 text-sm' : 'mt-2 text-sm',
  );

  return (
    <article className={cn('group flex flex-col gap-3', className)}>
      <Link href={href} className={imageWrapper} aria-label={article.title}>
        {article.featured_image ? (
          <Image
            src={article.featured_image}
            alt=""
            fill
            priority={isHero}
            sizes={
              isHero
                ? '(min-width: 1024px) 60vw, 100vw'
                : isLg
                  ? '(min-width: 1024px) 40vw, 100vw'
                  : '(min-width: 1024px) 25vw, 50vw'
            }
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-(--fg-subtle)">
            No image
          </div>
        )}
      </Link>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {article.is_breaking ? <Badge variant="destructive">Breaking</Badge> : null}
          {categoryName ? (
            <Link
              href={`/${categorySlug}`}
              className="text-xs font-mono uppercase tracking-wider text-(--fg-muted) hover:text-(--fg-default)"
            >
              {categoryName}
            </Link>
          ) : null}
        </div>
        <Link href={href}>
          <h3 className={titleClass}>{article.title}</h3>
        </Link>
        {article.excerpt && !isSm ? <p className={excerptClass}>{article.excerpt}</p> : null}
        <div className="mt-3 flex items-center gap-3 text-xs text-(--fg-subtle)">
          {published ? <time dateTime={article.publish_at ?? undefined}>{published}</time> : null}
          {article.reading_time_min ? <span>·</span> : null}
          {article.reading_time_min ? <span>{article.reading_time_min} min read</span> : null}
        </div>
      </div>
    </article>
  );
}
