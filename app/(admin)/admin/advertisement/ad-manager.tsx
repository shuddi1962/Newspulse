'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Loader2, X, Megaphone, MousePointerClick, DollarSign, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { insforge } from '@/lib/insforge/client';

const FORMAT_CONFIG = [
  { key: 'banner_728x90', label: 'Leaderboard', size: '728×90', desc: 'Full-width banner, top of page' },
  { key: 'banner_300x250', label: 'Medium Rectangle', size: '300×250', desc: 'Sidebar or in-content' },
  { key: 'banner_300x600', label: 'Half Page', size: '300×600', desc: 'Sidebar tall' },
  { key: 'popup', label: 'Popup', size: '—', desc: 'Overlay interstitial ad' },
  { key: 'sticky', label: 'Sticky', size: '—', desc: 'Fixed to bottom of viewport' },
  { key: 'video', label: 'Video Pre-roll', size: '—', desc: 'Before video content' },
  { key: 'native', label: 'Native In-feed', size: '—', desc: 'Blends with editorial content' },
];

const POSITIONS = ['Header', 'Sidebar', 'Footer', 'In-feed', 'Between Articles', 'Popup', 'Sticky'];
const FORMATS = ['banner', 'popup', 'sticky_footer', 'video', 'native', 'sponsored_post'];
const STATUS_BADGES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
};

function StatCard({ title, value, icon: Icon }: { title: string; value: number | string; icon: React.FC<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-(--bg-muted)">
        <Icon className="h-6 w-6 text-(--color-ocean-blue)" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-(--fg-muted)">{title}</p>
        <p className="mt-1 text-2xl font-bold text-(--fg-default)">{value}</p>
      </div>
    </div>
  );
}

interface Overview {
  totalCampaigns: number;
  activeCampaigns: number;
  todayImpressions: number;
  todayClicks: number;
  totalRevenue: string;
  placementsCount: number;
}

interface PlacementRow {
  id: string;
  adId: string;
  name: string;
  format: string;
  position: string;
  isActive: boolean;
  reviewStatus: string;
  createdAt: string;
}

interface Props {
  overview: Overview;
  placements: PlacementRow[];
}

