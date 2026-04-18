import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { AvatarUploader } from './_components/avatar-uploader';
import { ProfileForm } from './_components/profile-form';

export const metadata: Metadata = {
  title: 'Profile',
};

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    redirect('/login?next=/admin/profile');
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Account
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          Your profile
        </h1>
        <p className="mt-2 text-sm text-(--fg-muted)">
          Control how you appear across NewsPulse PRO. Updates are immediate
          and visible on every public byline.
        </p>
      </div>

      <section className="space-y-4 border border-(--border-subtle) bg-(--bg-base) p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-(--fg-default)">
            Avatar
          </h2>
          <p className="text-sm text-(--fg-muted)">
            Used on bylines, comments, and the admin header.
          </p>
        </div>
        <AvatarUploader
          currentUrl={user.profile.avatar_url}
          displayName={user.profile.display_name}
        />
      </section>

      <section className="space-y-6 border border-(--border-subtle) bg-(--bg-base) p-6">
        <div>
          <h2 className="font-display text-lg font-semibold text-(--fg-default)">
            Public details
          </h2>
          <p className="text-sm text-(--fg-muted)">
            Name, handle, bio, and external link.
          </p>
        </div>
        <ProfileForm profile={user.profile} />
      </section>
    </div>
  );
}
