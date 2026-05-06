import Link from 'next/link';
import { Lock, Sparkles, ArrowRight, Check } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

type PaywallOverlayProps = {
  articleTitle: string;
};

export function PaywallOverlay({ articleTitle }: PaywallOverlayProps) {
  return (
    <div className="relative">
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-(--bg-base) to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-6 border-t border-(--border-subtle) bg-(--bg-base) px-6 pb-16 pt-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted)">
          <Lock className="h-5 w-5 text-(--fg-muted)" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold tracking-tight text-(--fg-default)">
            Continue reading with a subscription
          </h3>
          <p className="mt-2 max-w-md text-sm text-(--fg-muted)">
            &ldquo;{articleTitle}&rdquo; is reserved for Premium and VIP subscribers.
            Unlock unlimited access to all NewsPulse PRO content.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/subscribe" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Subscribe now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link href="/login" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            Sign in
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {['Unlimited articles', 'Ad-free experience', 'Exclusive newsletters'].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-(--fg-muted)">
              <Check className="h-4 w-4 text-(--color-forest-green)" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PaywallMeter({ articlesRead, maxFree = 3 }: { articlesRead: number; maxFree?: number }) {
  const remaining = Math.max(maxFree - articlesRead, 0);

  if (remaining > 0) {
    return (
      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-(--color-cat-lifestyle)" />
          <p className="text-sm text-(--fg-muted)">
            You've read {articlesRead} of {maxFree} free articles this month.{' '}
            <Link href="/subscribe" className="font-medium text-(--color-ocean-blue) hover:underline">
              Upgrade to keep reading.
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-(--color-ocean-blue)/20 bg-(--color-ocean-blue)/5 px-4 py-3">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-(--color-ocean-blue)" />
        <p className="text-sm text-(--fg-default)">
          You've reached your free article limit for this month.{' '}
          <Link href="/subscribe" className="font-medium text-(--color-ocean-blue) hover:underline">
            Subscribe now
          </Link>{' '}
          to continue reading.
        </p>
      </div>
    </div>
  );
}
