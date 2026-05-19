import { Share2 } from 'lucide-react';
import { CategoryTag } from '@/components/ui/CategoryTag';

interface ArticleAuthor {
  name: string;
  initials: string;
  role: string;
}

interface ArticleHeaderProps {
  category: string;
  title: string;
  subtitle?: string;
  author: ArticleAuthor;
  date: string;
  reads: string;
  readTime: string;
}

export function ArticleHeader({
  category,
  title,
  subtitle,
  author,
  date,
  reads,
  readTime,
}: ArticleHeaderProps) {
  return (
    <div>
      <CategoryTag label={category} />

      <h1 className="mt-3 font-display text-[24px] font-bold leading-[1.25] text-[#0f1419] sm:text-[30px]">
        {title}
      </h1>

      {subtitle && (
        <p className="mb-[18px] font-display text-[14px] italic leading-[1.6] text-[#6b7280] sm:text-[16px]">
          {subtitle}
        </p>
      )}

      {/* Meta Bar */}
      <div className="flex flex-col justify-between border-y border-[#e5e7eb] py-[14px] sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#0f1419] text-[14px] font-bold text-white">
            {author.initials}
          </div>
          <div>
            <p className="text-[13px] font-bold text-[#0f1419]">{author.name}</p>
            <p className="text-[11px] text-[#6b7280]">{author.role}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[12px] text-[#6b7280] sm:mt-0">
          <time>{date}</time>
          <span>{reads} reads</span>
          <span>{readTime}</span>
        </div>
      </div>

      {/* Share Bar */}
      <div className="mb-[22px] mt-4 flex items-center gap-[6px]">
        <span className="mr-2 text-[10px] font-black uppercase tracking-wider text-[#6b7280]">
          Share:
        </span>
        <button className="flex items-center gap-1.5 bg-[#1877f2] px-[14px] py-[6px] text-[10px] font-semibold text-white transition-opacity hover:opacity-90">
          f Facebook
        </button>
        <button className="flex items-center gap-1.5 bg-[#1da1f2] px-[14px] py-[6px] text-[10px] font-semibold text-white transition-opacity hover:opacity-90">
          X
        </button>
        <button className="flex items-center gap-1.5 border border-[#e5e7eb] px-[14px] py-[6px] text-[10px] font-semibold text-[#6b7280] transition-colors hover:bg-gray-100">
          <Share2 className="h-3 w-3" /> Copy Link
        </button>
      </div>
    </div>
  );
}
