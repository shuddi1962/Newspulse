-- Phase 1 · Full schema rollout — 11 of 12: newsletter + subscriptions + payments
-- Tables: newsletter_subscribers, newsletter_campaigns, newsletter_links,
--         subscription_plans, subscriptions, payment_transactions
-- Enums:  newsletter_sub_status, newsletter_campaign_status,
--         subscription_status, subscription_interval, txn_kind
-- RLS:    subscribers manage their own; campaigns admin-only; plans public-read;
--         subscriptions + transactions private to user + admin.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.newsletter_sub_status AS ENUM (
  'pending', 'confirmed', 'unsubscribed', 'bounced', 'complained'
);

CREATE TYPE public.newsletter_campaign_status AS ENUM (
  'draft', 'scheduled', 'sending', 'sent', 'cancelled', 'failed'
);

CREATE TYPE public.subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'cancelled', 'expired', 'paused'
);

CREATE TYPE public.subscription_interval AS ENUM (
  'day', 'week', 'month', 'quarter', 'year'
);

CREATE TYPE public.txn_kind AS ENUM (
  'charge', 'refund', 'payout', 'adjustment', 'chargeback'
);

-------------------------------------------------------------------------------
-- 2. newsletter_subscribers
-------------------------------------------------------------------------------
CREATE TABLE public.newsletter_subscribers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email             TEXT NOT NULL,
  full_name         TEXT,
  topics            TEXT[] NOT NULL DEFAULT '{}',
  language          TEXT NOT NULL DEFAULT 'en',
  status            public.newsletter_sub_status NOT NULL DEFAULT 'pending',
  confirm_token     TEXT,
  confirmed_at      TIMESTAMPTZ,
  unsubscribed_at   TIMESTAMPTZ,
  source            TEXT,
  ip_hash           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_subscribers_email_fmt CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT newsletter_subscribers_name_len  CHECK (full_name IS NULL OR char_length(full_name) <= 160),
  CONSTRAINT newsletter_subscribers_lang_fmt  CHECK (language ~ '^[a-z]{2}(-[A-Z]{2})?$')
);

CREATE UNIQUE INDEX newsletter_subscribers_email_unique ON public.newsletter_subscribers (lower(email));
CREATE INDEX newsletter_subscribers_status_idx ON public.newsletter_subscribers (status);
CREATE INDEX newsletter_subscribers_user_idx   ON public.newsletter_subscribers (user_id);
CREATE INDEX newsletter_subscribers_topics_gin ON public.newsletter_subscribers USING GIN (topics);

CREATE TRIGGER newsletter_subscribers_set_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. newsletter_campaigns
-------------------------------------------------------------------------------
CREATE TABLE public.newsletter_campaigns (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name               TEXT NOT NULL,
  subject            TEXT NOT NULL,
  preheader          TEXT,
  from_name          TEXT,
  from_email         TEXT,
  reply_to           TEXT,
  content_html       TEXT,
  content_text       TEXT,
  topics             TEXT[] NOT NULL DEFAULT '{}',
  language           TEXT NOT NULL DEFAULT 'en',
  scheduled_at       TIMESTAMPTZ,
  sent_at            TIMESTAMPTZ,
  recipients_count   INTEGER NOT NULL DEFAULT 0,
  sent_count         INTEGER NOT NULL DEFAULT 0,
  open_count         INTEGER NOT NULL DEFAULT 0,
  click_count        INTEGER NOT NULL DEFAULT 0,
  bounce_count       INTEGER NOT NULL DEFAULT 0,
  unsubscribe_count  INTEGER NOT NULL DEFAULT 0,
  status             public.newsletter_campaign_status NOT NULL DEFAULT 'draft',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_campaigns_name_len     CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT newsletter_campaigns_subject_len  CHECK (char_length(subject) BETWEEN 1 AND 250),
  CONSTRAINT newsletter_campaigns_from_email   CHECK (from_email IS NULL OR from_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT newsletter_campaigns_reply_email  CHECK (reply_to   IS NULL OR reply_to   ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT newsletter_campaigns_counts_nn    CHECK (
    recipients_count >= 0 AND sent_count >= 0 AND open_count >= 0
    AND click_count >= 0 AND bounce_count >= 0 AND unsubscribe_count >= 0
  )
);

CREATE INDEX newsletter_campaigns_status_idx    ON public.newsletter_campaigns (status);
CREATE INDEX newsletter_campaigns_scheduled_idx ON public.newsletter_campaigns (scheduled_at)
  WHERE scheduled_at IS NOT NULL;
CREATE INDEX newsletter_campaigns_topics_gin    ON public.newsletter_campaigns USING GIN (topics);

CREATE TRIGGER newsletter_campaigns_set_updated_at
BEFORE UPDATE ON public.newsletter_campaigns
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. newsletter_links  (click tracking per campaign)
-------------------------------------------------------------------------------
CREATE TABLE public.newsletter_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id   UUID NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  label         TEXT,
  click_count   INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT newsletter_links_url_fmt    CHECK (url ~ '^https?://'),
  CONSTRAINT newsletter_links_count_nn   CHECK (click_count >= 0)
);

CREATE INDEX newsletter_links_campaign_idx ON public.newsletter_links (campaign_id);

-------------------------------------------------------------------------------
-- 5. subscription_plans  (the premium tiers offered)
-------------------------------------------------------------------------------
CREATE TABLE public.subscription_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  plan_tier       public.user_plan NOT NULL,
  price           NUMERIC(12, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  interval        public.subscription_interval NOT NULL,
  interval_count  INTEGER NOT NULL DEFAULT 1,
  trial_days      INTEGER NOT NULL DEFAULT 0,
  features_json   JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_code_fmt    CHECK (code ~ '^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$'),
  CONSTRAINT subscription_plans_name_len    CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT subscription_plans_price_nn    CHECK (price >= 0),
  CONSTRAINT subscription_plans_currency_fmt CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT subscription_plans_interval_pos CHECK (interval_count > 0),
  CONSTRAINT subscription_plans_trial_nn    CHECK (trial_days >= 0)
);

CREATE UNIQUE INDEX subscription_plans_code_unique ON public.subscription_plans (code);
CREATE INDEX subscription_plans_active_idx         ON public.subscription_plans (is_active);

CREATE TRIGGER subscription_plans_set_updated_at
BEFORE UPDATE ON public.subscription_plans
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 6. subscriptions
-------------------------------------------------------------------------------
CREATE TABLE public.subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id                 UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status                  public.subscription_status NOT NULL DEFAULT 'active',
  started_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_end_at            TIMESTAMPTZ,
  current_period_start    TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end      TIMESTAMPTZ NOT NULL,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT false,
  cancelled_at            TIMESTAMPTZ,
  ended_at                TIMESTAMPTZ,
  payment_provider        TEXT,
  provider_subscription_id TEXT,
  metadata_json           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_period_order CHECK (current_period_end >= current_period_start)
);

