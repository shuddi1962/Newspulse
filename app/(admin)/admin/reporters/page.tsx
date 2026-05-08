import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';
import { ReporterManager } from './_components/reporter-manager';

export const metadata: Metadata = {
  title: 'Reporters — Admin',
  description: 'Manage reporters, journalists, and their roles.',
};

export default async function AdminReportersPage() {
  await requireAdmin();
  const insforge = createServerInsForge();

  const { data: profilesRaw } = await insforge.database
    .from('profiles')
    .select('id, display_name, username, email, role, bio, avatar_url, website_url, created_at, updated_at')
    .in('role', ['author', 'editor', 'admin'])
    .order('created_at', { ascending: false });

  const profiles = (profilesRaw ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    display_name: (p.display_name as string) ?? '',
    username: (p.username as string) ?? null,
    email: (p.email as string) ?? '',
    role: (p.role as string) ?? 'author',
    bio: (p.bio as string) ?? null,
    avatar_url: (p.avatar_url as string) ?? null,
    website_url: (p.website_url as string) ?? null,
    created_at: (p.created_at as string) ?? '',
    updated_at: (p.updated_at as string) ?? '',
  }));

  return <ReporterManager rows={profiles} />;
}
