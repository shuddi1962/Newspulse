'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function AIWriterPage() {
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [model, setModel] = useState('claude-sonnet-4.5');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: prompt, tone, wordCount: 500 }),
      });
      const data = await res.json();
      setOutput(data.content ?? 'No response from AI.');
    } catch {
      setOutput('Error: Could not connect to AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">AI Tools</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">AI Writer</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Compose</h3>
            <div className="flex gap-3">
              <select value={model} onChange={(e) => setModel(e.target.value)} className="field-input w-auto text-sm">
                <option value="claude-sonnet-4.5">Claude Sonnet 4.5</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="deepseek-v3.2">DeepSeek V3.2</option>
              </select>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="field-input w-auto text-sm">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="academic">Academic</option>
                <option value="persuasive">Persuasive</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the article topic, key points, and any specific requirements..." className="field-input mt-4" rows={8} />
            <button onClick={generate} disabled={loading || !prompt.trim()} className="mt-4 flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-5 py-2.5 text-sm font-medium text-white hover:bg-(--color-ink-dark) disabled:opacity-50">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Generate Article'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Output</h3>
            {output ? (
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: output }} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-8 w-8 text-gray-200" />
                <p className="mt-3 text-sm text-gray-400">Generated content will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
