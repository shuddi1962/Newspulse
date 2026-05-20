'use client'
import { NewsArticle } from '@/lib/rss-parser'
import Link from 'next/link'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { timeAgo } from '@/components/ui/TimeAgo'

const FB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop'

function articleHref(a: NewsArticle) {
  const p = new URLSearchParams({
    url: a.link,
    title: a.title,
    source: a.source,
    image: a.image || '',
    desc: a.description || '',
  })
  return `/article?${p.toString()}`
}

interface Props {
  title: string
  articles: NewsArticle[]
  viewAllHref?: string
  loading?: boolean
}

export default function LiveCategorySection({ title, articles, viewAllHref, loading }: Props) {
  const display = articles.slice(0, 4)
  if (!loading && display.length === 0) return null

  return (
    <section className="mb-9 fade-up">
      <SectionHeading title={title} viewAllHref={viewAllHref} live />
      <div className="grid grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : display.map(article => (
          <Link
            key={article.id}
            href={articleHref(article)}
            className="news-card block cursor-pointer group"
          >
            <div className="img-zoom mb-3">
              <img
                src={article.image || FB}
                alt={article.title}
                className="w-full object-cover"
                style={{ height: '175px' }}
                onError={(e) => { (e.target as HTMLImageElement).src = FB }}
              />
            </div>
            <CategoryBadge category={article.category} className="mb-2" />
            <h3
              className="font-bold leading-[1.4] text-[#1a202c] mb-2 line-clamp-2 group-hover:text-[#e63946] transition-colors"
              style={{ fontSize: '13px', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}
            >
              {article.title}
            </h3>
            <div className="flex items-center gap-2" style={{ fontSize: '10px', color: '#6b7280', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
              <span className="font-semibold text-[#0f1419]/60">{article.source}</span>
              <span className="text-[#e5e7eb]">·</span>
              <span>{timeAgo(article.publishedAt)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
