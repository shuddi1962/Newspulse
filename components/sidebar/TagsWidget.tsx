interface TagsWidgetProps {
  tags: string[];
}

export function TagsWidget({ tags }: TagsWidgetProps) {
  return (
    <div>
      <h3 className="mb-4 border-l-1 border-[#dc2626] pl-3 text-xs font-black uppercase tracking-widest text-[#0f1419]">
        Popular Tags
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="cursor-pointer border border-[#e5e7eb] bg-gray-100 px-3 py-1.5 text-[11px] text-[#6b7280] transition-colors hover:border-[#0f1419] hover:bg-[#0f1419] hover:text-white"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
