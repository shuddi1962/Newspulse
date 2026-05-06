import { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Globe,
  Target,
  Users,
  Shield,
  Zap,
  Layout,
  Video,
  Smartphone,
  Mail,
  Check,
  X,
  ChevronDown,
  Download,
  Megaphone,
  TrendingUp,
  Eye,
  MousePointer,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Advertise with NewsPulse — Reach Millions of Engaged Readers',
  description: 'Self-serve advertising platform with precision targeting, real-time analytics, and premium placements across our news and community platform.',
};

const adFormats = [
  {
    icon: Layout,
    title: 'Display Banners',
    description: 'High-visibility placements in standard sizes: 728×90, 300×250, 300×600.',
    sizes: ['728×90 Leaderboard', '300×250 Medium Rectangle', '300×600 Half Page'],
  },
  {
    icon: Megaphone,
    title: 'Native Article Ads',
    description: 'Blend seamlessly with editorial content for higher engagement.',
    sizes: ['In-feed placement', 'Article sidebar', 'Related content'],
  },
  {
    icon: Video,
    title: 'Video Pre-roll',
    description: 'Reach viewers before video content with 15–30 second spots.',
    sizes: ['15s spot', '30s spot', 'Skip after 5s'],
  },
  {
    icon: Mail,
    title: 'Newsletter Sponsor',
    description: 'Feature your brand in our daily newsletter to 50K+ subscribers.',
    sizes: ['Header placement', 'Dedicated section', 'Footer banner'],
  },
  {
    icon: Smartphone,
    title: 'Mobile Interstitial',
    description: 'Full-screen mobile ads between page transitions.',
    sizes: ['Full-screen', 'Skippable after 3s'],
  },
  {
    icon: Zap,
    title: 'Push Notifications',
    description: 'Direct-to-device alerts for time-sensitive promotions.',
    sizes: ['Single push', 'Drip campaign'],
  },
];

const targetingOptions = [
  { icon: Globe, title: 'Geographic', description: 'Country, region, city, or radius targeting.' },
  { icon: Target, title: 'Contextual', description: 'Match ads to article topics and categories.' },
  { icon: Users, title: 'Audience', description: 'Demographics, interests, and reading behavior.' },
  { icon: BarChart3, title: 'Behavioral', description: 'Retarget based on past interactions.' },
  { icon: Shield, title: 'Brand Safe', description: 'Exclude sensitive categories automatically.' },
  { icon: Zap, title: 'Dayparting', description: 'Schedule ads for peak engagement hours.' },
];

const pricingTiers = [
  {
    name: 'Self-Serve',
    price: 'From $5/day',
    description: 'Full control via our dashboard.',
    features: [
      'Campaign wizard & management',
      'Real-time analytics',
      'All ad formats',
      'Audience targeting',
      'Budget controls',
      'A/B creative testing',
      'Email support',
    ],
    cta: 'Start a Campaign',
    href: '/ads',
  },
  {
    name: 'Managed Service',
    price: 'Custom pricing',
    description: 'Our team runs your campaigns.',
    features: [
      'Dedicated account manager',
      'Creative production',
      'Advanced strategy & planning',
      'Custom audience segments',
      'Premium guaranteed placements',
      'Weekly performance reports',
      'Quarterly business reviews',
      'Priority support (SLA)',
    ],
    cta: 'Contact Sales',
    href: '/contact',
    highlighted: true,
  },
];

const caseStudies = [
  {
    company: 'TechCorp Inc.',
    metric: '3.2× ROI',
    description: 'Increased brand awareness by 140% through a 30-day display + native campaign targeting tech readers.',
    category: 'Technology',
  },
  {
    company: 'GreenLeaf Foods',
    metric: '12K leads',
    description: 'Generated 12,000 qualified leads at $4.20 CPA using geo-targeted native ads across lifestyle sections.',
    category: 'Food & Beverage',
  },
  {
    company: 'Metro Bank',
    metric: '45% CTR lift',
    description: 'Video pre-roll ads in the business section drove a 45% higher CTR vs. industry benchmarks.',
    category: 'Financial Services',
  },
];

