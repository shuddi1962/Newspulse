import { createClient } from '@insforge/sdk'

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL!
const anonKey = process.env.INSFORGE_SERVICE_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!

const insforge = createClient({
  baseUrl,
  anonKey,
  isServerMode: true,
})

function mapRow(row: Record<string, unknown>): Article {
  return {
    id: row.id as string,
    slug: (row.slug as string) || '',
    headline: (row.title_rewritten as string) || (row.title as string),
    original_title: row.title as string,
    content: (row.content_html_rewritten as string) || (row.content_html as string) || '',
    excerpt: (row.excerpt as string) || '',
    image_url: (row.featured_image as string) || null,
    image_alt: (row.image_alt as string) || '',
    category: (row.category as string) || '',
    region: (row.region as string) || 'world',
    source_name: (row.source_domain as string) || '',
    source_url: (row.original_url as string) || '',
    tags: (row.tags as string[]) || [],
    is_breaking: !!(row.is_breaking as boolean),
    is_featured: !!(row.is_featured as boolean),
    status: (row.status as string) || 'published',
    views: (row.view_count as number) || 0,
    published_at: (row.published_at as string) || (row.created_at as string),
    created_at: (row.created_at as string),
  }
}

function toRow(article: Partial<Article>): Record<string, unknown> {
  return {
    slug: article.slug,
    title: article.original_title,
    title_rewritten: article.headline,
    content_html_rewritten: article.content,
    content_html: article.content,
    excerpt: article.excerpt,
    featured_image: article.image_url,
    image_alt: article.image_alt,
    category: article.category,
    region: article.region,
    source_domain: article.source_name,
    original_url: article.source_url,
    tags: article.tags,
    is_breaking: article.is_breaking,
    is_featured: article.is_featured,
    status: article.status,
    published_at: article.published_at,
  }
}

export interface Article {
  id: string
  slug: string
  headline: string
  original_title: string
  content: string
  excerpt: string
  image_url: string | null
  image_alt: string
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
    list: async (p: {
      category?: string; region?: string; status?: string
      limit?: number; offset?: number; breaking?: boolean
      search?: string; featured?: boolean
    } = {}): Promise<ListResponse<Article>> => {
      let query = insforge.database
        .from('news_articles')
        .select('*', { count: 'exact' })

      if (p.status) query = query.eq('status', p.status)
      if (p.category) query = query.eq('category', p.category)
      if (p.region) query = query.eq('region', p.region)
      if (p.breaking !== undefined) query = query.eq('is_breaking', p.breaking)
      if (p.featured !== undefined) query = query.eq('is_featured', p.featured)
      if (p.search) query = query.ilike('title', `%${p.search}%`)

      query = query.order('published_at', { ascending: false })

      if (p.limit) query = query.limit(p.limit)
      if (p.offset) query = query.range(p.offset, p.offset + (p.limit || 20) - 1)

      const { data, error, count } = await query

      if (error) throw new Error(error.message || 'Failed to list articles')
      return {
        data: ((data as Record<string, unknown>[]) || []).map(mapRow),
        total: count ?? 0,
      }
    },

    get: async (slug: string): Promise<Article> => {
      const { data, error } = await insforge.database
        .from('news_articles')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .maybeSingle()

      if (error || !data) throw new Error(error?.message || 'Article not found')
      return mapRow(data as Record<string, unknown>)
    },

    create: async (data: Partial<Article>): Promise<Article> => {
      const row = toRow(data)
      const { data: inserted, error } = await insforge.database
        .from('news_articles')
        .insert(row)
        .select()
        .single()

      if (error || !inserted) throw new Error(error?.message || 'Failed to create article')
      return mapRow(inserted as Record<string, unknown>)
    },

