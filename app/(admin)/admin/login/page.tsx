import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';
import { AdminLoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  description: 'Sign in to NewsPulse PRO admin.',
};

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/admin/dashboard');
  }

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col items-center justify-center bg-[#0f1419] p-12 lg:flex">
        <div className="mx-auto w-full max-w-md">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            NewsPulse PRO
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Editorial authority for the modern web
          </p>

          {isDev ? (
            <div className="mt-12 rounded-lg border border-gray-700 bg-[#1a2332] p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Demo Credentials
              </p>
              <dl className="mt-3 space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-mono">admin@newspulsepro.com</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Password</dt>
                  <dd className="font-mono">admin123</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
