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
        <div className="relative h-[200px] overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        </div>
      </Link>
      <div className="mt-4">
        <CategoryTag label={category} color={categoryColor} />
        <Link href={`/news/${slug}`}>
          <h3 className="mt-3 font-display text-lg font-bold leading-snug text-[#0f1419] transition-colors group-hover:text-[#e63946]">
            {title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-gray-500">
          By {author} &middot; {date}
        </p>
      </div>
    </article>
  );
}
