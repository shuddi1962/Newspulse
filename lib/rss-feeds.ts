export interface RssFeed {
  url: string
  source: string
  region: string
  category: string
  logo?: string
  priority?: number
}

export const RSS_FEEDS: RssFeed[] = [

  // ── NIGERIA ──
  { url: 'https://news.google.com/rss?hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Nigeria', priority: 1 },
  { url: 'https://news.google.com/rss/search?q=nigeria+politics+government&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Politics', priority: 1 },
  { url: 'https://news.google.com/rss/search?q=nigeria+economy+naira+CBN&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Economy', priority: 1 },
  { url: 'https://news.google.com/rss/search?q=super+eagles+NPFL+Nigerian+football&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Sports', priority: 1 },
  { url: 'https://news.google.com/rss/search?q=nollywood+nigerian+entertainment&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Entertainment', priority: 2 },
  { url: 'https://punchng.com/feed/', source: 'Punch NG', region: 'nigeria', category: 'Nigeria', priority: 1 },
  { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times', region: 'nigeria', category: 'Nigeria', priority: 1 },
  { url: 'https://www.vanguardngr.com/feed/', source: 'Vanguard', region: 'nigeria', category: 'Nigeria', priority: 1 },
  { url: 'https://www.channelstv.com/feed/', source: 'Channels TV', region: 'nigeria', category: 'Nigeria', priority: 1 },
  { url: 'https://dailypost.ng/feed', source: 'Daily Post', region: 'nigeria', category: 'Nigeria', priority: 2 },
  { url: 'https://thenationonlineng.net/feed/', source: 'The Nation', region: 'nigeria', category: 'Nigeria', priority: 2 },
  { url: 'https://guardian.ng/feed/', source: 'Guardian NG', region: 'nigeria', category: 'Nigeria', priority: 2 },
  { url: 'https://www.legit.ng/rss/all.rss', source: 'Legit NG', region: 'nigeria', category: 'Nigeria', priority: 2 },
  { url: 'https://businessday.ng/feed', source: 'BusinessDay NG', region: 'nigeria', category: 'Business', priority: 1 },
  { url: 'https://nairametrics.com/feed/', source: 'Nairametrics', region: 'nigeria', category: 'Business', priority: 1 },
  { url: 'https://techcabal.com/feed/', source: 'TechCabal', region: 'nigeria', category: 'Technology', priority: 1 },
  { url: 'https://techpoint.africa/feed/', source: 'Techpoint Africa', region: 'africa', category: 'Technology', priority: 1 },
  { url: 'https://pulse.ng/entertainment/feed/', source: 'Pulse Nigeria', region: 'nigeria', category: 'Entertainment', priority: 1 },

  // ── AFRICA ──
  { url: 'https://news.google.com/rss/search?q=africa+news&hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'africa', category: 'Africa', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa', region: 'africa', category: 'Africa', priority: 1 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', region: 'africa', category: 'Africa', priority: 1 },
  { url: 'https://www.theafricareport.com/feed/', source: 'The Africa Report', region: 'africa', category: 'Africa', priority: 1 },
  { url: 'https://www.africanews.com/feed/rss', source: 'Africanews', region: 'africa', category: 'Africa', priority: 1 },
  { url: 'https://www.dailymaverick.co.za/feed/', source: 'Daily Maverick', region: 'africa', category: 'Africa', priority: 2 },
  { url: 'https://www.nation.africa/feed', source: 'Nation Africa', region: 'africa', category: 'Africa', priority: 2 },

  // ── WORLD ──
  { url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'world', category: 'World', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', region: 'world', category: 'World', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News', region: 'world', category: 'World', priority: 1 },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR News', region: 'world', category: 'World', priority: 1 },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', region: 'world', category: 'World', priority: 1 },
  { url: 'https://www.dw.com/rss/rss/en-all.xml', source: 'DW News', region: 'world', category: 'World', priority: 2 },
  { url: 'https://www.france24.com/en/rss', source: 'France 24', region: 'world', category: 'World', priority: 2 },

  // ── AMERICAS ──
  { url: 'https://news.google.com/rss/headlines/section/geo/United+States?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'americas', category: 'Americas', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC Americas', region: 'americas', category: 'Americas', priority: 1 },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times', region: 'americas', category: 'Americas', priority: 1 },
  { url: 'https://www.cbc.ca/cmlink/rss-topstories', source: 'CBC News', region: 'americas', category: 'Americas', priority: 2 },

  // ── EUROPE ──
  { url: 'https://news.google.com/rss/headlines/section/geo/Europe?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'europe', category: 'Europe', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe', region: 'europe', category: 'Europe', priority: 1 },
  { url: 'https://www.dw.com/rss/rss/en-world.xml', source: 'Deutsche Welle', region: 'europe', category: 'Europe', priority: 1 },
  { url: 'https://www.euronews.com/rss', source: 'Euronews', region: 'europe', category: 'Europe', priority: 2 },

  // ── MIDDLE EAST ──
  { url: 'https://news.google.com/rss/headlines/section/geo/Middle+East?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'middleeast', category: 'Middle East', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East', region: 'middleeast', category: 'Middle East', priority: 1 },
  { url: 'https://www.trtworld.com/rss', source: 'TRT World', region: 'middleeast', category: 'Middle East', priority: 1 },
  { url: 'https://www.arabnews.com/rss.xml', source: 'Arab News', region: 'middleeast', category: 'Middle East', priority: 2 },

  // ── ASIA ──
  { url: 'https://news.google.com/rss/headlines/section/geo/Asia?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'asia', category: 'Asia', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia', region: 'asia', category: 'Asia', priority: 1 },
  { url: 'https://www.channelnewsasia.com/rssfeeds/8395986', source: 'CNA', region: 'asia', category: 'Asia', priority: 1 },
  { url: 'https://www3.nhk.or.jp/nhkworld/en/news/feeds/all/', source: 'NHK World', region: 'asia', category: 'Asia', priority: 2 },

  // ── BUSINESS (Global) ──
  { url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Business', priority: 1 },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', region: 'global', category: 'Business', priority: 1 },
  { url: 'https://www.ft.com/rss/home/uk', source: 'Financial Times', region: 'global', category: 'Business', priority: 1 },
  { url: 'https://www.forbes.com/real-time/feed2/', source: 'Forbes', region: 'global', category: 'Business', priority: 2 },
  { url: 'https://feeds.marketwatch.com/marketwatch/topstories/', source: 'MarketWatch', region: 'global', category: 'Business', priority: 2 },

  // ── TECHNOLOGY (Global) ──
  { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Technology', priority: 1 },
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', region: 'global', category: 'Technology', priority: 1 },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired', region: 'global', category: 'Technology', priority: 1 },
  { url: 'https://arstechnica.com/feed/', source: 'Ars Technica', region: 'global', category: 'Technology', priority: 1 },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', region: 'global', category: 'Technology', priority: 1 },
  { url: 'https://www.technologyreview.com/feed/', source: 'MIT Tech Review', region: 'global', category: 'Technology', priority: 2 },

  // ── SPORTS (Global) ──
  { url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Sports', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', region: 'global', category: 'Sports', priority: 1 },
  { url: 'https://www.skysports.com/rss/12040', source: 'Sky Sports', region: 'global', category: 'Sports', priority: 1 },
  { url: 'https://www.goal.com/feeds/en/news', source: 'Goal.com', region: 'global', category: 'Sports', priority: 1 },
  { url: 'https://sports.yahoo.com/rss/', source: 'Yahoo Sports', region: 'global', category: 'Sports', priority: 2 },

  // ── POLITICS (Global + Nigeria) ──
  { url: 'https://news.google.com/rss/headlines/section/topic/POLITICS?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Politics', priority: 1 },
  { url: 'https://news.google.com/rss/search?q=nigeria+politics+government+aso+rock&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Politics', priority: 1 },
  { url: 'https://feeds.npr.org/1014/rss.xml', source: 'NPR Politics', region: 'americas', category: 'Politics', priority: 1 },
  { url: 'https://www.theguardian.com/politics/rss', source: 'Guardian Politics', region: 'global', category: 'Politics', priority: 2 },
  { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics', region: 'global', category: 'Politics', priority: 1 },

  // ── ENTERTAINMENT ──
  { url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Entertainment', priority: 1 },
  { url: 'https://variety.com/feed/', source: 'Variety', region: 'global', category: 'Entertainment', priority: 1 },
  { url: 'https://deadline.com/feed/', source: 'Deadline', region: 'global', category: 'Entertainment', priority: 1 },

  // ── HEALTH ──
  { url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Health', priority: 1 },
  { url: 'https://www.who.int/rss-feeds/news-english.xml', source: 'WHO', region: 'global', category: 'Health', priority: 1 },
  { url: 'https://www.medicalnewstoday.com/rss/news.xml', source: 'Medical News Today', region: 'global', category: 'Health', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC Health', region: 'global', category: 'Health', priority: 2 },

  // ── SCIENCE ──
  { url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Science', priority: 1 },
  { url: 'https://www.sciencedaily.com/rss/all.xml', source: 'ScienceDaily', region: 'global', category: 'Science', priority: 1 },
  { url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml', source: 'BBC Science', region: 'global', category: 'Science', priority: 1 },
  { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA', region: 'global', category: 'Science', priority: 1 },
]

export const ALL_CATEGORIES = ['Nigeria','Africa','World','Business','Technology','Sports','Politics','Entertainment','Health','Science','Americas','Europe','Middle East','Asia']
export const ALL_REGIONS = ['nigeria','africa','world','americas','europe','middleeast','asia']

export function getFeedsByCategory(cat: string) { return RSS_FEEDS.filter(f => f.category === cat) }
export function getFeedsByRegion(region: string) { return RSS_FEEDS.filter(f => f.region === region) }
