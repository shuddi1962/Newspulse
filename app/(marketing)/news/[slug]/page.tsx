import { ArticleHeader } from '@/components/article/ArticleHeader';
import { ArticleBody } from '@/components/article/ArticleBody';
import { AuthorBio } from '@/components/article/AuthorBio';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { CommentsSection } from '@/components/article/CommentsSection';
import { TrendingWidget } from '@/components/sidebar/TrendingWidget';
import { AdBannerWidget } from '@/components/sidebar/AdBannerWidget';
import { MoreInCategoryWidget } from '@/components/sidebar/MoreInCategoryWidget';
import { NewsletterWidget } from '@/components/sidebar/NewsletterWidget';
import { TagsWidget } from '@/components/sidebar/TagsWidget';
import { db } from '@/lib/insforge'
import { formatFullDate } from '@/lib/format-date'
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

type Params = { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const article = await db.articles.get(slug)
    return {
      title: `${article.headline} | NewsPulse PRO`,
      description: article.excerpt,
      openGraph: {
        title: article.headline,
        description: article.excerpt,
        images: article.image_url ? [{ url: article.image_url }] : [],
      },
    }
  } catch {
    return { title: 'Article | NewsPulse PRO' }
  }
}

const trendingItems = [
  { title: 'Dangote Refinery Now Supplying Jet Fuel to Five African Airports', category: 'Business', reads: '3.2K' },
  { title: 'Super Eagles Squad Named For AFCON Qualifiers, Lookman Leads Attack', category: 'Sports', reads: '4.8K' },
  { title: 'CBN Raises Interest Rates to 27% Amid Persistent Inflation Pressures', category: 'Finance', reads: '2.1K' },
  { title: 'Netflix Orders First Nigerian Original Series With $40M Production Budget', category: 'Entertainment', reads: '6.7K' },
  { title: "Elon Musk's Starlink Expands Nigeria Coverage to 200 New LGAs", category: 'Tech', reads: '3.9K' },
];

const moreCategoryArticles = [
  {
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=100&h=70&fit=crop',
    title: 'UN Emergency Session Over Eastern Europe Crisis Turns Confrontational',
    date: 'May 18',
    slug: 'un-emergency-session',
  },
  {
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=100&h=70&fit=crop',
    title: 'WHO Mobilizes Emergency Medical Teams for Conflict Zone Hospitals',
    date: 'May 17',
    slug: 'who-emergency-teams',
  },
  {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=100&h=70&fit=crop',
    title: 'African Union Pledges $500M for Continental Peace Fund Initiative',
    date: 'May 16',
    slug: 'african-union-peace-fund',
  },
];

const relatedArticles = [
  {
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=300&h=180&fit=crop',
    category: 'World',
    title: 'UN Security Council Calls Emergency Session Over Eastern Europe Crisis',
    date: 'May 18',
    reads: '1.8K',
    slug: 'un-security-council-emergency-session',
  },
  {
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=180&fit=crop',
    category: 'Health',
    title: 'WHO Mobilizes Emergency Medical Teams for Conflict Zone Field Hospitals',
    date: 'May 17',
    reads: '2.3K',
    slug: 'who-emergency-medical-teams',
  },
  {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=180&fit=crop',
    category: 'Opinion',
    title: 'Why Africa Must Lead the Next Chapter of Humanitarian Diplomacy',
    date: 'May 16',
    reads: '4.1K',
    slug: 'africa-humanitarian-diplomacy',
  },
];

const mockComments = [
  {
    initials: 'CK',
    color: '#0891b2',
    name: 'Chukwuemeka K.',
    time: 'May 19, 2026 - 08:42',
    text: "The Lagos rally numbers are historic. We rarely see this level of civic engagement around international issues here. This shows that ordinary Nigerians understand how interconnected global stability is with our own prosperity.",
  },
  {
    initials: 'FA',
    color: '#7c3aed',
    name: 'Fatima A.',
    time: 'May 19, 2026 - 10:15',
    text: "I was at the Ojota rally. The atmosphere was incredible -- people from all walks of life, all ages. The UN's OCHA projection is chilling. 340 million people cannot afford for governments to play budget politics with their survival.",
  },
  {
    initials: 'MO',
    color: '#dc2626',
    name: 'Marcus O.',
    time: 'May 19, 2026 - 11:33',
    text: "Good article but I'd like to see more coverage of the counter-arguments -- there are genuine domestic fiscal constraints at play. A nuanced analysis of the tradeoffs would strengthen this piece considerably.",
  },
];

