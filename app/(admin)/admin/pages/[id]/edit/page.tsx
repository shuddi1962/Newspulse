import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/db/pages';
import PageForm from '../../_components/page-form';

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Edit Page — NewsPulse PRO',
};

export default async function EditPagePage({ params }: EditPageProps) {
  const { id } = await params;
  const page = await getPageBySlug(id).catch(() => null);

  if (!page) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
          Content
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gray-900">
          Edit Page
        </h1>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <PageForm page={page} />
      </div>
    </div>
  );
}
