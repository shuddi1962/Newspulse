-- Phase 1 · Full schema rollout — 3 of 12: business directory
-- Tables: directory_categories, directory_listings, directory_reviews, directory_claims
-- RLS:    public reads active/verified listings; owners manage their own;
--         reviewers write their own review; admins moderate everything.

-------------------------------------------------------------------------------
-- 1. Shared listing status enum (re-used by directory/marketplace/jobs/events/real_estate/classifieds)
-------------------------------------------------------------------------------
CREATE TYPE public.listing_status AS ENUM (
  'draft', 'pending_review', 'active', 'paused',
  'expired', 'sold', 'archived', 'rejected'
);

-------------------------------------------------------------------------------
-- 2. Shared review/claim status enum (review moderation)
-------------------------------------------------------------------------------
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected', 'spam');

CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected');

-------------------------------------------------------------------------------
-- 3. directory_categories
-------------------------------------------------------------------------------
CREATE TABLE public.directory_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  icon            TEXT,
  parent_id       UUID REFERENCES public.directory_categories(id) ON DELETE SET NULL,
  listing_count   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT directory_categories_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT directory_categories_name_length CHECK (char_length(name) BETWEEN 1 AND 80),
  CONSTRAINT directory_categories_count_nn    CHECK (listing_count >= 0)
);

CREATE UNIQUE INDEX directory_categories_slug_unique ON public.directory_categories (slug);
CREATE INDEX directory_categories_parent_id_idx     ON public.directory_categories (parent_id);

CREATE TRIGGER directory_categories_set_updated_at
BEFORE UPDATE ON public.directory_categories
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. directory_listings
-------------------------------------------------------------------------------
CREATE TABLE public.directory_listings (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name      TEXT NOT NULL,
  slug               TEXT NOT NULL,
  description        TEXT,
  short_description  TEXT,
  category_id        UUID REFERENCES public.directory_categories(id) ON DELETE SET NULL,
  subcategory_ids    UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
  owner_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  logo_url           TEXT,
  cover_image        TEXT,
  gallery_images     TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  phone              TEXT,
  email              TEXT,
  website            TEXT,
  address_line1      TEXT,
  address_line2      TEXT,
  city               TEXT,
  state              TEXT,
  zip_code           TEXT,
  country            TEXT,
  latitude           DOUBLE PRECISION,
  longitude          DOUBLE PRECISION,
  operating_hours_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  price_range        TEXT,
  amenities          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  social_links_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_verified        BOOLEAN NOT NULL DEFAULT false,
  is_claimed         BOOLEAN NOT NULL DEFAULT false,
  is_featured        BOOLEAN NOT NULL DEFAULT false,
  rating_avg         NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count       INTEGER NOT NULL DEFAULT 0,
  view_count         BIGINT NOT NULL DEFAULT 0,
  status             public.listing_status NOT NULL DEFAULT 'draft',
  seo_title          TEXT,
  seo_description    TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT directory_listings_business_name_length CHECK (char_length(business_name) BETWEEN 1 AND 200),
  CONSTRAINT directory_listings_slug_format          CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT directory_listings_phone_format         CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\-\s()]{5,20}$'),
  CONSTRAINT directory_listings_email_format         CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT directory_listings_rating_range         CHECK (rating_avg >= 0 AND rating_avg <= 5),
  CONSTRAINT directory_listings_review_count_nn      CHECK (review_count >= 0),
  CONSTRAINT directory_listings_view_count_nn        CHECK (view_count >= 0),
  CONSTRAINT directory_listings_latitude_range       CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  CONSTRAINT directory_listings_longitude_range      CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180))
);

CREATE UNIQUE INDEX directory_listings_slug_unique      ON public.directory_listings (slug);
CREATE INDEX directory_listings_category_id_idx         ON public.directory_listings (category_id);
CREATE INDEX directory_listings_owner_id_idx            ON public.directory_listings (owner_id);
CREATE INDEX directory_listings_status_idx              ON public.directory_listings (status);
CREATE INDEX directory_listings_city_idx                ON public.directory_listings (city);
CREATE INDEX directory_listings_geo_idx                 ON public.directory_listings (latitude, longitude);
CREATE INDEX directory_listings_featured_active_idx     ON public.directory_listings (is_featured, status) WHERE is_featured = true AND status = 'active';
CREATE INDEX directory_listings_amenities_gin           ON public.directory_listings USING GIN (amenities);

