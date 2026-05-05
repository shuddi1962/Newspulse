import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type {
  AdAccount,
  AdCampaign,
  AdGroup,
  AdCreative,
  AdPlacement,
  AdDailyStat,
  AdPayment,
  AdInvoice,
} from '@/lib/db/types';

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

const ACCOUNT_COLUMNS =
  'id, owner_id, business_name, business_email, business_phone, tax_id, billing_address, billing_city, billing_country, billing_postal_code, currency, credit_balance, total_spent, is_verified, is_suspended, created_at, updated_at';

const CAMPAIGN_COLUMNS =
  'id, account_id, name, objective, billing_model, bid_amount, daily_budget, total_budget, spent_amount, currency, start_at, end_at, targeting_json, status, created_at, updated_at';

const GROUP_COLUMNS =
  'id, campaign_id, name, bid_amount, targeting_json, is_active, created_at, updated_at';

const CREATIVE_COLUMNS =
  'id, group_id, campaign_id, account_id, name, creative_format, headline, body_text, call_to_action, image_url, video_url, destination_url, tracking_url, is_active, review_status, rejection_reason, created_at, updated_at';

const PLACEMENT_COLUMNS =
  'id, ad_id, position, page_path, category_id, priority, is_active, created_at';

const DAILY_STAT_COLUMNS =
  'id, ad_id, campaign_id, account_id, stat_date, impressions, clicks, conversions, spend_amount, revenue_amount, created_at, updated_at';

const PAYMENT_COLUMNS =
  'id, account_id, amount, currency, payment_status, payment_provider, payment_reference, failure_reason, created_at, processed_at';

const INVOICE_COLUMNS =
  'id, account_id, invoice_number, period_start, period_end, subtotal, tax_amount, total, currency, invoice_status, pdf_url, issued_at, due_at, paid_at, created_at, updated_at';

/* ------------------------------------------------------------------ */
/*  Ad Accounts                                                       */
/* ------------------------------------------------------------------ */

export async function getAdAccountByOwnerId(
  ownerId: string,
): Promise<Result<AdAccount | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_accounts')
    .select(ACCOUNT_COLUMNS)
    .eq('owner_id', ownerId)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load ad account.' };
  return { status: 'ok', data: (data as AdAccount | null) ?? null };
}

export async function getAdAccountById(
  id: string,
  accessToken: string,
): Promise<Result<AdAccount | null>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_accounts')
    .select(ACCOUNT_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load ad account.' };
  return { status: 'ok', data: (data as AdAccount | null) ?? null };
}

export async function createAdAccount(params: {
  accessToken: string;
  ownerId: string;
  businessName: string;
  businessEmail: string;
  businessPhone?: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  billingPostalCode?: string;
  currency?: string;
}): Promise<Result<AdAccount>> {
  const {
    accessToken,
    ownerId,
    businessName,
    businessEmail,
    businessPhone,
    billingAddress,
    billingCity,
    billingCountry,
    billingPostalCode,
    currency = 'USD',
  } = params;

  const existing = await getAdAccountByOwnerId(ownerId);
  if (existing.status === 'ok' && existing.data) {
    return { status: 'error', message: 'An ad account already exists for this user.' };
  }

  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_accounts')
    .insert({
      owner_id: ownerId,
      business_name: businessName,
      business_email: businessEmail,
      business_phone: businessPhone ?? null,
      billing_address: billingAddress ?? null,
      billing_city: billingCity ?? null,
      billing_country: billingCountry ?? null,
      billing_postal_code: billingPostalCode ?? null,
      currency,
    })
    .select(ACCOUNT_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to create ad account.' };
  return { status: 'ok', data: data as AdAccount };
}

export async function updateAdAccount(
  id: string,
  updates: Partial<Pick<AdAccount, 'business_name' | 'business_email' | 'business_phone' | 'tax_id' | 'billing_address' | 'billing_city' | 'billing_country' | 'billing_postal_code' | 'currency'>>,
  accessToken: string,
): Promise<Result<AdAccount>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_accounts')
    .update(updates)
    .eq('id', id)
    .select(ACCOUNT_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to update ad account.' };
  return { status: 'ok', data: data as AdAccount };
}

/* ------------------------------------------------------------------ */
/*  Ad Campaigns                                                      */
/* ------------------------------------------------------------------ */

export async function listCampaignsByAccount(
  accountId: string,
): Promise<Result<AdCampaign[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_campaigns')
    .select(CAMPAIGN_COLUMNS)
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });
  if (error) return { status: 'error', message: error.message ?? 'Could not load campaigns.' };
  return { status: 'ok', data: (data ?? []) as AdCampaign[] };
}

export async function getCampaignById(
  id: string,
): Promise<Result<AdCampaign | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_campaigns')
    .select(CAMPAIGN_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load campaign.' };
  return { status: 'ok', data: (data as AdCampaign | null) ?? null };
}

