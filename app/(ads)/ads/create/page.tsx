'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Target, Users, Layout, DollarSign, Image, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  AdObjective,
  AdBillingModel,
  AdCreativeFormat,
  AdSlotPosition,
} from '@/lib/db/types';

const steps = [
  { id: 0, label: 'Objective', icon: Target },
  { id: 1, label: 'Audience', icon: Users },
  { id: 2, label: 'Placement', icon: Layout },
  { id: 3, label: 'Budget', icon: DollarSign },
  { id: 4, label: 'Creative', icon: Image },
  { id: 5, label: 'Review', icon: Rocket },
];

const objectives: { value: AdObjective; label: string; description: string }[] = [
  { value: 'awareness', label: 'Brand Awareness', description: 'Maximize reach and visibility for your brand.' },
  { value: 'traffic', label: 'Traffic', description: 'Drive visitors to your website or landing page.' },
  { value: 'conversions', label: 'Conversions', description: 'Encourage purchases, sign-ups, or other actions.' },
  { value: 'leads', label: 'Lead Generation', description: 'Collect contact information from potential customers.' },
  { value: 'app_installs', label: 'App Installs', description: 'Promote your mobile app and drive installs.' },
  { value: 'engagement', label: 'Engagement', description: 'Boost interactions with your content or brand.' },
];

const billingModels: { value: AdBillingModel; label: string; description: string }[] = [
  { value: 'cpm', label: 'CPM', description: 'Cost per 1,000 impressions' },
  { value: 'cpc', label: 'CPC', description: 'Cost per click' },
  { value: 'cpa', label: 'CPA', description: 'Cost per action/conversion' },
  { value: 'flat_rate', label: 'Flat Rate', description: 'Fixed fee for a set period' },
];

const creativeFormats: { value: AdCreativeFormat; label: string; dimensions: string }[] = [
  { value: 'banner', label: 'Display Banner', dimensions: '728×90, 300×250, 300×600' },
  { value: 'native', label: 'Native Article', dimensions: 'Blends with content' },
  { value: 'video', label: 'Video Pre-roll', dimensions: '16:9, 15–30s' },
  { value: 'sponsored_post', label: 'Sponsored Post', dimensions: 'Full article' },
  { value: 'popup', label: 'Interstitial', dimensions: 'Full-screen overlay' },
  { value: 'sticky_footer', label: 'Sticky Footer', dimensions: '728×90 fixed' },
];

const placements: { value: AdSlotPosition; label: string }[] = [
  { value: 'header', label: 'Site Header' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'in_feed', label: 'In-Feed Native' },
  { value: 'between_articles', label: 'Between Articles' },
  { value: 'article_top', label: 'Article Top' },
  { value: 'article_bottom', label: 'Article Bottom' },
  { value: 'homepage_hero', label: 'Homepage Hero' },
  { value: 'category_top', label: 'Category Top' },
  { value: 'search_results', label: 'Search Results' },
  { value: 'sticky_footer', label: 'Sticky Footer' },
];

type FormData = {
  name: string;
  objective: AdObjective | '';
  billingModel: AdBillingModel | '';
  bidAmount: string;
  dailyBudget: string;
  totalBudget: string;
  startDate: string;
  endDate: string;
  selectedPlacements: AdSlotPosition[];
  creativeFormat: AdCreativeFormat | '';
  headline: string;
  bodyText: string;
  callToAction: string;
  destinationUrl: string;
  imageUrl: string;
  targetingCountries: string;
  targetingInterests: string;
};

const initialFormData: FormData = {
  name: '',
  objective: '',
  billingModel: '',
  bidAmount: '',
  dailyBudget: '',
  totalBudget: '',
  startDate: '',
  endDate: '',
  selectedPlacements: [],
  creativeFormat: '',
  headline: '',
  bodyText: '',
  callToAction: '',
  destinationUrl: '',
  imageUrl: '',
  targetingCountries: '',
  targetingInterests: '',
};

