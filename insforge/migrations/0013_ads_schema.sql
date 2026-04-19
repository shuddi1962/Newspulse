-- Phase 1 · Full schema rollout — 10 of 12: self-serve ad platform
-- Tables: ad_accounts, ad_campaigns, ad_groups, ads, ad_placements, ad_impressions,
--         ad_clicks, ad_conversions, ad_daily_stats, ad_payments, ad_invoices
-- Enums:  ad_campaign_status, ad_objective, ad_billing_model, ad_creative_format,
--         ad_review_status, ad_slot_position, ad_payment_status, ad_invoice_status
-- RLS:    accounts/campaigns private to owner + admin; impressions/clicks writable
--         by service role only; analytics visible to owner + admin.

-------------------------------------------------------------------------------
-- 1. Enums
-------------------------------------------------------------------------------
CREATE TYPE public.ad_campaign_status AS ENUM (
  'draft', 'pending_review', 'active', 'paused', 'completed', 'rejected', 'archived'
);

CREATE TYPE public.ad_objective AS ENUM (
  'awareness', 'traffic', 'conversions', 'leads', 'app_installs', 'engagement'
);

CREATE TYPE public.ad_billing_model AS ENUM (
  'cpm', 'cpc', 'cpa', 'flat_rate'
);

CREATE TYPE public.ad_creative_format AS ENUM (
  'banner', 'native', 'video', 'sponsored_post', 'popup', 'sticky_footer'
);

CREATE TYPE public.ad_review_status AS ENUM (
  'pending', 'approved', 'rejected'
);

CREATE TYPE public.ad_slot_position AS ENUM (
  'header', 'sidebar', 'in_feed', 'between_articles', 'sticky_footer',
  'article_top', 'article_bottom', 'homepage_hero', 'category_top', 'search_results'
);

CREATE TYPE public.ad_payment_status AS ENUM (
  'pending', 'processing', 'succeeded', 'failed', 'refunded'
);

CREATE TYPE public.ad_invoice_status AS ENUM (
  'draft', 'open', 'paid', 'void', 'uncollectible'
);

-------------------------------------------------------------------------------
-- 2. ad_accounts  (one per advertiser; holds billing context and credit balance)
-------------------------------------------------------------------------------
CREATE TABLE public.ad_accounts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name       TEXT NOT NULL,
  business_email      TEXT NOT NULL,
  business_phone      TEXT,
  tax_id              TEXT,
  billing_address     TEXT,
  billing_city        TEXT,
  billing_country     TEXT,
  billing_postal_code TEXT,
  currency            TEXT NOT NULL DEFAULT 'USD',
  credit_balance      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total_spent         NUMERIC(14, 2) NOT NULL DEFAULT 0,
  is_verified         BOOLEAN NOT NULL DEFAULT false,
  is_suspended        BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_accounts_business_name_len CHECK (char_length(business_name) BETWEEN 1 AND 200),
  CONSTRAINT ad_accounts_email_format      CHECK (business_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT ad_accounts_phone_format      CHECK (business_phone IS NULL OR business_phone ~ '^[+]?[0-9\-\s()]{5,20}$'),
  CONSTRAINT ad_accounts_currency_fmt      CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT ad_accounts_balance_nn        CHECK (credit_balance >= 0 AND total_spent >= 0)
);

CREATE UNIQUE INDEX ad_accounts_owner_unique ON public.ad_accounts (owner_id);
CREATE INDEX ad_accounts_suspended_idx       ON public.ad_accounts (is_suspended);

CREATE TRIGGER ad_accounts_set_updated_at
BEFORE UPDATE ON public.ad_accounts
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 3. ad_campaigns
-------------------------------------------------------------------------------
CREATE TABLE public.ad_campaigns (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  objective         public.ad_objective NOT NULL,
  billing_model     public.ad_billing_model NOT NULL,
  bid_amount        NUMERIC(12, 4) NOT NULL DEFAULT 0,
  daily_budget      NUMERIC(12, 2),
  total_budget      NUMERIC(12, 2),
  spent_amount      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'USD',
  start_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_at            TIMESTAMPTZ,
  targeting_json    JSONB NOT NULL DEFAULT '{}'::jsonb,
  status            public.ad_campaign_status NOT NULL DEFAULT 'draft',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_campaigns_name_length    CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT ad_campaigns_bid_nn         CHECK (bid_amount >= 0),
  CONSTRAINT ad_campaigns_daily_nn       CHECK (daily_budget IS NULL OR daily_budget >= 0),
  CONSTRAINT ad_campaigns_total_nn       CHECK (total_budget IS NULL OR total_budget >= 0),
  CONSTRAINT ad_campaigns_spent_nn       CHECK (spent_amount >= 0),
  CONSTRAINT ad_campaigns_currency_fmt   CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT ad_campaigns_time_order     CHECK (end_at IS NULL OR end_at >= start_at)
);

