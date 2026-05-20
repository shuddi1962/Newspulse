import Image from 'next/image';
import Link from 'next/link';
import { CategoryTag } from './CategoryTag';

interface ArticleCardProps {
  image: string;
  category: string;
  categoryColor?: string;
  title: string;
  author: string;
  date: string;
  slug: string;
  className?: string;
}

export function ArticleCard({
  image,
  category,
  categoryColor,
  title,
  author,
  date,
  slug,
  className = '',
}: ArticleCardProps) {
  return (
    <article className={`group ${className}`}>
      <Link href={`/news/${slug}`} className="block overflow-hidden">
        <div className="relative h-[180px] overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </div>
      </Link>
      <div className="mt-3">
        <CategoryTag label={category} color={categoryColor} />
        <Link href={`/news/${slug}`}>
          <h3 className="mt-2 font-display text-base font-semibold leading-snug text-(--fg-default) transition-colors group-hover:text-[#dc2626] line-clamp-2">
            {title}
          </h3>
        </Link>
        <p className="mt-1.5 text-sm text-gray-500">
          {author} &middot; {date}
        </p>
      </div>
    </article>
  );
}
