-- Phase 1 · Full schema rollout — 4 of 12: job board
-- Tables: job_categories, jobs, job_applications, job_alerts
-- Enums:  job_type, experience_level, job_application_status, alert_frequency
-- RLS:    public reads active jobs; employer owns their postings; applicants
--         see their own applications; admins moderate.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.job_type AS ENUM (
  'full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary'
);

CREATE TYPE public.experience_level AS ENUM (
  'entry', 'junior', 'mid', 'senior', 'lead', 'executive'
);

CREATE TYPE public.job_application_status AS ENUM (
  'submitted', 'reviewed', 'shortlisted', 'interview', 'offered',
  'hired', 'rejected', 'withdrawn'
);

CREATE TYPE public.alert_frequency AS ENUM ('instant', 'daily', 'weekly');

-------------------------------------------------------------------------------
-- 2. job_categories
-------------------------------------------------------------------------------
CREATE TABLE public.job_categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  icon         TEXT,
  job_count    INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT job_categories_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT job_categories_name_length CHECK (char_length(name) BETWEEN 1 AND 80),
  CONSTRAINT job_categories_count_nn    CHECK (job_count >= 0)
);

CREATE UNIQUE INDEX job_categories_slug_unique ON public.job_categories (slug);

CREATE TRIGGER job_categories_set_updated_at
BEFORE UPDATE ON public.job_categories
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. jobs
-------------------------------------------------------------------------------
CREATE TABLE public.jobs (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                 TEXT NOT NULL,
  slug                  TEXT NOT NULL,
  description_html      TEXT,
  company_name          TEXT NOT NULL,
  company_logo          TEXT,
  company_website       TEXT,
  employer_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id           UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
  job_type              public.job_type NOT NULL DEFAULT 'full_time',
  experience_level      public.experience_level NOT NULL DEFAULT 'mid',
  salary_min            NUMERIC(12, 2),
  salary_max            NUMERIC(12, 2),
  salary_currency       TEXT NOT NULL DEFAULT 'USD',
  salary_period         TEXT NOT NULL DEFAULT 'year',
  location              TEXT,
  is_remote             BOOLEAN NOT NULL DEFAULT false,
  remote_type           TEXT,
  skills_required       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  benefits              TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  application_url       TEXT,
  application_email     TEXT,
  application_deadline  TIMESTAMPTZ,
  is_featured           BOOLEAN NOT NULL DEFAULT false,
  is_urgent             BOOLEAN NOT NULL DEFAULT false,
  status                public.listing_status NOT NULL DEFAULT 'draft',
  view_count            BIGINT NOT NULL DEFAULT 0,
  application_count     INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at            TIMESTAMPTZ,
  CONSTRAINT jobs_title_length        CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT jobs_slug_format         CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT jobs_company_length      CHECK (char_length(company_name) BETWEEN 1 AND 200),
  CONSTRAINT jobs_currency_format     CHECK (salary_currency ~ '^[A-Z]{3}$'),
  CONSTRAINT jobs_period_allowed      CHECK (salary_period IN ('hour', 'day', 'week', 'month', 'year', 'project')),
  CONSTRAINT jobs_remote_type_allowed CHECK (
    remote_type IS NULL OR remote_type IN ('remote', 'hybrid', 'on_site')
  ),
  CONSTRAINT jobs_salary_range        CHECK (
    salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max
  ),
  CONSTRAINT jobs_application_contact CHECK (
    application_url IS NOT NULL OR application_email IS NOT NULL OR status = 'draft'
  ),
  CONSTRAINT jobs_application_email_format CHECK (
    application_email IS NULL OR application_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  ),
  CONSTRAINT jobs_view_count_nn       CHECK (view_count >= 0),
  CONSTRAINT jobs_application_count_nn CHECK (application_count >= 0)
);

