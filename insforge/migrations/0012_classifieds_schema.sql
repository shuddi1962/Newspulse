-- Phase 1 · Full schema rollout — 9 of 12: classifieds
-- Tables: classified_categories, classifieds, classified_responses
-- Enums:  (reuses listing_status, report_status)
-- RLS:    public reads active classifieds; posters own their classifieds;
--         responses visible to poster + responder + admin.

-------------------------------------------------------------------------------
-- 1. classified_categories
-------------------------------------------------------------------------------
CREATE TABLE public.classified_categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL,
  description    TEXT,
  icon           TEXT,
  parent_id      UUID REFERENCES public.classified_categories(id) ON DELETE SET NULL,
  display_order  INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT classified_categories_name_length CHECK (char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT classified_categories_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$')
);

CREATE UNIQUE INDEX classified_categories_slug_unique ON public.classified_categories (slug);
CREATE INDEX classified_categories_parent_idx         ON public.classified_categories (parent_id);
CREATE INDEX classified_categories_active_idx         ON public.classified_categories (is_active);

CREATE TRIGGER classified_categories_set_updated_at
BEFORE UPDATE ON public.classified_categories
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 2. classifieds
-------------------------------------------------------------------------------
CREATE TABLE public.classifieds (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id       UUID REFERENCES public.classified_categories(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL,
  description       TEXT NOT NULL,
  price             NUMERIC(12, 2),
  currency          TEXT NOT NULL DEFAULT 'USD',
  is_negotiable     BOOLEAN NOT NULL DEFAULT false,
  images            TEXT[] NOT NULL DEFAULT '{}',
  location          TEXT,
  city              TEXT,
  country           TEXT,
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  contact_name      TEXT,
  contact_email     TEXT,
  contact_phone     TEXT,
  show_phone        BOOLEAN NOT NULL DEFAULT false,
  status            public.listing_status NOT NULL DEFAULT 'draft',
  expires_at        TIMESTAMPTZ,
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  is_urgent         BOOLEAN NOT NULL DEFAULT false,
  tags              TEXT[] NOT NULL DEFAULT '{}',
  view_count        INTEGER NOT NULL DEFAULT 0,
  response_count    INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at      TIMESTAMPTZ,
  CONSTRAINT classifieds_title_length      CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT classifieds_slug_format       CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT classifieds_description_len   CHECK (char_length(description) BETWEEN 1 AND 8000),
  CONSTRAINT classifieds_price_nn          CHECK (price IS NULL OR price >= 0),
  CONSTRAINT classifieds_currency_fmt      CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT classifieds_email_format      CHECK (contact_email IS NULL OR contact_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT classifieds_phone_format      CHECK (contact_phone IS NULL OR contact_phone ~ '^[+]?[0-9\-\s()]{5,20}$'),
  CONSTRAINT classifieds_lat_range         CHECK (latitude  IS NULL OR (latitude  BETWEEN -90  AND 90)),
  CONSTRAINT classifieds_lng_range         CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  CONSTRAINT classifieds_counts_nn         CHECK (view_count >= 0 AND response_count >= 0)
);

CREATE UNIQUE INDEX classifieds_slug_unique  ON public.classifieds (slug);
CREATE INDEX classifieds_poster_idx          ON public.classifieds (poster_id);
CREATE INDEX classifieds_category_idx        ON public.classifieds (category_id);
CREATE INDEX classifieds_status_idx          ON public.classifieds (status);
CREATE INDEX classifieds_city_idx            ON public.classifieds (city);
CREATE INDEX classifieds_created_idx         ON public.classifieds (created_at DESC);
CREATE INDEX classifieds_expires_idx         ON public.classifieds (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX classifieds_tags_gin            ON public.classifieds USING GIN (tags);
CREATE INDEX classifieds_featured_partial    ON public.classifieds (created_at DESC)
  WHERE is_featured = true AND status = 'active';

CREATE TRIGGER classifieds_set_updated_at
BEFORE UPDATE ON public.classifieds
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. classified_responses  (private messages to a classified poster)
-------------------------------------------------------------------------------
CREATE TABLE public.classified_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classified_id   UUID NOT NULL REFERENCES public.classifieds(id) ON DELETE CASCADE,
  responder_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responder_name  TEXT NOT NULL,
  responder_email TEXT NOT NULL,
  responder_phone TEXT,
  message         TEXT NOT NULL,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT classified_responses_name_len   CHECK (char_length(responder_name) BETWEEN 1 AND 160),
  CONSTRAINT classified_responses_email_fmt  CHECK (responder_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT classified_responses_phone_fmt  CHECK (
    responder_phone IS NULL OR responder_phone ~ '^[+]?[0-9\-\s()]{5,20}$'
  ),
  CONSTRAINT classified_responses_message_len CHECK (char_length(message) BETWEEN 1 AND 4000)
);

CREATE INDEX classified_responses_classified_idx ON public.classified_responses (classified_id, created_at DESC);
CREATE INDEX classified_responses_responder_idx  ON public.classified_responses (responder_id);

-------------------------------------------------------------------------------
-- 4. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.classified_categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifieds            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classified_responses   ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 5. Policies — classified_categories
-------------------------------------------------------------------------------
CREATE POLICY classified_categories_select ON public.classified_categories
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY classified_categories_write_admin ON public.classified_categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 6. Policies — classifieds
-------------------------------------------------------------------------------
CREATE POLICY classifieds_select ON public.classifieds
  FOR SELECT USING (
    status = 'active'
    OR poster_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY classifieds_insert_self ON public.classifieds
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND poster_id = auth.uid());

CREATE POLICY classifieds_update_owner_or_admin ON public.classifieds
  FOR UPDATE USING (poster_id = auth.uid() OR public.is_admin())
  WITH CHECK (poster_id = auth.uid() OR public.is_admin());

CREATE POLICY classifieds_delete_owner_or_admin ON public.classifieds
  FOR DELETE USING (poster_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 7. Policies — classified_responses
-- Responder sees their own; poster sees responses to their classified; admin sees all.
-------------------------------------------------------------------------------
CREATE POLICY classified_responses_select ON public.classified_responses
  FOR SELECT USING (
    responder_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.classifieds c
      WHERE c.id = classified_id AND c.poster_id = auth.uid()
    )
  );

CREATE POLICY classified_responses_insert ON public.classified_responses
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (responder_id = auth.uid() OR responder_id IS NULL)
  );

CREATE POLICY classified_responses_update_poster_or_admin ON public.classified_responses
  FOR UPDATE USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.classifieds c
      WHERE c.id = classified_id AND c.poster_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.classifieds c
      WHERE c.id = classified_id AND c.poster_id = auth.uid()
    )
  );

CREATE POLICY classified_responses_delete_admin ON public.classified_responses
  FOR DELETE USING (public.is_admin());
