import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { HeroGrid } from '@/components/homepage/HeroGrid';
import { CategorySection } from '@/components/homepage/CategorySection';
import { LatestList } from '@/components/homepage/LatestList';
import { TrendingWidget } from '@/components/sidebar/TrendingWidget';
import { NewsletterWidget } from '@/components/sidebar/NewsletterWidget';
import { AdBannerWidget } from '@/components/sidebar/AdBannerWidget';
import { TagsWidget } from '@/components/sidebar/TagsWidget';

const heroArticles = {
  main: {
    image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&h=450&fit=crop',
    category: 'World',
    title: 'Demonstrators Call On World Leaders To Continue Supporting Humanitarian Aid Across War Zones In Eastern Europe',
    author: 'Admin',
    date: 'May 19, 2026',
    reads: '2.4K',
    slug: 'demonstrators-call-world-leaders-humanitarian-aid',
  },
  topRight: {
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=500&h=200&fit=crop',
    category: 'Technology',
    title: "Apple's AI-Powered iPhone 17 to Feature Real-Time Translation for 60 Languages",
    date: 'May 18, 2026',
    slug: 'apple-iphone-17-ai-translation',
  },
  bottomLeft: {
    image: 'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=300&h=200&fit=crop',
    category: 'Business',
    title: "Dwayne Johnson's Apartment Listed for Three Nights in Beverly Hills",
    slug: 'dwayne-johnson-apartment-listed',
  },
  bottomRight: {
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=200&fit=crop',
    category: 'Health',
    title: 'You Need to Figure Out How Much This Will Make You Healthier',
    slug: 'health-impact-study',
  },
};

const softwareArticles = [
  {
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop',
    category: 'Tech',
    title: "Airbnb Will Rent Carrie Bradshaw's Apartment for Two Nights From A Latin American",
    author: 'Admin',
    authorInitial: 'A',
    date: 'May 14',
    slug: 'airbnb-carrie-bradshaw-apartment',
  },
  {
    image: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?w=300&h=200&fit=crop',
    category: 'Finance',
    categoryColor: '#2563eb',
    title: 'How To Find Funding In Latin America, From a Latin American Perspective',
    author: 'Michael',
    authorInitial: 'M',
    authorColor: '#2563eb',
    date: 'May 13',
    slug: 'funding-latin-america',
  },
  {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop',
    category: 'Economy',
    categoryColor: '#059669',
    title: 'World Economy: Another Chinese Real Estate Developer Is In Serious Trouble',
    author: 'Sarah',
    authorInitial: 'S',
    authorColor: '#059669',
    date: 'May 12',
    slug: 'chinese-real-estate-developer-trouble',
  },
  {
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&h=200&fit=crop',
    category: 'Legal',
    categoryColor: '#7c3aed',
    title: 'Judge Rules Against Blue Origin in Standoff with SpaceX, NASA Court Decision',
    author: 'Reporter',
    authorInitial: 'R',
    authorColor: '#7c3aed',
    date: 'May 11',
    slug: 'blue-origin-spacex-nasa-ruling',
  },
];

const businessArticles = [
  {
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&h=200&fit=crop',
    category: 'Finance',
    title: 'Benin And Senegal Experience Highest Growth In African Fintech Markets Q1 2026',
    author: 'Admin',
    authorInitial: 'A',
    date: 'May 10',
    slug: 'africa-fintech-growth-q1-2026',
  },
  {
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop',
    category: 'Investment',
    categoryColor: '#2563eb',
    title: "Latin America's Hendel Secures $38 Million Series B For Expansion",
    author: 'James',
    authorInitial: 'J',
    authorColor: '#2563eb',
    date: 'May 9',
    slug: 'hendel-38m-series-b',
  },
  {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop',
    category: 'Energy',
    categoryColor: '#dc2626',
    title: 'Dangote Oil Refinery Begins Exporting Premium Products Across West African Markets',
    author: 'Kemi',
    authorInitial: 'K',
    authorColor: '#dc2626',
    date: 'May 8',
    slug: 'dangote-refinery-exports-west-africa',
  },
  {
    image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=300&h=200&fit=crop',
    category: 'Tech',
    categoryColor: '#0891b2',
    title: 'Nigerian Startups Dominate African Tech Week, Raising $340M In New Investments',
    author: 'Lola',
    authorInitial: 'L',
    authorColor: '#0891b2',
    date: 'May 7',
    slug: 'nigerian-startups-340m-african-tech-week',
  },
];

