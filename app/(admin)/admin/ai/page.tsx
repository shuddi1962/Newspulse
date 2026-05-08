import type { Metadata } from 'next';
import { Brain, Key, Image, Video, Mic, Sparkles, FileText, Tag, RefreshCw, PenTool, Palette, ChevronDown } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'AI Tools & Settings — Admin',
  description: 'Content scoring, comment moderation, AI-powered editorial tools, and model configuration.',
};

const AI_FEATURES = [
  { title: 'AI Writer', description: 'Generate drafts, rewrite content, and produce social media copy.', icon: PenTool, status: 'Active' as const },
  { title: 'AI Title Generator', description: 'Generate compelling headlines from article content.', icon: Sparkles, status: 'Active' as const },
  { title: 'AI Tags Generator', description: 'Auto-suggest relevant tags based on content analysis.', icon: Tag, status: 'Active' as const },
  { title: 'AI Summary Generator', description: 'Create concise TL;DR summaries and key takeaways.', icon: FileText, status: 'Active' as const },
  { title: 'AI Rewriter', description: 'Rewrite content in different tones and styles.', icon: RefreshCw, status: 'Active' as const },
  { title: 'AI Image Generation', description: 'Create featured images from text prompts via Kie.ai.', icon: Image, status: 'Active' as const },
  { title: 'AI Video Generation', description: 'Generate short-form videos from content via Kie.ai.', icon: Video, status: 'Active' as const },
  { title: 'AI Thumbnail Generator', description: 'Auto-generate optimized video/article thumbnails.', icon: Image, status: 'Coming soon' as const },
  { title: 'AI Voiceover', description: 'Convert articles to natural-sounding narration.', icon: Mic, status: 'Coming soon' as const },
  { title: 'AI Short Video Creator', description: 'Turn articles into engaging short-form videos.', icon: Video, status: 'Coming soon' as const },
  { title: 'AI Social Media Graphics', description: 'Generate platform-optimized social media images.', icon: Palette, status: 'Coming soon' as const },
  { title: 'AI Plagiarism Checker', description: 'Scan content for plagiarism across the web.', icon: Brain, status: 'Coming soon' as const },
];

export default async function AIToolsPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Intelligence</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">
          AI Tools & Settings
        </h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Configure AI models, API keys, and manage AI-powered editorial tools.
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
            <p className="text-sm text-(--fg-muted)">Primary model</p>
            <p className="mt-1 font-mono text-sm font-semibold text-(--fg-default)">claude-sonnet-4.5</p>
          </div>
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
            <p className="text-sm text-(--fg-muted)">Provider</p>
            <p className="mt-1 font-mono text-sm font-semibold text-(--fg-default)">OpenRouter</p>
          </div>
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
            <p className="text-sm text-(--fg-muted)">Fallback model</p>
            <p className="mt-1 font-mono text-sm font-semibold text-(--fg-default)">gpt-4o-mini</p>
          </div>
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5">
            <p className="text-sm text-(--fg-muted)">Image model</p>
            <p className="mt-1 font-mono text-sm font-semibold text-(--fg-default)">gemini-3-pro</p>
          </div>
        </div>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Key className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">API Keys</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">OpenRouter API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="password"
                    placeholder="sk-or-..."
                    placeholder="sk-or-..."
                    className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 pr-8 text-sm font-mono text-(--fg-default)"
                  />
                  <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-(--fg-muted)" />
                </div>
                <button className="rounded-lg bg-(--color-crimson) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-crimson-dark)">
                  Save
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Kie.ai API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="password"
                    placeholder="kie-..."
                    className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 pr-8 text-sm font-mono text-(--fg-default)"
                  />
                  <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-(--fg-muted)" />
                </div>
                <button className="rounded-lg bg-(--color-crimson) px-4 py-2 text-sm font-medium text-white hover:bg-(--color-crimson-dark)">
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Model Selection</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">GPT models</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>GPT-4o (Recommended)</option>
                <option>GPT-4</option>
                <option>GPT-4o-mini</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Claude models</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Claude Sonnet 4.5 (Recommended)</option>
                <option>Claude Opus</option>
                <option>Claude Haiku</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Gemini models</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Gemini Pro (Recommended)</option>
                <option>Gemini Ultra</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">DeepSeek models</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>DeepSeek V3 (Recommended)</option>
                <option>DeepSeek R1</option>
              </select>
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium text-(--fg-default)">Default model (text generation)</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>anthropic/claude-sonnet-4.5</option>
                <option>openai/gpt-4o</option>
                <option>openai/gpt-4o-mini</option>
                <option>google/gemini-pro</option>
                <option>deepseek/deepseek-v3</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <PenTool className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Writing Preferences</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Default writing tone</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Professional</option>
                <option>Casual</option>
                <option>Academic</option>
                <option>Persuasive</option>
                <option>Neutral</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 pt-6">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                <span className="text-sm font-medium text-(--fg-default)">Multi-language AI writing</span>
              </label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>English (default)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>Arabic</option>
                <option>Swahili</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Image className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">Kie.ai Integration</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Image model</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Kie Image XL</option>
                <option>Kie Image Pro</option>
                <option>Kie Image Fast</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Video model</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Kie Video Pro</option>
                <option>Kie Video Fast</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-(--fg-muted)" />
            <h2 className="text-base font-semibold text-(--fg-default)">AI Features</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-5 transition-colors hover:border-(--color-ocean-blue)/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="rounded-md bg-(--bg-muted) p-1.5">
                        <Icon className="h-4 w-4 text-(--fg-default)" />
                      </div>
                      <h3 className="text-sm font-semibold text-(--fg-default)">{feature.title}</h3>
                    </div>
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                        feature.status === 'Active'
                          ? 'bg-(--color-forest-green)/10 text-(--color-forest-green)'
                          : 'bg-(--fg-subtle)/10 text-(--fg-subtle)'
                      }`}
                    >
                      {feature.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-(--fg-muted)">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-5 py-2.5 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
            Reset to defaults
          </button>
          <button className="rounded-lg bg-(--color-crimson) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-crimson-dark)">
            Save all settings
          </button>
        </div>
      </div>
    </div>
  );
}
