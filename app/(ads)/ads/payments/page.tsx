import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdAccountByOwnerId, listPaymentsByAccount } from '@/lib/db/ads';
import type { AdPayment } from '@/lib/db/types';

export const metadata: Metadata = {
  title: 'Ad Payments — NewsPulse PRO',
  description: 'View your payment history and credit balance.',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-(--fg-muted)',
  processing: 'text-(--color-ocean-blue)',
  succeeded: 'text-(--color-forest-green)',
  failed: 'text-(--signal-red)',
  refunded: 'text-(--fg-subtle)',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  succeeded: 'Succeeded',
  failed: 'Failed',
  refunded: 'Refunded',
};

export default async function AdPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accountRes = await getAdAccountByOwnerId(user.id);
  const account = accountRes.status === 'ok' ? accountRes.data : null;

  const paymentsRes = account
    ? await listPaymentsByAccount(account.id)
    : { status: 'ok' as const, data: [] as AdPayment[] };
  const payments = paymentsRes.status === 'ok' ? paymentsRes.data : [];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
          Payments
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Your payment history and credit balance.
        </p>
      </div>

      {account && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
            <p className="text-sm text-(--fg-muted)">Credit balance</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-(--color-forest-green)">
              ${parseFloat(account.credit_balance ?? '0').toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
            <p className="text-sm text-(--fg-muted)">Total spent</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-(--fg-base)">
              ${parseFloat(account.total_spent ?? '0').toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface)">
        <div className="border-b border-(--border-subtle) px-6 py-4">
          <h2 className="text-lg font-semibold text-(--fg-base)">Payment History</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-(--fg-muted)">No payments recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Date</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Amount</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Status</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Provider</th>
                <th className="px-4 py-3 text-left font-medium text-(--fg-muted)">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-(--border-subtle) last:border-b-0">
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {new Date(payment.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 font-medium text-(--fg-base)">
                    ${parseFloat(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={STATUS_COLORS[payment.payment_status] ?? 'text-(--fg-muted)'}>
                      {STATUS_LABELS[payment.payment_status] ?? payment.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--fg-muted)">
                    {payment.payment_provider ?? '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-(--fg-subtle)">
                    {payment.payment_reference ?? '—'}
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
