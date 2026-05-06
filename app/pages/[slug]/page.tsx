import { notFound } from 'next/navigation';
import { getPageBySlug } from '@/lib/db/pages';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug).catch(() => null);
  if (!page) return {};
  return {
    title: page.meta_title || page.title,
    description: page.meta_description || '',
  };
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug).catch(() => null);

  if (!page || page.status !== 'published') notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-gray-900">
        {page.title}
      </h1>
      <div
        className="prose prose-gray mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content_html || '' }}
      />
    </div>
  );
}
