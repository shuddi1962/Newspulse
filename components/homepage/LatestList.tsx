import { SectionHeading } from '@/components/ui/SectionHeading';
import { ListArticle } from '@/components/ui/ListArticle';

interface LatestListProps {
  articles: {
    image: string;
    category: string;
    title: string;
    author: string;
    date: string;
    reads: string;
    slug: string;
  }[];
  className?: string;
}

export function LatestList({ articles, className }: LatestListProps) {
  return (
    <section className={className}>
      <SectionHeading title="Latest Stories" subtitle="Recent news and updates" />
      <div>
        {articles.map((article) => (
          <ListArticle key={article.slug} {...article} />
        ))}
      </div>
    </section>
  );
}
