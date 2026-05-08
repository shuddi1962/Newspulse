import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Mail Setup — NewsPulse PRO',
};

function Toggle({ label, id }: { label: string; id: string }) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-medium text-(--fg-default)">{label}</label>
      <button id={id} type="button" role="switch" aria-checked="false" className="relative h-5 w-9 rounded-full border border-(--border-subtle) bg-(--bg-muted) transition-colors">
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform" />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-(--fg-default)">{label}</label>
      {children}
    </div>
  );
}

export default async function MailSettingsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Mail</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Configure SMTP settings and email templates.</p>
      </div>
      <div className="space-y-8">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">SMTP Configuration</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Host"><input type="text" defaultValue="smtp.sendgrid.net" className="field-input" /></Field>
            <Field label="Port"><input type="number" defaultValue="587" className="field-input" /></Field>
            <Field label="Username"><input type="text" defaultValue="apikey" className="field-input" /></Field>
            <Field label="Password"><input type="password" defaultValue="••••••••" className="field-input" /></Field>
            <Field label="Encryption">
              <select className="field-input">
                <option selected>TLS</option>
                <option>SSL</option>
                <option>None</option>
              </select>
            </Field>
            <Field label="From Name"><input type="text" defaultValue="NewsPulse PRO" className="field-input" /></Field>
            <Field label="From Email"><input type="email" defaultValue="noreply@newspulse.com" className="field-input" /></Field>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">Test Connection</button>
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save SMTP</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Mail Templates</h2>
          <div className="space-y-4">
            <TemplateField label="Welcome email" defaultValue={`Welcome to {{site_name}}, {{name}}!\n\nWe're glad to have you on board.\n\nBest,\nThe {{site_name}} Team`} />
            <TemplateField label="Password reset" defaultValue={`Hi {{name}},\n\nClick the link below to reset your password:\n{{reset_link}}\n\nThis link expires in 1 hour.`} />
            <TemplateField label="Notification" defaultValue={`Hi {{name}},\n\n{{message}}\n\nView details: {{action_url}}`} />
          </div>
          <p className="mt-3 text-xs text-(--fg-muted)">Available variables: {'{{name}}'}, {'{{email}}'}, {'{{site_name}}'}, {'{{reset_link}}'}, {'{{message}}'}</p>
          <div className="mt-4 flex justify-end">
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save Templates</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Email Notifications</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Toggle label="New comment notification" id="notif-comment" />
            <Toggle label="New subscriber notification" id="notif-subscriber" />
            <Toggle label="New user registration" id="notif-registration" />
            <Toggle label="Weekly digest" id="notif-digest" />
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Test Email</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-sm font-medium text-(--fg-default)">Send test email to</label>
              <input type="email" placeholder="admin@newspulse.com" className="field-input w-full" />
            </div>
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Send Test</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateField({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-(--fg-default)">{label}</label>
      <textarea rows={4} defaultValue={defaultValue} className="field-input w-full resize-y font-mono text-xs" />
    </div>
  );
}
