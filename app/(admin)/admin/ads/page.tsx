import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';

export const metadata: Metadata = {
  title: 'Ad Review — Admin',
  description: 'Review and moderate advertiser creatives.',
};

const REVIEW_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-(--color-cat-lifestyle)/10 text-(--color-cat-lifestyle)',
  approved: 'bg-(--color-forest-green)/10 text-(--color-forest-green)',
  rejected: 'bg-(--signal-red)/10 text-(--signal-red)',
};

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  draft: 'text-(--fg-muted)',
  pending_review: 'text-(--color-cat-lifestyle)',
  active: 'text-(--color-forest-green)',
  paused: 'text-(--fg-subtle)',
  completed: 'text-(--color-ocean-blue)',
  rejected: 'text-(--signal-red)',
  archived: 'text-(--fg-subtle)',
};

const FORMAT_LABELS: Record<string, string> = {
  banner: 'Display Banner',
  native: 'Native Article',
  video: 'Video Pre-roll',
  sponsored_post: 'Sponsored Post',
  popup: 'Interstitial',
  sticky_footer: 'Sticky Footer',
};

async function getPendingAds() {
  const insforge = createServerInsForge();

  const { data: creatives, error } = await insforge.database
    .from('ads')
    .select(
      'id, name, creative_format, headline, body_text, call_to_action, image_url, destination_url, review_status, rejection_reason, created_at, account_id, campaign_id, ad_campaigns(name), ad_accounts(business_name)',
    )
    .eq('review_status', 'pending')
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    name: string;
    creative_format: string;
    headline: string | null;
    body_text: string | null;
    call_to_action: string | null;
    image_url: string | null;
    destination_url: string;
    review_status: string;
    rejection_reason: string | null;
    created_at: string;
    account_id: string;
    campaign_id: string;
    ad_campaigns: { name: string } | null;
    ad_accounts: { business_name: string } | null;
  }>;
}

async function getRecentlyReviewed() {
  const insforge = createServerInsForge();

  const { data: creatives, error } = await insforge.database
    .from('ads')
    .select(
      'id, name, creative_format, headline, review_status, rejection_reason, updated_at, ad_accounts(business_name)',
    )
    .in('review_status', ['approved', 'rejected'])
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) return [];
  return (data ?? []) as Array<{
    id: string;
    name: string;
    creative_format: string;
    headline: string | null;
    review_status: string;
    rejection_reason: string | null;
    updated_at: string;
    ad_accounts: { business_name: string } | null;
  }>;
}

export default async function AdReviewPage() {
  await requireAdmin();

  const [pending, reviewed] = await Promise.all([getPendingAds(), getRecentlyReviewed()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Ad Review Queue</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Review and approve advertiser creatives before they go live.
        </p>
      </div>

      <div className="mb-6 rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="font-semibold text-(--fg-default)">{pending.length}</span>
            <span className="ml-2 text-(--fg-muted)">Pending review</span>
          </div>
          <div>
            <span className="font-semibold text-(--color-forest-green)">
              {reviewed.filter((r) => r.review_status === 'approved').length}
            </span>
            <span className="ml-2 text-(--fg-muted)">Approved (recent)</span>
          </div>
          <div>
            <span className="font-semibold text-(--signal-red)">
              {reviewed.filter((r) => r.review_status === 'rejected').length}
            </span>
            <span className="ml-2 text-(--fg-muted)">Rejected (recent)</span>
          </div>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-12 text-center">
          <p className="text-sm text-(--fg-muted)">No ads pending review. All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((ad) => (
            <div
              key={ad.id}
              className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6"
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-(--fg-default)">{ad.name}</h3>
                  <p className="text-sm text-(--fg-muted)">
                    {ad.ad_accounts?.business_name ?? 'Unknown advertiser'}
                    {ad.ad_campaigns?.name ? ` — ${ad.ad_campaigns.name}` : ''}
                  </p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${REVIEW_STATUS_COLORS[ad.review_status] ?? ''}`}>
                  {ad.review_status}
                </span>
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-(--fg-muted)">Format</p>
                  <p className="text-sm text-(--fg-default)">
                    {FORMAT_LABELS[ad.creative_format] ?? ad.creative_format}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-(--fg-muted)">Destination</p>
                  <p className="truncate text-sm text-(--fg-default)">{ad.destination_url}</p>
                </div>
                {ad.headline && (
                  <div>
                    <p className="text-xs font-medium text-(--fg-muted)">Headline</p>
                    <p className="text-sm text-(--fg-default)">{ad.headline}</p>
                  </div>
                )}
                {ad.body_text && (
                  <div>
                    <p className="text-xs font-medium text-(--fg-muted)">Body</p>
                    <p className="text-sm text-(--fg-default)">{ad.body_text}</p>
                  </div>
                )}
              </div>

              {ad.image_url && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-medium text-(--fg-muted)">Creative preview</p>
                  <img
                    src={ad.image_url}
                    alt={ad.name}
                    className="max-h-48 rounded-lg border border-(--border-subtle) object-contain"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <ApproveButton adId={ad.id} />
                <RejectButton adId={ad.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {reviewed.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold text-(--fg-default)">Recently reviewed</h2>
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base)">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Creative</th>
                  <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Format</th>
                  <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Advertiser</th>
                  <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {reviewed.map((ad) => (
                  <tr key={ad.id} className="border-b border-(--border-subtle) last:border-b-0">
                    <td className="px-4 py-3 font-medium text-(--fg-default)">{ad.name}</td>
                    <td className="px-4 py-3 text-(--fg-muted)">
                      {FORMAT_LABELS[ad.creative_format] ?? ad.creative_format}
                    </td>
                    <td className="px-4 py-3 text-(--fg-muted)">
                      {ad.ad_accounts?.business_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${REVIEW_STATUS_COLORS[ad.review_status] ?? ''}`}>
                        {ad.review_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-(--fg-muted)">
                      {new Date(ad.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ApproveButton({ adId }: { adId: string }) {
  return (
    <form action={async () => {
      'use server';
      await requireAdmin();
      const insforge = createServerInsForge();
      await insforge.database.from('ads').update({ review_status: 'approved' }).eq('id', adId);
    }}>
      <button
        type="submit"
        className="rounded-lg bg-(--color-forest-green) px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-110"
      >
        Approve
      </button>
    </form>
  );
}

function RejectButton({ adId }: { adId: string }) {
  return (
    <form
      action={async (formData: FormData) => {
        'use server';
        await requireAdmin();
        const reason = formData.get('reason') as string;
        const insforge = createServerInsForge();
        await insforge.database
          .from('ads')
          .update({ review_status: 'rejected', rejection_reason: reason || 'Did not meet guidelines' })
          .eq('id', adId);
      }}
      className="inline-flex items-center gap-2"
    >
      <input
        name="reason"
        placeholder="Rejection reason (optional)"
        className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
      />
      <button
        type="submit"
        className="rounded-lg border border-(--signal-red) bg-transparent px-4 py-2 text-sm font-medium text-(--signal-red) transition-colors hover:bg-(--signal-red)/10"
      >
        Reject
      </button>
    </form>
  );
}
