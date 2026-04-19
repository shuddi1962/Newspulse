import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { PublicArticleCard, PublicCategory } from '@/lib/db/public-articles';
import { ArticleCard } from './article-card';

type Props = {
  category: PublicCategory;
  articles: PublicArticleCard[];
};

export function CategorySection({ category, articles }: Props) {
  const [lead, ...rest] = articles;
  if (!lead) return null;

  return (
    <section className="border-t border-(--border-subtle) py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="h-6 w-1.5 rounded-full"
            style={{ backgroundColor: category.color ?? 'var(--color-ink-black)' }}
            aria-hidden
          />
          <h2 className="font-display text-2xl font-semibold tracking-tight text-(--fg-default)">
            {category.name}
          </h2>
        </div>
        <Link
          href={`/${category.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-(--fg-muted) hover:text-(--fg-default)"
        >
          More in {category.name}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        <ArticleCard
          article={lead}
          categorySlug={category.slug}
          categoryName={category.name}
          size="lg"
          className="lg:col-span-2"
        />
        <div className="grid gap-6">
          {rest.slice(0, 3).map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              categorySlug={category.slug}
              categoryName={category.name}
              size="sm"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