export default function CreateCampaignPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const togglePlacement = (position: AdSlotPosition) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlacements: prev.selectedPlacements.includes(position)
        ? prev.selectedPlacements.filter((p) => p !== position)
        : [...prev.selectedPlacements, position],
    }));
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return formData.name.trim().length > 0 && formData.objective !== '';
      case 1:
        return true;
      case 2:
        return formData.creativeFormat !== '' && formData.selectedPlacements.length > 0;
      case 3:
        return formData.billingModel !== '' && formData.bidAmount !== '' && parseFloat(formData.bidAmount) > 0;
      case 4:
        return formData.headline.trim().length > 0 && formData.destinationUrl.trim().length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    setSubmitting(false);
    router.push('/ads');
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/ads" className="text-(--fg-muted) transition-colors hover:text-(--fg-base)">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
            Create Campaign
          </h1>
          <p className="text-sm text-(--fg-muted)">
            Set up a new ad campaign in six steps.
          </p>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, idx) => {
          const isComplete = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div key={step.id} className="flex min-w-0 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  isComplete
                    ? 'bg-(--color-forest-green) text-white'
                    : isCurrent
                    ? 'bg-(--color-ink-black) text-(--color-paper)'
                    : 'border border-(--border-subtle) text-(--fg-muted)'
                }`}
              >
                {isComplete ? <Check className="h-4 w-4" /> : idx + 1}
              </div>
              <span
                className={`whitespace-nowrap text-sm ${
                  isCurrent ? 'font-medium text-(--fg-base)' : 'text-(--fg-muted)'
                }`}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && (
                <div className="mx-2 h-px w-6 shrink-0 bg-(--border-subtle)" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
          {currentStep === 0 && <StepObjective formData={formData} update={update} />}
          {currentStep === 1 && <StepAudience formData={formData} update={update} />}
          {currentStep === 2 && <StepPlacement formData={formData} update={update} togglePlacement={togglePlacement} />}
          {currentStep === 3 && <StepBudget formData={formData} update={update} />}
          {currentStep === 4 && <StepCreative formData={formData} update={update} />}
          {currentStep === 5 && <StepReview formData={formData} />}

          <div className="mt-8 flex items-center justify-between border-t border-(--border-subtle) pt-6">
            <button
              type="button"
              onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
              disabled={currentStep === 0}
              className="inline-flex items-center gap-2 text-sm text-(--fg-muted) transition-colors hover:text-(--fg-base) disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </button>
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => Math.min(5, s + 1))}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-5 py-2 text-sm font-medium text-(--color-paper) transition-colors hover:bg-(--color-ink-dark) disabled:pointer-events-none disabled:opacity-40"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                variant="primary"
              >
                {submitting ? 'Launching...' : 'Launch Campaign'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepObjective({
  formData,
  update,
}: {
  formData: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-(--fg-base)">Campaign objective</h2>
      <p className="mb-6 text-sm text-(--fg-muted)">
        What do you want to achieve with this campaign?
      </p>
      <div className="mb-6">
        <Label htmlFor="campaign-name">Campaign name</Label>
        <Input
          id="campaign-name"
          placeholder="e.g. Spring Sale 2026"
          value={formData.name}
          onChange={(e) => update('name', e.target.value)}
          className="mt-2"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {objectives.map((obj) => (
          <button
            key={obj.value}
            type="button"
            onClick={() => update('objective', obj.value)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              formData.objective === obj.value
                ? 'border-(--color-ink-black) bg-(--bg-surface-subtle)'
                : 'border-(--border-subtle) hover:border-(--border-strong)'
            }`}
          >
            <p className="text-sm font-medium text-(--fg-base)">{obj.label}</p>
            <p className="mt-1 text-xs text-(--fg-muted)">{obj.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepAudience({
  formData,
  update,
}: {
  formData: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-(--fg-base)">Target audience</h2>
      <p className="mb-6 text-sm text-(--fg-muted)">
        Define who should see your ads. Leave blank to target all readers.
      </p>
      <div className="mb-4">
        <Label htmlFor="targeting-countries">Countries</Label>
        <Input
          id="targeting-countries"
          placeholder="e.g. United States, United Kingdom, Nigeria"
          value={formData.targetingCountries}
          onChange={(e) => update('targetingCountries', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="targeting-interests">Interests / Categories</Label>
        <Input
          id="targeting-interests"
          placeholder="e.g. Technology, Business, Sports"
          value={formData.targetingInterests}
          onChange={(e) => update('targetingInterests', e.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function StepPlacement({
  formData,
  update,
  togglePlacement,
}: {
  formData: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  togglePlacement: (position: AdSlotPosition) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-(--fg-base)">Placement & format</h2>
      <p className="mb-6 text-sm text-(--fg-muted)">
        Choose where your ads appear and what format they use.
      </p>
      <div className="mb-6">
        <Label className="mb-3 block">Ad format</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {creativeFormats.map((fmt) => (
            <button
              key={fmt.value}
              type="button"
              onClick={() => update('creativeFormat', fmt.value)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                formData.creativeFormat === fmt.value
                  ? 'border-(--color-ink-black) bg-(--bg-surface-subtle)'
                  : 'border-(--border-subtle) hover:border-(--border-strong)'
              }`}
            >
              <p className="text-sm font-medium text-(--fg-base)">{fmt.label}</p>
              <p className="mt-1 text-xs text-(--fg-muted)">{fmt.dimensions}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-3 block">Ad placements</Label>
        <div className="grid gap-2 sm:grid-cols-3">
          {placements.map((p) => {
            const selected = formData.selectedPlacements.includes(p.value);
            return (
              <button
                key={p.value}
                type="button"
                onClick={() => togglePlacement(p.value)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  selected
                    ? 'border-(--color-ink-black) bg-(--bg-surface-subtle) font-medium text-(--fg-base)'
                    : 'border-(--border-subtle) text-(--fg-muted) hover:border-(--border-strong)'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StepBudget({
  formData,
  update,
}: {
  formData: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-(--fg-base)">Budget & bidding</h2>
      <p className="mb-6 text-sm text-(--fg-muted)">
        Set how much you want to spend and how you want to be charged.
      </p>
      <div className="mb-6">
        <Label className="mb-3 block">Billing model</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {billingModels.map((bm) => (
            <button
              key={bm.value}
              type="button"
              onClick={() => update('billingModel', bm.value)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                formData.billingModel === bm.value
                  ? 'border-(--color-ink-black) bg-(--bg-surface-subtle)'
                  : 'border-(--border-subtle) hover:border-(--border-strong)'
              }`}
            >
              <p className="text-sm font-medium text-(--fg-base)">{bm.label}</p>
              <p className="mt-1 text-xs text-(--fg-muted)">{bm.description}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="bid-amount">Bid amount ($)</Label>
          <Input
            id="bid-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.bidAmount}
            onChange={(e) => update('bidAmount', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="daily-budget">Daily budget ($)</Label>
          <Input
            id="daily-budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="Optional"
            value={formData.dailyBudget}
            onChange={(e) => update('dailyBudget', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="total-budget">Total budget ($)</Label>
          <Input
            id="total-budget"
            type="number"
            min="0"
            step="0.01"
            placeholder="Optional"
            value={formData.totalBudget}
            onChange={(e) => update('totalBudget', e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="start-date">Start date</Label>
          <Input
            id="start-date"
            type="date"
            value={formData.startDate}
            onChange={(e) => update('startDate', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}

function StepCreative({
  formData,
  update,
}: {
  formData: FormData;
  update: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-(--fg-base)">Ad creative</h2>
      <p className="mb-6 text-sm text-(--fg-muted)">
        Write your ad copy and set the destination URL.
      </p>
      <div className="mb-4">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          placeholder="A compelling headline for your ad"
          value={formData.headline}
          onChange={(e) => update('headline', e.target.value)}
          className="mt-2"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="body-text">Body text</Label>
        <Textarea
          id="body-text"
          placeholder="Describe your offer or message"
          value={formData.bodyText}
          onChange={(e) => update('bodyText', e.target.value)}
          className="mt-2"
          rows={3}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="cta">Call to action</Label>
        <Input
          id="cta"
          placeholder="e.g. Learn More, Shop Now, Sign Up"
          value={formData.callToAction}
          onChange={(e) => update('callToAction', e.target.value)}
          className="mt-2"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="destination-url">Destination URL</Label>
        <Input
          id="destination-url"
          type="url"
          placeholder="https://example.com/landing-page"
          value={formData.destinationUrl}
          onChange={(e) => update('destinationUrl', e.target.value)}
          className="mt-2"
        />
      </div>
      <div>
        <Label htmlFor="image-url">Image URL (optional)</Label>
        <Input
          id="image-url"
          type="url"
          placeholder="https://example.com/ad-image.jpg"
          value={formData.imageUrl}
          onChange={(e) => update('imageUrl', e.target.value)}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function StepReview({ formData }: { formData: FormData }) {
  const obj = objectives.find((o) => o.value === formData.objective);
  const bm = billingModels.find((b) => b.value === formData.billingModel);
  const fmt = creativeFormats.find((f) => f.value === formData.creativeFormat);

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold text-(--fg-base)">Review & launch</h2>
      <p className="mb-6 text-sm text-(--fg-muted)">
        Confirm your campaign settings before launching.
      </p>
      <div className="space-y-4">
        <ReviewRow label="Campaign name" value={formData.name} />
        <ReviewRow label="Objective" value={obj?.label ?? '—'} />
        <ReviewRow label="Billing model" value={bm ? `${bm.label} — ${bm.description}` : '—'} />
        <ReviewRow label="Bid amount" value={formData.bidAmount ? `$${formData.bidAmount}` : '—'} />
        <ReviewRow label="Daily budget" value={formData.dailyBudget ? `$${formData.dailyBudget}` : 'No limit'} />
        <ReviewRow label="Total budget" value={formData.totalBudget ? `$${formData.totalBudget}` : 'No limit'} />
        <ReviewRow label="Ad format" value={fmt?.label ?? '—'} />
        <ReviewRow
          label="Placements"
          value={
            formData.selectedPlacements.length > 0
              ? formData.selectedPlacements
                  .map((p) => placements.find((pl) => pl.value === p)?.label ?? p)
                  .join(', ')
              : '—'
          }
        />
        <ReviewRow label="Headline" value={formData.headline} />
        <ReviewRow label="Body text" value={formData.bodyText || '—'} />
        <ReviewRow label="Call to action" value={formData.callToAction || '—'} />
        <ReviewRow label="Destination URL" value={formData.destinationUrl} />
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-(--border-subtle) pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:gap-6">
      <span className="w-40 shrink-0 text-sm text-(--fg-muted)">{label}</span>
      <span className="text-sm text-(--fg-base)">{value}</span>
    </div>
  );
}
