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
