interface AdBannerProps {
  size?: 'leaderboard' | 'rectangle' | 'wide';
  className?: string;
}

export function AdBanner({ size = 'leaderboard', className = '' }: AdBannerProps) {
  const heights = {
    leaderboard: 'h-[90px] md:h-[100px]',
    rectangle: 'h-[250px]',
    wide: 'h-[120px] md:h-[150px]',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${heights[size]} border border-gray-200 bg-gray-50 ${className}`}>
      <span className="text-[10px] uppercase tracking-widest text-gray-400">Advertisement</span>
      <span className="mt-1 text-[11px] text-gray-300">
        {size === 'leaderboard' ? '728 × 90' : size === 'rectangle' ? '300 × 250' : '728 × 150'}
      </span>
    </div>
  );
}