const FALLBACK = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop'

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params

  // Try to load from DB, fall back to mock
  let article: Awaited<ReturnType<typeof db.articles.get>> | null = null
  let fromDb = false
  try {
    article = await db.articles.get(slug)
    fromDb = true
  } catch {
    // Will use mock fallback below
  }

  if (!article) {
    article = {
      id: 'mock',
      slug: 'demonstrators-call-world-leaders-humanitarian-aid',
      headline: 'Demonstrators Call On World Leaders To Continue Supporting Humanitarian Aid Across War Zones In Eastern Europe',
      original_title: '',
      content: "Tens of thousands of protesters flooded city centers from London and Berlin to Lagos and Sao Paulo over the weekend, forming one of the most geographically dispersed displays of solidarity in recent memory. The demonstrations, organized by a coalition of NGOs and grassroots advocacy groups, were timed to coincide with the G20 foreign aid review summit in Brussels.\n\nOrganizers say governments are under mounting pressure to redirect foreign aid budgets inward, driven by domestic inflation concerns and rising unemployment in several major economies. The crowds demanded that world leaders reaffirm commitments made under the 2024 Humanitarian Compact, which pledged $80 billion annually toward conflict-zone relief through 2030.\n\n\"No government can claim moral leadership while abandoning the most vulnerable people on earth to save a fraction of their national budget. This is a moment that defines who we are as a civilization,\" said Dr. Amara Diallo, Director of the Global Relief Alliance.\n\nCrowd estimates varied widely by city. London's Metropolitan Police reported approximately 85,000 participants along the Embankment route, while Berlin's Senate Administration cited 120,000 at the Brandenburg Gate. In Lagos, the Ojota rally drew an estimated 40,000, making it the largest humanitarian protest in Nigeria's history according to local civil society organizations.\n\nThe demonstrations drew measured responses from several heads of state. The UK's Prime Minister reaffirmed a commitment to maintaining 0.5% of gross national income in overseas aid, while Germany's Chancellor signaled a potential 12% reduction to the country's international development fund as part of broader fiscal consolidation measures.",
      excerpt: 'Thousands gathered in capital cities across three continents, demanding governments maintain foreign aid commitments despite domestic economic pressures.',
      image_url: FALLBACK,
      image_alt: 'Demonstrators gathered in central London demanding continued government support',
      category: 'World',
      region: 'world',
      source_name: 'NewsPulse PRO',
      source_url: '',
      tags: ['Humanitarian Aid', 'Protests', 'G20', 'Europe', 'Nigeria', 'UN', 'Foreign Policy'],
      is_breaking: true,
      is_featured: false,
      status: 'published',
      views: 2431,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    } as any
  }

  const date = fromDb ? formatFullDate(article.published_at) : 'May 19, 2026'
  const tags = article.tags || []

  return (
    <main className="w-full px-4 py-8 md:px-8 lg:px-12">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        <article>
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-[#6b7280]">
            <Link href="/" className="text-[#dc2626] hover:underline">Home</Link>
            <span className="text-[#e5e7eb]">/</span>
            <Link href={`/${article.category.toLowerCase()}`} prefetch={false} className="hover:text-[#dc2626]">{article.category}</Link>
            <span className="text-[#e5e7eb]">/</span>
            <span className="text-[#6b7280]">{article.headline.slice(0, 40)}...</span>
          </nav>

          <ArticleHeader
            category={article.category}
            title={article.headline}
            subtitle={article.excerpt}
            author={{ name: 'NewsPulse PRO', initials: 'NP', role: 'Staff Writer', bio: 'NewsPulse PRO editorial team' }}
            date={date}
            reads={String(article.views)}
            readTime={`${Math.max(1, Math.ceil(article.content.length / 1000))} min read`}
          />

          <div className="mb-2 overflow-hidden">
            <div className="relative h-[320px] sm:h-[420px]">
              <Image
                src={article.image_url || FALLBACK}
                alt={article.image_alt || article.headline}
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          <div className="article-prose">
            {article.content.split('\n\n').filter(Boolean).map((p: string, i: number) => (
              <p key={i} className="mb-4 leading-relaxed text-[#374151]">{p}</p>
            ))}
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-2 border-y border-[#e5e7eb] py-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6b7280]">Tags:</span>
            {tags.map((tag: string) => (
              <span key={tag} className="cursor-pointer border border-[#e5e7eb] bg-gray-100 px-3 py-1.5 text-[11px] text-[#6b7280] transition-colors hover:border-[#0f1419] hover:bg-[#0f1419] hover:text-white">
                {tag}
              </span>
            ))}
          </div>

          <AuthorBio author={{ name: 'NewsPulse PRO', initials: 'NP', role: 'Staff Writer', bio: 'NewsPulse PRO editorial team. Reporting the stories that matter.' }} />
          <RelatedArticles articles={relatedArticles} />
          <CommentsSection comments={mockComments} />
        </article>

        <aside className="sticky top-4 hidden flex-col gap-6 lg:flex">
          <TrendingWidget items={trendingItems} />
          <AdBannerWidget />
          <MoreInCategoryWidget title={`More in ${article.category}`} articles={moreCategoryArticles} />
          <NewsletterWidget />
          <TagsWidget tags={tags.slice(0, 8)} />
        </aside>
      </div>
    </main>
  );
}
