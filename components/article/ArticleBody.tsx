type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'blockquote'; text: string; cite?: string }
  | { type: 'ad' };

interface ArticleBodyProps {
  content: ContentBlock[];
}

export function ArticleBody({ content }: ArticleBodyProps) {
  let paragraphCount = 0;

  return (
    <div className="mb-7">
      {content.map((block, i) => {
        if (block.type === 'paragraph') {
          paragraphCount++;
          return (
            <div key={i}>
              <p className="mb-[18px] text-[16px] leading-[1.8] text-[#374151]">
                {block.text}
              </p>
              {paragraphCount === 3 && (
                <div className="my-6 border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                  <span className="text-[11px] text-gray-400">Advertisement</span>
                  <p className="mt-1 text-[12px] font-bold text-gray-500">
                    728 &times; 90 &middot; Sponsored Content
                  </p>
                </div>
              )}
            </div>
          );
        }

        if (block.type === 'h2') {
          return (
            <h2 key={i} className="mb-3 mt-7 font-display text-[22px] font-bold text-[#0f1419]">
              {block.text}
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={i} className="mb-[10px] mt-6 font-display text-[18px] font-bold text-[#0f1419]">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={i}
              className="mx-0 my-6 border-l-4 border-[#e63946] bg-[#fef2f2] px-5 py-4"
            >
              <p className="text-[18px] italic leading-[1.6] text-[#0f1419]">
                {block.text}
              </p>
              {block.cite && (
                <cite className="mt-2 block text-[13px] not-italic text-[#6b7280]">
                  {block.cite}
                </cite>
              )}
            </blockquote>
          );
        }

        return null;
      })}
    </div>
  );
}
