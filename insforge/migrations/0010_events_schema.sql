-- Phase 1 · Full schema rollout — 7 of 12: events & ticketing
-- Tables: event_categories, events, event_tickets, event_orders, event_order_items
-- Enums:  event_ticket_kind, event_order_status  (reuses listing_status, payment_status)
-- RLS:    public reads active events + visible tickets; organizers own their events;
--         customers see only their own orders; admin moderates.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.event_ticket_kind AS ENUM (
  'free', 'paid', 'donation'
);

CREATE TYPE public.event_order_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'refunded', 'failed'
);

-------------------------------------------------------------------------------
-- 2. event_categories
-------------------------------------------------------------------------------
CREATE TABLE public.event_categories (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL,
  description      TEXT,
  icon             TEXT,
  color            TEXT,
  parent_id        UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  display_order    INTEGER NOT NULL DEFAULT 0,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_categories_name_length CHECK (char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT event_categories_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT event_categories_color_format CHECK (color IS NULL OR color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE UNIQUE INDEX event_categories_slug_unique ON public.event_categories (slug);
CREATE INDEX event_categories_parent_idx       ON public.event_categories (parent_id);
CREATE INDEX event_categories_active_idx       ON public.event_categories (is_active);

CREATE TRIGGER event_categories_set_updated_at
BEFORE UPDATE ON public.event_categories
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. events
-------------------------------------------------------------------------------
CREATE TABLE public.events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id         UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  slug                TEXT NOT NULL,
  short_description   TEXT,
  description_html    TEXT,
  cover_image         TEXT,
  gallery_images      TEXT[] NOT NULL DEFAULT '{}',
  venue_name          TEXT,
  address             TEXT,
  city                TEXT,
  country             TEXT,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  is_virtual          BOOLEAN NOT NULL DEFAULT false,
  virtual_link        TEXT,
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ NOT NULL,
  timezone            TEXT NOT NULL DEFAULT 'UTC',
  is_recurring        BOOLEAN NOT NULL DEFAULT false,
  recurrence_rule     TEXT,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  is_free             BOOLEAN NOT NULL DEFAULT false,
  min_price           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  max_price           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency            TEXT NOT NULL DEFAULT 'USD',
  total_capacity      INTEGER,
  tickets_sold        INTEGER NOT NULL DEFAULT 0,
  status              public.listing_status NOT NULL DEFAULT 'draft',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  seo_title           TEXT,
  seo_description     TEXT,
  view_count          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at        TIMESTAMPTZ,
  CONSTRAINT events_title_length   CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT events_slug_format    CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT events_time_order     CHECK (end_at >= start_at),
  CONSTRAINT events_price_nn       CHECK (min_price >= 0 AND max_price >= 0),
  CONSTRAINT events_price_range    CHECK (max_price >= min_price),
  CONSTRAINT events_currency_fmt   CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT events_capacity_nn    CHECK (total_capacity IS NULL OR total_capacity >= 0),
  CONSTRAINT events_tickets_nn     CHECK (tickets_sold >= 0),
  CONSTRAINT events_tickets_cap    CHECK (total_capacity IS NULL OR tickets_sold <= total_capacity),
  CONSTRAINT events_lat_range      CHECK (latitude  IS NULL OR (latitude  BETWEEN -90  AND 90)),
  CONSTRAINT events_lng_range      CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  CONSTRAINT events_virtual_link_required CHECK (NOT is_virtual OR virtual_link IS NOT NULL)
);

CREATE UNIQUE INDEX events_slug_unique        ON public.events (slug);
CREATE INDEX events_organizer_idx             ON public.events (organizer_id);
CREATE INDEX events_category_idx              ON public.events (category_id);
CREATE INDEX events_status_idx                ON public.events (status);
CREATE INDEX events_start_at_idx              ON public.events (start_at);
CREATE INDEX events_tags_gin                  ON public.events USING GIN (tags);
CREATE INDEX events_featured_partial          ON public.events (start_at) WHERE is_featured = true AND status = 'active';
CREATE INDEX events_city_idx                  ON public.events (city);

CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. event_tickets  (ticket tiers belonging to an event)
-------------------------------------------------------------------------------
CREATE TABLE public.event_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  kind            public.event_ticket_kind NOT NULL DEFAULT 'paid',
  price           NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'USD',
  quantity_total  INTEGER,
  quantity_sold   INTEGER NOT NULL DEFAULT 0,
  sales_start_at  TIMESTAMPTZ,
  sales_end_at    TIMESTAMPTZ,
  min_per_order   INTEGER NOT NULL DEFAULT 1,
  max_per_order   INTEGER NOT NULL DEFAULT 10,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_tickets_name_length    CHECK (char_length(name) BETWEEN 1 AND 160),
  CONSTRAINT event_tickets_price_nn       CHECK (price >= 0),
  CONSTRAINT event_tickets_currency_fmt   CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT event_tickets_qty_total_nn   CHECK (quantity_total IS NULL OR quantity_total >= 0),
  CONSTRAINT event_tickets_qty_sold_nn    CHECK (quantity_sold >= 0),
  CONSTRAINT event_tickets_qty_cap        CHECK (quantity_total IS NULL OR quantity_sold <= quantity_total),
  CONSTRAINT event_tickets_per_order_rng  CHECK (min_per_order >= 1 AND max_per_order >= min_per_order),
  CONSTRAINT event_tickets_sales_window   CHECK (
    sales_start_at IS NULL OR sales_end_at IS NULL OR sales_end_at >= sales_start_at
  )
);

CREATE INDEX event_tickets_event_idx   ON public.event_tickets (event_id);
CREATE INDEX event_tickets_active_idx  ON public.event_tickets (event_id, is_active);

CREATE TRIGGER event_tickets_set_updated_at
BEFORE UPDATE ON public.event_tickets
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 5. event_orders  (one per checkout; aggregates line items)
-------------------------------------------------------------------------------
CREATE TABLE public.event_orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES public.events(id) ON DELETE RESTRICT,
  customer_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT,
  subtotal          NUMERIC(12, 2) NOT NULL DEFAULT 0,
  fees              NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total             NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'USD',
  order_status      public.event_order_status NOT NULL DEFAULT 'pending',
  payment_status    public.payment_status     NOT NULL DEFAULT 'pending',
  payment_provider  TEXT,
  payment_reference TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancelled_at      TIMESTAMPTZ,
  CONSTRAINT event_orders_name_length  CHECK (char_length(customer_name) BETWEEN 1 AND 160),
  CONSTRAINT event_orders_email_format CHECK (customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT event_orders_phone_format CHECK (customer_phone IS NULL OR customer_phone ~ '^[+]?[0-9\-\s()]{5,20}$'),
  CONSTRAINT event_orders_amounts_nn   CHECK (subtotal >= 0 AND fees >= 0 AND total >= 0),
  CONSTRAINT event_orders_currency_fmt CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT event_orders_cancel_consistency CHECK (
    (order_status = 'cancelled') = (cancelled_at IS NOT NULL)
  )
);

CREATE INDEX event_orders_event_idx          ON public.event_orders (event_id);
CREATE INDEX event_orders_customer_idx       ON public.event_orders (customer_id);
CREATE INDEX event_orders_status_idx         ON public.event_orders (order_status);
CREATE INDEX event_orders_payment_status_idx ON public.event_orders (payment_status);
CREATE INDEX event_orders_created_idx        ON public.event_orders (created_at DESC);

CREATE TRIGGER event_orders_set_updated_at
BEFORE UPDATE ON public.event_orders
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 6. event_order_items  (line items: one per ticket tier in the order)
-------------------------------------------------------------------------------
CREATE TABLE public.event_order_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       UUID NOT NULL REFERENCES public.event_orders(id) ON DELETE CASCADE,
  ticket_id      UUID NOT NULL REFERENCES public.event_tickets(id) ON DELETE RESTRICT,
  quantity       INTEGER NOT NULL,
  unit_price     NUMERIC(12, 2) NOT NULL,
  line_total     NUMERIC(12, 2) NOT NULL,
  attendee_name  TEXT,
  attendee_email TEXT,
  qr_code        TEXT,
  checked_in_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT event_order_items_quantity_pos CHECK (quantity > 0),
  CONSTRAINT event_order_items_price_nn    CHECK (unit_price >= 0 AND line_total >= 0),
  CONSTRAINT event_order_items_email_fmt   CHECK (
    attendee_email IS NULL OR attendee_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  )
);

