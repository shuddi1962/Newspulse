import Link from 'next/link';
import {
  listBreakingArticles,
  listFeaturedArticles,
  listLatestArticles,
  listArticlesByCategory,
  listPublicNewsCategories,
  type PublicArticleCard,
  type PublicCategory,
} from '@/lib/db/public-articles';
import { ArticleCard } from './_components/article-card';
import { BreakingStrip } from './_components/breaking-strip';
import { CategorySection } from './_components/category-section';

export const revalidate = 60;

export default async function Home() {
  const [breakingRes, featuredRes, latestRes, categoriesRes] = await Promise.all([
    listBreakingArticles(6),
    listFeaturedArticles(6),
    listLatestArticles(12),
    listPublicNewsCategories(6),
  ]);

  const breaking = breakingRes.status === 'ok' ? breakingRes.data : [];
  const featured = featuredRes.status === 'ok' ? featuredRes.data : [];
  const latest = latestRes.status === 'ok' ? latestRes.data : [];
  const categories = categoriesRes.status === 'ok' ? categoriesRes.data : [];

  const categorySections = await Promise.all(
    categories.map(async (category) => {
      const res = await listArticlesByCategory(category.id, 4);
      return {
        category,
        articles: res.status === 'ok' ? res.data : [],
      };
    }),
  );

  const seenIds = new Set<string>();
  const hero = featured[0] ?? latest[0] ?? null;
  if (hero) seenIds.add(hero.id);

  const featuredRest = featured.filter((a) => {
    if (seenIds.has(a.id)) return false;
    seenIds.add(a.id);
    return true;
  }).slice(0, 4);

  const latestRail = latest.filter((a) => !seenIds.has(a.id)).slice(0, 8);

  const categoryById = new Map<string, PublicCategory>(categories.map((c) => [c.id, c]));

  function resolveCategory(article: PublicArticleCard) {
    if (!article.category_id) return { slug: undefined, name: undefined };
    const c = categoryById.get(article.category_id);
    return { slug: c?.slug, name: c?.name };
  }

  const hasContent =
    breaking.length > 0 ||
    hero !== null ||
    featuredRest.length > 0 ||
    categorySections.some((s) => s.articles.length > 0) ||
    latestRail.length > 0;

  return (
    <>
      <BreakingStrip articles={breaking} />

      <div className="mx-auto flex w-full max-w-screen-2xl flex-col px-6 py-10">
        {!hasContent ? (
          <EmptyState />
        ) : (
          <>
            {hero ? (
              <section className="mb-12 grid gap-8 border-b border-(--border-subtle) pb-12 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <ArticleCard
                    article={hero}
                    categorySlug={resolveCategory(hero).slug}
                    categoryName={resolveCategory(hero).name}
                    size="hero"
                  />
                </div>
                <div className="grid gap-6 lg:col-span-2">
                  {featuredRest.slice(0, 2).map((article) => {
                    const c = resolveCategory(article);
                    return (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        categorySlug={c.slug}
                        categoryName={c.name}
                        size="md"
                      />
                    );
                  })}
                </div>
              </section>
            ) : null}

            {featuredRest.length > 2 ? (
              <section className="mb-12">
                <header className="mb-6 flex items-end justify-between">
                  <h2 className="font-display text-xl font-semibold tracking-tight text-(--fg-default)">
                    More featured
                  </h2>
                </header>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredRest.slice(2).map((article) => {
                    const c = resolveCategory(article);
                    return (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        categorySlug={c.slug}
                        categoryName={c.name}
                        size="md"
                      />
                    );
                  })}
                </div>
              </section>
            ) : null}

            {categorySections.map(({ category, articles }) => (
              <CategorySection key={category.id} category={category} articles={articles} />
            ))}

            {latestRail.length > 0 ? (
              <section className="border-t border-(--border-subtle) py-12">
                <header className="mb-6 flex items-end justify-between">
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-(--fg-default)">
                    Latest
                  </h2>
                  <Link
                    href="/news"
                    className="text-sm font-medium text-(--fg-muted) hover:text-(--fg-default)"
                  >
                    All stories →
                  </Link>
                </header>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {latestRail.map((article) => {
                    const c = resolveCategory(article);
                    return (
                      <ArticleCard
                        key={article.id}
                        article={article}
                        categorySlug={c.slug}
                        categoryName={c.name}
                        size="sm"
                      />
                    );
                  })}
                </div>
              </section>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-(--fg-subtle)">
          Newsroom
        </p>
        <h1 className="mt-6 font-display text-5xl font-semibold text-(--fg-default) sm:text-6xl">
          NewsPulse PRO
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-(--fg-muted)">
          No articles have been published yet. Once the editorial team publishes
          their first story, the homepage will populate automatically with
          breaking news, featured coverage, and the latest across every desk.
        </p>
      </div>
    </section>
  );
}
