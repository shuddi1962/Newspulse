// lib/rss-parser.ts
import { XMLParser } from 'fast-xml-parser'
import { extractImageFromItem } from './extract-image'

// Backward compatibility alias (for fetch-news.ts and old components)
export interface NewsArticle extends RawArticle { id?: string; source?: string }

export interface RawArticle {
  title: string
  link: string
  description: string
  image: string | null
  publishedAt: string
  sourceName: string
  category: string
  region: string
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  allowBooleanAttributes: true,
  parseAttributeValue: false,
  trimValues: true,
})

function stripHtml(s: string): string {
  return (s || '')
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ')
    .replace(/\s{2,}/g,' ').trim()
}

export async function parseFeed(
  url: string,
  source: string,
  category: string,
  region: string,
): Promise<RawArticle[]> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsPulsePRO/3.0; +https://newspulsepros.vercel.app)',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
      },
      next: { revalidate: 300 },
    })
    clearTimeout(timeout)

    if (!res.ok) return []
    const xml = await res.text()
    const data = xmlParser.parse(xml)

    const channel = data?.rss?.channel || data?.feed || data?.['rdf:RDF']
    if (!channel) return []

    const rawItems = channel.item || channel.entry || []
    const items: any[] = Array.isArray(rawItems) ? rawItems : [rawItems]

    return items.slice(0, 15).map(item => {
      // Title — unwrap CDATA and Google News source suffix
      const rawTitle = typeof item.title === 'string'
        ? item.title
        : item.title?.['#text'] || item.title?.['__cdata'] || ''
      let title = stripHtml(rawTitle).trim()

      let sourceName = source
      // Google News appends " - Publisher Name" to title
      if (source.toLowerCase().includes('google') && title.includes(' - ')) {
        const parts = title.split(' - ')
        sourceName = (parts[parts.length - 1] || source).trim()
        title = parts.slice(0, -1).join(' - ').trim()
      }

      const link = (
        typeof item.link === 'string' ? item.link
        : item.link?.['@_href']
        || item.guid?.['#text']
        || (typeof item.guid === 'string' ? item.guid : '')
      ).trim()

      const description = stripHtml(
        item.description || item.summary?.['#text'] || item.summary || ''
      ).slice(0, 400)

      const image = extractImageFromItem(item)

      const pubRaw = item.pubDate || item.published || item.updated || item['dc:date'] || ''
      let publishedAt = new Date().toISOString()
      try { publishedAt = new Date(pubRaw).toISOString() } catch {}

      return { title: title || '', link: link || '', description, image, publishedAt, sourceName, category, region }
    }).filter(a => a.title.length > 5 && a.link.startsWith('http'))

  } catch (err) {
    console.warn(`[RSS] Failed to parse ${source}:`, err)
    return []
  }
}
