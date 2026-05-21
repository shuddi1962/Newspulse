'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Video', href: '/video' },
  { label: 'Directory', href: '/directory' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Events', href: '/events' },
  { label: 'Advertise', href: '/advertise' },
]

const CAT_LINKS = [
  { label: '🇳🇬 Nigeria', href: '/nigeria' },
  { label: '🌍 Africa', href: '/africa' },
  { label: '🌐 World', href: '/world' },
  { label: '💼 Business', href: '/business' },
  { label: '💻 Technology', href: '/technology' },
  { label: '⚽ Sports', href: '/sports' },
  { label: '🏛 Politics', href: '/politics' },
  { label: '🎬 Entertainment', href: '/entertainment' },
  { label: '🏥 Health', href: '/health' },
  { label: '🔬 Science', href: '/science' },
]

interface Props {
  activeNav?: string
}

export function SiteHeader({ activeNav = '' }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.25)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* TOP BAR */}
      <div style={{ background: '#111820', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '5px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#9ca3af', fontSize: '11px' }}>{today} · Lagos, Nigeria</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/login" style={{ color: '#9ca3af', fontSize: '11px', textDecoration: 'none' }}>Login</Link>
            <Link href="/signup" style={{ color: '#9ca3af', fontSize: '11px', textDecoration: 'none' }}>Register</Link>
            <Link href="/subscribe" style={{ background: '#e63946', color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', textDecoration: 'none' }}>
              Subscribe
            </Link>
          </div>
        </div>
      </div>

      {/* MAIN NAV */}
      <div style={{ background: '#0f1419', height: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '26px', fontWeight: 700, color: '#fff', fontFamily: 'Georgia, serif', lineHeight: 1 }}>
              NewsPulse<span style={{ color: '#e63946' }}>PRO</span>
            </span>
            <span style={{ fontSize: '9px', color: '#6b7280', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Editorial authority for the modern web
            </span>
          </Link>

          <nav style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: activeNav === link.label.toLowerCase() ? '#fff' : '#9ca3af',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '8px 12px',
                  textDecoration: 'none',
                  borderBottom: activeNav === link.label.toLowerCase() ? '2px solid #e63946' : '2px solid transparent',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {searchOpen && (
              <form action="/news" method="get" style={{ display: 'flex' }}>
                <input
                  name="q"
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Search NewsPulse PRO..."
                  autoFocus
                  style={{ width: '220px', padding: '7px 12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '12px', outline: 'none' }}
                />
              </form>
            )}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{ width: '34px', height: '34px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Search size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div style={{ background: '#e63946', overflowX: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '0', alignItems: 'center', whiteSpace: 'nowrap' }}>
          {CAT_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: 'rgba(255,255,255,0.88)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '8px 14px',
                textDecoration: 'none',
                borderRight: '1px solid rgba(255,255,255,0.15)',
                transition: 'background 0.15s',
                flexShrink: 0,
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.15)')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
