'use client';

import { useState } from 'react';
import { Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function AIImagePage() {
  const [prompt, setPrompt] = useState('');
  const [model, setModel] = useState('gemini-3-pro-image-preview');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setResult('https://images.unsplash.com/photo-1579546929518-9e396f3cc809');
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">AI Tools</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">AI Image Generation</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Generate Image</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700">Model</label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="field-input mt-1">
                <option value="gemini-3-pro-image-preview">Gemini 3 Pro (Image)</option>
                <option value="dall-e-3">DALL-E 3</option>
                <option value="stable-diffusion-xl">Stable Diffusion XL</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Prompt</label>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the image you want to generate..." className="field-input mt-1" rows={5} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">Style</label>
                <select className="field-input mt-1"><option>Photorealistic</option><option>Illustration</option><option>Cinematic</option><option>Minimalist</option></select>
              </div>
              <div><label className="block text-sm font-medium text-gray-700">Aspect Ratio</label>
                <select className="field-input mt-1"><option>16:9</option><option>4:3</option><option>1:1</option><option>9:16</option></select>
              </div>
            </div>
            <button onClick={generate} disabled={loading || !prompt.trim()} className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-5 py-2.5 text-sm font-medium text-white hover:bg-(--color-ink-dark) disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {loading ? 'Generating...' : 'Generate Image'}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Preview</h3>
          {result ? (
            <img src={result} alt="Generated" className="w-full rounded-lg object-cover" style={{ aspectRatio: '16/9' }} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg bg-gray-50 py-20">
              <ImageIcon className="h-12 w-12 text-gray-200" />
              <p className="mt-3 text-sm text-gray-400">Generated image will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
