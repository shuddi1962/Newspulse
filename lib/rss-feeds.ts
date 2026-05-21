// lib/rss-feeds.ts
export interface Feed {
  url: string
  source: string
  region: string
  category: string
}

export const FEEDS: Feed[] = [
  // NIGERIA
  { url: 'https://news.google.com/rss?hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://punchng.com/feed/', source: 'Punch NG', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://www.premiumtimesng.com/feed', source: 'Premium Times', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://www.vanguardngr.com/feed/', source: 'Vanguard', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://www.channelstv.com/feed/', source: 'Channels TV', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://dailypost.ng/feed', source: 'Daily Post', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://thenationonlineng.net/feed/', source: 'The Nation', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://guardian.ng/feed/', source: 'Guardian NG', region: 'nigeria', category: 'Nigeria' },
  { url: 'https://businessday.ng/feed', source: 'BusinessDay', region: 'nigeria', category: 'Business' },
  { url: 'https://nairametrics.com/feed/', source: 'Nairametrics', region: 'nigeria', category: 'Business' },
  { url: 'https://techcabal.com/feed/', source: 'TechCabal', region: 'nigeria', category: 'Technology' },
  { url: 'https://techpoint.africa/feed/', source: 'Techpoint Africa', region: 'africa', category: 'Technology' },
  { url: 'https://pulse.ng/entertainment/feed/', source: 'Pulse NG', region: 'nigeria', category: 'Entertainment' },
  { url: 'https://news.google.com/rss/search?q=nigeria+politics&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Politics' },
  { url: 'https://news.google.com/rss/search?q=super+eagles+nigeria+football&hl=en-NG&gl=NG&ceid=NG:en', source: 'Google News NG', region: 'nigeria', category: 'Sports' },

  // AFRICA
  { url: 'https://feeds.bbci.co.uk/news/world/africa/rss.xml', source: 'BBC Africa', region: 'africa', category: 'Africa' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', region: 'africa', category: 'Africa' },
  { url: 'https://www.theafricareport.com/feed/', source: 'The Africa Report', region: 'africa', category: 'Africa' },
  { url: 'https://www.africanews.com/feed/rss', source: 'Africanews', region: 'africa', category: 'Africa' },
  { url: 'https://www.dailymaverick.co.za/feed/', source: 'Daily Maverick', region: 'africa', category: 'Africa' },

  // WORLD
  { url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'world', category: 'World' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', region: 'world', category: 'World' },
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', source: 'BBC News', region: 'world', category: 'World' },
  { url: 'https://feeds.npr.org/1001/rss.xml', source: 'NPR News', region: 'world', category: 'World' },
  { url: 'https://www.dw.com/rss/rss/en-all.xml', source: 'DW News', region: 'world', category: 'World' },
  { url: 'https://www.france24.com/en/rss', source: 'France 24', region: 'world', category: 'World' },

  // AMERICAS
  { url: 'https://news.google.com/rss/headlines/section/geo/United+States?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'americas', category: 'Americas' },
  { url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml', source: 'BBC Americas', region: 'americas', category: 'Americas' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml', source: 'NY Times', region: 'americas', category: 'Americas' },

  // EUROPE
  { url: 'https://news.google.com/rss/headlines/section/geo/Europe?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'europe', category: 'Europe' },
  { url: 'https://feeds.bbci.co.uk/news/world/europe/rss.xml', source: 'BBC Europe', region: 'europe', category: 'Europe' },
  { url: 'https://www.dw.com/rss/rss/en-world.xml', source: 'Deutsche Welle', region: 'europe', category: 'Europe' },

  // MIDDLE EAST
  { url: 'https://news.google.com/rss/headlines/section/geo/Middle+East?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'middleeast', category: 'Middle East' },
  { url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml', source: 'BBC Middle East', region: 'middleeast', category: 'Middle East' },
  { url: 'https://www.trtworld.com/rss', source: 'TRT World', region: 'middleeast', category: 'Middle East' },

  // ASIA
  { url: 'https://news.google.com/rss/headlines/section/geo/Asia?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'asia', category: 'Asia' },
  { url: 'https://feeds.bbci.co.uk/news/world/asia/rss.xml', source: 'BBC Asia', region: 'asia', category: 'Asia' },
  { url: 'https://www.channelnewsasia.com/rssfeeds/8395986', source: 'CNA', region: 'asia', category: 'Asia' },

  // BUSINESS
  { url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Business' },
  { url: 'https://feeds.bloomberg.com/markets/news.rss', source: 'Bloomberg', region: 'global', category: 'Business' },
  { url: 'https://www.ft.com/rss/home/uk', source: 'Financial Times', region: 'global', category: 'Business' },
  { url: 'https://www.forbes.com/real-time/feed2/', source: 'Forbes', region: 'global', category: 'Business' },

  // TECHNOLOGY
  { url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Technology' },
  { url: 'https://techcrunch.com/feed/', source: 'TechCrunch', region: 'global', category: 'Technology' },
  { url: 'https://www.wired.com/feed/rss', source: 'Wired', region: 'global', category: 'Technology' },
  { url: 'https://arstechnica.com/feed/', source: 'Ars Technica', region: 'global', category: 'Technology' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge', region: 'global', category: 'Technology' },

  // SPORTS
  { url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Sports' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', source: 'BBC Sport', region: 'global', category: 'Sports' },
  { url: 'https://www.skysports.com/rss/12040', source: 'Sky Sports', region: 'global', category: 'Sports' },
  { url: 'https://www.goal.com/feeds/en/news', source: 'Goal.com', region: 'global', category: 'Sports' },

  // POLITICS
  { url: 'https://news.google.com/rss/headlines/section/topic/POLITICS?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Politics' },
  { url: 'https://feeds.bbci.co.uk/news/politics/rss.xml', source: 'BBC Politics', region: 'global', category: 'Politics' },

  // ENTERTAINMENT
  { url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Entertainment' },
  { url: 'https://variety.com/feed/', source: 'Variety', region: 'global', category: 'Entertainment' },
  { url: 'https://deadline.com/feed/', source: 'Deadline', region: 'global', category: 'Entertainment' },

  // HEALTH
  { url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Health' },
  { url: 'https://www.who.int/rss-feeds/news-english.xml', source: 'WHO', region: 'global', category: 'Health' },
  { url: 'https://www.medicalnewstoday.com/rss/news.xml', source: 'Medical News Today', region: 'global', category: 'Health' },
  { url: 'https://feeds.bbci.co.uk/news/health/rss.xml', source: 'BBC Health', region: 'global', category: 'Health' },

  // SCIENCE
  { url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en&gl=US&ceid=US:en', source: 'Google News', region: 'global', category: 'Science' },
  { url: 'https://www.sciencedaily.com/rss/all.xml', source: 'ScienceDaily', region: 'global', category: 'Science' },
  { url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', source: 'NASA', region: 'global', category: 'Science' },
]

// Backward compatibility aliases
export const RSS_FEEDS = FEEDS
export function getFeedsByCategory(cat: string) { return FEEDS.filter(f => f.category === cat) }
export function getFeedsByRegion(region: string) { return FEEDS.filter(f => f.region === region) }
export const ALL_CATEGORIES = ['Nigeria','Africa','World','Business','Technology','Sports','Politics','Entertainment','Health','Science','Americas','Europe','Middle East','Asia']
export const ALL_REGIONS = ['nigeria','africa','world','americas','europe','middleeast','asia']
