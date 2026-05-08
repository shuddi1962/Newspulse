import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { Cloud, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Storage Settings — NewsPulse PRO',
};

const providers = [
  { id: 'cloudflare', name: 'Cloudflare R2', description: 'S3-compatible, zero egress fees' },
  { id: 'aws', name: 'AWS S3', description: 'Industry-standard object storage' },
  { id: 'digitalocean', name: 'DigitalOcean Spaces', description: 'Simple, affordable S3-compatible' },
  { id: 'bunnycdn', name: 'BunnyCDN', description: 'Global CDN with storage' },
  { id: 'local', name: 'Local', description: 'Store files on the application server' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-(--fg-default)">{label}</label>
      {children}
    </div>
  );
}

export default async function SpaceSettingsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Storage</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Configure cloud storage credentials and providers.</p>
      </div>
      <div className="space-y-8">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cloud className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Storage Provider</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {providers.map((p) => (
              <button key={p.id} type="button" className={`rounded-lg border p-4 text-left transition-colors ${p.id === 'cloudflare' ? 'border-(--color-ink-black) bg-(--bg-surface-subtle)' : 'border-(--border-subtle) bg-(--bg-base) hover:border-(--border-default)'}`}>
                {p.id === 'cloudflare' && <span className="mb-2 inline-block rounded-md bg-(--color-forest-green) px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                <h3 className="text-sm font-semibold text-(--fg-default)">{p.name}</h3>
                <p className="mt-1 text-xs text-(--fg-muted)">{p.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Cloudflare R2 Credentials</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Account ID"><input type="text" placeholder="12abc34d..." className="field-input" /></Field>
            <Field label="Access Key ID"><input type="text" placeholder="AKIA..." className="field-input" /></Field>
            <Field label="Secret Access Key"><input type="password" placeholder="••••••••" className="field-input" /></Field>
            <Field label="Bucket Name"><input type="text" placeholder="newspulse-assets" className="field-input" /></Field>
            <Field label="Public URL"><input type="url" placeholder="https://pub-xxx.r2.dev" className="field-input" /></Field>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">Test Connection</button>
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save Credentials</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Storage Analytics</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg bg-(--bg-muted) p-4">
              <p className="text-xs text-(--fg-muted)">Total Used</p>
              <p className="mt-1 text-2xl font-semibold text-(--fg-default)">2.4 GB</p>
            </div>
            <div className="rounded-lg bg-(--bg-muted) p-4">
              <p className="text-xs text-(--fg-muted)">Available</p>
              <p className="mt-1 text-2xl font-semibold text-(--fg-default)">47.6 GB</p>
            </div>
            <div className="rounded-lg bg-(--bg-muted) p-4">
              <p className="text-xs text-(--fg-muted)">Files</p>
              <p className="mt-1 text-2xl font-semibold text-(--fg-default)">12,847</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-(--fg-muted)">Storage used (5%)</span>
              <span className="text-(--fg-default)">2.4 GB / 50 GB</span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-(--bg-muted)">
              <div className="h-full w-[5%] rounded-full bg-(--color-ocean-blue)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
