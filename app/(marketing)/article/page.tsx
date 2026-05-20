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
  const [readerOpen, setReaderOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')

  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentPosted, setCommentPosted] = useState(false)

  const relatedLoading = relatedArticles.length === 0

  useEffect(() => {
    const t = params.get('title') || ''
    const s = params.get('source') || ''
    const img = params.get('image') || ''
    const desc = params.get('desc') || ''
    const cat = params.get('category') || ''
    setTitle(decodeURIComponent(t))
    setSource(decodeURIComponent(s))
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
      body: JSON.stringify({ title, description, source, url }),
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

  const decodedUrl = decodeURIComponent(url)

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* TOP AD BANNER */}
      <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '16px', textAlign: 'center', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Advertisement</span>
        <strong style={{ fontSize: '12px', color: '#6b7280' }}>728 × 90 · Leaderboard</strong>
      </div>

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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
            {category && <CategoryBadge category={category} />}
            <a href={decodedUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '1px' }}>
              View original ↗
            </a>
          </div>

          {title && (
            <h1 style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1.2, color: '#0f1419', marginBottom: '24px', fontFamily: 'var(--font-fraunces, Georgia, serif)' }}>
              {title}
            </h1>
          )}

          {/* AI SUMMARY */}
          <div style={{ background: '#f0f4ff', borderLeft: '4px solid #e63946', padding: '20px 24px', marginBottom: '28px', borderRadius: '0 4px 4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#e63946' }}>✦ AI Summary</span>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>by NewsPulse PRO · powered by Claude</span>
            </div>
            {summaryLoading ? (
              <div>
                <div className="skeleton h-4 w-full mb-2" /><div className="skeleton h-4 w-5/6 mb-2" /><div className="skeleton h-4 w-4/5" />
              </div>
            ) : summary ? (
              <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#374151', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>{summary}</p>
            ) : (
              <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>Summary unavailable. Please read the full article below.</p>
            )}
          </div>

          {/* BUTTONS */}
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={() => setReaderOpen(!readerOpen)}
              style={{
                background: readerOpen ? '#f8f9fa' : '#0f1419',
                color: readerOpen ? '#0f1419' : '#fff',
                border: '2px solid #0f1419',
                padding: '12px 28px',
                fontSize: '12px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                marginRight: '12px',
                marginBottom: '8px',
              }}
            >
              {readerOpen ? '✕ Close Full Article' : '📖 Read Full Article'}
            </button>
            <a
              href={decodedUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#e63946',
                color: '#fff',
                padding: '12px 24px',
                fontSize: '12px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'inline-block',
                marginBottom: '8px',
              }}
            >
              Visit Source ↗
            </a>
          </div>

          {/* IN-ARTICLE AD */}
          <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '14px', textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>In-Article Advertisement</span>
          </div>

          {/* IFRAME EMBED */}
          {readerOpen && (
            <div style={{ marginBottom: '36px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ background: '#f8f9fa', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>📄 Full Article</span>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Content from original publisher</span>
              </div>
              <iframe
                src={decodedUrl}
                style={{ width: '100%', height: '680px', border: 'none', display: 'block' }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title={title}
              />
              <div style={{ background: '#fff8f0', padding: '12px 16px', borderTop: '1px solid #ffe4b5' }}>
                <a href={decodedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#e63946', fontWeight: 700, fontSize: '12px' }}>
                  Open in new tab ↗
                </a>
              </div>
            </div>
          )}

          {/* SHARE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '24px', borderTop: '1px solid #e5e7eb', marginBottom: '36px' }}>
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

          {/* ─── RELATED ARTICLES ─── */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '12px', borderBottom: '2px solid #0f1419' }}>
              <span style={{ width: '4px', height: '20px', background: '#e63946', display: 'inline-block', flexShrink: 0 }} />
              <h2 style={{ fontSize: '15px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0f1419', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>Related Stories</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {relatedArticles.slice(0, 4).map((a: any) => (
                <Link key={a.id} href={`/article?url=${encodeURIComponent(a.link)}&title=${encodeURIComponent(a.title)}&source=${encodeURIComponent(a.source)}&image=${encodeURIComponent(a.image || '')}&desc=${encodeURIComponent(a.description || '')}&category=${encodeURIComponent(a.category || '')}`} className="news-card block group" style={{ textDecoration: 'none' }}>
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

            {/* Comment form */}
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
                placeholder="Share your thoughts on this article..."
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

            {/* Comments list */}
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

          {/* BOTTOM AD */}
          <div style={{ background: '#f8f9fa', border: '1px dashed #d1d5db', padding: '16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Advertisement</span>
            <strong style={{ fontSize: '12px', color: '#6b7280' }}>728 × 90</strong>
          </div>
        </article>

        {/* ─── SIDEBAR ─── */}
        <aside style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Ad */}
          <div style={{ background: '#f3f4f6', height: '250px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
            <strong style={{ fontSize: '13px', color: '#6b7280' }}>Advertisement</strong>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>300 × 250</span>
          </div>

          {/* Trending */}
          <div>
            <h3 style={{ borderLeft: '3px solid #dc2626', paddingLeft: '10px', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0f1419', marginBottom: '14px' }}>Trending Now</h3>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #e5e7eb', padding: '10px 0', cursor: 'pointer' }}>
                <span style={{ minWidth: '24px', fontSize: '16px', fontWeight: 900, color: '#e5e7eb' }}>{String(i).padStart(2,'0')}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, lineHeight: 1.4, color: '#1a202c' }}>Top stories loading from live feed...</span>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ background: '#0f1419', padding: '20px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-fraunces, Georgia, serif)' }}>Stay Informed</h3>
            <p style={{ fontSize: '12px', lineHeight: 1.5, color: '#9ca3af', marginBottom: '12px' }}>Get the top stories delivered to your inbox.</p>
            <input type="email" placeholder="Your email" style={{ width: '100%', padding: '10px', border: 'none', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
            <button style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '10px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
              Subscribe Free
            </button>
          </div>

          {/* Ad 2 */}
          <div style={{ background: '#f3f4f6', height: '250px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '6px' }}>
            <strong style={{ fontSize: '13px', color: '#6b7280' }}>Advertisement</strong>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>300 × 250</span>
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
