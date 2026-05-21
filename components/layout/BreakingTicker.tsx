import { db } from '@/lib/insforge'
import Link from 'next/link'

export default async function BreakingTicker() {
  let items = await db.articles.list({ breaking: true, limit: 10, status: 'published' })
    .then(r => r.data).catch(() => [])

  if (items.length < 3) {
    items = await db.articles.list({ limit: 10, status: 'published' })
      .then(r => r.data).catch(() => [])
  }

  if (!items.length) return null

  return (
    <div style={{ background: '#0f1419', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '7px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          background: '#e63946', color: '#fff', fontSize: '9px', fontWeight: 900,
          letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 10px',
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1.4s ease infinite' }} />
          Breaking
        </span>

        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div
            className="ticker-track"
            style={{ display: 'inline-flex', alignItems: 'center', animation: 'ticker-scroll 50s linear infinite', whiteSpace: 'nowrap' }}
          >
            {[...items, ...items].map((article, i) => (
              <span key={`${article.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Link
                  href={`/news/${article.slug}`}
                  prefetch={false}
                  style={{
                    color: '#e2e8f0',
                    fontSize: '12px',
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    padding: '0 4px',
                    transition: 'color 0.2s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#e63946')}
                  onMouseOut={e => (e.currentTarget.style.color = '#e2e8f0')}
                >
                  🔴 {article.headline}
                </Link>
                <span style={{ color: 'rgba(255,255,255,0.25)', margin: '0 18px' }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