CREATE INDEX event_order_items_order_idx  ON public.event_order_items (order_id);
CREATE INDEX event_order_items_ticket_idx ON public.event_order_items (ticket_id);

-------------------------------------------------------------------------------
-- 7. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.event_categories   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_orders       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_order_items  ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 8. Policies — event_categories  (public reads active; admin writes)
-------------------------------------------------------------------------------
CREATE POLICY event_categories_select ON public.event_categories
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY event_categories_write_admin ON public.event_categories
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 9. Policies — events
-------------------------------------------------------------------------------
CREATE POLICY events_select ON public.events
  FOR SELECT USING (
    status = 'active'
    OR organizer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY events_insert_self ON public.events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND organizer_id = auth.uid());

CREATE POLICY events_update_owner_or_admin ON public.events
  FOR UPDATE USING (organizer_id = auth.uid() OR public.is_admin())
  WITH CHECK (organizer_id = auth.uid() OR public.is_admin());

CREATE POLICY events_delete_owner_or_admin ON public.events
  FOR DELETE USING (organizer_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 10. Policies — event_tickets
-------------------------------------------------------------------------------
CREATE POLICY event_tickets_select ON public.event_tickets
  FOR SELECT USING (
    is_active = true
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY event_tickets_write_owner_or_admin ON public.event_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
    OR public.is_admin()
  );

-------------------------------------------------------------------------------
-- 11. Policies — event_orders
-- Customers see their own; organizers see orders for their events; admin sees all.
-------------------------------------------------------------------------------
CREATE POLICY event_orders_select ON public.event_orders
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
  );

CREATE POLICY event_orders_insert_customer ON public.event_orders
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (customer_id = auth.uid() OR customer_id IS NULL)
  );

CREATE POLICY event_orders_update ON public.event_orders
  FOR UPDATE USING (
    customer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
  )
  WITH CHECK (
    customer_id = auth.uid()
    OR public.is_admin()
    OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = event_id AND e.organizer_id = auth.uid())
  );

CREATE POLICY event_orders_delete_admin ON public.event_orders
  FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 12. Policies — event_order_items (inherit via parent order)
-------------------------------------------------------------------------------
CREATE POLICY event_order_items_select ON public.event_order_items
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.event_orders o
      WHERE o.id = order_id
        AND (
          o.customer_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = o.event_id AND e.organizer_id = auth.uid())
        )
    )
  );

CREATE POLICY event_order_items_write ON public.event_order_items
  FOR ALL USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.event_orders o
      WHERE o.id = order_id
        AND (
          o.customer_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = o.event_id AND e.organizer_id = auth.uid())
        )
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.event_orders o
      WHERE o.id = order_id
        AND (
          o.customer_id = auth.uid()
          OR EXISTS (SELECT 1 FROM public.events e WHERE e.id = o.event_id AND e.organizer_id = auth.uid())
        )
    )
  );
