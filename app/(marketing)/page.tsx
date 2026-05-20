import { fetchHomepageNews } from '@/lib/fetch-news'
import BreakingTicker from '@/components/layout/BreakingTicker'
import LiveHeroGrid from '@/components/homepage/LiveHeroGrid'
import LiveCategorySection from '@/components/homepage/LiveCategorySection'
import Link from 'next/link'

export const revalidate = 600

export default async function HomePage() {
  const { topStories, byCategory } = await fetchHomepageNews()

  const sidebarTrending = topStories.slice(0, 5).map(a => ({
    title: a.title, category: a.category, source: a.source,
  }))

  return (
    <>
      <BreakingTicker />

      <div style={{ padding: '24px 32px' }}>

        <LiveHeroGrid articles={topStories} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px', alignItems: 'start' }}>

          <div>
            <LiveCategorySection title="Nigeria" articles={byCategory['Nigeria'] || []} viewAllHref="/news?region=nigeria" />
            <LiveCategorySection title="Africa" articles={byCategory['Africa'] || []} viewAllHref="/news?region=africa" />

            <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '16px', textAlign: 'center', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Advertisement</span>
              <strong style={{ fontSize: '12px', color: '#6b7280' }}>728 × 90 · Premium Ad Placement</strong>
              <Link href="/advertise" style={{ fontSize: '10px', color: '#e63946', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Advertise Here →</Link>
            </div>

            <LiveCategorySection title="World" articles={byCategory['World'] || []} viewAllHref="/news?region=world" />
            <LiveCategorySection title="Politics" articles={byCategory['Politics'] || []} viewAllHref="/news?category=Politics" />
            <LiveCategorySection title="Sports" articles={byCategory['Sports'] || []} viewAllHref="/news?category=Sports" />

            <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '16px', textAlign: 'center', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Sponsored</span>
              <strong style={{ fontSize: '12px', color: '#6b7280' }}>728 × 90 · Sponsored Content</strong>
            </div>

            <LiveCategorySection title="Business" articles={byCategory['Business'] || []} viewAllHref="/news?category=Business" />
            <LiveCategorySection title="Technology" articles={byCategory['Technology'] || []} viewAllHref="/news?category=Technology" />
            <LiveCategorySection title="Americas" articles={byCategory['Americas'] || []} viewAllHref="/news?region=americas" />
            <LiveCategorySection title="Europe" articles={byCategory['Europe'] || []} viewAllHref="/news?region=europe" />
            <LiveCategorySection title="Middle East" articles={byCategory['Middle East'] || []} viewAllHref="/news?region=middleeast" />
            <LiveCategorySection title="Asia Pacific" articles={byCategory['Asia'] || []} viewAllHref="/news?region=asia" />
            <LiveCategorySection title="Entertainment" articles={byCategory['Entertainment'] || []} viewAllHref="/news?category=Entertainment" />
            <LiveCategorySection title="Health" articles={byCategory['Health'] || []} viewAllHref="/news?category=Health" />
            <LiveCategorySection title="Science" articles={byCategory['Science'] || []} viewAllHref="/news?category=Science" />
          </div>

          <aside style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 className="mb-4 border-l-1 border-[#dc2626] pl-3 text-xs font-black uppercase tracking-widest text-(--fg-default)">
                Trending Now
              </h3>
              {sidebarTrending.map((item, i) => (
                <div key={i} className="flex cursor-pointer gap-3 border-b border-[#e5e7eb] py-3 group">
                  <span className="min-w-[28px] text-xl font-black text-[#e5e7eb] transition-colors group-hover:text-[#dc2626]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1a202c] transition-colors group-hover:text-[#dc2626]">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-[#6b7280]">
                      {item.category} · {item.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0f1419] p-6 text-center">
              <h3 className="mb-2 font-display text-lg font-bold text-white">Stay Informed</h3>
              <p className="mb-4 text-sm leading-[1.5] text-gray-400">
                Get the top stories delivered to your inbox every morning. No spam, unsubscribe anytime.
              </p>
              <input type="email" placeholder="Your email address" className="mb-2.5 w-full border-none bg-white px-4 py-2.5 text-sm outline-none" />
              <button className="w-full bg-[#dc2626] py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#c1121f]">
                Subscribe Free
              </button>
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
