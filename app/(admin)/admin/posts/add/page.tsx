import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createServerInsForge } from '@/lib/insforge/server';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PostForm } from '../_components/post-form';

export const metadata: Metadata = {
  title: 'Add Post',
};

export default async function AddPostPage() {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();

  if (!accessToken) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle />
        <div className="space-y-1">
          <AlertTitle>Session expired</AlertTitle>
          <AlertDescription>Sign in again to continue.</AlertDescription>
        </div>
      </Alert>
    );
  }

  const insforge = createServerInsForge(accessToken);

  const [categoriesRes] = await Promise.all([
    insforge.database
      .from('categories')
      .select('id, name')
      .eq('kind', 'news')
      .order('name')
      .limit(500),
  ]);

  const categories = categoriesRes.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-admin-text)]">
            Add Post
          </h1>
          <p className="mt-1 text-sm text-[var(--color-admin-text-muted)]">
            Create a new post with categories, tags, and SEO metadata.
          </p>
        </div>
      </header>

      <PostForm mode="create" categories={categories} />
    </div>
  );
}
