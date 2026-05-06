'use client';

import { useState, useTransition } from 'react';
import {
  Sparkles,
  Wand2,
  MessageSquare,
  Tag,
  FileText,
  BarChart3,
  Loader2,
  X,
  ChevronDown,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

type ToolType = 'draft' | 'rewrite' | 'headlines' | 'social' | 'summarize' | 'tags' | 'score';

type AIWriterPanelProps = {
  onInsertContent: (html: string) => void;
  onSetTitle: (title: string) => void;
  onSetExcerpt: (excerpt: string) => void;
  onSetTags: (tags: string) => void;
  currentContent?: string;
  currentTitle?: string;
  currentExcerpt?: string;
};

const TOOLS: { id: ToolType; label: string; icon: typeof Sparkles }[] = [
  { id: 'draft', label: 'Generate draft', icon: FileText },
  { id: 'rewrite', label: 'Rewrite', icon: Wand2 },
  { id: 'headlines', label: 'Headlines', icon: Sparkles },
  { id: 'social', label: 'Social copy', icon: MessageSquare },
  { id: 'summarize', label: 'Summarize', icon: BarChart3 },
  { id: 'tags', label: 'Auto-tag', icon: Tag },
];

export function AIWriterPanel({
  onInsertContent,
  onSetTitle,
  onSetExcerpt,
  onSetTags,
  currentContent,
  currentTitle,
  currentExcerpt,
}: AIWriterPanelProps) {
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [wordCount, setWordCount] = useState(800);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('twitter');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function openTool(tool: ToolType) {
    setActiveTool(tool);
    setExpanded(true);
    setResult(null);
    setError(null);
    setCopied(false);
  }

  function closePanel() {
    setExpanded(false);
    setActiveTool(null);
    setResult(null);
    setError(null);
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function execute() {
    if (!activeTool) return;
    setError(null);
    setResult(null);

    const body: Record<string, unknown> = { tool: activeTool };

    if (activeTool === 'draft') {
      if (!topic.trim()) {
        setError('Please enter a topic.');
        return;
      }
      body.topic = topic;
      body.tone = tone;
      body.wordCount = wordCount;
    }

    if (activeTool === 'rewrite') {
      if (!rewriteInstruction.trim()) {
        setError('Please enter a rewrite instruction.');
        return;
      }
      if (!currentContent) {
        setError('No content to rewrite. Write something first.');
        return;
      }
      body.content = currentContent;
      body.instruction = rewriteInstruction;
    }

    if (activeTool === 'headlines') {
      if (!currentContent) {
        setError('No content to generate headlines from.');
        return;
      }
      body.content = currentContent;
    }

    if (activeTool === 'social') {
      if (!currentTitle) {
        setError('No title available.');
        return;
      }
      body.title = currentTitle;
      body.excerpt = currentExcerpt ?? '';
      body.platform = socialPlatform;
    }

    if (activeTool === 'summarize') {
      if (!currentContent) {
        setError('No content to summarize.');
        return;
      }
      body.content = currentContent;
    }

    if (activeTool === 'tags') {
      if (!currentContent && !currentTitle) {
        setError('No content or title to tag.');
        return;
      }
      body.content = currentContent ?? '';
      body.title = currentTitle ?? '';
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/write', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!res.ok || json.status === 'error') {
          setError(json.message ?? 'AI request failed.');
          return;
        }
        setResult(json.content);
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  const activeToolInfo = TOOLS.find((t) => t.id === activeTool);

  return (
    <div className="rounded-lg border border-(--border-default) bg-(--bg-surface)">
      <div className="flex items-center justify-between border-b border-(--border-subtle) px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-(--color-ocean-blue)" />
          <span className="text-sm font-medium text-(--fg-default)">AI Writer</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </Button>
          {expanded && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={closePanel}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-4">
          {!activeTool ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => openTool(tool.id)}
                    className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-3 py-2.5 text-sm text-(--fg-default) transition-colors hover:border-(--color-ocean-blue)/30 hover:bg-(--bg-surface-subtle)"
                  >
                    <Icon className="h-4 w-4 text-(--color-ocean-blue)" />
                    {tool.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool(null);
                    setResult(null);
                    setError(null);
                  }}
                  className="text-xs text-(--fg-muted) hover:text-(--fg-default)"
                >
                  ← Back to tools
                </button>
                <span className="text-xs font-medium text-(--color-ocean-blue)">
                  {activeToolInfo?.label}
                </span>
              </div>

              {activeTool === 'draft' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="ai-topic">Topic or prompt</Label>
                    <Textarea
                      id="ai-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="What should the article be about?"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="ai-tone">Tone</Label>
                      <select
                        id="ai-tone"
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="analytical">Analytical</option>
                        <option value="opinion">Opinion / Editorial</option>
                        <option value="breaking">Breaking news</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ai-wordcount">Target words</Label>
                      <input
                        id="ai-wordcount"
                        type="number"
                        value={wordCount}
                        onChange={(e) => setWordCount(parseInt(e.target.value) || 800)}
                        min={200}
                        max={5000}
                        step={100}
                        className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTool === 'rewrite' && (
                <div className="space-y-2">
                  <Label htmlFor="ai-rewrite">Instruction</Label>
                  <Textarea
                    id="ai-rewrite"
                    value={rewriteInstruction}
                    onChange={(e) => setRewriteInstruction(e.target.value)}
                    placeholder="e.g. Make it more concise, change to a more analytical tone, simplify for a general audience"
                    rows={2}
                  />
                  {currentContent && (
                    <p className="text-xs text-(--fg-subtle)">
                      Rewriting {currentContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words of content.
                    </p>
                  )}
                </div>
              )}

              {activeTool === 'headlines' && (
                <p className="text-sm text-(--fg-muted)">
                  Generate headline variations based on the current article content.
                </p>
              )}

              {activeTool === 'social' && (
                <div className="space-y-2">
                  <Label htmlFor="ai-platform">Platform</Label>
                  <select
                    id="ai-platform"
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
                  >
                    <option value="twitter">X (Twitter)</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              )}

              {activeTool === 'summarize' && (
                <p className="text-sm text-(--fg-muted)">
                  Generate a TL;DR and key takeaways from the current content.
                </p>
              )}

              {activeTool === 'tags' && (
                <p className="text-sm text-(--fg-muted)">
                  Suggest relevant tags based on the article content and title.
                </p>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-(--fg-muted)">Result</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => copyToClipboard(result)}
                    >
                      {copied ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <Copy className="mr-1 h-3 w-3" />
                      )}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-3 text-sm whitespace-pre-wrap text-(--fg-default)">
                    {result}
                  </div>

                  <div className="flex gap-2">
                    {activeTool === 'draft' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onInsertContent(result);
                          closePanel();
                        }}
                      >
                        Insert into article
                      </Button>
                    )}
                    {activeTool === 'headlines' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const first = (result ?? '').split('\n').find((l) => /^\d+\./.test(l));
                          if (first) {
                            onSetTitle(first.replace(/^\d+\.\s*/, '').trim());
                          }
                        }}
                      >
                        Use first headline
                      </Button>
                    )}
                    {activeTool === 'social' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSetExcerpt(result);
                        }}
                      >
                        Save as excerpt
                      </Button>
                    )}
                    {activeTool === 'tags' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSetTags(result);
                          closePanel();
                        }}
                      >
                        Apply tags
                      </Button>
                    )}
                    {activeTool === 'summarize' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onInsertContent(result);
                        }}
                      >
                        Insert into article
                      </Button>
                    )}
                    {activeTool === 'rewrite' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onInsertContent(result);
                          closePanel();
                        }}
                      >
                        Replace content
                      </Button>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="button"
                onClick={execute}
                disabled={isPending}
                className="w-full"
                size="sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-3 w-3" />
                    Generate
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
