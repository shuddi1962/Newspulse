// app/api/ingest/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { FEEDS } from '@/lib/rss-feeds'
import { parseFeed, RawArticle } from '@/lib/rss-parser'
import { rewriteArticle } from '@/lib/ai-rewriter'
import { getPexelsImage } from '@/lib/pexels'
import { db } from '@/lib/insforge'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    .replace(/-$/, '')
    + '-' + Date.now().toString(36)
}

const CAT_META: Record<string, { color: string; icon: string; slug: string }> = {
  Nigeria:       { color: '#e63946', icon: '🇳🇬', slug: 'nigeria' },
  Africa:        { color: '#16a34a', icon: '🌍', slug: 'africa' },
  World:         { color: '#0f1419', icon: '🌐', slug: 'world' },
  Business:      { color: '#2563eb', icon: '💼', slug: 'business' },
  Technology:    { color: '#7c3aed', icon: '💻', slug: 'technology' },
  Sports:        { color: '#059669', icon: '⚽', slug: 'sports' },
  Politics:      { color: '#dc2626', icon: '🏛', slug: 'politics' },
  Entertainment: { color: '#d97706', icon: '🎬', slug: 'entertainment' },
  Health:        { color: '#0891b2', icon: '🏥', slug: 'health' },
  Science:       { color: '#0f766e', icon: '🔬', slug: 'science' },
  Americas:      { color: '#1d4ed8', icon: '🌎', slug: 'americas' },
  Europe:        { color: '#4338ca', icon: '🇪🇺', slug: 'europe' },
  'Middle East': { color: '#b45309', icon: '🕌', slug: 'middle-east' },
  Asia:          { color: '#0369a1', icon: '🌏', slug: 'asia' },
  Opinion:       { color: '#6b7280', icon: '✍️', slug: 'opinion' },
}

async function ensureCategory(name: string) {
  try {
    const meta = CAT_META[name] || { color: '#6b7280', icon: '📰', slug: name.toLowerCase().replace(/\s+/g, '-') }
    await db.categories.upsert(name, meta.slug, meta.color, meta.icon)
  } catch {}
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true
  return req.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(req: NextRequest) {
  return handler(req)
}

export async function POST(req: NextRequest) {
  return handler(req)
}

async function handler(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let ingested = 0, skipped = 0, failed = 0
  const log: string[] = []

  const BATCH = 8
  for (let i = 0; i < FEEDS.length; i += BATCH) {
    const batch = FEEDS.slice(i, i + BATCH)

    const batchResults = await Promise.allSettled(
      batch.map(feed => parseFeed(feed.url, feed.source, feed.category, feed.region))
    )

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j]
      if (!result || result.status === 'rejected') continue
      const rawArticles = (result as PromiseFulfilledResult<RawArticle[]>).value

      for (const raw of rawArticles) {
        if (!raw.link || !raw.title) { skipped++; continue }

        try {
          const exists = await db.queue.exists(raw.link)
          if (exists) { skipped++; continue }

          await db.queue.add(raw.link)

          if (raw.description.length < 15 && !raw.image) { skipped++; continue }

          const rewritten = await rewriteArticle(
            raw.title,
            raw.description,
            raw.sourceName,
            raw.category
          )

          if (!rewritten || rewritten.content.length < 150) {
            log.push(`[SKIP] AI failed: ${raw.title.slice(0, 50)}`)
            skipped++
            continue
          }

          let imageUrl = raw.image || null
          if (!imageUrl) {
            imageUrl = await getPexelsImage(rewritten.headline, raw.category)
          }

          await ensureCategory(raw.category)

          const slug = slugify(rewritten.headline)
          await db.articles.create({
            slug,
            headline: rewritten.headline,
            original_title: raw.title,
            content: rewritten.content,
            excerpt: rewritten.excerpt,
            image_url: imageUrl,
            image_alt: rewritten.headline,
            category: raw.category,
            region: raw.region,
            source_name: raw.sourceName,
            source_url: raw.link,
            tags: rewritten.tags,
            is_breaking: rewritten.isBreaking,
            is_featured: false,
            status: 'published',
            published_at: raw.publishedAt,
          })

          const meta = CAT_META[raw.category]
          if (meta) await db.categories.incrementCount(meta.slug)

          ingested++
          log.push(`[OK] ${rewritten.headline.slice(0, 60)}`)

          await new Promise(r => setTimeout(r, 600))

        } catch (err) {
          failed++
          log.push(`[ERR] ${raw.title.slice(0, 40)}: ${err}`)
        }
      }
    }
  }

  return NextResponse.json({
    ok: true, ingested, skipped, failed,
    log: log.slice(-20),
    ts: new Date().toISOString(),
  })
}
