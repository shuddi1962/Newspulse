import Image from 'next/image';
import Link from 'next/link';
import { CategoryTag } from './CategoryTag';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  image: string;
  category: string;
  categoryColor?: string;
  title: string;
  author: string;
  authorInitial: string;
  authorColor?: string;
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
  authorInitial,
  authorColor,
  date,
  slug,
  className,
}: ArticleCardProps) {
  return (
    <article className={cn('group cursor-pointer', className)}>
      <Link href={`/news/${slug}`} className="block overflow-hidden">
        <div className="relative h-[180px] overflow-hidden">
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        </div>
      </Link>
      <div className="mt-3">
        <CategoryTag label={category} color={categoryColor} />
        <Link href={`/news/${slug}`}>
          <h3 className="mt-2 text-sm font-bold leading-snug text-[#1a202c] transition-colors group-hover:text-[#e63946]">
            {title}
          </h3>
        </Link>
        <div className="mt-2.5 flex items-center gap-2">
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white"
            style={{ backgroundColor: authorColor || '#0f1419' }}
          >
            {authorInitial}
          </div>
          <span className="text-[11px] text-[#6b7280]">
            {author} &middot; {date}
          </span>
        </div>
      </div>
    </article>
  );
}
