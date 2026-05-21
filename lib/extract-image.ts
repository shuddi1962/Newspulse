// lib/extract-image.ts
// Strategy 1-8: tries each in order, returns first valid non-logo URL
const LOGO_PATTERNS = [
  /logo/i, /favicon/i, /icon/i, /banner/i,
  /punch-logo/i, /site-logo/i, /brand/i,
  /500x179/i, /150x150/i, /default/i,
]

function isValidImage(url: string | null | undefined): boolean {
  if (!url) return false
  if (LOGO_PATTERNS.some(p => p.test(url))) return false
  if (!/\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url) && !url.includes('ichef.bbci') && !url.includes('pexels') && !url.includes('images.') && !url.includes('/image/') && !url.includes('media')) return false
  return url.startsWith('http')
}

export function extractImageFromItem(item: any): string | null {
  const candidates: Array<string | null | undefined> = []

  // Strategy 1: media:content
  const mc = item['media:content']
  if (Array.isArray(mc)) {
    mc.forEach((m: any) => {
      if (m?.['@_url']) candidates.push(m['@_url'])
    })
  } else if (mc?.['@_url']) {
    candidates.push(mc['@_url'])
  }

  // Strategy 2: media:thumbnail
  const mt = item['media:thumbnail']
  if (Array.isArray(mt)) {
    mt.forEach((m: any) => { if (m?.['@_url']) candidates.push(m['@_url']) })
  } else if (mt?.['@_url']) {
    candidates.push(mt['@_url'])
  }

  // Strategy 3: enclosure
  const enc = item.enclosure
  if (enc?.['@_url'] && enc?.['@_type']?.startsWith('image')) {
    candidates.push(enc['@_url'])
  }

  // Strategy 4: image tag inside item
  if (item.image?.url) candidates.push(item.image.url)

  // Strategy 5: Extract from description HTML <img src="...">
  const desc = item.description || item.summary || item['content:encoded'] || ''
  if (desc) {
    const imgMatches = [...desc.matchAll(/src=["']([^"']+)["']/gi)]
    imgMatches.forEach(m => candidates.push(m[1]))
  }

  // Strategy 6: og:image in content:encoded
  const encoded = item['content:encoded'] || ''
  if (encoded) {
    const ogMatch = encoded.match(/og:image.*?content=["']([^"']+)["']/i)
    if (ogMatch) candidates.push(ogMatch[1])
  }

  // Return first valid, non-logo candidate
  for (const c of candidates) {
    if (isValidImage(c)) return c!
  }

  return null
}

export function extractImageFromFeed(channel: any): string | null {
  if (channel?.image?.url) {
    const u = channel.image.url
    if (!LOGO_PATTERNS.some(p => p.test(u))) return u
  }
  return null
}
