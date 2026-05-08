import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { listCategories } from '@/lib/db/categories';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CategoryManager } from './_components/category-manager';

export const metadata: Metadata = {
  title: 'Categories — Admin',
};

export default async function AdminCategoriesPage() {
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

  const result = await listCategories(accessToken, { kind: 'news' });
  const categories = result.status === 'ok' ? result.data : [];

  return <CategoryManager categories={categories} />;
}