CREATE INDEX ad_campaigns_account_idx ON public.ad_campaigns (account_id);
CREATE INDEX ad_campaigns_status_idx  ON public.ad_campaigns (status);
CREATE INDEX ad_campaigns_active_partial ON public.ad_campaigns (start_at, end_at)
  WHERE status = 'active';

CREATE TRIGGER ad_campaigns_set_updated_at
BEFORE UPDATE ON public.ad_campaigns
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 4. ad_groups  (logical grouping of ads under a campaign)
-------------------------------------------------------------------------------
CREATE TABLE public.ad_groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  bid_amount      NUMERIC(12, 4),
  targeting_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_groups_name_length CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT ad_groups_bid_nn     CHECK (bid_amount IS NULL OR bid_amount >= 0)
);

CREATE INDEX ad_groups_campaign_idx ON public.ad_groups (campaign_id);
CREATE INDEX ad_groups_active_idx   ON public.ad_groups (campaign_id, is_active);

CREATE TRIGGER ad_groups_set_updated_at
BEFORE UPDATE ON public.ad_groups
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 5. ads  (individual creatives)
-------------------------------------------------------------------------------
CREATE TABLE public.ads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES public.ad_groups(id) ON DELETE CASCADE,
  campaign_id       UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  account_id        UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  creative_format   public.ad_creative_format NOT NULL,
  headline          TEXT,
  body_text         TEXT,
  call_to_action    TEXT,
  image_url         TEXT,
  video_url         TEXT,
  destination_url   TEXT NOT NULL,
  tracking_url      TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  review_status     public.ad_review_status NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ads_name_length      CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT ads_destination_url  CHECK (destination_url ~ '^https?://'),
  CONSTRAINT ads_tracking_url_fmt CHECK (tracking_url IS NULL OR tracking_url ~ '^https?://'),
  CONSTRAINT ads_rejection_rule   CHECK (
    review_status <> 'rejected' OR rejection_reason IS NOT NULL
  )
);

CREATE INDEX ads_group_idx          ON public.ads (group_id);
CREATE INDEX ads_campaign_idx       ON public.ads (campaign_id);
CREATE INDEX ads_account_idx        ON public.ads (account_id);
CREATE INDEX ads_review_status_idx  ON public.ads (review_status);
CREATE INDEX ads_active_partial     ON public.ads (group_id)
  WHERE is_active = true AND review_status = 'approved';

CREATE TRIGGER ads_set_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 6. ad_placements  (where an ad is allowed to show)
-------------------------------------------------------------------------------
CREATE TABLE public.ad_placements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id        UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  position     public.ad_slot_position NOT NULL,
  page_path    TEXT,
  category_id  UUID,
  priority     INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_placements_priority_nn CHECK (priority >= 0)
);

CREATE INDEX ad_placements_ad_idx        ON public.ad_placements (ad_id);
CREATE INDEX ad_placements_position_idx  ON public.ad_placements (position, is_active);
CREATE INDEX ad_placements_page_idx      ON public.ad_placements (page_path);
CREATE INDEX ad_placements_category_idx  ON public.ad_placements (category_id);

-------------------------------------------------------------------------------
-- 7. ad_impressions  (append-only; high-volume write path)
-------------------------------------------------------------------------------
CREATE TABLE public.ad_impressions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id         UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  placement_id  UUID REFERENCES public.ad_placements(id) ON DELETE SET NULL,
  session_id    TEXT,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash       TEXT,
  user_agent    TEXT,
  referer       TEXT,
  country       TEXT,
  city          TEXT,
  device_type   TEXT,
  cost_amount   NUMERIC(12, 6) NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_impressions_cost_nn CHECK (cost_amount >= 0)
);

CREATE INDEX ad_impressions_ad_created ON public.ad_impressions (ad_id, created_at DESC);
CREATE INDEX ad_impressions_created    ON public.ad_impressions (created_at DESC);
CREATE INDEX ad_impressions_session    ON public.ad_impressions (session_id);

-------------------------------------------------------------------------------
-- 8. ad_clicks
-------------------------------------------------------------------------------
CREATE TABLE public.ad_clicks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id          UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  impression_id  UUID REFERENCES public.ad_impressions(id) ON DELETE SET NULL,
  placement_id   UUID REFERENCES public.ad_placements(id) ON DELETE SET NULL,
  session_id     TEXT,
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash        TEXT,
  user_agent     TEXT,
  referer        TEXT,
  country        TEXT,
  city           TEXT,
  device_type    TEXT,
  cost_amount    NUMERIC(12, 6) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_clicks_cost_nn CHECK (cost_amount >= 0)
);

