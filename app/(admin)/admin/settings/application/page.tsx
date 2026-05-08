import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { Globe, Shield, Zap, Database } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Application Settings — NewsPulse PRO',
};

function Toggle({ label, id }: { label: string; id: string }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-(--fg-default)">{label}</label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked="false"
        className="relative h-5 w-9 rounded-full border border-(--border-subtle) bg-(--bg-muted) transition-colors"
      >
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
      </button>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-(--fg-muted)" />
        <h2 className="text-base font-semibold text-(--fg-default)">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end gap-3">
        <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">Cancel</button>
        <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save</button>
      </div>
    </div>
  );
}

export default async function ApplicationSettingsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Application</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Configure application, cache, and performance settings.</p>
      </div>
      <div className="space-y-8">
        <Section title="App Configuration" icon={Shield}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="App Name"><input type="text" defaultValue="NewsPulse PRO" className="field-input" /></Field>
            <Field label="App URL"><input type="url" defaultValue="https://newspulse.com" className="field-input" /></Field>
            <Field label="Environment">
              <select className="field-input">
                <option>development</option>
                <option>staging</option>
                <option selected>production</option>
              </select>
            </Field>
            <Toggle label="Debug mode" id="debug-mode" />
          </div>
        </Section>
        <Section title="Cache Settings" icon={Database}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle label="Enable page cache" id="page-cache" />
            <Field label="Cache duration (seconds)"><input type="number" defaultValue="3600" className="field-input" /></Field>
            <Field label="Cache driver">
              <select className="field-input">
                <option>file</option>
                <option>redis</option>
                <option>memcached</option>
              </select>
            </Field>
          </div>
        </Section>
        <Section title="Performance Optimization" icon={Zap}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Toggle label="Minify HTML" id="minify-html" />
            <Toggle label="Minify CSS" id="minify-css" />
            <Toggle label="Minify JS" id="minify-js" />
            <Toggle label="Gzip compression" id="gzip" />
            <Toggle label="Lazy load images" id="lazy-load" />
          </div>
        </Section>
        <Section title="CDN" icon={Globe}>
          <Field label="CDN URL"><input type="url" placeholder="https://cdn.newspulse.com" className="field-input" /></Field>
          <p className="mt-1 text-xs text-(--fg-muted)">Leave empty to serve assets locally.</p>
        </Section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-(--fg-default)">{label}</label>
      {children}
    </div>
  );
}
