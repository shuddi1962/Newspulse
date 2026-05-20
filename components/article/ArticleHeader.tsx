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

      <h1 className="mt-4 font-display text-2xl font-bold leading-[1.25] text-(--fg-default) sm:text-3xl lg:text-[32px]">
        {title}
      </h1>

      {subtitle && (
        <p className="mb-5 font-display text-base italic leading-[1.6] text-[#6b7280] sm:text-lg">
          {subtitle}
        </p>
      )}

      {/* Meta Bar */}
      <div className="flex flex-col justify-between border-y border-[#e5e7eb] py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0f1419] text-sm font-bold text-white">
            {author.initials}
          </div>
          <div>
            <p className="text-sm font-bold text-(--fg-default)">{author.name}</p>
            <p className="text-[11px] text-[#6b7280]">{author.role}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-4 text-sm text-[#6b7280] sm:mt-0">
          <time>{date}</time>
          <span>{reads} reads</span>
          <span>{readTime}</span>
        </div>
      </div>

      {/* Share Bar */}
      <div className="mb-6 mt-5 flex items-center gap-1.5">
        <span className="mr-2 text-[10px] font-black uppercase tracking-wider text-[#6b7280]">
          Share:
        </span>
        <button className="flex items-center gap-1.5 bg-[#1877f2] px-4 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90">
          f Facebook
        </button>
        <button className="flex items-center gap-1.5 bg-[#1da1f2] px-4 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90">
          X
        </button>
        <button className="flex items-center gap-1.5 border border-[#e5e7eb] px-4 py-1.5 text-[11px] font-semibold text-[#6b7280] transition-colors hover:bg-gray-100">
          <Share2 className="h-3 w-3" /> Copy Link
        </button>
      </div>
    </div>
  );
}
