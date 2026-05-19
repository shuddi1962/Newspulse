import Image from 'next/image';
import Link from 'next/link';
import { CategoryTag } from './CategoryTag';
import { cn } from '@/lib/utils';

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
  className,
}: ListArticleProps) {
  return (
    <article className={cn('grid grid-cols-[100px_1fr] gap-4 border-b border-[#e5e7eb] py-4', className)}>
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
          <h3 className="mt-2 text-sm font-bold leading-snug text-[#1a202c] transition-colors hover:text-[#e63946]">
            {title}
          </h3>
        </Link>
        <p className="mt-1.5 text-[11px] text-[#6b7280]">
          {author} &middot; {date} &middot; {reads} reads
        </p>
      </div>
    </article>
  );
}
