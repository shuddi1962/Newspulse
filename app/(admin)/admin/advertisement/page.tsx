import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { createServerInsForge } from '@/lib/insforge/server';
import { AdManager } from './ad-manager';

export const metadata: Metadata = {
  title: 'Advertisement Manager — Admin',
  description: 'Manage ad placements, formats, and performance.',
};

async function getOverview() {
  const insforge = createServerInsForge();
  const today = new Date().toISOString().split('T')[0];

  const [{ data: campaigns }, { count: todayImpressions }, { count: todayClicks }, { data: placements }] = await Promise.all([
    insforge.database.from('ad_campaigns').select('id, status, name, spent_amount'),
    insforge.database.from('ad_impressions').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00Z`),
    insforge.database.from('ad_clicks').select('id', { count: 'exact', head: true }).gte('created_at', `${today}T00:00:00Z`),
    insforge.database.from('ad_placements').select('id, ad_id, position, page_path, is_active, created_at'),
  ]);

  const totalRevenue = (campaigns ?? []).reduce((sum, c) => sum + parseFloat((c as Record<string, unknown>).spent_amount as string ?? '0'), 0);
  const activeCampaigns = (campaigns ?? []).filter((c: Record<string, unknown>) => c.status === 'active').length;

  return {
    totalCampaigns: (campaigns ?? []).length,
    activeCampaigns,
    todayImpressions: todayImpressions ?? 0,
    todayClicks: todayClicks ?? 0,
    totalRevenue: totalRevenue.toFixed(2),
    placementsCount: (placements ?? []).length,
  };
}

async function getPlacementsWithStats() {
  const insforge = createServerInsForge();
  const { data: placements } = await insforge.database
    .from('ad_placements')
    .select('id, ad_id, position, page_path, priority, is_active, created_at')
    .order('created_at', { ascending: false });

  const { data: ads } = await insforge.database
    .from('ads')
    .select('id, name, creative_format, is_active, review_status, account_id')
    .order('created_at', { ascending: false });

  const adMap = new Map((ads ?? []).map((a: Record<string, unknown>) => [a.id as string, a]));

  const rows = (placements ?? []).map((p: Record<string, unknown>) => {
    const ad = adMap.get(p.ad_id as string);
    return {
      id: p.id as string,
      adId: p.ad_id as string,
      name: (ad?.name as string) ?? 'Unknown',
      format: (ad?.creative_format as string) ?? 'unknown',
      position: p.position as string,
      isActive: p.is_active as boolean ?? true,
      reviewStatus: (ad?.review_status as string) ?? 'pending',
      createdAt: (p.created_at as string) ?? '',
    };
  });
  return rows;
}

export default async function AdminAdvertisementPage() {
  await requireAdmin();
  const [overview, placements] = await Promise.all([getOverview(), getPlacementsWithStats()]);
  return <AdManager overview={overview} placements={placements} />;
}
