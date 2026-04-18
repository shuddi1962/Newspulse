import Link from 'next/link';
import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to NewsPulse PRO.',
};

function resolveRedirect(next: string | string[] | undefined): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (value && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }
  return '/admin';
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const redirectPath = resolveRedirect(params.next);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-(--fg-muted)">
          Welcome back. Enter your credentials to continue.
        </p>
      </div>

      <LoginForm redirectPath={redirectPath} />

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          href="/forgot-password"
          className="text-(--fg-muted) underline-offset-4 hover:text-(--fg-default) hover:underline"
        >
          Forgot password?
        </Link>
        <Link
          href="/signup"
          className="text-(--fg-muted) underline-offset-4 hover:text-(--fg-default) hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
