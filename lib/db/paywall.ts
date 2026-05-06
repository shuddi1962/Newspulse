import 'server-only';
import { getCurrentUser } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';
import type { Subscription } from '@/lib/db/types';

export type PaywallResult = {
  isPremium: boolean;
  hasAccess: boolean;
  userSubscription: Subscription | null;
  user: { id: string; email: string; name?: string | null } | null;
};

export async function checkPaywall(articleIsPremium: boolean): Promise<PaywallResult> {
  if (!articleIsPremium) {
    return { isPremium: false, hasAccess: true, userSubscription: null, user: null };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { isPremium: true, hasAccess: false, userSubscription: null, user: null };
  }

  if (user.role === 'admin' || user.role === 'editor' || user.role === 'author') {
    return { isPremium: true, hasAccess: true, userSubscription: null, user: { id: user.id, email: user.email, name: user.name } };
  }

  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('subscriptions')
    .select(
      'id, user_id, plan_id, status, started_at, trial_end_at, current_period_start, current_period_end, cancel_at_period_end, cancelled_at, ended_at, payment_provider, provider_subscription_id, metadata_json, created_at, updated_at',
    )
    .eq('user_id', user.id)
    .in('status', ['trialing', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return { isPremium: true, hasAccess: false, userSubscription: null, user: { id: user.id, email: user.email, name: user.name } };
  }

  return { isPremium: true, hasAccess: true, userSubscription: data as Subscription, user: { id: user.id, email: user.email, name: user.name } };
}
