import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Social API Setup — NewsPulse PRO',
};

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span className={`inline-block h-2 w-2 rounded-full ${connected ? 'bg-(--color-forest-green)' : 'bg-(--color-signal-red)'}`} />
  );
}

function ApiSection({ title, status, children }: { title: string; status: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-(--fg-default)">{title}</h2>
          <StatusDot connected={status} />
        </div>
        <span className="text-xs text-(--fg-muted)">{status ? 'Connected' : 'Not connected'}</span>
      </div>
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex items-center justify-between">
        <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">Test Connection</button>
        <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save</button>
      </div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-(--fg-default)">{label}</label>
      {children}
      {hint && <p className="text-xs text-(--fg-muted)">{hint}</p>}
    </div>
  );
}

export default async function SocialApiSettingsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Social API</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Configure API keys for social media platforms.</p>
      </div>
      <div className="space-y-8">
        <ApiSection title="Facebook API" status={false}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="App ID"><input type="text" placeholder="1234567890" className="field-input" /></Field>
            <Field label="App Secret"><div className="relative"><input type="password" defaultValue="sk-••••••••" className="field-input w-full pr-10" /><button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-(--fg-muted) hover:text-(--fg-default)">Show</button></div></Field>
          </div>
        </ApiSection>
        <ApiSection title="Twitter / X API" status={false}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="API Key"><input type="text" placeholder="xxxxxxxxxx" className="field-input" /></Field>
            <Field label="API Secret"><input type="password" placeholder="Enter API secret" className="field-input" /></Field>
            <Field label="Bearer Token" hint="Used for authenticated API requests"><input type="password" placeholder="Enter bearer token" className="field-input" /></Field>
          </div>
        </ApiSection>
        <ApiSection title="Google API" status={false}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="API Key"><input type="text" placeholder="AIza..." className="field-input" /></Field>
            <Field label="OAuth Client ID"><input type="text" placeholder="xxxxxxxx.apps.googleusercontent.com" className="field-input" /></Field>
            <Field label="OAuth Client Secret"><input type="password" placeholder="Enter client secret" className="field-input" /></Field>
          </div>
        </ApiSection>
        <ApiSection title="YouTube API" status={true}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="API Key"><input type="text" defaultValue="AIzaSyBd..." className="field-input" /></Field>
            <Field label="Channel ID"><input type="text" defaultValue="UC_x5XG1OV2P6uZZ5FSM9Ttw" className="field-input" /></Field>
          </div>
        </ApiSection>
      </div>
    </div>
  );
}
