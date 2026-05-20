import { NextRequest, NextResponse } from 'next/server'
import { fetchByCategory, fetchByRegion, fetchAllNews } from '@/lib/fetch-news'

export const revalidate = 600

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const region = searchParams.get('region')
  const category = searchParams.get('category')
  const q = searchParams.get('q')
  const limit = parseInt(searchParams.get('limit') || '40')

  try {
    let articles = region
      ? await fetchByRegion(region, limit)
      : category
      ? await fetchByCategory(category, limit)
      : await fetchAllNews(limit)

    if (q) {
      const lq = q.toLowerCase()
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(lq) ||
        a.description.toLowerCase().includes(lq)
      )
    }

    return NextResponse.json({ articles: articles.slice(0, limit), fetchedAt: new Date().toISOString() })
  } catch {
    return NextResponse.json({ articles: [], fetchedAt: new Date().toISOString() }, { status: 500 })
  }
}
