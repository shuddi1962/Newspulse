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

export async function getCreativeById(
  id: string,
): Promise<Result<AdCreative | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('ads')
    .select(CREATIVE_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error) return { status: 'error', message: error.message ?? 'Could not load creative.' };
  return { status: 'ok', data: (data as AdCreative | null) ?? null };
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

/* ------------------------------------------------------------------ */
/*  Ad Serving Engine                                                  */
/* ------------------------------------------------------------------ */

export type ServedAd = {
  id: string;
  name: string;
  creative_format: string;
  headline: string | null;
  body_text: string | null;
  call_to_action: string | null;
  image_url: string | null;
  video_url: string | null;
  destination_url: string;
  campaign_id: string;
  account_id: string;
  billing_model: string;
  bid_amount: string;
  cost_per_impression: number;
};

const FREQUENCY_CAP_DEFAULT = 10;

export async function selectAdForPlacement(params: {
  position: string;
  pagePath?: string;
  categoryId?: string;
  sessionId?: string;
  userId?: string;
}): Promise<Result<ServedAd | null>> {
  const { position, pagePath, categoryId, sessionId, userId } = params;

  const insforge = createServerInsForge();

  const { data: placements, error: placementError } = await insforge.database
    .from('ad_placements')
    .select('ad_id, position, page_path, category_id, priority, is_active')
    .eq('position', position)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (placementError) {
    return { status: 'error', message: placementError.message ?? 'Could not load placements.' };
  }

  if (!placements || placements.length === 0) {
    return { status: 'ok', data: null };
  }

  const filteredPlacements = placements.filter((p: Record<string, unknown>) => {
    const placementPagePath = p.page_path as string | null;
    const placementCategoryId = p.category_id as string | null;

    if (placementPagePath && pagePath && !pagePath.startsWith(placementPagePath)) {
      return false;
    }

    if (placementCategoryId && categoryId && placementCategoryId !== categoryId) {
      return false;
    }

    return true;
  });

  if (filteredPlacements.length === 0) {
    return { status: 'ok', data: null };
  }

  const adIds = filteredPlacements.map((p: Record<string, unknown>) => p.ad_id as string);

  const { data: creatives, error: creativeError } = await insforge.database
    .from('ads')
    .select('id, name, creative_format, headline, body_text, call_to_action, image_url, video_url, destination_url, campaign_id, account_id, is_active, review_status')
    .in('id', adIds)
    .eq('is_active', true)
    .eq('review_status', 'approved');

  if (creativeError) {
    return { status: 'error', message: creativeError.message ?? 'Could not load creatives.' };
  }

  if (!creatives || creatives.length === 0) {
    return { status: 'ok', data: null };
  }

  const campaignIds = [...new Set(creatives.map((c: Record<string, unknown>) => c.campaign_id as string))];

  const { data: campaigns, error: campaignError } = await insforge.database
    .from('ad_campaigns')
    .select('id, account_id, status, billing_model, bid_amount, daily_budget, total_budget, spent_amount, start_at, end_at')
    .in('id', campaignIds);

  if (campaignError) {
    return { status: 'error', message: campaignError.message ?? 'Could not load campaigns.' };
  }

  const now = new Date();
  const activeCampaigns = (campaigns ?? []).filter((c: Record<string, unknown>) => {
    if (c.status !== 'active') return false;

    const startAt = new Date(c.start_at as string);
    const endAt = c.end_at ? new Date(c.end_at as string) : null;

    if (startAt > now) return false;
    if (endAt && endAt < now) return false;

    const totalBudget = parseFloat(c.total_budget as string ?? '0');
    const spentAmount = parseFloat(c.spent_amount as string ?? '0');
    if (totalBudget > 0 && spentAmount >= totalBudget) return false;

    return true;
  });

  const activeCampaignIds = new Set(activeCampaigns.map((c: Record<string, unknown>) => c.id as string));

  const eligibleCreatives = creatives.filter((c: Record<string, unknown>) =>
    activeCampaignIds.has(c.campaign_id as string)
  );

  if (eligibleCreatives.length === 0) {
    return { status: 'ok', data: null };
  }

  if (userId || sessionId) {
    const creativeIdsToCheck = eligibleCreatives.map((c: Record<string, unknown>) => c.id as string);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();

    const { data: impressions, error: impressionError } = await insforge.database
      .from('ad_impressions')
      .select('ad_id')
      .in('ad_id', creativeIdsToCheck)
      .gte('created_at', todayStart);

    if (!impressionError && impressions) {
      const impressionCounts = new Map<string, number>();
      for (const imp of impressions) {
        const adId = imp.ad_id as string;
        impressionCounts.set(adId, (impressionCounts.get(adId) ?? 0) + 1);
      }

      const cappedCreatives = eligibleCreatives.filter((c: Record<string, unknown>) => {
        const adId = c.id as string;
        const count = impressionCounts.get(adId) ?? 0;
        return count < FREQUENCY_CAP_DEFAULT;
      });

      if (cappedCreatives.length > 0) {
        eligibleCreatives.length = 0;
        eligibleCreatives.push(...cappedCreatives);
      }
    }
  }

  if (eligibleCreatives.length === 0) {
    return { status: 'ok', data: null };
  }

  const campaignMap = new Map(
    activeCampaigns.map((c: Record<string, unknown>) => [c.id as string, c])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.toISOString();

  const impressionCounts = new Map<string, number>();
  const clickCounts = new Map<string, number>();

  for (const c of eligibleCreatives) {
    const adId = c.id as string;
    const { count: todayImpressions } = await insforge.database
      .from('ad_impressions')
      .select('id', { count: 'exact', head: true })
      .eq('ad_id', adId)
      .gte('created_at', todayStart);

    const { count: todayClicks } = await insforge.database
      .from('ad_clicks')
      .select('id', { count: 'exact', head: true })
      .eq('ad_id', adId)
      .gte('created_at', todayStart);

    impressionCounts.set(adId, todayImpressions ?? 0);
    clickCounts.set(adId, todayClicks ?? 0);
  }

  type WeightedCreative = {
    creative: Record<string, unknown>;
    weight: number;
  };

  const weightedCreatives: WeightedCreative[] = eligibleCreatives.map((c) => {
    const campaign = campaignMap.get(c.campaign_id as string);
    const bidAmount = parseFloat((campaign?.bid_amount as string) ?? '0');
    const priorityPlacement = filteredPlacements.find(
      (p: Record<string, unknown>) => p.ad_id === c.id
    );
    const priority = parseFloat((priorityPlacement?.priority as string) ?? '0');

    let weight = bidAmount * 100 + priority;

    const impCount = impressionCounts.get(c.id as string) ?? 0;
    const clickCount = clickCounts.get(c.id as string) ?? 0;

    if (impCount > 0) {
      const ctr = clickCount / impCount;
      weight *= 1 + ctr;
    }

    return { creative: c, weight: Math.max(weight, 1) };
  });

  if (weightedCreatives.length === 0) {
    return { status: 'ok', data: null };
  }

  const totalWeight = weightedCreatives.reduce((sum, wc) => sum + wc.weight, 0);
  let random = Math.random() * totalWeight;

  let selectedCreative = weightedCreatives[0]!.creative;
  for (const wc of weightedCreatives) {
    random -= wc.weight;
    if (random <= 0) {
      selectedCreative = wc.creative;
      break;
    }
  }

  const selectedCampaign = campaignMap.get(selectedCreative.campaign_id as string);

  const billingModel = (selectedCampaign?.billing_model as string) ?? 'cpm';
  const bidAmount = parseFloat((selectedCampaign?.bid_amount as string) ?? '0');

  let costPerImpression = 0;
  switch (billingModel) {
    case 'cpm':
      costPerImpression = bidAmount / 1000;
      break;
    case 'cpc':
      costPerImpression = bidAmount * 0.01;
      break;
    case 'cpa':
      costPerImpression = bidAmount * 0.005;
      break;
    case 'flat_rate':
      costPerImpression = bidAmount / 30000;
      break;
  }

  return {
    status: 'ok',
    data: {
      id: selectedCreative.id as string,
      name: selectedCreative.name as string,
      creative_format: selectedCreative.creative_format as string,
      headline: (selectedCreative.headline as string) ?? null,
      body_text: (selectedCreative.body_text as string) ?? null,
      call_to_action: (selectedCreative.call_to_action as string) ?? null,
      image_url: (selectedCreative.image_url as string) ?? null,
      video_url: (selectedCreative.video_url as string) ?? null,
      destination_url: selectedCreative.destination_url as string,
      campaign_id: selectedCreative.campaign_id as string,
      account_id: selectedCreative.account_id as string,
      billing_model: billingModel,
      bid_amount: (selectedCampaign?.bid_amount as string) ?? '0',
      cost_per_impression: costPerImpression,
    },
  };
}

export async function recordImpression(params: {
  adId: string;
  sessionId?: string;
  userId?: string;
  ipHash?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  costAmount: number;
}): Promise<Result<void>> {
  const { adId, sessionId, userId, ipHash, userAgent, referer, country, city, deviceType, costAmount } = params;

  const insforge = createServerInsForge();

  const { error } = await insforge.database
    .from('ad_impressions')
    .insert({
      ad_id: adId,
      session_id: sessionId ?? null,
      user_id: userId ?? null,
      ip_hash: ipHash ?? null,
      user_agent: userAgent ?? null,
      referer: referer ?? null,
      country: country ?? null,
      city: city ?? null,
      device_type: deviceType ?? null,
      cost_amount: costAmount,
    });

  if (error) {
    return { status: 'error', message: error.message ?? 'Failed to record impression.' };
  }

  return { status: 'ok', data: undefined };
}

export async function recordClick(params: {
  adId: string;
  impressionId?: string;
  sessionId?: string;
  userId?: string;
  ipHash?: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  city?: string;
  deviceType?: string;
  costAmount: number;
}): Promise<Result<void>> {
  const { adId, impressionId, sessionId, userId, ipHash, userAgent, referer, country, city, deviceType, costAmount } = params;

  const insforge = createServerInsForge();

  const { error } = await insforge.database
    .from('ad_clicks')
    .insert({
      ad_id: adId,
      impression_id: impressionId ?? null,
      session_id: sessionId ?? null,
      user_id: userId ?? null,
      ip_hash: ipHash ?? null,
      user_agent: userAgent ?? null,
      referer: referer ?? null,
      country: country ?? null,
      city: city ?? null,
      device_type: deviceType ?? null,
      cost_amount: costAmount,
    });

  if (error) {
    return { status: 'error', message: error.message ?? 'Failed to record click.' };
  }

  return { status: 'ok', data: undefined };
}

export async function checkFrequencyCap(params: {
  adId: string;
  userId?: string;
  sessionId?: string;
  limit?: number;
}): Promise<Result<boolean>> {
  const { adId, userId, sessionId, limit = FREQUENCY_CAP_DEFAULT } = params;

  const insforge = createServerInsForge();

  let query = insforge.database
    .from('ad_impressions')
    .select('id', { count: 'exact', head: true })
    .eq('ad_id', adId);

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { count, error } = await query;

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not check frequency cap.' };
  }

  return { status: 'ok', data: (count ?? 0) < limit };
}

