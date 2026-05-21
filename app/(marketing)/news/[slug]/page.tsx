import { db } from '@/lib/insforge'
import { formatFullDate } from '@/lib/format-date'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

const FALLBACK = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop'

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const article = await db.articles.get(slug)
    return {
      title: `${article.headline} | NewsPulse PRO`,
      description: article.excerpt,
      openGraph: {
        title: article.headline,
        description: article.excerpt,
        images: article.image_url ? [{ url: article.image_url }] : [],
      },
    }
  } catch {
    return { title: 'Article | NewsPulse PRO' }
  }
}

export const revalidate = 60

export default async function ArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  let article
  try {
    article = await db.articles.get(slug)
  } catch {
    notFound()
  }

  const date = formatFullDate(article.published_at)
  const paragraphs = article.content.split('\n\n').filter(Boolean)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '28px 20px' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280', marginBottom: '20px' }}>
        <Link href="/" style={{ color: '#e63946', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: '#e5e7eb' }}>/</span>
        <Link href={`/${article.category.toLowerCase()}`} prefetch={false} style={{ color: '#6b7280', textDecoration: 'none' }}>{article.category}</Link>
        <span style={{ color: '#e5e7eb' }}>/</span>
        <span style={{ color: '#9ca3af' }}>{article.headline.slice(0, 40)}...</span>
      </nav>

      <span style={{
        display: 'inline-block', background: '#e63946', color: '#fff',
        fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em',
        textTransform: 'uppercase', padding: '3px 9px', marginBottom: '12px',
      }}>
        {article.category}
      </span>

      <h1 style={{
        fontSize: '34px', fontWeight: 700, lineHeight: 1.2,
        color: '#0f1419', marginBottom: '12px', fontFamily: 'Georgia, serif',
      }}>
        {article.headline}
      </h1>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '12px', color: '#6b7280', marginBottom: '24px', paddingBottom: '16px',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <span style={{ fontWeight: 600, color: '#0f1419' }}>NewsPulse PRO</span>
        <span>·</span>
        <span>{date}</span>
        <span>·</span>
        <span>Source: {article.source_name}</span>
      </div>

      <div style={{ marginBottom: '28px' }}>
        <img
          src={article.image_url || FALLBACK}
          alt={article.image_alt || article.headline}
          style={{ width: '100%', maxHeight: '450px', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK }}
        />
      </div>

      <div style={{ fontSize: '16px', lineHeight: 1.8, color: '#374151' }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ marginBottom: '18px' }}>{p}</p>
        ))}
      </div>

      {article.tags.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '28px',
          paddingTop: '16px', borderTop: '1px solid #f3f4f6',
        }}>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#6b7280', marginRight: '6px', letterSpacing: '0.08em' }}>Tags:</span>
          {article.tags.map(tag => (
            <span key={tag} style={{
              padding: '4px 10px', background: '#f3f4f6', fontSize: '11px',
              color: '#6b7280', border: '1px solid #e5e7eb',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={{
        marginTop: '28px', padding: '14px 18px', background: '#f9fafb',
        border: '1px solid #e5e7eb', fontSize: '11px', color: '#9ca3af',
      }}>
        This article was originally reported by {article.source_name} and rewritten by NewsPulse PRO's editorial AI.
        Views and analysis are those of NewsPulse PRO.
      </div>
    </div>
  )
}
