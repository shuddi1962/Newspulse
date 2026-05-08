import type { Metadata } from 'next';
import { RotateCw, EyeOff } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'reCAPTCHA Manager — Admin',
  description: 'Configure Google reCAPTCHA, spam protection, and form security settings.',
};

const PROTECTED_FORMS = [
  { id: 'login', label: 'Login form' },
  { id: 'signup', label: 'Signup form' },
  { id: 'comment', label: 'Comment form' },
  { id: 'contact', label: 'Contact form' },
  { id: 'newsletter', label: 'Newsletter form' },
];

export default async function RecaptchaManagerPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Security</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          reCAPTCHA Manager
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Configure Google reCAPTCHA and spam protection settings across your site.
        </p>
      </div>

      <div className="space-y-8">
        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-(--fg-default)">Google reCAPTCHA</h2>
              <p className="mt-1 text-sm text-(--fg-muted)">Protect forms from spam and automated abuse.</p>
            </div>
            <label className="flex items-center gap-2">
              <span className="text-sm text-(--fg-muted)">Disabled</span>
              <div className="relative inline-flex h-5 w-9 cursor-pointer items-center rounded-full bg-(--color-forest-green) transition-colors">
                <span className="inline-block h-3.5 w-3.5 translate-x-1 transform rounded-full bg-white transition-transform" />
              </div>
              <span className="text-sm font-medium text-(--fg-default)">Enabled</span>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Version</h2>
          <div className="flex flex-wrap gap-3">
            {['v2 Checkbox', 'v2 Invisible', 'v3'].map((v) => (
              <label
                key={v}
                className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2.5 text-sm ${
                  v === 'v3'
                    ? 'border-(--color-ink-black) bg-(--bg-surface-subtle)'
                    : 'border-(--border-subtle) bg-(--bg-base) hover:border-(--border-default)'
                }`}
              >
                <input
                  type="radio"
                  name="recaptcha_version"
                  defaultChecked={v === 'v3'}
                  className="h-4 w-4"
                />
                <span className="font-medium text-(--fg-default)">{v}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">v2 Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Site Key</label>
              <input
                type="text"
                placeholder="6Lc...xxxx"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm font-mono text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Secret Key</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter secret key"
                  className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 pr-8 text-sm font-mono text-(--fg-default)"
                />
                <EyeOff className="absolute right-2.5 top-2.5 h-4 w-4 text-(--fg-muted)" />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">v3 Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Site Key</label>
              <input
                type="text"
                placeholder="6Lc...xxxx"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm font-mono text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Secret Key</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter secret key"
                  className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 pr-8 text-sm font-mono text-(--fg-default)"
                />
                <EyeOff className="absolute right-2.5 top-2.5 h-4 w-4 text-(--fg-muted)" />
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-(--fg-default)">
                Score threshold: <span className="font-mono">0.5</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                className="w-full accent-(--color-ink-black)"
              />
              <div className="flex justify-between text-xs text-(--fg-muted)">
                <span>0.0 (Most permissive)</span>
                <span>1.0 (Most strict)</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Protected Forms</h2>
          <p className="mb-3 text-sm text-(--fg-muted)">Enable reCAPTCHA protection on these forms:</p>
          <div className="flex flex-wrap gap-3">
            {PROTECTED_FORMS.map((form) => (
              <label
                key={form.id}
                className="flex cursor-pointer items-center gap-2 rounded-md border border-(--border-subtle) px-3 py-2 text-sm hover:border-(--border-default)"
              >
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-(--fg-default)">{form.label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-(--fg-default)">Test reCAPTCHA</h2>
              <p className="mt-1 text-sm text-(--fg-muted)">Verify your reCAPTCHA configuration is working.</p>
            </div>
            <button className="flex items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
              <RotateCw className="h-4 w-4" />
              Run test
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Spam Protection</h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between rounded-md border border-(--border-subtle) p-3">
              <div>
                <span className="text-sm font-medium text-(--fg-default)">Honeypot fields</span>
                <p className="text-xs text-(--fg-muted)">Invisible fields that trap automated bots</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--fg-default)">
                  Minimum seconds before submit
                </label>
                <input
                  type="number"
                  defaultValue={3}
                  min={0}
                  className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-(--fg-default)">
                  Max submissions per IP per hour
                </label>
                <input
                  type="number"
                  defaultValue={50}
                  min={1}
                  className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
                />
              </div>
            </div>
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
