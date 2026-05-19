import Image from 'next/image';
import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CategoryTag } from '@/components/ui/CategoryTag';

interface RelatedArticle {
  image: string;
  category: string;
  categoryColor?: string;
  title: string;
  date: string;
  reads: string;
  slug: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  return (
    <section className="mb-7">
      <SectionHeading title="Related Stories" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/news/${article.slug}`}
            className="group cursor-pointer"
          >
            <div className="relative h-[140px] overflow-hidden">
              <Image
                src={article.image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
              />
            </div>
            <div className="mt-2">
              <CategoryTag label={article.category} color={article.categoryColor} />
              <h4 className="mt-2 text-[13px] font-bold leading-snug text-[#1a202c] transition-colors group-hover:text-[#e63946]">
                {article.title}
              </h4>
              <p className="mt-1 text-[10px] text-[#6b7280]">
                {article.date} &middot; {article.reads} reads
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
