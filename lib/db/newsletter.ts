import { createServerInsForge } from '@/lib/insforge/server';

export type NewsletterSubscriber = {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  language: string;
  confirmed_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
};

export type NewsletterCampaign = {
  id: string;
  name: string;
  subject: string;
  content_html: string | null;
  status: string;
  sent_at: string | null;
  scheduled_at: string | null;
  recipients_count: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export async function getSubscribers(limit = 100, offset = 0): Promise<NewsletterSubscriber[]> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('newsletter_subscribers')
    .select('id, email, full_name, status, language, confirmed_at, unsubscribed_at, created_at')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw new Error(error.message);
  return (data ?? []) as NewsletterSubscriber[];
}

export async function getSubscriberStats(): Promise<{
  total: number;
  confirmed: number;
  pending: number;
  unsubscribed: number;
}> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('newsletter_subscribers')
    .select('status');
  if (error) throw new Error(error.message);

  const stats = { total: 0, confirmed: 0, pending: 0, unsubscribed: 0 };
  for (const row of data ?? []) {
    stats.total++;
    const status = row.status as string;
    if (status === 'confirmed') stats.confirmed++;
    else if (status === 'pending') stats.pending++;
    else if (status === 'unsubscribed') stats.unsubscribed++;
  }
  return stats;
}

export async function addSubscriber(
  email: string,
  fullName?: string,
  language = 'en',
): Promise<NewsletterSubscriber | null> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('newsletter_subscribers')
    .insert({
      email,
      full_name: fullName || null,
      status: 'pending',
      language,
      confirmed_at: null,
    })
    .select()
    .single();
  if (error) {
    if (error.code === '23505' || error.message?.includes('duplicate')) return null;
    throw new Error(error.message);
  }
  return data as NewsletterSubscriber;
}

export async function updateSubscriberStatus(
  subscriberId: string,
  status: 'confirmed' | 'unsubscribed' | 'bounced' | 'complained',
): Promise<boolean> {
  const insforge = createServerInsForge();
  const updates: Record<string, unknown> = { status };
  if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
  if (status === 'unsubscribed') updates.unsubscribed_at = new Date().toISOString();

  const { error } = await insforge.database
    .from('newsletter_subscribers')
    .update(updates)
    .eq('id', subscriberId);
  if (error) throw new Error(error.message);
  return true;
}

export async function getCampaigns(limit = 50): Promise<NewsletterCampaign[]> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('newsletter_campaigns')
    .select(
      'id, name, subject, content_html, status, sent_at, scheduled_at, recipients_count, sent_count, open_count, click_count, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as NewsletterCampaign[];
}

export async function getCampaign(id: string): Promise<NewsletterCampaign | null> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('newsletter_campaigns')
    .select(
      'id, name, subject, content_html, status, sent_at, scheduled_at, recipients_count, sent_count, open_count, click_count, created_at, updated_at',
    )
    .eq('id', id)
    .single();
  if (error) return null;
  return data as NewsletterCampaign;
}

export async function createCampaign(
  name: string,
  subject: string,
  contentHtml: string,
): Promise<NewsletterCampaign | null> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.database
    .from('newsletter_campaigns')
    .insert({
      name,
      subject,
      content_html: contentHtml,
      status: 'draft',
      recipients_count: 0,
      sent_count: 0,
      open_count: 0,
      click_count: 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as NewsletterCampaign;
}

export async function updateCampaign(
  id: string,
  updates: Partial<{
    name: string;
    subject: string;
    content_html: string;
    status: string;
    scheduled_at: string;
  }>,
): Promise<boolean> {
  const insforge = createServerInsForge();
  const { error } = await insforge.database
    .from('newsletter_campaigns')
    .update(updates)
    .eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function sendCampaign(id: string): Promise<boolean> {
  const insforge = createServerInsForge();

  const { data: subscribers, error: subError } = await insforge.database
    .from('newsletter_subscribers')
    .select('id, email, full_name, language')
    .eq('status', 'confirmed');
  if (subError) throw new Error(subError.message);

  const recipientCount = subscribers?.length ?? 0;

  const { error: campError } = await insforge.database
    .from('newsletter_campaigns')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      recipients_count: recipientCount,
      sent_count: recipientCount,
    })
    .eq('id', id);
  if (campError) throw new Error(campError.message);

  return true;
}