CREATE UNIQUE INDEX jobs_slug_unique            ON public.jobs (slug);
CREATE INDEX jobs_employer_id_idx               ON public.jobs (employer_id);
CREATE INDEX jobs_category_id_idx               ON public.jobs (category_id);
CREATE INDEX jobs_status_idx                    ON public.jobs (status);
CREATE INDEX jobs_is_remote_idx                 ON public.jobs (is_remote);
CREATE INDEX jobs_job_type_idx                  ON public.jobs (job_type);
CREATE INDEX jobs_active_list_idx               ON public.jobs (status, created_at DESC) WHERE status = 'active';
CREATE INDEX jobs_expires_at_idx                ON public.jobs (expires_at);
CREATE INDEX jobs_skills_gin                    ON public.jobs USING GIN (skills_required);

CREATE TRIGGER jobs_set_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. job_applications
-------------------------------------------------------------------------------
CREATE TABLE public.job_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id        UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_url    TEXT,
  cover_letter  TEXT,
  status        public.job_application_status NOT NULL DEFAULT 'submitted',
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT job_applications_cover_letter_length CHECK (
    cover_letter IS NULL OR char_length(cover_letter) <= 10000
  )
);

CREATE UNIQUE INDEX job_applications_unique_per_user ON public.job_applications (job_id, user_id);
CREATE INDEX job_applications_job_id_idx  ON public.job_applications (job_id);
CREATE INDEX job_applications_user_id_idx ON public.job_applications (user_id);
CREATE INDEX job_applications_status_idx  ON public.job_applications (status);

CREATE TRIGGER job_applications_set_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 5. job_alerts
-------------------------------------------------------------------------------
CREATE TABLE public.job_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keywords      TEXT,
  location      TEXT,
  job_type      public.job_type,
  salary_min    NUMERIC(12, 2),
  frequency     public.alert_frequency NOT NULL DEFAULT 'daily',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_sent_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX job_alerts_user_id_idx   ON public.job_alerts (user_id);
CREATE INDEX job_alerts_is_active_idx ON public.job_alerts (is_active) WHERE is_active = true;

-------------------------------------------------------------------------------
-- 6. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.job_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts        ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 7. Policies — job_categories
-------------------------------------------------------------------------------
CREATE POLICY job_categories_select_public ON public.job_categories FOR SELECT USING (true);
CREATE POLICY job_categories_insert_admin  ON public.job_categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY job_categories_update_admin  ON public.job_categories FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY job_categories_delete_admin  ON public.job_categories FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 8. Policies — jobs
-------------------------------------------------------------------------------
CREATE POLICY jobs_select ON public.jobs
  FOR SELECT USING (
    status = 'active'
    OR employer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY jobs_insert_authenticated ON public.jobs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND employer_id = auth.uid()
  );

CREATE POLICY jobs_update_employer_or_admin ON public.jobs
  FOR UPDATE USING (employer_id = auth.uid() OR public.is_admin())
  WITH CHECK (employer_id = auth.uid() OR public.is_admin());

CREATE POLICY jobs_delete_employer_or_admin ON public.jobs
  FOR DELETE USING (employer_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 9. Policies — job_applications
-- Applicants see their own; employer sees applications to their jobs; admin sees all.
-------------------------------------------------------------------------------
CREATE POLICY job_applications_select ON public.job_applications
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.employer_id = auth.uid()
    )
  );

CREATE POLICY job_applications_insert_self ON public.job_applications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.jobs j WHERE j.id = job_id AND j.status = 'active'
    )
  );

-- Applicant can update/withdraw their own; employer can update status/notes on their jobs.
CREATE POLICY job_applications_update ON public.job_applications
  FOR UPDATE USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.employer_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = job_id AND j.employer_id = auth.uid()
    )
  );

CREATE POLICY job_applications_delete_self_or_admin ON public.job_applications
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 10. Policies — job_alerts
-------------------------------------------------------------------------------
CREATE POLICY job_alerts_select_self ON public.job_alerts
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY job_alerts_insert_self ON public.job_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY job_alerts_update_self ON public.job_alerts
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY job_alerts_delete_self ON public.job_alerts
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());
