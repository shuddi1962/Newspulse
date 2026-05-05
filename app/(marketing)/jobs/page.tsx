import type { Metadata } from 'next';
import Link from 'next/link';
import { Search as SearchIcon, MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import { env } from '@/lib/env';
import { listJobCategories, listActiveJobs } from '@/lib/db/jobs';

type SearchParams = { q?: string; category?: string; remote?: string; page?: string };

export const revalidate = 60;
const PAGE_SIZE = 15;

export function generateMetadata(): Metadata {
  return {
    title: `Jobs — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Find your next career opportunity.',
  };
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = sp.q ?? '';
  const category = sp.category ?? '';
  const remote = sp.remote === 'true';
  const page = Math.max(1, Number(sp.page) || 1);

  const [categoriesRes, jobsRes] = await Promise.all([
    listJobCategories(),
    listActiveJobs(page, PAGE_SIZE, category || undefined, q || undefined, remote || undefined),
  ]);

  const categories = categoriesRes.status === 'ok' ? categoriesRes.data : [];
  const paginated = jobsRes.status === 'ok' ? jobsRes.data : { jobs: [], total: 0, page, pageSize: PAGE_SIZE, totalPages: 1 };

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-8 border-b border-(--border-subtle) pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Jobs</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Browse open positions from top employers</p>
      </header>

      <form action="/jobs" method="GET" className="mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-subtle)" aria-hidden />
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search jobs or companies..."
              className="w-full rounded-lg border border-(--border-subtle) bg-(--bg-surface) py-2.5 pl-10 pr-4 text-sm text-(--fg-default) placeholder:text-(--fg-subtle) focus:border-(--ocean-blue) focus:outline-none focus:ring-1 focus:ring-(--ocean-blue)"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-surface) px-3 py-2 text-sm text-(--fg-muted)">
            <input type="checkbox" name="remote" value="true" defaultChecked={remote} className="h-4 w-4" />
            Remote only
          </label>
          <button type="submit" className="rounded-lg bg-(--ink-black) px-5 py-2.5 text-sm font-medium text-(--pure-white) transition-colors hover:bg-(--ink-dark)">
            Search
          </button>
        </div>
      </form>

      {paginated.jobs.length === 0 ? (
        <section className="py-20 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-(--fg-subtle)" strokeWidth={1} aria-hidden />
          <h2 className="mt-4 text-xl font-semibold">No jobs found</h2>
          <p className="mt-2 text-sm text-(--fg-muted)">Check back later for new opportunities.</p>
        </section>
      ) : (
        <>
          <div className="space-y-2">
            {paginated.jobs.map((job) => {
              const location = job.is_remote ? 'Remote' : [job.location_city, job.location_state].filter(Boolean).join(', ');
              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="group flex flex-col gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5 transition-colors hover:border-(--border-strong)"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-(--fg-default) group-hover:underline">{job.title}</h3>
                      <p className="text-sm text-(--fg-muted)">{job.company_name}</p>
                    </div>
                    {job.is_featured && (
                      <span className="shrink-0 rounded bg-(--ocean-blue) px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-white">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-(--fg-subtle)">
                    {location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{location}</span>
                    )}
                    <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" aria-hidden />{job.employment_type}</span>
                    {job.salary_min && job.salary_max && (
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" aria-hidden />{job.salary_min.toLocaleString()}–{job.salary_max.toLocaleString()} {job.salary_currency ?? ''}</span>
                    )}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden />{formatPosted(job.created_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <Pagination currentPage={paginated.page} totalPages={paginated.totalPages} q={q} category={category} remote={remote} />
        </>
      )}
    </main>
  );
}

function Pagination({ currentPage, totalPages, q, category, remote }: { currentPage: number; totalPages: number; q: string; category: string; remote: boolean }) {
  if (totalPages <= 1) return null;
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);
  if (remote) params.set('remote', 'true');
  if (currentPage > 1) params.set('page', String(currentPage));
  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Pagination">
      <PageLink href={`/jobs?${params.toString().replace(`page=${currentPage}`, `page=${currentPage - 1}`)}`} disabled={currentPage <= 1}>Prev</PageLink>
      <span className="text-sm text-(--fg-muted)">Page {currentPage} of {totalPages}</span>
      <PageLink href={`/jobs?${params.toString().replace(`page=${currentPage}`, `page=${currentPage + 1}`)}`} disabled={currentPage >= totalPages}>Next</PageLink>
    </nav>
  );
}

function PageLink({ href, disabled, children }: { href: string; disabled?: boolean; children: React.ReactNode }) {
  if (disabled) return <span className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm text-(--fg-subtle) opacity-50">{children}</span>;
  return <Link href={href} className="rounded-lg border border-(--border-subtle) px-4 py-2 text-sm text-(--fg-muted) transition-colors hover:bg-(--bg-surface-subtle) hover:text-(--fg-default)">{children}</Link>;
}

function formatPosted(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
