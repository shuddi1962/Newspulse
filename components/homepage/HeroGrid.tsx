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
    <div className="mb-8 grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-2">
      {/* Main Panel - spans 2 rows */}
      <Link
        href={`/news/${main.slug}`}
        className="group relative row-span-2 overflow-hidden cursor-pointer"
      >
        <div className="relative h-[300px] sm:h-[380px] lg:h-[460px]">
          <Image
            src={main.image}
            alt=""
            fill
            priority
            className="object-cover transition-transform duration-400 group-hover:scale-[1.03]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <CategoryTag label={main.category} color={main.categoryColor} />
          <h2 className="mt-3 font-display text-xl font-bold leading-[1.25] text-white transition-colors group-hover:text-[#e63946]/80 sm:text-2xl lg:text-[26px]">
            {main.title}
          </h2>
          {main.author && main.date && (
            <p className="mt-2 text-xs text-gray-300">
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
        <div className="relative h-[160px] min-h-[160px]">
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
          <h3 className="mt-2 text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#e63946]/80 lg:text-base">
            {topRight.title}
          </h3>
          {topRight.date && (
            <p className="mt-1.5 text-[11px] text-gray-300">{topRight.date}</p>
          )}
        </div>
      </Link>

      {/* Bottom Right - split into 2 small panels */}
      <div className="grid grid-cols-2 gap-1">
        <Link
          href={`/news/${bottomLeft.slug}`}
          className="group relative overflow-hidden cursor-pointer"
        >
          <div className="relative h-[150px]">
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
            <h3 className="mt-1.5 text-[11px] font-bold leading-snug text-white transition-colors group-hover:text-[#e63946]/80 lg:text-xs">
              {bottomLeft.title}
            </h3>
          </div>
        </Link>

        <Link
          href={`/news/${bottomRight.slug}`}
          className="group relative overflow-hidden cursor-pointer"
        >
          <div className="relative h-[150px]">
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
            <h3 className="mt-1.5 text-[11px] font-bold leading-snug text-white transition-colors group-hover:text-[#e63946]/80 lg:text-xs">
              {bottomRight.title}
            </h3>
          </div>
        </Link>
      </div>
    </div>
  );
}
