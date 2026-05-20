import Link from 'next/link';
import Image from 'next/image';
import { HeroGrid } from '@/components/homepage/HeroGrid';
import { CategorySection } from '@/components/homepage/CategorySection';
import { LatestList } from '@/components/homepage/LatestList';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CategoryTag } from '@/components/ui/CategoryTag';
import { TrendingWidget } from '@/components/sidebar/TrendingWidget';
import { NewsletterWidget } from '@/components/sidebar/NewsletterWidget';
import { AdBannerWidget } from '@/components/sidebar/AdBannerWidget';
import { TagsWidget } from '@/components/sidebar/TagsWidget';
import { AdBanner } from '@/components/ads/AdBanner';

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

const editorsPicks = [
  {
    image: 'https://images.unsplash.com/photo-1554774853-b415df9eeb92?w=400&h=280&fit=crop',
    category: 'Investigations',
    title: 'Inside Africa\'s $2.8 Billion Illicit Financial Flow: How Tax Havens Enable Capital Flight',
    author: 'Chioma Okafor',
    slug: 'africa-illicit-financial-flow-investigation',
  },
  {
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=280&fit=crop',
    category: 'Technology',
    title: 'How Nigerian Fintech Startups Are Building The Next Generation Of Digital Banking Infrastructure',
    author: 'Tunde Balogun',
    slug: 'nigerian-fintech-digital-banking-infrastructure',
  },
  {
    image: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0?w=400&h=280&fit=crop',
    category: 'Politics',
    title: 'ECOWAS Parliament Passes Landmark Resolution On Cross-Border Trade Facilitation In West Africa',
    author: 'Fatima Suleiman',
    slug: 'ecowas-parliament-cross-border-trade',
  },
];

const techArticles = [
  {
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop',
    category: 'AI',
    categoryColor: '#0891b2',
    title: 'Google DeepMind Unveils Gemini 3.0 With Breakthrough Reasoning Capabilities Matching Human Experts',
    author: 'Tech Desk',
    authorInitial: 'T',
    date: 'May 18',
    slug: 'google-deepmind-gemini-3-reasoning',
  },
  {
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&h=200&fit=crop',
    category: 'Cybersecurity',
    categoryColor: '#dc2626',
    title: 'Major Cryptocurrency Exchange Loses $450M In Sophisticated Cyber Attack On Hot Wallets',
    author: 'Security Desk',
    authorInitial: 'S',
    authorColor: '#dc2626',
    date: 'May 17',
    slug: 'crypto-exchange-450m-cyber-attack',
  },
  {
    image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=300&h=200&fit=crop',
    category: 'Startups',
    categoryColor: '#7c3aed',
    title: 'African SaaS Startup Flutterwave Valued at $5.2B After New $300M Series E Round',
    author: 'Kemi',
    authorInitial: 'K',
    authorColor: '#7c3aed',
    date: 'May 16',
    slug: 'flutterwave-saas-5b-valuation',
  },
  {
    image: 'https://images.unsplash.com/photo-1593349486784-c76d3305fd2c?w=300&h=200&fit=crop',
    category: 'Telecom',
    categoryColor: '#2563eb',
    title: 'Starlink Launches Direct-to-Cell Service Across Sub-Saharan Africa In Partnership With MTN',
    author: 'Lola',
    authorInitial: 'L',
    authorColor: '#2563eb',
    date: 'May 15',
    slug: 'starlink-direct-cell-mtn-africa',
  },
];

