import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { env } from '@/lib/env';

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  return { title: `Property — ${env.NEXT_PUBLIC_SITE_NAME}` };
}

export default async function PropertyDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <nav className="mb-6 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-(--fg-muted)">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/real-estate" className="hover:text-(--fg-muted)">Real Estate</Link>
        <span className="mx-1">/</span>
        <span className="text-(--fg-muted)">Property</span>
      </nav>
      <section className="py-20 text-center">
        <h2 className="text-xl font-semibold">Property details coming soon</h2>
        <p className="mt-2 text-sm text-(--fg-muted)">Full property details, photos, and inquiry form will appear here.</p>
      </section>
    </main>
  );
}
