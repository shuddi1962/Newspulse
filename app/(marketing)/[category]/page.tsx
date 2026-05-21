import { db } from '@/lib/insforge'
import ArticleCard from '@/components/ui/ArticleCard'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

const VALID_CATEGORIES: Record<string, string> = {
  nigeria: 'Nigeria', africa: 'Africa', world: 'World',
  business: 'Business', technology: 'Technology', sports: 'Sports',
  politics: 'Politics', entertainment: 'Entertainment', health: 'Health',
  science: 'Science', opinion: 'Opinion',
}

type Params = { category: string }
type SearchParams = { page?: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { category } = await params
  const name = VALID_CATEGORIES[category]
  if (!name) return {}
  return { title: `${name} News | NewsPulse PRO`, description: `Latest ${name} news and updates from NewsPulse PRO.` }
}

export const revalidate = 60

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const { category: categorySlug } = await params
  const sp = await searchParams
  const categoryName = VALID_CATEGORIES[categorySlug]
  if (!categoryName) notFound()

  const page = parseInt(sp.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const { data: articles, total } = await db.articles.list({
    category: categoryName,
    status: 'published',
    limit,
    offset,
  })

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px' }}>
      <div style={{ background: '#0f1419', padding: '24px 28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ width: '6px', height: '6px', background: '#e63946', borderRadius: '50%', animation: 'pulse 1.4s ease infinite', display: 'inline-block' }} />
          <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#e63946' }}>Live</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#fff', fontFamily: 'Georgia, serif' }}>{categoryName}</h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
          {total} stories · Updated every 10 minutes
        </p>
      </div>

      {articles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No articles yet</p>
          <p style={{ fontSize: '13px' }}>Check back soon — stories are being added every 10 minutes.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '24px' }}>
          {page > 1 && (
            <a href={`/${categorySlug}?page=${page - 1}`} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 600, textDecoration: 'none', color: '#0f1419' }}>
              ← Prev
            </a>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1
            return (
              <a key={p} href={`/${categorySlug}?page=${p}`}
                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: p === page ? 700 : 400, background: p === page ? '#0f1419' : '#fff', color: p === page ? '#fff' : '#0f1419', textDecoration: 'none' }}>
                {p}
              </a>
            )
          })}
          {page < totalPages && (
            <a href={`/${categorySlug}?page=${page + 1}`} style={{ padding: '8px 16px', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 600, textDecoration: 'none', color: '#0f1419' }}>
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
