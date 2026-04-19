-- Phase 1 · Full schema rollout — 8 of 12: real estate
-- Tables: properties, property_inquiries, property_favorites, property_saved_searches
-- Enums:  property_kind, property_deal_type  (reuses listing_status)
-- RLS:    public reads active listings; agents own their properties; inquiries
--         private to sender + agent + admin; favorites/saved searches private.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.property_kind AS ENUM (
  'house', 'apartment', 'condo', 'townhouse', 'villa', 'studio',
  'land', 'commercial', 'office', 'warehouse', 'other'
);

CREATE TYPE public.property_deal_type AS ENUM (
  'sale', 'rent', 'short_let', 'lease'
);

-------------------------------------------------------------------------------
-- 2. properties
-------------------------------------------------------------------------------
CREATE TABLE public.properties (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title                TEXT NOT NULL,
  slug                 TEXT NOT NULL,
  description          TEXT,
  property_kind        public.property_kind NOT NULL,
  deal_type            public.property_deal_type NOT NULL,
  price                NUMERIC(14, 2) NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'USD',
  rent_period          TEXT,
  bedrooms             SMALLINT,
  bathrooms            SMALLINT,
  area_sqft            NUMERIC(10, 2),
  lot_size_sqft        NUMERIC(12, 2),
  year_built           SMALLINT,
  address              TEXT,
  city                 TEXT,
  state_region         TEXT,
  country              TEXT,
  postal_code          TEXT,
  latitude             DOUBLE PRECISION,
  longitude            DOUBLE PRECISION,
  cover_image          TEXT,
  gallery_images       TEXT[] NOT NULL DEFAULT '{}',
  video_url            TEXT,
  virtual_tour_url     TEXT,
  amenities            TEXT[] NOT NULL DEFAULT '{}',
  features_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_featured          BOOLEAN NOT NULL DEFAULT false,
  is_verified          BOOLEAN NOT NULL DEFAULT false,
  status               public.listing_status NOT NULL DEFAULT 'draft',
  tags                 TEXT[] NOT NULL DEFAULT '{}',
  seo_title            TEXT,
  seo_description      TEXT,
  view_count           INTEGER NOT NULL DEFAULT 0,
  favorite_count       INTEGER NOT NULL DEFAULT 0,
  inquiry_count        INTEGER NOT NULL DEFAULT 0,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at         TIMESTAMPTZ,
  sold_at              TIMESTAMPTZ,
  CONSTRAINT properties_title_length    CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT properties_slug_format     CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT properties_price_pos       CHECK (price >= 0),
  CONSTRAINT properties_currency_fmt    CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT properties_rent_period_valid CHECK (
    rent_period IS NULL OR rent_period IN ('night', 'week', 'month', 'quarter', 'year')
  ),
  CONSTRAINT properties_rent_requires_period CHECK (
    deal_type <> 'rent' OR rent_period IS NOT NULL
  ),
  CONSTRAINT properties_bedrooms_nn     CHECK (bedrooms  IS NULL OR bedrooms  >= 0),
  CONSTRAINT properties_bathrooms_nn    CHECK (bathrooms IS NULL OR bathrooms >= 0),
  CONSTRAINT properties_area_nn         CHECK (area_sqft IS NULL OR area_sqft >= 0),
  CONSTRAINT properties_lot_nn          CHECK (lot_size_sqft IS NULL OR lot_size_sqft >= 0),
  CONSTRAINT properties_year_range      CHECK (year_built IS NULL OR (year_built BETWEEN 1700 AND 2200)),
  CONSTRAINT properties_lat_range       CHECK (latitude  IS NULL OR (latitude  BETWEEN -90  AND 90)),
  CONSTRAINT properties_lng_range       CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  CONSTRAINT properties_counts_nn       CHECK (view_count >= 0 AND favorite_count >= 0 AND inquiry_count >= 0),
  CONSTRAINT properties_sold_consistency CHECK (
    (sold_at IS NOT NULL) = (status = 'sold')
  )
);

CREATE UNIQUE INDEX properties_slug_unique       ON public.properties (slug);
CREATE INDEX properties_agent_idx                ON public.properties (agent_id);
CREATE INDEX properties_status_idx               ON public.properties (status);
CREATE INDEX properties_kind_idx                 ON public.properties (property_kind);
CREATE INDEX properties_deal_idx                 ON public.properties (deal_type);
CREATE INDEX properties_city_idx                 ON public.properties (city);
CREATE INDEX properties_price_idx                ON public.properties (price);
CREATE INDEX properties_bedrooms_idx             ON public.properties (bedrooms);
CREATE INDEX properties_tags_gin                 ON public.properties USING GIN (tags);
CREATE INDEX properties_amenities_gin            ON public.properties USING GIN (amenities);
CREATE INDEX properties_featured_partial         ON public.properties (created_at DESC)
  WHERE is_featured = true AND status = 'active';