export function AdManager({ overview, placements }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'placements' | 'formats'>('overview');

  const [form, setForm] = useState({
    name: '', format: 'banner', adsenseCode: '', imageUrl: '', destinationUrl: '',
    scriptCode: '', position: 'Header', status: 'active',
    startDate: '', endDate: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Ad name is required.'); return; }

    startTransition(async () => {
      const { data: creative, error: creativeError } = await insforge.database
        .from('ads')
        .insert({
          name: form.name,
          creative_format: form.format,
          destination_url: form.destinationUrl || null,
          image_url: form.imageUrl || null,
          headline: form.name,
          is_active: form.status === 'active',
        })
        .select('id')
        .single();

      if (creativeError || !creative) {
        toast.error(creativeError?.message ?? 'Could not create ad.');
        return;
      }

      const { error: placementError } = await insforge.database
        .from('ad_placements')
        .insert({
          ad_id: (creative as { id: string }).id,
          position: form.position.toLowerCase().replace(/\s+/g, '_'),
          is_active: form.status === 'active',
        });

      if (placementError) {
        toast.error(placementError.message ?? 'Ad created but placement failed.');
      } else {
        toast.success('Ad placement created.');
      }

      setShowAdd(false);
      setForm({ name: '', format: 'banner', adsenseCode: '', imageUrl: '', destinationUrl: '', scriptCode: '', position: 'Header', status: 'active', startDate: '', endDate: '' });
      router.refresh();
    });
  };

  const toggleStatus = (id: string, current: boolean) => {
    startTransition(async () => {
      const { error } = await insforge.database.from('ad_placements').update({ is_active: !current }).eq('id', id);
      if (error) { toast.error(error.message); return; }
      toast.success(`Ad ${current ? 'deactivated' : 'activated'}.`);
      router.refresh();
    });
  };

  const update = <K extends keyof typeof form>(key: K, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Monetization</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Advertisement Manager</h1>
          <p className="mt-1 text-sm text-(--fg-muted)">Manage ad placements, formats, and performance.</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">
          <Plus className="h-4 w-4" />
          New Placement
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Campaigns" value={overview.totalCampaigns} icon={Megaphone} />
        <StatCard title="Active Ads" value={overview.activeCampaigns} icon={LayoutGrid} />
        <StatCard title="Today Impressions" value={overview.todayImpressions.toLocaleString()} icon={MousePointerClick as React.FC<{ className?: string }>} />
        <StatCard title="Today Clicks" value={overview.todayClicks.toLocaleString()} icon={MousePointerClick as React.FC<{ className?: string }>} />
      </div>

      <div className="flex gap-1 border-b border-(--border-subtle)">
        {(['overview', 'placements', 'formats'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn(
              'relative px-4 py-2.5 text-sm font-medium capitalize transition-colors',
              activeTab === tab
                ? 'text-(--fg-default) after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-(--color-crimson)'
                : 'text-(--fg-muted) hover:text-(--fg-default)',
            )}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'placements' && (
        <div className="overflow-x-auto rounded-lg border border-(--border-subtle)">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle) bg-(--bg-surface-subtle)">
                <th className="px-4 py-3 font-medium text-(--fg-muted)">Ad Name</th>
                <th className="px-4 py-3 font-medium text-(--fg-muted)">Format</th>
                <th className="px-4 py-3 font-medium text-(--fg-muted)">Position</th>
                <th className="px-4 py-3 font-medium text-(--fg-muted)">Status</th>
                <th className="px-4 py-3 font-medium text-(--fg-muted)">Review</th>
                <th className="px-4 py-3 font-medium text-(--fg-muted)">Created</th>
                <th className="px-4 py-3 font-medium text-(--fg-muted)">Actions</th>
              </tr>
            </thead>
            <tbody>
              {placements.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-(--fg-muted)">No ad placements yet.</td></tr>
              ) : (
                placements.map((p) => (
                  <tr key={p.id} className="border-b border-(--border-subtle) last:border-b-0">
                    <td className="px-4 py-3 font-medium text-(--fg-default)">{p.name}</td>
                    <td className="px-4 py-3 text-(--fg-muted)">{p.format}</td>
                    <td className="px-4 py-3 text-(--fg-muted)">{p.position}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-block rounded-md px-2.5 py-0.5 text-xs font-medium', p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500')}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-block rounded-md px-2.5 py-0.5 text-xs font-medium', STATUS_BADGES[p.reviewStatus] ?? 'bg-gray-100 text-gray-500')}>
                        {p.reviewStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-(--fg-muted)">
                      {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => toggleStatus(p.id, p.isActive)}
                          className="rounded-md px-2 py-1 text-xs font-medium text-(--color-ocean-blue) hover:bg-blue-50 transition-colors">
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'formats' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FORMAT_CONFIG.map((fmt) => (
            <div key={fmt.key} className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
              <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-(--bg-muted)">
                <div className="flex flex-col items-center gap-1">
                  <Megaphone className="h-6 w-6 text-(--fg-muted)" />
                  <span className="text-xs font-mono text-(--fg-subtle)">{fmt.size}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-(--fg-default)">{fmt.label}</h3>
              <p className="mt-1 text-xs text-(--fg-muted)">{fmt.desc}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h3 className="mb-4 text-base font-semibold text-(--fg-default)">Revenue Overview</h3>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-(--fg-muted)">Total Revenue</p>
              <p className="text-3xl font-bold text-(--fg-default)">${Number(overview.totalRevenue).toLocaleString()}</p>
              <p className="text-xs text-(--fg-muted)">{overview.placementsCount} active placements</p>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8">
          <div className="w-full max-w-xl rounded-xl bg-(--bg-base) p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-(--fg-default)">New Ad Placement</h2>
              <button onClick={() => setShowAdd(false)}
                className="rounded-md p-1.5 text-(--fg-muted) hover:bg-(--bg-muted)">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Ad Name *</label>
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Ad Type / Format</label>
                  <select value={form.format} onChange={(e) => update('format', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    {FORMATS.map((f) => <option key={f} value={f}>{f.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Position</label>
                  <select value={form.position} onChange={(e) => update('position', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Google AdSense Code</label>
                <textarea value={form.adsenseCode} onChange={(e) => update('adsenseCode', e.target.value)} rows={2}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none font-mono"
                  placeholder="&lt;script async src=...&gt;&lt;/script&gt;" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Image URL (for banner ads)</label>
                <input type="url" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Destination URL</label>
                <input type="url" value={form.destinationUrl} onChange={(e) => update('destinationUrl', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Custom Script / Code</label>
                <textarea value={form.scriptCode} onChange={(e) => update('scriptCode', e.target.value)} rows={2}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) placeholder:text-(--fg-muted) focus:border-(--color-ink-medium) focus:outline-none font-mono" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => update('startDate', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--fg-default)">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => update('endDate', e.target.value)}
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default) focus:border-(--color-ink-medium) focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-(--fg-default)">Status</label>
                <select value={form.status} onChange={(e) => update('status', e.target.value)}
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">Cancel</button>
                <button type="submit" disabled={isPending}
                  className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark) disabled:opacity-60">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
