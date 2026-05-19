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
      <h3 className="mb-[14px] border-l-[3px] border-[#e63946] pl-[10px] text-[12px] font-black uppercase tracking-widest text-[#0f1419]">
        {title}
      </h3>
      {articles.map((article) => (
        <Link
          key={article.slug}
          href={`/news/${article.slug}`}
          className="group mb-[10px] grid grid-cols-[70px_1fr] gap-[10px] border-b border-[#e5e7eb] pb-[10px]"
        >
          <div className="relative h-[55px] w-[70px] overflow-hidden">
            <Image
              src={article.image}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <h4 className="text-[11px] font-bold leading-snug text-[#1a202c] transition-colors group-hover:text-[#e63946]">
              {article.title}
            </h4>
            <p className="mt-1 text-[10px] text-[#6b7280]">{article.date}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
