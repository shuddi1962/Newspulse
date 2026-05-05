'use client';

import { useState } from 'react';
import { Check, Copy, Share2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  url: string;
  title: string;
  excerpt?: string | null;
};

export function ShareButtons({ url, title, excerpt }: Props) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedExcerpt = encodeURIComponent(excerpt ?? '');

  const twitter = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard API unavailable — silently ignore */
    }
  }

  async function handleNativeShare() {
    if (typeof navigator === 'undefined' || !navigator.share) return;
    try {
      await navigator.share({ url, title, text: excerpt ?? undefined });
    } catch {
      /* user cancelled or share failed */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
        Share
      </span>
      <a
        href={twitter}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border-default) text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
      >
        <X className="h-4 w-4" aria-hidden />
      </a>
      <a
        href={facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="inline-flex h-8 items-center justify-center gap-1 rounded-full border border-(--border-default) px-2 text-[0.65rem] font-semibold text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
      >
        <span aria-hidden>f</span>
      </a>
      <a
        href={linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="inline-flex h-8 items-center justify-center gap-1 rounded-full border border-(--border-default) px-2 text-[0.65rem] font-semibold text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
      >
        <span aria-hidden>in</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border-default) text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)',
          copied && 'border-(--color-signal-green) text-(--color-signal-green)',
        )}
        aria-label={copied ? 'Link copied' : 'Copy link'}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      </button>
      <button
        type="button"
        onClick={handleNativeShare}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border-default) text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default) sm:hidden"
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-(--border-default) text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
    >
      {children}
    </a>
  );
}
