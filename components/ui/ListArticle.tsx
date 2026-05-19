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
  className,
}: ListArticleProps) {
  return (
    <article className={cn('grid grid-cols-[90px_1fr] gap-3 border-b border-[#e5e7eb] py-3', className)}>
      <Link href={`/news/${slug}`} className="group block overflow-hidden">
        <div className="relative h-16 w-full overflow-hidden">
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
          <h3 className="mt-1.5 text-[12px] font-bold leading-snug text-[#1a202c] transition-colors hover:text-[#e63946]">
            {title}
          </h3>
        </Link>
        <p className="mt-1 text-[10px] text-[#6b7280]">
          {author} &middot; {date} &middot; {reads} reads
        </p>
      </div>
    </article>
  );
}

function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(' ');
}
