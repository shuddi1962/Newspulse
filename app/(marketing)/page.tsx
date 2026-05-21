import { db } from '@/lib/insforge'
import BreakingTicker from '@/components/layout/BreakingTicker'
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
  { title: 'Middle East 🕌', category: 'Middle East', href: '/news?category=Middle%20East' },
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
    <>
      <BreakingTicker />

      <div style={{ padding: '24px 32px' }}>

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
                {/* Ad strip every 4 sections */}
                {(idx + 1) % 4 === 0 && (
                  <>
                    <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '16px', textAlign: 'center', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Advertisement</span>
                      <strong style={{ fontSize: '12px', color: '#6b7280' }}>728 × 90 · Premium Ad Placement</strong>
                      <Link href="/advertise" style={{ fontSize: '10px', color: '#e63946', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Advertise Here →</Link>
                    </div>
                    {idx > 0 && idx < sections.length - 1 && (
                      <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '16px', textAlign: 'center', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Sponsored</span>
                        <strong style={{ fontSize: '12px', color: '#6b7280' }}>728 × 90 · Sponsored Content</strong>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <aside style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 className="mb-4 border-l-1 border-[#dc2626] pl-3 text-xs font-black uppercase tracking-widest text-(--fg-default)">
                🔥 Trending Now
              </h3>
              {trending.map((a, i) => (
                <Link key={a.id} href={`/news/${a.slug}`} prefetch={false}
                  style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none', alignItems: 'flex-start' }}
                  className="group"
                >
                  <span className="min-w-[28px] text-xl font-black text-[#e5e7eb] transition-colors group-hover:text-[#dc2626]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a202c] transition-colors group-hover:text-[#dc2626]">
                      {a.headline}
                    </h4>
                    <p className="mt-1 text-[11px] text-[#6b7280]">
                      {a.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-[#0f1419] p-6 text-center">
              <h3 className="mb-2 font-display text-lg font-bold text-white">📬 Stay Informed</h3>
              <p className="mb-4 text-sm leading-[1.5] text-gray-400">
                Get the top stories delivered to your inbox every morning. No spam, unsubscribe anytime.
              </p>
              <NewsletterForm />
            </div>

            <div className="flex h-[250px] flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-100">
              <span className="text-[11px] text-gray-400">Advertisement</span>
              <strong className="mt-1 text-[12px] text-gray-500">300 × 250</strong>
            </div>

            <div>
              <h3 className="mb-4 border-l-1 border-[#dc2626] pl-3 text-xs font-black uppercase tracking-widest text-(--fg-default)">
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Nigeria','Africa','World','Business','Tech','Sports','Politics','Health','Science','Europe','Asia','AFCON','Elections','AI','Climate'].map(tag => (
                  <span key={tag} className="cursor-pointer border border-[#e5e7eb] bg-gray-100 px-3 py-1.5 text-[11px] text-[#6b7280] transition-colors hover:border-[#0f1419] hover:bg-[#0f1419] hover:text-white">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}

function NewsletterForm() {
  'use client'
  return (
    <form action="/api/subscribe" method="post">
      <input type="email" name="email" placeholder="Your email address"
        className="mb-2.5 w-full border-none bg-white px-4 py-2.5 text-sm outline-none" />
      <button type="submit"
        className="w-full bg-[#dc2626] py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f]">
        Subscribe Free
      </button>
    </form>
  )
}
