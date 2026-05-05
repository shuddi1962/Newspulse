import { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdAccountByOwnerId, listInvoicesByAccount } from '@/lib/db/ads';
import type { AdInvoice } from '@/lib/db/types';

export const metadata: Metadata = {
  title: 'Ad Invoices — NewsPulse PRO',
  description: 'View and download your invoices.',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-(--fg-muted)',
  open: 'text-(--color-ocean-blue)',
  paid: 'text-(--color-forest-green)',
  void: 'text-(--fg-subtle)',
  uncollectible: 'text-(--signal-red)',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  open: 'Open',
  paid: 'Paid',
  void: 'Void',
  uncollectible: 'Uncollectible',
};

export default async function AdInvoicesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accountRes = await getAdAccountByOwnerId(user.id);
  const account = accountRes.status === 'ok' ? accountRes.data : null;

  const invoicesRes = account
    ? await listInvoicesByAccount(account.id)
    : { status: 'ok' as const, data: [] as AdInvoice[] };
  const invoices = invoicesRes.status === 'ok' ? invoicesRes.data : [];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
          Invoices
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Your billing history and downloadable invoices.
        </p>
      </div>

      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface)">
        <div className="border-b border-(--border-subtle) px-6 py-4">
          <h2 className="text-lg font-semibold text-(--fg-base)">Invoice History</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-(--fg-muted)">No invoices generated yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Invoice #</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Period</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Subtotal</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Tax</th>
                <th className="px-4 py-3 text-right font-medium text-(--fg-muted)">Total</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">PDF</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3 font-mono text-xs text-(--fg-base)">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {formatDateRange(invoice.period_start, invoice.period_end)}
                  </td>
                  <td className="px-4 py-3 text-right text-(--fg-muted)">
                    ${parseFloat(invoice.subtotal).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-(--fg-muted)">
                    ${parseFloat(invoice.tax_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-(--fg-base)">
                    ${parseFloat(invoice.total).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_COLORS[invoice.invoice_status] ?? 'text-(--fg-muted)'}>
                      {STATUS_LABELS[invoice.invoice_status] ?? invoice.invoice_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {invoice.pdf_url ? (
                      <a
                        href={invoice.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-(--ocean-blue) hover:underline"
                      >
                        Download
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-(--fg-subtle)">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const startStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} → ${endStr}`;
}
