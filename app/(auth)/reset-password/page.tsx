import Link from 'next/link';
import type { Metadata } from 'next';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = {
  title: 'Set a new password',
  description: 'Complete your password reset.',
};

function resolveEmail(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' ? value : '';
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  const params = await searchParams;
  const defaultEmail = resolveEmail(params.email);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-(--fg-muted)">
          Enter the 6-digit code we emailed you and choose a new password.
        </p>
      </div>

      <ResetPasswordForm defaultEmail={defaultEmail} />

      <p className="mt-6 text-sm text-(--fg-muted)">
        Didn&apos;t receive a code?{' '}
        <Link
          href="/forgot-password"
          className="underline-offset-4 hover:text-(--fg-default) hover:underline"
        >
          Request a new one
        </Link>
      </p>
    </div>
  );
}
