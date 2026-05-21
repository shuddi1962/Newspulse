// lib/ai-rewriter.ts
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface RewriteResult {
  headline: string
  content: string
  excerpt: string
  tags: string[]
  isBreaking: boolean
}

function makePrompt(title: string, description: string, source: string, category: string): string {
  return `You are a senior journalist at NewsPulse PRO writing an original news article.

Based on this breaking story, write a complete original article:

ORIGINAL HEADLINE: ${title}
SOURCE: ${source}
CATEGORY: ${category}
CONTEXT: ${description}

Write a professional, engaging news article. Requirements:
- New compelling headline (reworded, not copied)
- 5 to 6 paragraphs, 400 to 600 words total
- Open with the most newsworthy fact
- Add background context and analysis
- Include one attribution line: "According to ${source}, ..."
- End with what this means or what happens next
- 3 to 5 relevant tags

Return ONLY valid JSON, no markdown:
{
  "headline": "Your new headline",
  "content": "Full article. Separate paragraphs with \\n\\n",
  "tags": ["tag1","tag2","tag3"],
  "isBreaking": false
}`
}

async function withGroq(title: string, description: string, source: string, category: string): Promise<RewriteResult | null> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a professional journalist. Always respond with valid JSON only. No markdown. No code blocks.',
      },
      {
        role: 'user',
        content: makePrompt(title, description, source, category),
      },
    ],
    temperature: 0.65,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  })

  const raw = completion.choices[0]?.message?.content || ''
  const parsed = JSON.parse(raw)

  if (!parsed.headline || !parsed.content || parsed.content.length < 150) return null

  return {
    headline: parsed.headline,
    content: parsed.content,
    excerpt: parsed.content.replace(/\n\n/g, ' ').slice(0, 220),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    isBreaking: Boolean(parsed.isBreaking),
  }
}

async function withGemini(title: string, description: string, source: string, category: string): Promise<RewriteResult | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: makePrompt(title, description, source, category) }] }],
        generationConfig: { temperature: 0.65, maxOutputTokens: 1000 },
      }),
    }
  )

  if (!res.ok) return null
  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const clean = raw.replace(/```json\n?|```\n?/g, '').trim()
  const parsed = JSON.parse(clean)

  if (!parsed.headline || !parsed.content) return null

  return {
    headline: parsed.headline,
    content: parsed.content,
    excerpt: parsed.content.replace(/\n\n/g, ' ').slice(0, 220),
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
    isBreaking: Boolean(parsed.isBreaking),
  }
}

export async function rewriteArticle(
  title: string,
  description: string,
  source: string,
  category: string,
): Promise<RewriteResult | null> {
  // Try Groq first
  try {
    const r = await withGroq(title, description, source, category)
    if (r) return r
  } catch (e) {
    console.warn('[AI] Groq failed:', e)
  }

  // Fallback to Gemini
  try {
    const r = await withGemini(title, description, source, category)
    if (r) return r
  } catch (e) {
    console.warn('[AI] Gemini failed:', e)
  }

  return null
}
