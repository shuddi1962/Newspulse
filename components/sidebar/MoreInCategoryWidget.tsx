import Image from 'next/image';
import Link from 'next/link';

interface MoreArticle {
  image: string;
  title: string;
  date: string;
  slug: string;
}

interface MoreInCategoryWidgetProps {
  title: string;
  articles: MoreArticle[];
}

export function MoreInCategoryWidget({ title, articles }: MoreInCategoryWidgetProps) {
  return (
    <div>
      <h3 className="mb-4 border-l-1 border-[#dc2626] pl-3 text-xs font-black uppercase tracking-widest text-(--fg-default)">
        {title}
      </h3>
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/news/${article.slug}`}
          className="group mb-3 grid grid-cols-[80px_1fr] gap-3 border-b border-[#e5e7eb] pb-3"
        >
          <div className="relative h-[60px] w-[80px] overflow-hidden">
            <Image
              src={article.image}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <h4 className="text-[13px] font-bold leading-snug text-[#1a202c] transition-colors group-hover:text-[#dc2626]">
              {article.title}
            </h4>
            <p className="mt-1.5 text-[11px] text-[#6b7280]">{article.date}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
