import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';
import type { SubscriptionPlan, Subscription } from '@/lib/db/types';

type Result<T> =
  | { status: 'ok'; data: T }
  | { status: 'error'; message: string };

const PLAN_COLUMNS =
  'id, code, name, description, plan_tier, price, currency, interval, interval_count, trial_days, features_json, is_active, display_order, created_at, updated_at';

export async function listActivePlans(): Promise<Result<SubscriptionPlan[]>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('subscription_plans')
    .select(PLAN_COLUMNS)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('price', { ascending: true });
  if (error)
    return { status: 'error', message: error.message ?? 'Could not load subscription plans.' };
  return { status: 'ok', data: (data ?? []) as SubscriptionPlan[] };
}

export async function getPlanById(id: string): Promise<Result<SubscriptionPlan | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('subscription_plans')
    .select(PLAN_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error)
    return { status: 'error', message: error.message ?? 'Could not load plan.' };
  return { status: 'ok', data: (data as SubscriptionPlan | null) ?? null };
}

export async function getPlanByCode(code: string): Promise<Result<SubscriptionPlan | null>> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('subscription_plans')
    .select(PLAN_COLUMNS)
    .eq('code', code)
    .maybeSingle();
  if (error)
    return { status: 'error', message: error.message ?? 'Could not load plan.' };
  return { status: 'ok', data: (data as SubscriptionPlan | null) ?? null };
}

export async function getUserSubscription(
  userId: string,
  accessToken: string,
): Promise<Result<Subscription | null>> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.database
    .from('subscriptions')
    .select('id, user_id, plan_id, status, started_at, trial_end_at, current_period_start, current_period_end, cancel_at_period_end, cancelled_at, ended_at, payment_provider, provider_subscription_id, metadata_json, created_at, updated_at')
    .eq('user_id', userId)
    .in('status', ['trialing', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error)
    return { status: 'error', message: error.message ?? 'Could not load subscription.' };
  return { status: 'ok', data: (data as Subscription | null) ?? null };
}

export async function createSubscriptionRecord(params: {
  accessToken: string;
  userId: string;
  planId: string;
  paymentProvider?: string;
  providerSubscriptionId?: string;
  trialDays?: number;
}): Promise<Result<Subscription>> {
  const { accessToken, userId, planId, paymentProvider, providerSubscriptionId, trialDays = 0 } = params;
  const insforge = createServerInsForge(accessToken);

  const planRes = await getPlanById(planId);
  if (planRes.status === 'error') return planRes;
  if (!planRes.data) return { status: 'error', message: 'Plan not found.' };

  const plan = planRes.data;
  const now = new Date();
  const startedAt = now.toISOString();
  const trialEndAt = trialDays > 0
    ? new Date(now.getTime() + trialDays * 86_400_000).toISOString()
    : null;
  const periodStart = trialDays > 0 ? trialEndAt! : startedAt;
  const intervalMs = getIntervalMilliseconds(plan.interval, plan.interval_count);
  const periodEnd = new Date(new Date(periodStart).getTime() + intervalMs).toISOString();
  const status: Subscription['status'] = trialDays > 0 ? 'trialing' : 'active';

  const { data, error } = await insforge.database
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      status,
      started_at: startedAt,
      trial_end_at: trialEndAt,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: false,
      payment_provider: paymentProvider ?? null,
      provider_subscription_id: providerSubscriptionId ?? null,
      metadata_json: {},
    })
    .select('id, user_id, plan_id, status, started_at, trial_end_at, current_period_start, current_period_end, cancel_at_period_end, cancelled_at, ended_at, payment_provider, provider_subscription_id, metadata_json, created_at, updated_at')
    .single();

  if (error)
    return { status: 'error', message: error.message ?? 'Failed to create subscription.' };
  return { status: 'ok', data: data as Subscription };
}

function getIntervalMilliseconds(interval: string, count: number): number {
  const msPerDay = 86_400_000;
  switch (interval) {
    case 'day':
      return msPerDay * count;
    case 'week':
      return msPerDay * 7 * count;
    case 'month':
      return msPerDay * 30 * count;
    case 'quarter':
      return msPerDay * 91 * count;
    case 'year':
      return msPerDay * 365 * count;
    default:
      return msPerDay * 30 * count;
  }
}
