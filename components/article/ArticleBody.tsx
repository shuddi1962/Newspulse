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
    <div className="mb-8">
      {content.map((block, i) => {
        if (block.type === 'paragraph') {
          paragraphCount++;
          return (
            <div key={i}>
              <p className="mb-5 text-base leading-[1.85] text-[#374151] sm:text-[17px]">
                {block.text}
              </p>
              {paragraphCount === 3 && (
                <div className="my-8 border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                  <span className="text-xs text-gray-400">Advertisement</span>
                  <p className="mt-1.5 text-sm font-bold text-gray-500">
                    728 &times; 90 &middot; Sponsored Content
                  </p>
                </div>
              )}
            </div>
          );
        }

        if (block.type === 'h2') {
          return (
            <h2 key={i} className="mb-3 mt-8 font-display text-xl font-bold text-[#0f1419] sm:text-[22px]">
              {block.text}
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3 key={i} className="mb-3 mt-7 font-display text-lg font-bold text-[#0f1419] sm:text-[18px]">
              {block.text}
            </h3>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={i}
              className="mx-0 my-7 border-l-4 border-[#dc2626] bg-[#fef2f2] px-6 py-5"
            >
              <p className="text-lg italic leading-[1.6] text-[#0f1419] sm:text-xl">
                {block.text}
              </p>
              {block.cite && (
                <cite className="mt-3 block text-sm not-italic text-[#6b7280]">
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
