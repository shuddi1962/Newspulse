import Link from 'next/link'
import { Article } from '@/lib/insforge'
import { formatCardDate } from '@/lib/format-date'

const FALLBACK = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=500&fit=crop'

const CAT_COLORS: Record<string, string> = {
  Nigeria:'#e63946',Africa:'#16a34a',World:'#374151',Business:'#2563eb',
  Technology:'#7c3aed',Sports:'#059669',Politics:'#dc2626',Entertainment:'#d97706',
  Health:'#0891b2',Science:'#0f766e',
}

export default function HeroGrid({ articles }: { articles: Article[] }) {
  const [main, second, ...rest] = articles
  if (!main) return null

  return (
    <section style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <span style={{ width: '7px', height: '7px', background: '#e63946', borderRadius: '50%', animation: 'pulse 1.4s ease infinite', display: 'inline-block' }} />
        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#e63946' }}>Live Updates</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px' }}>
        <Link
          href={`/news/${main.slug}`}
          prefetch={false}
          style={{ textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden', gridRow: '1 / 3' }}
          className="group"
        >
          <img
            src={main.image_url || FALLBACK}
            alt={main.headline}
            style={{ width: '100%', height: '460px', objectFit: 'cover', display: 'block', transition: 'transform 0.45s ease' }}
            className="group-hover:scale-[1.04]"
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.1) 75%, transparent 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px' }}>
            <span style={{ display: 'inline-block', background: CAT_COLORS[main.category] || '#e63946', color: '#fff', fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '3px 9px', marginBottom: '10px' }}>
              {main.category}
            </span>
            <h2 style={{ color: '#fff', fontSize: '26px', fontWeight: 700, lineHeight: 1.25, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Georgia, serif', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
              {main.headline}
            </h2>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>
              NewsPulse PRO · {formatCardDate(main.published_at)}
            </span>
          </div>
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {second && (
            <Link href={`/news/${second.slug}`} prefetch={false} style={{ textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden', flex: '0 0 228px' }} className="group">
              <img src={second.image_url || FALLBACK} alt={second.headline}
                style={{ width: '100%', height: '228px', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                className="group-hover:scale-[1.04]"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                <span style={{ display: 'inline-block', background: CAT_COLORS[second.category] || '#e63946', color: '#fff', fontSize: '8px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 7px', marginBottom: '6px' }}>
                  {second.category}
                </span>
                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 700, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Georgia, serif', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
                  {second.headline}
                </h3>
              </div>
            </Link>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', flex: 1 }}>
            {rest.slice(0, 4).map(article => (
              <Link key={article.id} href={`/news/${article.slug}`} prefetch={false} style={{ textDecoration: 'none', display: 'block', position: 'relative', overflow: 'hidden', height: '225px' }} className="group">
                <img src={article.image_url || FALLBACK} alt={article.headline}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  className="group-hover:scale-[1.06]"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px' }}>
                  <span style={{ display: 'inline-block', background: CAT_COLORS[article.category] || '#e63946', color: '#fff', fontSize: '8px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 6px', marginBottom: '5px' }}>
                    {article.category}
                  </span>
                  <h4 style={{ color: '#fff', fontSize: '12px', fontWeight: 700, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'Georgia, serif', textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                    {article.headline}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
