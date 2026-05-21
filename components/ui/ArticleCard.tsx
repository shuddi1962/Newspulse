import Link from 'next/link'
import { Article } from '@/lib/insforge'
import { formatCardDate } from '@/lib/format-date'

const CAT_COLORS: Record<string, string> = {
  Nigeria: '#e63946', Africa: '#16a34a', World: '#374151',
  Business: '#2563eb', Technology: '#7c3aed', Sports: '#059669',
  Politics: '#dc2626', Entertainment: '#d97706', Health: '#0891b2',
  Science: '#0f766e', Americas: '#1d4ed8', Europe: '#4338ca',
  'Middle East': '#b45309', Asia: '#0369a1', Opinion: '#6b7280',
}

const FALLBACK = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=260&fit=crop&q=80'

interface Props {
  article: Article
  size?: 'normal' | 'large' | 'small'
}

function ArticleCard({ article, size = 'normal' }: Props) {
  const imgHeight = size === 'large' ? '220px' : size === 'small' ? '130px' : '175px'
  const titleSize = size === 'large' ? '15px' : size === 'small' ? '12px' : '13px'
  const catColor = CAT_COLORS[article.category] || '#e63946'
  const date = formatCardDate(article.published_at)

  return (
    <Link
      href={`/news/${article.slug}`}
      prefetch={false}
      style={{ textDecoration: 'none', display: 'block' }}
      className="group news-card"
    >
      <div style={{ overflow: 'hidden', marginBottom: '10px' }}>
        <img
          src={article.image_url || FALLBACK}
          alt={article.image_alt || article.headline}
          style={{
            width: '100%',
            height: imgHeight,
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
          className="group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
        />
      </div>

      <span style={{
        display: 'inline-block', background: catColor, color: '#fff',
        fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em',
        textTransform: 'uppercase', padding: '2px 8px', marginBottom: '7px',
      }}>
        {article.category}
      </span>

      <h3 style={{
        fontSize: titleSize, fontWeight: 700, lineHeight: 1.4,
        color: '#1a202c', marginBottom: '7px',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', transition: 'color 0.2s',
      }}
        className="group-hover:text-red-600"
      >
        {article.headline}
      </h3>

      <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#0f1419', opacity: 0.5 }}>
          NewsPulse PRO
        </span>
        <span style={{ color: '#e5e7eb' }}>·</span>
        <span>{date}</span>
      </div>
    </Link>
  )
}

export { ArticleCard }
export default ArticleCard
