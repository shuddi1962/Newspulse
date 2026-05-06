import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, Mail, Globe, Star, Verified } from 'lucide-react';
import { env } from '@/lib/env';
import { getListingBySlug, formatRating } from '@/lib/db/directory';

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await getListingBySlug(slug);
  if (res.status !== 'ok' || !res.data) return { title: 'Listing not found' };
  return {
    title: `${res.data.business_name} — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: res.data.short_description ?? `Business listing for ${res.data.business_name}`,
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const res = await getListingBySlug(slug);
  if (res.status !== 'ok' || !res.data) notFound();

  const listing = res.data;
  const location = [listing.city, listing.state, listing.country].filter(Boolean).join(', ');

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <nav className="mb-6 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-(--fg-muted)">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/directory" className="hover:text-(--fg-muted)">Directory</Link>
        {listing.category_slug && (
          <>
            <span className="mx-1">/</span>
            <Link href={`/directory?category=${listing.category_slug}`} className="hover:text-(--fg-muted)">
              {listing.category_name}
            </Link>
          </>
        )}
        <span className="mx-1">/</span>
        <span className="text-(--fg-muted)">{listing.business_name}</span>
      </nav>

      {listing.cover_image && (
        <div className="mb-8 aspect-[21/9] overflow-hidden rounded-lg border border-(--border-subtle)">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={listing.cover_image} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-start gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{listing.business_name}</h1>
            {listing.is_verified && (
              <Verified className="mt-1 h-5 w-5 shrink-0 text-(--ocean-blue)" aria-label="Verified" />
            )}
          </div>

          {listing.category_name && (
            <span className="mb-4 inline-block rounded-full border border-(--border-subtle) px-3 py-1 text-xs font-mono uppercase tracking-wider text-(--fg-muted)">
              {listing.category_name}
            </span>
          )}

          {listing.description && (
            <div className="mb-8 whitespace-pre-wrap text-base leading-relaxed text-(--fg-muted)">
              {listing.description}
            </div>
          )}

          {listing.amenities.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-(--fg-default)">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full bg-(--bg-surface-subtle) px-3 py-1 text-xs text-(--fg-muted)"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
            {listing.rating_avg > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 fill-(--fg-subtle)" aria-hidden />
                <span className="text-2xl font-semibold">{formatRating(listing.rating_avg)}</span>
                <span className="text-sm text-(--fg-muted)">
                  ({listing.review_count} review{listing.review_count !== 1 ? 's' : ''})
                </span>
              </div>
            )}

            <div className="space-y-3 text-sm">
              {location && (
                <div className="flex items-start gap-3 text-(--fg-muted)">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                  <span>{location}</span>
                </div>
              )}
              {listing.phone && (
                <a href={`tel:${listing.phone}`} className="flex items-center gap-3 text-(--ocean-blue) hover:underline">
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  {listing.phone}
                </a>
              )}
              {listing.email && (
                <a href={`mailto:${listing.email}`} className="flex items-center gap-3 text-(--ocean-blue) hover:underline">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {listing.email}
                </a>
              )}
              {listing.website && (
                <a
                  href={listing.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-(--ocean-blue) hover:underline"
                >
                  <Globe className="h-4 w-4 shrink-0" aria-hidden />
                  {listing.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {listing.price_range && (
              <div className="mt-4 border-t border-(--border-subtle) pt-4">
                <span className="text-xs text-(--fg-subtle)">Price range</span>
                <p className="text-lg font-semibold">{listing.price_range}</p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
