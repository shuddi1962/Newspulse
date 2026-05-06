import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { getSubscribers, getCampaigns, getSubscriberStats } from '@/lib/db/newsletter';

export const metadata: Metadata = {
  title: 'Newsletter — Admin',
  description: 'Manage newsletter subscribers and campaigns.',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-(--color-cat-lifestyle)/10 text-(--color-cat-lifestyle)',
  confirmed: 'bg-(--color-forest-green)/10 text-(--color-forest-green)',
  unsubscribed: 'bg-(--fg-subtle)/10 text-(--fg-subtle)',
  bounced: 'bg-(--signal-red)/10 text-(--signal-red)',
  complained: 'bg-(--signal-red)/10 text-(--signal-red)',
};

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  draft: 'text-(--fg-muted)',
  scheduled: 'text-(--color-ocean-blue)',
  sending: 'text-(--color-cat-lifestyle)',
  sent: 'text-(--color-forest-green)',
  cancelled: 'text-(--fg-subtle)',
  failed: 'text-(--signal-red)',
};

export default async function NewsletterPage() {
  await requireAdmin();

  const [subscribers, campaigns, stats] = await Promise.all([
    getSubscribers(50),
    getCampaigns(20),
    getSubscriberStats(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Newsletter</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Manage subscribers and email campaigns.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total subscribers" value={String(stats.total)} />
        <StatCard label="Confirmed" value={String(stats.confirmed)} />
        <StatCard label="Pending" value={String(stats.pending)} />
        <StatCard label="Unsubscribed" value={String(stats.unsubscribed)} />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-(--fg-default)">Recent subscribers</h2>
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Email</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Name</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Language</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Joined</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3 font-mono text-xs text-(--fg-default)">{sub.email}</td>
                  <td className="px-4 py-3 text-(--fg-muted)">{sub.full_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[sub.status] ?? ''}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">{sub.language}</td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {new Date(sub.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-(--fg-muted)">
                    No subscribers yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-(--fg-default)">Campaigns</h2>
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base)">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Name</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Subject</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Recipients</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Opens</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Clicks</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Created</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3 font-medium text-(--fg-default)">{c.name}</td>
                  <td className="px-4 py-3 text-(--fg-muted)">{c.subject}</td>
                  <td className="px-4 py-3">
                    <span className={CAMPAIGN_STATUS_COLORS[c.status] ?? 'text-(--fg-muted)'}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-(--fg-muted)">{c.recipients_count}</td>
                  <td className="px-4 py-3 text-right text-(--fg-muted)">
                    {c.open_count > 0
                      ? `${c.open_count} (${((c.open_count / Math.max(c.sent_count, 1)) * 100).toFixed(0)}%)`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-(--fg-muted)">{c.click_count}</td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {new Date(c.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-(--fg-muted)">
                    No campaigns yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
      <p className="text-sm text-(--fg-muted)">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-(--fg-default)">{value}</p>
    </div>
  );
}
