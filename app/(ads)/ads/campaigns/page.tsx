import { Metadata } from 'next';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdAccountByOwnerId, listCampaignsByAccount } from '@/lib/db/ads';
import type { AdCampaign } from '@/lib/db/types';

export const metadata: Metadata = {
  title: 'Ad Campaigns — NewsPulse PRO',
  description: 'Manage your advertising campaigns.',
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
  awareness: 'Awareness',
  traffic: 'Traffic',
  conversions: 'Conversions',
  leads: 'Leads',
  app_installs: 'App Installs',
  engagement: 'Engagement',
};

const BILLING_LABELS: Record<string, string> = {
  cpm: 'CPM',
  cpc: 'CPC',
  cpa: 'CPA',
  flat_rate: 'Flat Rate',
};

export default async function AdCampaignsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accountRes = await getAdAccountByOwnerId(user.id);
  const account = accountRes.status === 'ok' ? accountRes.data : null;

  const campaignsRes = account
    ? await listCampaignsByAccount(account.id)
    : { status: 'ok' as const, data: [] as AdCampaign[] };
  const campaigns = campaignsRes.status === 'ok' ? campaignsRes.data : [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
            Campaigns
          </h1>
          <p className="mt-1 text-sm text-(--fg-muted)">
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} total.
          </p>
        </div>
        <Link
          href="/ads/create"
          className="inline-flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-(--color-paper) transition-colors hover:bg-(--color-ink-dark)"
        >
          <PlusCircle className="h-4 w-4" />
          New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-12 text-center">
          <p className="mb-4 text-sm text-(--fg-muted)">No campaigns yet. Create your first campaign to get started.</p>
          <Link
            href="/ads/create"
            className="inline-flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-(--color-paper)"
          >
            Create Campaign
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Name</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Objective</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Billing</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Budget</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Spent</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Start Date</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3 font-medium text-(--fg-base)">{campaign.name}</td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {OBJECTIVE_LABELS[campaign.objective] ?? campaign.objective}
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {BILLING_LABELS[campaign.billing_model] ?? campaign.billing_model}
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_COLORS[campaign.status] ?? 'text-(--fg-muted)'}>
                      {STATUS_LABELS[campaign.status] ?? campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-(--fg-muted)">
                    {campaign.total_budget
                      ? `$${parseFloat(campaign.total_budget).toFixed(2)}`
                      : campaign.daily_budget
                      ? `$${parseFloat(campaign.daily_budget).toFixed(2)}/day`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-(--fg-base)">
                    ${parseFloat(campaign.spent_amount ?? '0').toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-(--fg-muted)">
                    {new Date(campaign.start_at).toLocaleDateString('en-US', {
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
    </div>
  );
}
