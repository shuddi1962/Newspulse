import Link from 'next/link';
import type { Metadata } from 'next';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = {
  title: 'Reset password',
  description: 'Request a password reset code.',
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-(--fg-muted)">
          Enter the email you registered with and we&apos;ll send you a 6-digit
          reset code.
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="mt-6 text-sm text-(--fg-muted)">
        Remembered it?{' '}
        <Link
          href="/login"
          className="underline-offset-4 hover:text-(--fg-default) hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
