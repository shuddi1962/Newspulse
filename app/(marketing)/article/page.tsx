'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import CategoryBadge from '@/components/ui/CategoryBadge'
import { timeAgo } from '@/components/ui/TimeAgo'

const FB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop&q=80'
const FB_THUMB = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=300&h=200&fit=crop&q=80'

function ArticleReaderContent() {
  const params = useSearchParams()
  const url = params.get('url') || ''
  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const decodedUrl = decodeURIComponent(url)

  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentPosted, setCommentPosted] = useState(false)

  useEffect(() => {
    const t = params.get('title') || ''
    const img = params.get('image') || ''
    const desc = params.get('desc') || ''
    const cat = params.get('category') || ''
    setTitle(decodeURIComponent(t))
    setImage(decodeURIComponent(img))
    setDescription(decodeURIComponent(desc))
    setCategory(decodeURIComponent(cat))
  }, [params])

  useEffect(() => {
    if (!url) return
    setSummaryLoading(true)
    fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, url }),
    })
      .then(r => r.json())
      .then(d => { setSummary(d.summary || ''); setSummaryLoading(false) })
      .catch(() => setSummaryLoading(false))
  }, [url, title])

  useEffect(() => {
    const catQuery = category ? `&category=${category}` : ''
    fetch(`/api/news?limit=8${catQuery}`)
      .then(r => r.json())
      .then(d => {
        const filtered = (d.articles || []).filter((a: any) => a.link !== url)
        setRelatedArticles(filtered.slice(0, 4))
      })
      .catch(() => {})
  }, [category, url])

  useEffect(() => {
    const saved = localStorage.getItem(`np-comments-${url}`)
    if (saved) setComments(JSON.parse(saved))
  }, [url])

  function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentName.trim() || !commentText.trim()) return
    const newComment = {
      id: Date.now().toString(),
      name: commentName.trim(),
      text: commentText.trim(),
      date: new Date().toISOString(),
    }
    const updated = [...comments, newComment]
    setComments(updated)
    localStorage.setItem(`np-comments-${url}`, JSON.stringify(updated))
    setCommentText('')
    setCommentName('')
    setCommentPosted(true)
    setTimeout(() => setCommentPosted(false), 3000)
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280', marginBottom: '24px', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
        <Link href="/" style={{ color: '#e63946', fontWeight: 600 }}>Home</Link>
        <span>›</span>
        <span style={{ color: '#9ca3af' }}>Reading Now</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '36px', alignItems: 'start' }}>

        {/* ─── MAIN CONTENT ─── */}
        <article>
          {image && (
            <div style={{ marginBottom: '24px', overflow: 'hidden' }}>
              <img
                src={decodeURIComponent(image)}
                alt={title}
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
                onError={(e) => { (e.target as HTMLImageElement).src = FB }}
              />
            </div>
          )}

          {category && (
            <div style={{ marginBottom: '16px' }}>
              <CategoryBadge category={category} />
            </div>
          )}

          {title && (
            <h1 style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.2, color: '#0f1419', marginBottom: '24px', fontFamily: 'var(--font-fraunces, Georgia, serif)' }}>
              {title}
            </h1>
          )}

          <div style={{ background: '#f0f4ff', borderLeft: '4px solid #e63946', padding: '20px 24px', marginBottom: '28px', borderRadius: '0 4px 4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#e63946' }}>✦ AI Summary</span>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>by NewsPulse PRO</span>
            </div>
            {summaryLoading ? (
              <div>
                <div className="skeleton h-4 w-full mb-2" /><div className="skeleton h-4 w-5/6 mb-2" /><div className="skeleton h-4 w-4/5" />
              </div>
            ) : summary ? (
              <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#374151', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>{summary}</p>
            ) : (
              <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>{description || 'Full coverage available on NewsPulse PRO.'}</p>
            )}
          </div>

          {description && !summary && (
            <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#374151', marginBottom: '28px', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
              {description}
            </p>
          )}

          <div style={{ paddingTop: '24px', borderTop: '1px solid #e5e7eb', marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>Share:</span>
              {[
                { label: 'Facebook', bg: '#1877f2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(decodedUrl)}` },
                { label: 'X / Twitter', bg: '#1da1f2', href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(decodedUrl)}&text=${encodeURIComponent(title)}` },
                { label: 'WhatsApp', bg: '#25d366', href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + decodedUrl)}` },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ background: s.bg, color: '#fff', padding: '6px 14px', fontSize: '11px', fontWeight: 700, textDecoration: 'none' }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ─── RELATED ARTICLES ─── */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #0f1419' }}>
              <span style={{ width: '4px', height: '20px', background: '#e63946', display: 'inline-block', flexShrink: 0 }} />
              <h2 style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f1419', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>Related Stories</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {relatedArticles.slice(0, 4).map((a: any) => (
                <Link key={a.id || a.link} href={`/article?url=${encodeURIComponent(a.link)}&title=${encodeURIComponent(a.title)}&source=${encodeURIComponent(a.source || '')}&image=${encodeURIComponent(a.image || '')}&desc=${encodeURIComponent(a.description || '')}&category=${encodeURIComponent(a.category || '')}`} className="news-card block group" style={{ textDecoration: 'none' }}>
                  <div className="img-zoom" style={{ marginBottom: '8px' }}>
                    <img src={a.image || FB_THUMB} alt={a.title} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = FB_THUMB }} />
                  </div>
                  <CategoryBadge category={a.category || ''} className="mb-1" />
                  <h3 style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.4, color: '#1a202c', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}
                    className="group-hover:text-[#e63946]">{a.title}</h3>
                  <span style={{ fontSize: '10px', color: '#6b7280' }}>{timeAgo(a.publishedAt)}</span>
                </Link>
              ))}
              {relatedArticles.length === 0 && (
                <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', gridColumn: '1 / -1', textAlign: 'center', padding: '24px' }}>
                  More stories loading...
                </p>
              )}
            </div>
          </div>

          {/* ─── COMMENTS ─── */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #0f1419' }}>
              <span style={{ width: '4px', height: '20px', background: '#e63946', display: 'inline-block', flexShrink: 0 }} />
              <h2 style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f1419', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
                Comments ({comments.length})
              </h2>
            </div>

            <form onSubmit={handleComment} style={{ marginBottom: '24px', background: '#f8f9fa', padding: '20px', border: '1px solid #e5e7eb' }}>
              <input
                type="text"
                value={commentName}
                onChange={e => setCommentName(e.target.value)}
                placeholder="Your name"
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', fontSize: '13px', marginBottom: '10px', outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}
              />
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', fontSize: '13px', marginBottom: '10px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{commentText.length} characters</span>
                <button type="submit" style={{ background: '#0f1419', color: '#fff', border: 'none', padding: '10px 24px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer' }}>
                  Post Comment
                </button>
              </div>
              {commentPosted && (
                <p style={{ marginTop: '10px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>Comment posted successfully.</p>
              )}
            </form>

            {comments.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '24px' }}>No comments yet. Be the first to share your thoughts.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {comments.slice().reverse().map((c: any) => (
                  <div key={c.id} style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e63946', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                        {c.name.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f1419' }}>{c.name}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{timeAgo(c.date)}</span>
                    </div>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#374151', marginLeft: '36px' }}>{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* ─── SIDEBAR ─── */}
        <aside style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Newsletter */}
          <div style={{ background: '#0f1419', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-fraunces, Georgia, serif)' }}>Stay Informed</h3>
            <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#9ca3af', marginBottom: '12px' }}>Get the top stories delivered to your inbox.</p>
            <input type="email" placeholder="Your email" style={{ width: '100%', padding: '10px', border: 'none', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
            <button style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
              Subscribe Free
            </button>
          </div>

          {/* Tags */}
          <div>
            <h3 style={{ borderLeft: '3px solid #dc2626', paddingLeft: '10px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0f1419', marginBottom: '12px' }}>Popular Tags</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Nigeria','Africa','World','Business','Tech','Sports','Politics','Health','Science'].map(tag => (
                <span key={tag} style={{ padding: '5px 10px', border: '1px solid #e5e7eb', fontSize: '10px', color: '#6b7280', cursor: 'pointer', background: '#f9fafb' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* Back to home */}
          <div style={{ background: '#0f1419', padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>More stories on NewsPulse PRO</p>
            <Link href="/" style={{ background: '#e63946', color: '#fff', padding: '10px 20px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'none', display: 'inline-block' }}>
              Back to Home →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading article...</div>}>
      <ArticleReaderContent />
    </Suspense>
  )
}
