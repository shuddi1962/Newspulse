'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ArticleReaderContent() {
  const params = useSearchParams()
  const url = params.get('url') || ''
  const [summary, setSummary] = useState<string>('')
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [readerOpen, setReaderOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    const t = params.get('title') || ''
    const s = params.get('source') || ''
    const img = params.get('image') || ''
    const desc = params.get('desc') || ''
    setTitle(decodeURIComponent(t))
    setSource(decodeURIComponent(s))
    setImage(decodeURIComponent(img))
    setDescription(decodeURIComponent(desc))
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

  const decodedUrl = decodeURIComponent(url)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b7280', marginBottom: '20px', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
        <Link href="/" style={{ color: '#e63946' }}>Home</Link>
        <span>›</span>
        <span>{source || 'Article'}</span>
        <span>›</span>
        <span style={{ color: '#9ca3af' }}>Reading Now</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px', alignItems: 'start' }}>
        <article>
          {image && (
            <div style={{ marginBottom: '20px', overflow: 'hidden' }}>
              <img
                src={decodeURIComponent(image)}
                alt={title}
                style={{ width: '100%', height: '380px', objectFit: 'cover', display: 'block' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#e63946', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{source}</span>
            <a href={decodedUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: '1px' }}>
              View original on {source} ↗
            </a>
          </div>

          {title && (
            <h1 style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.25, color: '#0f1419', marginBottom: '16px', fontFamily: 'var(--font-fraunces, Georgia, serif)' }}>
              {title}
            </h1>
          )}

          <div style={{ background: '#f0f4ff', borderLeft: '4px solid #e63946', padding: '20px 24px', marginBottom: '28px', borderRadius: '0 4px 4px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#e63946' }}>
                ✦ AI Summary
              </span>
              <span style={{ fontSize: '10px', color: '#9ca3af' }}>by NewsPulse PRO · powered by Claude</span>
            </div>
            {summaryLoading ? (
              <div>
                <div className="skeleton h-4 w-full mb-2" />
                <div className="skeleton h-4 w-5/6 mb-2" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            ) : summary ? (
              <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#374151', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
                {summary}
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                Summary unavailable. Please read the full article below.
              </p>
            )}
          </div>

          <div style={{ marginBottom: '28px' }}>
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
              }}
            >
              Visit Source ↗
            </a>
          </div>

          {readerOpen && (
            <div style={{ marginBottom: '32px', border: '1px solid #e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ background: '#f8f9fa', padding: '10px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'var(--font-instrument, Arial, sans-serif)' }}>
                  📄 Reading: <strong style={{ color: '#0f1419' }}>{source}</strong>
                </span>
                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Content from original publisher</span>
              </div>
              <iframe
                src={decodedUrl}
                style={{ width: '100%', height: '680px', border: 'none', display: 'block' }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                title={title}
              />
              <div style={{ background: '#fff8f0', padding: '12px 16px', borderTop: '1px solid #ffe4b5', fontSize: '12px', color: '#92400e' }}>
                ⚠️ If the article doesn't load above, some publishers block embedding.{' '}
                <a href={decodedUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#e63946', fontWeight: 700 }}>
                  Open in new tab ↗
                </a>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', marginBottom: '28px' }}>
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
        </article>

        <aside style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: '#f3f4f6', height: '250px', border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', flexDirection: 'column', gap: '6px' }}>
            <strong style={{ fontSize: '13px', color: '#6b7280' }}>Advertisement</strong>
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>300 × 250</span>
          </div>
          <div style={{ background: '#0f1419', padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '12px' }}>Continue reading more stories on NewsPulse PRO</p>
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
