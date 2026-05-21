// lib/pexels.ts — uses Unsplash as fallback image source
const CATEGORY_QUERIES: Record<string, string> = {
  Nigeria: 'nigeria africa',
  Africa: 'africa continent landscape',
  World: 'world news global',
  Business: 'business finance corporate',
  Technology: 'technology digital computer',
  Sports: 'sports stadium athlete',
  Politics: 'government parliament building',
  Entertainment: 'entertainment cinema music',
  Health: 'health medical hospital',
  Science: 'science research laboratory',
  Americas: 'america landmark city',
  Europe: 'europe architecture travel',
  'Middle East': 'middle east desert mosque',
  Asia: 'asia temple cityscape',
  Opinion: 'newspaper journalism writing',
}

export async function getPexelsImage(title: string, category: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null

  const stopWords = new Set(['the','a','an','and','or','in','on','at','to','for','of','with','is','are','was','were'])
  const keywords = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 3)
    .join(' ')

  const query = keywords.length > 5 ? keywords : (CATEGORY_QUERIES[category] || 'news')
  const encoded = encodeURIComponent(query)

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encoded}&per_page=3&orientation=landscape&content_filter=high`,
      {
        headers: { Authorization: `Client-ID ${key}` },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const results = data?.results
    if (!results?.length) return null
    const idx = Math.floor(Math.random() * Math.min(results.length, 3))
    return results[idx]?.urls?.regular || results[idx]?.urls?.raw || null
  } catch {
    return null
  }
}
