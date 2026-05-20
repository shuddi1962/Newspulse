const CAT_COLORS: Record<string, string> = {
  Nigeria: '#e63946', Africa: '#16a34a', World: '#0f1419',
  Business: '#2563eb', Technology: '#7c3aed', Sports: '#059669',
  Politics: '#dc2626', Entertainment: '#d97706', Health: '#0891b2',
  Science: '#0f766e', Americas: '#1d4ed8', Europe: '#4338ca',
  'Middle East': '#b45309', Asia: '#0369a1',
}

export default function CategoryBadge({ category, className = '' }: { category: string; className?: string }) {
  const bg = CAT_COLORS[category] || '#e63946'
  return (
    <span
      className={`inline-block text-white text-[9px] font-black uppercase tracking-[0.12em] px-[8px] py-[3px] ${className}`}
      style={{ backgroundColor: bg }}
    >
      {category}
    </span>
  )
}