const faqs = [
  {
    q: 'What is the minimum budget to start?',
    a: 'Self-serve campaigns start at $5/day with no minimum commitment. Managed service engagements typically start at $5,000/month.',
  },
  {
    q: 'How long does ad review take?',
    a: 'Most creatives are reviewed within 4 business hours. Complex formats (video, interactive) may take up to 24 hours.',
  },
  {
    q: 'Can I target specific article categories?',
    a: 'Yes. Our contextual targeting lets you place ads within specific categories like Business, Technology, Sports, Lifestyle, and more.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, bank transfers, and cryptocurrency payments via our Paystack and Flutterwave integrations.',
  },
  {
    q: 'Do you offer volume discounts?',
    a: 'Yes. Accounts spending over $10,000/month qualify for preferred CPM rates. Contact our sales team for custom pricing.',
  },
  {
    q: 'Is there a brand safety guarantee?',
    a: 'All ads run alongside verified editorial content. You can exclude specific categories and keywords to ensure brand alignment.',
  },
];

export default function AdvertisePage() {
  return (
    <div className="flex flex-col">
      <section className="border-b border-(--border-subtle) bg-(--bg-surface)">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-(--color-ocean-blue)">
            Advertising platform
          </p>
          <h1 className="mb-6 text-4xl font-semibold tracking-tight text-(--fg-base) md:text-5xl">
            Reach millions of engaged readers
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-(--fg-muted)">
            Precision-targeted advertising across our news and community platform. Self-serve dashboard, real-time analytics, and premium placements.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/ads/create" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Start a Campaign
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="#pricing" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <AudienceStats />

      <section className="border-b border-(--border-subtle) bg-(--bg-surface)">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
              Ad formats for every objective
            </h2>
            <p className="mt-2 text-(--fg-muted)">
              From display banners to video pre-roll, choose the format that fits your campaign.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {adFormats.map((format) => {
              const Icon = format.icon;
              return (
                <div key={format.title} className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-(--bg-surface-subtle)">
                    <Icon className="h-5 w-5 text-(--fg-base)" aria-hidden />
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-(--fg-base)">{format.title}</h3>
                  <p className="mb-3 text-sm text-(--fg-muted)">{format.description}</p>
                  <ul className="space-y-1">
                    {format.sizes.map((size) => (
                      <li key={size} className="flex items-center gap-2 text-xs text-(--fg-subtle)">
                        <span className="h-1 w-1 rounded-full bg-(--fg-subtle)" />
                        {size}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <TargetingSection />

      <section id="pricing" className="border-b border-(--border-subtle) bg-(--bg-surface-subtle)">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-(--fg-base)">Simple, transparent pricing</h2>
            <p className="mt-2 text-(--fg-muted)">Choose self-serve for full control or let our team manage your campaigns.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-lg border ${
                  tier.highlighted
                    ? 'border-(--color-ink-black) bg-(--bg-surface) shadow-sm'
                    : 'border-(--border-subtle) bg-(--bg-surface)'
                }`}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-(--fg-base)">{tier.name}</h3>
                  <p className="mt-1 text-sm text-(--fg-muted)">{tier.description}</p>
                  <p className="mt-4 text-3xl font-semibold tracking-tight text-(--fg-base)">{tier.price}</p>
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-(--fg-base)">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-(--color-forest-green)" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={tier.href}
                    className={`mt-8 block text-center ${buttonVariants({
                      variant: tier.highlighted ? 'primary' : 'secondary',
                      size: 'md',
                      className: 'w-full',
                    })}`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CaseStudies />

      <HowItWorks />

      <Comparison />

      <FAQ />

      <section className="bg-(--bg-surface)">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-(--fg-base)">
            Ready to reach our audience?
          </h2>
          <p className="mb-8 text-(--fg-muted)">
            Start a self-serve campaign in minutes, or talk to our team about custom solutions.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/ads/create" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Start a Campaign
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/contact" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function AudienceStats() {
  const stats = [
    { icon: Users, label: 'Monthly readers', value: '2.4M+' },
    { icon: Eye, label: 'Monthly page views', value: '18M+' },
    { icon: TrendingUp, label: 'Avg. session duration', value: '6m 42s' },
    { icon: MousePointer, label: 'Avg. CTR (display)', value: '1.8%' },
  ];

  return (
    <section className="border-b border-(--border-subtle) bg-(--bg-surface-subtle)">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <Icon className="mx-auto mb-3 h-6 w-6 text-(--fg-muted)" aria-hidden />
                <p className="text-2xl font-semibold tracking-tight text-(--fg-base)">{stat.value}</p>
                <p className="mt-1 text-sm text-(--fg-muted)">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TargetingSection() {
  return (
    <section className="border-b border-(--border-subtle) bg-(--bg-surface)">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-(--fg-base)">Precision targeting</h2>
          <p className="mt-2 text-(--fg-muted)">Reach the right audience at the right time with our advanced targeting options.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {targetingOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <div key={opt.title} className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-(--bg-surface-subtle)">
                  <Icon className="h-5 w-5 text-(--fg-base)" aria-hidden />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-(--fg-base)">{opt.title}</h3>
                <p className="text-sm text-(--fg-muted)">{opt.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CaseStudies() {
  return (
    <section className="border-b border-(--border-subtle) bg-(--bg-surface)">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-(--fg-base)">Proven results</h2>
          <p className="mt-2 text-(--fg-muted)">See how advertisers are achieving their goals on our platform.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {caseStudies.map((cs) => (
            <div key={cs.company} className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-(--color-ocean-blue)">
                {cs.category}
              </p>
              <p className="mb-3 text-2xl font-semibold tracking-tight text-(--fg-base)">{cs.metric}</p>
              <p className="mb-3 text-sm text-(--fg-muted)">{cs.description}</p>
              <p className="text-sm font-medium text-(--fg-base)">— {cs.company}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { num: '1', title: 'Create your account', description: 'Sign up and set up your advertiser profile in minutes.' },
    { num: '2', title: 'Build your campaign', description: 'Choose your objective, audience, budget, and ad creative.' },
    { num: '3', title: 'Launch & monitor', description: 'Go live and track performance in real-time from your dashboard.' },
    { num: '4', title: 'Optimize & scale', description: 'Use data-driven insights to refine targeting and increase ROI.' },
  ];

  return (
    <section className="border-b border-(--border-subtle) bg-(--bg-surface-subtle)">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-(--fg-base)">How it works</h2>
          <p className="mt-2 text-(--fg-muted)">Get your first campaign running in four simple steps.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-(--color-ink-black) text-lg font-semibold text-(--color-paper)">
                {step.num}
              </div>
              <h3 className="mb-1 text-base font-semibold text-(--fg-base)">{step.title}</h3>
              <p className="text-sm text-(--fg-muted)">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const features = [
    'Campaign setup time',
    'Budget flexibility',
    'Creative control',
    'Real-time optimization',
    'Analytics dashboard',
    'Dedicated support',
    'Custom reporting',
    'Premium placements',
  ];

  return (
    <section className="border-b border-(--border-subtle) bg-(--bg-surface)">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-(--fg-base)">Self-serve vs. Managed</h2>
          <p className="mt-2 text-(--fg-muted)">Compare our two advertising options to find the right fit.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Feature</th>
                <th className="pb-3 px-4 text-center font-medium text-(--fg-base)">Self-Serve</th>
                <th className="pb-3 px-4 text-center font-medium text-(--fg-base)">Managed</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr key={feature} className={idx > 0 ? 'border-t border-(--border-subtle)' : ''}>
                  <td className="py-3 pr-6 text-(--fg-base)">{feature}</td>
                  <td className="px-4 text-center">
                    {idx < 5 ? (
                      <Check className="mx-auto h-4 w-4 text-(--color-forest-green)" />
                    ) : (
                      <X className="mx-auto h-4 w-4 text-(--fg-subtle)" />
                    )}
                  </td>
                  <td className="px-4 text-center">
                    <Check className="mx-auto h-4 w-4 text-(--color-forest-green)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className="border-b border-(--border-subtle) bg-(--bg-surface-subtle)">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-(--fg-base)">Frequently asked questions</h2>
        </div>
        <div className="mx-auto max-w-3xl space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="text-base font-semibold text-(--fg-base)">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--fg-muted)">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/contact" className={buttonVariants({ variant: 'secondary', size: 'md' })}>
            Still have questions? Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
