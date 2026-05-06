import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  generateDraft,
  rewriteContent,
  generateSocialCopy,
  generateHeadlines,
  summarizeContent,
  autoTagContent,
} from '@/lib/ai/writer';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { tool } = body as { tool: string };

    switch (tool) {
      case 'draft': {
        const { topic, tone, wordCount } = body as { topic: string; tone: string; wordCount: number };
        return NextResponse.json(await generateDraft(topic, tone, wordCount ?? 800));
      }
      case 'rewrite': {
        const { content, instruction } = body as { content: string; instruction: string };
        return NextResponse.json(await rewriteContent(content, instruction));
      }
      case 'social': {
        const { title, excerpt, platform } = body as { title: string; excerpt: string; platform: string };
        return NextResponse.json(await generateSocialCopy(title, excerpt, platform));
      }
      case 'headlines': {
        const { content } = body as { content: string };
        return NextResponse.json(await generateHeadlines(content));
      }
      case 'summarize': {
        const { content } = body as { content: string };
        return NextResponse.json(await summarizeContent(content));
      }
      case 'tags': {
        const { content, title } = body as { content: string; title: string };
        return NextResponse.json(await autoTagContent(content, title));
      }
      default:
        return NextResponse.json({ status: 'error', message: 'Unknown tool.' }, { status: 400 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid request.';
    return NextResponse.json({ status: 'error', message }, { status: 400 });
  }
}
