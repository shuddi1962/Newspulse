'use client';

import Link from 'next/link';
import { Siren, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { PublicArticleCard } from '@/lib/db/public-articles';

type Props = {
  articles: PublicArticleCard[];
};

export function BreakingStrip({ articles }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('breaking-strip-dismissed');
    if (saved === 'true') setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('breaking-strip-dismissed', 'true');
  };

  if (articles.length === 0 || dismissed) return null;

  return (
    <div className="relative border-b border-(--border-default) bg-(--color-signal-red)">
      <div
        className="mx-auto flex w-full max-w-screen-2xl items-center gap-4 overflow-hidden px-6 py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <span className="inline-flex shrink-0 items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-white">
          <Siren className="h-3.5 w-3.5" aria-hidden />
          Breaking
        </span>
        <div className="relative flex-1 overflow-hidden" ref={scrollRef}>
          <div
            className={`flex gap-12 whitespace-nowrap ${isPaused ? '' : 'animate-scroll'}`}
          >
            {[...articles, ...articles].map((a, i) => (
              <Link
                key={`${a.id}-${i}`}
                href={`/article/${a.slug}`}
                className="text-sm font-medium text-white/90 transition-colors hover:text-white hover:underline"
              >
                {a.title}
                <span className="mx-3 inline-block text-white/40">•</span>
              </Link>
            ))}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="shrink-0 rounded p-0.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close breaking news"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