export async function createCampaign(params: {
  accessToken: string;
  accountId: string;
  name: string;
  objective: string;
  billingModel: string;
  bidAmount: number;
  dailyBudget?: number;
  totalBudget?: number;
  startAt?: string;
  endAt?: string;
  targetingJson?: Record<string, unknown>;
}): Promise<Result<AdCampaign>> {
  const {
    accessToken,
    accountId,
    name,
    objective,
    billingModel,
    bidAmount,
    dailyBudget,
    totalBudget,
    startAt,
    endAt,
    targetingJson = {},
  } = params;

  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_campaigns')
    .insert({
      account_id: accountId,
      name,
      objective,
      billing_model: billingModel,
      bid_amount: bidAmount,
      daily_budget: dailyBudget ?? null,
      total_budget: totalBudget ?? null,
      start_at: startAt ?? new Date().toISOString(),
      end_at: endAt ?? null,
      targeting_json: targetingJson,
    })
    .select(CAMPAIGN_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to create campaign.' };
  return { status: 'ok', data: data as AdCampaign };
}

export async function updateCampaign(
  id: string,
  updates: Partial<Pick<AdCampaign, 'name' | 'objective' | 'billing_model' | 'bid_amount' | 'daily_budget' | 'total_budget' | 'end_at' | 'targeting_json' | 'status'>>,
  accessToken: string,
): Promise<Result<AdCampaign>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_campaigns')
    .update(updates)
    .eq('id', id)
    .select(CAMPAIGN_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to update campaign.' };
  return { status: 'ok', data: data as AdCampaign };
}

/* ------------------------------------------------------------------ */
/*  Ad Groups                                                         */
/* ------------------------------------------------------------------ */

export async function listGroupsByCampaign(
  campaignId: string,
): Promise<Result<AdGroup[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_groups')
    .select(GROUP_COLUMNS)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  if (error) return { status: 'error', message: error.message ?? 'Could not load ad groups.' };
  return { status: 'ok', data: (data ?? []) as AdGroup[] };
}

export async function createAdGroup(params: {
  accessToken: string;
  campaignId: string;
  name: string;
  bidAmount?: number;
  targetingJson?: Record<string, unknown>;
}): Promise<Result<AdGroup>> {
  const { accessToken, campaignId, name, bidAmount, targetingJson = {} } = params;

  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_groups')
    .insert({
      campaign_id: campaignId,
      name,
      bid_amount: bidAmount ?? null,
      targeting_json: targetingJson,
    })
    .select(GROUP_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to create ad group.' };
  return { status: 'ok', data: data as AdGroup };
}

export async function updateAdGroup(
  id: string,
  updates: Partial<Pick<AdGroup, 'name' | 'bid_amount' | 'targeting_json' | 'is_active'>>,
  accessToken: string,
): Promise<Result<AdGroup>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_groups')
    .update(updates)
    .eq('id', id)
    .select(GROUP_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to update ad group.' };
  return { status: 'ok', data: data as AdGroup };
}

/* ------------------------------------------------------------------ */
/*  Ad Creatives                                                      */
/* ------------------------------------------------------------------ */

export async function listCreativesByCampaign(
  campaignId: string,
): Promise<Result<AdCreative[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ads')
    .select(CREATIVE_COLUMNS)
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false });
  if (error) return { status: 'error', message: error.message ?? 'Could not load creatives.' };
  return { status: 'ok', data: (data ?? []) as AdCreative[] };
}

export async function listCreativesByGroup(
  groupId: string,
): Promise<Result<AdCreative[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ads')
    .select(CREATIVE_COLUMNS)
    .eq('group_id', groupId)
    .order('created_at', { ascending: false });
  if (error) return { status: 'error', message: error.message ?? 'Could not load creatives.' };
  return { status: 'ok', data: (data ?? []) as AdCreative[] };
}