export async function updateDailyStats(params: {
  adId: string;
  campaignId: string;
  accountId: string;
  date?: string;
}): Promise<Result<void>> {
  const { adId, campaignId, accountId, date } = params;
  const statDate = date ?? new Date().toISOString().split('T')[0];

  const insforge = createServerInsForge();

  const { count: impressions, error: impError } = await insforge.database
    .from('ad_impressions')
    .select('id', { count: 'exact', head: true })
    .eq('ad_id', adId)
    .gte('created_at', `${statDate}T00:00:00Z`)
    .lt('created_at', `${statDate}T23:59:59Z`);

  if (impError) {
    return { status: 'error', message: impError.message ?? 'Could not count impressions.' };
  }

  const { count: clicks, error: clickError } = await insforge.database
    .from('ad_clicks')
    .select('id', { count: 'exact', head: true })
    .eq('ad_id', adId)
    .gte('created_at', `${statDate}T00:00:00Z`)
    .lt('created_at', `${statDate}T23:59:59Z`);

  if (clickError) {
    return { status: 'error', message: clickError.message ?? 'Could not count clicks.' };
  }

  const { data: existing, error: existingError } = await insforge.database
    .from('ad_daily_stats')
    .select('id')
    .eq('ad_id', adId)
    .eq('stat_date', statDate)
    .maybeSingle();

  if (existingError) {
    return { status: 'error', message: existingError.message ?? 'Could not check existing stats.' };
  }

  const spendAmount = (impressions ?? 0) * 0.001;

  if (existing) {
    const { error: updateError } = await insforge.database
      .from('ad_daily_stats')
      .update({
        impressions: impressions ?? 0,
        clicks: clicks ?? 0,
        spend_amount: spendAmount.toFixed(2),
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (updateError) {
      return { status: 'error', message: updateError.message ?? 'Failed to update daily stats.' };
    }
  } else {
    const { error: insertError } = await insforge.database
      .from('ad_daily_stats')
      .insert({
        ad_id: adId,
        campaign_id: campaignId,
        account_id: accountId,
        stat_date: statDate,
        impressions: impressions ?? 0,
        clicks: clicks ?? 0,
        spend_amount: spendAmount.toFixed(2),
      });

    if (insertError) {
      return { status: 'error', message: insertError.message ?? 'Failed to insert daily stats.' };
    }
  }

  return { status: 'ok', data: undefined };
}

export async function getActiveAdsCount(): Promise<Result<number>> {
  const insforge = createServerInsForge();

  const { data, error } = await insforge.database
    .from('ad_campaigns')
    .select('id')
    .eq('status', 'active')
    .lte('start_at', new Date().toISOString())
    .or('end_at.is.null,end_at.gte.' + new Date().toISOString());

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not count active ads.' };
  }

  return { status: 'ok', data: (data ?? []).length };
}

export async function getAdOptimizationSuggestions(
  accountId: string,
): Promise<Result<Array<{ adId: string; name: string; suggestion: string; priority: 'high' | 'medium' | 'low' }>>> {
  const insforge = createServerInsForge();

  const { data: creatives, error } = await insforge.database
    .from('ads')
    .select('id, name, account_id, campaign_id, impressions_count, clicks_count, is_active, review_status')
    .eq('account_id', accountId)
    .eq('review_status', 'approved')
    .eq('is_active', true);

  if (error) return { status: 'error', message: error.message ?? 'Could not load ads.' };

  const suggestions: Array<{ adId: string; name: string; suggestion: string; priority: 'high' | 'medium' | 'low' }> = [];

  for (const ad of creatives ?? []) {
    const impressions = (ad as Record<string, unknown>).impressions_count as number ?? 0;
    const clicks = (ad as Record<string, unknown>).clicks_count as number ?? 0;
    const ctr = impressions > 0 ? clicks / impressions : 0;

    if (impressions > 1000 && ctr < 0.005) {
      suggestions.push({
        adId: ad.id,
        name: ad.name,
        suggestion: 'CTR is below 0.5% after 1,000+ impressions. Consider refreshing the creative or adjusting targeting.',
        priority: 'high',
      });
    }

    if (impressions > 5000 && ctr < 0.002) {
      suggestions.push({
        adId: ad.id,
        name: ad.name,
        suggestion: 'Very low CTR (under 0.2%) after significant exposure. Recommend pausing and testing new creative.',
        priority: 'high',
      });
    }

    if (impressions > 0 && ctr > 0.03) {
      suggestions.push({
        adId: ad.id,
        name: ad.name,
        suggestion: `Strong CTR of ${(ctr * 100).toFixed(1)}%. Consider increasing budget to scale this winner.`,
        priority: 'medium',
      });
    }

    if (impressions === 0) {
      suggestions.push({
        adId: ad.id,
        name: ad.name,
        suggestion: 'Ad has zero impressions. Check targeting settings and bid competitiveness.',
        priority: 'medium',
      });
    }
  }

  return { status: 'ok', data: suggestions };
}
