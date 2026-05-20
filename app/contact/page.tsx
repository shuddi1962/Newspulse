import Link from 'next/link'

export default function ContactPage() {
  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 20px' }}>
      <Link href="/" style={{ fontSize: '24px', fontWeight: 700, color: '#0f1419', fontFamily: 'Georgia, serif', textDecoration: 'none', display: 'inline-block', marginBottom: '40px' }}>
        NewsPulse<span style={{ color: '#e63946' }}>PRO</span>
      </Link>
      <h1 style={{ fontSize: '36px', fontWeight: 700, color: '#0f1419', fontFamily: 'Georgia, serif', marginBottom: '20px' }}>Contact Us</h1>
      <div style={{ width: '48px', height: '3px', background: '#e63946', marginBottom: '28px' }} />
      <p style={{ fontSize: '16px', lineHeight: 1.8, color: '#374151', marginBottom: '32px' }}>
        Have a news tip, feedback, or want to advertise with us? Get in touch.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ padding: '20px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f1419', marginBottom: '6px' }}>Email</h3>
          <p style={{ fontSize: '14px', color: '#e63946' }}>goodnewsonyematara2020@gmail.com</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f1419', marginBottom: '6px' }}>Location</h3>
          <p style={{ fontSize: '14px', color: '#374151' }}>Port Harcourt, Nigeria</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f1419', marginBottom: '6px' }}>Advertising</h3>
          <p style={{ fontSize: '14px', color: '#374151' }}>Interested in advertising on NewsPulse PRO? Visit our{' '}
            <Link href="/advertise" style={{ color: '#e63946', fontWeight: 600 }}>Advertise page</Link>.
          </p>
        </div>
      </div>
      <div style={{ marginTop: '40px' }}>
        <Link href="/about" style={{ color: '#6b7280', fontSize: '14px' }}>← About Us</Link>
      </div>
    </div>
  )
}