const sportsArticles = [
  {
    image: 'https://images.unsplash.com/photo-1461896836934-bd45ba8fcf0b?w=300&h=200&fit=crop',
    category: 'Football',
    categoryColor: '#059669',
    title: 'Super Eagles Star Victor Osimhen Named CAF African Player of the Year For 2025 Season',
    author: 'Sports Desk',
    authorInitial: 'S',
    authorColor: '#059669',
    date: 'May 18',
    slug: 'osimhen-caf-player-year-2025',
  },
  {
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=200&fit=crop',
    category: 'Basketball',
    categoryColor: '#d97706',
    title: 'Nigeria\'s D\'Tigers Qualify For Paris 2028 Olympics After Dominant Performance In Qualifiers',
    author: 'Sports Desk',
    authorInitial: 'S',
    authorColor: '#d97706',
    date: 'May 17',
    slug: 'dtigers-paris-2028-olympics-qualify',
  },
  {
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&h=200&fit=crop',
    category: 'Athletics',
    categoryColor: '#dc2626',
    title: 'Tobi Amusan Breaks World Record For Third Time With Stunning 12.08s Performance In Oregon',
    author: 'Sports Desk',
    authorInitial: 'S',
    authorColor: '#dc2626',
    date: 'May 16',
    slug: 'amusan-world-record-oregon',
  },
  {
    image: 'https://images.unsplash.com/photo-1511882150382-421056c89033?w=300&h=200&fit=crop',
    category: 'Boxing',
    categoryColor: '#2563eb',
    title: 'Anthony Joshua Announces Shock Retirement After Devastating Knockout Loss To Wilder In Saudi',
    author: 'Sports Desk',
    authorInitial: 'S',
    authorColor: '#2563eb',
    date: 'May 15',
    slug: 'joshua-retirement-wilder-knockout',
  },
];

const opinionArticles = [
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&face=1',
    author: 'Adebayo Ogunlesi',
    role: 'Senior Editor',
    title: 'Why Africa Must Build Its Own AI Infrastructure Instead Of Relying On Foreign Cloud Providers',
    slug: 'opinion-africa-ai-infrastructure',
  },
  {
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&face=1',
    author: 'Sarah Mitchell',
    role: 'Economics Correspondent',
    title: 'The Inflation Puzzle: Why Central Banks Are Struggling To Tame Rising Prices In Emerging Markets',
    slug: 'opinion-inflation-emerging-markets',
  },
  {
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&face=1',
    author: 'James Okonkwo',
    role: 'Foreign Affairs Editor',
    title: 'BRICS Expansion And The Future Of Global Trade: A New World Order Emerges In The East',
    slug: 'opinion-brics-expansion-global-trade',
  },
];

