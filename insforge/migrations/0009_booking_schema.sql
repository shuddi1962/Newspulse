-- Phase 1 · Full schema rollout — 6 of 12: booking system
-- Tables: booking_providers, booking_services, booking_availability,
--         booking_slots, bookings, booking_reviews
-- Enums:  booking_status, payment_status, day_of_week
-- RLS:    public reads active providers/services; providers own their
--         services/availability/slots; bookings private to provider + customer.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.booking_status AS ENUM (
  'pending', 'confirmed', 'completed', 'cancelled', 'no_show'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending', 'processing', 'paid', 'refunded', 'failed', 'chargeback'
);

-------------------------------------------------------------------------------
-- 2. booking_providers
-- category_id FKs directory_categories (booking = service-provider subset of directory)
-------------------------------------------------------------------------------
CREATE TABLE public.booking_providers (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name           TEXT NOT NULL,
  slug                    TEXT NOT NULL,
  description             TEXT,
  category_id             UUID REFERENCES public.directory_categories(id) ON DELETE SET NULL,
  logo_url                TEXT,
  cover_image             TEXT,
  address                 TEXT,
  city                    TEXT,
  latitude                DOUBLE PRECISION,
  longitude               DOUBLE PRECISION,
  phone                   TEXT,
  email                   TEXT,
  website                 TEXT,
  operating_hours_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  cancellation_policy     TEXT,
  is_verified             BOOLEAN NOT NULL DEFAULT false,
  rating_avg              NUMERIC(3, 2) NOT NULL DEFAULT 0,
  review_count            INTEGER NOT NULL DEFAULT 0,
  status                  public.listing_status NOT NULL DEFAULT 'draft',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_providers_business_name_length CHECK (char_length(business_name) BETWEEN 1 AND 200),
  CONSTRAINT booking_providers_slug_format  CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT booking_providers_phone_format CHECK (phone IS NULL OR phone ~ '^[+]?[0-9\-\s()]{5,20}$'),
  CONSTRAINT booking_providers_email_format CHECK (email IS NULL OR email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT booking_providers_rating_range CHECK (rating_avg >= 0 AND rating_avg <= 5),
  CONSTRAINT booking_providers_review_nn    CHECK (review_count >= 0),
  CONSTRAINT booking_providers_lat_range    CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  CONSTRAINT booking_providers_lng_range    CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180))
);

CREATE UNIQUE INDEX booking_providers_slug_unique ON public.booking_providers (slug);
CREATE INDEX booking_providers_user_id_idx       ON public.booking_providers (user_id);
CREATE INDEX booking_providers_category_idx      ON public.booking_providers (category_id);
CREATE INDEX booking_providers_city_idx          ON public.booking_providers (city);
CREATE INDEX booking_providers_status_idx        ON public.booking_providers (status);

CREATE TRIGGER booking_providers_set_updated_at
BEFORE UPDATE ON public.booking_providers
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. booking_services
-------------------------------------------------------------------------------
CREATE TABLE public.booking_services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id       UUID NOT NULL REFERENCES public.booking_providers(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  description       TEXT,
  duration_minutes  INTEGER NOT NULL,
  price             NUMERIC(12, 2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  max_capacity      INTEGER NOT NULL DEFAULT 1,
  buffer_minutes    INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_services_name_length     CHECK (char_length(name) BETWEEN 1 AND 160),
  CONSTRAINT booking_services_duration_pos    CHECK (duration_minutes > 0),
  CONSTRAINT booking_services_price_nn        CHECK (price >= 0),
  CONSTRAINT booking_services_currency_format CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT booking_services_capacity_pos    CHECK (max_capacity > 0),
  CONSTRAINT booking_services_buffer_nn       CHECK (buffer_minutes >= 0)
);

CREATE INDEX booking_services_provider_idx  ON public.booking_services (provider_id);
CREATE INDEX booking_services_is_active_idx ON public.booking_services (provider_id, is_active);

CREATE TRIGGER booking_services_set_updated_at
BEFORE UPDATE ON public.booking_services
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. booking_availability  (weekly recurring template per provider)
-------------------------------------------------------------------------------
CREATE TABLE public.booking_availability (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id   UUID NOT NULL REFERENCES public.booking_providers(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL,
  start_time    TIME NOT NULL,
  end_time      TIME NOT NULL,
  is_available  BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT booking_availability_day_range CHECK (day_of_week BETWEEN 0 AND 6),
  CONSTRAINT booking_availability_time_order CHECK (start_time < end_time)
);

CREATE INDEX booking_availability_provider_day ON public.booking_availability (provider_id, day_of_week);

-------------------------------------------------------------------------------
-- 5. booking_slots  (concrete dated time slots derived from availability)
-------------------------------------------------------------------------------
CREATE TABLE public.booking_slots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id        UUID NOT NULL REFERENCES public.booking_services(id) ON DELETE CASCADE,
  provider_id       UUID NOT NULL REFERENCES public.booking_providers(id) ON DELETE CASCADE,
  slot_date         DATE NOT NULL,
  start_time        TIME NOT NULL,
  end_time          TIME NOT NULL,
  max_bookings      INTEGER NOT NULL DEFAULT 1,
  current_bookings  INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'open',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_slots_time_order     CHECK (start_time < end_time),
  CONSTRAINT booking_slots_max_bookings_pos CHECK (max_bookings > 0),
  CONSTRAINT booking_slots_current_range  CHECK (current_bookings >= 0 AND current_bookings <= max_bookings),
  CONSTRAINT booking_slots_status_allowed CHECK (status IN ('open', 'full', 'closed', 'blocked'))
);

CREATE UNIQUE INDEX booking_slots_unique ON public.booking_slots (service_id, slot_date, start_time);
CREATE INDEX booking_slots_provider_date ON public.booking_slots (provider_id, slot_date);
CREATE INDEX booking_slots_status_idx    ON public.booking_slots (status);

-------------------------------------------------------------------------------
-- 6. bookings
-------------------------------------------------------------------------------
CREATE TABLE public.bookings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id              UUID REFERENCES public.booking_slots(id) ON DELETE SET NULL,
  service_id           UUID NOT NULL REFERENCES public.booking_services(id) ON DELETE RESTRICT,
  provider_id          UUID NOT NULL REFERENCES public.booking_providers(id) ON DELETE RESTRICT,
  customer_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name        TEXT NOT NULL,
  customer_email       TEXT NOT NULL,
  customer_phone       TEXT,
  notes                TEXT,
  price_paid           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency             TEXT NOT NULL DEFAULT 'USD',
  payment_status       public.payment_status NOT NULL DEFAULT 'pending',
  booking_status       public.booking_status NOT NULL DEFAULT 'pending',
  reminder_sent        BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at         TIMESTAMPTZ,
  cancellation_reason  TEXT,
  CONSTRAINT bookings_customer_name_length CHECK (char_length(customer_name) BETWEEN 1 AND 160),
  CONSTRAINT bookings_customer_email_format CHECK (customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT bookings_customer_phone_format CHECK (customer_phone IS NULL OR customer_phone ~ '^[+]?[0-9\-\s()]{5,20}$'),
  CONSTRAINT bookings_price_nn              CHECK (price_paid >= 0),
  CONSTRAINT bookings_currency_format       CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT bookings_cancellation_consistency CHECK (
    (booking_status = 'cancelled') = (cancelled_at IS NOT NULL)
  )
);

CREATE INDEX bookings_slot_idx        ON public.bookings (slot_id);
CREATE INDEX bookings_customer_idx    ON public.bookings (customer_id);
CREATE INDEX bookings_provider_idx    ON public.bookings (provider_id, created_at DESC);
CREATE INDEX bookings_status_idx      ON public.bookings (booking_status);
CREATE INDEX bookings_payment_status_idx ON public.bookings (payment_status);

CREATE TRIGGER bookings_set_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 7. booking_reviews
-------------------------------------------------------------------------------
CREATE TABLE public.booking_reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  provider_id    UUID NOT NULL REFERENCES public.booking_providers(id) ON DELETE CASCADE,
  customer_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating         SMALLINT NOT NULL,
  content        TEXT,
  status         public.review_status NOT NULL DEFAULT 'approved',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT booking_reviews_rating_range CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT booking_reviews_content_length CHECK (content IS NULL OR char_length(content) <= 2000)
);

