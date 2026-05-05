import { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';
import { getAdAccountByOwnerId } from '@/lib/db/ads';

export const metadata: Metadata = {
  title: 'Ad Account Settings — NewsPulse PRO',
  description: 'Manage your advertiser account details and billing information.',
};

export default async function AdAccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const accountRes = await getAdAccountByOwnerId(user.id);
  const account = accountRes.status === 'ok' ? accountRes.data : null;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-base)">
          Ad Account Settings
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          {account
            ? 'Update your business and billing information.'
            : 'Set up your advertiser account to start running campaigns.'}
        </p>
      </div>

      <div className="mx-auto max-w-2xl rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
        {account && (
          <div className="mb-6 rounded-lg bg-(--bg-surface-subtle) p-4">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-(--fg-muted)">Credit balance</dt>
                <dd className="mt-1 text-lg font-semibold text-(--color-forest-green)">
                  ${parseFloat(account.credit_balance ?? '0').toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-(--fg-muted)">Total spent</dt>
                <dd className="mt-1 text-lg font-semibold text-(--fg-base)">
                  ${parseFloat(account.total_spent ?? '0').toFixed(2)}
                </dd>
              </div>
              <div>
                <dt className="text-(--fg-muted)">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${
                      account.is_suspended
                        ? 'bg-(--signal-red)/10 text-(--signal-red)'
                        : account.is_verified
                        ? 'bg-(--color-forest-green)/10 text-(--color-forest-green)'
                        : 'bg-(--fg-muted)/10 text-(--fg-muted)'
                    }`}
                  >
                    {account.is_suspended ? 'Suspended' : account.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-(--fg-muted)">Currency</dt>
                <dd className="mt-1 text-(--fg-base)">{account.currency}</dd>
              </div>
            </dl>
          </div>
        )}

        <form className="space-y-5">
          <div>
            <label htmlFor="business-name" className="mb-1.5 block text-sm font-medium text-(--fg-base)">
              Business name
            </label>
            <input
              id="business-name"
              type="text"
              defaultValue={account?.business_name ?? ''}
              placeholder="Your company or brand name"
              className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="business-email" className="mb-1.5 block text-sm font-medium text-(--fg-base)">
              Business email
            </label>
            <input
              id="business-email"
              type="email"
              defaultValue={account?.business_email ?? user.email}
              placeholder="billing@company.com"
              className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="business-phone" className="mb-1.5 block text-sm font-medium text-(--fg-base)">
              Phone number <span className="font-normal text-(--fg-muted)">(optional)</span>
            </label>
            <input
              id="business-phone"
              type="tel"
              defaultValue={account?.business_phone ?? ''}
              placeholder="+1 555 123 4567"
              className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
            />
          </div>

          <div className="border-t border-(--border-subtle) pt-5">
            <h3 className="mb-4 text-sm font-semibold text-(--fg-base)">Billing address</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="billing-address" className="mb-1.5 block text-sm text-(--fg-base)">
                  Street address
                </label>
                <input
                  id="billing-address"
                  type="text"
                  defaultValue={account?.billing_address ?? ''}
                  placeholder="123 Main St"
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="billing-city" className="mb-1.5 block text-sm text-(--fg-base)">
                    City
                  </label>
                  <input
                    id="billing-city"
                    type="text"
                    defaultValue={account?.billing_city ?? ''}
                    placeholder="New York"
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="billing-postal" className="mb-1.5 block text-sm text-(--fg-base)">
                    Postal code
                  </label>
                  <input
                    id="billing-postal"
                    type="text"
                    defaultValue={account?.billing_postal_code ?? ''}
                    placeholder="10001"
                    className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="billing-country" className="mb-1.5 block text-sm text-(--fg-base)">
                  Country
                </label>
                <input
                  id="billing-country"
                  type="text"
                  defaultValue={account?.billing_country ?? ''}
                  placeholder="United States"
                  className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-(--border-subtle) pt-5">
            <h3 className="mb-4 text-sm font-semibold text-(--fg-base)">Tax information</h3>
            <div>
              <label htmlFor="tax-id" className="mb-1.5 block text-sm text-(--fg-base)">
                Tax ID / VAT number <span className="font-normal text-(--fg-muted)">(optional)</span>
              </label>
              <input
                id="tax-id"
                type="text"
                defaultValue={account?.tax_id ?? ''}
                placeholder="US123456789"
                className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-base) transition-colors placeholder:text-(--fg-subtle) focus:border-(--color-ink-black) focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-lg bg-(--color-ink-black) px-5 py-2 text-sm font-medium text-(--color-paper) transition-colors hover:bg-(--color-ink-dark)"
            >
              {account ? 'Save changes' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