CREATE INDEX ad_clicks_ad_created       ON public.ad_clicks (ad_id, created_at DESC);
CREATE INDEX ad_clicks_impression_idx   ON public.ad_clicks (impression_id);
CREATE INDEX ad_clicks_session          ON public.ad_clicks (session_id);

-------------------------------------------------------------------------------
-- 9. ad_conversions
-------------------------------------------------------------------------------
CREATE TABLE public.ad_conversions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id             UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  click_id          UUID REFERENCES public.ad_clicks(id) ON DELETE SET NULL,
  session_id        TEXT,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  conversion_type   TEXT NOT NULL,
  conversion_value  NUMERIC(14, 2),
  currency          TEXT NOT NULL DEFAULT 'USD',
  metadata_json     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_conversions_value_nn    CHECK (conversion_value IS NULL OR conversion_value >= 0),
  CONSTRAINT ad_conversions_currency_fmt CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX ad_conversions_ad_created ON public.ad_conversions (ad_id, created_at DESC);
CREATE INDEX ad_conversions_click_idx  ON public.ad_conversions (click_id);

-------------------------------------------------------------------------------
-- 10. ad_daily_stats  (rolled-up per-ad/per-day aggregates)
-------------------------------------------------------------------------------
CREATE TABLE public.ad_daily_stats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id           UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  campaign_id     UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  stat_date       DATE NOT NULL,
  impressions     INTEGER NOT NULL DEFAULT 0,
  clicks          INTEGER NOT NULL DEFAULT 0,
  conversions     INTEGER NOT NULL DEFAULT 0,
  spend_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,
  revenue_amount  NUMERIC(12, 2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_daily_stats_counts_nn CHECK (
    impressions >= 0 AND clicks >= 0 AND conversions >= 0
    AND spend_amount >= 0 AND revenue_amount >= 0
  )
);

CREATE UNIQUE INDEX ad_daily_stats_unique ON public.ad_daily_stats (ad_id, stat_date);
CREATE INDEX ad_daily_stats_campaign_date ON public.ad_daily_stats (campaign_id, stat_date DESC);
CREATE INDEX ad_daily_stats_account_date  ON public.ad_daily_stats (account_id, stat_date DESC);

CREATE TRIGGER ad_daily_stats_set_updated_at
BEFORE UPDATE ON public.ad_daily_stats
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 11. ad_payments  (top-ups into credit_balance)
-------------------------------------------------------------------------------
CREATE TABLE public.ad_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id        UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  amount            NUMERIC(12, 2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  payment_status    public.ad_payment_status NOT NULL DEFAULT 'pending',
  payment_provider  TEXT,
  payment_reference TEXT,
  failure_reason    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at      TIMESTAMPTZ,
  CONSTRAINT ad_payments_amount_pos    CHECK (amount > 0),
  CONSTRAINT ad_payments_currency_fmt  CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX ad_payments_account_idx ON public.ad_payments (account_id, created_at DESC);
CREATE INDEX ad_payments_status_idx  ON public.ad_payments (payment_status);

-------------------------------------------------------------------------------
-- 12. ad_invoices
-------------------------------------------------------------------------------
CREATE TABLE public.ad_invoices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id       UUID NOT NULL REFERENCES public.ad_accounts(id) ON DELETE CASCADE,
  invoice_number   TEXT NOT NULL,
  period_start     DATE NOT NULL,
  period_end       DATE NOT NULL,
  subtotal         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount       NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total            NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency         TEXT NOT NULL DEFAULT 'USD',
  invoice_status   public.ad_invoice_status NOT NULL DEFAULT 'draft',
  pdf_url          TEXT,
  issued_at        TIMESTAMPTZ,
  due_at           TIMESTAMPTZ,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ad_invoices_period_order  CHECK (period_end >= period_start),
  CONSTRAINT ad_invoices_amounts_nn    CHECK (subtotal >= 0 AND tax_amount >= 0 AND total >= 0),
  CONSTRAINT ad_invoices_currency_fmt  CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE UNIQUE INDEX ad_invoices_number_unique ON public.ad_invoices (invoice_number);
CREATE INDEX ad_invoices_account_idx          ON public.ad_invoices (account_id, created_at DESC);
CREATE INDEX ad_invoices_status_idx           ON public.ad_invoices (invoice_status);

CREATE TRIGGER ad_invoices_set_updated_at
BEFORE UPDATE ON public.ad_invoices
FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-------------------------------------------------------------------------------
-- 13. RLS — enable
-------------------------------------------------------------------------------
ALTER TABLE public.ad_accounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_placements    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_conversions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_daily_stats   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_invoices      ENABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 14. Policies — ad_accounts  (private to owner; admin sees all)
-------------------------------------------------------------------------------
CREATE POLICY ad_accounts_select ON public.ad_accounts
  FOR SELECT USING (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY ad_accounts_insert_self ON public.ad_accounts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY ad_accounts_update_self_or_admin ON public.ad_accounts
  FOR UPDATE USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

CREATE POLICY ad_accounts_delete_admin ON public.ad_accounts
  FOR DELETE USING (public.is_admin());

-------------------------------------------------------------------------------
-- 15. Policies — ad_campaigns / ad_groups / ads
-- Visibility + writes tied to parent account ownership.
-------------------------------------------------------------------------------
CREATE POLICY ad_campaigns_select ON public.ad_campaigns
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

CREATE POLICY ad_campaigns_write ON public.ad_campaigns
  FOR ALL USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

CREATE POLICY ad_groups_select ON public.ad_groups
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ad_campaigns c
      JOIN public.ad_accounts a ON a.id = c.account_id
      WHERE c.id = campaign_id AND a.owner_id = auth.uid()
    )
  );