CREATE INDEX subscriptions_user_idx     ON public.subscriptions (user_id, created_at DESC);
CREATE INDEX subscriptions_plan_idx     ON public.subscriptions (plan_id);
CREATE INDEX subscriptions_status_idx   ON public.subscriptions (status);
CREATE INDEX subscriptions_active_partial ON public.subscriptions (user_id)
  WHERE status IN ('trialing', 'active');

CREATE TRIGGER subscriptions_set_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 7. payment_transactions
-------------------------------------------------------------------------------
CREATE TABLE public.payment_transactions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscription_id    UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  ad_payment_id      UUID REFERENCES public.ad_payments(id) ON DELETE SET NULL,
  event_order_id     UUID REFERENCES public.event_orders(id) ON DELETE SET NULL,
  booking_id         UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  kind               public.txn_kind NOT NULL,
  amount             NUMERIC(14, 2) NOT NULL,
  currency           TEXT NOT NULL DEFAULT 'USD',
  payment_status     public.payment_status NOT NULL DEFAULT 'pending',
  provider           TEXT,
  provider_reference TEXT,
  description        TEXT,
  metadata_json      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at       TIMESTAMPTZ,
  CONSTRAINT payment_transactions_currency_fmt CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX payment_transactions_user_created  ON public.payment_transactions (user_id, created_at DESC);
CREATE INDEX payment_transactions_kind_idx      ON public.payment_transactions (kind);
CREATE INDEX payment_transactions_status_idx    ON public.payment_transactions (payment_status);
CREATE INDEX payment_transactions_subscription  ON public.payment_transactions (subscription_id);
CREATE INDEX payment_transactions_provider_ref  ON public.payment_transactions (provider_reference);

-------------------------------------------------------------------------------
-- 8. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_campaigns    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_links        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions    ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 9. Policies — newsletter_subscribers
-- A user can see their own subscriptions; admin sees all. Anonymous signups
-- happen via a service-role edge function (not direct RLS insert).
-------------------------------------------------------------------------------
CREATE POLICY newsletter_subscribers_select ON public.newsletter_subscribers
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY newsletter_subscribers_insert ON public.newsletter_subscribers
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  );

CREATE POLICY newsletter_subscribers_update ON public.newsletter_subscribers
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY newsletter_subscribers_delete ON public.newsletter_subscribers
  FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-------------------------------------------------------------------------------
-- 10. Policies — newsletter_campaigns / newsletter_links  (admin-only)
-------------------------------------------------------------------------------
CREATE POLICY newsletter_campaigns_select ON public.newsletter_campaigns
  FOR SELECT USING (public.is_admin());

CREATE POLICY newsletter_campaigns_write ON public.newsletter_campaigns
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY newsletter_links_select ON public.newsletter_links
  FOR SELECT USING (public.is_admin());

CREATE POLICY newsletter_links_write ON public.newsletter_links
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 11. Policies — subscription_plans  (public read of active; admin writes)
-------------------------------------------------------------------------------
CREATE POLICY subscription_plans_select ON public.subscription_plans
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY subscription_plans_write_admin ON public.subscription_plans
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 12. Policies — subscriptions  (user owns their record; admin sees all)
-------------------------------------------------------------------------------
CREATE POLICY subscriptions_select ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY subscriptions_insert ON public.subscriptions
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

CREATE POLICY subscriptions_update ON public.subscriptions
  FOR UPDATE USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

CREATE POLICY subscriptions_delete_admin ON public.subscriptions
  FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 13. Policies — payment_transactions  (user reads their own; admin sees all;
-- writes happen via service role / edge functions, admin policy is sufficient)
-------------------------------------------------------------------------------
CREATE POLICY payment_transactions_select ON public.payment_transactions
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY payment_transactions_write_admin ON public.payment_transactions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
