import { db } from '@/lib/insforge'
import HeroGrid from '@/components/homepage/HeroGrid'
import ArticleCard from '@/components/ui/ArticleCard'
import SectionHeading from '@/components/ui/SectionHeading'
import Link from 'next/link'

export const revalidate = 60

const SECTIONS = [
  { title: 'Nigeria 🇳🇬', category: 'Nigeria', href: '/nigeria' },
  { title: 'Africa 🌍', category: 'Africa', href: '/africa' },
  { title: 'World 🌐', category: 'World', href: '/world' },
  { title: 'Politics 🏛', category: 'Politics', href: '/politics' },
  { title: 'Sports ⚽', category: 'Sports', href: '/sports' },
  { title: 'Business 💼', category: 'Business', href: '/business' },
  { title: 'Technology 💻', category: 'Technology', href: '/technology' },
  { title: 'Americas 🌎', category: 'Americas', href: '/news?category=Americas' },
  { title: 'Europe 🇪🇺', category: 'Europe', href: '/news?category=Europe' },
  { title: 'Middle East 🕌', category: 'Middle East', href: '/news?category=Middle East' },
  { title: 'Asia Pacific 🌏', category: 'Asia', href: '/news?category=Asia' },
  { title: 'Entertainment 🎬', category: 'Entertainment', href: '/entertainment' },
  { title: 'Health 🏥', category: 'Health', href: '/health' },
  { title: 'Science 🔬', category: 'Science', href: '/news?category=Science' },
]

export default async function HomePage() {
  const [heroData, ...sectionData] = await Promise.all([
    db.articles.list({ limit: 6, status: 'published' }).then(r => r.data).catch(() => []),
    ...SECTIONS.map(s =>
      db.articles.list({ category: s.category, limit: 4, status: 'published' })
        .then(r => r.data).catch(() => [])
    ),
  ])

  const sections = SECTIONS.map((s, i) => ({ ...s, articles: sectionData[i] || [] }))
  const trending = heroData.slice(0, 6)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>

      <HeroGrid articles={heroData} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px', alignItems: 'start' }}>

        <div>
          {sections.map((section, idx) => (
            <div key={section.category}>
              {section.articles.length > 0 && (
                <section style={{ marginBottom: '36px' }}>
                  <SectionHeading title={section.title} viewAllHref={section.href} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {section.articles.map(article => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </section>
              )}
              {(idx + 1) % 4 === 0 && (
                <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '14px', textAlign: 'center', marginBottom: '32px' }}>
                  <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Advertisement · 728 × 90 ·{' '}
                    <Link href="/advertise" style={{ color: '#e63946', fontWeight: 700, textDecoration: 'none' }}>Advertise Here</Link>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <aside style={{ position: 'sticky', top: '140px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f1419', borderLeft: '3px solid #e63946', paddingLeft: '10px', marginBottom: '14px' }}>
              🔥 Trending Now
            </div>
            {trending.map((a, i) => (
              <Link key={a.id} href={`/news/${a.slug}`} prefetch={false} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f3f4f6', textDecoration: 'none', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#e5e7eb', minWidth: '28px', lineHeight: 1, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#1a202c', lineHeight: 1.4, marginBottom: '2px' }}>{a.headline}</p>
                  <span style={{ fontSize: '10px', color: '#9ca3af' }}>{a.category}</span>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ background: '#0f1419', padding: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 700, marginBottom: '6px', fontFamily: 'Georgia, serif' }}>📬 Stay Informed</h3>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '14px', lineHeight: 1.5 }}>Get top stories delivered to your inbox daily.</p>
            <NewsletterForm />
          </div>

          <div style={{ background: '#f3f4f6', height: '250px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
            <strong style={{ fontSize: '13px', color: '#6b7280' }}>Advertisement</strong>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>300 × 250</span>
            <Link href="/advertise" style={{ fontSize: '10px', color: '#e63946', fontWeight: 700, textDecoration: 'none', textTransform: 'uppercase', marginTop: '4px' }}>Advertise Here</Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

function NewsletterForm() {
  'use client'
  return (
    <form action="/api/subscribe" method="post">
      <input type="email" name="email" placeholder="your@email.com" required
        style={{ width: '100%', padding: '9px 12px', border: 'none', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box', outline: 'none' }} />
      <button type="submit"
        style={{ width: '100%', padding: '9px', background: '#e63946', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
        Subscribe Free →
      </button>
    </form>
  )
}
