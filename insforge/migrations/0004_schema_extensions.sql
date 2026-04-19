-- Phase 1 · Full schema rollout — 1 of 12: extensions to existing tables + shared enums
-- Adds the user_plan enum; extends profiles with plan/contact/preferences;
-- extends categories with icon/color/language/SEO fields; adds content-level
-- enums (article_status, comment_status) used by the content schema in 0005.

-------------------------------------------------------------------------------
-- 1. user_plan enum  (master prompt §users.plan)
-------------------------------------------------------------------------------
CREATE TYPE public.user_plan AS ENUM ('free', 'premium', 'vip', 'enterprise');

-------------------------------------------------------------------------------
-- 2. Content + comment enums (consumed by 0005_content_schema.sql)
-------------------------------------------------------------------------------
CREATE TYPE public.article_status AS ENUM (
  'draft', 'review', 'approved', 'scheduled',
  'published', 'archived', 'rejected'
);

CREATE TYPE public.comment_status AS ENUM (
  'pending', 'approved', 'spam', 'rejected'
);

-------------------------------------------------------------------------------
-- 3. profiles — additional columns
-------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN full_name           TEXT,
  ADD COLUMN plan                public.user_plan NOT NULL DEFAULT 'free',
  ADD COLUMN phone               TEXT,
  ADD COLUMN location            TEXT,
  ADD COLUMN preferences         JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN two_factor_enabled  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN last_login_at       TIMESTAMPTZ;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_full_name_length
    CHECK (full_name IS NULL OR char_length(full_name) BETWEEN 1 AND 120);

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_phone_format
    CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\-\s()]{5,20}$');

CREATE INDEX profiles_plan_idx ON public.profiles (plan);

-------------------------------------------------------------------------------
-- 4. categories — additional columns (matches master prompt §categories)
-------------------------------------------------------------------------------
ALTER TABLE public.categories
  ADD COLUMN icon              TEXT,
  ADD COLUMN color             TEXT,
  ADD COLUMN language          TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN seo_title         TEXT,
  ADD COLUMN seo_description   TEXT,
  ADD COLUMN is_active         BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.categories
  ADD CONSTRAINT categories_color_format
    CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$');

ALTER TABLE public.categories
  ADD CONSTRAINT categories_language_format
    CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$');

CREATE INDEX categories_is_active_idx ON public.categories (kind, is_active);

-------------------------------------------------------------------------------
-- 5. tags — counter column (master prompt §tags.article_count)
-------------------------------------------------------------------------------
ALTER TABLE public.tags
  ADD COLUMN article_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.tags
  ADD CONSTRAINT tags_article_count_nonneg
    CHECK (article_count >= 0);

-------------------------------------------------------------------------------
-- 6. Author / publisher helper: is_at_least(role_level)
-- Returns true if the current user has the given editorial role OR higher.
-- Role rank:  reader < author < editor < admin.
-- Used by content RLS (authors own drafts, editors publish, admins moderate).
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_at_least(min_role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH ranks AS (
    SELECT * FROM (VALUES
      ('reader'::public.user_role, 0),
      ('author'::public.user_role, 1),
      ('editor'::public.user_role, 2),
      ('admin'::public.user_role,  3)
    ) AS t(role_value, rank_value)
  )
  SELECT COALESCE(
    (
      SELECT r_user.rank_value >= r_min.rank_value
      FROM public.profiles p
      JOIN ranks r_user ON r_user.role_value = p.role
      CROSS JOIN ranks r_min
      WHERE p.id = auth.uid()
        AND r_min.role_value = min_role
    ),
    -- Project admins (bootstrap) always qualify
    (SELECT u.is_project_admin FROM auth.users u WHERE u.id = auth.uid()),
    false
  );
$$;

-------------------------------------------------------------------------------
-- 7. updated_at triggers on existing tables don't need to be re-added;
-- they already fire on ALTER-added columns because they operate at row level.
-------------------------------------------------------------------------------
