-- Phase 1 · Full schema rollout — 5 of 12: marketplace
-- Tables: marketplace_categories, marketplace_items, marketplace_messages,
--         marketplace_favorites, marketplace_reports
-- Enums:  item_condition, report_status
-- RLS:    public reads active items; seller owns their listings; messaging
--         private to participants; admins moderate.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.item_condition AS ENUM ('new', 'like_new', 'good', 'fair', 'for_parts');

CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'actioned', 'dismissed');

-------------------------------------------------------------------------------
-- 2. marketplace_categories
-------------------------------------------------------------------------------
CREATE TABLE public.marketplace_categories (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  icon         TEXT,
  parent_id    UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
  item_count   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_categories_slug_format CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$'),
  CONSTRAINT marketplace_categories_name_length CHECK (char_length(name) BETWEEN 1 AND 80),
  CONSTRAINT marketplace_categories_count_nn    CHECK (item_count >= 0)
);

CREATE UNIQUE INDEX marketplace_categories_slug_unique ON public.marketplace_categories (slug);
CREATE INDEX marketplace_categories_parent_id_idx      ON public.marketplace_categories (parent_id);

CREATE TRIGGER marketplace_categories_set_updated_at
BEFORE UPDATE ON public.marketplace_categories
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. marketplace_items
-------------------------------------------------------------------------------
CREATE TABLE public.marketplace_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(12, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  condition       public.item_condition NOT NULL DEFAULT 'good',
  category_id     UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
  subcategory_id  UUID REFERENCES public.marketplace_categories(id) ON DELETE SET NULL,
  seller_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  images          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  location        TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  is_negotiable   BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  view_count      BIGINT NOT NULL DEFAULT 0,
  favorite_count  INTEGER NOT NULL DEFAULT 0,
  status          public.listing_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sold_at         TIMESTAMPTZ,
  CONSTRAINT marketplace_items_title_length CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT marketplace_items_slug_format  CHECK (slug ~ '^[a-z0-9](?:[a-z0-9-]{0,120}[a-z0-9])?$'),
  CONSTRAINT marketplace_items_price_nn     CHECK (price >= 0),
  CONSTRAINT marketplace_items_currency_fmt CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT marketplace_items_view_count_nn CHECK (view_count >= 0),
  CONSTRAINT marketplace_items_fav_count_nn  CHECK (favorite_count >= 0),
  CONSTRAINT marketplace_items_lat_range    CHECK (latitude IS NULL OR (latitude BETWEEN -90 AND 90)),
  CONSTRAINT marketplace_items_lng_range    CHECK (longitude IS NULL OR (longitude BETWEEN -180 AND 180)),
  CONSTRAINT marketplace_items_sold_consistency CHECK (
    (status = 'sold') = (sold_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX marketplace_items_slug_unique ON public.marketplace_items (slug);
CREATE INDEX marketplace_items_seller_idx        ON public.marketplace_items (seller_id);
CREATE INDEX marketplace_items_category_idx      ON public.marketplace_items (category_id);
CREATE INDEX marketplace_items_status_idx        ON public.marketplace_items (status);
CREATE INDEX marketplace_items_active_list_idx   ON public.marketplace_items (status, created_at DESC) WHERE status = 'active';
CREATE INDEX marketplace_items_geo_idx           ON public.marketplace_items (latitude, longitude);
CREATE INDEX marketplace_items_price_idx         ON public.marketplace_items (price) WHERE status = 'active';

CREATE TRIGGER marketplace_items_set_updated_at
BEFORE UPDATE ON public.marketplace_items
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. marketplace_messages
-------------------------------------------------------------------------------
CREATE TABLE public.marketplace_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_messages_length CHECK (char_length(message) BETWEEN 1 AND 5000),
  CONSTRAINT marketplace_messages_not_self CHECK (sender_id <> receiver_id)
);

CREATE INDEX marketplace_messages_item_idx      ON public.marketplace_messages (item_id);
CREATE INDEX marketplace_messages_participants  ON public.marketplace_messages (item_id, sender_id, receiver_id, created_at DESC);
CREATE INDEX marketplace_messages_receiver_idx  ON public.marketplace_messages (receiver_id, is_read);

-------------------------------------------------------------------------------
-- 5. marketplace_favorites
-------------------------------------------------------------------------------
CREATE TABLE public.marketplace_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX marketplace_favorites_unique ON public.marketplace_favorites (item_id, user_id);
CREATE INDEX marketplace_favorites_user_idx      ON public.marketplace_favorites (user_id);

-------------------------------------------------------------------------------
-- 6. marketplace_reports
-------------------------------------------------------------------------------
CREATE TABLE public.marketplace_reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  reporter_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       TEXT NOT NULL,
  description  TEXT,
  status       public.report_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT marketplace_reports_reason_length CHECK (char_length(reason) BETWEEN 1 AND 80),
  CONSTRAINT marketplace_reports_desc_length   CHECK (description IS NULL OR char_length(description) <= 2000)
);

CREATE INDEX marketplace_reports_item_idx   ON public.marketplace_reports (item_id);
CREATE INDEX marketplace_reports_status_idx ON public.marketplace_reports (status);

-------------------------------------------------------------------------------
-- 7. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_favorites  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_reports    ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 8. Policies — marketplace_categories
-------------------------------------------------------------------------------
CREATE POLICY marketplace_categories_select_public ON public.marketplace_categories FOR SELECT USING (true);
CREATE POLICY marketplace_categories_insert_admin  ON public.marketplace_categories FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY marketplace_categories_update_admin  ON public.marketplace_categories FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY marketplace_categories_delete_admin  ON public.marketplace_categories FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 9. Policies — marketplace_items
-------------------------------------------------------------------------------
CREATE POLICY marketplace_items_select ON public.marketplace_items
  FOR SELECT USING (
    status IN ('active', 'sold')
    OR seller_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY marketplace_items_insert_self ON public.marketplace_items
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND seller_id = auth.uid()
  );

CREATE POLICY marketplace_items_update_seller_or_admin ON public.marketplace_items
  FOR UPDATE USING (seller_id = auth.uid() OR public.is_admin())
  WITH CHECK (seller_id = auth.uid() OR public.is_admin());

CREATE POLICY marketplace_items_delete_seller_or_admin ON public.marketplace_items
  FOR DELETE USING (seller_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 10. Policies — marketplace_messages
-- Only participants can read / write their own messages; admin can moderate.
-------------------------------------------------------------------------------
CREATE POLICY marketplace_messages_select ON public.marketplace_messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY marketplace_messages_insert_sender ON public.marketplace_messages
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND sender_id = auth.uid()
    AND sender_id <> receiver_id
  );

CREATE POLICY marketplace_messages_update_receiver_read ON public.marketplace_messages
  FOR UPDATE USING (receiver_id = auth.uid() OR public.is_admin())
  WITH CHECK (receiver_id = auth.uid() OR public.is_admin());

CREATE POLICY marketplace_messages_delete_participant ON public.marketplace_messages
  FOR DELETE USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
    OR public.is_admin()
  );

-------------------------------------------------------------------------------
-- 11. Policies — marketplace_favorites
-------------------------------------------------------------------------------
CREATE POLICY marketplace_favorites_select_self ON public.marketplace_favorites
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY marketplace_favorites_insert_self ON public.marketplace_favorites
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY marketplace_favorites_delete_self ON public.marketplace_favorites
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 12. Policies — marketplace_reports
-- Reporters see their own; admins see all; sellers can't see reports on their own items.
-------------------------------------------------------------------------------
CREATE POLICY marketplace_reports_select ON public.marketplace_reports
  FOR SELECT USING (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY marketplace_reports_insert_self ON public.marketplace_reports
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND reporter_id = auth.uid());

CREATE POLICY marketplace_reports_update_admin ON public.marketplace_reports
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY marketplace_reports_delete_admin ON public.marketplace_reports
  FOR DELETE USING (public.is_admin());
