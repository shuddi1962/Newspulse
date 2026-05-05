import { Metadata } from 'next';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth/session';
import { listActivePlans } from '@/lib/db/subscriptions';
import type { SubscriptionPlan } from '@/lib/db/types';

export const metadata: Metadata = {
  title: 'Subscribe — NewsPulse PRO',
  description: 'Unlock premium journalism, exclusive insights, and an ad-free reading experience.',
};

const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: 'fallback-free',
    code: 'free',
    name: 'Free',
    description: 'Essential news access with ads.',
    plan_tier: 'free',
    price: '0',
    currency: 'USD',
    interval: 'month',
    interval_count: 1,
    trial_days: 0,
    features_json: {
      breaking_news: true,
      category_access: true,
      directory_listings: true,
      job_board_access: true,
      marketplace_access: true,
      ad_free: false,
      premium_articles: false,
      newsletters: false,
      early_access: false,
      priority_support: false,
      events_discount: false,
      analytics_dashboard: false,
    },
    is_active: true,
    display_order: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-premium',
    code: 'premium',
    name: 'Premium',
    description: 'Full access to premium journalism and community features.',
    plan_tier: 'premium',
    price: '9.99',
    currency: 'USD',
    interval: 'month',
    interval_count: 1,
    trial_days: 7,
    features_json: {
      breaking_news: true,
      category_access: true,
      directory_listings: true,
      job_board_access: true,
      marketplace_access: true,
      ad_free: true,
      premium_articles: true,
      newsletters: true,
      early_access: false,
      priority_support: false,
      events_discount: false,
      analytics_dashboard: false,
    },
    is_active: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'fallback-vip',
    code: 'vip',
    name: 'VIP',
    description: 'Everything in Premium plus exclusive events and priority support.',
    plan_tier: 'vip',
    price: '24.99',
    currency: 'USD',
    interval: 'month',
    interval_count: 1,
    trial_days: 14,
    features_json: {
      breaking_news: true,
      category_access: true,
      directory_listings: true,
      job_board_access: true,
      marketplace_access: true,
      ad_free: true,
      premium_articles: true,
      newsletters: true,
      early_access: true,
      priority_support: true,
      events_discount: true,
      analytics_dashboard: false,
    },
    is_active: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const FEATURE_LABELS: Record<string, string> = {
  breaking_news: 'Breaking news alerts',
  category_access: 'All category access',
  directory_listings: 'Business directory',
  job_board_access: 'Job board',
  marketplace_access: 'Marketplace',
  ad_free: 'Ad-free reading',
  premium_articles: 'Premium articles',
  newsletters: 'Exclusive newsletters',
  early_access: 'Early access to features',
  priority_support: 'Priority support',
  events_discount: 'Event discounts',
  analytics_dashboard: 'Analytics dashboard',
};

function formatPrice(price: string, _currency: string, interval: string, annual: boolean): string {
  const num = parseFloat(price);
  if (num === 0) return 'Free';
  if (annual && interval === 'month') {
    const annualPrice = (num * 12 * 0.8).toFixed(2);
    return `$${annualPrice}/yr`;
  }
  return `$${num}/${interval === 'month' ? 'mo' : interval}`;
}

