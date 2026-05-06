import { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone, TrendingUp, Eye, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdAccountByOwnerId, listCampaignsByAccount, getAdOptimizationSuggestions } from '@/lib/db/ads';
import type { AdCampaign } from '@/lib/db/types';

export const metadata: Metadata = {
  title: 'Ad Dashboard — NewsPulse PRO',
  description: 'Manage your ad campaigns and track performance.',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-(--fg-muted)',
  pending_review: 'text-(--color-cat-lifestyle)',
  active: 'text-(--color-forest-green)',
  paused: 'text-(--fg-subtle)',
  completed: 'text-(--color-ocean-blue)',
  rejected: 'text-(--signal-red)',
  archived: 'text-(--fg-subtle)',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_review: 'In Review',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  rejected: 'Rejected',
  archived: 'Archived',
};

const OBJECTIVE_LABELS: Record<string, string> = {
  awareness: 'Brand Awareness',
  traffic: 'Traffic',
  conversions: 'Conversions',
  leads: 'Lead Generation',
  app_installs: 'App Installs',
  engagement: 'Engagement',
};

export default async function AdsDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accountRes = await getAdAccountByOwnerId(user.id);
  const account = accountRes.status === 'ok' ? accountRes.data : null;

  const campaignsRes = account
    ? await listCampaignsByAccount(account.id)
    : { status: 'ok' as const, data: [] as AdCampaign[] };
  const campaigns = campaignsRes.status === 'ok' ? campaignsRes.data : [];

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const totalSpend = campaigns.reduce((sum, c) => sum + parseFloat(c.spent_amount ?? '0'), 0);

  return (
    <div className="p-6">
      {!account && (
        <div className="mb-6 rounded-lg border border-(--border-subtle) bg-(--bg-surface-subtle) p-6">
          <h2 className="mb-2 text-lg font-semibold text-(--fg-base)">
            Welcome to Ad Center
          </h2>
          <p className="mb-4 text-sm text-(--fg-muted)">
            Set up your advertiser account to start creating campaigns and reaching our audience.
          </p>
          <Link
            href="/ads/account"
            className="inline-flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-(--color-paper) transition-colors hover:bg-(--color-ink-dark)"
          >
            Set up your account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {account && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
              Welcome back, {account.business_name}
            </h1>
            <p className="mt-1 text-sm text-(--fg-muted)">
              Here&apos;s an overview of your advertising performance.
            </p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={DollarSign}
              label="Credit Balance"
              value={`$${parseFloat(account.credit_balance ?? '0').toFixed(2)}`}
              color="--color-forest-green"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Spent"
              value={`$${totalSpend.toFixed(2)}`}
              color="--color-ocean-blue"
            />
            <StatCard
              icon={Megaphone}
              label="Active Campaigns"
              value={String(activeCampaigns.length)}
              color="--color-cat-politics"
            />
            <StatCard
              icon={Eye}
              label="Total Campaigns"
              value={String(campaigns.length)}
              color="--color-cat-tech"
            />
          </div>
        </>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-(--fg-base)">Campaigns</h2>
        <Link
          href="/ads/create"
          className="inline-flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-(--color-paper) transition-colors hover:bg-(--color-ink-dark)"
        >
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-12 text-center">
          <Megaphone className="mx-auto mb-4 h-12 w-12 text-(--fg-subtle)" />
          <h3 className="mb-2 text-base font-semibold text-(--fg-base)">No campaigns yet</h3>
          <p className="text-sm text-(--fg-muted)">
            Create your first campaign to start reaching millions of readers.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Name</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Objective</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Budget</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Spent</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3 font-medium text-(--fg-base)">{campaign.name}</td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {OBJECTIVE_LABELS[campaign.objective] ?? campaign.objective}
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_COLORS[campaign.status] ?? 'text-(--fg-muted)'}>
                      {STATUS_LABELS[campaign.status] ?? campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {campaign.total_budget
                      ? `$${parseFloat(campaign.total_budget).toFixed(2)}`
                      : campaign.daily_budget
                      ? `$${parseFloat(campaign.daily_budget).toFixed(2)}/day`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-(--fg-base)">
                    ${parseFloat(campaign.spent_amount ?? '0').toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {new Date(campaign.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {account && <OptimizationSuggestions accountId={account.id} />}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Megaphone;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-(--fg-muted)">{label}</span>
        <div className="rounded-md bg-(--bg-surface-subtle) p-2">
          <Icon className="h-4 w-4" style={{ color: `var(${color})` }} aria-hidden />
        </div>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-(--fg-base)">{value}</p>
    </div>
  );
}

async function OptimizationSuggestions({ accountId }: { accountId: string }) {
  const res = await getAdOptimizationSuggestions(accountId);
  if (res.status === 'error' || res.data.length === 0) return null;

  const PRIORITY_COLORS: Record<string, string> = {
    high: 'text-(--signal-red)',
    medium: 'text-(--color-cat-lifestyle)',
    low: 'text-(--color-ocean-blue)',
  };

  return (
    <div className="mt-8 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-(--color-ocean-blue)" />
        <h2 className="text-lg font-semibold text-(--fg-base)">AI Optimization Tips</h2>
      </div>
      <div className="space-y-3">
        {res.data.map((s) => (
          <div key={s.adId} className="flex items-start gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-surface-subtle) p-4">
            <span className={`mt-0.5 text-xs font-semibold ${PRIORITY_COLORS[s.priority] ?? ''}`}>
              [{s.priority.toUpperCase()}]
            </span>
            <div>
              <p className="text-sm font-medium text-(--fg-base)">{s.name}</p>
              <p className="text-sm text-(--fg-muted)">{s.suggestion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
