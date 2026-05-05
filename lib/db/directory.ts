import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';

export type DirectoryListing = {
  id: string;
  business_name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  category_name: string | null;
  category_slug: string | null;
  logo_url: string | null;
  cover_image: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  price_range: string | null;
  amenities: string[];
  is_verified: boolean;
  is_featured: boolean;
  rating_avg: number;
  review_count: number;
  view_count: number;
  created_at: string;
};

export type DirectoryCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
  listing_count: number;
};

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listDirectoryCategories(): Promise<Result<DirectoryCategory[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('directory_categories')
    .select('id, name, slug, icon, parent_id, listing_count')
    .eq('is_active', true)
    .order('listing_count', { ascending: false });

  if (error) return { status: 'error', message: error.message ?? 'Could not load categories.' };
  return { status: 'ok', data: (data ?? []) as DirectoryCategory[] };
}

export async function listActiveListings(
  page = 1,
  pageSize = 12,
  categoryId?: string,
  search?: string,
  city?: string,
): Promise<Result<{ listings: DirectoryListing[]; total: number; page: number; pageSize: number; totalPages: number }>> {
  const insforge = createServerInsForge();
  const offset = (page - 1) * pageSize;

  let countQuery = insforge.database
    .from('directory_listings')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  let dataQuery = insforge.database
    .from('directory_listings')
    .select(
      'id, business_name, slug, description, short_description, category_id, logo_url, cover_image, city, state, country, website, phone, email, price_range, amenities, is_verified, is_featured, rating_avg, review_count, view_count, created_at, directory_categories!directory_listings_category_id_fkey(name, slug)',
    )
    .eq('status', 'active');

  if (categoryId) {
    countQuery = countQuery.eq('category_id', categoryId);
    dataQuery = dataQuery.eq('category_id', categoryId);
  }
  if (search) {
    const term = `%${search}%`;
    countQuery = countQuery.or(`business_name.ilike.${term},description.ilike.${term},short_description.ilike.${term}`);
    dataQuery = dataQuery.or(`business_name.ilike.${term},description.ilike.${term},short_description.ilike.${term}`);
  }
  if (city) {
    countQuery = countQuery.ilike('city', city);
    dataQuery = dataQuery.ilike('city', city);
  }

  const countRes = await countQuery.order('is_featured', { ascending: false }).order('rating_avg', { ascending: false });
  if (countRes.error) return { status: 'error', message: countRes.error.message ?? 'Could not count listings.' };
  const total = countRes.count ?? 0;

  const { data, error } = await dataQuery
    .order('is_featured', { ascending: false })
    .order('rating_avg', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) return { status: 'error', message: error.message ?? 'Could not load listings.' };

  const listings = (data ?? []).map((row: Record<string, unknown>) => {
    const cat = row.directory_categories as { name: string; slug: string } | null;
    return {
      id: row.id as string,
      business_name: row.business_name as string,
      slug: row.slug as string,
      description: (row.description as string) ?? null,
      short_description: (row.short_description as string) ?? null,
      category_id: (row.category_id as string) ?? null,
      category_name: cat?.name ?? null,
      category_slug: cat?.slug ?? null,
      logo_url: (row.logo_url as string) ?? null,
      cover_image: (row.cover_image as string) ?? null,
      city: (row.city as string) ?? null,
      state: (row.state as string) ?? null,
      country: (row.country as string) ?? null,
      website: (row.website as string) ?? null,
      phone: (row.phone as string) ?? null,
      email: (row.email as string) ?? null,
      price_range: (row.price_range as string) ?? null,
      amenities: (row.amenities as string[]) ?? [],
      is_verified: row.is_verified as boolean,
      is_featured: row.is_featured as boolean,
      rating_avg: Number(row.rating_avg ?? 0),
      review_count: Number(row.review_count ?? 0),
      view_count: Number(row.view_count ?? 0),
      created_at: row.created_at as string,
    } as DirectoryListing;
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return { status: 'ok', data: { listings, total, page, pageSize, totalPages } };
}

export async function getListingBySlug(slug: string): Promise<Result<DirectoryListing | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('directory_listings')
    .select(
      'id, business_name, slug, description, short_description, category_id, logo_url, cover_image, city, state, country, website, phone, email, price_range, amenities, is_verified, is_featured, rating_avg, review_count, view_count, created_at, directory_categories!directory_listings_category_id_fkey(name, slug)',
    )
    .eq('status', 'active')
    .eq('slug', slug)
    .maybeSingle();

  if (error) return { status: 'error', message: error.message ?? 'Could not load listing.' };
  if (!data) return { status: 'ok', data: null };

  const cat = (data as Record<string, unknown>).directory_categories as { name: string; slug: string } | null;
  return {
    status: 'ok',
    data: {
      id: data.id as string,
      business_name: data.business_name as string,
      slug: data.slug as string,
      description: (data.description as string) ?? null,
      short_description: (data.short_description as string) ?? null,
      category_id: (data.category_id as string) ?? null,
      category_name: cat?.name ?? null,
      category_slug: cat?.slug ?? null,
      logo_url: (data.logo_url as string) ?? null,
      cover_image: (data.cover_image as string) ?? null,
      city: (data.city as string) ?? null,
      state: (data.state as string) ?? null,
      country: (data.country as string) ?? null,
      website: (data.website as string) ?? null,
      phone: (data.phone as string) ?? null,
      email: (data.email as string) ?? null,
      price_range: (data.price_range as string) ?? null,
      amenities: (data.amenities as string[]) ?? [],
      is_verified: data.is_verified as boolean,
      is_featured: data.is_featured as boolean,
      rating_avg: Number(data.rating_avg ?? 0),
      review_count: Number(data.review_count ?? 0),
      view_count: Number(data.view_count ?? 0),
      created_at: data.created_at as string,
    } as DirectoryListing,
  };
}

export function formatRating(avg: number): string {
  return avg > 0 ? avg.toFixed(1) : '—';
}