const latestArticles = [
  {
    image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=120&h=80&fit=crop',
    category: 'Politics',
    title: "Nigeria's Senate Passes New Electoral Reform Bill Ahead of 2027 General Elections",
    author: 'Admin',
    date: 'May 19, 2026',
    reads: '1.2K',
    slug: 'nigeria-senate-electoral-reform',
  },
  {
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=120&h=80&fit=crop',
    category: 'Health',
    title: 'WHO Declares New Mpox Variant Under Close Global Surveillance After West Africa Cluster',
    author: 'Dr. Ada',
    date: 'May 18, 2026',
    reads: '2.8K',
    slug: 'who-mpox-variant-surveillance',
  },
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=80&fit=crop',
    category: 'Sports',
    title: 'Super Eagles Qualify for AFCON 2027 With a Dominant 3-0 Win Over Ghana in Abuja',
    author: 'Sports Desk',
    date: 'May 17, 2026',
    reads: '5.1K',
    slug: 'super-eagles-afcon-2027-qualify',
  },
  {
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=120&h=80&fit=crop',
    category: 'Science',
    title: "NASRDA Announces Nigeria's Second Satellite Launch Scheduled for Late 2026 From India",
    author: 'Tech Desk',
    date: 'May 16, 2026',
    reads: '890',
    slug: 'nasrda-nigeria-satellite-launch-2026',
  },
];

const trendingItems = [
  { title: 'Dangote Refinery Now Supplying Jet Fuel to Five African Airports', category: 'Business', reads: '3.2K' },
  { title: 'Super Eagles Squad Named For AFCON Qualifiers, Lookman Leads Attack', category: 'Sports', reads: '4.8K' },
  { title: 'CBN Raises Interest Rates to 27% Amid Persistent Inflation Pressures', category: 'Finance', reads: '2.1K' },
  { title: 'Netflix Orders First Nigerian Original Series With $40M Production Budget', category: 'Entertainment', reads: '6.7K' },
  { title: "Elon Musk's Starlink Expands Nigeria Coverage to 200 New LGAs", category: 'Tech', reads: '3.9K' },
];

const popularTags = [
  'Nigeria', 'Economy', 'Politics', 'Tech', 'Sports',
  'Health', 'Africa', 'Business', 'Dangote', 'AFCON',
  'Crypto', 'Oil & Gas', 'UN', 'Elections', 'Fintech',
];

export default function HomePage() {
  return (
    <>
      <SiteHeader activeNav="home" />

      <main className="mx-auto max-w-[1200px] px-5 py-6">
        {/* Hero Grid */}
        <HeroGrid articles={heroArticles} />

        {/* Main Content + Sidebar */}
        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[1fr_320px]">
          {/* Left: Article sections */}
          <div className="flex flex-col gap-8">
            <CategorySection
              title="Software Industry"
              tabs={['Crypto', 'Ecommerce', 'Education']}
              articles={softwareArticles}
            />
            <CategorySection
              title="Business & Economy"
              tabs={['Nigeria', 'Africa', 'Global']}
              articles={businessArticles}
            />
            <LatestList articles={latestArticles} />
          </div>

          {/* Right: Sidebar */}
          <aside className="sticky top-4 hidden flex-col gap-6 lg:flex">
            <TrendingWidget items={trendingItems} />
            <NewsletterWidget />
            <AdBannerWidget />
            <TagsWidget tags={popularTags} />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
