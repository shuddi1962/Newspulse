import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';

export type JobListing = {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  description: string | null;
  category_id: string | null;
  category_name: string | null;
  employment_type: string;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  experience_level: string | null;
  application_url: string | null;
  application_email: string | null;
  tags: string[];
  is_featured: boolean;
  status: string;
  expires_at: string | null;
  view_count: number;
  created_at: string;
};

export type JobCategory = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

export async function listJobCategories(): Promise<Result<JobCategory[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('job_categories')
    .select('id, name, slug, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) return { status: 'error', message: error.message ?? 'Could not load categories.' };
  return { status: 'ok', data: (data ?? []) as JobCategory[] };
}

export async function listActiveJobs(
  page = 1,
  pageSize = 12,
  categoryId?: string,
  search?: string,
  remote?: boolean,
): Promise<Result<{ jobs: JobListing[]; total: number; page: number; pageSize: number; totalPages: number }>> {
  const insforge = createServerInsForge();
  const offset = (page - 1) * pageSize;

  let countQuery = insforge.database.from('jobs').select('id', { count: 'exact', head: true });
  let dataQuery = insforge.database.from('jobs').select(
    'id, title, slug, company_name, description, category_id, employment_type, location_city, location_state, location_country, is_remote, salary_min, salary_max, salary_currency, salary_period, experience_level, application_url, application_email, tags, is_featured, status, expires_at, view_count, created_at, job_categories!jobs_category_id_fkey(name)',
  );

  const statusFilter = ['active'];
  countQuery = countQuery.in('status', statusFilter);
  dataQuery = dataQuery.in('status', statusFilter);

  if (categoryId) {
    countQuery = countQuery.eq('category_id', categoryId);
    dataQuery = dataQuery.eq('category_id', categoryId);
  }
  if (search) {
    const term = `%${search}%`;
    countQuery = countQuery.or(`title.ilike.${term},company_name.ilike.${term},description.ilike.${term}`);
    dataQuery = dataQuery.or(`title.ilike.${term},company_name.ilike.${term},description.ilike.${term}`);
  }
  if (remote) {
    countQuery = countQuery.eq('is_remote', true);
    dataQuery = dataQuery.eq('is_remote', true);
  }

  const countRes = await countQuery.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
  if (countRes.error) return { status: 'error', message: countRes.error.message ?? 'Could not count jobs.' };
  const total = countRes.count ?? 0;

  const { data, error } = await dataQuery
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) return { status: 'error', message: error.message ?? 'Could not load jobs.' };

  const jobs = (data ?? []).map((row: Record<string, unknown>) => {
    const cat = row.job_categories as { name: string } | null;
    return {
      id: row.id as string,
      title: row.title as string,
      slug: row.slug as string,
      company_name: row.company_name as string,
      description: (row.description as string) ?? null,
      category_id: (row.category_id as string) ?? null,
      category_name: cat?.name ?? null,
      employment_type: row.employment_type as string,
      location_city: (row.location_city as string) ?? null,
      location_state: (row.location_state as string) ?? null,
      location_country: (row.location_country as string) ?? null,
      is_remote: row.is_remote as boolean,
      salary_min: (row.salary_min as number) ?? null,
      salary_max: (row.salary_max as number) ?? null,
      salary_currency: (row.salary_currency as string) ?? null,
      salary_period: (row.salary_period as string) ?? null,
      experience_level: (row.experience_level as string) ?? null,
      application_url: (row.application_url as string) ?? null,
      application_email: (row.application_email as string) ?? null,
      tags: (row.tags as string[]) ?? [],
      is_featured: row.is_featured as boolean,
      status: row.status as string,
      expires_at: (row.expires_at as string) ?? null,
      view_count: Number(row.view_count ?? 0),
      created_at: row.created_at as string,
    } as JobListing;
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { status: 'ok', data: { jobs, total, page, pageSize, totalPages } };
}

export async function getJobBySlug(slug: string): Promise<Result<JobListing | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('jobs')
    .select(
      'id, title, slug, company_name, description, category_id, employment_type, location_city, location_state, location_country, is_remote, salary_min, salary_max, salary_currency, salary_period, experience_level, application_url, application_email, tags, is_featured, status, expires_at, view_count, created_at, job_categories!jobs_category_id_fkey(name)',
    )
    .in('status', ['active'])
    .eq('slug', slug)
    .maybeSingle();

  if (error) return { status: 'error', message: error.message ?? 'Could not load job.' };
  if (!data) return { status: 'ok', data: null };

  const cat = (data as Record<string, unknown>).job_categories as { name: string } | null;
  return {
    status: 'ok',
    data: {
      id: data.id as string,
      title: data.title as string,
      slug: data.slug as string,
      company_name: data.company_name as string,
      description: (data.description as string) ?? null,
      category_id: (data.category_id as string) ?? null,
      category_name: cat?.name ?? null,
      employment_type: data.employment_type as string,
      location_city: (data.location_city as string) ?? null,
      location_state: (data.location_state as string) ?? null,
      location_country: (data.location_country as string) ?? null,
      is_remote: data.is_remote as boolean,
      salary_min: (data.salary_min as number) ?? null,
      salary_max: (data.salary_max as number) ?? null,
      salary_currency: (data.salary_currency as string) ?? null,
      salary_period: (data.salary_period as string) ?? null,
      experience_level: (data.experience_level as string) ?? null,
      application_url: (data.application_url as string) ?? null,
      application_email: (data.application_email as string) ?? null,
      tags: (data.tags as string[]) ?? [],
      is_featured: data.is_featured as boolean,
      status: data.status as string,
      expires_at: (data.expires_at as string) ?? null,
      view_count: Number(data.view_count ?? 0),
      created_at: data.created_at as string,
    } as JobListing,
  };
}
