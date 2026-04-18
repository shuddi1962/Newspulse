import Link from 'next/link';
import type { Metadata } from 'next';
import { SignUpForm } from './signup-form';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Create a NewsPulse PRO account.',
};

export default function SignUpPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-(--fg-muted)">
          Join the editorial and community super-platform.
        </p>
      </div>

      <SignUpForm />

      <p className="mt-6 text-sm text-(--fg-muted)">
        Already have an account?{' '}
        <Link
          href="/login"
          className="underline-offset-4 hover:text-(--fg-default) hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
