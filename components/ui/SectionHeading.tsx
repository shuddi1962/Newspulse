import Link from 'next/link'

interface Props {
  title: string
  viewAllHref?: string
}

function SectionHeading({ title, viewAllHref }: Props) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '2px solid #0f1419', paddingBottom: '8px', marginBottom: '16px'
    }}>
      <h2 style={{
        fontSize: '16px', fontWeight: 700, color: '#0f1419',
        fontFamily: 'Georgia, serif'
      }}>
        {title}
      </h2>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          style={{
            fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: '#e63946', textDecoration: 'none'
          }}
        >
          View All →
        </Link>
      )}
    </div>
  )
}

export { SectionHeading }
export default SectionHeading
