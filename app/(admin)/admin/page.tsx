import type { Metadata } from 'next';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Admin overview',
};

export default async function AdminOverviewPage() {
  const user = await getCurrentUser();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Phase 1 · Foundation
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Welcome back, {displayName}.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-(--fg-muted)">
          The admin shell is live. Editorial, directory, jobs, marketplace,
          events, real estate, classifieds, and ad-platform modules are
          scheduled for subsequent phases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-0 border border-(--border-subtle) bg-(--bg-base) sm:grid-cols-3">
        <dl className="border-b border-(--border-subtle) p-6 sm:border-b-0 sm:border-r">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Auth
          </dt>
          <dd className="mt-2 text-sm text-(--fg-default)">
            Server-mode InsForge SDK · httpOnly cookies · code-based verification
          </dd>
        </dl>
        <dl className="border-b border-(--border-subtle) p-6 sm:border-b-0 sm:border-r">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Routes
          </dt>
          <dd className="mt-2 text-sm text-(--fg-default)">
            /login · /signup · /forgot-password · /reset-password · /admin
          </dd>
        </dl>
        <dl className="p-6">
          <dt className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
            Next up
          </dt>
          <dd className="mt-2 text-sm text-(--fg-default)">
            Database schema · RLS policies · editorial CMS
          </dd>
        </dl>
      </div>
    </div>
  );
}