CREATE TRIGGER directory_listings_set_updated_at
BEFORE UPDATE ON public.directory_listings
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 5. directory_reviews
-------------------------------------------------------------------------------
CREATE TABLE public.directory_reviews (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id             UUID NOT NULL REFERENCES public.directory_listings(id) ON DELETE CASCADE,
  user_id                UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating                 SMALLINT NOT NULL,
  title                  TEXT,
  content                TEXT,
  photos                 TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_verified_purchase   BOOLEAN NOT NULL DEFAULT false,
  helpful_count          INTEGER NOT NULL DEFAULT 0,
  owner_response         TEXT,
  owner_response_at      TIMESTAMPTZ,
  status                 public.review_status NOT NULL DEFAULT 'pending',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT directory_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT directory_reviews_helpful_nn   CHECK (helpful_count >= 0),
  CONSTRAINT directory_reviews_title_length CHECK (title IS NULL OR char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT directory_reviews_content_length CHECK (content IS NULL OR char_length(content) <= 5000)
);

CREATE INDEX directory_reviews_listing_id_idx ON public.directory_reviews (listing_id, created_at DESC);
CREATE INDEX directory_reviews_user_id_idx    ON public.directory_reviews (user_id);
CREATE INDEX directory_reviews_status_idx     ON public.directory_reviews (status);

CREATE UNIQUE INDEX directory_reviews_unique_per_user ON public.directory_reviews (listing_id, user_id) WHERE user_id IS NOT NULL;

CREATE TRIGGER directory_reviews_set_updated_at
BEFORE UPDATE ON public.directory_reviews
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 6. directory_claims
-------------------------------------------------------------------------------
CREATE TABLE public.directory_claims (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id             UUID NOT NULL REFERENCES public.directory_listings(id) ON DELETE CASCADE,
  user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_method    TEXT NOT NULL,
  verification_doc_url   TEXT,
  status                 public.claim_status NOT NULL DEFAULT 'pending',
  reviewed_by            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at            TIMESTAMPTZ,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT directory_claims_method_allowed CHECK (
    verification_method IN ('phone', 'email', 'document', 'utility_bill', 'tax_id', 'other')
  )
);

CREATE INDEX directory_claims_listing_id_idx ON public.directory_claims (listing_id);
CREATE INDEX directory_claims_user_id_idx    ON public.directory_claims (user_id);
CREATE INDEX directory_claims_status_idx     ON public.directory_claims (status);

-------------------------------------------------------------------------------
-- 7. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.directory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_listings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directory_claims     ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 8. Policies — directory_categories  (public read, admin write)
-------------------------------------------------------------------------------
CREATE POLICY directory_categories_select_public ON public.directory_categories FOR SELECT USING (true);
CREATE POLICY directory_categories_insert_admin  ON public.directory_categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY directory_categories_update_admin  ON public.directory_categories FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY directory_categories_delete_admin  ON public.directory_categories FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 9. Policies — directory_listings
-------------------------------------------------------------------------------
CREATE POLICY directory_listings_select ON public.directory_listings
  FOR SELECT USING (
    status = 'active'
    OR owner_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY directory_listings_insert_authenticated ON public.directory_listings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (owner_id = auth.uid() OR owner_id IS NULL)
  );

CREATE POLICY directory_listings_update_owner_or_admin ON public.directory_listings
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY directory_listings_delete_owner_or_admin ON public.directory_listings
  FOR DELETE USING (owner_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 10. Policies — directory_reviews
-------------------------------------------------------------------------------
CREATE POLICY directory_reviews_select ON public.directory_reviews
  FOR SELECT USING (
    status = 'approved'
    OR user_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.directory_listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

CREATE POLICY directory_reviews_insert_authenticated ON public.directory_reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

CREATE POLICY directory_reviews_update_self_or_admin ON public.directory_reviews
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY directory_reviews_delete_self_or_admin ON public.directory_reviews
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- Owners of the listing may update (only) the owner_response + owner_response_at fields.
-- Enforce via trigger rather than RLS (RLS can't inspect which column changed).
CREATE OR REPLACE FUNCTION public.tg_directory_reviews_owner_response_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  is_owner := EXISTS (
    SELECT 1 FROM public.directory_listings l
    WHERE l.id = NEW.listing_id AND l.owner_id = auth.uid()
  );

  IF is_owner AND NOT public.is_admin() AND NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Listing owner cannot change review.user_id' USING ERRCODE = '42501';
  END IF;

  -- If the actor is the listing owner but not the review author and not admin,
  -- keep all fields frozen except owner_response + owner_response_at.
  IF is_owner
     AND OLD.user_id IS DISTINCT FROM auth.uid()
     AND NOT public.is_admin() THEN
    NEW.rating  := OLD.rating;
    NEW.title   := OLD.title;
    NEW.content := OLD.content;
    NEW.photos  := OLD.photos;
    NEW.status  := OLD.status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER directory_reviews_guard_owner_response
BEFORE UPDATE ON public.directory_reviews
FOR EACH ROW EXECUTE FUNCTION public.tg_directory_reviews_owner_response_only();

-------------------------------------------------------------------------------
-- 11. Policies — directory_claims
-------------------------------------------------------------------------------
CREATE POLICY directory_claims_select_self_or_admin ON public.directory_claims
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY directory_claims_insert_self ON public.directory_claims
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY directory_claims_update_admin ON public.directory_claims
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY directory_claims_delete_self_or_admin ON public.directory_claims
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());