CREATE POLICY ad_groups_write ON public.ad_groups
  FOR ALL USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ad_campaigns c
      JOIN public.ad_accounts a ON a.id = c.account_id
      WHERE c.id = campaign_id AND a.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ad_campaigns c
      JOIN public.ad_accounts a ON a.id = c.account_id
      WHERE c.id = campaign_id AND a.owner_id = auth.uid()
    )
  );

CREATE POLICY ads_select ON public.ads
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

CREATE POLICY ads_write ON public.ads
  FOR ALL USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

-------------------------------------------------------------------------------
-- 16. Policies — ad_placements  (owner reads/writes, admin sees all)
-------------------------------------------------------------------------------
CREATE POLICY ad_placements_select ON public.ad_placements
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ads ad
      JOIN public.ad_accounts a ON a.id = ad.account_id
      WHERE ad.id = ad_id AND a.owner_id = auth.uid()
    )
  );

CREATE POLICY ad_placements_write ON public.ad_placements
  FOR ALL USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ads ad
      JOIN public.ad_accounts a ON a.id = ad.account_id
      WHERE ad.id = ad_id AND a.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ads ad
      JOIN public.ad_accounts a ON a.id = ad.account_id
      WHERE ad.id = ad_id AND a.owner_id = auth.uid()
    )
  );

-------------------------------------------------------------------------------
-- 17. Policies — ad_impressions / ad_clicks / ad_conversions
-- Reads allowed to ad owner + admin. Writes admin-only at RLS level
-- (ingestion happens via edge functions running with service role).
-------------------------------------------------------------------------------
CREATE POLICY ad_impressions_select ON public.ad_impressions
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ads ad
      JOIN public.ad_accounts a ON a.id = ad.account_id
      WHERE ad.id = ad_id AND a.owner_id = auth.uid()
    )
  );

CREATE POLICY ad_impressions_write_admin ON public.ad_impressions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY ad_clicks_select ON public.ad_clicks
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ads ad
      JOIN public.ad_accounts a ON a.id = ad.account_id
      WHERE ad.id = ad_id AND a.owner_id = auth.uid()
    )
  );

CREATE POLICY ad_clicks_write_admin ON public.ad_clicks
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY ad_conversions_select ON public.ad_conversions
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.ads ad
      JOIN public.ad_accounts a ON a.id = ad.account_id
      WHERE ad.id = ad_id AND a.owner_id = auth.uid()
    )
  );

CREATE POLICY ad_conversions_write_admin ON public.ad_conversions
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 18. Policies — ad_daily_stats  (read: owner + admin; writes admin-only)
-------------------------------------------------------------------------------
CREATE POLICY ad_daily_stats_select ON public.ad_daily_stats
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

CREATE POLICY ad_daily_stats_write_admin ON public.ad_daily_stats
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-------------------------------------------------------------------------------
-- 19. Policies — ad_payments / ad_invoices
-------------------------------------------------------------------------------
CREATE POLICY ad_payments_select ON public.ad_payments
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

CREATE POLICY ad_payments_insert_owner ON public.ad_payments
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

CREATE POLICY ad_payments_update_admin ON public.ad_payments
  FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY ad_payments_delete_admin ON public.ad_payments
  FOR DELETE USING (public.is_admin());

CREATE POLICY ad_invoices_select ON public.ad_invoices
  FOR SELECT USING (
    public.is_admin()
    OR EXISTS (SELECT 1 FROM public.ad_accounts a WHERE a.id = account_id AND a.owner_id = auth.uid())
  );

CREATE POLICY ad_invoices_write_admin ON public.ad_invoices
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
