import 'server-only';
import { createServerInsForge } from '@/lib/insforge/server';

const TEXT_MODEL = 'anthropic/claude-sonnet-4.5';

type AIResult = { status: 'ok'; content: string } | { status: 'error'; message: string };

function createAI() {
  return createServerInsForge();
}

export async function generateDraft(topic: string, tone: string, wordCount: number): Promise<AIResult> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional news writer for a major publication. Write engaging, well-structured articles in HTML format (use <p>, <h2>, <h3>, <blockquote>, <ul>, <li>, <ol>). Do not include <html>, <body>, or <head> tags. Write exactly in the tone specified by the user. Aim for the requested word count. Do not include any preamble or explanation — output only the article body.',
        },
        {
          role: 'user',
          content: `Write a news article about: "${topic}". Tone: ${tone}. Target length: approximately ${wordCount} words.`,
        },
      ],
      maxTokens: Math.max(wordCount * 4, 2000),
      temperature: 0.8,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI generation failed.' };
    const content = data?.choices?.[0]?.message?.content ?? '';
    if (!content) return { status: 'error', message: 'AI returned empty content.' };
    return { status: 'ok', content };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function rewriteContent(content: string, instruction: string): Promise<AIResult> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert editor. Rewrite the provided text according to the user\'s instruction. Preserve any HTML formatting. Output only the rewritten content.',
        },
        {
          role: 'user',
          content: `Instruction: ${instruction}\n\nContent to rewrite:\n${content}`,
        },
      ],
      maxTokens: 4000,
      temperature: 0.7,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI rewrite failed.' };
    const result = data?.choices?.[0]?.message?.content ?? '';
    if (!result) return { status: 'error', message: 'AI returned empty content.' };
    return { status: 'ok', content: result };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function generateSocialCopy(title: string, excerpt: string, platform: string): Promise<AIResult> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a social media copywriter. Generate a compelling social media post optimized for the specified platform. Include relevant hashtags. Output only the post copy.`,
        },
        {
          role: 'user',
          content: `Platform: ${platform}\nTitle: ${title}\nExcerpt: ${excerpt}`,
        },
      ],
      maxTokens: 500,
      temperature: 0.8,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI social copy generation failed.' };
    const result = data?.choices?.[0]?.message?.content ?? '';
    if (!result) return { status: 'error', message: 'AI returned empty content.' };
    return { status: 'ok', content: result };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function generateHeadlines(content: string, count = 5): Promise<AIResult> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content: `Generate exactly ${count} distinct, compelling news headlines based on the provided article. Output them as a numbered list. Each headline should be 50–100 characters. Focus on clarity, impact, and accuracy.`,
        },
        {
          role: 'user',
          content: `Article content:\n${content}`,
        },
      ],
      maxTokens: 500,
      temperature: 0.9,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI headline generation failed.' };
    const result = data?.choices?.[0]?.message?.content ?? '';
    if (!result) return { status: 'error', message: 'AI returned empty content.' };
    return { status: 'ok', content: result };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function summarizeContent(content: string): Promise<AIResult> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Summarize the provided article into: (1) a 1–2 sentence TL;DR, (2) 3–5 key takeaways as bullet points. Output in HTML format using <p> and <ul><li> tags.',
        },
        {
          role: 'user',
          content: `Article to summarize:\n${content}`,
        },
      ],
      maxTokens: 1000,
      temperature: 0.3,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI summarization failed.' };
    const result = data?.choices?.[0]?.message?.content ?? '';
    if (!result) return { status: 'error', message: 'AI returned empty content.' };
    return { status: 'ok', content: result };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function autoTagContent(content: string, title: string): Promise<AIResult> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Analyze the provided article and suggest exactly 5 relevant tags. Output them as a comma-separated list, lowercase, no spaces around commas. Tags should be single words or short hyphenated phrases.',
        },
        {
          role: 'user',
          content: `Title: ${title}\nContent:\n${content}`,
        },
      ],
      maxTokens: 100,
      temperature: 0.5,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI auto-tagging failed.' };
    const result = data?.choices?.[0]?.message?.content ?? '';
    if (!result) return { status: 'error', message: 'AI returned empty content.' };
    return { status: 'ok', content: result.trim() };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function scoreContent(content: string, title: string): Promise<AIResult> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Score the provided article on a scale of 1–100 for: readability, engagement potential, SEO quality, and headline strength. Output as JSON: {"readability": N, "engagement": N, "seo": N, "headline": N} followed by a one-sentence recommendation for improvement.',
        },
        {
          role: 'user',
          content: `Title: ${title}\nContent:\n${content}`,
        },
      ],
      maxTokens: 500,
      temperature: 0.3,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI content scoring failed.' };
    const result = data?.choices?.[0]?.message?.content ?? '';
    if (!result) return { status: 'error', message: 'AI returned empty content.' };
    return { status: 'ok', content: result };
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function moderateComment(comment: string): Promise<{
  status: 'ok';
  verdict: 'safe' | 'review' | 'spam' | 'toxic';
  reason: string;
} | { status: 'error'; message: string }> {
  const insforge = createAI();
  try {
    const { data, error } = await insforge.ai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Classify the following comment into exactly one category: "safe" (appropriate), "review" (needs human review), "spam" (obvious spam/advertisement), or "toxic" (harmful/abusive). Output JSON: {"verdict": "category", "reason": "brief explanation"}.',
        },
        {
          role: 'user',
          content: comment,
        },
      ],
      maxTokens: 150,
      temperature: 0.1,
    });

    if (error) return { status: 'error', message: error.message ?? 'AI moderation failed.' };
    const result = data?.choices?.[0]?.message?.content ?? '';
    if (!result) return { status: 'error', message: 'AI returned empty content.' };

    try {
      const parsed = JSON.parse(result);
      const verdict = ['safe', 'review', 'spam', 'toxic'].includes(parsed.verdict)
        ? parsed.verdict
        : 'review';
      return { status: 'ok', verdict: verdict as 'safe' | 'review' | 'spam' | 'toxic', reason: parsed.reason ?? '' };
    } catch {
      return { status: 'ok', verdict: 'review' as const, reason: 'Could not parse AI response' };
    }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : 'Unknown error' };
  }
}
