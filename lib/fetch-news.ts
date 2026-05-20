import { RSS_FEEDS, getFeedsByCategory, getFeedsByRegion } from './rss-feeds'
import { parseFeed, NewsArticle } from './rss-parser'

function dedup(articles: NewsArticle[], limit: number): NewsArticle[] {
  const seen = new Set<string>()
  return articles
    .filter(a => { if (seen.has(a.id)) return false; seen.add(a.id); return true })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, limit)
}

async function fetchFeeds(feeds: typeof RSS_FEEDS): Promise<NewsArticle[]> {
  const res = await Promise.allSettled(feeds.map(f => parseFeed(f.url, f.source, f.category, f.region)))
  const out: NewsArticle[] = []
  res.forEach(r => { if (r.status === 'fulfilled') out.push(...r.value) })
  return out
}

export async function fetchHomepageNews() {
  const sections = [
    'Nigeria','Africa','World','Business','Technology','Sports',
    'Politics','Entertainment','Health','Science','Americas','Europe','Middle East','Asia'
  ]
  const results = await Promise.all(
    sections.map(async cat => {
      const feeds = getFeedsByCategory(cat)
      const articles = await fetchFeeds(feeds)
      return { cat, articles: dedup(articles, 8) }
    })
  )
  const byCategory: Record<string, NewsArticle[]> = {}
  results.forEach(({ cat, articles }) => { byCategory[cat] = articles })

  const heroPool = [...(byCategory['Nigeria'] || []), ...(byCategory['World'] || []), ...(byCategory['Africa'] || [])]
  const topStories = dedup(heroPool, 6)

  return { topStories, byCategory }
}

export async function fetchByCategory(category: string, limit = 40): Promise<NewsArticle[]> {
  const feeds = getFeedsByCategory(category)
  return dedup(await fetchFeeds(feeds), limit)
}

export async function fetchByRegion(region: string, limit = 40): Promise<NewsArticle[]> {
  const feeds = getFeedsByRegion(region)
  return dedup(await fetchFeeds(feeds), limit)
}

export async function fetchAllNews(limit = 80): Promise<NewsArticle[]> {
  return dedup(await fetchFeeds(RSS_FEEDS), limit)
}
