interface TagsWidgetProps {
  tags: string[];
}

export function TagsWidget({ tags }: TagsWidgetProps) {
  return (
    <div>
      <h3 className="mb-[14px] border-l-[3px] border-[#e63946] pl-[10px] text-[12px] font-black uppercase tracking-widest text-[#0f1419]">
        Popular Tags
      </h3>
      <div className="flex flex-wrap gap-[6px]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="cursor-pointer border border-[#e5e7eb] bg-gray-100 px-[10px] py-[5px] text-[10px] text-[#6b7280] transition-colors hover:border-[#0f1419] hover:bg-[#0f1419] hover:text-white"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
