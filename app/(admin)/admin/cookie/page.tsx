import type { Metadata } from 'next';
import { Shield, Eye, Cookie } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Cookie Consent Manager — Admin',
  description: 'Configure cookie consent banner, cookie settings, and GDPR/CCPA compliance options.',
};

export default async function CookieManagerPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Compliance</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Cookie Consent Manager
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Configure cookie consent banners, manage cookie categories, and ensure GDPR/CCPA compliance.
        </p>
      </div>

      <div className="space-y-8">
        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Eye className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Banner Preview</h2>
          </div>
          <div className="overflow-hidden rounded-lg border border-(--border-subtle) bg-[var(--color-admin-bg)] p-4">
            <div className="mx-auto max-w-md rounded-lg border border-(--border-subtle) bg-(--bg-base) p-4 shadow-sm">
              <p className="text-sm text-(--fg-default)">
                This website uses cookies to improve your experience.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button className="rounded-md bg-(--color-ink-black) px-4 py-1.5 text-xs font-medium text-white">
                  Accept
                </button>
                <button className="rounded-md border border-(--border-subtle) px-4 py-1.5 text-xs font-medium text-(--fg-muted)">
                  Decline
                </button>
                <button className="text-xs text-(--color-ocean-blue) hover:underline">
                  Cookie Policy
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Cookie className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Banner Customization</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Banner position</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Bottom (bar)</option>
                <option>Top (bar)</option>
                <option>Center (modal)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Background color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#FFFFFF" className="h-8 w-8 rounded border border-(--border-subtle)" />
                <input type="text" defaultValue="#FFFFFF" className="flex-1 rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Text color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#0F1419" className="h-8 w-8 rounded border border-(--border-subtle)" />
                <input type="text" defaultValue="#0F1419" className="flex-1 rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Button color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#0F1419" className="h-8 w-8 rounded border border-(--border-subtle)" />
                <input type="text" defaultValue="#0F1419" className="flex-1 rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)" />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-(--fg-default)">Message text</label>
              <textarea
                rows={2}
                defaultValue="This website uses cookies to improve your experience."
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Button text</label>
              <input
                type="text"
                defaultValue="Accept"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 pt-6">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-(--border-subtle)" />
                <span className="text-sm font-medium text-(--fg-default)">Show decline button</span>
              </label>
              <input
                type="text"
                defaultValue="Decline"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Cookie Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-md border border-(--border-subtle) p-4">
              <h3 className="text-sm font-semibold text-(--fg-default)">Required cookies</h3>
              <p className="mt-1 text-xs text-(--fg-muted)">Always enabled — necessary for site functionality.</p>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="border-b border-(--border-subtle)">
                    <th className="pb-2 pr-4 text-left font-medium text-(--fg-muted)">Name</th>
                    <th className="pb-2 text-left font-medium text-(--fg-muted)">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-(--border-subtle)">
                    <td className="py-2 pr-4 font-mono text-xs text-(--fg-default)">session</td>
                    <td className="py-2 text-xs text-(--fg-muted)">Maintains user session state</td>
                  </tr>
                  <tr className="border-b border-(--border-subtle)">
                    <td className="py-2 pr-4 font-mono text-xs text-(--fg-default)">csrf_token</td>
                    <td className="py-2 text-xs text-(--fg-muted)">Cross-site request forgery protection</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs text-(--fg-default)">dark_mode</td>
                    <td className="py-2 text-xs text-(--fg-muted)">Remembers your theme preference</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-3 rounded-md border border-(--border-subtle) p-4">
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-(--fg-default)">Analytics cookies</span>
                  <p className="text-xs text-(--fg-muted)">Google Analytics, Facebook Pixel</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-(--fg-default)">Marketing cookies</span>
                  <p className="text-xs text-(--fg-muted)">Ad personalization and targeting</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-(--fg-default)">Functional cookies</span>
                  <p className="text-xs text-(--fg-muted)">Enhanced features and preferences</p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">GDPR / CCPA Compliance</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Privacy policy URL</label>
              <input
                type="text"
                defaultValue="/privacy"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Cookie policy URL</label>
              <input
                type="text"
                defaultValue="/cookie-policy"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <label className="flex items-center justify-between rounded-md border border-(--border-subtle) p-3">
              <div>
                <span className="text-sm font-medium text-(--fg-default)">Enable GDPR mode</span>
                <p className="text-xs text-(--fg-muted)">EU cookie law compliance</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-(--border-subtle) p-3">
              <div>
                <span className="text-sm font-medium text-(--fg-default)">Enable CCPA mode</span>
                <p className="text-xs text-(--fg-muted)">California Consumer Privacy Act</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </label>
            <label className="flex items-center justify-between rounded-md border border-(--border-subtle) p-3 sm:col-span-2">
              <div>
                <span className="text-sm font-medium text-(--fg-default)">&quot;Do Not Sell My Personal Information&quot; link</span>
                <p className="text-xs text-(--fg-muted)">Display CCPA opt-out link in banner</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-5 py-2.5 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
            Reset to defaults
          </button>
          <button className="rounded-lg bg-(--color-crimson) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-crimson-dark)">
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
