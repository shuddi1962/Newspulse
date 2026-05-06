import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'AI Tools — Admin',
  description: 'Content scoring, comment moderation, and AI-powered editorial tools.',
};

export default async function AIToolsPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">AI Tools</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          AI-powered editorial assistance and content intelligence.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard
          title="AI Writer"
          description="Generate drafts, rewrite content, create headlines, summarize articles, and produce social media copy."
          href="/admin/content/articles/new"
          status="Active"
        />
        <ToolCard
          title="Comment Moderation"
          description="Automatically classify incoming comments as safe, spam, toxic, or needing human review using AI."
          href="/admin/content"
          status="Active"
        />
        <ToolCard
          title="Auto-Tagging"
          description="Suggest relevant tags for articles based on content analysis. Apply with one click from the editor."
          href="/admin/content/articles/new"
          status="Active"
        />
        <ToolCard
          title="Content Scoring"
          description="Evaluate articles on readability, engagement potential, SEO quality, and headline strength."
          href="/admin/content/articles/new"
          status="Active"
        />
        <ToolCard
          title="Headline A/B Testing"
          description="Generate multiple headline variations for the same article to optimize click-through rates."
          href="/admin/content/articles/new"
          status="Active"
        />
        <ToolCard
          title="AI Image Generation"
          description="Create featured images from text prompts using AI image generation."
          href="/admin/content/articles/new"
          status="Coming soon"
        />
      </div>

      <div className="mt-8 rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
        <h2 className="mb-4 text-lg font-semibold text-(--fg-default)">AI Models</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border-subtle)">
                <th className="pb-3 pr-6 text-left font-medium text-(--fg-muted)">Model</th>
                <th className="pb-3 px-4 text-left font-medium text-(--fg-muted)">Provider</th>
                <th className="pb-3 px-4 text-left font-medium text-(--fg-muted)">Use case</th>
                <th className="pb-3 pl-4 text-left font-medium text-(--fg-muted)">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-(--border-subtle)">
                <td className="py-3 pr-6 font-mono text-xs text-(--fg-default)">anthropic/claude-sonnet-4.5</td>
                <td className="py-3 px-4 text-(--fg-muted)">OpenRouter</td>
                <td className="py-3 px-4 text-(--fg-muted)">Text generation (primary)</td>
                <td className="py-3 pl-4">
                  <span className="rounded-md bg-(--color-forest-green)/10 px-2 py-0.5 text-xs font-medium text-(--color-forest-green)">
                    Active
                  </span>
                </td>
              </tr>
              <tr className="border-t border-(--border-subtle)">
                <td className="py-3 pr-6 font-mono text-xs text-(--fg-default)">openai/gpt-4o-mini</td>
                <td className="py-3 px-4 text-(--fg-muted)">OpenRouter</td>
                <td className="py-3 px-4 text-(--fg-muted)">Fallback text generation</td>
                <td className="py-3 pl-4">
                  <span className="rounded-md bg-(--color-forest-green)/10 px-2 py-0.5 text-xs font-medium text-(--color-forest-green)">
                    Active
                  </span>
                </td>
              </tr>
              <tr className="border-t border-(--border-subtle)">
                <td className="py-3 pr-6 font-mono text-xs text-(--fg-default)">google/gemini-3-pro-image-preview</td>
                <td className="py-3 px-4 text-(--fg-muted)">OpenRouter</td>
                <td className="py-3 px-4 text-(--fg-muted)">Image generation</td>
                <td className="py-3 pl-4">
                  <span className="rounded-md bg-(--color-forest-green)/10 px-2 py-0.5 text-xs font-medium text-(--color-forest-green)">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-(--color-cat-lifestyle)/20 bg-(--color-cat-lifestyle)/5 p-4">
        <p className="text-sm text-(--fg-default)">
          <strong>Tip:</strong> AI tools are available directly in the article editor. Open{' '}
          <a href="/admin/content/articles/new" className="font-medium text-(--color-ocean-blue) hover:underline">
            Create article
          </a>{' '}
          and look for the AI Writer panel in the right sidebar.
        </p>
      </div>
    </div>
  );
}

function ToolCard({
  title,
  description,
  href,
  status,
}: {
  title: string;
  description: string;
  href: string;
  status: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6 transition-colors hover:border-(--color-ocean-blue)/30"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-base font-semibold text-(--fg-default) group-hover:text-(--color-ocean-blue)">
          {title}
        </h3>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-medium ${
            status === 'Active'
              ? 'bg-(--color-forest-green)/10 text-(--color-forest-green)'
              : 'bg-(--fg-subtle)/10 text-(--fg-subtle)'
          }`}
        >
          {status}
        </span>
      </div>
      <p className="mt-2 text-sm text-(--fg-muted)">{description}</p>
    </a>
  );
}
