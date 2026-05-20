'use client'
import { NewsArticle } from '@/lib/rss-parser'
import Link from 'next/link'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { timeAgo } from '@/components/ui/TimeAgo'

const FB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&h=450&fit=crop'

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

export default function LiveHeroGrid({ articles }: { articles: NewsArticle[] }) {
  const [main, top, ...smalls] = articles
  if (!main) return null

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="live-dot" />
        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#e63946]">Live Updates</span>
        <span className="text-[10px] text-[#6b7280] font-instrument">Auto-refreshes every 10 minutes</span>
      </div>

      <div className="grid gap-[3px]" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto' }}>

        <Link
          href={articleHref(main)}
          className="relative img-zoom cursor-pointer block"
          style={{ gridRow: '1 / 3' }}
        >
          <img
            src={main.image || FB}
            alt={main.title}
            className="w-full object-cover"
            style={{ height: '460px' }}
            onError={(e) => { (e.target as HTMLImageElement).src = FB }}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-7">
            <CategoryBadge category={main.category} className="mb-3" />
            <h2 className="text-white font-bold leading-[1.25] mb-3 line-clamp-2" style={{ fontSize: '24px', fontFamily: 'var(--font-fraunces, Georgia, serif)', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
              {main.title}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-white/75 text-[11px] font-instrument font-semibold">{main.source}</span>
              <span className="text-white/40 text-[10px]">·</span>
              <span className="text-white/60 text-[11px] font-instrument">{timeAgo(main.publishedAt)}</span>
            </div>
          </div>
        </Link>

        {top && (
          <Link href={articleHref(top)} className="relative img-zoom cursor-pointer block">
            <img
              src={top.image || FB}
              alt={top.title}
              className="w-full object-cover"
              style={{ height: '228px' }}
              onError={(e) => { (e.target as HTMLImageElement).src = FB }}
            />
            <div className="absolute inset-0 hero-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <CategoryBadge category={top.category} className="mb-2" />
              <h3 className="text-white font-bold leading-[1.3] line-clamp-2" style={{ fontSize: '15px', fontFamily: 'var(--font-fraunces, Georgia, serif)', textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
                {top.title}
              </h3>
              <span className="text-white/60 text-[10px] font-instrument mt-1 block">{top.source} · {timeAgo(top.publishedAt)}</span>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-[3px]" style={{ height: '228px' }}>
          {smalls.slice(0, 4).map((a, i) => (
            <Link key={i} href={articleHref(a)} className="relative img-zoom cursor-pointer block">
              <img
                src={a.image || FB}
                alt={a.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = FB }}
              />
              <div className="absolute inset-0 hero-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <CategoryBadge category={a.category} className="mb-1" />
                <h4 className="text-white font-bold leading-[1.3] line-clamp-2" style={{ fontSize: '12px', fontFamily: 'var(--font-fraunces, Georgia, serif)', textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
                  {a.title}
                </h4>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
