-- Phase 1 · Full schema rollout — 12 of 12: platform primitives
-- Tables: notifications, push_subscriptions, reports, site_settings, languages,
--         page_views, search_queries, audit_logs
-- Enums:  notification_kind, report_target_kind
-- RLS:    notifications/push_subs private per user; reports writable by any
--         authed user, visible only to admin; site_settings public-read / admin-write;
--         analytics tables admin-read only (writes via service role).

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.notification_kind AS ENUM (
  'info',
  'comment_reply',
  'new_follower',
  'article_published',
  'mention',
  'booking_update',
  'order_update',
  'subscription_update',
  'ad_review',
  'moderation',
  'system'
);

CREATE TYPE public.report_target_kind AS ENUM (
  'article', 'comment', 'user', 'directory_listing', 'directory_review',
  'job', 'marketplace_item', 'marketplace_message', 'classified',
  'event', 'property', 'ad', 'booking_review', 'other'
);

-------------------------------------------------------------------------------
-- 2. notifications
-------------------------------------------------------------------------------
CREATE TABLE public.notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind         public.notification_kind NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT,
  url          TEXT,
  data_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read      BOOLEAN NOT NULL DEFAULT false,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT notifications_title_len CHECK (char_length(title) BETWEEN 1 AND 200),
  CONSTRAINT notifications_url_fmt   CHECK (url IS NULL OR url ~ '^(https?://|/)'),
  CONSTRAINT notifications_read_consistency CHECK (
    (is_read = true AND read_at IS NOT NULL) OR (is_read = false AND read_at IS NULL)
  )
);

CREATE INDEX notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX notifications_user_unread  ON public.notifications (user_id) WHERE is_read = false;

-------------------------------------------------------------------------------
-- 3. push_subscriptions
-------------------------------------------------------------------------------
CREATE TABLE public.push_subscriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint     TEXT NOT NULL,
  p256dh       TEXT NOT NULL,
  auth_key     TEXT NOT NULL,
  user_agent   TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_fmt CHECK (endpoint ~ '^https?://')
);

CREATE UNIQUE INDEX push_subscriptions_endpoint_unique ON public.push_subscriptions (endpoint);
CREATE INDEX push_subscriptions_user_idx              ON public.push_subscriptions (user_id);
CREATE INDEX push_subscriptions_active_idx            ON public.push_subscriptions (user_id, is_active);

CREATE TRIGGER push_subscriptions_set_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. reports  (user-submitted moderation reports for any entity)
-------------------------------------------------------------------------------
CREATE TABLE public.reports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_kind    public.report_target_kind NOT NULL,
  target_id      UUID NOT NULL,
  reason         TEXT NOT NULL,
  description    TEXT,
  status         public.report_status NOT NULL DEFAULT 'pending',
  resolved_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at    TIMESTAMPTZ,
  resolution     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reports_reason_len CHECK (char_length(reason) BETWEEN 1 AND 200),
  CONSTRAINT reports_desc_len   CHECK (description IS NULL OR char_length(description) <= 4000),
  CONSTRAINT reports_resolution_consistency CHECK (
    (status IN ('reviewed', 'actioned', 'dismissed')) = (resolved_at IS NOT NULL)
  )
);

CREATE INDEX reports_target_idx   ON public.reports (target_kind, target_id);
CREATE INDEX reports_status_idx   ON public.reports (status);
CREATE INDEX reports_reporter_idx ON public.reports (reporter_id);
CREATE INDEX reports_created_idx  ON public.reports (created_at DESC);

-------------------------------------------------------------------------------
-- 5. site_settings  (key/value config; some keys public-read, others admin-only)
-------------------------------------------------------------------------------
CREATE TABLE public.site_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT NOT NULL,
  value_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  is_public   BOOLEAN NOT NULL DEFAULT false,
  updated_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_key_fmt CHECK (key ~ '^[a-z0-9](?:[a-z0-9._-]{0,126}[a-z0-9])?$')
);

CREATE UNIQUE INDEX site_settings_key_unique ON public.site_settings (key);
CREATE INDEX site_settings_public_idx        ON public.site_settings (is_public);

