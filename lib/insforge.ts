// lib/insforge.ts
const BASE = process.env.INSFORGE_API_URL!
const KEY  = process.env.INSFORGE_API_KEY!

const h = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${KEY}`,
  'x-api-key': KEY,
}

async function api<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { ...h, ...(opts.headers || {}) },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`InsForge ${path} ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

export interface Article {
  id: string
  slug: string
  headline: string
  original_title: string
  content: string
  excerpt: string
  image_url: string | null
  image_alt: string | null
  category: string
  region: string
  source_name: string
  source_url: string
  tags: string[]
  is_breaking: boolean
  is_featured: boolean
  status: string
  views: number
  published_at: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  color: string
  icon: string
  article_count: number
}

export interface Subscriber {
  id: string
  email: string
  name: string
  status: string
  created_at: string
}

export interface Ad {
  id: string
  name: string
  zone: string
  image_url: string
  link_url: string
  is_active: boolean
  impressions: number
  clicks: number
}

export interface DashboardStats {
  total_articles: number
  today_articles: number
  total_views: number
  total_subscribers: number
  breaking_count: number
  categories_count: number
}

export interface ListResponse<T> {
  data: T[]
  total: number
}

export const db = {
  articles: {
    list: (p: {
      category?: string; region?: string; status?: string
      limit?: number; offset?: number; breaking?: boolean
      search?: string; featured?: boolean
    } = {}): Promise<ListResponse<Article>> => {
      const q = new URLSearchParams()
      if (p.category) q.set('category', p.category)
      if (p.region) q.set('region', p.region)
      if (p.status) q.set('status', p.status)
      if (p.limit)  q.set('limit', String(p.limit))
      if (p.offset) q.set('offset', String(p.offset))
      if (p.breaking !== undefined) q.set('is_breaking', String(p.breaking))
      if (p.search) q.set('search', p.search)
      if (p.featured !== undefined) q.set('is_featured', String(p.featured))
      q.set('order_by', 'published_at DESC')
      return api(`/articles?${q}`)
    },

    get: (slug: string): Promise<Article> =>
      api(`/articles/${slug}`),

    create: (data: Partial<Article>): Promise<Article> =>
      api('/articles', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<Article>): Promise<Article> =>
      api(`/articles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (id: string): Promise<void> =>
      api(`/articles/${id}`, { method: 'DELETE' }),

    addView: (id: string): Promise<void> =>
      api(`/articles/${id}/views`, { method: 'POST' }),
  },

  queue: {
    exists: async (url: string): Promise<boolean> => {
      try {
        const q = new URLSearchParams({ source_url: url })
        const r = await api<{ exists: boolean }>(`/rss-queue/check?${q}`)
        return r.exists
      } catch { return false }
    },
    add: (url: string): Promise<void> =>
      api('/rss-queue', { method: 'POST', body: JSON.stringify({ source_url: url }) }),
  },

  categories: {
    list: (): Promise<Category[]> =>
      api('/categories'),

    upsert: (name: string, slug: string, color: string, icon: string): Promise<Category> =>
      api('/categories/upsert', {
        method: 'POST',
        body: JSON.stringify({ name, slug, color, icon }),
      }),

    incrementCount: (slug: string): Promise<void> =>
      api(`/categories/${slug}/increment`, { method: 'POST' }),
  },

  subscribers: {
    list: (p: { limit?: number; offset?: number } = {}): Promise<ListResponse<Subscriber>> => {
      const q = new URLSearchParams()
      if (p.limit) q.set('limit', String(p.limit))
      if (p.offset) q.set('offset', String(p.offset))
      return api(`/subscribers?${q}`)
    },
    add: (email: string, name?: string): Promise<void> =>
      api('/subscribers', { method: 'POST', body: JSON.stringify({ email, name }) }),
    delete: (id: string): Promise<void> =>
      api(`/subscribers/${id}`, { method: 'DELETE' }),
  },

  ads: {
    listActive: (zone?: string): Promise<Ad[]> => {
      const q = zone ? `?zone=${zone}&is_active=true` : '?is_active=true'
      return api(`/ads${q}`)
    },
    create: (data: Partial<Ad>): Promise<Ad> =>
      api('/ads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Ad>): Promise<Ad> =>
      api(`/ads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string): Promise<void> =>
      api(`/ads/${id}`, { method: 'DELETE' }),
  },

  stats: {
    overview: (): Promise<DashboardStats> =>
      api('/stats/overview'),
    monthly: (): Promise<Array<{ month: string; articles: number; views: number }>> =>
      api('/stats/monthly'),
  },
}
