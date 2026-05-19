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
      <h3 className="mb-[14px] border-l-[3px] border-[#e63946] pl-[10px] text-[12px] font-black uppercase tracking-widest text-[#0f1419]">
        Trending Now
      </h3>
      {items.map((item, i) => (
        <div
          key={i}
          className="flex cursor-pointer gap-[10px] border-b border-[#e5e7eb] py-[10px] group"
        >
          <span className="min-w-[28px] text-[20px] font-black text-[#e5e7eb] transition-colors group-hover:text-[#e63946]">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <h4 className="text-[12px] font-bold text-[#1a202c] transition-colors group-hover:text-[#e63946]">
              {item.title}
            </h4>
            <p className="mt-0.5 text-[10px] text-[#6b7280]">
              {item.category} &middot; {item.reads} reads
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
