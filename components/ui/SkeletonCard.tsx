export function SkeletonCard() {
  return (
    <div className="news-card">
      <div className="skeleton h-[180px] mb-3" />
      <div className="skeleton h-3 w-16 mb-2" />
      <div className="skeleton h-4 w-full mb-1" />
      <div className="skeleton h-4 w-3/4 mb-3" />
      <div className="skeleton h-3 w-1/3" />
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="skeleton w-full h-[420px]" />
  )
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
