import Link from 'next/link';
import { Siren } from 'lucide-react';
import type { PublicArticleCard } from '@/lib/db/public-articles';

type Props = {
  articles: PublicArticleCard[];
};

export function BreakingStrip({ articles }: Props) {
  if (articles.length === 0) return null;

  return (
    <div className="border-b border-(--border-default) bg-(--color-signal-red)">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-4 px-6 py-2 text-sm text-white">
        <span className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em]">
          <Siren className="h-3.5 w-3.5" aria-hidden />
          Breaking
        </span>
        <div className="flex flex-1 gap-6 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/article/${a.slug}`}
              className="font-medium hover:underline"
            >
              {a.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
