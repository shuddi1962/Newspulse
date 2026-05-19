import { SectionHeading } from '@/components/ui/SectionHeading';
import { ArticleCard } from '@/components/ui/ArticleCard';

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  articles: {
    image: string;
    category: string;
    categoryColor?: string;
    title: string;
    author: string;
    authorInitial: string;
    authorColor?: string;
    date: string;
    slug: string;
  }[];
  className?: string;
}

export function CategorySection({ title, subtitle, articles, className }: CategorySectionProps) {
  return (
    <section className={className}>
      <SectionHeading title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} {...article} />
        ))}
      </div>
    </section>
  );
}
