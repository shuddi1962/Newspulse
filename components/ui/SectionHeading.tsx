'use client';

import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  title: string;
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  className?: string;
}

export function SectionHeading({
  title,
  tabs,
  activeTab,
  onTabChange,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('mb-[18px] border-b-2 border-[#0f1419] pb-[10px]', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-[22px] w-[4px] bg-[#e63946]" />
          <h2 className="text-[15px] font-black uppercase tracking-widest text-[#0f1419]">
            {title}
          </h2>
        </div>
        {tabs && tabs.length > 0 && (
          <div className="hidden items-center gap-[6px] sm:flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange?.(tab)}
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider px-3 py-1 border border-[#e5e7eb] transition-colors cursor-pointer',
                  activeTab === tab
                    ? 'bg-[#0f1419] text-white border-[#0f1419]'
                    : 'text-[#6b7280] hover:bg-[#0f1419] hover:text-white hover:border-[#0f1419]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
