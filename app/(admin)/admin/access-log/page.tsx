import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { Download, RefreshCw, Trash2, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Access & Activity Log — NewsPulse PRO',
};

const logEntries = [
  { ts: '2026-05-06 14:32:18', user: 'admin@newspulse.com', action: 'login', entity: 'session', entityId: 'sess_001', ip: '192.168.1.100', ua: 'Chrome 124 / Windows', location: 'New York, US' },
  { ts: '2026-05-06 14:28:05', user: 'john@example.com', action: 'create', entity: 'article', entityId: 'art_042', ip: '10.0.0.45', ua: 'Safari 17 / macOS', location: 'London, GB' },
  { ts: '2026-05-06 14:15:44', user: 'jane@example.com', action: 'update', entity: 'article', entityId: 'art_039', ip: '172.16.0.22', ua: 'Firefox 125 / Linux', location: 'Berlin, DE' },
  { ts: '2026-05-06 13:58:12', user: 'admin@newspulse.com', action: 'delete', entity: 'comment', entityId: 'cmt_112', ip: '192.168.1.100', ua: 'Chrome 124 / Windows', location: 'New York, US' },
  { ts: '2026-05-06 13:42:30', user: 'moderator@newspulse.com', action: 'view', entity: 'report', entityId: 'rpt_007', ip: '192.168.1.101', ua: 'Edge 124 / Windows', location: 'New York, US' },
  { ts: '2026-05-06 13:30:01', user: 'system', action: 'logout', entity: 'user', entityId: 'usr_089', ip: '10.0.0.88', ua: '—', location: '—' },
];

const actionTypes = ['login', 'logout', 'create', 'update', 'delete', 'view'];

export default async function AccessLogPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Access &amp; Activity Log</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Monitor all access and activity across the platform.</p>
      </div>
      <div className="space-y-6">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-(--fg-muted)">From</label>
              <input type="date" defaultValue="2026-05-01" className="field-input w-36" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-(--fg-muted)">To</label>
              <input type="date" defaultValue="2026-05-06" className="field-input w-36" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-(--fg-muted)">User type</label>
              <select className="field-input w-28">
                <option>All</option>
                <option>User</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-(--fg-muted)">Action</label>
              <select className="field-input w-28">
                <option>All</option>
                {actionTypes.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-(--fg-muted)">IP address</label>
              <input type="text" placeholder="e.g. 192.168.1.1" className="field-input w-36" />
            </div>
            <button className="flex items-center gap-1 rounded-lg bg-(--color-ink-black) px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="flex items-center gap-1 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle) text-left text-xs uppercase tracking-wider text-(--fg-muted)">
                  <th className="p-3 font-medium">Timestamp</th>
                  <th className="p-3 font-medium">User</th>
                  <th className="p-3 font-medium">Action</th>
                  <th className="p-3 font-medium">Entity</th>
                  <th className="p-3 font-medium">ID</th>
                  <th className="p-3 font-medium">IP Address</th>
                  <th className="p-3 font-medium">User Agent</th>
                  <th className="p-3 font-medium">Location</th>
                </tr>
              </thead>
              <tbody>
                {logEntries.map((entry, i) => (
                  <tr key={i} className="border-b border-(--border-subtle) last:border-0 hover:bg-(--bg-muted)">
                    <td className="p-3 font-mono text-xs text-(--fg-default) whitespace-nowrap">{entry.ts}</td>
                    <td className="p-3 text-(--fg-default)">{entry.user}</td>
                    <td className="p-3">
                      <ActionBadge action={entry.action} />
                    </td>
                    <td className="p-3 text-(--fg-muted)">{entry.entity}</td>
                    <td className="p-3 font-mono text-xs text-(--fg-muted)">{entry.entityId}</td>
                    <td className="p-3 font-mono text-xs text-(--fg-muted)">{entry.ip}</td>
                    <td className="p-3 text-xs text-(--fg-muted) max-w-[160px] truncate">{entry.ua}</td>
                    <td className="p-3 text-xs text-(--fg-muted)">{entry.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-(--border-subtle) px-3 py-3">
            <p className="text-xs text-(--fg-muted)">Showing 1–6 of 1,284 entries</p>
            <div className="flex gap-1">
              <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) disabled:opacity-30" disabled>Prev</button>
              <button className="rounded border border-(--color-ink-black) bg-(--color-ink-black) px-2 py-1 text-xs text-white">1</button>
              <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) hover:text-(--fg-default)">2</button>
              <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) hover:text-(--fg-default)">3</button>
              <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) hover:text-(--fg-default)">...</button>
              <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) hover:text-(--fg-default)">26</button>
              <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) hover:text-(--fg-default)">Next</button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Log Management</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-(--fg-default)">Real-time auto-refresh</label>
              <button type="button" role="switch" aria-checked="false" className="relative h-5 w-9 rounded-full border border-(--border-subtle) bg-(--bg-muted) transition-colors">
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--fg-default)">Auto-delete logs older than</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue="90" className="field-input w-20" />
                <span className="text-sm text-(--fg-muted)">days</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-(--color-signal-red) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--color-signal-red) transition-colors hover:bg-(--color-signal-red)/10">
              <Trash2 className="h-4 w-4" /> Clear All Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    login: 'bg-(--color-forest-green)/10 text-(--color-forest-green)',
    logout: 'bg-(--bg-muted) text-(--fg-muted)',
    create: 'bg-(--color-ocean-blue)/10 text-(--color-ocean-blue)',
    update: 'bg-(--color-cat-lifestyle)/10 text-(--color-cat-lifestyle)',
    delete: 'bg-(--color-signal-red)/10 text-(--color-signal-red)',
    view: 'bg-(--color-cat-tech)/10 text-(--color-cat-tech)',
  };
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[action] || 'bg-(--bg-muted) text-(--fg-muted)'}`}>{action}</span>;
}
