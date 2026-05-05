import type { PublicArticleCard, PublicCategory } from '@/lib/db/public-articles';
import { ArticleCard } from './article-card';

type Props = {
  articles: PublicArticleCard[];
  categoriesById: Map<string, PublicCategory>;
};

export function RelatedArticles({ articles, categoriesById }: Props) {
  if (articles.length === 0) return null;

  return (
    <section className="mx-auto mt-16 w-full max-w-4xl border-t border-(--border-subtle) px-6 pt-12">
      <h2 className="mb-8 font-display text-2xl font-semibold tracking-tight text-(--fg-default)">
        Read next
      </h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const category = article.category_id
            ? (categoriesById.get(article.category_id) ?? null)
            : null;
          return (
            <ArticleCard
              key={article.id}
              article={article}
              categorySlug={category?.slug}
              categoryName={category?.name}
              size="sm"
            />
          );
        })}
      </div>
    </section>
  );
}
