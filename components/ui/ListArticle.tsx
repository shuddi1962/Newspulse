import Image from 'next/image';
import Link from 'next/link';
import { CategoryTag } from './CategoryTag';

interface ListArticleProps {
  image: string;
  category: string;
  title: string;
  author: string;
  date: string;
  reads: string;
  slug: string;
  className?: string;
}

export function ListArticle({
  image,
  category,
  title,
  author,
  date,
  reads,
  slug,
  className = '',
}: ListArticleProps) {
  return (
    <article className={`grid grid-cols-[100px_1fr] gap-4 border-b border-gray-100 py-4 ${className}`}>
      <Link href={`/news/${slug}`} className="group block overflow-hidden">
        <div className="relative h-20 w-full overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>
      <div>
        <CategoryTag label={category} />
        <Link href={`/news/${slug}`}>
          <h3 className="mt-1.5 font-display text-sm font-semibold leading-snug text-(--fg-default) transition-colors hover:text-[#dc2626] line-clamp-2">
            {title}
          </h3>
        </Link>
        <p className="mt-1 text-xs text-gray-500">
          {author} &middot; {date} &middot; {reads} reads
        </p>
      </div>
    </article>
  );
}