CREATE UNIQUE INDEX booking_reviews_unique_per_booking ON public.booking_reviews (booking_id);
CREATE INDEX booking_reviews_provider_idx ON public.booking_reviews (provider_id, created_at DESC);

-------------------------------------------------------------------------------
-- 8. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.booking_providers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_services     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_reviews      ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 9. Policies — booking_providers
-------------------------------------------------------------------------------
CREATE POLICY booking_providers_select ON public.booking_providers
  FOR SELECT USING (
    status = 'active'
    OR user_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY booking_providers_insert_self ON public.booking_providers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY booking_providers_update_owner_or_admin ON public.booking_providers
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY booking_providers_delete_owner_or_admin ON public.booking_providers
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 10. Policies — booking_services
-------------------------------------------------------------------------------
CREATE POLICY booking_services_select ON public.booking_services
  FOR SELECT USING (
    is_active = true
    OR EXISTS (SELECT 1 FROM public.booking_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY booking_services_write_owner_or_admin ON public.booking_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.booking_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.booking_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.is_admin()
  );

-------------------------------------------------------------------------------
-- 11. Policies — booking_availability / booking_slots
-------------------------------------------------------------------------------
CREATE POLICY booking_availability_select_public ON public.booking_availability FOR SELECT USING (true);

CREATE POLICY booking_availability_write_owner_or_admin ON public.booking_availability
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.booking_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.booking_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY booking_slots_select_public ON public.booking_slots FOR SELECT USING (true);

CREATE POLICY booking_slots_write_owner_or_admin ON public.booking_slots
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.booking_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.booking_providers p WHERE p.id = provider_id AND p.user_id = auth.uid())
    OR public.is_admin()
  );

-------------------------------------------------------------------------------
-- 12. Policies — bookings
-- Customers see their own; providers see bookings for their services; admin sees all.
-------------------------------------------------------------------------------
CREATE POLICY bookings_select ON public.bookings
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.booking_providers p
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY bookings_insert_customer ON public.bookings
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (customer_id = auth.uid() OR customer_id IS NULL)
  );

CREATE POLICY bookings_update ON public.bookings
  FOR UPDATE USING (
    customer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.booking_providers p
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    customer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.booking_providers p
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY bookings_delete_admin ON public.bookings
  FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 13. Policies — booking_reviews
-------------------------------------------------------------------------------
CREATE POLICY booking_reviews_select ON public.booking_reviews
  FOR SELECT USING (
    status = 'approved'
    OR customer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.booking_providers p
      WHERE p.id = provider_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY booking_reviews_insert_customer ON public.booking_reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.customer_id = auth.uid()
        AND b.booking_status = 'completed'
    )
  );

CREATE POLICY booking_reviews_update_self_or_admin ON public.booking_reviews
  FOR UPDATE USING (customer_id = auth.uid() OR public.is_admin())
  WITH CHECK (customer_id = auth.uid() OR public.is_admin());

CREATE POLICY booking_reviews_delete_self_or_admin ON public.booking_reviews
  FOR DELETE USING (customer_id = auth.uid() OR public.is_admin());
