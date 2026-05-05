import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdAccountByOwnerId, listCampaignsByAccount, listDailyStatsByCampaign, getCampaignSummary } from '@/lib/db/ads';
import type { AdCampaign, AdDailyStat } from '@/lib/db/types';

export const metadata: Metadata = {
  title: 'Ad Analytics — NewsPulse PRO',
  description: 'Track your advertising performance and optimize your campaigns.',
};

type CampaignPerformance = {
  campaign: AdCampaign;
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalSpend: string;
    ctr: number;
  };
};

export default async function AdAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accountRes = await getAdAccountByOwnerId(user.id);
  const account = accountRes.status === 'ok' ? accountRes.data : null;

  if (!account) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface-subtle) p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-(--fg-base)">No ad account found</h2>
          <p className="text-sm text-(--fg-muted)">Set up your advertiser account to view analytics.</p>
        </div>
      </div>
    );
  }

  const campaignsRes = await listCampaignsByAccount(account.id);
  const campaigns = campaignsRes.status === 'ok' ? campaignsRes.data : [];

  const performanceData: CampaignPerformance[] = [];
  let aggregateImpressions = 0;
  let aggregateClicks = 0;
  let aggregateConversions = 0;
  let aggregateSpend = 0;

  for (const campaign of campaigns) {
    const summaryRes = await getCampaignSummary(campaign.id);
    const summary = summaryRes.status === 'ok'
      ? summaryRes.data
      : { totalImpressions: 0, totalClicks: 0, totalConversions: 0, totalSpend: '0', ctr: 0 };

    performanceData.push({ campaign, summary });

    aggregateImpressions += summary.totalImpressions;
    aggregateClicks += summary.totalClicks;
    aggregateConversions += summary.totalConversions;
    aggregateSpend += parseFloat(summary.totalSpend);
  }

  const aggregateCTR = aggregateImpressions > 0
    ? ((aggregateClicks / aggregateImpressions) * 100).toFixed(2)
    : '0.00';

  const aggregateCPC = aggregateClicks > 0
    ? (aggregateSpend / aggregateClicks).toFixed(2)
    : '0.00';

  const last30Days: AdDailyStat[] = [];
  for (const pd of performanceData) {
    const statsRes = await listDailyStatsByCampaign(pd.campaign.id, 30);
    if (statsRes.status === 'ok') {
      last30Days.push(...statsRes.data);
    }
  }

  const dailyTotals = new Map<string, { impressions: number; clicks: number; spend: number }>();
  for (const stat of last30Days) {
    const date = stat.stat_date;
    const existing = dailyTotals.get(date) ?? { impressions: 0, clicks: 0, spend: 0 };
    existing.impressions += stat.impressions ?? 0;
    existing.clicks += stat.clicks ?? 0;
    existing.spend += parseFloat(stat.spend_amount ?? '0');
    dailyTotals.set(date, existing);
  }

  const sortedDates = [...dailyTotals.keys()].sort();
  const maxImpressions = Math.max(...[...dailyTotals.values()].map((d) => d.impressions), 1);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Performance overview across all your campaigns.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Impressions" value={formatNumber(aggregateImpressions)} trend="—" />
        <MetricCard label="Total Clicks" value={formatNumber(aggregateClicks)} trend="—" />
        <MetricCard label="Avg CTR" value={`${aggregateCTR}%`} trend={parseFloat(aggregateCTR) > 1 ? 'up' : 'flat'} />
        <MetricCard label="Total Spend" value={`$${aggregateSpend.toFixed(2)}`} trend="—" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Conversions" value={formatNumber(aggregateConversions)} trend="—" />
        <MetricCard label="Avg CPC" value={`$${aggregateCPC}`} trend="—" />
        <MetricCard label="Active Campaigns" value={String(campaigns.filter((c) => c.status === 'active').length)} trend="—" />
        <MetricCard label="Total Campaigns" value={String(campaigns.length)} trend="—" />
      </div>

      {sortedDates.length > 0 && (
        <div className="mb-8 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
          <h2 className="mb-6 text-lg font-semibold text-(--fg-base)">Impressions — Last 30 Days</h2>
          <div className="flex items-end gap-1 overflow-x-auto pb-2">
            {sortedDates.map((date) => {
              const data = dailyTotals.get(date)!;
              const height = Math.max((data.impressions / maxImpressions) * 120, 2);
              return (
                <div key={date} className="group flex min-w-[20px] flex-col items-center gap-1">
                  <div className="relative">
                    <div
                      className="w-3 rounded-t-sm bg-(--color-ink-black) transition-colors group-hover:bg-(--ocean-blue)"
                      style={{ height: `${height}px` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-(--color-ink-black) px-2 py-1 text-[10px] text-(--color-paper) opacity-0 transition-opacity group-hover:opacity-100">
                      {formatNumber(data.impressions)} imp
                    </div>
                  </div>
                  <span className="text-[9px] text-(--fg-subtle)">
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sortedDates.length === 0 && (
        <div className="mb-8 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-12 text-center">
          <p className="text-sm text-(--fg-muted)">No data yet. Launch a campaign to start seeing analytics.</p>
        </div>
      )}

      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface)">
        <div className="border-b border-(--border-subtle) px-6 py-4">
          <h2 className="text-lg font-semibold text-(--fg-base)">Campaign Performance</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--border-subtle)">
              <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Campaign</th>
              <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
              <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Impressions</th>
              <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Clicks</th>
              <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">CTR</th>
              <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Spend</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map(({ campaign, summary }) => (
              <tr key={campaign.id} className="border-b border-(--border-subtle) last:border-b-0">
                <td className="px-4 py-3 font-medium text-(--fg-base)">{campaign.name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={campaign.status} />
                </td>
                <td className="px-4 py-3 text-right text-(--fg-muted)">{formatNumber(summary.totalImpressions)}</td>
                <td className="px-4 py-3 text-right text-(--fg-muted)">{formatNumber(summary.totalClicks)}</td>
                <td className="px-4 py-3 text-right text-(--fg-base)">{summary.ctr.toFixed(2)}%</td>
                <td className="px-4 py-3 text-right text-(--fg-base)">${summary.totalSpend}</td>
              </tr>
            ))}
            {performanceData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-(--fg-muted)">
                  No campaigns to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5">
      <p className="text-sm text-(--fg-muted)">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-(--fg-base)">{value}</p>
      {trend !== '—' && (
        <p className={`mt-1 text-xs ${trend === 'up' ? 'text-(--color-forest-green)' : 'text-(--fg-subtle)'}`}>
          {trend === 'up' ? '↑ Healthy' : '— No data'}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-(--fg-muted)/10 text-(--fg-muted)',
    pending_review: 'bg-(--color-cat-lifestyle)/10 text-(--color-cat-lifestyle)',
    active: 'bg-(--color-forest-green)/10 text-(--color-forest-green)',
    paused: 'bg-(--fg-subtle)/10 text-(--fg-subtle)',
    completed: 'bg-(--color-ocean-blue)/10 text-(--color-ocean-blue)',
    rejected: 'bg-(--signal-red)/10 text-(--signal-red)',
    archived: 'bg-(--fg-subtle)/10 text-(--fg-subtle)',
  };

  const labels: Record<string, string> = {
    draft: 'Draft',
    pending_review: 'In Review',
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    rejected: 'Rejected',
    archived: 'Archived',
  };

  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${colors[status] ?? ''}`}>
      {labels[status] ?? status}
    </span>
  );
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