export default async function SubscribePage() {
  const [user, plansRes] = await Promise.all([getCurrentUser(), listActivePlans()]);
  const plans = plansRes.status === 'ok' && plansRes.data.length > 0
    ? plansRes.data
    : FALLBACK_PLANS;

  return (
    <div className="flex flex-col">
      <section className="border-b border-(--border-subtle) bg-(--bg-surface)">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-(--fg-muted)">
            Subscription plans
          </p>
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-(--fg-base) md:text-5xl">
            Invest in journalism that matters
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-(--fg-muted)">
            Support independent reporting. Get ad-free reading, premium analysis,
            and exclusive access to our community features.
          </p>
        </div>
      </section>

      <PricingGrid plans={plans} isAuthenticated={!!user} />

      <section className="border-b border-(--border-subtle) bg-(--bg-surface)">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">
            Compare plans
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="pb-3 px-4 text-center font-medium text-(--fg-base)">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(FEATURE_LABELS).map(([key, label], idx) => (
                  <tr key={key} className={idx > 0 ? 'border-t border-(--border-subtle)' : ''}>
                    <td className="py-3 pr-6 text-(--fg-base)">{label}</td>
                    {plans.map((plan) => {
                      const features = plan.features_json as Record<string, boolean>;
                      const val = features[key];
                      return (
                        <td key={plan.id} className="px-4 text-center">
                          {val ? (
                            <Check className="mx-auto h-4 w-4 text-(--color-forest-green)" />
                          ) : (
                            <X className="mx-auto h-4 w-4 text-(--fg-subtle)" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-(--bg-surface-subtle)">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight">
            Frequently asked questions
          </h2>
          <div className="mx-auto max-w-3xl space-y-6">
            <FaqItem
              q="Can I cancel my subscription at any time?"
              a="Yes. Cancel from your account settings at any point. You retain access through the end of your current billing period. No questions asked, no hidden fees."
            />
            <FaqItem
              q="What payment methods do you accept?"
              a="We accept all major credit cards (Visa, Mastercard, Amex), PayPal, and cryptocurrency via our Paystack and Flutterwave integrations for African markets."
            />
            <FaqItem
              q="Do you offer team or enterprise plans?"
              a="Yes. Contact our sales team at goodnewsonyematara2020@gmail.com for custom pricing on multi-seat licenses, API access, and white-label options."
            />
            <FaqItem
              q="Is there a free trial?"
              a="Premium comes with a 7-day free trial. VIP subscribers get 14 days. No credit card required to start."
            />
          </div>
        </div>
      </section>

      <section className="border-t border-(--border-subtle) bg-(--bg-surface)">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight">
            Still have questions?
          </h2>
          <p className="mb-8 text-(--fg-muted)">
            Our team is available to help you find the right plan.
          </p>
          <Link
            href="/contact"
            className={buttonVariants({ variant: 'primary', size: 'lg' })}
          >
            Contact us
          </Link>
        </div>
      </section>
    </div>
  );
}

function PricingGrid({
  plans,
  isAuthenticated,
}: {
  plans: SubscriptionPlan[];
  isAuthenticated: boolean;
}) {
  return (
    <section className="bg-(--bg-surface-subtle)">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const features = plan.features_json as Record<string, boolean>;
            const featureList = Object.entries(FEATURE_LABELS)
              .filter(([key]) => features[key])
              .map(([, label]) => label);
            const isPremium = plan.plan_tier === 'premium';

            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-lg border ${
                  isPremium
                    ? 'border-(--color-ink-black) bg-(--bg-surface) shadow-sm'
                    : 'border-(--border-subtle) bg-(--bg-surface)'
                }`}
              >
                {isPremium && (
                  <div className="rounded-t-lg bg-(--color-ink-black) px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-(--color-paper)">
                    Most popular
                  </div>
                )}
                <div className={`flex flex-1 flex-col p-6 ${isPremium ? 'pt-4' : ''}`}>
                  <h3 className="text-lg font-semibold text-(--fg-base)">{plan.name}</h3>
                  {plan.description && (
                    <p className="mt-1 text-sm text-(--fg-muted)">{plan.description}</p>
                  )}
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-semibold tracking-tight text-(--fg-base)">
                      {formatPrice(plan.price, plan.currency, plan.interval, false)}
                    </span>
                  </div>
                  {plan.trial_days > 0 && (
                    <p className="mt-1 text-xs text-(--color-forest-green)">
                      {plan.trial_days}-day free trial
                    </p>
                  )}
                  <ul className="mt-6 flex-1 space-y-3">
                    {featureList.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-(--fg-base)">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--color-forest-green)" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Link
                      href={isAuthenticated ? `/subscribe/${plan.code}` : '/login?next=/subscribe'}
                      className={`block text-center ${buttonVariants({
                        variant: isPremium ? 'primary' : 'secondary',
                        size: 'md',
                        className: 'w-full',
                      })}`}
                    >
                      {plan.plan_tier === 'free'
                        ? 'Get started'
                        : `Start ${plan.trial_days > 0 ? 'free trial' : 'subscription'}`}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-(--fg-base)">{q}</h3>
      <p className="mt-2 text-sm leading-relaxed text-(--fg-muted)">{a}</p>
    </div>
  );
}
