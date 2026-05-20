import Link from 'next/link'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  className?: string
  viewAllHref?: string
  tabs?: { label: string; value: string }[]
  activeTab?: string
  onTabChange?: (v: string) => void
  live?: boolean
}

export function SectionHeading({ title, subtitle, className = '', viewAllHref, tabs, activeTab, onTabChange, live }: SectionHeadingProps) {
  if (tabs || viewAllHref || live) {
    return (
      <div className={`flex items-center justify-between mb-5 pb-3 border-b-2 border-[#0f1419] ${className}`}>
        <div className="flex items-center gap-3">
          <h2 className="flex items-center gap-2 text-[15px] font-black uppercase tracking-[0.06em] text-[#0f1419] font-instrument">
            <span className="w-1 h-[20px] bg-crimson inline-block flex-shrink-0" style={{ backgroundColor: '#e63946' }} />
            {title}
          </h2>
          {live && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#e63946] uppercase tracking-wider">
              <span className="live-dot" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tabs && (
            <div className="flex gap-0 border border-[#e5e7eb]">
              {tabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => onTabChange?.(tab.value)}
                  className={`text-[10px] font-bold uppercase tracking-wider px-3 py-[5px] transition-all ${
                    activeTab === tab.value
                      ? 'bg-[#0f1419] text-white'
                      : 'text-[#6b7280] hover:bg-[#f8f9fa] hover:text-[#0f1419]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-[10px] font-black uppercase tracking-wider text-[#e63946] hover:text-[#c1121f] transition-colors"
            >
              View All →
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`mb-5 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-5 w-0.5 bg-[#dc2626]" />
        <h2 className="font-display text-lg font-semibold tracking-tight text-(--fg-default) sm:text-xl">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-1 pl-3.5 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  )
}