CREATE TRIGGER site_settings_set_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 6. languages  (supported UI + content languages)
-------------------------------------------------------------------------------
CREATE TABLE public.languages (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT NOT NULL,
  name           TEXT NOT NULL,
  native_name    TEXT,
  is_rtl         BOOLEAN NOT NULL DEFAULT false,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_default     BOOLEAN NOT NULL DEFAULT false,
  display_order  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT languages_code_fmt CHECK (code ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT languages_name_len CHECK (char_length(name) BETWEEN 1 AND 80)
);

CREATE UNIQUE INDEX languages_code_unique    ON public.languages (code);
CREATE UNIQUE INDEX languages_default_unique ON public.languages (is_default) WHERE is_default = true;
CREATE INDEX languages_active_idx            ON public.languages (is_active);

CREATE TRIGGER languages_set_updated_at
BEFORE UPDATE ON public.languages
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 7. page_views  (raw pageview analytics; high-volume append-only)
-------------------------------------------------------------------------------
CREATE TABLE public.page_views (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id   TEXT,
  path         TEXT NOT NULL,
  referer      TEXT,
  user_agent   TEXT,
  ip_hash      TEXT,
  country      TEXT,
  city         TEXT,
  device_type  TEXT,
  entity_kind  TEXT,
  entity_id    UUID,
  duration_ms  INTEGER,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT page_views_duration_nn CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

CREATE INDEX page_views_created_idx  ON public.page_views (created_at DESC);
CREATE INDEX page_views_path_idx     ON public.page_views (path);
CREATE INDEX page_views_session_idx  ON public.page_views (session_id);
CREATE INDEX page_views_entity_idx   ON public.page_views (entity_kind, entity_id);

-------------------------------------------------------------------------------
-- 8. search_queries  (query log for analytics + typeahead tuning)
-------------------------------------------------------------------------------
CREATE TABLE public.search_queries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  query_text     TEXT NOT NULL,
  scope          TEXT,
  result_count   INTEGER NOT NULL DEFAULT 0,
  clicked_result TEXT,
  session_id     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT search_queries_text_len     CHECK (char_length(query_text) BETWEEN 1 AND 500),
  CONSTRAINT search_queries_result_nn    CHECK (result_count >= 0)
);

CREATE INDEX search_queries_created_idx ON public.search_queries (created_at DESC);
CREATE INDEX search_queries_user_idx    ON public.search_queries (user_id);
CREATE INDEX search_queries_scope_idx   ON public.search_queries (scope);

-------------------------------------------------------------------------------
-- 9. audit_logs  (admin + privileged actions)
-------------------------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_kind   TEXT,
  entity_id     UUID,
  before_json   JSONB,
  after_json    JSONB,
  ip_hash       TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_action_len CHECK (char_length(action) BETWEEN 1 AND 120)
);

CREATE INDEX audit_logs_actor_created ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX audit_logs_action_idx    ON public.audit_logs (action);
CREATE INDEX audit_logs_entity_idx    ON public.audit_logs (entity_kind, entity_id);

-------------------------------------------------------------------------------
-- 10. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_queries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs           ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 11. Policies — notifications  (user-owned)
-------------------------------------------------------------------------------
CREATE POLICY notifications_select_self ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_insert_admin ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY notifications_update_self ON public.notifications
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY notifications_delete_self ON public.notifications
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 12. Policies — push_subscriptions  (user manages own device tokens)
-------------------------------------------------------------------------------
CREATE POLICY push_subscriptions_all_self ON public.push_subscriptions
  FOR ALL USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 13. Policies — reports
-- Any authed user can file a report. Reporter sees their own; admin sees all.
-------------------------------------------------------------------------------
CREATE POLICY reports_select ON public.reports
  FOR SELECT USING (reporter_id = auth.uid() OR public.is_admin());

CREATE POLICY reports_insert_authed ON public.reports
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND (reporter_id = auth.uid() OR reporter_id IS NULL)
  );

CREATE POLICY reports_update_admin ON public.reports
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY reports_delete_admin ON public.reports
  FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 14. Policies — site_settings  (public flag controls read; admin writes)
-------------------------------------------------------------------------------
CREATE POLICY site_settings_select ON public.site_settings
  FOR SELECT USING (is_public = true OR public.is_admin());

CREATE POLICY site_settings_write_admin ON public.site_settings
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 15. Policies — languages  (public read; admin writes)
-------------------------------------------------------------------------------
CREATE POLICY languages_select ON public.languages
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY languages_write_admin ON public.languages
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 16. Policies — page_views / search_queries / audit_logs
-- Admin-only read. Writes happen via service-role edge functions.
-------------------------------------------------------------------------------
CREATE POLICY page_views_select_admin ON public.page_views
  FOR SELECT USING (public.is_admin());

CREATE POLICY page_views_write_admin ON public.page_views
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY search_queries_select_admin ON public.search_queries
  FOR SELECT USING (public.is_admin());

CREATE POLICY search_queries_write_admin ON public.search_queries
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY audit_logs_select_admin ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY audit_logs_write_admin ON public.audit_logs
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