CREATE TRIGGER properties_set_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. property_inquiries
-------------------------------------------------------------------------------
CREATE TABLE public.property_inquiries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sender_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name     TEXT NOT NULL,
  sender_email    TEXT NOT NULL,
  sender_phone    TEXT,
  message         TEXT NOT NULL,
  preferred_date  DATE,
  preferred_time  TIME,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  responded_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT property_inquiries_name_length  CHECK (char_length(sender_name) BETWEEN 1 AND 160),
  CONSTRAINT property_inquiries_email_format CHECK (sender_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT property_inquiries_phone_format CHECK (
    sender_phone IS NULL OR sender_phone ~ '^[+]?[0-9\-\s()]{5,20}$'
  ),
  CONSTRAINT property_inquiries_message_len  CHECK (char_length(message) BETWEEN 1 AND 4000)
);

CREATE INDEX property_inquiries_property_idx ON public.property_inquiries (property_id);
CREATE INDEX property_inquiries_sender_idx   ON public.property_inquiries (sender_id);
CREATE INDEX property_inquiries_agent_idx    ON public.property_inquiries (agent_id, created_at DESC);

-------------------------------------------------------------------------------
-- 4. property_favorites
-------------------------------------------------------------------------------
CREATE TABLE public.property_favorites (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX property_favorites_unique ON public.property_favorites (property_id, user_id);
CREATE INDEX property_favorites_user_idx      ON public.property_favorites (user_id, created_at DESC);

-------------------------------------------------------------------------------
-- 5. property_saved_searches
-------------------------------------------------------------------------------
CREATE TABLE public.property_saved_searches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  query_json      JSONB NOT NULL DEFAULT '{}'::jsonb,
  alert_enabled   BOOLEAN NOT NULL DEFAULT false,
  alert_frequency public.alert_frequency NOT NULL DEFAULT 'weekly',
  last_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT property_saved_searches_name_length CHECK (char_length(name) BETWEEN 1 AND 160)
);

CREATE INDEX property_saved_searches_user_idx ON public.property_saved_searches (user_id);

CREATE TRIGGER property_saved_searches_set_updated_at
BEFORE UPDATE ON public.property_saved_searches
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 6. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.properties               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_favorites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_saved_searches  ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 7. Policies — properties
-------------------------------------------------------------------------------
CREATE POLICY properties_select ON public.properties
  FOR SELECT USING (
    status IN ('active', 'sold')
    OR agent_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY properties_insert_self ON public.properties
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND agent_id = auth.uid());

CREATE POLICY properties_update_owner_or_admin ON public.properties
  FOR UPDATE USING (agent_id = auth.uid() OR public.is_admin())
  WITH CHECK (agent_id = auth.uid() OR public.is_admin());

CREATE POLICY properties_delete_owner_or_admin ON public.properties
  FOR DELETE USING (agent_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 8. Policies — property_inquiries
-------------------------------------------------------------------------------
CREATE POLICY property_inquiries_select ON public.property_inquiries
  FOR SELECT USING (
    sender_id = auth.uid()
    OR agent_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY property_inquiries_insert ON public.property_inquiries
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (sender_id = auth.uid() OR sender_id IS NULL)
    AND EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.agent_id = property_inquiries.agent_id)
  );

CREATE POLICY property_inquiries_update_agent_or_admin ON public.property_inquiries
  FOR UPDATE USING (agent_id = auth.uid() OR public.is_admin())
  WITH CHECK (agent_id = auth.uid() OR public.is_admin());

CREATE POLICY property_inquiries_delete_admin ON public.property_inquiries
  FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 9. Policies — property_favorites
-------------------------------------------------------------------------------
CREATE POLICY property_favorites_select_self ON public.property_favorites
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY property_favorites_insert_self ON public.property_favorites
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY property_favorites_delete_self ON public.property_favorites
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 10. Policies — property_saved_searches
-------------------------------------------------------------------------------
CREATE POLICY property_saved_searches_all_self ON public.property_saved_searches
  FOR ALL USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());
