import { NextRequest, NextResponse } from 'next/server';
import { createServerInsForge } from '@/lib/insforge/server';

const TEXT_MODEL = 'anthropic/claude-sonnet-4.5';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json({ expanded: query, keywords: [] });
    }

    const insforge = createServerInsForge();
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a search query expander for a news platform. Given a user\'s search query, return JSON with: (1) "expanded" — a reformulated search query that captures the user\'s intent more precisely, (2) "keywords" — an array of 3-5 related keywords/synonyms that could help find relevant articles. Output ONLY valid JSON, no explanation.',
        },
        {
          role: 'user',
          content: query,
        },
      ],
      maxTokens: 200,
      temperature: 0.3,
    });

    if (error || !data?.choices?.[0]?.message?.content) {
      return NextResponse.json({ expanded: query, keywords: [] });
    }

    try {
      const parsed = JSON.parse(data.choices[0].message.content);
      return NextResponse.json({
        expanded: parsed.expanded ?? query,
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      });
    } catch {
      return NextResponse.json({ expanded: query, keywords: [] });
    }
  } catch {
    return NextResponse.json({ expanded: '', keywords: [] });
  }
}
