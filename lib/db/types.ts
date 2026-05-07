export type UserRole = 'reader' | 'author' | 'editor' | 'admin';

export type OrgRole = 'owner' | 'admin' | 'member';

export type CategoryKind =
  | 'news'
  | 'directory'
  | 'jobs'
  | 'marketplace'
  | 'events'
  | 'real_estate'
  | 'classifieds';

export type Profile = {
  id: string;
  display_name: string;
  username: string | null;
  role: UserRole;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  organization_id: string;
  user_id: string;
  role: OrgRole;
  joined_at: string;
};

export type Category = {
  id: string;
  kind: CategoryKind;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Tag = {
  id: string;
  slug: string;
  name: string;
  color: string | null;
  created_at: string;
};

export type MediaAsset = {
  id: string;
  uploader_id: string | null;
  bucket: string;
  object_key: string;
  url: string;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: string;
};

export type Page = {
  id: string;
  title: string;
  slug: string;
  meta_title: string | null;
  meta_description: string | null;
  content_html: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AuditLogEntry = {
  id: string;
  actor_id: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  diff: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type UserPlan = 'free' | 'premium' | 'vip' | 'enterprise';

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired'
  | 'paused';

export type SubscriptionInterval = 'day' | 'week' | 'month' | 'quarter' | 'year';

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  plan_tier: UserPlan;
  price: string;
  currency: string;
  interval: SubscriptionInterval;
  interval_count: number;
  trial_days: number;
  features_json: Record<string, unknown>;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  started_at: string;
  trial_end_at: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  ended_at: string | null;
  payment_provider: string | null;
  provider_subscription_id: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PaymentTransaction = {
  id: string;
  user_id: string | null;
  subscription_id: string | null;
  ad_payment_id: string | null;
  event_order_id: string | null;
  booking_id: string | null;
  kind: string;
  amount: string;
  currency: string;
  payment_status: string;
  provider: string | null;
  provider_reference: string | null;
  description: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  processed_at: string | null;
};

export type AdCampaignStatus =
  | 'draft'
  | 'pending_review'
  | 'active'
  | 'paused'
  | 'completed'
  | 'rejected'
  | 'archived';

export type AdObjective =
  | 'awareness'
  | 'traffic'
  | 'conversions'
  | 'leads'
  | 'app_installs'
  | 'engagement';

export type AdBillingModel = 'cpm' | 'cpc' | 'cpa' | 'flat_rate';

export type AdCreativeFormat =
  | 'banner'
  | 'native'
  | 'video'
  | 'sponsored_post'
  | 'popup'
  | 'sticky_footer';

export type AdReviewStatus = 'pending' | 'approved' | 'rejected';

export type AdSlotPosition =
  | 'header'
  | 'sidebar'
  | 'in_feed'
  | 'between_articles'
  | 'sticky_footer'
  | 'article_top'
  | 'article_bottom'
  | 'homepage_hero'
  | 'category_top'
  | 'search_results';

export type AdPaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export type AdInvoiceStatus = 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';

export type AdAccount = {
  id: string;
  owner_id: string;
  business_name: string;
  business_email: string;
  business_phone: string | null;
  tax_id: string | null;
  billing_address: string | null;
  billing_city: string | null;
  billing_country: string | null;
  billing_postal_code: string | null;
  currency: string;
  credit_balance: string;
  total_spent: string;
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
};

export type AdCampaign = {
  id: string;
  account_id: string;
  name: string;
  objective: AdObjective;
  billing_model: AdBillingModel;
  bid_amount: string;
  daily_budget: string | null;
  total_budget: string | null;
  spent_amount: string;
  currency: string;
  start_at: string;
  end_at: string | null;
  targeting_json: Record<string, unknown>;
  status: AdCampaignStatus;
  created_at: string;
  updated_at: string;
};

export type AdGroup = {
  id: string;
  campaign_id: string;
  name: string;
  bid_amount: string | null;
  targeting_json: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdCreative = {
  id: string;
  group_id: string;
  campaign_id: string;
  account_id: string;
  name: string;
  creative_format: AdCreativeFormat;
  headline: string | null;
  body_text: string | null;
  call_to_action: string | null;
  image_url: string | null;
  video_url: string | null;
  destination_url: string;
  tracking_url: string | null;
  is_active: boolean;
  review_status: AdReviewStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type AdPlacement = {
  id: string;
  ad_id: string;
  position: AdSlotPosition;
  page_path: string | null;
  category_id: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
};

export type AdDailyStat = {
  id: string;
  ad_id: string;
  campaign_id: string;
  account_id: string;
  stat_date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend_amount: string;
  revenue_amount: string;
  created_at: string;
  updated_at: string;
};

export type AdPayment = {
  id: string;
  account_id: string;
  amount: string;
  currency: string;
  payment_status: AdPaymentStatus;
  payment_provider: string | null;
  payment_reference: string | null;
  failure_reason: string | null;
  created_at: string;
  processed_at: string | null;
};

export type AdInvoice = {
  id: string;
  account_id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  subtotal: string;
  tax_amount: string;
  total: string;
  currency: string;
  invoice_status: AdInvoiceStatus;
  pdf_url: string | null;
  issued_at: string | null;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};
