import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
      <Link href="/" style={{ fontSize: '24px', fontWeight: 700, color: '#0f1419', fontFamily: 'Georgia, serif', textDecoration: 'none', display: 'inline-block', marginBottom: '40px' }}>
        NewsPulse<span style={{ color: '#e63946' }}>PRO</span>
      </Link>
      <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#0f1419', fontFamily: 'Georgia, serif', marginBottom: '20px' }}>About NewsPulse PRO</h1>
      <div style={{ width: '48px', height: '3px', background: '#e63946', marginBottom: '28px' }} />
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#374151', marginBottom: '16px' }}>
        NewsPulse PRO is a premium global news aggregation platform delivering real-time news from Nigeria, Africa, and the world. We aggregate from 80+ trusted sources across 13 regions and categories, updating every 10 minutes.
      </p>
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#374151', marginBottom: '16px' }}>
        Our mission: editorial authority for the modern web. We combine world-class journalism aggregation with AI-powered summaries so you never miss what matters.
      </p>
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#374151', marginBottom: '16px' }}>
        Our platform delivers news across{' '}
        <strong>Nigeria, Africa, World, Business, Technology, Sports, Politics, Entertainment, Health, Science, Americas, Europe, Middle East, and Asia Pacific</strong>.
      </p>
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#374151' }}>
        Based in Port Harcourt, Nigeria. Serving readers across Nigeria, Africa, and globally.
      </p>
      <div style={{ marginTop: '40px', paddingTop: '28px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '24px' }}>
        <Link href="/contact" style={{ color: '#e63946', fontWeight: 700, fontSize: '14px' }}>Contact Us →</Link>
        <Link href="/" style={{ color: '#6b7280', fontSize: '14px' }}>Back to Home</Link>
      </div>
    </div>
  )
}
