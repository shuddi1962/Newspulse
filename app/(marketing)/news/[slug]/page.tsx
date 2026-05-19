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
import Image from 'next/image';
import Link from 'next/link';

const mockArticle = {
  slug: 'demonstrators-call-world-leaders-humanitarian-aid',
  category: 'World',
  title: 'Demonstrators Call On World Leaders To Continue Supporting Humanitarian Aid Across War Zones In Eastern Europe',
  subtitle: 'Thousands gathered in capital cities across three continents, demanding governments maintain foreign aid commitments despite domestic economic pressures.',
  heroImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop',
  author: {
    name: 'James Adeyemi',
    initials: 'JA',
    role: 'Senior World Correspondent',
    bio: "James covers international affairs, geopolitics, and humanitarian crises from NewsPulse PRO's Lagos bureau. He has reported from 22 countries across four continents. Previously with Reuters and BBC Africa.",
  },
  date: 'May 19, 2026',
  reads: '2,431',
  readTime: '6 min read',
  tags: ['Humanitarian Aid', 'Protests', 'G20', 'Europe', 'Nigeria', 'UN', 'Foreign Policy'],
  content: [
    { type: 'paragraph', text: 'Tens of thousands of protesters flooded city centers from London and Berlin to Lagos and Sao Paulo over the weekend, forming one of the most geographically dispersed displays of solidarity in recent memory. The demonstrations, organized by a coalition of NGOs and grassroots advocacy groups, were timed to coincide with the G20 foreign aid review summit in Brussels.' },
    { type: 'paragraph', text: 'Organizers say governments are under mounting pressure to redirect foreign aid budgets inward, driven by domestic inflation concerns and rising unemployment in several major economies. The crowds demanded that world leaders reaffirm commitments made under the 2024 Humanitarian Compact, which pledged $80 billion annually toward conflict-zone relief through 2030.' },
    { type: 'blockquote', text: 'No government can claim moral leadership while abandoning the most vulnerable people on earth to save a fraction of their national budget. This is a moment that defines who we are as a civilization.', cite: 'Dr. Amara Diallo, Director, Global Relief Alliance' },
    { type: 'h2', text: 'The Scale of the Protests' },
    { type: 'paragraph', text: "Crowd estimates varied widely by city. London's Metropolitan Police reported approximately 85,000 participants along the Embankment route, while Berlin's Senate Administration cited 120,000 at the Brandenburg Gate. In Lagos, the Ojota rally drew an estimated 40,000, making it the largest humanitarian protest in Nigeria's history according to local civil society organizations." },
    { type: 'paragraph', text: "The Lagos gathering was particularly significant given Nigeria's role as both an aid recipient and emerging donor nation -- a duality that organizers said underscored the complexity of the global aid architecture. Representatives from ECOWAS attended as observers." },
    { type: 'ad' },
    { type: 'h2', text: 'Government Responses' },
    { type: 'paragraph', text: "The demonstrations drew measured responses from several heads of state. The UK's Prime Minister reaffirmed a commitment to maintaining 0.5% of gross national income in overseas aid, while Germany's Chancellor signaled a potential 12% reduction to the country's international development fund as part of broader fiscal consolidation measures." },
    { type: 'h3', text: "What's at Stake in Brussels" },
    { type: 'paragraph', text: 'The G20 foreign aid review, which concludes on Friday, is expected to produce a communique on baseline commitments for the next three years. Aid organizations warn that any reduction in pledges could leave an estimated 340 million people in active conflict zones without access to basic food, medical, and shelter programs currently funded by multinational donors.' },
    { type: 'paragraph', text: 'The United Nations Office for the Coordination of Humanitarian Affairs (OCHA) published a stark assessment Monday morning, projecting that a 20% reduction in multilateral aid flows would produce catastrophic and irreversible humanitarian deterioration across 14 active conflict zones within 18 months.' },
  ],
};

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
    categoryColor: '#059669',
    title: 'WHO Mobilizes Emergency Medical Teams for Conflict Zone Field Hospitals',
    date: 'May 17',
    reads: '2.3K',
    slug: 'who-emergency-medical-teams',
  },
  {
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=180&fit=crop',
    category: 'Opinion',
    categoryColor: '#7c3aed',
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

export default function BlogPostPage() {
  return (
    <main className="w-full px-4 py-8 md:px-8 lg:px-12">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_320px]">
        {/* Left: Article */}
        <article>
          {/* Breadcrumb */}
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-[#6b7280]">
            <Link href="/" className="text-[#e63946] hover:underline">
              Home
            </Link>
            <span className="text-[#e5e7eb]">/</span>
            <Link href="/news" className="hover:text-[#e63946]">
              World
            </Link>
            <span className="text-[#e5e7eb]">/</span>
            <span className="text-[#6b7280]">Demonstrators Call On World Leaders...</span>
          </nav>

          <ArticleHeader
            category={mockArticle.category}
            title={mockArticle.title}
            subtitle={mockArticle.subtitle}
            author={mockArticle.author}
            date={mockArticle.date}
            reads={mockArticle.reads}
            readTime={mockArticle.readTime}
          />

          {/* Hero Image */}
          <div className="mb-2 overflow-hidden">
            <div className="relative h-[320px] sm:h-[420px]">
              <Image
                src={mockArticle.heroImage}
                alt={mockArticle.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            <p className="border-b border-[#e5e7eb] py-1.5 text-xs italic text-[#6b7280]">
              Demonstrators gathered in central London&apos;s Trafalgar Square on Sunday demanding continued government support. Photo: Reuters / AP
            </p>
          </div>

          <ArticleBody content={mockArticle.content as ArticleBody['content']} />

          {/* Tags */}
          <div className="mb-8 flex flex-wrap items-center gap-2 border-y border-[#e5e7eb] py-4">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#6b7280]">
              Tags:
            </span>
            {mockArticle.tags.map((tag) => (
              <span
                key={tag}
                className="cursor-pointer border border-[#e5e7eb] bg-gray-100 px-3 py-1.5 text-[11px] text-[#6b7280] transition-colors hover:border-[#0f1419] hover:bg-[#0f1419] hover:text-white"
              >
                {tag}
              </span>
            ))}
          </div>

          <AuthorBio author={mockArticle.author} />
          <RelatedArticles articles={relatedArticles} />
          <CommentsSection comments={mockComments} />
        </article>

        {/* Right: Sidebar */}
        <aside className="sticky top-4 hidden flex-col gap-6 lg:flex">
          <TrendingWidget items={trendingItems} />
          <AdBannerWidget />
          <MoreInCategoryWidget title="More in World" articles={moreCategoryArticles} />
          <NewsletterWidget />
          <TagsWidget tags={['G20', 'Aid', 'Protests', 'UN', 'Europe', 'Nigeria', 'Africa', 'Diplomacy']} />
        </aside>
      </div>
    </main>
  );
}

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'blockquote'; text: string; cite?: string }
  | { type: 'ad' };

interface ArticleBody {
  content: ContentBlock[];
}
