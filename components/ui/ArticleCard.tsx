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
      <Link href={`/news/${slug}`}>
        <div className="relative h-[210px] overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <CategoryTag label={category} color={categoryColor} />
            <h3
              className="mt-2 font-display text-base font-semibold leading-snug text-white transition-colors group-hover:text-white/90 line-clamp-3"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
            >
              {title}
            </h3>
            <p
              className="mt-1.5 text-sm text-white/80"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              {author} &middot; {date}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
