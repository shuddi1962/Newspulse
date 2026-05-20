'use client'
import { useEffect, useState } from 'react'

export default function BreakingTicker() {
  const [headlines, setHeadlines] = useState<string[]>(['Loading latest headlines...'])

  useEffect(() => {
    Promise.all([
      fetch('/api/news?region=nigeria&limit=5').then(r => r.json()).catch(() => ({ articles: [] })),
      fetch('/api/news?region=world&limit=5').then(r => r.json()).catch(() => ({ articles: [] })),
    ]).then(([ng, world]) => {
      const all = [...(ng.articles || []), ...(world.articles || [])]
      if (all.length) setHeadlines(all.map((a: any) => a.title))
    })
  }, [])

  const text = headlines.map(h => `🔴 ${h}`).join('   ·   ')

  return (
    <div style={{ background: '#0f1419', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '8px 0', overflow: 'hidden' }}>
      <div className="max-w-[1200px] mx-auto px-5 flex items-center gap-3">
        <span style={{ background: '#e63946', color: '#fff', fontSize: '9px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '3px 9px', flexShrink: 0 }}>
          Breaking
        </span>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <span className="ticker-animate" style={{ color: '#e5e7eb', fontSize: '12px' }}>
            {text}
          </span>
        </div>
      </div>
    </div>
  )
}
