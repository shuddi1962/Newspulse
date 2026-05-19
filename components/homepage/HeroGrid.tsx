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
    <div className="mb-7 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-2">
      {/* Main Panel - spans 2 rows */}
      <Link
        href={`/news/${main.slug}`}
        className="group relative row-span-2 overflow-hidden cursor-pointer"
      >
        <div className="relative h-[280px] sm:h-[360px] lg:h-[420px]">
          <Image
            src={main.image}
            alt=""
            fill
            priority
            className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <CategoryTag label={main.category} color={main.categoryColor} />
          <h2 className="mt-2 font-display text-[18px] font-bold leading-[1.25] text-white transition-colors group-hover:text-[#e63946]/80 sm:text-[22px]">
            {main.title}
          </h2>
          {main.author && main.date && (
            <p className="mt-2 text-[11px] text-gray-300">
              By {main.author} &middot; {main.date}
              {main.reads && ` &middot; ${main.reads} reads`}
            </p>
          )}
        </div>
      </Link>

      {/* Top Right Panel */}
      <Link
        href={`/news/${topRight.slug}`}
        className="group relative overflow-hidden cursor-pointer"
      >
        <div className="relative h-[140px] min-h-[140px]">
          <Image
            src={topRight.image}
            alt=""
            fill
            className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <CategoryTag label={topRight.category} color={topRight.categoryColor} />
          <h3 className="mt-1.5 text-[13px] font-bold leading-snug text-white transition-colors group-hover:text-[#e63946]/80 sm:text-[14px]">
            {topRight.title}
          </h3>
          {topRight.date && (
            <p className="mt-1 text-[10px] text-gray-300">{topRight.date}</p>
          )}
        </div>
      </Link>

      {/* Bottom Right - split into 2 small panels */}
      <div className="grid grid-cols-2 gap-1">
        <Link
          href={`/news/${bottomLeft.slug}`}
          className="group relative overflow-hidden cursor-pointer"
        >
          <div className="relative h-[136px]">
            <Image
              src={bottomLeft.image}
              alt=""
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <CategoryTag label={bottomLeft.category} color={bottomLeft.categoryColor} />
            <h3 className="mt-1 text-[10px] font-bold leading-snug text-white transition-colors group-hover:text-[#e63946]/80 sm:text-[11px]">
              {bottomLeft.title}
            </h3>
          </div>
        </Link>

        <Link
          href={`/news/${bottomRight.slug}`}
          className="group relative overflow-hidden cursor-pointer"
        >
          <div className="relative h-[136px]">
            <Image
              src={bottomRight.image}
              alt=""
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <CategoryTag label={bottomRight.category} color={bottomRight.categoryColor} />
            <h3 className="mt-1 text-[10px] font-bold leading-snug text-white transition-colors group-hover:text-[#e63946]/80 sm:text-[11px]">
              {bottomRight.title}
            </h3>
          </div>
        </Link>
      </div>
    </div>
  );
}
