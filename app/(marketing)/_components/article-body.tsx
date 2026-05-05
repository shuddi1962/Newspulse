import Image from 'next/image';
import type { PublicArticleFull } from '@/lib/db/public-articles';

type Props = {
  article: PublicArticleFull;
};

export function ArticleBody({ article }: Props) {
  return (
    <div className="mx-auto w-full max-w-4xl px-6">
      {article.featured_image ? (
        <figure className="relative mb-10 aspect-[16/9] w-full overflow-hidden rounded-lg bg-(--bg-muted)">
          <Image
            src={article.featured_image}
            alt={article.title}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </figure>
      ) : null}

      {article.content_html ? (
        <div
          className="article-prose"
          // content_html is produced by our server-side Tiptap pipeline, which
          // only emits whitelisted nodes/marks — no raw-HTML extension enabled.
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />
      ) : (
        <p className="text-(--fg-muted)">This article has no body yet.</p>
      )}

      {article.gallery_images.length > 0 ? (
        <section className="mt-12 border-t border-(--border-subtle) pt-8">
          <h2 className="mb-6 font-display text-xl font-semibold text-(--fg-default)">Gallery</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {article.gallery_images.map((src, index) => (
              <div
                key={src}
                className="relative aspect-square overflow-hidden rounded-md bg-(--bg-muted)"
              >
                <Image
                  src={src}
                  alt={`${article.title} gallery image ${index + 1}`}
                  fill
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
