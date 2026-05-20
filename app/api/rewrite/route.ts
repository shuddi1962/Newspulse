import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { url, title, description, source } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let fullContent = description || ''

    if (!fullContent) {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'NewsPulsePRO/1.0 (news aggregator; https://newspulse.com)',
            Accept: 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(8000),
        })
        const html = await res.text()
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
        if (bodyMatch && bodyMatch[1]) {
          fullContent = bodyMatch[1]
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
            .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
            .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 8000)
        }
      } catch {
        // fall back to description
      }
    }

    if (!fullContent) {
      fullContent = description || `${title} — coverage from ${source || 'NewsPulse PRO'}`
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are a professional journalist rewriting a news story for NewsPulse PRO.

Rewrite the following article as original journalism. Follow these rules:
- Write in third person, present tense, journalistic style
- Remove all references to the original source, publisher, or publication
- Restructure the content so it reads as original reporting
- Keep all key facts, quotes, data, and context intact
- Write 3-5 paragraphs with clear news writing structure: lede → context → details → forward look
- Do NOT mention "AI", "summary", "rewrite", or "NewsPulse" in the body text
- Do NOT include a headline — only the body paragraphs

Original headline: ${title}
Original content: ${fullContent}

Write only the rewritten article body — no headline, no labels, no metadata.`
      }]
    })

    const block = message.content[0]
    const rewritten = block?.type === 'text' ? block.text : ''

    return NextResponse.json({
      rewritten,
      title,
      originalUrl: url,
      wordCount: rewritten.split(/\s+/).length,
    })
  } catch (error) {
    console.error('Rewrite error:', error)
    return NextResponse.json(
      { error: 'Failed to rewrite article', rewritten: '' },
      { status: 500 }
    )
  }
}
