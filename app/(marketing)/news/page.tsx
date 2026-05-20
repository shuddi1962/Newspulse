'use client'
import { useState, useEffect, Suspense } from 'react'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { SkeletonGrid } from '@/components/ui/SkeletonCard'
import { timeAgo } from '@/components/ui/TimeAgo'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const REGION_TABS = [
  { value: '', label: 'All' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'africa', label: 'Africa' },
  { value: 'world', label: 'World' },
  { value: 'americas', label: 'Americas' },
  { value: 'europe', label: 'Europe' },
  { value: 'middleeast', label: 'Middle East' },
  { value: 'asia', label: 'Asia' },
]

const TOPIC_TABS = [
  { value: 'Business', label: 'Business' },
  { value: 'Technology', label: 'Tech' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Politics', label: 'Politics' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Health', label: 'Health' },
  { value: 'Science', label: 'Science' },
]

const FB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=400&fit=crop&q=80'

function articleHref(a: any) {
  const p = new URLSearchParams({ url: a.link, title: a.title, source: a.source, image: a.image || '', desc: a.description || '' })
  return `/article?${p.toString()}`
}

function NewsContent() {
  const searchParams = useSearchParams()
  const [region, setRegion] = useState(searchParams.get('region') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [query, setQuery] = useState('')
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchedAt, setFetchedAt] = useState('')

  async function load() {
    setLoading(true)
    try {
      const p = new URLSearchParams({ limit: '60' })
      if (region) p.set('region', region)
      if (category) p.set('category', category)
      if (query) p.set('q', query)
      const res = await fetch(`/api/news?${p}`)
      const data = await res.json()
      setArticles(data.articles || [])
      setFetchedAt(data.fetchedAt || '')
    } catch { setArticles([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [region, category])

  const activeLabel = region
    ? REGION_TABS.find(t => t.value === region)?.label
    : category || 'All News'

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>

      <div style={{ background: '#0f1419', padding: '28px 32px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#e63946' }}>Live Global Feed</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-fraunces, Georgia, serif)', lineHeight: 1.2 }}>
            {activeLabel}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
            Real-time news from 80+ sources worldwide · Updates every 10 min
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {fetchedAt && (
            <span style={{ fontSize: '10px', color: '#6b7280' }}>Updated {timeAgo(fetchedAt)}</span>
          )}
          <button
            onClick={load}
            style={{ background: '#e63946', color: '#fff', border: 'none', padding: '10px 18px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <form onSubmit={e => { e.preventDefault(); load() }} style={{ display: 'flex', gap: '0', marginBottom: '24px', maxWidth: '560px' }}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search headlines, topics, sources..."
          style={{ flex: 1, padding: '11px 16px', border: '1px solid #e5e7eb', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}
        />
        <button type="submit" style={{ padding: '11px 20px', background: '#0f1419', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer' }}>
          Search
        </button>
      </form>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: '8px' }}>
          Region
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
          {REGION_TABS.map(t => (
            <button key={t.value} onClick={() => { setRegion(t.value); setCategory('') }}
              style={{
                padding: '7px 14px', border: '1px solid',
                borderColor: region === t.value && !category ? '#0f1419' : '#e5e7eb',
                background: region === t.value && !category ? '#0f1419' : '#fff',
                color: region === t.value && !category ? '#fff' : '#6b7280',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-instrument, Arial, sans-serif)',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', marginBottom: '8px' }}>
          Topic
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {TOPIC_TABS.map(t => (
            <button key={t.value} onClick={() => { setCategory(prev => prev === t.value ? '' : t.value); setRegion('') }}
              style={{
                padding: '7px 14px', border: '1px solid',
                borderColor: category === t.value ? '#e63946' : '#e5e7eb',
                background: category === t.value ? '#e63946' : '#fff',
                color: category === t.value ? '#fff' : '#6b7280',
                fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                fontFamily: 'var(--font-instrument, Arial, sans-serif)',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {!loading && (
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
          Showing <strong style={{ color: '#0f1419' }}>{articles.length}</strong> articles
          {(region || category) && (
            <button
              onClick={() => { setRegion(''); setCategory(''); }}
              style={{ marginLeft: '12px', fontSize: '11px', color: '#e63946', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '14px', textAlign: 'center', marginBottom: '28px' }}>
        <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Advertisement · 728 × 90</span>
      </div>

      {loading && <SkeletonGrid count={16} />}

      {!loading && articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📰</div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#0f1419', marginBottom: '8px' }}>No articles found</p>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>Try a different region or topic filter</p>
        </div>
      )}

      {!loading && articles.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {articles.map(a => (
            <Link key={a.id} href={articleHref(a)} className="news-card block group" style={{ textDecoration: 'none' }}>
              <div className="img-zoom" style={{ marginBottom: '10px' }}>
                <img
                  src={a.image || FB}
                  alt={a.title}
                  style={{ width: '100%', height: '170px', objectFit: 'cover', display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = FB }}
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <CategoryBadge category={a.category} />
                {a.region && a.region !== 'global' && (
                  <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', background: '#0f1419', color: '#fff', display: 'inline-block' }}>
                    {a.region === 'middleeast' ? 'Mid East' : a.region}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.4, color: '#1a202c', marginBottom: '6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'var(--font-instrument, Arial, sans-serif)', transition: 'color 0.2s' }}
                className="group-hover:text-[#e63946]"
              >
                {a.title}
              </h3>
              <div style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
                <span>{timeAgo(a.publishedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '14px', textAlign: 'center', marginTop: '40px' }}>
        <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Advertisement · 728 × 90</span>
      </div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <Suspense fallback={<SkeletonGrid count={16} />}>
      <NewsContent />
    </Suspense>
  )
}
