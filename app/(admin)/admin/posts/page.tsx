import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { createServerInsForge } from '@/lib/insforge/server';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PostListClient } from './_components/post-list-client';

export const metadata: Metadata = {
  title: 'Post List',
};

export default async function AdminPostsPage() {
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

  const [articlesRes, categoriesRes, profilesRes] = await Promise.all([
    insforge.database
      .from('articles')
      .select(
        'id, title, slug, status, author_id, category_id, featured_image, publish_at, view_count, updated_at, created_at',
      )
      .order('updated_at', { ascending: false })
      .limit(500),
    insforge.database
      .from('categories')
      .select('id, name')
      .eq('kind', 'news')
      .order('name')
      .limit(500),
    insforge.database
      .from('profiles')
      .select('id, display_name, avatar_url')
      .limit(500),
  ]);

  if (articlesRes.error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle />
        <div className="space-y-1">
          <AlertTitle>Could not load posts</AlertTitle>
          <AlertDescription>{articlesRes.error.message ?? 'Unknown error.'}</AlertDescription>
        </div>
      </Alert>
    );
  }

  const articles = (articlesRes.data ?? []).map((a: Record<string, unknown>) => ({
    id: a.id as string,
    title: a.title as string,
    slug: a.slug as string,
    status: a.status as string,
    author_id: (a.author_id as string) ?? null,
    category_id: (a.category_id as string) ?? null,
    featured_image: (a.featured_image as string) ?? null,
    publish_at: (a.publish_at as string) ?? null,
    view_count: (a.view_count as number) ?? null,
    updated_at: a.updated_at as string,
    created_at: a.created_at as string,
  }));
  const categories = categoriesRes.data ?? [];
  const profiles = profilesRes.data ?? [];

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-admin-text)]">
            Post List
          </h1>
          <p className="mt-1 text-sm text-[var(--color-admin-text-muted)]">
            Manage all posts across your publication.
          </p>
        </div>
        <Link
          href="/admin/posts/add"
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-crimson)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          <Plus size={16} />
          Add Post
        </Link>
      </header>

      <PostListClient articles={articles} categories={categories} profiles={profiles} />
    </div>
  );
}
