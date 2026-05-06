'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

type ServedAd = {
  id: string;
  name: string;
  creative_format: string;
  headline: string | null;
  body_text: string | null;
  call_to_action: string | null;
  image_url: string | null;
  video_url: string | null;
  destination_url: string;
};

type AdSlotProps = {
  position: string;
  pagePath?: string;
  categoryId?: string;
  className?: string;
  fallback?: React.ReactNode;
};

type SizeConfig = {
  width: string;
  height: string;
  className: string;
};

const SIZE_MAP: Record<string, SizeConfig> = {
  header: { width: '728px', height: '90px', className: 'w-full max-w-[728px] h-[90px]' },
  sidebar: { width: '300px', height: '250px', className: 'w-[300px] h-[250px]' },
  in_feed: { width: '100%', height: 'auto', className: 'w-full' },
  between_articles: { width: '728px', height: '90px', className: 'w-full max-w-[728px] h-[90px]' },
  sticky_footer: { width: '728px', height: '90px', className: 'w-full max-w-[728px] h-[90px]' },
  article_top: { width: '100%', height: 'auto', className: 'w-full' },
  article_bottom: { width: '100%', height: 'auto', className: 'w-full' },
  homepage_hero: { width: '100%', height: 'auto', className: 'w-full' },
  category_top: { width: '100%', height: 'auto', className: 'w-full' },
  search_results: { width: '100%', height: 'auto', className: 'w-full' },
};

function getSessionId(): string {
  let sid = sessionStorage.getItem('ad_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem('ad_session_id', sid);
  }
  return sid;
}

export function AdSlot({ position, pagePath, categoryId, className, fallback }: AdSlotProps) {
  const [ad, setAd] = useState<ServedAd | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAd = useCallback(async () => {
    setLoading(true);
    const sessionId = getSessionId();
    const params = new URLSearchParams();
    if (pagePath) params.set('path', pagePath);
    if (categoryId) params.set('category', categoryId);
    params.set('session', sessionId);

    try {
      const res = await fetch(`/api/ads/${position}?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.ad) {
        setAd(data.ad);
      }
    } catch {
      // Silently fail — ads should never break the page
    } finally {
      setLoading(false);
    }
  }, [position, pagePath, categoryId]);

  useEffect(() => {
    fetchAd();
  }, [fetchAd]);

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-surface-subtle)',
          SIZE_MAP[position]?.className,
          className,
        )}
      >
        <div className="h-4 w-24 animate-pulse rounded bg-(--border-subtle)" />
      </div>
    );
  }

  if (!ad) {
    return fallback ? (
      <div className={cn(SIZE_MAP[position]?.className, className)}>{fallback}</div>
    ) : null;
  }

  const clickUrl = `/api/ads/click/${ad.id}`;

  if (ad.creative_format === 'banner') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface)',
          SIZE_MAP[position]?.className,
          className,
        )}
      >
        {ad.image_url ? (
          <a href={clickUrl} target="_blank" rel="noopener noreferrer nofollow">
            <img
              src={ad.image_url}
              alt={ad.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </a>
        ) : (
          <a
            href={clickUrl}
            className="flex h-full w-full items-center justify-center px-4"
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            <div className="text-center">
              {ad.headline && (
                <p className="text-sm font-semibold text-(--fg-base)">{ad.headline}</p>
              )}
              {ad.body_text && (
                <p className="mt-1 text-xs text-(--fg-muted)">{ad.body_text}</p>
              )}
              {ad.call_to_action && (
                <p className="mt-2 text-xs font-medium text-(--ocean-blue)">{ad.call_to_action}</p>
              )}
            </div>
          </a>
        )}
        <span className="absolute right-1 top-1 rounded bg-(--bg-surface)/80 px-1.5 py-0.5 text-[10px] text-(--fg-subtle)">
          Ad
        </span>
      </div>
    );
  }

  if (ad.creative_format === 'native') {
    return (
      <div
        className={cn(
          'rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4',
          className,
        )}
      >
        <div className="flex items-start gap-3">
          {ad.image_url && (
            <img
              src={ad.image_url}
              alt={ad.name}
              className="h-16 w-16 shrink-0 rounded-md object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-(--bg-surface-subtle) px-1.5 py-0.5 text-[10px] font-medium text-(--fg-subtle)">
                Sponsored
              </span>
            </div>
            <a
              href={clickUrl}
              className="text-sm font-semibold text-(--fg-base) hover:underline"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {ad.headline ?? ad.name}
            </a>
            {ad.body_text && (
              <p className="mt-1 text-xs text-(--fg-muted) line-clamp-2">{ad.body_text}</p>
            )}
            {ad.call_to_action && (
              <p className="mt-2 text-xs font-medium text-(--ocean-blue)">{ad.call_to_action}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (ad.creative_format === 'sticky_footer') {
    return (
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 border-t border-(--border-subtle) bg-(--bg-surface) px-4 py-2',
          className,
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            {ad.image_url && (
              <img
                src={ad.image_url}
                alt={ad.name}
                className="h-10 w-10 shrink-0 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-(--fg-base)">{ad.headline ?? ad.name}</p>
              {ad.body_text && (
                <p className="truncate text-xs text-(--fg-muted)">{ad.body_text}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={clickUrl}
              className="rounded bg-(--color-ink-black) px-3 py-1.5 text-xs font-medium text-(--color-paper) hover:bg-(--color-ink-dark)"
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              {ad.call_to_action ?? 'Learn More'}
            </a>
            <span className="text-[10px] text-(--fg-subtle)">Ad</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-4',
        SIZE_MAP[position]?.className,
        className,
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded bg-(--bg-surface-subtle) px-1.5 py-0.5 text-[10px] font-medium text-(--fg-subtle)">
          Sponsored
        </span>
      </div>
      {ad.image_url && (
        <img
          src={ad.image_url}
          alt={ad.name}
          className="mb-3 w-full rounded-md object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      {ad.headline && (
        <h3 className="text-sm font-semibold text-(--fg-base)">{ad.headline}</h3>
      )}
      {ad.body_text && (
        <p className="mt-1 text-xs text-(--fg-muted)">{ad.body_text}</p>
      )}
      {ad.call_to_action && (
        <a
          href={clickUrl}
          className="mt-3 inline-block text-xs font-medium text-(--ocean-blue) hover:underline"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {ad.call_to_action}
        </a>
      )}
    </div>
  );
}
