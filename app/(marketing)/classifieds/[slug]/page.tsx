import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { env } from '@/lib/env';

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return { title: `Classified — ${env.NEXT_PUBLIC_SITE_NAME}` };
}

export default async function ClassifiedDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <nav className="mb-6 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-(--fg-muted)">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/classifieds" className="hover:text-(--fg-muted)">Classifieds</Link>
        <span className="mx-1">/</span>
        <span className="text-(--fg-muted)">Ad</span>
      </nav>
      <section className="py-20 text-center">
        <h2 className="text-xl font-semibold">Ad details coming soon</h2>
        <p className="mt-2 text-sm text-(--fg-muted)">Full ad details and seller contact will appear here.</p>
      </section>
    </main>
  );
}
