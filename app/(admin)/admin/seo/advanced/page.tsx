import type { Metadata } from 'next';
import {
  Search,
  FileCode,
  ArrowRight,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  Trash2,
  GitBranch,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Advanced SEO — Admin',
  description: 'Schema markup, redirects, 404 monitoring, and SEO health checks.',
};

const DEFAULT_ROBOTS =
  `User-agent: *\nAllow: /\n\nDisallow: /admin/\nDisallow: /api/\nDisallow: /auth/\nDisallow: /_next/\n\nSitemap: https://newspulse.com/sitemap.xml`;

const REDIRECTS = [
  { from: '/old-page', to: '/new-page', type: 301, hits: 142 },
  { from: '/blog/%postname%', to: '/articles/%postname%', type: 301, hits: 89 },
  { from: '/category/old-cat', to: '/category/new-cat', type: 302, hits: 23 },
];

const ERRORS_404 = [
  { url: '/nonexistent-page', referrer: 'google.com', count: 47, lastSeen: '2 hours ago' },
  { url: '/old-link', referrer: 'facebook.com', count: 12, lastSeen: '1 day ago' },
  { url: '/broken-redirect', referrer: '/articles/tech', count: 8, lastSeen: '3 days ago' },
];

const SCHEMA_TYPES = [
  'NewsArticle', 'BlogPosting', 'WebPage', 'Organization',
  'WebSite', 'Person', 'Product', 'Event',
];

const BREADCRUMB_SEPARATORS = ['/', '>', '·', '—'];

export default async function AdvancedSEOPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">SEO</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Advanced SEO
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Schema markup, redirects, 404 monitoring, and SEO health checks.
        </p>
      </div>

      <div className="space-y-8">
        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileCode className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Schema Markup</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Default schema type</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                {SCHEMA_TYPES.map((t) => (
                  <option key={t} selected={t === 'NewsArticle'}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium text-(--fg-default)">Custom JSON-LD Schema</label>
            <textarea
              rows={6}
              className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 font-mono text-xs text-(--fg-default)"
              defaultValue={JSON.stringify(
                {
                  '@context': 'https://schema.org',
                  '@type': 'NewsArticle',
                  headline: '{{title}}',
                  datePublished: '{{publish_date}}',
                  author: { '@type': 'Person', name: '{{author}}' },
                },
                null,
                2
              )}
            />
          </div>
          <p className="mt-1 text-xs text-(--fg-muted)">
            Use {'{{variables}}'} for dynamic field injection.
          </p>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Breadcrumbs</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="flex items-center gap-2 pt-1">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                <span className="text-sm font-medium text-(--fg-default)">Enable breadcrumbs</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Separator</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                {BREADCRUMB_SEPARATORS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Home label</label>
              <input
                type="text"
                defaultValue="Home"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-(--fg-muted)" />
              <h2 className="text-base font-semibold text-(--fg-default)">robots.txt</h2>
            </div>
            <button className="flex items-center gap-1.5 rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-1.5 text-xs font-medium text-(--fg-default) hover:bg-(--bg-muted)">
              <RefreshCw className="h-3.5 w-3.5" />
              Generate Default
            </button>
          </div>
          <textarea
            rows={8}
            className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 font-mono text-xs text-(--fg-default)"
            defaultValue={DEFAULT_ROBOTS}
          />
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-(--fg-muted)" />
              <h2 className="text-base font-semibold text-(--fg-default)">Redirect Manager</h2>
            </div>
          </div>
          <div className="mb-4 grid gap-4 sm:grid-cols-4">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-(--fg-default)">From URL</label>
              <input
                type="text"
                placeholder="/old-path"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <label className="text-sm font-medium text-(--fg-default)">To URL</label>
              <input
                type="text"
                placeholder="/new-path"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2 sm:col-span-1">
              <label className="text-sm font-medium text-(--fg-default)">Type</label>
              <div className="flex gap-2">
                <select className="flex-1 rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                  <option>301 (Permanent)</option>
                  <option>302 (Temporary)</option>
                </select>
                <button className="rounded-lg bg-(--color-crimson) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-crimson-dark)">
                  Add
                </button>
              </div>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">From</th>
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">To</th>
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Type</th>
                <th className="pb-3 pr-6 text-right font-medium text-(--fg-muted)">Hits</th>
                <th className="pb-3 text-right font-medium text-(--fg-muted)">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REDIRECTS.map((r, i) => (
                <tr key={i} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="py-3 pr-6 font-mono text-xs text-(--fg-default)">{r.from}</td>
                  <td className="py-3 pr-6 font-mono text-xs text-(--color-ocean-blue)">{r.to}</td>
                  <td className="py-3 pr-6">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      r.type === 301 ? 'bg-(--color-forest-green)/10 text-(--color-forest-green)' : 'bg-(--color-cat-lifestyle)/10 text-(--color-cat-lifestyle)'
                    }`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="py-3 pr-6 text-right text-(--fg-muted)">{r.hits}</td>
                  <td className="py-3 text-right">
                    <button className="rounded-md p-1.5 text-(--fg-muted) transition-colors hover:bg-(--signal-red)/10 hover:text-(--signal-red)">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">404 Monitor</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">URL</th>
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Referrer</th>
                <th className="pb-3 pr-6 text-right font-medium text-(--fg-muted)">Count</th>
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Last seen</th>
                <th className="pb-3 text-right font-medium text-(--fg-muted)">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ERRORS_404.map((e, i) => (
                <tr key={i} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="py-3 pr-6 font-mono text-xs text-(--signal-red)">{e.url}</td>
                  <td className="py-3 pr-6 text-xs text-(--fg-muted)">{e.referrer}</td>
                  <td className="py-3 pr-6 text-right font-medium text-(--fg-default)">{e.count}</td>
                  <td className="py-3 pr-6 text-(--fg-muted)">{e.lastSeen}</td>
                  <td className="py-3 text-right">
                    <button className="rounded-md border border-(--border-subtle) px-2.5 py-1 text-xs font-medium text-(--fg-muted) hover:bg-(--bg-muted)">
                      Ignore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Search className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">SEO Health Check</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {['Meta tags check', 'Schema validation', 'Broken links scan', 'Page speed check'].map(
              (check) => (
                <button
                  key={check}
                  className="flex items-center justify-between rounded-md border border-(--border-subtle) bg-(--bg-base) px-4 py-3 text-sm text-(--fg-default) transition-colors hover:border-(--color-ocean-blue)/30 hover:bg-(--bg-surface-subtle)"
                >
                  <span>{check}</span>
                  <ExternalLink className="h-4 w-4 text-(--fg-muted)" />
                </button>
              )
            )}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-5 py-2.5 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
            Reset to defaults
          </button>
          <button className="rounded-lg bg-(--color-crimson) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-crimson-dark)">
            Save all
          </button>
        </div>
      </div>
    </div>
  );
}
