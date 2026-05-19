interface TrendingItem {
  title: string;
  category: string;
  reads: string;
}

interface TrendingWidgetProps {
  items: TrendingItem[];
}

export function TrendingWidget({ items }: TrendingWidgetProps) {
  return (
    <div>
      <h3 className="mb-4 border-l-1 border-[#e63946] pl-3 text-xs font-black uppercase tracking-widest text-[#0f1419]">
        Trending Now
      </h3>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex cursor-pointer gap-3 border-b border-[#e5e7eb] py-3 group"
        >
          <span className="min-w-[28px] text-xl font-black text-[#e5e7eb] transition-colors group-hover:text-[#e63946]">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h4 className="text-sm font-bold text-[#1a202c] transition-colors group-hover:text-[#e63946]">
              {item.title}
            </h4>
            <p className="mt-1 text-[11px] text-[#6b7280]">
              {item.category} &middot; {item.reads} reads
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
