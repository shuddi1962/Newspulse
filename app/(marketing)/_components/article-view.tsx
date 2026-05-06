import type {
  PublicArticleFull,
  PublicArticleCard,
  PublicAuthor,
  PublicCategory,
} from '@/lib/db/public-articles';
import type { PublicComment } from '@/lib/db/comments';
import type { PaywallResult } from '@/lib/db/paywall';
import { ArticleHeader } from './article-header';
import { ArticleBody } from './article-body';
import { ShareButtons } from './share-buttons';
import { RelatedArticles } from './related-articles';
import { ArticleJsonLd } from './article-json-ld';
import { CommentList } from './comment-list';
import { CommentForm } from './comment-form';
import { PaywallOverlay } from '@/components/paywall-overlay';

type Props = {
  article: PublicArticleFull;
  category: PublicCategory | null;
  author: PublicAuthor | null;
  related: PublicArticleCard[];
  categoriesById: Map<string, PublicCategory>;
  comments: PublicComment[];
  siteUrl: string;
  siteName: string;
  articleUrl: string;
  paywall: PaywallResult;
};

export function ArticleView({
  article,
  category,
  author,
  related,
  categoriesById,
  comments,
  siteUrl,
  siteName,
  articleUrl,
  paywall,
}: Props) {
  const showPaywall = paywall.isPremium && !paywall.hasAccess;
  const freeExcerpt = showPaywall ? article.excerpt ?? '' : null;

  return (
    <article className="bg-(--bg-base) pb-20">
      <ArticleJsonLd
        article={article}
        author={author}
        category={category}
        siteUrl={siteUrl}
        siteName={siteName}
        articleUrl={articleUrl}
      />
      <ArticleHeader article={article} category={category} author={author} />

      {showPaywall ? (
        <>
          <div className="mx-auto w-full max-w-4xl px-6">
            <div className="prose prose-lg max-w-none text-(--fg-default)">
              <p className="text-xl leading-relaxed text-(--fg-muted)">{freeExcerpt}</p>
            </div>
          </div>
          <div className="mx-auto mt-8 w-full max-w-4xl px-6">
            <PaywallOverlay articleTitle={article.title} />
          </div>
        </>
      ) : (
        <ArticleBody article={article} />
      )}

      {!showPaywall && (
        <>
          <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col gap-6 border-t border-(--border-subtle) px-6 pt-6">
            <ShareButtons url={articleUrl} title={article.title} excerpt={article.excerpt} />

            {article.tags.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
                  Tags
                </span>
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-(--border-default) bg-(--bg-surface) px-3 py-1 text-xs text-(--fg-muted)"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {author && author.bio ? (
            <aside className="mx-auto mt-10 flex w-full max-w-4xl gap-4 rounded-lg border border-(--border-default) bg-(--bg-surface) p-6">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt=""
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-(--bg-muted)" aria-hidden />
              )}
              <div className="flex-1">
                <p className="font-display text-lg font-semibold text-(--fg-default)">
                  {author.display_name}
                </p>
                <p className="mt-1 text-sm text-(--fg-muted)">{author.bio}</p>
                {author.website_url ? (
                  <a
                    href={author.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-(--fg-default) hover:underline"
                  >
                    {author.website_url.replace(/^https?:\/\//, '')}
                  </a>
                ) : null}
              </div>
            </aside>
          ) : null}

          <RelatedArticles articles={related} categoriesById={categoriesById} />

          {article.allow_comments && (
            <section
              id="comments"
              className="mx-auto mt-16 w-full max-w-4xl px-6"
              aria-labelledby="comments-heading"
            >
              <h2
                id="comments-heading"
                className="mb-6 text-2xl font-semibold tracking-tight text-(--fg-default)"
              >
                Comments
              </h2>
              <CommentForm articleId={article.id} />
              <div className="mt-8">
                <CommentList comments={comments} />
              </div>
            </section>
          )}
        </>
      )}
    </article>
  );
}
