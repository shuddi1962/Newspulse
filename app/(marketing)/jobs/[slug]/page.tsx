import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Briefcase, DollarSign, ExternalLink, Mail, Clock } from 'lucide-react';
import { env } from '@/lib/env';
import { getJobBySlug } from '@/lib/db/jobs';

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await getJobBySlug(slug);
  if (res.status !== 'ok' || !res.data) return { title: 'Job not found' };
  return { title: `${res.data.title} at ${res.data.company_name} — ${env.NEXT_PUBLIC_SITE_NAME}` };
}

export default async function JobDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const res = await getJobBySlug(slug);
  if (res.status !== 'ok' || !res.data) notFound();

  const job = res.data;
  const location = job.is_remote ? 'Remote' : [job.location_city, job.location_state, job.location_country].filter(Boolean).join(', ');

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <nav className="mb-6 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-(--fg-muted)">Home</Link>
        <span className="mx-1">/</span>
        <Link href="/jobs" className="hover:text-(--fg-muted)">Jobs</Link>
        <span className="mx-1">/</span>
        <span className="text-(--fg-muted)">{job.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
          <p className="mt-2 text-lg text-(--fg-muted)">{job.company_name}</p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-(--fg-muted)">
            {location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" aria-hidden />{location}</span>}
            <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" aria-hidden />{job.employment_type}</span>
            {job.experience_level && <span className="flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden />{job.experience_level}</span>}
          </div>

          {job.salary_min && job.salary_max && (
            <div className="mt-4 inline-flex items-center gap-1 rounded-lg bg-(--bg-surface-subtle) px-3 py-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" aria-hidden />
              {job.salary_min.toLocaleString()}–{job.salary_max.toLocaleString()} {job.salary_currency ?? ''}
              {job.salary_period ? ` / ${job.salary_period}` : ''}
            </div>
          )}

          {job.description && (
            <div className="prose mt-8 max-w-none whitespace-pre-wrap text-base leading-relaxed text-(--fg-muted)">
              {job.description}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
            <h2 className="mb-4 text-lg font-semibold">Apply</h2>
            <div className="space-y-3">
              {job.application_url && (
                <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-lg bg-(--ink-black) px-4 py-2.5 text-sm font-medium text-(--pure-white) transition-colors hover:bg-(--ink-dark)">
                  Apply now <ExternalLink className="h-4 w-4" />
                </a>
              )}
              {job.application_email && (
                <a href={`mailto:${job.application_email}?subject=Application: ${job.title}`} className="flex w-full items-center justify-center gap-2 rounded-lg border border-(--border-subtle) px-4 py-2.5 text-sm font-medium transition-colors hover:bg-(--bg-surface-subtle)">
                  <Mail className="h-4 w-4" /> Email application
                </a>
              )}
            </div>
          </div>

          {job.tags.length > 0 && (
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6">
              <h3 className="mb-3 text-sm font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-(--bg-surface-subtle) px-3 py-1 text-xs text-(--fg-muted)">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