    update: async (id: string, data: Partial<Article>): Promise<Article> => {
      const row = toRow(data)
      const { data: updated, error } = await insforge.database
        .from('news_articles')
        .update(row)
        .eq('id', id)
        .select()
        .single()

      if (error || !updated) throw new Error(error?.message || 'Failed to update article')
      return mapRow(updated as Record<string, unknown>)
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await insforge.database
        .from('news_articles')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message || 'Failed to delete article')
    },

    addView: async (id: string): Promise<void> => {
      const { data, error: readError } = await insforge.database
        .from('news_articles')
        .select('view_count')
        .eq('id', id)
        .maybeSingle()

      if (readError || !data) return

      const current = (data as { view_count?: number }).view_count || 0
      const { error } = await insforge.database
        .from('news_articles')
        .update({ view_count: current + 1 })
        .eq('id', id)

      if (error) throw new Error(error.message || 'Failed to add view')
    },
  },

  queue: {
    exists: async (url: string): Promise<boolean> => {
      const { data, error } = await insforge.database
        .from('rss_queue')
        .select('id')
        .eq('source_url', url)
        .maybeSingle()

      if (error) return false
      return !!data
    },

    add: async (url: string): Promise<void> => {
      const { error } = await insforge.database
        .from('rss_queue')
        .insert({ source_url: url })

      if (error && !error.message?.includes('duplicate')) {
        throw new Error(error.message || 'Failed to add to queue')
      }
    },
  },

  categories: {
    list: async (): Promise<Category[]> => {
      const { data, error } = await insforge.database
        .from('categories')
        .select('id, name, slug, color, icon')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw new Error(error.message || 'Failed to load categories')

      const cats = (data as Array<{ id: string; name: string; slug: string; color: string | null; icon: string | null }>) || []

      const { data: counts } = await insforge.database
        .from('news_articles')
        .select('category')

      const countMap: Record<string, number> = {}
      if (counts) {
        for (const row of counts as Array<{ category: string }>) {
          if (row.category) {
            countMap[row.category] = (countMap[row.category] || 0) + 1
          }
        }
      }

      const slugToName: Record<string, string> = {}
      for (const c of cats) {
        slugToName[c.name.toLowerCase()] = c.name
      }

      return cats.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        color: c.color || '#6b7280',
        icon: c.icon || '📰',
        article_count: countMap[c.name] || 0,
      }))
    },

    upsert: async (name: string, slug: string, color: string, icon: string): Promise<Category> => {
      const { data: existing } = await insforge.database
        .from('categories')
        .select('id')
        .eq('name', name)
        .maybeSingle()

      if (existing) {
        return { id: existing.id as string, name, slug, color, icon, article_count: 0 }
      }

      const { data: inserted, error } = await insforge.database
        .from('categories')
        .insert({
          name,
          slug,
          color,
          icon,
          kind: 'news',
          is_active: true,
          sort_order: 0,
          language: 'en',
          seo_title: null,
          seo_description: null,
        })
        .select('id')
        .single()

      if (error) throw new Error(error.message || 'Failed to upsert category')
      return { id: (inserted as { id: string }).id, name, slug, color, icon, article_count: 0 }
    },

    incrementCount: async (_slug: string): Promise<void> => {
      // article counts are computed dynamically from news_articles
    },
  },

  subscribers: {
    list: async (p: { limit?: number; offset?: number } = {}): Promise<ListResponse<Subscriber>> => {
      let query = insforge.database
        .from('subscribers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (p.limit) query = query.limit(p.limit)
      if (p.offset) query = query.range(p.offset, p.offset + (p.limit || 20) - 1)

      const { data, error, count } = await query

      if (error) throw new Error(error.message || 'Failed to list subscribers')
      return {
        data: (data as Subscriber[]) || [],
        total: count ?? 0,
      }
    },

    add: async (email: string, name?: string): Promise<void> => {
      const { error } = await insforge.database
        .from('subscribers')
        .insert({ email, name: name || '' })

      if (error && !error.message?.includes('unique')) {
        throw new Error(error.message || 'Failed to add subscriber')
      }
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await insforge.database
        .from('subscribers')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message || 'Failed to delete subscriber')
    },
  },

  ads: {
    listActive: async (zone?: string): Promise<Ad[]> => {
      let query = insforge.database
        .from('ads')
        .select('*')
        .eq('is_active', true)

      if (zone) {
        query = query.contains('creative_format', zone)
      }

      const { data, error } = await query

      if (error) throw new Error(error.message || 'Failed to list ads')
      return ((data as Record<string, unknown>[]) || []).map(r => ({
        id: r.id as string,
        name: (r.name as string) || '',
        zone: zone || '',
        image_url: (r.image_url as string) || '',
        link_url: (r.destination_url as string) || '',
        is_active: !!(r.is_active as boolean),
        impressions: 0,
        clicks: 0,
      }))
    },

    create: async (data: Partial<Ad>): Promise<Ad> => {
      const { error } = await insforge.database
        .from('ads')
        .insert({
          name: data.name,
          image_url: data.image_url,
          destination_url: data.link_url,
          is_active: data.is_active,
        })

      if (error) throw new Error(error.message || 'Failed to create ad')
      return data as Ad
    },

    update: async (id: string, data: Partial<Ad>): Promise<Ad> => {
      const { error } = await insforge.database
        .from('ads')
        .update({
          name: data.name,
          image_url: data.image_url,
          destination_url: data.link_url,
          is_active: data.is_active,
        })
        .eq('id', id)

      if (error) throw new Error(error.message || 'Failed to update ad')
      return data as Ad
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await insforge.database
        .from('ads')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message || 'Failed to delete ad')
    },
  },

  stats: {
    overview: async (): Promise<DashboardStats> => {
      const two = await Promise.all([
        insforge.database.from('news_articles').select('*', { count: 'exact', head: true }),
        insforge.database.from('news_articles').select('*', { count: 'exact', head: true })
          .gte('published_at', new Date(Date.now() - 86400000).toISOString()),
        insforge.database.from('news_articles').select('view_count'),
        insforge.database.from('subscribers').select('*', { count: 'exact', head: true }),
        insforge.database.from('news_articles').select('*', { count: 'exact', head: true }).eq('is_breaking', true),
        insforge.database.from('categories').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ])

      const viewsRows = (two[2].data as Array<{ view_count: number }>) || []

      return {
        total_articles: two[0].count ?? 0,
        today_articles: two[1].count ?? 0,
        total_views: viewsRows.reduce((s, r) => s + (r.view_count || 0), 0),
        total_subscribers: two[3].count ?? 0,
        breaking_count: two[4].count ?? 0,
        categories_count: two[5].count ?? 0,
      }
    },

    monthly: async (): Promise<Array<{ month: string; articles: number; views: number }>> => {
      const { data } = await insforge.database
        .from('news_articles')
        .select('published_at, view_count')
        .gte('published_at', new Date(Date.now() - 365 * 86400000).toISOString())

      const monthly: Record<string, { articles: number; views: number }> = {}
      const rows = (data as Array<{ published_at: string; view_count: number }>) || []

      for (const row of rows) {
        if (!row.published_at) continue
        const m = row.published_at.slice(0, 7)
        if (!monthly[m]) monthly[m] = { articles: 0, views: 0 }
        monthly[m].articles++
        monthly[m].views += row.view_count || 0
      }

      return Object.entries(monthly)
        .map(([month, vals]) => ({ month, ...vals }))
        .sort((a, b) => a.month.localeCompare(b.month))
    },
  },
}
