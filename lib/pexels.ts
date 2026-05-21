// lib/pexels.ts
const CATEGORY_QUERIES: Record<string, string> = {
  Nigeria: 'nigeria africa',
  Africa: 'africa continent',
  World: 'globe world news',
  Business: 'business finance',
  Technology: 'technology digital',
  Sports: 'sports stadium',
  Politics: 'government parliament',
  Entertainment: 'entertainment cinema',
  Health: 'health medicine',
  Science: 'science research',
  Americas: 'america city',
  Europe: 'europe architecture',
  'Middle East': 'middle east city',
  Asia: 'asia city',
  Opinion: 'newspaper journalism',
}

export async function getPexelsImage(title: string, category: string): Promise<string | null> {
  const key = process.env.PEXELS_API_KEY
  if (!key) return null

  const stopWords = new Set(['the','a','an','and','or','in','on','at','to','for','of','with','is','are','was','were'])
  const keywords = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .filter(w => w.length > 3 && !stopWords.has(w))
    .slice(0, 3)
    .join(' ')

  const query = keywords.length > 5 ? keywords : (CATEGORY_QUERIES[category] || 'news world')

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&size=medium`,
      { headers: { Authorization: key }, next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    const photos = data?.photos
    if (!photos?.length) return null
    const idx = Math.floor(Math.random() * Math.min(photos.length, 3))
    return photos[idx]?.src?.large || photos[idx]?.src?.original || null
  } catch {
    return null
  }
}
