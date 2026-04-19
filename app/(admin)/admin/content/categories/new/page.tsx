import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { listCategories } from '@/lib/db/categories';
import { CategoryForm } from '../_components/category-form';
import {
  CATEGORY_KINDS,
  type CategoryKind,
} from '@/lib/validation/taxonomy';

export const metadata: Metadata = {
  title: 'New category',
};

function parseKindParam(raw: string | undefined): CategoryKind | null {
  if (!raw) return null;
  return (CATEGORY_KINDS as readonly string[]).includes(raw)
    ? (raw as CategoryKind)
    : null;
}

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const { kind: kindRaw } = await searchParams;
  const defaultKind = parseKindParam(kindRaw) ?? 'news';

  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin/content/categories/new');
  if (!isAdmin(user)) redirect('/admin?error=forbidden');

  const { accessToken } = await getAuthCookies();
  const parents = accessToken ? await listCategories(accessToken) : null;
  const parentOptions =
    parents?.status === 'ok'
      ? parents.data.map((c) => ({ id: c.id, name: c.name, kind: c.kind }))
      : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Taxonomy · New
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          New category
        </h1>
      </div>
      <CategoryForm mode="create" parentOptions={parentOptions} defaultKind={defaultKind} />
    </div>
  );
}
