import Image from 'next/image';
import Link from 'next/link';
import { CategoryTag } from '@/components/ui/CategoryTag';

interface HeroArticle {
  image: string;
  category: string;
  categoryColor?: string;
  title: string;
  author?: string;
  date?: string;
  reads?: string;
  slug: string;
}

interface HeroGridProps {
  articles: {
    main: HeroArticle;
    topRight: HeroArticle;
    bottomLeft: HeroArticle;
    bottomRight: HeroArticle;
  };
}

export function HeroGrid({ articles }: HeroGridProps) {
  const { main, topRight, bottomLeft, bottomRight } = articles;

  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-2">
      <Link
        href={`/news/${main.slug}`}
        className="group relative row-span-2 overflow-hidden"
      >
        <div className="relative h-[300px] sm:h-[380px] lg:h-[480px]">
          <Image
            src={main.image}
            alt=""
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
          <CategoryTag label={main.category} color={main.categoryColor} />
          <h2 className="mt-3 font-display text-xl font-semibold leading-tight text-white transition-colors group-hover:text-[#dc2626]/80 sm:text-2xl lg:text-[28px] line-clamp-3">
            {main.title}
          </h2>
          {main.author && main.date && (
            <p className="mt-2 text-xs text-white/80">
              By {main.author} &middot; {main.date}
              {main.reads && <span> &middot; {main.reads} reads</span>}
            </p>
          )}
        </div>
      </Link>

      <div className="flex flex-col gap-1">
        <Link
          href={`/news/${topRight.slug}`}
          className="group relative flex-1 overflow-hidden"
        >
          <div className="relative h-full min-h-[180px]">
            <Image
              src={topRight.image}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
            <CategoryTag label={topRight.category} color={topRight.categoryColor} />
            <h3 className="mt-2 font-display text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#dc2626]/80 lg:text-base line-clamp-2">
              {topRight.title}
            </h3>
            {topRight.date && (
              <p className="mt-1 text-xs text-white/80">{topRight.date}</p>
            )}
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-1">
          <Link
            href={`/news/${bottomLeft.slug}`}
            className="group relative overflow-hidden"
          >
            <div className="relative h-[150px]">
              <Image
                src={bottomLeft.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <CategoryTag label={bottomLeft.category} color={bottomLeft.categoryColor} />
              <h3 className="mt-1 font-display text-xs font-semibold leading-snug text-white transition-colors group-hover:text-[#dc2626]/80 lg:text-sm line-clamp-2">
                {bottomLeft.title}
              </h3>
            </div>
          </Link>

          <Link
            href={`/news/${bottomRight.slug}`}
            className="group relative overflow-hidden"
          >
            <div className="relative h-[150px]">
              <Image
                src={bottomRight.image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <CategoryTag label={bottomRight.category} color={bottomRight.categoryColor} />
              <h3 className="mt-1 font-display text-xs font-semibold leading-snug text-white transition-colors group-hover:text-[#dc2626]/80 lg:text-sm line-clamp-2">
                {bottomRight.title}
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
