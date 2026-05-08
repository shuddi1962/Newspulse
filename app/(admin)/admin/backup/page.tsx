import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { Download, Upload, RotateCw, AlertTriangle, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Backup & Reset — NewsPulse PRO',
};

const backups = [
  { name: 'newspulse-full-2026-05-06', type: 'Full', size: '1.2 GB', date: '2026-05-06 03:00 UTC' },
  { name: 'newspulse-db-2026-05-06', type: 'Database', size: '340 MB', date: '2026-05-06 03:00 UTC' },
  { name: 'newspulse-media-2026-05-05', type: 'Media', size: '890 MB', date: '2026-05-05 03:00 UTC' },
  { name: 'newspulse-full-2026-05-04', type: 'Full', size: '1.1 GB', date: '2026-05-04 03:00 UTC' },
];

export default async function BackupPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Backup &amp; Reset</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Create, manage, and restore backups.</p>
      </div>
      <div className="space-y-8">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Create Backup</h2>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Create Database Backup</button>
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Create Full Backup</button>
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Create Media Backup</button>
          </div>
          <p className="mt-3 text-xs text-(--fg-muted)">Last backup: 2026-05-06 03:00 UTC</p>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Backups</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle) text-left text-xs uppercase tracking-wider text-(--fg-muted)">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Size</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.name} className="border-b border-(--border-subtle) last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-(--fg-default)">{b.name}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        b.type === 'Full' ? 'bg-(--color-ocean-blue)/10 text-(--color-ocean-blue)' :
                        b.type === 'Database' ? 'bg-(--color-forest-green)/10 text-(--color-forest-green)' :
                        'bg-(--color-cat-lifestyle)/10 text-(--color-cat-lifestyle)'
                      }`}>{b.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-(--fg-muted)">{b.size}</td>
                    <td className="py-3 pr-4 text-(--fg-muted)">{b.date}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-1 rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) transition-colors hover:text-(--fg-default)"><Download className="h-3 w-3" /> Download</button>
                        <button className="flex items-center gap-1 rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) transition-colors hover:text-(--fg-default)"><RotateCw className="h-3 w-3" /> Restore</button>
                        <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--color-signal-red) transition-colors hover:bg-(--color-signal-red)/10">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Scheduled Backups</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-(--fg-default)">Enable</label>
              <button type="button" role="switch" aria-checked="true" className="relative h-5 w-9 rounded-full bg-(--color-ink-black) transition-colors">
                <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--fg-default)">Frequency</label>
              <select className="field-input">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--fg-default)">Time</label>
              <input type="time" defaultValue="03:00" className="field-input" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--fg-default)">Retention (backups)</label>
              <input type="number" defaultValue="7" className="field-input" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save Schedule</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Restore</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-(--fg-default)">Upload backup file</label>
              <div className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-(--border-subtle) bg-(--bg-muted) p-6 transition-colors hover:border-(--border-default)">
                <div className="text-center">
                  <Upload className="mx-auto h-6 w-6 text-(--fg-muted)" />
                  <p className="mt-2 text-sm text-(--fg-muted)">Click to upload or drag and drop</p>
                  <p className="text-xs text-(--fg-muted)">.sql, .tar, .gz up to 2GB</p>
                </div>
              </div>
            </div>
            <button className="rounded-lg bg-(--color-ocean-blue) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ocean-blue)/90">Restore from backup</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--color-signal-red)/20 bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-(--color-signal-red)" />
            <h2 className="text-base font-semibold text-(--color-signal-red)">System Reset</h2>
          </div>
          <p className="mb-4 text-sm text-(--fg-muted)">This will permanently delete all data and reset the application to its default state. This action cannot be undone.</p>
          <label className="mb-4 flex items-center gap-2">
            <input type="checkbox" className="rounded border-(--border-subtle)" />
            <span className="text-sm text-(--fg-default)">I understand this will delete all data</span>
          </label>
          <button className="rounded-lg bg-(--color-signal-red) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-signal-red)/90 disabled:opacity-50">Reset to Defaults</button>
        </div>
      </div>
    </div>
  );
}