export async function createAdCreative(params: {
  accessToken: string;
  groupId: string;
  campaignId: string;
  accountId: string;
  name: string;
  creativeFormat: string;
  destinationUrl: string;
  headline?: string;
  bodyText?: string;
  callToAction?: string;
  imageUrl?: string;
  videoUrl?: string;
  trackingUrl?: string;
}): Promise<Result<AdCreative>> {
  const {
    accessToken,
    groupId,
    campaignId,
    accountId,
    name,
    creativeFormat,
    destinationUrl,
    headline,
    bodyText,
    callToAction,
    imageUrl,
    videoUrl,
    trackingUrl,
  } = params;

  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ads')
    .insert({
      group_id: groupId,
      campaign_id: campaignId,
      account_id: accountId,
      name,
      creative_format: creativeFormat,
      destination_url: destinationUrl,
      headline: headline ?? null,
      body_text: bodyText ?? null,
      call_to_action: callToAction ?? null,
      image_url: imageUrl ?? null,
      video_url: videoUrl ?? null,
      tracking_url: trackingUrl ?? null,
    })
    .select(CREATIVE_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to create ad creative.' };
  return { status: 'ok', data: data as AdCreative };
}

export async function updateAdCreative(
  id: string,
  updates: Partial<Pick<AdCreative, 'name' | 'creative_format' | 'headline' | 'body_text' | 'call_to_action' | 'image_url' | 'video_url' | 'destination_url' | 'tracking_url' | 'is_active'>>,
  accessToken: string,
): Promise<Result<AdCreative>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ads')
    .update(updates)
    .eq('id', id)
    .select(CREATIVE_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to update ad creative.' };
  return { status: 'ok', data: data as AdCreative };
}

/* ------------------------------------------------------------------ */
/*  Ad Placements                                                     */
/* ------------------------------------------------------------------ */

export async function listPlacementsByAd(
  adId: string,
): Promise<Result<AdPlacement[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_placements')
    .select(PLACEMENT_COLUMNS)
    .eq('ad_id', adId)
    .order('priority', { ascending: false });
  if (error) return { status: 'error', message: error.message ?? 'Could not load placements.' };
  return { status: 'ok', data: (data ?? []) as AdPlacement[] };
}

export async function createAdPlacement(params: {
  accessToken: string;
  adId: string;
  position: string;
  pagePath?: string;
  categoryId?: string;
  priority?: number;
}): Promise<Result<AdPlacement>> {
  const { accessToken, adId, position, pagePath, categoryId, priority = 0 } = params;

  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_placements')
    .insert({
      ad_id: adId,
      position,
      page_path: pagePath ?? null,
      category_id: categoryId ?? null,
      priority,
    })
    .select(PLACEMENT_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to create placement.' };
  return { status: 'ok', data: data as AdPlacement };
}

/* ------------------------------------------------------------------ */
/*  Daily Stats                                                       */
/* ------------------------------------------------------------------ */

export async function listDailyStatsByCampaign(
  campaignId: string,
  limit = 30,
): Promise<Result<AdDailyStat[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_daily_stats')
    .select(DAILY_STAT_COLUMNS)
    .eq('campaign_id', campaignId)
    .order('stat_date', { ascending: false })
    .limit(limit);
  if (error) return { status: 'error', message: error.message ?? 'Could not load daily stats.' };
  return { status: 'ok', data: (data ?? []) as AdDailyStat[] };
}

export async function getCampaignSummary(
  campaignId: string,
): Promise<Result<{
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalSpend: string;
  ctr: number;
}>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_daily_stats')
    .select('impressions, clicks, conversions, spend_amount')
    .eq('campaign_id', campaignId);

  if (error) return { status: 'error', message: error.message ?? 'Could not load campaign summary.' };

  const rows = (data ?? []) as Array<{
    impressions: number;
    clicks: number;
    conversions: number;
    spend_amount: string;
  }>;

  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;
  let totalSpend = 0;

  for (const row of rows) {
    totalImpressions += row.impressions ?? 0;
    totalClicks += row.clicks ?? 0;
    totalConversions += row.conversions ?? 0;
    totalSpend += parseFloat(row.spend_amount ?? '0');
  }

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return {
    status: 'ok',
    data: {
      totalImpressions,
      totalClicks,
      totalConversions,
      totalSpend: totalSpend.toFixed(2),
      ctr: parseFloat(ctr.toFixed(2)),
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Payments                                                          */
/* ------------------------------------------------------------------ */

export async function listPaymentsByAccount(
  accountId: string,
): Promise<Result<AdPayment[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_payments')
    .select(PAYMENT_COLUMNS)
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });
  if (error) return { status: 'error', message: error.message ?? 'Could not load payments.' };
  return { status: 'ok', data: (data ?? []) as AdPayment[] };
}

export async function createAdPayment(params: {
  accessToken: string;
  accountId: string;
  amount: number;
  currency?: string;
}): Promise<Result<AdPayment>> {
  const { accessToken, accountId, amount, currency = 'USD' } = params;

  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('ad_payments')
    .insert({
      account_id: accountId,
      amount,
      currency,
    })
    .select(PAYMENT_COLUMNS)
    .single();

  if (error) return { status: 'error', message: error.message ?? 'Failed to create payment.' };
  return { status: 'ok', data: data as AdPayment };
}

/* ------------------------------------------------------------------ */
/*  Invoices                                                          */
/* ------------------------------------------------------------------ */

export async function listInvoicesByAccount(
  accountId: string,
): Promise<Result<AdInvoice[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ad_invoices')
    .select(INVOICE_COLUMNS)
    .eq('account_id', accountId)
    .order('created_at', { ascending: false });
  if (error) return { status: 'error', message: error.message ?? 'Could not load invoices.' };
  return { status: 'ok', data: (data ?? []) as AdInvoice[] };
}
