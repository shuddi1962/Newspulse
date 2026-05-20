import { XMLParser } from 'fast-xml-parser'

export interface NewsArticle {
  id: string
  title: string
  link: string
  description: string
  image: string | null
  publishedAt: string
  source: string
  category: string
  region: string
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', allowBooleanAttributes: true })

function extractImage(item: any): string | null {
  if (item['media:content']?.['@_url']) return item['media:content']['@_url']
  if (Array.isArray(item['media:content'])) {
    const m = item['media:content'].find((x: any) => x['@_url'])
    if (m) return m['@_url']
  }
  if (item.enclosure?.['@_url']) return item.enclosure['@_url']
  if (item['media:thumbnail']?.['@_url']) return item['media:thumbnail']['@_url']
  if (item.description) {
    const m = item.description.match(/src=["']([^"']+\.(jpg|jpeg|png|webp))[^"']*/i)
    if (m) return m[1]
  }
  return null
}

function clean(html: string): string {
  if (!html) return ''
  return html.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').trim()
}

function hashId(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h = h & h }
  return Math.abs(h).toString(36)
}

export async function parseFeed(url: string, source: string, category: string, region: string): Promise<NewsArticle[]> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 NewsPulsePRO/2.0', 'Accept': 'application/rss+xml,*/*' },
      next: { revalidate: 600 },
    })
    if (!res.ok) return []
    const xml = await res.text()
    const data = parser.parse(xml)
    const channel = data?.rss?.channel || data?.feed
    if (!channel) return []
    const items: any[] = Array.isArray(channel.item) ? channel.item : channel.item ? [channel.item] : []

    return items.slice(0, 20).map(item => {
      const rawTitle = typeof item.title === 'string' ? item.title : item.title?.['#text'] || ''
      let title = clean(rawTitle)
      let actualSource = source
      if (source.includes('Google') && title.includes(' - ')) {
        const parts = title.split(' - ')
        actualSource = (parts[parts.length - 1] || source).trim()
        title = parts.slice(0, -1).join(' - ').trim()
      }
      const link = item.link || item.guid?.['#text'] || item.guid || ''
      const description = clean(item.description || item.summary || '').slice(0, 200)
      const image = extractImage(item)
      const pub = item.pubDate || item.published || item.updated || ''
      return {
        id: hashId(link + title),
        title,
        link,
        description,
        image,
        publishedAt: pub ? new Date(pub).toISOString() : new Date().toISOString(),
        source: actualSource,
        category,
        region,
      }
    }).filter(a => a.title && a.link)
  } catch { return [] }
}