const videoItems = [
  {
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=200&fit=crop',
    title: 'Inside Lagos\' Largest Tech Hub: A Tour Of The $50M Innovation Centre',
    duration: '12:34',
    slug: 'video-lagos-tech-hub-tour',
  },
  {
    image: 'https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?w=300&h=200&fit=crop',
    title: 'Exclusive Interview With Nigeria\'s Finance Minister On Economic Recovery Plans',
    duration: '24:15',
    slug: 'video-finance-minister-interview',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&h=200&fit=crop',
    title: 'The New Face Of African Fashion: Designers Redefining Global Runways In 2026',
    duration: '18:42',
    slug: 'video-african-fashion-2026',
  },
  {
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop',
    title: 'Behind The Scenes: How Dangote Refinery Processes 650,000 Barrels Of Oil Daily',
    duration: '15:08',
    slug: 'video-dangote-refinery-behind-scenes',
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
  {
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&h=80&fit=crop',
    category: 'Energy',
    title: 'NNPC Reports First Quarterly Profit In Over A Decade Driven By Upstream Production Gains',
    author: 'Energy Desk',
    date: 'May 15, 2026',
    reads: '1.5K',
    slug: 'nnpc-first-quarterly-profit',
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
    <main className="w-full">
      {/* Hero Grid */}
      <section className="px-4 md:px-8 lg:px-12 py-6">
        <HeroGrid articles={heroArticles} />
      </section>

      {/* Ad Banner - Leaderboard */}
      <section className="px-4 md:px-8 lg:px-12 pb-8">
        <AdBanner size="leaderboard" />
      </section>

      {/* Editors' Picks */}
      <section className="px-4 md:px-8 lg:px-12 pb-10">
        <SectionHeading title="Editors' Picks" subtitle="Our top stories selected by the editorial team" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {editorsPicks.map((item) => (
            <Link key={item.slug} href={`/news/${item.slug}`} className="group">
              <div className="relative h-[220px] overflow-hidden">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                />
              </div>
              <div className="mt-4">
                <CategoryTag label={item.category} />
                <h3 className="mt-2 font-display text-base font-semibold leading-snug text-[#0f1419] transition-colors group-hover:text-[#dc2626] line-clamp-2">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-500">By {item.author}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <div className="grid grid-cols-1 items-start gap-8 px-4 md:px-8 lg:px-12 pb-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-10">
          {/* Business & Finance */}
          <CategorySection
            title="Business & Finance"
            subtitle="Markets, economy, and corporate news"
            articles={businessArticles}
          />

          {/* Ad Banner - In Content */}
          <AdBanner size="wide" />

          {/* Technology */}
          <CategorySection
            title="Technology & Innovation"
            subtitle="AI, startups, and the digital frontier"
            articles={techArticles}
          />

          {/* Ad Banner - In Content */}
          <AdBanner size="leaderboard" />

          {/* Opinion & Analysis */}
          <section>
            <SectionHeading title="Opinion & Analysis" subtitle="Perspectives from our contributors" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {opinionArticles.map((item) => (
                <Link key={item.slug} href={`/news/${item.slug}`} className="group border border-gray-100 p-5 transition-colors hover:border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0f1419]">{item.author}</p>
                      <p className="text-xs text-gray-500">{item.role}</p>
                    </div>
                  </div>
                  <h3 className="font-display text-sm font-semibold leading-snug text-[#0f1419] transition-colors group-hover:text-[#dc2626] line-clamp-3">
                    {item.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>

          {/* Ad Banner */}
          <AdBanner size="wide" />

          {/* Latest Stories */}
          <LatestList articles={latestArticles} />
        </div>

        {/* Sidebar */}
        <aside className="sticky top-4 hidden flex-col gap-6 lg:flex">
          <TrendingWidget items={trendingItems} />
          <AdBannerWidget />
          <NewsletterWidget />
          <TagsWidget tags={popularTags} />
          <AdBannerWidget />
        </aside>
      </div>

      {/* Sports Section - Full Width */}
      <section className="bg-gray-50 py-10">
        <div className="px-4 md:px-8 lg:px-12">
          <SectionHeading title="Sports" subtitle="Football, basketball, athletics, and more" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sportsArticles.map((article) => {
              const AuthorAvatar = () => {
                const initials = article.authorInitial;
                const bgColor = article.authorColor || '#0f1419';
                return (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: bgColor }}>
                    {initials}
                  </div>
                );
              };
              return (
                <article key={article.slug} className="group">
                  <Link href={`/news/${article.slug}`} className="block overflow-hidden">
                    <div className="relative h-[200px] overflow-hidden">
                      <Image
                        src={article.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      />
                    </div>
                  </Link>
                  <div className="mt-4">
                    <CategoryTag label={article.category} color={article.categoryColor} />
                    <Link href={`/news/${article.slug}`}>
                      <h3 className="mt-2 font-display text-base font-semibold leading-snug text-[#0f1419] transition-colors group-hover:text-[#dc2626] line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <AuthorAvatar />
                      {article.author} &middot; {article.date}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video Section - Full Width */}
      <section className="bg-[#0f1419] py-10">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="mb-5 flex items-center gap-3">
            <div className="h-5 w-0.5 bg-[#dc2626]" />
            <h2 className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl">Latest Videos</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {videoItems.map((item) => (
              <Link key={item.slug} href={`/video/${item.slug}`} className="group">
                <div className="relative h-[200px] overflow-hidden">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#dc2626] transition-transform group-hover:scale-110">
                      <svg className="ml-0.5 h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                    {item.duration}
                  </div>
                </div>
                <h3 className="mt-2 font-display text-sm font-semibold leading-snug text-white transition-colors group-hover:text-[#dc2626] line-clamp-2">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA - Full Width */}
      <section className="bg-[#dc2626] py-14">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">Stay Ahead With NewsPulse PRO</h2>
          <p className="mt-3 text-base text-white/80">
            Join 50,000+ subscribers who get our daily newsletter with the top stories, exclusive analysis, and breaking news alerts.
          </p>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 border-none px-5 py-3 text-sm text-[#0f1419] outline-none"
            />
            <button className="bg-[#0f1419] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black">
              Subscribe Free
            </button>
          </div>
          <p className="mt-3 text-xs text-white/60">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* Bottom Ad Banner */}
      <section className="px-4 md:px-8 lg:px-12 py-8">
        <AdBanner size="leaderboard" />
      </section>
    </main>
  );
}
