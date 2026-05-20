import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { title, description, source } = await req.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `You are a professional news summarizer for NewsPulse PRO.

Write a concise, engaging 120-150 word summary of this news story. Write in third person, present tense. Do not mention "AI", "summary", or "article". Start directly with the news. Use clear journalistic language.

Headline: ${title}
Source: ${source}
Context: ${description}

Write only the summary paragraph — no headline, no labels, no bullet points.`
      }]
    })

    const block = message.content[0]
    const summary = block?.type === 'text' ? block.text : ''
    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ summary: '' }, { status: 500 })
  }
}
