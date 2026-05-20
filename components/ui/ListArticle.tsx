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
    <article className={`group ${className}`}>
      <Link href={`/news/${slug}`}>
        <div className="relative h-[100px] overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <CategoryTag label={category} />
            <h3
              className="mt-1 font-display text-sm font-semibold leading-snug text-white transition-colors group-hover:text-white/90 line-clamp-2"
              style={{ textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}
            >
              {title}
            </h3>
            <p
              className="mt-0.5 text-xs text-white/80"
              style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
            >
              {author} &middot; {date} &middot; {reads} reads
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
