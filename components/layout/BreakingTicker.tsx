'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Article {
  title: string
  link: string
  source?: string
  image?: string
  description?: string
  category?: string
  publishedAt?: string
}

export default function BreakingTicker() {
  const [articles, setArticles] = useState<Article[]>([])

  useEffect(() => {
    Promise.all([
      fetch('/api/news?region=nigeria&limit=5').then(r => r.json()).catch(() => ({ articles: [] })),
      fetch('/api/news?region=world&limit=5').then(r => r.json()).catch(() => ({ articles: [] })),
    ]).then(([ng, world]) => {
      const all = [...(ng.articles || []), ...(world.articles || [])]
      if (all.length) setArticles(all)
    })
  }, [])

  if (!articles.length) return null

  const items = articles.map((a) => ({
    label: a.title,
    href: `/article?url=${encodeURIComponent(a.link)}&title=${encodeURIComponent(a.title)}&source=${encodeURIComponent(a.source || '')}&image=${encodeURIComponent(a.image || '')}&desc=${encodeURIComponent(a.description || '')}&category=${encodeURIComponent(a.category || '')}`,
  }))

  return (
    <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '8px 0', overflow: 'hidden' }}>
      <div className="px-8 flex items-center gap-3">
        <span style={{ background: '#e63946', color: '#fff', fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 9px', flexShrink: 0 }}>
          Breaking
        </span>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <span className="ticker-animate" style={{ color: '#374151', fontSize: '12px' }}>
            {items.map((item, i) => (
              <span key={i}>
                <Link
                  href={item.href}
                  style={{ color: '#374151', textDecoration: 'none' }}
                  className="hover:text-[#e63946] transition-colors"
                >
                  {item.label}
                </Link>
                {i < items.length - 1 && <span style={{ margin: '0 12px', color: '#d1d5db' }}>·</span>}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}
