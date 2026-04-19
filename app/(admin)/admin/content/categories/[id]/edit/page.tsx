import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getAuthCookies } from '@/lib/auth/cookies';
import { getCurrentUser, isAdmin } from '@/lib/auth/session';
import { getCategoryById, listCategories } from '@/lib/db/categories';
import { CategoryForm } from '../../_components/category-form';

export const metadata: Metadata = {
  title: 'Edit category',
};

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/admin/content/categories/${id}/edit`);
  if (!isAdmin(user)) redirect('/admin?error=forbidden');

  const { accessToken } = await getAuthCookies();
  if (!accessToken) redirect('/login?next=/admin/content/categories');

  const [category, parents] = await Promise.all([
    getCategoryById(id, accessToken),
    listCategories(accessToken),
  ]);
  if (!category) notFound();

  const parentOptions =
    parents.status === 'ok'
      ? parents.data.map((c) => ({ id: c.id, name: c.name, kind: c.kind }))
      : [];

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
          Taxonomy · Editing
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          {category.name}
        </h1>
      </div>
      <CategoryForm
        mode="edit"
        initial={category}
        parentOptions={parentOptions}
        showSavedBanner={saved === '1'}
      />
    </div>
  );
}
